import Phaser from "phaser";
import { PropFrames } from "../assetFrames";
import { AssetKeys } from "../assets";
import { AudioBus } from "../audio/AudioBus";
import { isRangedWeapon, weaponStats, type WeaponName } from "../combat/WeaponStats";
import { BarkDeck, type BarkTrigger } from "../dialogue/BarkDeck";
import { GuardEnemy } from "../entities/GuardEnemy";
import { PickupDebug } from "../entities/Pickup";
import { Player } from "../entities/Player";
import { HitFeedback } from "../feedback/HitFeedback";
import { GAME_HEIGHT, GAME_WIDTH } from "../GameConfig";
import { InputMapper, type InputSnapshot } from "../input/InputMapper";
import { RoomObjective } from "../levels/RoomObjective";
import { ProgressStore } from "../progression/ProgressStore";
import { smokeAutoEnabled, smokeParam } from "../smoke";
import { activeSkillStats, type SkillName } from "../skills/SkillStats";

type RangedProjectile = {
  damage: number;
  direction: number;
  firedAt: number;
  knockback: number;
  range: number;
  sourceX: number;
  speed: number;
  startX: number;
  sprite: Phaser.GameObjects.Rectangle;
};

export class RunScene extends Phaser.Scene {
  private inputMapper!: InputMapper;
  private player!: Player;
  private guard!: GuardEnemy;
  private taxClerk!: GuardEnemy;
  private debugText!: Phaser.GameObjects.Text;
  private attackHitbox!: Phaser.GameObjects.Rectangle;
  private enemyAttackHitbox!: Phaser.GameObjects.Rectangle;
  private skillHitbox!: Phaser.GameObjects.Rectangle;
  private pickupMarker!: Phaser.GameObjects.Container;
  private secondaryPickupMarker!: Phaser.GameObjects.Container;
  private exitMarker!: Phaser.GameObjects.Image;
  private exitText!: Phaser.GameObjects.Text;
  private completionBanner!: Phaser.GameObjects.Text;
  private barkText!: Phaser.GameObjects.Text;
  private pauseKey!: Phaser.Input.Keyboard.Key;
  private pauseAltKey!: Phaser.Input.Keyboard.Key;
  private smokeMode:
    | "none"
    | "movement"
    | "combat"
    | "death"
    | "room"
    | "fullSlice"
    | "ranged"
    | "skill" = "none";
  private smokeJumpSent = false;
  private smokeAttackCount = 0;
  private startedAt = 0;
  private attackUntil = 0;
  private nextEnemyDamageAt = 0;
  private nextPlayerDamageAt = 0;
  private kills = 0;
  private deaths = 0;
  private currentWeapon: WeaponName = "Rusty Knife";
  private pickup = new PickupDebug("butcher_saber_pickup");
  private secondaryPickup = new PickupDebug("receipt_spitter_pickup");
  private rangedProjectiles: RangedProjectile[] = [];
  private rangedProjectileHits = 0;
  private rangedProjectileFired = 0;
  private currentSkill: SkillName = "Spite Belch";
  private skillUnlocked = false;
  private skillCooldownUntil = 0;
  private skillEffectUntil = 0;
  private skillUseCount = 0;
  private skillHitCount = 0;
  private roomObjective = new RoomObjective();
  private readonly audio = new AudioBus();
  private readonly barkDeck = new BarkDeck();
  private readonly progressStore = new ProgressStore();
  private hitFeedback!: HitFeedback;
  private exitUnlockAnnounced = false;
  private completionAnnounced = false;

  constructor() {
    super("RunScene");
  }

  create(): void {
    this.physics.world.setBounds(0, 0, 2200, GAME_HEIGHT);

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, AssetKeys.rottenBoroughMood)
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
      .setAlpha(0.82)
      .setScrollFactor(0.25);

    this.add.rectangle(1100, 646, 2200, 148, 0x09080a, 0.34)
      .setOrigin(0.5, 0.5)
      .setDepth(0.4);

    const platforms = this.physics.add.staticGroup();
    this.addPlatform(platforms, 1100, 650, 2200, 140);
    this.addPlatform(platforms, 1320, 430, 300, 36);
    this.addPlatform(platforms, 1720, 360, 260, 36);

    this.inputMapper = new InputMapper(this);
    this.hitFeedback = new HitFeedback(this);
    this.pauseKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.P);
    this.pauseAltKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.player = new Player(this, 360, 500);
    this.guard = new GuardEnemy(this, 980, 500);
    this.taxClerk = new GuardEnemy(this, 1660, 310, "taxClerk");
    this.physics.add.collider(this.player, platforms);
    this.physics.add.collider(this.guard, platforms);
    this.physics.add.collider(this.taxClerk, platforms);

    this.cameras.main.setBounds(0, 0, 2200, GAME_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12, -120, 80);
    this.cameras.main.setDeadzone(220, 130);

    this.add.text(38, 34, "The Adventures of Foxman, a Merciless Bastard", {
      fontFamily: "Georgia, serif",
      fontSize: "28px",
      color: "#e4d6a2",
      stroke: "#161315",
      strokeThickness: 5,
    }).setScrollFactor(0);

    this.add.text(42, 76, "Vertical slice: steal the saber, kill the guard, leave", {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "16px",
      color: "#d4b879",
    }).setScrollFactor(0);

    this.debugText = this.add.text(42, 104, "", {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "13px",
      color: "#e4d6a2",
    }).setScrollFactor(0)
      .setAlpha(0);

    this.attackHitbox = this.add.rectangle(0, 0, 118, 72, 0xb3312b, 0.18)
      .setStrokeStyle(2, 0xb3312b, 0.9)
      .setVisible(false);
    this.enemyAttackHitbox = this.add.rectangle(0, 0, 110, 76, 0xa6d34a, 0.16)
      .setStrokeStyle(2, 0xa6d34a, 0.9)
      .setVisible(false);
    this.skillHitbox = this.add.rectangle(0, 0, 320, 118, 0xff7d55, 0.18)
      .setStrokeStyle(3, 0xffd36b, 0.95)
      .setVisible(false);

    this.pickupMarker = this.createPickupMarker(720, 500);
    this.secondaryPickupMarker = this.createSecondaryPickupMarker(1370, 390);
    this.exitMarker = this.add.image(1960, 640, AssetKeys.pickupExitRuntime)
      .setOrigin(0.5, 1)
      .setScale(0.24)
      .setAlpha(0.86)
      .setDepth(5);
    this.setPropFrame(this.exitMarker, "lockedGate");
    this.exitText = this.add.text(1910, 410, "LOCKED", {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "18px",
      color: "#b3312b",
      stroke: "#161315",
      strokeThickness: 4,
    });

    this.completionBanner = this.add.text(GAME_WIDTH / 2, 134, "ROOM COMPLETE", {
      fontFamily: "Georgia, serif",
      fontSize: "34px",
      color: "#a6d34a",
      stroke: "#161315",
      strokeThickness: 6,
    }).setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setAlpha(0);

    this.barkText = this.add.text(0, 0, "", {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "15px",
      color: "#f2e7bc",
      backgroundColor: "#161315cc",
      padding: { x: 9, y: 6 },
      wordWrap: { width: 320 },
    }).setOrigin(0.5, 1)
      .setDepth(20)
      .setAlpha(0);

    const smoke = smokeAutoEnabled() ? smokeParam() : null;
    this.smokeMode =
      smoke === "movement" ||
      smoke === "combat" ||
      smoke === "death" ||
      smoke === "room" ||
      smoke === "fullSlice" ||
      smoke === "ranged" ||
      smoke === "skill"
        ? smoke
        : "none";
    if (this.smokeMode === "ranged") {
      this.unlockReceiptSpitter();
    } else if (this.smokeMode === "skill") {
      this.unlockSkill();
    }
    this.startedAt = this.time.now;

    window.__FOXMAN_DEBUG__ = {
      scene: "RunScene",
      player: this.player.debugState(),
    };
    window.__FOXMAN_PAUSE__ = () => this.pauseRun();
  }

  update(time: number): void {
    if (
      this.smokeMode === "none" &&
      (Phaser.Input.Keyboard.JustDown(this.pauseKey) ||
        Phaser.Input.Keyboard.JustDown(this.pauseAltKey))
    ) {
      this.pauseRun();
      return;
    }

    const input = this.smokeInput(time);

    this.player.update(time, input, time < this.attackUntil);
    this.guard.update(time, this.player.x);

    if (input.attackPressed && time > this.attackUntil) {
      const stats = weaponStats[this.currentWeapon];
      this.attackUntil = time + (isRangedWeapon(stats) ? 130 : 170);
      if (isRangedWeapon(stats)) {
        this.fireRangedProjectile(time);
      }
    }
    if (input.skillPressed) {
      this.useSkill(time);
    }

    this.updateCombat(time);
    this.updateSkillVisual(time);
    this.updateRoomObjectives();
    this.updateSecondaryPickupAndReward();
    this.updateBarkPosition();
    this.updateDebugOutput();
  }

  private addPlatform(
    platforms: Phaser.Physics.Arcade.StaticGroup,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    this.drawPlatformSkin(x, y, width, height);

    const platform = this.add.rectangle(x, y, width, height, 0x161315, 0)
      .setVisible(false);

    platforms.add(platform);
    const body = platform.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(width, height);
    body.updateFromGameObject();
  }

  private drawPlatformSkin(x: number, y: number, width: number, height: number): void {
    const top = y - height / 2;
    const capHeight = Math.min(22, Math.max(10, height * 0.34));
    const graphics = this.add.graphics().setDepth(1);

    graphics.fillStyle(0x4e4638, 0.9);
    graphics.fillRect(x - width / 2, top, width, capHeight);
    graphics.lineStyle(2, 0xb88a3b, 0.72);
    graphics.strokeRect(x - width / 2, top, width, capHeight);

    graphics.fillStyle(0x121014, height > 60 ? 0.56 : 0.36);
    graphics.fillRect(x - width / 2, top + capHeight, width, height - capHeight);

    graphics.lineStyle(1, 0x8b7651, 0.38);
    const crackCount = Math.max(5, Math.floor(width / 180));
    for (let index = 0; index < crackCount; index += 1) {
      const crackX = x - width / 2 + 48 + index * (width / crackCount);
      const crackY = top + 5 + (index % 3) * 4;
      graphics.lineBetween(crackX, crackY, crackX + 28, crackY + 4);
      graphics.lineBetween(crackX + 32, crackY + 3, crackX + 48, crackY - 2);
    }

    if (height > 60) {
      graphics.fillStyle(0x0a0809, 0.5);
      graphics.fillRect(x - width / 2, y + height / 2 - 12, width, 12);
      graphics.fillStyle(0x4f6a2d, 0.18);
      graphics.fillRect(x - width / 2, y + height / 2 - 52, width, 34);
    }
  }

  private smokeInput(time: number): InputSnapshot {
    const input = this.inputMapper.snapshot();

    if (this.smokeMode === "none") {
      return input;
    }

    const elapsed = time - this.startedAt;

    if (this.smokeMode === "combat") {
      const playerState = this.player.debugState();
      const deltaToGuard = this.guard.x - playerState.x;
      const inMeleeRange = Math.abs(deltaToGuard) < 320;
      const shouldAttack =
        inMeleeRange &&
        this.guard.health.alive &&
        this.smokeAttackCount < 4 &&
        time > this.attackUntil + 120;

      if (shouldAttack) {
        this.smokeAttackCount += 1;
      }

      return {
        left: this.guard.health.alive && !inMeleeRange && deltaToGuard < 0,
        right: this.guard.health.alive && !inMeleeRange && deltaToGuard > 0,
        jumpPressed: false,
        jumpHeld: false,
        attackPressed: shouldAttack,
        skillPressed: false,
      };
    }

    if (this.smokeMode === "death") {
      return {
        left: false,
        right: this.player.x < 570,
        jumpPressed: false,
        jumpHeld: false,
        attackPressed: false,
        skillPressed: false,
      };
    }

    if (this.smokeMode === "room" || this.smokeMode === "fullSlice") {
      const roomState = this.roomObjective.debugState();
      const playerState = this.player.debugState();
      const deltaToGuard = this.guard.x - playerState.x;
      const inMeleeRange = Math.abs(deltaToGuard) < 320;
      const huntingGuard = this.pickup.collected && this.guard.health.alive;
      const routingToShop = this.smokeMode === "fullSlice" && roomState.complete;
      const shouldAttack =
        huntingGuard &&
        inMeleeRange &&
        this.guard.health.alive &&
        this.smokeAttackCount < 4 &&
        time > this.attackUntil + 120;

      if (shouldAttack) {
        this.smokeAttackCount += 1;
      }

      return {
        left: huntingGuard && !inMeleeRange && deltaToGuard < 0,
        right:
          (routingToShop && playerState.x < 2080) ||
          (!roomState.complete &&
            (huntingGuard
              ? !inMeleeRange && deltaToGuard > 0
              : playerState.x < 1880 || !roomState.exitUnlocked)),
        jumpPressed: false,
        jumpHeld: false,
        attackPressed: shouldAttack,
        skillPressed: false,
      };
    }

    if (this.smokeMode === "ranged") {
      const stats = weaponStats[this.currentWeapon];
      const shouldAttack =
        this.guard.health.alive &&
        isRangedWeapon(stats) &&
        this.smokeAttackCount < 8 &&
        time > this.attackUntil + 230;

      if (shouldAttack) {
        this.smokeAttackCount += 1;
      }

      return {
        left: false,
        right: false,
        jumpPressed: false,
        jumpHeld: false,
        attackPressed: shouldAttack,
        skillPressed: false,
      };
    }

    if (this.smokeMode === "skill") {
      const skill = activeSkillStats[this.currentSkill];
      const playerState = this.player.debugState();
      const deltaToGuard = this.guard.x - playerState.x;
      const inSkillRange = Math.abs(deltaToGuard) < skill.range - 30;
      const shouldSkill =
        this.guard.health.alive &&
        this.skillUnlocked &&
        inSkillRange &&
        this.skillUseCount < 2 &&
        time >= this.skillCooldownUntil;

      return {
        left: this.guard.health.alive && !inSkillRange && deltaToGuard < 0,
        right: this.guard.health.alive && !inSkillRange && deltaToGuard > 0,
        jumpPressed: false,
        jumpHeld: false,
        attackPressed: false,
        skillPressed: shouldSkill,
      };
    }

    const grounded = this.player.debugState().grounded;
    const shouldJump = elapsed > 700 && grounded && !this.smokeJumpSent;

    if (shouldJump) {
      this.smokeJumpSent = true;
    }

    return {
      left: false,
      right: elapsed < 2100,
      jumpPressed: shouldJump,
      jumpHeld: shouldJump || (this.smokeJumpSent && elapsed < 1250),
      attackPressed: false,
      skillPressed: false,
    };
  }

  private updateCombat(time: number): void {
    this.updateRangedProjectiles(time);

    const stats = weaponStats[this.currentWeapon];
    const attacking = time < this.attackUntil && !isRangedWeapon(stats);
    const facing = this.player.flipX ? -1 : 1;

    this.attackHitbox
      .setPosition(this.player.x + facing * 58, this.player.y - 80)
      .setVisible(attacking);

    const guardInFront =
      facing > 0 ? this.guard.x >= this.player.x - 24 : this.guard.x <= this.player.x + 24;
    const guardInMeleeRange =
      guardInFront &&
      Math.abs(this.guard.x - this.player.x) < 330 &&
      Math.abs(this.guard.y - this.player.y) < 180;

    if (
      attacking &&
      this.guard.health.alive &&
      time > this.nextEnemyDamageAt &&
      (guardInMeleeRange ||
        Phaser.Geom.Intersects.RectangleToRectangle(
          this.attackHitbox.getBounds(),
          this.guard.getBounds(),
        ))
    ) {
      this.guard.damage(stats.damage, this.player.x, time, stats.knockback);
      this.hitFeedback.spawn(this.guard.x, this.guard.y - 112, `-${stats.damage}`);
      this.audio.play(this.guard.health.alive ? "enemy-hit" : "enemy-dead");
      this.hitStop(this.guard.health.alive ? Math.min(stats.hitStopMs, 65) : stats.hitStopMs);
      this.nextEnemyDamageAt = time + 210;

      if (!this.guard.health.alive) {
        this.kills += 1;
        this.progressStore.addKill();
        this.tryBark("enemy-dead", time);
      }
    }

    const guardDistance = Math.abs(this.guard.x - this.player.x);
    const guardCanAttack =
      this.guard.health.alive &&
      guardDistance < 135 &&
      (this.smokeMode !== "room" || this.pickup.collected);

    if (guardCanAttack && time > this.nextPlayerDamageAt) {
      this.guard.startAttack(time);
      if (this.player.damage(1, this.guard.x, time)) {
        this.hitFeedback.spawn(this.player.x, this.player.y - 120, "-1", "#ff7d55");
        this.audio.play("player-hit");
        this.tryBark("player-hit", time);
        this.nextPlayerDamageAt = time + 950;
        this.cameras.main.shake(110, 0.006);
      }
    }

    this.enemyAttackHitbox
      .setPosition(this.guard.x + (this.guard.flipX ? -54 : 54), this.guard.y - 76)
      .setVisible(guardCanAttack && this.guard.health.alive);

    if (!this.player.health.alive) {
      this.deaths += 1;
      this.progressStore.addDeath();
      this.resetAfterDeath(time);
    }
  }

  private resetAfterDeath(time: number): void {
    this.player.resetSurvival(360, 500);
    this.guard.resetEnemy(980, 500);
    this.currentWeapon = "Rusty Knife";
    this.pickup.reset();
    this.secondaryPickup.reset();
    this.clearRangedProjectiles();
    this.rangedProjectileHits = 0;
    this.rangedProjectileFired = 0;
    this.hitFeedback.reset();
    this.skillCooldownUntil = 0;
    this.skillEffectUntil = 0;
    this.skillUseCount = 0;
    this.skillHitCount = 0;
    this.roomObjective.reset();
    this.barkDeck.reset();
    this.exitUnlockAnnounced = false;
    this.completionAnnounced = false;
    this.completionBanner.setAlpha(0);
    this.barkText.setAlpha(0);
    this.pickupMarker.setVisible(true);
    this.secondaryPickupMarker.setVisible(true);
    this.attackUntil = 0;
    this.skillHitbox.setVisible(false);
    this.nextEnemyDamageAt = time + 500;
    this.nextPlayerDamageAt = time + 1200;
  }

  private createPickupMarker(x: number, y: number): Phaser.GameObjects.Container {
    const glow = this.add.image(0, -42, AssetKeys.pickupExitRuntime)
      .setOrigin(0.5, 1)
      .setScale(0.22)
      .setAlpha(0.82);
    this.setPropFrame(glow, "pickupRing");

    const blade = this.add.image(4, -54, AssetKeys.pickupExitRuntime)
      .setOrigin(0.5, 1)
      .setScale(0.24)
      .setRotation(0.34);
    this.setPropFrame(blade, "butcherSaber");

    const label = this.add.text(-54, -116, "BUTCHER SABER", {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "12px",
      color: "#e4d6a2",
      stroke: "#161315",
      strokeThickness: 3,
    });

    return this.add.container(x, y, [glow, blade, label]);
  }

  private createSecondaryPickupMarker(x: number, y: number): Phaser.GameObjects.Container {
    const glow = this.add.image(0, -38, AssetKeys.pickupExitRuntime)
      .setOrigin(0.5, 1)
      .setScale(0.18)
      .setAlpha(0.7)
      .setTint(0x9cc7ff);
    this.setPropFrame(glow, "pickupRing");

    const blade = this.add.image(8, -48, AssetKeys.pickupExitRuntime)
      .setOrigin(0.5, 1)
      .setScale(0.2)
      .setRotation(-0.58)
      .setTint(0x9cc7ff);
    this.setPropFrame(blade, "butcherSaber");

    const label = this.add.text(-60, -102, "RECEIPT SPITTER", {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "12px",
      color: "#9cc7ff",
      stroke: "#161315",
      strokeThickness: 3,
    });

    return this.add.container(x, y, [glow, blade, label]);
  }

  private updateRoomObjectives(): void {
    const playerState = this.player.debugState();

    if (
      !this.pickup.collected &&
      playerState.x > 610 &&
      playerState.x < 860 &&
      playerState.y > 430
    ) {
      this.pickup.collect();
      this.currentWeapon = "Butcher Saber";
      this.pickupMarker.setVisible(false);
      this.audio.play("pickup");
      this.tryBark("pickup", this.time.now);
      this.progressStore.unlock("butcher_saber");
    }

    this.roomObjective.update(this.pickup.collected && !this.guard.health.alive);
    const roomState = this.roomObjective.debugState();

    if (roomState.exitUnlocked) {
      this.setPropFrame(this.exitMarker, "unlockedGate");
      this.exitMarker.setScale(0.22).setAlpha(0.76);
      this.exitText.setText("EXIT");
      this.exitText.setColor("#a6d34a");
      if (!this.exitUnlockAnnounced) {
        this.exitUnlockAnnounced = true;
        this.audio.play("exit-unlocked");
        this.cameras.main.shake(70, 0.002);
      }
    } else {
      this.setPropFrame(this.exitMarker, "lockedGate");
      this.exitMarker.setScale(0.24).setAlpha(0.86);
      this.exitText.setText("LOCKED");
      this.exitText.setColor("#b3312b");
    }

    if (roomState.exitUnlocked && playerState.x > 1840) {
      this.roomObjective.complete();
      this.announceCompletion();
    }
  }

  private updateSecondaryPickupAndReward(): void {
    const playerState = this.player.debugState();

    if (
      !this.secondaryPickup.collected &&
      playerState.x > 1260 &&
      playerState.x < 1480 &&
      playerState.y < 470
    ) {
      this.unlockReceiptSpitter();
    }

    if (this.roomObjective.debugState().complete && playerState.x > 2050) {
      this.progressStore.unlock("reward_room_stub");
      this.scene.start("RewardScene");
      this.scene.stop("UIScene");
    }
  }

  private updateDebugOutput(): void {
    const playerState = this.player.debugState();
    const guardState = this.guard.debugState();
    const roomState = this.roomObjective.debugState();

    window.__FOXMAN_DEBUG__ = {
      scene: "RunScene",
      player: playerState,
      guard: guardState,
      room: roomState,
    };

    this.debugText.setText("");

    document.body.dataset.scene = "RunScene";
    document.body.dataset.playerState = playerState.state;
    document.body.dataset.playerX = String(playerState.x);
    document.body.dataset.playerY = String(playerState.y);
    document.body.dataset.playerGrounded = String(playerState.grounded);
    document.body.dataset.playerVelocityX = String(playerState.velocityX);
    document.body.dataset.playerVelocityY = String(playerState.velocityY);
    document.body.dataset.playerHealth = String(playerState.health);
    document.body.dataset.playerAlive = String(playerState.alive);
    document.body.dataset.enemyHealth = String(guardState.health);
    document.body.dataset.enemyAlive = String(guardState.alive);
    document.body.dataset.enemyState = guardState.state;
    document.body.dataset.enemyX = String(guardState.x);
    document.body.dataset.enemyY = String(guardState.y);
    document.body.dataset.kills = String(this.kills);
    document.body.dataset.deaths = String(this.deaths);
    document.body.dataset.currentWeapon = this.currentWeapon;
    document.body.dataset.weaponKind = weaponStats[this.currentWeapon].kind;
    document.body.dataset.pickupCollected = String(this.pickup.collected);
    document.body.dataset.secondaryPickupCollected = String(this.secondaryPickup.collected);
    document.body.dataset.rangedProjectileActive = String(this.rangedProjectiles.length);
    document.body.dataset.rangedProjectileFired = String(this.rangedProjectileFired);
    document.body.dataset.rangedProjectileHits = String(this.rangedProjectileHits);
    document.body.dataset.currentSkill = this.currentSkill;
    document.body.dataset.skillUnlocked = String(this.skillUnlocked);
    document.body.dataset.skillUses = String(this.skillUseCount);
    document.body.dataset.skillHits = String(this.skillHitCount);
    document.body.dataset.skillCooldownReady = String(this.time.now >= this.skillCooldownUntil);
    document.body.dataset.exitUnlocked = String(roomState.exitUnlocked);
    document.body.dataset.roomComplete = String(roomState.complete);
    document.body.dataset.hitFeedbackCount = String(this.hitFeedback.count);

    const progress = this.progressStore.load();
    document.body.dataset.progressKills = String(progress.kills);
    document.body.dataset.progressDeaths = String(progress.deaths);
    document.body.dataset.progressUnlocks = progress.unlocks.join(",");
  }

  private hitStop(durationMs: number): void {
    this.physics.world.pause();
    this.time.delayedCall(durationMs, () => {
      this.physics.world.resume();
    });
  }

  private unlockReceiptSpitter(): void {
    this.secondaryPickup.collect();
    this.currentWeapon = "Receipt Spitter";
    this.secondaryPickupMarker.setVisible(false);
    this.audio.play("pickup");
    this.progressStore.unlock("receipt_spitter");
  }

  private unlockSkill(): void {
    this.skillUnlocked = true;
    this.progressStore.unlock("spite_belch");
  }

  private useSkill(time: number): void {
    if (!this.skillUnlocked || time < this.skillCooldownUntil) {
      return;
    }

    const skill = activeSkillStats[this.currentSkill];
    const facing = this.player.flipX ? -1 : 1;
    this.skillUseCount += 1;
    this.skillCooldownUntil = time + skill.cooldownMs;
    this.skillEffectUntil = time + skill.durationMs;
    this.skillHitbox
      .setPosition(this.player.x + facing * (skill.range / 2), this.player.y - 88)
      .setSize(skill.range, 118)
      .setVisible(true);
    this.cameras.main.shake(70, 0.003);

    const guardInSkillRange =
      this.guard.health.alive &&
      (Phaser.Geom.Intersects.RectangleToRectangle(
        this.skillHitbox.getBounds(),
        this.guard.getBounds(),
      ) ||
        (Math.abs(this.guard.x - this.player.x) < skill.range &&
          Math.abs(this.guard.y - this.player.y) < 210));

    if (!guardInSkillRange) {
      return;
    }

    this.guard.damage(skill.damage, this.player.x, time, skill.knockback);
    this.hitFeedback.spawn(this.guard.x, this.guard.y - 112, `-${skill.damage}`, "#ffb06b");
    this.skillHitCount += 1;
    this.audio.play(this.guard.health.alive ? "enemy-hit" : "enemy-dead");
    this.hitStop(this.guard.health.alive ? 60 : 95);

    if (!this.guard.health.alive) {
      this.kills += 1;
      this.progressStore.addKill();
      this.tryBark("enemy-dead", time);
    }
  }

  private updateSkillVisual(time: number): void {
    if (time >= this.skillEffectUntil) {
      this.skillHitbox.setVisible(false);
    }
  }

  private fireRangedProjectile(time: number): void {
    const stats = weaponStats[this.currentWeapon];
    if (!isRangedWeapon(stats)) {
      return;
    }

    const direction = this.player.flipX ? -1 : 1;
    const projectile = this.add.rectangle(
      this.player.x + direction * 82,
      this.player.y - 86,
      58,
      18,
      0xf2e7bc,
      0.9,
    )
      .setStrokeStyle(2, 0x161315, 0.95)
      .setDepth(12);

    this.rangedProjectiles.push({
      damage: stats.damage,
      direction,
      firedAt: time,
      knockback: stats.knockback,
      range: stats.projectileRange ?? stats.reach,
      sourceX: this.player.x,
      speed: stats.projectileSpeed ?? 720,
      startX: projectile.x,
      sprite: projectile,
    });
    this.rangedProjectileFired += 1;
  }

  private updateRangedProjectiles(time: number): void {
    const remaining: RangedProjectile[] = [];

    for (const projectile of this.rangedProjectiles) {
      const elapsedSeconds = (time - projectile.firedAt) / 1000;
      projectile.sprite.x =
        projectile.startX + projectile.direction * projectile.speed * elapsedSeconds;

      const travelled = Math.abs(projectile.sprite.x - projectile.startX);
      const projectileNearGuard =
        Math.abs(projectile.sprite.x - this.guard.x) < 92 &&
        Math.abs(projectile.sprite.y - (this.guard.y - 82)) < 120;
      const hitGuard =
        this.guard.health.alive &&
        (projectileNearGuard ||
          Phaser.Geom.Intersects.RectangleToRectangle(
            projectile.sprite.getBounds(),
            this.guard.getBounds(),
          ));

      if (hitGuard) {
        this.guard.damage(projectile.damage, projectile.sourceX, time, projectile.knockback);
        this.hitFeedback.spawn(this.guard.x, this.guard.y - 112, `-${projectile.damage}`, "#9cc7ff");
        this.rangedProjectileHits += 1;
        this.audio.play(this.guard.health.alive ? "enemy-hit" : "enemy-dead");
        this.hitStop(this.guard.health.alive ? 45 : 85);

        if (!this.guard.health.alive) {
          this.kills += 1;
          this.progressStore.addKill();
          this.tryBark("enemy-dead", time);
        }

        projectile.sprite.destroy();
        continue;
      }

      if (travelled > projectile.range) {
        projectile.sprite.destroy();
        continue;
      }

      remaining.push(projectile);
    }

    this.rangedProjectiles = remaining;
  }

  private clearRangedProjectiles(): void {
    for (const projectile of this.rangedProjectiles) {
      projectile.sprite.destroy();
    }
    this.rangedProjectiles = [];
  }

  private announceCompletion(): void {
    if (this.completionAnnounced) {
      return;
    }

    this.completionAnnounced = true;
    this.audio.play("room-complete");
    this.progressStore.unlock("first_room_complete");
    this.tryBark("room-complete", this.time.now, true);
    this.cameras.main.shake(90, 0.002);
    this.tweens.add({
      targets: this.completionBanner,
      alpha: 1,
      duration: 160,
      ease: "Quad.easeOut",
    });
  }

  private pauseRun(): void {
    this.scene.pause();
    this.scene.launch("PauseScene");
  }

  private tryBark(trigger: BarkTrigger, time: number, force = false): void {
    const line = force ? this.forceBark(trigger) : this.barkDeck.trySpeak(trigger, time);

    if (!line) {
      return;
    }

    this.barkText.setText(line);
    this.barkText.setAlpha(1);
    this.tweens.killTweensOf(this.barkText);
    this.tweens.add({
      targets: this.barkText,
      alpha: 0,
      delay: 1350,
      duration: 320,
    });
    document.body.dataset.lastBark = line;
  }

  private forceBark(trigger: BarkTrigger): string | undefined {
    this.barkDeck.reset();
    return this.barkDeck.trySpeak(trigger, this.time.now);
  }

  private updateBarkPosition(): void {
    this.barkText.setPosition(this.player.x, this.player.y - 180);
  }

  private setPropFrame(
    image: Phaser.GameObjects.Image,
    frameKey: keyof typeof PropFrames,
  ): void {
    image.setFrame(frameKey);
  }
}
