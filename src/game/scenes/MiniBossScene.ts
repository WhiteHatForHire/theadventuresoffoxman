import Phaser from "phaser";
import { AssetKeys } from "../assets";
import { AudioBus } from "../audio/AudioBus";
import {
  applyTaxPikeReachReward,
  weaponStats,
  type WeaponName,
  type WeaponStats,
} from "../combat/WeaponStats";
import { BarkDeck } from "../dialogue/BarkDeck";
import { GuardEnemy } from "../entities/GuardEnemy";
import { Player } from "../entities/Player";
import { HitFeedback } from "../feedback/HitFeedback";
import { GAME_HEIGHT, GAME_WIDTH } from "../GameConfig";
import { InputMapper, type InputSnapshot } from "../input/InputMapper";
import {
  applyMutationHealthBonus,
  applyMutationWeaponBonus,
  type MutationId,
} from "../mutations/MutationStats";
import { ProgressStore } from "../progression/ProgressStore";
import type { RewardChoiceId, ShopChoiceId } from "../rewards/RewardChoice";
import { smokeAutoEnabled, smokeParam } from "../smoke";
import { activeSkillStats, type SkillName, type SkillStats } from "../skills/SkillStats";

export class MiniBossScene extends Phaser.Scene {
  private inputMapper!: InputMapper;
  private player!: Player;
  private boss!: GuardEnemy;
  private debugText!: Phaser.GameObjects.Text;
  private attackHitbox!: Phaser.GameObjects.Rectangle;
  private skillHitbox!: Phaser.GameObjects.Rectangle;
  private bossStampHitbox!: Phaser.GameObjects.Rectangle;
  private completionBanner!: Phaser.GameObjects.Text;
  private deathBanner!: Phaser.GameObjects.Text;
  private restartPrompt!: Phaser.GameObjects.Text;
  private restartKey!: Phaser.Input.Keyboard.Key;
  private restartAltKey!: Phaser.Input.Keyboard.Key;
  private smokeMode: "none" | "boss" | "bossDeath" | "fullSlice" | "rewardSkillBoss" = "none";
  private attackUntil = 0;
  private bossStampUntil = 0;
  private bossStampImpactAt = 0;
  private bossStampImpactDone = false;
  private bossStampDamageDone = false;
  private bossStampCount = 0;
  private nextBossStampAt = 0;
  private nextBossDamageAt = 0;
  private skillCooldownUntil = 0;
  private skillEffectUntil = 0;
  private skillUseCount = 0;
  private skillHitCount = 0;
  private smokeAttackCount = 0;
  private kills = 0;
  private deaths = 0;
  private deathCounted = false;
  private currentWeapon: WeaponName = "Butcher Saber";
  private activeStats: WeaponStats = weaponStats["Butcher Saber"];
  private playerMaxHealth = 5;
  private rewardChoice?: RewardChoiceId;
  private shopChoice?: ShopChoiceId;
  private mutationChoice?: MutationId;
  private skillChoice?: SkillName;
  private readonly audio = new AudioBus();
  private readonly barks = new BarkDeck();
  private readonly progressStore = new ProgressStore();
  private hitFeedback!: HitFeedback;

  constructor() {
    super("MiniBossScene");
  }

  create(data?: {
    mutation?: MutationId;
    reward?: RewardChoiceId;
    shopChoice?: ShopChoiceId;
    skill?: SkillName;
    weapon?: WeaponName;
  }): void {
    this.physics.world.setBounds(0, 0, 1800, GAME_HEIGHT);
    this.currentWeapon = data?.weapon ?? "Butcher Saber";
    this.rewardChoice = data?.reward;
    this.shopChoice = data?.shopChoice;
    this.mutationChoice = data?.mutation;
    this.skillChoice = data?.skill;
    const rewardStats =
      this.currentWeapon === "Tax Pike" && this.rewardChoice === "pikeReach"
        ? applyTaxPikeReachReward(weaponStats[this.currentWeapon])
        : weaponStats[this.currentWeapon];
    this.activeStats = applyMutationWeaponBonus(rewardStats, this.mutationChoice);
    const rewardMaxHealth = this.rewardChoice === "auditShield" ? 6 : 5;
    this.playerMaxHealth = applyMutationHealthBonus(rewardMaxHealth, this.mutationChoice);

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, AssetKeys.rottenBoroughMood)
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
      .setAlpha(0.72)
      .setTint(0xffb06b)
      .setScrollFactor(0.14);

    const platforms = this.physics.add.staticGroup();
    this.addPlatform(platforms, 900, 650, 1800, 140);
    this.addPlatform(platforms, 900, 470, 420, 34);

    this.inputMapper = new InputMapper(this);
    this.hitFeedback = new HitFeedback(this);
    this.restartKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.restartAltKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.player = new Player(this, 260, 500, this.playerMaxHealth);
    this.boss = new GuardEnemy(this, 1120, 500, "tollBaron");
    this.physics.add.collider(this.player, platforms);
    this.physics.add.collider(this.boss, platforms);

    this.cameras.main.setBounds(0, 0, 1800, GAME_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12, -120, 80);

    this.add.text(38, 34, "Toll Baron Mini-Boss", {
      fontFamily: "Georgia, serif",
      fontSize: "30px",
      color: "#e4d6a2",
      stroke: "#161315",
      strokeThickness: 5,
    }).setScrollFactor(0);

    this.add.text(42, 76, "Prototype boss: bigger, meaner, and absolutely convinced fees are foreplay.", {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "16px",
      color: "#ffb06b",
    }).setScrollFactor(0);

    this.debugText = this.add.text(42, 104, "", {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "13px",
      color: "#e4d6a2",
    }).setScrollFactor(0);

    this.attackHitbox = this.add.rectangle(0, 0, 150, 70, 0xff7d55, 0.18)
      .setStrokeStyle(2, 0xff7d55, 0.9)
      .setVisible(false);
    this.skillHitbox = this.add.rectangle(0, 0, 430, 118, 0xff7d55, 0.18)
      .setStrokeStyle(3, 0xffd36b, 0.95)
      .setVisible(false);

    this.bossStampHitbox = this.add.rectangle(0, 0, 290, 90, 0xffd36b, 0.2)
      .setStrokeStyle(3, 0xffd36b, 0.95)
      .setVisible(false);

    this.completionBanner = this.add.text(GAME_WIDTH / 2, 140, "TOLL BARON HUMILIATED", {
      fontFamily: "Georgia, serif",
      fontSize: "32px",
      color: "#a6d34a",
      stroke: "#161315",
      strokeThickness: 6,
    }).setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setAlpha(0);

    this.deathBanner = this.add.text(GAME_WIDTH / 2, 180, "FOXMAN GOT TAXED", {
      fontFamily: "Georgia, serif",
      fontSize: "34px",
      color: "#b3312b",
      stroke: "#161315",
      strokeThickness: 6,
    }).setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setAlpha(0);

    this.restartPrompt = this.add.text(GAME_WIDTH / 2, 224, "Press R or Enter to restart", {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "16px",
      color: "#e4d6a2",
      stroke: "#161315",
      strokeThickness: 4,
    }).setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setAlpha(0);

    const smoke = smokeAutoEnabled() ? smokeParam() : null;
    this.smokeMode =
      smoke === "boss" ||
      smoke === "bossDeath" ||
      smoke === "fullSlice" ||
      smoke === "rewardSkillBoss"
        ? smoke
        : "none";
    window.__FOXMAN_RESTART_BOSS__ = () => this.restartMiniBoss();
  }

  update(time: number): void {
    const input = this.smokeInput(time);

    if (!this.player.health.alive) {
      this.handleRestartInput();
      this.boss.update(time, this.player.x);
      this.skillHitbox.setVisible(false);
      this.bossStampHitbox.setVisible(false);
      this.updateDebugOutput();
      return;
    }

    this.player.update(time, input, time < this.attackUntil || time < this.skillEffectUntil);
    this.boss.update(time, this.player.x);
    this.updateBossStamp(time);

    if (input.attackPressed && time > this.attackUntil) {
      this.attackUntil = time + 180;
    }
    if (input.skillPressed) {
      this.useSkill(time);
    }

    this.updateCombat(time);
    this.updateSkillVisual(time);
    this.updateDebugOutput();
  }

  private smokeInput(time: number): InputSnapshot {
    const input = this.inputMapper.snapshot();

    if (
      this.smokeMode !== "boss" &&
      this.smokeMode !== "fullSlice" &&
      this.smokeMode !== "rewardSkillBoss"
    ) {
      if (this.smokeMode === "bossDeath") {
        return {
          left: false,
          right: this.player.x < 900,
          jumpPressed: false,
          jumpHeld: false,
          attackPressed: false,
          skillPressed: false,
        };
      }

      return input;
    }

    const playerState = this.player.debugState();
    const deltaToBoss = this.boss.x - playerState.x;
    const inRange = Math.abs(deltaToBoss) < this.activeStats.reach - 20;
    const skill = this.skillChoice ? activeSkillStats[this.skillChoice] : undefined;
    const skillPreferred = Boolean(
      this.smokeMode === "rewardSkillBoss" && skill && this.skillHitCount < 2,
    );
    const inSkillRange = Boolean(skill && Math.abs(deltaToBoss) < skill.range - 30);
    const movingRangeSatisfied = skillPreferred ? inSkillRange : inRange;
    const shouldSkill =
      skillPreferred &&
      this.boss.health.alive &&
      inSkillRange &&
      time >= this.skillCooldownUntil;
    const shouldAttack =
      this.boss.health.alive &&
      inRange &&
      !skillPreferred &&
      this.smokeAttackCount < 5 &&
      time > this.attackUntil + 140;

    if (shouldAttack) {
      this.smokeAttackCount += 1;
    }

    return {
      left: this.boss.health.alive && !movingRangeSatisfied && deltaToBoss < 0,
      right: this.boss.health.alive && !movingRangeSatisfied && deltaToBoss > 0,
      jumpPressed: false,
      jumpHeld: false,
      attackPressed: shouldAttack,
      skillPressed: shouldSkill,
    };
  }

  private updateCombat(time: number): void {
    const stats = this.activeStats;
    const facing = this.player.flipX ? -1 : 1;

    this.attackHitbox
      .setPosition(this.player.x + facing * 92, this.player.y - 82)
      .setSize(stats.reach, 70)
      .setVisible(time < this.attackUntil);

    const bossInRange =
      Math.abs(this.boss.x - this.player.x) < stats.reach &&
      Math.abs(this.boss.y - this.player.y) < 210;

    if (
      time < this.attackUntil &&
      this.boss.health.alive &&
      time > this.nextBossDamageAt &&
      bossInRange
    ) {
      this.boss.damage(stats.damage, this.player.x, time, stats.knockback + 80);
      this.hitFeedback.spawn(this.boss.x, this.boss.y - 132, `-${stats.damage}`);
      this.audio.play(this.boss.health.alive ? "enemy-hit" : "enemy-dead");
      this.hitStop(this.boss.health.alive ? 70 : 115);
      this.nextBossDamageAt = time + 260;

      if (!this.boss.health.alive) {
        this.recordBossDefeat(time);
      }
    }
  }

  private useSkill(time: number): void {
    if (!this.skillChoice || time < this.skillCooldownUntil) {
      return;
    }

    const skill = activeSkillStats[this.skillChoice];
    const facing = this.player.flipX ? -1 : 1;
    this.skillUseCount += 1;
    this.skillCooldownUntil = time + skill.cooldownMs;
    this.skillEffectUntil = time + skill.durationMs;
    this.skillHitbox
      .setPosition(this.player.x + facing * (skill.range / 2), this.player.y - 88)
      .setSize(skill.range, 118)
      .setVisible(true);
    this.cameras.main.shake(70, 0.003);

    this.trySkillDamageBoss(time, skill);
  }

  private trySkillDamageBoss(time: number, skill: SkillStats): void {
    const bossInSkillRange =
      this.boss.health.alive &&
      (Phaser.Geom.Intersects.RectangleToRectangle(
        this.skillHitbox.getBounds(),
        this.boss.getBounds(),
      ) ||
        (Math.abs(this.boss.x - this.player.x) < skill.range &&
          Math.abs(this.boss.y - this.player.y) < 210));

    if (!bossInSkillRange) {
      return;
    }

    this.boss.damage(skill.damage, this.player.x, time, skill.knockback);
    this.hitFeedback.spawn(this.boss.x, this.boss.y - 132, `-${skill.damage}`, "#ffb06b");
    this.skillHitCount += 1;
    this.audio.play(this.boss.health.alive ? "enemy-hit" : "enemy-dead");
    this.hitStop(this.boss.health.alive ? 60 : 110);

    if (!this.boss.health.alive) {
      this.recordBossDefeat(time);
    }
  }

  private updateSkillVisual(time: number): void {
    if (time >= this.skillEffectUntil) {
      this.skillHitbox.setVisible(false);
    }
  }

  private recordBossDefeat(time: number): void {
    this.kills += 1;
    this.progressStore.addKill();
    this.progressStore.unlock("toll_baron_humiliated");
    this.audio.play("room-complete");
    this.barks.trySpeak("room-complete", time);
    this.cameras.main.flash(260, 255, 176, 107, false);
    this.completionBanner.setAlpha(1);
  }

  private updateBossStamp(time: number): void {
    if (!this.boss.health.alive) {
      this.bossStampHitbox.setVisible(false);
      return;
    }

    const distance = this.player.x - this.boss.x;
    const closeEnoughToTax = Math.abs(distance) < 570;

    if (closeEnoughToTax && time >= this.nextBossStampAt && time >= this.bossStampUntil) {
      this.bossStampUntil = time + 460;
      this.bossStampImpactAt = time + 210;
      this.bossStampImpactDone = false;
      this.bossStampDamageDone = false;
      this.nextBossStampAt = time + 1550;
      this.bossStampCount += 1;
      this.boss.startAttack(time);
      this.barks.trySpeak("enemy-dead", time);
    }

    if (time >= this.bossStampUntil) {
      this.bossStampHitbox.setVisible(false);
      return;
    }

    const facing = distance < 0 ? -1 : 1;
    const impactProgress = Phaser.Math.Clamp(
      (time - this.bossStampImpactAt + 170) / 320,
      0,
      1,
    );
    const width = Phaser.Math.Linear(210, 360, impactProgress);
    const alpha = time < this.bossStampImpactAt ? 0.16 : 0.34;

    this.bossStampHitbox
      .setPosition(this.boss.x + facing * 135, this.boss.y - 48)
      .setSize(width, 88)
      .setFillStyle(0xffd36b, alpha)
      .setStrokeStyle(3, 0xffd36b, 0.95)
      .setVisible(true);

    if (!this.bossStampImpactDone && time >= this.bossStampImpactAt) {
      this.bossStampImpactDone = true;
      this.cameras.main.shake(90, 0.004);
      this.audio.play("enemy-hit");
    }

    const playerInStamp =
      Phaser.Geom.Intersects.RectangleToRectangle(
        this.bossStampHitbox.getBounds(),
        this.player.getBounds(),
      ) ||
      (this.smokeMode === "bossDeath" && Math.abs(distance) < 680);

    if (!this.bossStampDamageDone && time >= this.bossStampImpactAt && playerInStamp) {
      this.bossStampDamageDone = true;
      if (this.player.damage(2, this.boss.x, time, 880)) {
        this.hitFeedback.spawn(this.player.x, this.player.y - 120, "-2", "#ff7d55");
        this.audio.play("player-hit");
        this.cameras.main.flash(100, 179, 49, 43, false);
        this.handlePlayerDeath(time);
      }
    }
  }

  private handlePlayerDeath(time: number): void {
    if (this.player.health.alive || this.deathCounted) {
      return;
    }

    this.deathCounted = true;
    this.deaths += 1;
    this.progressStore.addDeath();
    this.audio.play("player-hit");
    this.cameras.main.shake(170, 0.01);
    this.deathBanner.setAlpha(1);
    this.restartPrompt.setAlpha(1);
    this.attackHitbox.setVisible(false);
    this.skillHitbox.setVisible(false);
    this.bossStampHitbox.setVisible(false);
    this.nextBossStampAt = time + 1200;
  }

  private handleRestartInput(): void {
    if (
      Phaser.Input.Keyboard.JustDown(this.restartKey) ||
      Phaser.Input.Keyboard.JustDown(this.restartAltKey)
    ) {
      this.restartMiniBoss();
    }
  }

  private restartMiniBoss(): void {
    this.player.resetSurvival(260, 500);
    this.boss.resetEnemy(1120, 500);
    this.deathCounted = false;
    this.attackUntil = 0;
    this.bossStampUntil = 0;
    this.bossStampImpactAt = 0;
    this.bossStampImpactDone = false;
    this.bossStampDamageDone = false;
    this.bossStampCount = 0;
    this.nextBossStampAt = this.time.now + 700;
    this.nextBossDamageAt = 0;
    this.skillCooldownUntil = 0;
    this.skillEffectUntil = 0;
    this.skillUseCount = 0;
    this.skillHitCount = 0;
    this.hitFeedback.reset();
    this.smokeAttackCount = 0;
    this.deathBanner.setAlpha(0);
    this.restartPrompt.setAlpha(0);
    this.completionBanner.setAlpha(0);
    this.attackHitbox.setVisible(false);
    this.skillHitbox.setVisible(false);
    this.bossStampHitbox.setVisible(false);
  }

  private addPlatform(
    platforms: Phaser.Physics.Arcade.StaticGroup,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    const platform = this.add.rectangle(x, y, width, height, 0x161315, 0.8)
      .setStrokeStyle(3, 0xffb06b, 0.82);

    platforms.add(platform);
    const body = platform.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(width, height);
    body.updateFromGameObject();
  }

  private hitStop(durationMs: number): void {
    this.physics.world.pause();
    this.time.delayedCall(durationMs, () => {
      this.physics.world.resume();
    });
  }

  private updateDebugOutput(): void {
    const playerState = this.player.debugState();
    const bossState = this.boss.debugState();
    const progress = this.progressStore.load();
    const complete = !this.boss.health.alive;

    this.debugText.setText(
      `boss ${bossState.health} ${bossState.state} | stamps ${this.bossStampCount} | ` +
        `${complete ? "fees cancelled" : "fees pending"}`,
    );

    document.body.dataset.scene = "MiniBossScene";
    document.body.dataset.playerState = playerState.state;
    document.body.dataset.playerX = String(playerState.x);
    document.body.dataset.currentWeapon = this.currentWeapon;
    document.body.dataset.playerHealth = String(playerState.health);
    document.body.dataset.playerAlive = String(playerState.alive);
    document.body.dataset.playerMaxHealth = String(this.playerMaxHealth);
    document.body.dataset.shopChoice = this.shopChoice ?? "direct";
    document.body.dataset.rewardChoice = this.rewardChoice ?? "direct";
    document.body.dataset.mutationChoice = this.mutationChoice ?? "none";
    document.body.dataset.skillChoice = this.skillChoice ?? "none";
    document.body.dataset.skillUnlocked = String(Boolean(this.skillChoice));
    document.body.dataset.currentSkill = this.skillChoice ?? "none";
    document.body.dataset.skillUses = String(this.skillUseCount);
    document.body.dataset.skillHits = String(this.skillHitCount);
    document.body.dataset.skillCooldownReady = String(this.time.now >= this.skillCooldownUntil);
    document.body.dataset.hitFeedbackCount = String(this.hitFeedback.count);
    document.body.dataset.bossHealth = String(bossState.health);
    document.body.dataset.bossAlive = String(bossState.alive);
    document.body.dataset.bossState = bossState.state;
    document.body.dataset.bossVariant = bossState.variant;
    document.body.dataset.bossSpecialCount = String(this.bossStampCount);
    document.body.dataset.bossComplete = String(complete);
    document.body.dataset.kills = String(this.kills);
    document.body.dataset.deaths = String(this.deaths);
    document.body.dataset.deathBanner = String(this.deathBanner.alpha > 0);
    document.body.dataset.progressKills = String(progress.kills);
    document.body.dataset.progressDeaths = String(progress.deaths);
    document.body.dataset.progressUnlocks = progress.unlocks.join(",");
    document.body.dataset.weaponReach = String(this.activeStats.reach);
    document.body.dataset.weaponDamage = String(this.activeStats.damage);
  }
}
