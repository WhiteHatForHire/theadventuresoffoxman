import Phaser from "phaser";
import { Player } from "../entities/Player";
import { HitFeedback } from "../feedback/HitFeedback";
import type { InputSnapshot } from "../input/InputMapper";
import {
  applyRottenWaveHeal,
  createRottenBuildRuntime,
  getRottenEliteGraft,
  recordRottenPlayerDamage,
  recordRottenWeaponHit,
  resolveRottenWeaponDamage,
  type RottenBuildRuntimeState,
  type RottenCombatBuild,
} from "./build";
import type { RottenEncounterSpawnSpec, RottenEliteVariant } from "./encounters";
import { STAGE_TWO_ENEMY_ROLES, type RottenEnemyRoleId } from "./enemyRoles";
import {
  RottenEnemy,
  type RottenEnemyAttackIntent,
  type RottenEnemyDamageSource,
} from "./RottenEnemy";
import {
  ROTTEN_SKILLS,
  ROTTEN_WEAPONS,
  type RottenSkillDefinition,
  type RottenWeaponDefinition,
} from "./loadout";

type ProjectileOwner = "player" | "enemy";
export type RottenCombatAutomationProfile = "clear" | "role-proof" | "build-proof";

interface CombatProjectile {
  readonly owner: ProjectileOwner;
  readonly sprite: Phaser.GameObjects.Rectangle;
  readonly damage: number;
  readonly knockback: number;
  readonly direction: -1 | 1;
  readonly speed: number;
  readonly startX: number;
  readonly range: number;
  readonly source: RottenEnemyDamageSource | "enemy";
  readonly hitEnemyIds: Set<number>;
  hitsRemaining: number;
}

interface DelayedBomb {
  readonly marker: Phaser.GameObjects.Arc;
  readonly x: number;
  readonly y: number;
  readonly detonateAt: number;
  readonly skill: RottenSkillDefinition;
}

interface DelayedEcho {
  readonly visual: Phaser.GameObjects.Rectangle;
  readonly x: number;
  readonly y: number;
  readonly direction: -1 | 1;
  readonly resolveAt: number;
  readonly damage: number;
}

interface DashWake {
  readonly serial: number;
  readonly visual: Phaser.GameObjects.Rectangle;
  readonly expiresAt: number;
  readonly hitEnemyIds: Set<number>;
}

interface SumpHazard {
  readonly serial: number;
  readonly marker: Phaser.GameObjects.Arc;
  readonly x: number;
  readonly y: number;
  readonly activateAt: number;
  readonly expireAt: number;
  nextPlayerHitAt: number;
  active: boolean;
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
  readonly skillCooldownMs: number;
  readonly skillReady: boolean;
  readonly playerHealth: number;
  readonly playerMaxHealth: number;
  readonly grudgeRemainingMs: number;
  readonly maxGrudgeBonusDamage: number;
  readonly compoundBonusDamage: number;
  readonly maxCompoundBonusDamage: number;
  readonly maxTotalWeaponBonusDamage: number;
  readonly compoundExpiresInMs: number;
  readonly dashCooldownMs: number;
  readonly dashWakeCount: number;
  readonly dashWakeHitCount: number;
  readonly deadLetterCount: number;
  readonly deadLetterHitCount: number;
  readonly waveHealCount: number;
  readonly waveHealRestored: number;
  readonly eliteBonusGraft: number;
  readonly eliteCount: number;
  readonly currentEliteCount: number;
  readonly eliteDefeatedCount: number;
  readonly eliteDefeatedVariants: readonly RottenEliteVariant[];
  readonly eliteArmorBreakCount: number;
  readonly eliteEnrageCount: number;
  readonly shieldBlockCount: number;
  readonly shieldFlankHitCount: number;
  readonly shieldOpenCount: number;
  readonly shieldOpenSources: readonly string[];
  readonly hazardTelegraphCount: number;
  readonly hazardActiveCount: number;
  readonly hazardActivationCount: number;
  readonly hazardHitCount: number;
  readonly hazardClearCount: number;
  readonly hazardExpiryCount: number;
  readonly hazardTeardownCount: number;
  readonly combatObjectCount: number;
}

export interface RottenCombatCallbacks {
  readonly onWaveCleared: () => void;
  readonly onPlayerDead: () => void;
  readonly onEliteDefeated: (variant: RottenEliteVariant, graft: number) => void;
  readonly onTrace: (event: string) => void;
}

export class RottenCombatController {
  private readonly weapon: RottenWeaponDefinition;
  private readonly skill: RottenSkillDefinition;
  private readonly hitFeedback: HitFeedback;
  private readonly attackVisual: Phaser.GameObjects.Rectangle;
  private readonly skillVisual: Phaser.GameObjects.Arc;
  private readonly playerCollider: Phaser.Physics.Arcade.Collider;
  private buildRuntime: RottenBuildRuntimeState = createRottenBuildRuntime();
  private enemies: RottenEnemy[] = [];
  private enemyColliders: Phaser.Physics.Arcade.Collider[] = [];
  private projectiles: CombatProjectile[] = [];
  private bombs: DelayedBomb[] = [];
  private echoes: DelayedEcho[] = [];
  private dashWakes: DashWake[] = [];
  private hazards: SumpHazard[] = [];
  private attackCooldownUntil = 0;
  private attackVisualUntil = 0;
  private skillCooldownUntil = 0;
  private heat = 0;
  private heatRecoveryUntil = 0;
  private attackCount = 0;
  private attackHitCount = 0;
  private skillUseCount = 0;
  private skillHitCount = 0;
  private maxGrudgeBonusDamage = 0;
  private maxCompoundBonusDamage = 0;
  private maxTotalWeaponBonusDamage = 0;
  private lastUpdateAt = 0;
  private waveClearSignaled = false;
  private playerDeathSignaled = false;
  private readonly runnerHits = new Set<string>();
  private readonly dashThroughHits = new Set<string>();
  private automationTellObserved = false;
  private automationEngageAt = 0;
  private lastDashCount = 0;
  private dashWakeCount = 0;
  private dashWakeHitCount = 0;
  private deadLetterCount = 0;
  private deadLetterHitCount = 0;
  private waveHealCount = 0;
  private waveHealRestored = 0;
  private eliteCount = 0;
  private eliteDefeatedCount = 0;
  private eliteArmorBreakCount = 0;
  private eliteEnrageCount = 0;
  private readonly eliteDefeatedVariants: RottenEliteVariant[] = [];
  private eliteBonusGraft = 0;
  private retiredShieldBlockCount = 0;
  private retiredShieldFlankHitCount = 0;
  private retiredShieldOpenCount = 0;
  private readonly observedShieldOpenSources = new Set<string>();
  private hazardSerial = 0;
  private hazardTelegraphCount = 0;
  private hazardActivationCount = 0;
  private hazardHitCount = 0;
  private hazardClearCount = 0;
  private hazardExpiryCount = 0;
  private hazardTeardownCount = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    readonly player: Player,
    private readonly platforms: Phaser.Physics.Arcade.StaticGroup,
    private readonly build: RottenCombatBuild,
    private readonly maxFloorBodyBottom: number,
    private readonly callbacks: RottenCombatCallbacks,
    private readonly automationProfile: RottenCombatAutomationProfile = "clear",
  ) {
    this.weapon = ROTTEN_WEAPONS[build.weaponId];
    this.skill = ROTTEN_SKILLS[build.skillId];
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
    this.lastDashCount = player.debugState().dashCount;
  }

  spawnWave(spawns: readonly RottenEncounterSpawnSpec[], waveNumber: number): void {
    this.clearWave();
    this.waveClearSignaled = false;
    const positions = spawns.length === 1
      ? { left: 835, center: 835, right: 835 }
      : spawns.length === 2
        ? { left: 760, center: 885, right: 1_010 }
        : { left: 700, center: 920, right: 1_120 };
    this.enemies = spawns.map((spawn) => {
      const enemy = new RottenEnemy(
        this.scene,
        positions[spawn.spawnSlot],
        500,
        spawn.roleId,
        this.maxFloorBodyBottom,
        { eliteVariant: spawn.eliteVariant },
      );
      if (spawn.eliteVariant) {
        this.eliteCount += 1;
      }
      this.enemyColliders.push(this.scene.physics.add.collider(enemy, this.platforms));
      return enemy;
    });
    this.callbacks.onTrace(`wave-${waveNumber}:${spawns.map(({ roleId }) => roleId).join(",")}`);
  }

  update(time: number, input: InputSnapshot): void {
    this.player.update(time, input, time < this.attackVisualUntil);
    const playerDebug = this.player.debugState();
    if (playerDebug.dashCount > this.lastDashCount) {
      this.createDashWake(time, playerDebug.dashCount);
      this.lastDashCount = playerDebug.dashCount;
    }

    if (this.heatRecoveryUntil > 0 && time >= this.heatRecoveryUntil) {
      this.heat = 0;
      this.heatRecoveryUntil = 0;
      this.callbacks.onTrace("receipt-spitter:cooled");
    }

    if (input.attackPressed) {
      this.tryWeaponAttack(time);
    }
    if (input.skillPressed) {
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
      if (playerDebug.state === "dash" && this.overlapsPlayer(enemy)) {
        const dashKey = `${playerDebug.dashCount}:${enemy.runtimeId}`;
        if (!this.dashThroughHits.has(dashKey)) {
          this.dashThroughHits.add(dashKey);
          const opened = enemy.openShield(time, "dash-through");
          if (enemy.role === "shield-auditor") {
            this.observedShieldOpenSources.add("dash-through");
          }
          if (opened) {
            this.callbacks.onTrace(`shield:open:dash-through:${enemy.runtimeId}`);
          }
        }
      }
    }

    this.updateProjectiles(time);
    this.updateBombs(time);
    this.updateEchoes(time);
    this.updateDashWakes(time);
    this.updateHazards(time);
    this.attackVisual.setVisible(time < this.attackVisualUntil);
    if (time >= this.skillCooldownUntil - this.build.skillCooldownMs + 220) {
      this.skillVisual.setVisible(false);
    }

    if (!this.player.health.alive && !this.playerDeathSignaled) {
      this.playerDeathSignaled = true;
      this.callbacks.onTrace("dead");
      this.callbacks.onPlayerDead();
    }

    if (
      this.enemies.length > 0
      && this.enemies.every((enemy) => !enemy.alive)
      && !this.waveClearSignaled
    ) {
      this.waveClearSignaled = true;
      const healed = applyRottenWaveHeal(this.build, {
        current: this.player.health.current,
        max: this.player.health.max,
      });
      if (this.build.waveHealAmount > 0) {
        this.waveHealCount += 1;
        this.waveHealRestored += this.player.health.heal(healed.restored);
        this.callbacks.onTrace(`build:wave-heal:${healed.restored}`);
      }
      this.callbacks.onWaveCleared();
    }
    this.lastUpdateAt = time;
  }

  automatedInput(time: number): InputSnapshot {
    const hazardProofInput = this.automationProfile === "role-proof"
      ? this.automatedHazardProofInput(time)
      : null;
    if (hazardProofInput) {
      return hazardProofInput;
    }
    const nearestTarget = this.enemies
      .filter((enemy) => enemy.alive)
      .sort((a, b) => Math.abs(a.x - this.player.x) - Math.abs(b.x - this.player.x))[0];
    const unprovenShield = this.automationProfile === "role-proof"
      ? this.enemies.find((enemy) => {
      if (!enemy.alive || enemy.role !== "shield-auditor") {
        return false;
      }
      const state = enemy.debugState(time);
      return this.retiredShieldBlockCount + state.shieldBlocks === 0
        || this.retiredShieldFlankHitCount + state.shieldFlankHits === 0
        || !this.observedShieldOpenSources.has("skill")
        || !this.observedShieldOpenSources.has("dash-through");
      })
      : undefined;
    const provenBombScribe = this.automationProfile === "role-proof"
      && this.skill.id === "bribe-bomb"
      && this.hazardClearCount > 0
      ? this.enemies.find((enemy) => enemy.alive && enemy.role === "sump-scribe")
      : undefined;
    const target = unprovenShield ?? provenBombScribe ?? nearestTarget;
    if (!target) {
      return this.neutralInput();
    }

    const delta = target.x - this.player.x;
    const distance = Math.abs(delta);
    const states = this.enemies.map((enemy) => enemy.debugState(time));
    const readableTell = states.some(({ state }) => state === "windup");
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
    const closingForBuildProofSkill = this.automationProfile === "build-proof"
      && time >= this.skillCooldownUntil;
    const desiredDistance = this.weapon.style === "ranged-heat" && !closingForBuildProofSkill
      ? 470
      : Math.min(235, this.weapon.reach - 35, this.skill.range - 35);
    const needsApproach = distance > desiredDistance + 28;
    const needsRetreat = this.weapon.style === "ranged-heat"
      && !closingForBuildProofSkill
      && distance < 270;
    const inWeaponRange = distance <= this.weapon.reach - 12 && facingTarget;
    const inSkillRange = distance <= this.skill.range - 10;
    const targetState = target.debugState(time);
    const provingDashWake = this.automationProfile === "build-proof"
      && this.build.dash.wakeDamage > 0
      && this.dashWakeHitCount === 0;
    if (provingDashWake) {
      const dashReady = this.player.debugState().dashReady;
      if (distance > 94 || !dashReady) {
        return {
          ...this.neutralInput(),
          left: distance > 94 && delta < 0,
          right: distance > 94 && delta > 0,
        };
      }
      return {
        ...this.neutralInput(),
        left: delta > 0,
        right: delta < 0,
        dashPressed: true,
      };
    }
    if (this.automationProfile === "role-proof" && target.role === "shield-auditor") {
      const totalShieldBlocks = this.retiredShieldBlockCount + targetState.shieldBlocks;
      const totalShieldFlankHits = this.retiredShieldFlankHitCount + targetState.shieldFlankHits;
      const moveTowardTarget = {
        left: distance > Math.min(235, this.weapon.reach - 35) && delta < 0,
        right: distance > Math.min(235, this.weapon.reach - 35) && delta > 0,
      };
      if (targetState.shieldState === "closed" && totalShieldBlocks === 0) {
        const playerIsInFront = target.flipX
          ? this.player.x < target.x
          : this.player.x > target.x;
        return {
          ...this.neutralInput(),
          left: playerIsInFront ? moveTowardTarget.left : target.flipX,
          right: playerIsInFront ? moveTowardTarget.right : !target.flipX,
          attackPressed: playerIsInFront && inWeaponRange && time >= this.attackCooldownUntil,
        };
      }
      if (targetState.shieldState === "closed" && totalShieldFlankHits === 0) {
        const playerIsBehind = target.flipX
          ? this.player.x > target.x
          : this.player.x < target.x;
        return {
          ...this.neutralInput(),
          left: playerIsBehind ? target.flipX : !target.flipX,
          right: playerIsBehind ? !target.flipX : target.flipX,
          attackPressed: playerIsBehind && inWeaponRange && time >= this.attackCooldownUntil,
        };
      }
      if (!this.observedShieldOpenSources.has("skill")) {
        return {
          ...this.neutralInput(),
          ...moveTowardTarget,
          skillPressed: inSkillRange && time >= this.skillCooldownUntil,
        };
      }
      if (!this.observedShieldOpenSources.has("dash-through")) {
        return {
          ...this.neutralInput(),
          ...moveTowardTarget,
          dashPressed: distance <= 360 && this.player.debugState().dashReady,
        };
      }
    }
    const shouldDashShield = target.role === "shield-auditor"
      && targetState.shieldState === "closed"
      && distance >= 90
      && distance <= 360
      && this.player.debugState().dashReady;
    const dangerousHazard = this.hazards.find(({ active, x }) =>
      active && Math.abs(x - this.player.x) <= 125
    );
    const provingCompound = this.automationProfile === "build-proof"
      && this.build.compoundInterest !== null
      && this.maxCompoundBonusDamage < this.build.compoundInterest.maxBonusDamage;
    const evadeLeft = dangerousHazard
      ? dangerousHazard.x > this.player.x
        || (dangerousHazard.x === this.player.x && this.player.x >= 640)
      : false;
    const evadeRight = dangerousHazard
      ? dangerousHazard.x < this.player.x
        || (dangerousHazard.x === this.player.x && this.player.x < 640)
      : false;

    return {
      left: dangerousHazard
        ? evadeLeft
        : (needsApproach && delta < 0) || (needsRetreat && delta > 0),
      right: dangerousHazard
        ? evadeRight
        : (needsApproach && delta > 0) || (needsRetreat && delta < 0),
      jumpPressed: false,
      jumpHeld: false,
      dashPressed: shouldDashShield
        || (needsApproach && distance > 520)
        || (provingCompound
          && needsApproach
          && distance > 140
          && this.player.debugState().dashReady),
      attackPressed: inWeaponRange && time >= this.attackCooldownUntil,
      skillPressed: inSkillRange
        && time >= this.skillCooldownUntil
        && !provingCompound
        && !(this.automationProfile === "role-proof"
          && this.skill.id === "bribe-bomb"
          && this.enemies.some((enemy) => enemy.alive && enemy.role === "sump-scribe")
          && this.hazardClearCount === 0),
    };
  }

  private automatedHazardProofInput(time: number): InputSnapshot | null {
    if (this.skill.id === "bribe-bomb" && this.hazards.length > 0 && this.hazardClearCount === 0) {
      if (this.bombs.length > 0) {
        return this.neutralInput();
      }
      const hazard = this.hazards[0];
      const desiredPlayerX = Phaser.Math.Clamp(hazard.x - 260, 110, 1_170);
      const delta = desiredPlayerX - this.player.x;
      if (Math.abs(delta) > 24) {
        return {
          ...this.neutralInput(),
          left: delta < 0,
          right: delta > 0,
        };
      }
      const facingRight = !this.player.flipX;
      return {
        ...this.neutralInput(),
        right: !facingRight,
        skillPressed: facingRight && time >= this.skillCooldownUntil,
      };
    }

    if (this.skill.id !== "bribe-bomb") {
      const activeHazard = this.hazards.find(({ active }) => active);
      if (activeHazard && this.hazardHitCount === 0) {
        const delta = activeHazard.x - this.player.x;
        return {
          ...this.neutralInput(),
          left: Math.abs(delta) > 24 && delta < 0,
          right: Math.abs(delta) > 24 && delta > 0,
        };
      }
      if (this.hazardHitCount > 0 && this.hazardExpiryCount === 0 && this.hazards.length > 0) {
        const hazard = this.hazards[0];
        const safeX = Phaser.Math.Clamp(hazard.x < 640 ? hazard.x + 230 : hazard.x - 230, 110, 1_170);
        const delta = safeX - this.player.x;
        return {
          ...this.neutralInput(),
          left: Math.abs(delta) > 28 && delta < 0,
          right: Math.abs(delta) > 28 && delta > 0,
        };
      }
    }

    return null;
  }

  clearWave(): void {
    for (const state of this.enemies.map((enemy) => enemy.debugState(this.scene.time.now))) {
      this.retiredShieldBlockCount += state.shieldBlocks;
      this.retiredShieldFlankHitCount += state.shieldFlankHits;
      this.retiredShieldOpenCount += state.shieldOpens;
      if (state.shieldOpenSource) {
        this.observedShieldOpenSources.add(state.shieldOpenSource);
      }
    }
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

  destroy(): RottenCombatDebugState {
    this.clearWave();
    const finalDebug = this.debugState(this.scene.time.now);
    this.playerCollider.destroy();
    this.hitFeedback.reset();
    this.attackVisual.destroy();
    this.skillVisual.destroy();
    this.player.destroy();
    return finalDebug;
  }

  debugState(time: number): RottenCombatDebugState {
    const enemyStates = this.enemies.map((enemy) => enemy.debugState(time));
    const tellState = enemyStates.find(({ state }) => state === "windup")
      ?? enemyStates.find(({ tell }) => Boolean(tell))
      ?? enemyStates.find(({ state }) => state === "active")
      ?? enemyStates.find(({ state }) => state === "recovery");
    const shieldOpenSources = new Set(this.observedShieldOpenSources);
    for (const { shieldOpenSource } of enemyStates) {
      if (shieldOpenSource) {
        shieldOpenSources.add(shieldOpenSource);
      }
    }
    const compoundActive = this.buildRuntime.compoundExpiresAtMs >= time;
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
      skillCooldownMs: this.build.skillCooldownMs,
      skillReady: time >= this.skillCooldownUntil,
      playerHealth: this.player.health.current,
      playerMaxHealth: this.player.health.max,
      grudgeRemainingMs: Math.max(0, Math.ceil(this.buildRuntime.grudgeUntilMs - time)),
      maxGrudgeBonusDamage: this.maxGrudgeBonusDamage,
      compoundBonusDamage: compoundActive ? this.buildRuntime.compoundBonusDamage : 0,
      maxCompoundBonusDamage: this.maxCompoundBonusDamage,
      maxTotalWeaponBonusDamage: this.maxTotalWeaponBonusDamage,
      compoundExpiresInMs: compoundActive
        ? Math.max(0, Math.ceil(this.buildRuntime.compoundExpiresAtMs - time))
        : 0,
      dashCooldownMs: this.build.dash.cooldownMs,
      dashWakeCount: this.dashWakeCount,
      dashWakeHitCount: this.dashWakeHitCount,
      deadLetterCount: this.deadLetterCount,
      deadLetterHitCount: this.deadLetterHitCount,
      waveHealCount: this.waveHealCount,
      waveHealRestored: this.waveHealRestored,
      eliteBonusGraft: this.eliteBonusGraft,
      eliteCount: this.eliteCount,
      currentEliteCount: enemyStates.filter(({ eliteVariant }) => eliteVariant !== null).length,
      eliteDefeatedCount: this.eliteDefeatedCount,
      eliteDefeatedVariants: [...this.eliteDefeatedVariants],
      eliteArmorBreakCount: this.eliteArmorBreakCount,
      eliteEnrageCount: this.eliteEnrageCount,
      shieldBlockCount: this.retiredShieldBlockCount
        + enemyStates.reduce((sum, enemy) => sum + enemy.shieldBlocks, 0),
      shieldFlankHitCount: this.retiredShieldFlankHitCount
        + enemyStates.reduce((sum, enemy) => sum + enemy.shieldFlankHits, 0),
      shieldOpenCount: this.retiredShieldOpenCount
        + enemyStates.reduce((sum, enemy) => sum + enemy.shieldOpens, 0),
      shieldOpenSources: [...shieldOpenSources],
      hazardTelegraphCount: this.hazardTelegraphCount,
      hazardActiveCount: this.hazards.filter(({ active }) => active).length,
      hazardActivationCount: this.hazardActivationCount,
      hazardHitCount: this.hazardHitCount,
      hazardClearCount: this.hazardClearCount,
      hazardExpiryCount: this.hazardExpiryCount,
      hazardTeardownCount: this.hazardTeardownCount,
      combatObjectCount:
        this.enemies.length
        + this.enemyColliders.length
        + this.projectiles.length
        + this.bombs.length
        + this.echoes.length
        + this.dashWakes.length
        + this.hazards.length
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
    const additionalPikeTarget = this.build.deadLetter?.kind === "pierce" ? 1 : 0;
    const hitTargets = this.weapon.cleave ? targets : targets.slice(0, 1 + additionalPikeTarget);
    for (const [targetIndex, enemy] of hitTargets.entries()) {
      const damage = this.resolveWeaponDamage(time);
      const result = this.damageEnemy(
        enemy,
        damage.totalDamage,
        time,
        this.weapon.knockback,
        175,
        "#ffd36b",
        "weapon",
        true,
      );
      if (additionalPikeTarget > 0 && targetIndex > 0) {
        this.deadLetterCount += 1;
        this.callbacks.onTrace("build:dead-letter:pike-pierce");
        if (result.applied > 0 || result.armorAbsorbed) {
          this.deadLetterHitCount += 1;
        }
      }
    }
    if (this.build.deadLetter?.kind === "echo") {
      this.scheduleDeadLetterEcho(time, direction, this.build.deadLetter.damage);
    }
  }

  private trySkill(time: number): void {
    if (time < this.skillCooldownUntil || !this.player.health.alive) {
      return;
    }
    this.skillUseCount += 1;
    this.skillCooldownUntil = time + this.build.skillCooldownMs;
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
      const result = this.damageEnemy(
        enemy,
        this.skill.damage,
        time,
        this.skill.knockback,
        this.skill.interruptMs,
        "#9cc7ff",
        "skill",
        false,
      );
      if (this.skill.geometry === "radial-interrupt") {
        enemy.stun(time, this.skill.interruptMs);
      }
      if (result.applied > 0 || result.armorAbsorbed || result.shieldOpened) {
        this.skillHitCount += 1;
      }
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
      this.clearHazardsByBomb(bomb.x, bomb.y, bomb.skill.range);
      for (const enemy of this.enemies) {
        if (enemy.alive && Phaser.Math.Distance.Between(bomb.x, bomb.y, enemy.x, enemy.y) <= bomb.skill.range) {
          const result = this.damageEnemy(
            enemy,
            bomb.skill.damage,
            time,
            bomb.skill.knockback,
            bomb.skill.interruptMs,
            "#ffb06b",
            "bribe-bomb",
            false,
          );
          if (result.applied > 0 || result.armorAbsorbed || result.shieldOpened) {
            this.skillHitCount += 1;
          }
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
      source: "weapon-projectile",
      hitEnemyIds: new Set(),
      hitsRemaining: this.build.deadLetter?.kind === "projectile-pierce" ? 2 : 1,
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
      source: "enemy",
      hitEnemyIds: new Set(),
      hitsRemaining: 1,
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
          enemy.alive
          && !projectile.hitEnemyIds.has(enemy.runtimeId)
          && Phaser.Geom.Intersects.RectangleToRectangle(projectile.sprite.getBounds(), enemy.getBounds())
        );
        if (target) {
          projectile.hitEnemyIds.add(target.runtimeId);
          const isPierceHit = projectile.hitEnemyIds.size > 1;
          const damage = this.resolveWeaponDamage(time);
          const result = this.damageEnemy(
            target,
            damage.totalDamage,
            time,
            projectile.knockback,
            150,
            "#9cc7ff",
            "weapon-projectile",
            true,
          );
          if (isPierceHit && (result.applied > 0 || result.armorAbsorbed)) {
            this.deadLetterHitCount += 1;
          }
          projectile.hitsRemaining -= 1;
          if (projectile.hitsRemaining <= 0) {
            projectile.sprite.destroy();
            continue;
          }
          this.callbacks.onTrace("build:dead-letter:projectile-pierce");
          this.deadLetterCount += 1;
        }
      } else if (
        this.player.health.alive
        && Phaser.Geom.Intersects.RectangleToRectangle(projectile.sprite.getBounds(), this.player.getBounds())
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
    if (intent.role === "sump-scribe") {
      this.createSumpHazard(time);
      return;
    }
    if ((intent.role === "bailiff" || intent.role === "shield-auditor")
      && Math.abs(intent.x - this.player.x) <= 150) {
      this.damagePlayer(intent.x, time, intent.role);
    }
  }

  private damageEnemy(
    enemy: RottenEnemy,
    damage: number,
    time: number,
    knockback: number,
    interruptMs: number,
    color: string,
    source: RottenEnemyDamageSource,
    weaponHit: boolean,
  ): ReturnType<RottenEnemy["damage"]> {
    const result = enemy.damage(
      damage,
      this.player.x,
      time,
      knockback,
      interruptMs,
      source,
    );
    if (enemy.role === "shield-auditor" && (source === "skill" || source === "bribe-bomb")) {
      this.observedShieldOpenSources.add("skill");
    }
    if (result.blocked) {
      this.hitFeedback.spawn(enemy.x, enemy.y - 120, "BLOCKED", "#fff1b8");
      this.callbacks.onTrace(`shield:block:${source}:${enemy.runtimeId}`);
      return result;
    }
    if (result.shieldOpened) {
      this.observedShieldOpenSources.add("skill");
      this.callbacks.onTrace(`shield:open:skill:${enemy.runtimeId}`);
    }
    if (result.armorAbsorbed) {
      this.eliteArmorBreakCount += 1;
      this.hitFeedback.spawn(enemy.x, enemy.y - 120, "ARMOR BREAK", "#ffd36b");
      this.callbacks.onTrace(`elite:gilded:armor-break:${enemy.runtimeId}`);
      return result;
    }
    if (result.applied <= 0) {
      return result;
    }
    if (weaponHit) {
      this.attackHitCount += 1;
      this.buildRuntime = recordRottenWeaponHit(this.build, this.buildRuntime, time);
    }
    if (source === "dead-letter") {
      this.deadLetterHitCount += 1;
    }
    if (source === "dash-wake") {
      this.dashWakeHitCount += 1;
    }
    this.hitFeedback.spawn(enemy.x, enemy.y - 120, `-${result.applied}`, color);
    this.callbacks.onTrace(`${result.killed ? "kill" : "hit"}:${enemy.role}:source-${source}`);
    if (result.enrageTriggered) {
      this.eliteEnrageCount += 1;
      this.callbacks.onTrace(`elite:overdue:enrage:${enemy.runtimeId}`);
    }
    if (result.killed && enemy.eliteVariant) {
      const graft = getRottenEliteGraft(this.build);
      this.eliteDefeatedCount += 1;
      this.eliteDefeatedVariants.push(enemy.eliteVariant);
      this.eliteBonusGraft += graft;
      this.callbacks.onTrace(`elite:defeated:${enemy.eliteVariant}:graft-${graft}`);
      this.callbacks.onEliteDefeated(enemy.eliteVariant, graft);
    }
    return result;
  }

  private damagePlayer(sourceX: number, time: number, source: RottenEnemyRoleId | "hazard"): void {
    if (this.player.damage(1, sourceX, time)) {
      this.buildRuntime = recordRottenPlayerDamage(this.build, this.buildRuntime, time);
      this.hitFeedback.spawn(this.player.x, this.player.y - 126, "-1", "#ff7d55");
      this.callbacks.onTrace(`hurt:${source}`);
      if (this.build.pettyGrudge) {
        this.callbacks.onTrace(`build:petty-grudge:until-${Math.round(this.buildRuntime.grudgeUntilMs)}`);
      }
    }
  }

  private resolveWeaponDamage(time: number): ReturnType<typeof resolveRottenWeaponDamage> {
    const damage = resolveRottenWeaponDamage(this.build, this.buildRuntime, time);
    this.maxGrudgeBonusDamage = Math.max(this.maxGrudgeBonusDamage, damage.grudgeBonus);
    this.maxCompoundBonusDamage = Math.max(this.maxCompoundBonusDamage, damage.compoundBonus);
    this.maxTotalWeaponBonusDamage = Math.max(this.maxTotalWeaponBonusDamage, damage.totalBonus);
    return damage;
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

  private createDashWake(time: number, serial: number): void {
    if (this.build.dash.wakeDamage <= 0) {
      return;
    }
    const visual = this.scene.add.rectangle(this.player.x, this.player.y - 44, 146, 58, 0x9cc7ff, 0.26)
      .setStrokeStyle(3, 0xd7eaff, 0.82)
      .setDepth(9);
    this.dashWakes.push({ serial, visual, expiresAt: time + 260, hitEnemyIds: new Set() });
    this.dashWakeCount += 1;
    this.callbacks.onTrace(`build:dash-wake:${serial}`);
  }

  private updateDashWakes(time: number): void {
    const remaining: DashWake[] = [];
    for (const wake of this.dashWakes) {
      if (time >= wake.expiresAt) {
        wake.visual.destroy();
        continue;
      }
      wake.visual.setAlpha(Math.max(0.08, (wake.expiresAt - time) / 1_000));
      for (const enemy of this.enemies) {
        if (!enemy.alive || wake.hitEnemyIds.has(enemy.runtimeId)) {
          continue;
        }
        if (Phaser.Geom.Intersects.RectangleToRectangle(wake.visual.getBounds(), enemy.getBounds())) {
          wake.hitEnemyIds.add(enemy.runtimeId);
          this.damageEnemy(
            enemy,
            this.build.dash.wakeDamage,
            time,
            140,
            120,
            "#9cc7ff",
            "dash-wake",
            false,
          );
        }
      }
      remaining.push(wake);
    }
    this.dashWakes = remaining;
  }

  private scheduleDeadLetterEcho(time: number, direction: -1 | 1, damage: number): void {
    const visual = this.scene.add.rectangle(
      this.player.x + direction * (this.weapon.reach / 2),
      this.player.y - 82,
      this.weapon.reach,
      this.weapon.style === "heavy-cleave" ? 132 : 84,
      0xc59cff,
      0.13,
    ).setStrokeStyle(2, 0xd6b7ff, 0.72).setDepth(12);
    this.echoes.push({
      visual,
      x: this.player.x,
      y: this.player.y,
      direction,
      resolveAt: time + (this.build.deadLetter?.kind === "echo" ? this.build.deadLetter.delayMs : 120),
      damage,
    });
    this.deadLetterCount += 1;
    this.callbacks.onTrace(`build:dead-letter:echo:${this.attackCount}`);
  }

  private updateEchoes(time: number): void {
    const remaining: DelayedEcho[] = [];
    for (const echo of this.echoes) {
      if (time < echo.resolveAt) {
        remaining.push(echo);
        continue;
      }
      const targets = this.enemies
        .filter((enemy) => enemy.alive
          && Math.abs(enemy.y - echo.y) <= 175
          && Math.sign(enemy.x - echo.x || echo.direction) === echo.direction
          && Math.abs(enemy.x - echo.x) <= this.weapon.reach)
        .sort((a, b) => Math.abs(a.x - echo.x) - Math.abs(b.x - echo.x));
      const hitTargets = this.weapon.cleave ? targets : targets.slice(0, 1);
      for (const enemy of hitTargets) {
        this.damageEnemy(
          enemy,
          echo.damage,
          time,
          this.weapon.knockback * 0.6,
          120,
          "#d6b7ff",
          "dead-letter",
          false,
        );
      }
      echo.visual.destroy();
    }
    this.echoes = remaining;
  }

  private createSumpHazard(time: number): void {
    const definition = STAGE_TWO_ENEMY_ROLES["sump-scribe"];
    const x = Phaser.Math.Clamp(this.player.x, 115, 1_165);
    const y = 553;
    const marker = this.scene.add.circle(x, y, 94, 0xa6d34a, 0.08)
      .setStrokeStyle(4, 0xcfff71, 0.94)
      .setDepth(7);
    const serial = ++this.hazardSerial;
    this.hazards.push({
      serial,
      marker,
      x,
      y,
      activateAt: time + definition.hazardTelegraphMs,
      expireAt: time + definition.hazardTelegraphMs + definition.hazardDurationMs,
      nextPlayerHitAt: 0,
      active: false,
    });
    this.hazardTelegraphCount += 1;
    this.callbacks.onTrace(`hazard:telegraph:${serial}`);
  }

  private updateHazards(time: number): void {
    const remaining: SumpHazard[] = [];
    const definition = STAGE_TWO_ENEMY_ROLES["sump-scribe"];
    for (const hazard of this.hazards) {
      if (!hazard.active && time >= hazard.activateAt) {
        hazard.active = true;
        hazard.marker.setFillStyle(0x7fa52f, 0.42).setStrokeStyle(4, 0xcfff71, 0.98);
        this.hazardActivationCount += 1;
        this.callbacks.onTrace(`hazard:active:${hazard.serial}`);
      }
      if (time >= hazard.expireAt) {
        hazard.marker.destroy();
        this.hazardExpiryCount += 1;
        this.callbacks.onTrace(`hazard:expired:${hazard.serial}`);
        continue;
      }
      if (hazard.active) {
        hazard.marker.setAlpha(0.32 + Math.sin(time / 90) * 0.1);
        const playerNear = Phaser.Math.Distance.Between(
          hazard.x,
          hazard.y,
          this.player.x,
          this.player.y - 42,
        ) <= 105;
        if (playerNear && time >= hazard.nextPlayerHitAt && this.player.health.alive) {
          const before = this.player.health.current;
          this.damagePlayer(hazard.x, time, "hazard");
          if (this.player.health.current < before) {
            this.hazardHitCount += 1;
            hazard.nextPlayerHitAt = time + definition.hazardHitCooldownMs;
            this.callbacks.onTrace(`hazard:hit:${hazard.serial}`);
          }
        }
      } else {
        hazard.marker.setScale(0.92 + Math.sin(time / 60) * 0.05);
      }
      remaining.push(hazard);
    }
    this.hazards = remaining;
  }

  private clearHazardsByBomb(x: number, y: number, range: number): void {
    const remaining: SumpHazard[] = [];
    for (const hazard of this.hazards) {
      if (Phaser.Math.Distance.Between(x, y, hazard.x, hazard.y) <= range) {
        hazard.marker.destroy();
        this.hazardClearCount += 1;
        this.callbacks.onTrace(`hazard:cleared:bribe-bomb:${hazard.serial}`);
      } else {
        remaining.push(hazard);
      }
    }
    this.hazards = remaining;
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
    for (const echo of this.echoes) {
      echo.visual.destroy();
    }
    this.echoes = [];
    for (const wake of this.dashWakes) {
      wake.visual.destroy();
    }
    this.dashWakes = [];
    for (const hazard of this.hazards) {
      hazard.marker.destroy();
      this.hazardTeardownCount += 1;
      this.callbacks.onTrace(`hazard:teardown:${hazard.serial}`);
    }
    this.hazards = [];
    this.runnerHits.clear();
    this.dashThroughHits.clear();
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
