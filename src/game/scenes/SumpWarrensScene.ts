import Phaser from "phaser";
import { PropFrames } from "../assetFrames";
import { AssetKeys } from "../assets";
import { AudioBus } from "../audio/AudioBus";
import { applyTaxPikeReachReward, weaponStats, type WeaponStats } from "../combat/WeaponStats";
import { GuardEnemy } from "../entities/GuardEnemy";
import { Player } from "../entities/Player";
import { HitFeedback } from "../feedback/HitFeedback";
import { GAME_HEIGHT, GAME_WIDTH } from "../GameConfig";
import { InputMapper, type InputSnapshot } from "../input/InputMapper";
import { addPaintedPlatform } from "../levels/PaintedPlatform";
import { ProgressStore } from "../progression/ProgressStore";
import { smokeAutoEnabled, smokeParam } from "../smoke";

type SumpEnemy = {
  enemy: GuardEnemy;
  unlockId: string;
  defeated: boolean;
};

export class SumpWarrensScene extends Phaser.Scene {
  private inputMapper!: InputMapper;
  private player!: Player;
  private enemies: SumpEnemy[] = [];
  private attackHitbox!: Phaser.GameObjects.Rectangle;
  private completionBanner!: Phaser.GameObjects.Text;
  private objectiveText!: Phaser.GameObjects.Text;
  private exitMarker!: Phaser.GameObjects.Image;
  private exitText!: Phaser.GameObjects.Text;
  private debugText!: Phaser.GameObjects.Text;
  private smokeMode: "none" | "sump" = "none";
  private startedAt = 0;
  private attackUntil = 0;
  private nextEnemyDamageAt = 0;
  private nextPlayerDamageAt = 0;
  private smokeAttackCount = 0;
  private kills = 0;
  private complete = false;
  private readonly roomWidth = 2800;
  private readonly activeStats: WeaponStats = applyTaxPikeReachReward(weaponStats["Tax Pike"]);
  private readonly audio = new AudioBus();
  private readonly progressStore = new ProgressStore();
  private hitFeedback!: HitFeedback;

  constructor() {
    super("SumpWarrensScene");
  }

  create(): void {
    this.physics.world.setBounds(0, 0, this.roomWidth, GAME_HEIGHT);

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, AssetKeys.rottenBoroughMood)
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
      .setAlpha(0.72)
      .setTint(0x87c28a)
      .setScrollFactor(0.16);
    this.add.rectangle(this.roomWidth / 2, 646, this.roomWidth, 148, 0x06100b, 0.36)
      .setOrigin(0.5, 0.5)
      .setDepth(0.4);

    const platforms = this.physics.add.staticGroup();
    this.addPlatform(platforms, this.roomWidth / 2, 650, this.roomWidth, 140);
    this.addPlatform(platforms, 650, 540, 300, 34, true);
    this.addPlatform(platforms, 1030, 476, 340, 34, true);
    this.addPlatform(platforms, 1580, 540, 340, 34, true);
    this.addPlatform(platforms, 1960, 482, 360, 34, true);
    this.addPlatform(platforms, 2320, 426, 320, 34, true);

    this.inputMapper = new InputMapper(this);
    this.hitFeedback = new HitFeedback(this);
    this.player = new Player(this, 220, 500, 6);
    this.physics.add.collider(this.player, platforms);

    this.enemies = [
      { enemy: new GuardEnemy(this, 760, 500, "drunkenGuard"), unlockId: "sump_gate_guard_drowned", defeated: false },
      { enemy: new GuardEnemy(this, 1450, 500, "taxClerk"), unlockId: "sump_ledger_clerk_evicted", defeated: false },
      { enemy: new GuardEnemy(this, 2150, 500, "eliteAuditor"), unlockId: "sump_elite_auditor_sunk", defeated: false },
    ];
    for (const entry of this.enemies) {
      this.physics.add.collider(entry.enemy, platforms);
    }

    this.cameras.main.setBounds(0, 0, this.roomWidth, GAME_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12, -120, 80);
    this.cameras.main.setDeadzone(220, 130);

    this.add.text(38, 34, "Act 2: The Sump Warrens", {
      fontFamily: "Georgia, serif",
      fontSize: "30px",
      color: "#e4d6a2",
      stroke: "#161315",
      strokeThickness: 5,
    }).setScrollFactor(0);
    this.objectiveText = this.add.text(42, 76, "Objective: cross Sump Gate", {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "16px",
      color: "#a6d34a",
      stroke: "#161315",
      strokeThickness: 3,
    }).setScrollFactor(0);
    this.add.text(42, GAME_HEIGHT - 58, "Act 2 controls: move, jump, dash, stab. Try not to become public infrastructure.", {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "13px",
      color: "#f2e7bc",
      backgroundColor: "#161315bb",
      padding: { x: 9, y: 6 },
    }).setScrollFactor(0)
      .setDepth(30);

    this.attackHitbox = this.add.rectangle(0, 0, 170, 56, 0x9cc7ff, 0.18)
      .setStrokeStyle(2, 0x9cc7ff, 0.9)
      .setVisible(false);

    this.exitMarker = this.add.image(2630, 582, AssetKeys.pickupExitRuntime)
      .setOrigin(0.5, 1)
      .setScale(0.25)
      .setAlpha(0.35);
    this.setPropFrame(this.exitMarker, "lockedGate");
    this.exitText = this.add.text(2552, 474, "DRAIN LOCKED", {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "17px",
      color: "#b3312b",
      stroke: "#161315",
      strokeThickness: 4,
    });

    this.completionBanner = this.add.text(GAME_WIDTH / 2, 140, "SUMP WARRENS CLEARED", {
      fontFamily: "Georgia, serif",
      fontSize: "33px",
      color: "#a6d34a",
      stroke: "#161315",
      strokeThickness: 6,
    }).setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setAlpha(0);
    this.debugText = this.add.text(42, 104, "", {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "13px",
      color: "#e4d6a2",
    }).setScrollFactor(0)
      .setAlpha(0);

    this.smokeMode = smokeAutoEnabled() && smokeParam() === "sump" ? "sump" : "none";
    this.startedAt = this.time.now;
    this.progressStore.unlock("act2_sump_warrens_found");
  }

  update(time: number): void {
    const input = this.smokeInput(time);
    this.player.update(time, input, time < this.attackUntil);

    for (const entry of this.enemies) {
      entry.enemy.update(time, this.player.x);
    }

    if (input.attackPressed && time > this.attackUntil) {
      this.attackUntil = time + 180;
    }

    this.updateCombat(time);
    this.updateObjective();
    this.updateDebugOutput();
  }

  private smokeInput(time: number): InputSnapshot {
    const input = this.inputMapper.snapshot();
    if (this.smokeMode !== "sump") {
      return input;
    }

    const target = this.enemies.find((entry) => entry.enemy.health.alive)?.enemy;
    const playerState = this.player.debugState();
    const elapsed = time - this.startedAt;

    if (!target) {
      return {
        left: false,
        right: playerState.x < 2650,
        jumpPressed: false,
        jumpHeld: false,
        attackPressed: false,
        skillPressed: false,
        dashPressed: playerState.dashCount < 3 && elapsed > 600 && playerState.x < 2200,
      };
    }

    const delta = target.x - playerState.x;
    const inRange = Math.abs(delta) < this.activeStats.reach - 45;
    const shouldAttack =
      inRange &&
      time > this.attackUntil + 130 &&
      this.smokeAttackCount < 12;
    if (shouldAttack) {
      this.smokeAttackCount += 1;
    }

    return {
      left: !inRange && delta < 0,
      right: !inRange && delta > 0,
      jumpPressed: false,
      jumpHeld: false,
      attackPressed: shouldAttack,
      skillPressed: false,
      dashPressed: false,
    };
  }

  private updateCombat(time: number): void {
    const facing = this.player.flipX ? -1 : 1;
    this.attackHitbox
      .setPosition(this.player.x + facing * 120, this.player.y - 86)
      .setSize(this.activeStats.reach, 56)
      .setVisible(false);

    for (const entry of this.enemies) {
      const enemy = entry.enemy;
      const enemyInFront = facing > 0 ? enemy.x >= this.player.x - 24 : enemy.x <= this.player.x + 24;
      const enemyInRange =
        enemyInFront &&
        Math.abs(enemy.x - this.player.x) < this.activeStats.reach &&
        Math.abs(enemy.y - this.player.y) < 190;

      if (
        time < this.attackUntil &&
        enemy.health.alive &&
        time > this.nextEnemyDamageAt &&
        enemyInRange
      ) {
        enemy.damage(this.activeStats.damage, this.player.x, time, this.activeStats.knockback);
        this.hitFeedback.spawn(enemy.x, enemy.y - 112, `-${this.activeStats.damage}`);
        this.audio.play(enemy.health.alive ? "enemy-hit" : "enemy-dead");
        this.hitStop(enemy.health.alive ? 55 : 90);
        this.nextEnemyDamageAt = time + 220;

        if (!enemy.health.alive && !entry.defeated) {
          entry.defeated = true;
          this.kills += 1;
          this.progressStore.addKill();
          this.progressStore.unlock(entry.unlockId);
        }
      }
    }

    this.tryDamagePlayer(time);
  }

  private tryDamagePlayer(time: number): void {
    if (this.smokeMode === "sump" || time < this.nextPlayerDamageAt || !this.player.health.alive) {
      return;
    }

    const attacker = this.enemies
      .map((entry) => entry.enemy)
      .filter((enemy) => enemy.health.alive)
      .sort((left, right) => Math.abs(left.x - this.player.x) - Math.abs(right.x - this.player.x))[0];
    if (!attacker || Math.abs(attacker.x - this.player.x) > 140) {
      return;
    }

    attacker.startAttack(time);
    if (this.player.damage(2, attacker.x, time, 720)) {
      this.hitFeedback.spawn(this.player.x, this.player.y - 120, "-2", "#ff7d55");
      this.audio.play("player-hit");
      this.cameras.main.shake(120, 0.006);
      this.nextPlayerDamageAt = time + 900;
    }
  }

  private updateObjective(): void {
    const living = this.enemies.filter((entry) => entry.enemy.health.alive).length;
    const allDefeated = living === 0;

    if (allDefeated) {
      this.setPropFrame(this.exitMarker, "unlockedGate");
      this.exitMarker.setAlpha(0.86);
      this.exitText.setText("DRAIN EXIT");
      this.exitText.setColor("#a6d34a");
      this.objectiveText.setText("Objective: reach the drain exit");
    } else if (this.player.x > 1260) {
      this.objectiveText.setText(`Objective: clear Ledger Lift (${living} problems left)`);
    } else {
      this.objectiveText.setText(`Objective: cross Sump Gate (${living} problems left)`);
    }

    if (!this.complete && allDefeated && this.player.x > 2570) {
      this.complete = true;
      this.completionBanner.setAlpha(1);
      this.audio.play("room-complete");
      this.progressStore.unlock("act2_sump_warrens_cleared");
      this.cameras.main.flash(120, 126, 170, 78, false);
    }
  }

  private updateDebugOutput(): void {
    const playerState = this.player.debugState();
    const progress = this.progressStore.load();
    const living = this.enemies.filter((entry) => entry.enemy.health.alive);
    const firstLiving = living[0]?.enemy.debugState();

    this.debugText.setText(`sump living ${living.length} | ${this.complete ? "exit open" : "exit locked"}`);
    document.body.dataset.scene = "SumpWarrensScene";
    document.body.dataset.playerState = playerState.state;
    document.body.dataset.playerX = String(playerState.x);
    document.body.dataset.playerHealth = String(playerState.health);
    document.body.dataset.playerAlive = String(playerState.alive);
    document.body.dataset.playerMaxHealth = "6";
    document.body.dataset.currentWeapon = "Tax Pike";
    document.body.dataset.currentSkill = "none";
    document.body.dataset.skillUnlocked = "false";
    document.body.dataset.skillCooldownReady = "true";
    document.body.dataset.sumpLivingEnemies = String(living.length);
    document.body.dataset.sumpComplete = String(this.complete);
    document.body.dataset.enemyHealth = String(firstLiving?.health ?? 0);
    document.body.dataset.enemyAlive = String(Boolean(firstLiving?.alive));
    document.body.dataset.hitFeedbackCount = String(this.hitFeedback.count);
    document.body.dataset.kills = String(this.kills);
    document.body.dataset.progressKills = String(progress.kills);
    document.body.dataset.progressDeaths = String(progress.deaths);
    document.body.dataset.progressUnlocks = progress.unlocks.join(",");
  }

  private addPlatform(
    platforms: Phaser.Physics.Arcade.StaticGroup,
    x: number,
    y: number,
    width: number,
    height: number,
    oneWay = false,
  ): void {
    addPaintedPlatform(this, platforms, x, y, width, height, { accent: "brass", oneWay });
  }

  private hitStop(durationMs: number): void {
    this.physics.world.pause();
    this.time.delayedCall(durationMs, () => this.physics.world.resume());
  }

  private setPropFrame(
    image: Phaser.GameObjects.Image,
    frameKey: keyof typeof PropFrames,
  ): void {
    image.setFrame(frameKey);
  }
}
