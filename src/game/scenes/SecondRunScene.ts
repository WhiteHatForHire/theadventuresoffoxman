import Phaser from "phaser";
import { PropFrames } from "../assetFrames";
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
  mutationFromQuery,
  type MutationId,
} from "../mutations/MutationStats";
import { ProgressStore } from "../progression/ProgressStore";
import { rewardFromQuery, type RewardChoiceId, type ShopChoiceId } from "../rewards/RewardChoice";
import { smokeAutoEnabled, smokeParam } from "../smoke";
import { activeSkillStats, type SkillName, type SkillStats } from "../skills/SkillStats";

export class SecondRunScene extends Phaser.Scene {
  private inputMapper!: InputMapper;
  private player!: Player;
  private taxClerk!: GuardEnemy;
  private eliteAuditor!: GuardEnemy;
  private debugText!: Phaser.GameObjects.Text;
  private attackHitbox!: Phaser.GameObjects.Rectangle;
  private skillHitbox!: Phaser.GameObjects.Rectangle;
  private completionBanner!: Phaser.GameObjects.Text;
  private deathBanner!: Phaser.GameObjects.Text;
  private restartPrompt!: Phaser.GameObjects.Text;
  private bossDoor!: Phaser.GameObjects.Image;
  private bossDoorArrow!: Phaser.GameObjects.Image;
  private bossDoorPrompt!: Phaser.GameObjects.Text;
  private smokeMode:
    | "none"
    | "second"
    | "secondBoss"
    | "secondDeath"
    | "fullSlice"
    | "rewardSkill"
    | "rewardSkillBoss" = "none";
  private restartKey!: Phaser.Input.Keyboard.Key;
  private restartAltKey!: Phaser.Input.Keyboard.Key;
  private startedAt = 0;
  private attackUntil = 0;
  private nextTaxClerkDamageAt = 0;
  private nextEliteDamageAt = 0;
  private nextPlayerDamageAt = 0;
  private skillCooldownUntil = 0;
  private skillEffectUntil = 0;
  private skillUseCount = 0;
  private skillHitCount = 0;
  private smokeAttackCount = 0;
  private kills = 0;
  private deaths = 0;
  private deathCounted = false;
  private currentWeapon: WeaponName = "Tax Pike";
  private rewardChoice: RewardChoiceId = "pikeReach";
  private shopChoice?: ShopChoiceId;
  private mutationChoice?: MutationId;
  private skillChoice?: SkillName;
  private activeStats: WeaponStats = weaponStats["Tax Pike"];
  private playerMaxHealth = 5;
  private readonly audio = new AudioBus();
  private readonly barks = new BarkDeck();
  private readonly progressStore = new ProgressStore();
  private hitFeedback!: HitFeedback;

  constructor() {
    super("SecondRunScene");
  }

  create(data?: {
    mutation?: MutationId;
    reward?: RewardChoiceId;
    shopChoice?: ShopChoiceId;
    skill?: SkillName;
  }): void {
    this.physics.world.setBounds(0, 0, 1900, GAME_HEIGHT);
    this.rewardChoice = data?.reward ?? rewardFromQuery(window.location.search);
    this.shopChoice = data?.shopChoice;
    this.mutationChoice = data?.mutation ?? mutationFromQuery(window.location.search);
    this.skillChoice = data?.skill;
    const rewardStats = this.rewardChoice === "pikeReach"
      ? applyTaxPikeReachReward(weaponStats[this.currentWeapon])
      : weaponStats[this.currentWeapon];
    this.activeStats = applyMutationWeaponBonus(rewardStats, this.mutationChoice);
    const rewardMaxHealth = this.rewardChoice === "auditShield" ? 6 : 5;
    this.playerMaxHealth = applyMutationHealthBonus(rewardMaxHealth, this.mutationChoice);

    if (this.mutationChoice) {
      this.progressStore.unlock(`mutation_${this.mutationChoice}`);
    }
    if (this.skillChoice) {
      this.progressStore.unlock("spite_belch");
    }

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, AssetKeys.rottenBoroughMood)
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
      .setAlpha(0.68)
      .setTint(0x9cc7ff)
      .setScrollFactor(0.18);

    const platforms = this.physics.add.staticGroup();
    this.addPlatform(platforms, 950, 650, 1900, 140);
    this.addPlatform(platforms, 1280, 468, 360, 36);

    this.inputMapper = new InputMapper(this);
    this.hitFeedback = new HitFeedback(this);
    this.restartKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    this.restartAltKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.player = new Player(this, 260, 500, this.playerMaxHealth);
    this.taxClerk = new GuardEnemy(this, 1160, 500, "taxClerk");
    this.eliteAuditor = new GuardEnemy(this, 1510, 500, "eliteAuditor");
    this.physics.add.collider(this.player, platforms);
    this.physics.add.collider(this.taxClerk, platforms);
    this.physics.add.collider(this.eliteAuditor, platforms);

    this.cameras.main.setBounds(0, 0, 1900, GAME_HEIGHT);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12, -120, 80);

    this.add.text(38, 34, "Audit Office Back Room", {
      fontFamily: "Georgia, serif",
      fontSize: "30px",
      color: "#e4d6a2",
      stroke: "#161315",
      strokeThickness: 5,
    }).setScrollFactor(0);

    this.add.text(42, 76, "Tax Pike route: skewer the clerk, then the elite auditor", {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "16px",
      color: "#9cc7ff",
    }).setScrollFactor(0);

    this.debugText = this.add.text(42, 104, "", {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "13px",
      color: "#e4d6a2",
    }).setScrollFactor(0);

    this.attackHitbox = this.add.rectangle(0, 0, 170, 56, 0x9cc7ff, 0.18)
      .setStrokeStyle(2, 0x9cc7ff, 0.9)
      .setVisible(false);
    this.skillHitbox = this.add.rectangle(0, 0, 430, 118, 0xff7d55, 0.18)
      .setStrokeStyle(3, 0xffd36b, 0.95)
      .setVisible(false);

    this.bossDoor = this.add.image(1780, 640, AssetKeys.pickupExitRuntime)
      .setOrigin(0.5, 1)
      .setScale(0.32)
      .setAlpha(0);
    this.setPropFrame(this.bossDoor, "lockedGate");

    this.bossDoorArrow = this.add.image(1780, 394, AssetKeys.pickupExitRuntime)
      .setOrigin(0.5, 0.5)
      .setScale(0.24)
      .setTint(0xffd36b)
      .setAlpha(0);
    this.setPropFrame(this.bossDoorArrow, "exitArrow");

    this.bossDoorPrompt = this.add.text(1618, 432, "BOSS TOLL", {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "17px",
      color: "#ffd36b",
      stroke: "#161315",
      strokeThickness: 4,
    }).setAlpha(0);

    this.completionBanner = this.add.text(GAME_WIDTH / 2, 140, "SECOND PATH CLEARED", {
      fontFamily: "Georgia, serif",
      fontSize: "32px",
      color: "#a6d34a",
      stroke: "#161315",
      strokeThickness: 6,
    }).setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setAlpha(0);

    this.deathBanner = this.add.text(GAME_WIDTH / 2, 180, "FOXMAN GOT AUDITED", {
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
      smoke === "second" ||
      smoke === "secondBoss" ||
      smoke === "secondDeath" ||
      smoke === "fullSlice" ||
      smoke === "rewardSkill" ||
      smoke === "rewardSkillBoss"
        ? smoke
        : "none";
    this.startedAt = this.time.now;
    window.__FOXMAN_RESTART_SECOND__ = () => this.restartSecondPath();
  }

  update(time: number): void {
    const input = this.smokeInput(time);

    if (!this.player.health.alive) {
      this.handleRestartInput();
      this.taxClerk.update(time, this.player.x);
      this.eliteAuditor.update(time, this.player.x);
      this.attackHitbox.setVisible(false);
      this.skillHitbox.setVisible(false);
      this.updateDebugOutput();
      return;
    }

    this.player.update(time, input, time < this.attackUntil || time < this.skillEffectUntil);
    this.taxClerk.update(time, this.player.x);
    this.eliteAuditor.update(time, this.player.x);

    if (input.attackPressed && time > this.attackUntil) {
      this.attackUntil = time + 180;
    }
    if (input.skillPressed) {
      this.useSkill(time);
    }

    this.updateCombat(time);
    this.updateSkillVisual(time);
    this.updateBossDoor();
    this.routeToBossIfReady();
    this.updateDebugOutput();
  }

  private smokeInput(time: number): InputSnapshot {
    const input = this.inputMapper.snapshot();
    const playerState = this.player.debugState();
    const autoCombat =
      this.smokeMode === "second" ||
      this.smokeMode === "secondBoss" ||
      this.smokeMode === "fullSlice" ||
      this.smokeMode === "rewardSkill" ||
      this.smokeMode === "rewardSkillBoss";

    if (!autoCombat) {
      if (this.smokeMode === "secondDeath") {
        return {
          left: false,
          right: this.player.x < 980,
          jumpPressed: false,
          jumpHeld: false,
          attackPressed: false,
          skillPressed: false,
        };
      }

      return input;
    }

    if (
      (
        this.smokeMode === "secondBoss" ||
        this.smokeMode === "fullSlice" ||
        this.smokeMode === "rewardSkillBoss"
      ) &&
      this.secondPathComplete()
    ) {
      return {
        left: false,
        right: playerState.x < 1748,
        jumpPressed: false,
        jumpHeld: false,
        attackPressed: false,
        skillPressed: false,
      };
    }

    if (this.secondPathComplete()) {
      return input;
    }

    const target = this.taxClerk.health.alive ? this.taxClerk : this.eliteAuditor;
    const deltaToTarget = target.x - playerState.x;
    const inPikeRange = Math.abs(deltaToTarget) < this.activeStats.reach - 40;
    const skill = this.skillChoice ? activeSkillStats[this.skillChoice] : undefined;
    const skillPreferred = Boolean(skill && this.skillHitCount < 2);
    const inSkillRange = Boolean(skill && Math.abs(deltaToTarget) < skill.range - 30);
    const movingRangeSatisfied = skillPreferred ? inSkillRange : inPikeRange;
    const shouldSkill =
      skillPreferred &&
      target.health.alive &&
      inSkillRange &&
      time >= this.skillCooldownUntil;
    const shouldAttack =
      target.health.alive &&
      inPikeRange &&
      !skillPreferred &&
      this.smokeAttackCount < 8 &&
      time > this.attackUntil + 140;

    if (shouldAttack) {
      this.smokeAttackCount += 1;
    }

    return {
      left: target.health.alive && !movingRangeSatisfied && deltaToTarget < 0,
      right: target.health.alive && !movingRangeSatisfied && deltaToTarget > 0,
      jumpPressed: false,
      jumpHeld: false,
      attackPressed: shouldAttack,
      skillPressed: shouldSkill,
    };
  }

  private updateCombat(time: number): void {
    const attacking = time < this.attackUntil;
    const stats = this.activeStats;
    const facing = this.player.flipX ? -1 : 1;

    this.attackHitbox
      .setPosition(this.player.x + facing * 120, this.player.y - 86)
      .setSize(stats.reach, 56)
      .setVisible(attacking);

    this.tryDamageEnemy(this.taxClerk, time, stats, facing, "tax_clerk_evicted");
    this.tryDamageEnemy(this.eliteAuditor, time, stats, facing, "elite_auditor_embarrassed");
    this.tryDamagePlayer(time);
  }

  private tryDamagePlayer(time: number): void {
    if (
      this.smokeMode === "second" ||
      this.smokeMode === "secondBoss" ||
      this.smokeMode === "fullSlice" ||
      this.smokeMode === "rewardSkill" ||
      this.smokeMode === "rewardSkillBoss"
    ) {
      return;
    }

    if (time <= this.nextPlayerDamageAt || !this.player.health.alive) {
      return;
    }

    const attacker = this.closestLivingEnemy();

    if (!attacker) {
      return;
    }

    const distance = Math.abs(attacker.x - this.player.x);
    const aligned = Math.abs(attacker.y - this.player.y) < 210;

    if (distance >= 140 || !aligned) {
      return;
    }

    attacker.startAttack(time);
    const damage = attacker === this.eliteAuditor ? 2 : 2;

    if (this.player.damage(damage, attacker.x, time, 720)) {
      this.hitFeedback.spawn(this.player.x, this.player.y - 120, `-${damage}`, "#ff7d55");
      this.audio.play("player-hit");
      this.cameras.main.shake(120, 0.006);
      this.nextPlayerDamageAt = time + 820;
      this.handlePlayerDeath(time);
    }
  }

  private closestLivingEnemy(): GuardEnemy | undefined {
    const enemies = [this.taxClerk, this.eliteAuditor].filter((enemy) => enemy.health.alive);
    return enemies.sort(
      (left, right) =>
        Math.abs(left.x - this.player.x) - Math.abs(right.x - this.player.x),
    )[0];
  }

  private tryDamageEnemy(
    enemy: GuardEnemy,
    time: number,
    stats: WeaponStats,
    facing: number,
    unlockId: string,
  ): void {
    const nextDamageAt = enemy === this.taxClerk
      ? this.nextTaxClerkDamageAt
      : this.nextEliteDamageAt;
    const enemyInFront =
      facing > 0 ? enemy.x >= this.player.x - 24 : enemy.x <= this.player.x + 24;
    const enemyInRange =
      enemyInFront &&
      Math.abs(enemy.x - this.player.x) < stats.reach &&
      Math.abs(enemy.y - this.player.y) < 190;

    if (
      time < this.attackUntil &&
      enemy.health.alive &&
      time > nextDamageAt &&
      enemyInRange
    ) {
      enemy.damage(stats.damage, this.player.x, time, stats.knockback);
      this.hitFeedback.spawn(enemy.x, enemy.y - 112, `-${stats.damage}`);
      this.audio.play(enemy.health.alive ? "enemy-hit" : "enemy-dead");
      this.hitStop(stats.hitStopMs);
      if (enemy === this.taxClerk) {
        this.nextTaxClerkDamageAt = time + 230;
      } else {
        this.nextEliteDamageAt = time + 230;
      }

      if (!enemy.health.alive) {
        this.recordEnemyDefeat(unlockId, time);
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

    this.trySkillDamageEnemy(this.taxClerk, time, skill, "tax_clerk_evicted");
    this.trySkillDamageEnemy(this.eliteAuditor, time, skill, "elite_auditor_embarrassed");
  }

  private trySkillDamageEnemy(
    enemy: GuardEnemy,
    time: number,
    skill: SkillStats,
    unlockId: string,
  ): void {
    const enemyInSkillRange =
      enemy.health.alive &&
      (Phaser.Geom.Intersects.RectangleToRectangle(
        this.skillHitbox.getBounds(),
        enemy.getBounds(),
      ) ||
        (Math.abs(enemy.x - this.player.x) < skill.range &&
          Math.abs(enemy.y - this.player.y) < 210));

    if (!enemyInSkillRange) {
      return;
    }

    enemy.damage(skill.damage, this.player.x, time, skill.knockback);
    this.hitFeedback.spawn(enemy.x, enemy.y - 112, `-${skill.damage}`, "#ffb06b");
    this.skillHitCount += 1;
    this.audio.play(enemy.health.alive ? "enemy-hit" : "enemy-dead");
    this.hitStop(enemy.health.alive ? 60 : 95);

    if (!enemy.health.alive) {
      this.recordEnemyDefeat(unlockId, time);
    }
  }

  private updateSkillVisual(time: number): void {
    if (time >= this.skillEffectUntil) {
      this.skillHitbox.setVisible(false);
    }
  }

  private recordEnemyDefeat(unlockId: string, time: number): void {
    this.kills += 1;
    this.progressStore.addKill();
    this.progressStore.unlock(unlockId);

    if (this.secondPathComplete()) {
      this.progressStore.unlock(`reward_${this.rewardChoice}`);
      this.audio.play("room-complete");
      this.barks.trySpeak("room-complete", time);
      this.cameras.main.flash(220, 166, 211, 74, false);
      this.completionBanner.setAlpha(1);
    }
  }

  private secondPathComplete(): boolean {
    return !this.taxClerk.health.alive && !this.eliteAuditor.health.alive;
  }

  private updateBossDoor(): void {
    const complete = this.secondPathComplete();

    this.bossDoor
      .setAlpha(complete ? 1 : 0.28);
    this.bossDoorArrow
      .setAlpha(complete ? 1 : 0);
    this.bossDoorPrompt
      .setAlpha(complete ? 1 : 0);
    this.setPropFrame(this.bossDoor, complete ? "unlockedGate" : "lockedGate");
  }

  private addPlatform(
    platforms: Phaser.Physics.Arcade.StaticGroup,
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    const platform = this.add.rectangle(x, y, width, height, 0x161315, 0.78)
      .setStrokeStyle(3, 0x9cc7ff, 0.72);

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
    this.nextPlayerDamageAt = time + 1200;
  }

  private handleRestartInput(): void {
    if (
      Phaser.Input.Keyboard.JustDown(this.restartKey) ||
      Phaser.Input.Keyboard.JustDown(this.restartAltKey)
    ) {
      this.restartSecondPath();
    }
  }

  private restartSecondPath(): void {
    this.player.resetSurvival(260, 500);
    this.taxClerk.resetEnemy(1160, 500);
    this.eliteAuditor.resetEnemy(1510, 500);
    this.deathCounted = false;
    this.attackUntil = 0;
    this.nextTaxClerkDamageAt = 0;
    this.nextEliteDamageAt = 0;
    this.nextPlayerDamageAt = this.time.now + 700;
    this.skillCooldownUntil = 0;
    this.skillEffectUntil = 0;
    this.skillUseCount = 0;
    this.skillHitCount = 0;
    this.hitFeedback.reset();
    this.smokeAttackCount = 0;
    this.kills = 0;
    this.completionBanner.setAlpha(0);
    this.deathBanner.setAlpha(0);
    this.restartPrompt.setAlpha(0);
    this.attackHitbox.setVisible(false);
    this.skillHitbox.setVisible(false);
    this.updateBossDoor();
  }

  private updateDebugOutput(): void {
    const playerState = this.player.debugState();
    const clerkState = this.taxClerk.debugState();
    const eliteState = this.eliteAuditor.debugState();
    const progress = this.progressStore.load();
    const complete = this.secondPathComplete();

    this.debugText.setText(
      `Tax Pike reach ${this.activeStats.reach} | ` +
        `clerk ${clerkState.health} ${clerkState.state} | ` +
        `elite ${eliteState.health} ${eliteState.state} | ` +
        `${complete ? "audit ruined" : "audit pending"}`,
    );

    document.body.dataset.scene = "SecondRunScene";
    document.body.dataset.playerState = playerState.state;
    document.body.dataset.playerX = String(playerState.x);
    document.body.dataset.playerHealth = String(playerState.health);
    document.body.dataset.playerAlive = String(playerState.alive);
    document.body.dataset.playerMaxHealth = String(this.playerMaxHealth);
    document.body.dataset.currentWeapon = this.currentWeapon;
    document.body.dataset.shopChoice = this.shopChoice ?? "direct";
    document.body.dataset.rewardChoice = this.rewardChoice;
    document.body.dataset.mutationChoice = this.mutationChoice ?? "none";
    document.body.dataset.skillChoice = this.skillChoice ?? "none";
    document.body.dataset.skillUnlocked = String(Boolean(this.skillChoice));
    document.body.dataset.currentSkill = this.skillChoice ?? "none";
    document.body.dataset.skillUses = String(this.skillUseCount);
    document.body.dataset.skillHits = String(this.skillHitCount);
    document.body.dataset.skillCooldownReady = String(this.time.now >= this.skillCooldownUntil);
    document.body.dataset.hitFeedbackCount = String(this.hitFeedback.count);
    document.body.dataset.taxClerkHealth = String(clerkState.health);
    document.body.dataset.taxClerkAlive = String(clerkState.alive);
    document.body.dataset.taxClerkState = clerkState.state;
    document.body.dataset.taxClerkVariant = clerkState.variant;
    document.body.dataset.eliteHealth = String(eliteState.health);
    document.body.dataset.eliteAlive = String(eliteState.alive);
    document.body.dataset.eliteState = eliteState.state;
    document.body.dataset.eliteVariant = eliteState.variant;
    document.body.dataset.secondPathComplete = String(complete);
    document.body.dataset.deathBanner = String(this.deathBanner.alpha > 0);
    document.body.dataset.bossDoorVisible = String(this.bossDoor.alpha > 0.9);
    document.body.dataset.bossTransitionReady = String(complete && playerState.x > 1700);
    document.body.dataset.kills = String(this.kills);
    document.body.dataset.deaths = String(this.deaths);
    document.body.dataset.progressKills = String(progress.kills);
    document.body.dataset.progressDeaths = String(progress.deaths);
    document.body.dataset.progressUnlocks = progress.unlocks.join(",");
    document.body.dataset.weaponReach = String(this.activeStats.reach);
    document.body.dataset.weaponDamage = String(this.activeStats.damage);
  }

  private routeToBossIfReady(): void {
    const canRouteFromSmoke =
      this.smokeMode === "secondBoss" ||
      this.smokeMode === "fullSlice" ||
      this.smokeMode === "rewardSkillBoss";

    if (
      (!canRouteFromSmoke && this.smokeMode !== "none") ||
      !this.secondPathComplete() ||
      this.player.x < 1748
    ) {
      return;
    }

    this.progressStore.unlock("boss_room_found");
    document.body.dataset.bossTransitioned = "true";
    this.scene.start("MiniBossScene", {
      mutation: this.mutationChoice,
      reward: this.rewardChoice,
      shopChoice: this.shopChoice,
      skill: this.skillChoice,
      weapon: this.currentWeapon,
    });
    this.scene.launch("UIScene");
  }

  private setPropFrame(
    image: Phaser.GameObjects.Image,
    frameKey: keyof typeof PropFrames,
  ): void {
    image.setFrame(frameKey);
  }
}
