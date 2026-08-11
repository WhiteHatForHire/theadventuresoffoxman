import Phaser from "phaser";
import { Player } from "../entities/Player";
import { HitFeedback } from "../feedback/HitFeedback";
import type { InputSnapshot } from "../input/InputMapper";
import { RottenEnemy, type RottenEnemyAttackIntent } from "./RottenEnemy";
import type { StageOneEnemyRoleId } from "./enemyRoles";
import {
  ROTTEN_SKILLS,
  ROTTEN_WEAPONS,
  type RottenSkillDefinition,
  type RottenSkillId,
  type RottenWeaponDefinition,
  type RottenWeaponId,
} from "./loadout";

type ProjectileOwner = "player" | "enemy";

interface CombatProjectile {
  readonly owner: ProjectileOwner;
  readonly sprite: Phaser.GameObjects.Rectangle;
  readonly damage: number;
  readonly knockback: number;
  readonly direction: -1 | 1;
  readonly speed: number;
  readonly startX: number;
  readonly range: number;
}

interface DelayedBomb {
  readonly marker: Phaser.GameObjects.Arc;
  readonly x: number;
  readonly y: number;
  readonly detonateAt: number;
  readonly skill: RottenSkillDefinition;
}

export interface RottenCombatDebugState {
  readonly livingEnemies: number;
  readonly enemyStates: readonly ReturnType<RottenEnemy["debugState"]>[];
  readonly enemyTell: string;
  readonly attackCount: number;
  readonly attackHitCount: number;
  readonly weaponStyle: RottenWeaponDefinition["style"];
  readonly weaponCooldownMs: number;
  readonly weaponHeat: number;
  readonly weaponRecovering: boolean;
  readonly skillUseCount: number;
  readonly skillHitCount: number;
  readonly skillReady: boolean;
  readonly playerHealth: number;
  readonly playerMaxHealth: number;
  readonly combatObjectCount: number;
}

export interface RottenCombatCallbacks {
  readonly onWaveCleared: () => void;
  readonly onPlayerDead: () => void;
  readonly onTrace: (event: string) => void;
}

export class RottenCombatController {
  private readonly weapon: RottenWeaponDefinition;
  private readonly skill: RottenSkillDefinition;
  private readonly hitFeedback: HitFeedback;
  private readonly attackVisual: Phaser.GameObjects.Rectangle;
  private readonly skillVisual: Phaser.GameObjects.Arc;
  private readonly playerCollider: Phaser.Physics.Arcade.Collider;
  private enemies: RottenEnemy[] = [];
  private enemyColliders: Phaser.Physics.Arcade.Collider[] = [];
  private projectiles: CombatProjectile[] = [];
  private bombs: DelayedBomb[] = [];
  private attackCooldownUntil = 0;
  private attackVisualUntil = 0;
  private skillCooldownUntil = 0;
  private heat = 0;
  private heatRecoveryUntil = 0;
  private attackCount = 0;
  private attackHitCount = 0;
  private skillUseCount = 0;
  private skillHitCount = 0;
  private lastUpdateAt = 0;
  private waveClearSignaled = false;
  private playerDeathSignaled = false;
  private readonly runnerHits = new Set<string>();
  private automationTellObserved = false;
  private automationEngageAt = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    readonly player: Player,
    private readonly platforms: Phaser.Physics.Arcade.StaticGroup,
    weaponId: RottenWeaponId,
    skillId: RottenSkillId,
    private readonly maxFloorBodyBottom: number,
    private readonly callbacks: RottenCombatCallbacks,
  ) {
    this.weapon = ROTTEN_WEAPONS[weaponId];
    this.skill = ROTTEN_SKILLS[skillId];
    this.hitFeedback = new HitFeedback(scene);
    this.attackVisual = scene.add.rectangle(0, 0, 120, 74, 0xffd36b, 0.18)
      .setStrokeStyle(3, 0xffd36b, 0.88)
      .setDepth(13)
      .setVisible(false);
    this.skillVisual = scene.add.circle(0, 0, 80, 0xff7d55, 0.18)
      .setStrokeStyle(4, 0xffb06b, 0.92)
      .setDepth(12)
      .setVisible(false);
    this.playerCollider = scene.physics.add.collider(player, platforms);
  }

  spawnWave(roles: readonly StageOneEnemyRoleId[], waveNumber: number): void {
    this.clearWave();
    this.waveClearSignaled = false;
    const positions = roles.length === 1 ? [835] : roles.length === 2 ? [760, 1_010] : [700, 920, 1_120];
    this.enemies = roles.map((role, index) => {
      const enemy = new RottenEnemy(this.scene, positions[index], 500, role, this.maxFloorBodyBottom);
      this.enemyColliders.push(this.scene.physics.add.collider(enemy, this.platforms));
      return enemy;
    });
    this.callbacks.onTrace(`wave-${waveNumber}:${roles.join(",")}`);
  }

  update(time: number, input: InputSnapshot): void {
    const effectiveInput = input;
    this.player.update(time, effectiveInput, time < this.attackVisualUntil);

    if (this.heatRecoveryUntil > 0 && time >= this.heatRecoveryUntil) {
      this.heat = 0;
      this.heatRecoveryUntil = 0;
      this.callbacks.onTrace("receipt-spitter:cooled");
    }

    if (effectiveInput.attackPressed) {
      this.tryWeaponAttack(time);
    }
    if (effectiveInput.skillPressed) {
      this.trySkill(time);
    }

    const view = this.scene.cameras.main.worldView;
    for (const enemy of this.enemies) {
      const intent = enemy.updateBehavior(time, this.player.x, view.left, view.right);
      if (intent) {
        this.resolveEnemyIntent(intent, time);
      }
      if (enemy.role === "writ-runner" && enemy.isActiveAttack) {
        const hitKey = `${enemy.runtimeId}:${enemy.activeAttackSerial}`;
        if (!this.runnerHits.has(hitKey) && this.overlapsPlayer(enemy)) {
          this.runnerHits.add(hitKey);
          this.damagePlayer(enemy.x, time, "writ-runner");
        }
      }
    }

    this.updateProjectiles(time);
    this.updateBombs(time);
    this.attackVisual.setVisible(time < this.attackVisualUntil);
    if (time >= this.skillCooldownUntil - this.skill.cooldownMs + 220) {
      this.skillVisual.setVisible(false);
    }

    if (!this.player.health.alive && !this.playerDeathSignaled) {
      this.playerDeathSignaled = true;
      this.callbacks.onTrace("dead");
      this.callbacks.onPlayerDead();
    }

    if (
      this.enemies.length > 0 &&
      this.enemies.every((enemy) => !enemy.alive) &&
      !this.waveClearSignaled
    ) {
      this.waveClearSignaled = true;
      this.callbacks.onWaveCleared();
    }
    this.lastUpdateAt = time;
  }

  automatedInput(time: number): InputSnapshot {
    const target = this.enemies
      .filter((enemy) => enemy.alive)
      .sort((a, b) => Math.abs(a.x - this.player.x) - Math.abs(b.x - this.player.x))[0];
    if (!target) {
      return this.neutralInput();
    }

    const delta = target.x - this.player.x;
    const distance = Math.abs(delta);
    const readableTell = this.enemies.some((enemy) => enemy.debugState().state === "windup");
    if (!this.automationTellObserved) {
      if (readableTell) {
        this.automationTellObserved = true;
        this.automationEngageAt = time + 340;
        return this.neutralInput();
      }
      return {
        ...this.neutralInput(),
        left: distance > 112 && delta < 0,
        right: distance > 112 && delta > 0,
      };
    }
    if (time < this.automationEngageAt) {
      return this.neutralInput();
    }
    const facingTarget = delta < 0 ? this.player.flipX : !this.player.flipX;
    const desiredDistance = this.weapon.style === "ranged-heat" ? 470 : Math.min(235, this.weapon.reach - 35);
    const needsApproach = distance > desiredDistance + 28;
    const needsRetreat = this.weapon.style === "ranged-heat" && distance < 270;
    const inWeaponRange = distance <= this.weapon.reach - 12 && facingTarget;
    const inSkillRange = distance <= this.skill.range - 10;

    return {
      left: (needsApproach && delta < 0) || (needsRetreat && delta > 0),
      right: (needsApproach && delta > 0) || (needsRetreat && delta < 0),
      jumpPressed: false,
      jumpHeld: false,
      dashPressed: needsApproach && distance > 520,
      attackPressed: inWeaponRange && time >= this.attackCooldownUntil,
      skillPressed: inSkillRange && time >= this.skillCooldownUntil,
    };
  }

  clearWave(): void {
    for (const collider of this.enemyColliders) {
      collider.destroy();
    }
    this.enemyColliders = [];
    for (const enemy of this.enemies) {
      enemy.destroy();
    }
    this.enemies = [];
    this.clearTransientObjects();
  }

  displaceLivingWritRunnerBeyondView(edge: "left" | "right"): boolean {
    const runner = this.enemies.find((enemy) => enemy.alive && enemy.role === "writ-runner");
    if (!runner) {
      return false;
    }
    const view = this.scene.cameras.main.worldView;
    runner.displaceBeyondView(edge, view.left, view.right);
    this.callbacks.onTrace(`writ-runner:forced-${edge}-reacquisition`);
    return true;
  }

  prepareLivingWritRunnerHitProof(): boolean {
    const runner = this.enemies.find((enemy) => enemy.alive && enemy.role === "writ-runner");
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    if (!runner || !this.player.health.alive) {
      return false;
    }
    const runnerBody = runner.body as Phaser.Physics.Arcade.Body;
    runnerBody.updateFromGameObject();
    const runnerCenterX = runnerBody.left + runnerBody.width / 2;
    runnerBody.reset(runner.x + 500 - runnerCenterX, runner.y);
    runner.stun(this.scene.time.now, 1_200);
    playerBody.reset(820, this.player.y);
    this.player.setFlipX(true);
    this.callbacks.onTrace("writ-runner:reacquisition-hit-proof-ready");
    return true;
  }

  destroy(): void {
    this.clearWave();
    this.playerCollider.destroy();
    this.hitFeedback.reset();
    this.attackVisual.destroy();
    this.skillVisual.destroy();
    this.player.destroy();
  }

  debugState(time: number): RottenCombatDebugState {
    const enemyStates = this.enemies.map((enemy) => enemy.debugState());
    const tellState = enemyStates.find(({ state }) => state === "windup")
      ?? enemyStates.find(({ state }) => state === "active")
      ?? enemyStates.find(({ state }) => state === "recovery");
    return {
      livingEnemies: enemyStates.filter(({ alive }) => alive).length,
      enemyStates,
      enemyTell: tellState ? `${tellState.role}:${tellState.state}:${tellState.tell || "ACTIVE"}` : "",
      attackCount: this.attackCount,
      attackHitCount: this.attackHitCount,
      weaponStyle: this.weapon.style,
      weaponCooldownMs: Math.max(0, Math.ceil(this.attackCooldownUntil - time)),
      weaponHeat: this.heat,
      weaponRecovering: time < this.heatRecoveryUntil,
      skillUseCount: this.skillUseCount,
      skillHitCount: this.skillHitCount,
      skillReady: time >= this.skillCooldownUntil,
      playerHealth: this.player.health.current,
      playerMaxHealth: this.player.health.max,
      combatObjectCount:
        this.enemies.length
        + this.enemyColliders.length
        + this.projectiles.length
        + this.bombs.length
        + this.hitFeedback.activeCount
        + 4,
    };
  }

  private tryWeaponAttack(time: number): void {
    if (time < this.attackCooldownUntil || time < this.heatRecoveryUntil || !this.player.health.alive) {
      return;
    }
    this.attackCount += 1;
    this.attackCooldownUntil = time + this.weapon.cadenceMs;
    this.attackVisualUntil = time + Math.min(230, Math.max(110, this.weapon.cadenceMs * 0.42));
    this.callbacks.onTrace(`weapon:${this.weapon.id}:${this.attackCount}`);

    if (this.weapon.style === "ranged-heat") {
      this.firePlayerProjectile();
      this.heat += 1;
      if (this.heat >= (this.weapon.heatCapacity ?? 4)) {
        this.heatRecoveryUntil = time + (this.weapon.recoveryMs ?? 1_150);
        this.callbacks.onTrace("receipt-spitter:recovery");
      }
      return;
    }

    const direction: -1 | 1 = this.player.flipX ? -1 : 1;
    this.attackVisual
      .setPosition(this.player.x + direction * (this.weapon.reach / 2), this.player.y - 82)
      .setSize(this.weapon.reach, this.weapon.style === "heavy-cleave" ? 132 : 84)
      .setVisible(true);
    const targets = this.enemies
      .filter((enemy) => this.enemyInFrontRange(enemy, this.weapon.reach))
      .sort((a, b) => Math.abs(a.x - this.player.x) - Math.abs(b.x - this.player.x));
    const hitTargets = this.weapon.cleave ? targets : targets.slice(0, 1);
    for (const enemy of hitTargets) {
      this.damageEnemy(enemy, this.weapon.damage, time, this.weapon.knockback, 175, "#ffd36b", true);
    }
  }

  private trySkill(time: number): void {
    if (time < this.skillCooldownUntil || !this.player.health.alive) {
      return;
    }
    this.skillUseCount += 1;
    this.skillCooldownUntil = time + this.skill.cooldownMs;
    this.callbacks.onTrace(`skill:${this.skill.id}:${this.skillUseCount}`);
    const direction: -1 | 1 = this.player.flipX ? -1 : 1;

    if (this.skill.geometry === "delayed-area") {
      const x = Phaser.Math.Clamp(this.player.x + direction * 260, 110, 1_170);
      const marker = this.scene.add.circle(x, 548, this.skill.range, 0xff7d55, 0.14)
        .setStrokeStyle(4, 0xffb06b, 0.94)
        .setDepth(11);
      this.bombs.push({ marker, x, y: 548, detonateAt: time + this.skill.delayMs, skill: this.skill });
      return;
    }

    this.skillVisual
      .setPosition(
        this.skill.geometry === "forward-cone" ? this.player.x + direction * (this.skill.range / 2) : this.player.x,
        this.player.y - 82,
      )
      .setRadius(this.skill.geometry === "forward-cone" ? this.skill.range / 2 : this.skill.range)
      .setFillStyle(this.skill.geometry === "radial-interrupt" ? 0x9cc7ff : 0xff7d55, 0.2)
      .setStrokeStyle(4, this.skill.geometry === "radial-interrupt" ? 0xd7eaff : 0xffb06b, 0.94)
      .setVisible(true);

    for (const enemy of this.enemies) {
      const inRange = this.skill.geometry === "forward-cone"
        ? this.enemyInFrontRange(enemy, this.skill.range)
        : enemy.alive && Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y) <= this.skill.range;
      if (!inRange) {
        continue;
      }
      this.damageEnemy(
        enemy,
        this.skill.damage,
        time,
        this.skill.knockback,
        this.skill.interruptMs,
        "#9cc7ff",
        false,
      );
      if (this.skill.geometry === "radial-interrupt") {
        enemy.stun(time, this.skill.interruptMs);
      }
      this.skillHitCount += 1;
    }
  }

  private updateBombs(time: number): void {
    const remaining: DelayedBomb[] = [];
    for (const bomb of this.bombs) {
      const pulse = 0.86 + Math.sin(time / 70) * 0.08;
      bomb.marker.setScale(pulse);
      if (time < bomb.detonateAt) {
        remaining.push(bomb);
        continue;
      }
      bomb.marker.setFillStyle(0xffd36b, 0.5).setScale(1.12);
      for (const enemy of this.enemies) {
        if (enemy.alive && Phaser.Math.Distance.Between(bomb.x, bomb.y, enemy.x, enemy.y) <= bomb.skill.range) {
          this.damageEnemy(
            enemy,
            bomb.skill.damage,
            time,
            bomb.skill.knockback,
            bomb.skill.interruptMs,
            "#ffb06b",
            false,
          );
          this.skillHitCount += 1;
        }
      }
      bomb.marker.destroy();
    }
    this.bombs = remaining;
  }

  private firePlayerProjectile(): void {
    const direction: -1 | 1 = this.player.flipX ? -1 : 1;
    const sprite = this.scene.add.rectangle(
      this.player.x + direction * 76,
      this.player.y - 84,
      56,
      16,
      0xf2e7bc,
      0.96,
    ).setStrokeStyle(2, 0x161315, 0.95).setDepth(14);
    this.projectiles.push({
      owner: "player",
      sprite,
      damage: this.weapon.damage,
      knockback: this.weapon.knockback,
      direction,
      speed: this.weapon.projectileSpeed ?? 860,
      startX: sprite.x,
      range: this.weapon.reach,
    });
  }

  private fireEnemyProjectile(intent: RottenEnemyAttackIntent): void {
    const sprite = this.scene.add.rectangle(intent.x, intent.y - 92, 48, 14, 0xd59776, 0.98)
      .setStrokeStyle(2, 0xfff1b8, 0.95)
      .setDepth(14);
    this.projectiles.push({
      owner: "enemy",
      sprite,
      damage: 1,
      knockback: 0,
      direction: intent.direction,
      speed: 410,
      startX: sprite.x,
      range: 820,
    });
  }

  private updateProjectiles(time: number): void {
    const deltaSeconds = Math.min(50, Math.max(0, time - this.lastUpdateAt)) / 1_000;
    const remaining: CombatProjectile[] = [];
    for (const projectile of this.projectiles) {
      projectile.sprite.x += projectile.direction * projectile.speed * deltaSeconds;
      const travelled = Math.abs(projectile.sprite.x - projectile.startX);
      if (projectile.owner === "player") {
        const target = this.enemies.find((enemy) =>
          enemy.alive && Phaser.Geom.Intersects.RectangleToRectangle(projectile.sprite.getBounds(), enemy.getBounds())
        );
        if (target) {
          this.damageEnemy(target, projectile.damage, time, projectile.knockback, 150, "#9cc7ff", true);
          projectile.sprite.destroy();
          continue;
        }
      } else if (
        this.player.health.alive &&
        Phaser.Geom.Intersects.RectangleToRectangle(projectile.sprite.getBounds(), this.player.getBounds())
      ) {
        this.damagePlayer(projectile.sprite.x, time, "clerk");
        projectile.sprite.destroy();
        continue;
      }
      if (travelled >= projectile.range) {
        projectile.sprite.destroy();
        continue;
      }
      remaining.push(projectile);
    }
    this.projectiles = remaining;
  }

  private resolveEnemyIntent(intent: RottenEnemyAttackIntent, time: number): void {
    if (intent.role === "clerk") {
      this.fireEnemyProjectile(intent);
      return;
    }
    if (intent.role === "bailiff" && Math.abs(intent.x - this.player.x) <= 150) {
      this.damagePlayer(intent.x, time, "bailiff");
    }
  }

  private damageEnemy(
    enemy: RottenEnemy,
    damage: number,
    time: number,
    knockback: number,
    interruptMs: number,
    color: string,
    weaponHit: boolean,
  ): void {
    if (!enemy.alive) {
      return;
    }
    const killed = enemy.damage(damage, this.player.x, time, knockback, interruptMs);
    if (weaponHit) {
      this.attackHitCount += 1;
    }
    this.hitFeedback.spawn(enemy.x, enemy.y - 120, `-${damage}`, color);
    this.callbacks.onTrace(`${killed ? "kill" : "hit"}:${enemy.role}`);
  }

  private damagePlayer(sourceX: number, time: number, source: StageOneEnemyRoleId): void {
    if (this.player.damage(1, sourceX, time)) {
      this.hitFeedback.spawn(this.player.x, this.player.y - 126, "-1", "#ff7d55");
      this.callbacks.onTrace(`hurt:${source}`);
    }
  }

  private enemyInFrontRange(enemy: RottenEnemy, range: number): boolean {
    if (!enemy.alive || Math.abs(enemy.y - this.player.y) > 175) {
      return false;
    }
    const direction = this.player.flipX ? -1 : 1;
    const delta = enemy.x - this.player.x;
    return Math.sign(delta || direction) === direction && Math.abs(delta) <= range;
  }

  private overlapsPlayer(enemy: RottenEnemy): boolean {
    return Phaser.Geom.Intersects.RectangleToRectangle(enemy.getBounds(), this.player.getBounds());
  }

  private clearTransientObjects(): void {
    for (const projectile of this.projectiles) {
      projectile.sprite.destroy();
    }
    this.projectiles = [];
    for (const bomb of this.bombs) {
      bomb.marker.destroy();
    }
    this.bombs = [];
    this.runnerHits.clear();
  }

  private neutralInput(): InputSnapshot {
    return {
      left: false,
      right: false,
      jumpPressed: false,
      jumpHeld: false,
      attackPressed: false,
      skillPressed: false,
      dashPressed: false,
    };
  }
}
