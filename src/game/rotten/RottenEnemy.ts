import Phaser from "phaser";
import { AssetKeys } from "../assets";
import {
  ROTTEN_ELITE_VARIANTS,
  type RottenEliteVariant,
} from "./encounters";
import {
  ROTTEN_ENEMY_ROLES,
  STAGE_TWO_ENEMY_ROLES,
  type RottenEnemyRoleId,
} from "./enemyRoles";

export type RottenEnemyState =
  | "approach"
  | "windup"
  | "active"
  | "recovery"
  | "stunned"
  | "dead";

export type RottenEnemyDamageSource =
  | "weapon"
  | "weapon-projectile"
  | "dead-letter"
  | "skill"
  | "bribe-bomb"
  | "dash-wake";

export interface RottenEnemySpawnOptions {
  readonly eliteVariant?: RottenEliteVariant;
}

export interface RottenEnemyAttackIntent {
  readonly role: RottenEnemyRoleId;
  readonly enemyId: number;
  readonly serial: number;
  readonly x: number;
  readonly y: number;
  readonly direction: -1 | 1;
}

export interface RottenEnemyDamageResult {
  readonly applied: number;
  readonly killed: boolean;
  readonly blocked: boolean;
  readonly flankHit: boolean;
  readonly armorAbsorbed: boolean;
  readonly shieldOpened: boolean;
  readonly enrageTriggered: boolean;
}

export interface RottenEnemyDebugState {
  readonly id: number;
  readonly role: RottenEnemyRoleId;
  readonly state: RottenEnemyState;
  readonly health: number;
  readonly maxHealth: number;
  readonly alive: boolean;
  readonly tell: string;
  readonly eliteVariant: RottenEliteVariant | null;
  readonly armorPips: number;
  readonly enraged: boolean;
  readonly shieldState: "none" | "closed" | "open";
  readonly shieldBlocks: number;
  readonly shieldFlankHits: number;
  readonly shieldOpens: number;
  readonly shieldOpenSource: string;
  readonly onscreen: boolean;
  readonly feetY: number;
  readonly bodyBottom: number;
  readonly bodyLeft: number;
  readonly bodyRight: number;
  readonly velocityX: number;
  readonly reacquisitionDirection: -1 | 0 | 1;
  readonly reacquiring: boolean;
  readonly reacquisitionCount: number;
  readonly lastReacquisitionMs: number;
  readonly offscreenForMs: number;
}

let nextEnemyId = 1;
const ONSCREEN_PHYSICS_TOLERANCE = 20;

export class RottenEnemy extends Phaser.Physics.Arcade.Sprite {
  readonly runtimeId = nextEnemyId++;
  readonly role: RottenEnemyRoleId;
  readonly eliteVariant: RottenEliteVariant | null;
  private readonly maxHealth: number;
  private health: number;
  private behaviorState: RottenEnemyState = "approach";
  private stateUntil = 0;
  private nextAttackAt = 0;
  private attackSerial = 0;
  private chargeDirection: -1 | 1 = -1;
  private onscreen = true;
  private offscreenSince = 0;
  private offscreenForMs = 0;
  private reacquisitionCount = 0;
  private lastReacquisitionMs = 0;
  private restoreWorldBoundsOnReacquisition = false;
  private gravitySuspendedForReacquisition = false;
  private reacquisitionDirection: -1 | 0 | 1 = 0;
  private armorPips: number;
  private enraged = false;
  private enrageAnnounced = false;
  private enrageTellUntil = 0;
  private shieldOpenUntil = 0;
  private shieldBlocks = 0;
  private shieldFlankHits = 0;
  private shieldOpens = 0;
  private shieldOpenSource = "";
  private readonly tellText: Phaser.GameObjects.Text;
  private readonly laneTell: Phaser.GameObjects.Rectangle;
  private readonly shieldVisual: Phaser.GameObjects.Rectangle;
  private readonly armorPipVisual: Phaser.GameObjects.Arc;
  private readonly eliteAura: Phaser.GameObjects.Arc;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    role: RottenEnemyRoleId,
    private readonly maxFloorBodyBottom: number,
    options: RottenEnemySpawnOptions = {},
  ) {
    super(
      scene,
      x,
      y,
      role === "clerk" || role === "sump-scribe"
        ? AssetKeys.taxClerkRuntime
        : AssetKeys.drunkenGuardRuntime,
      "idle",
    );
    this.role = role;
    this.eliteVariant = options.eliteVariant ?? null;
    this.maxHealth = ROTTEN_ENEMY_ROLES[role].health;
    this.health = this.maxHealth;
    this.armorPips = this.eliteVariant === "gilded" ? 1 : 0;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1)
      .setScale(role === "clerk" || role === "sump-scribe" ? 0.37 : 0.33)
      .setDepth(8)
      .setCollideWorldBounds(true);
    this.applyTreatmentTint();

    const body = this.body as Phaser.Physics.Arcade.Body;
    const bodyWidth = role === "clerk" || role === "sump-scribe" ? 78 : 76;
    const bodyHeight = 142;
    this.anchorBodyToCurrentFrame(bodyWidth, bodyHeight);
    body.setDragX(1_100);

    this.laneTell = scene.add.rectangle(x, y - 68, 470, 38, 0xc59cff, 0.13)
      .setStrokeStyle(3, 0xd6b7ff, 0.9)
      .setDepth(5)
      .setVisible(false);
    this.tellText = scene.add.text(x, y - 178, "", {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "14px",
      color: "#fff1b8",
      backgroundColor: "#161315dd",
      padding: { x: 7, y: 4 },
      stroke: "#161315",
      strokeThickness: 3,
    }).setOrigin(0.5, 1)
      .setDepth(18)
      .setVisible(false);
    this.shieldVisual = scene.add.rectangle(x, y - 76, 30, 126, 0xe4d6a2, 0.72)
      .setStrokeStyle(4, 0xfff1b8, 0.96)
      .setDepth(12)
      .setVisible(role === "shield-auditor");
    this.armorPipVisual = scene.add.circle(x, y - 190, 9, 0xffd36b, 1)
      .setStrokeStyle(3, 0xfff1b8, 0.98)
      .setDepth(19)
      .setVisible(this.armorPips > 0);
    this.eliteAura = scene.add.circle(
      x,
      y - 84,
      60,
      this.eliteVariant === "gilded" ? 0xffd36b : 0xc34d7b,
      this.eliteVariant ? 0.1 : 0,
    ).setStrokeStyle(
      this.eliteVariant ? 3 : 0,
      this.eliteVariant === "gilded" ? 0xffd36b : 0xff6d8a,
      this.eliteVariant ? 0.72 : 0,
    ).setDepth(6).setVisible(Boolean(this.eliteVariant));
  }

  updateBehavior(
    time: number,
    playerX: number,
    viewLeft: number,
    viewRight: number,
  ): RottenEnemyAttackIntent | null {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (this.alive) {
      this.keepAboveEncounterFloor(body);
    }
    const wasOnscreen = this.onscreen;
    this.onscreen = body.right >= viewLeft - ONSCREEN_PHYSICS_TOLERANCE
      && body.left <= viewRight + ONSCREEN_PHYSICS_TOLERANCE;
    if (!this.onscreen) {
      if (wasOnscreen || this.offscreenSince === 0) {
        this.offscreenSince = time;
      }
      this.offscreenForMs = Math.max(0, Math.round(time - this.offscreenSince));
    } else if (!wasOnscreen && this.offscreenSince > 0) {
      this.lastReacquisitionMs = Math.max(0, Math.round(time - this.offscreenSince));
      this.reacquisitionCount += 1;
      this.offscreenSince = 0;
      this.offscreenForMs = 0;
      if (this.restoreWorldBoundsOnReacquisition) {
        this.setCollideWorldBounds(true);
        this.restoreWorldBoundsOnReacquisition = false;
      }
      if (this.gravitySuspendedForReacquisition) {
        body.setAllowGravity(true);
        this.gravitySuspendedForReacquisition = false;
      }
      this.reacquisitionDirection = 0;
    }
    this.syncTellsToSilhouette(time);

    if (!this.alive) {
      this.behaviorState = "dead";
      this.setEnemyFrame("dead");
      this.setAlpha(0.64).setTint(0x777777);
      body.setVelocityX(0);
      body.enable = false;
      this.hideTell();
      return null;
    }

    if (!this.onscreen) {
      this.enterApproach(time + 420);
      this.setEnemyFrame("patrol");
      body.setAllowGravity(false);
      body.setVelocityY(0);
      this.gravitySuspendedForReacquisition = true;
      const direction: -1 | 1 = body.right < viewLeft ? 1 : -1;
      this.reacquisitionDirection = direction;
      this.chargeDirection = direction;
      this.setEnemyFacing(direction < 0);
      body.setVelocityX(direction * Math.max(150, this.approachSpeed()));
      return null;
    }

    if (this.behaviorState === "stunned") {
      body.setVelocityX(0);
      this.setEnemyFrame("hurt");
      if (time < this.enrageTellUntil) {
        this.showTell("OVERDUE!", "#ff6d8a");
      } else {
        this.showTell("STUNNED", "#9cc7ff");
      }
      if (time >= this.stateUntil) {
        this.enterApproach(time + 420);
      }
      return null;
    }

    if (this.behaviorState === "windup") {
      body.setVelocityX(0);
      this.setEnemyFrame("alert");
      this.showTell(this.tellForRole(), this.tellColor());
      this.laneTell.setVisible(this.role === "writ-runner");
      if (time >= this.stateUntil) {
        this.behaviorState = "active";
        this.stateUntil = time + ROTTEN_ENEMY_ROLES[this.role].activeMs;
        this.attackSerial += 1;
        this.setEnemyFrame("attack");
        this.hideTell();
        if (this.role === "writ-runner") {
          body.setVelocityX(this.chargeDirection * 455);
        }
        return {
          role: this.role,
          enemyId: this.runtimeId,
          serial: this.attackSerial,
          x: this.x,
          y: this.y,
          direction: this.chargeDirection,
        };
      }
      return null;
    }

    if (this.behaviorState === "active") {
      this.setEnemyFrame("attack");
      if (this.role === "writ-runner") {
        body.setVelocityX(this.chargeDirection * 455);
      } else {
        body.setVelocityX(0);
      }
      if (time >= this.stateUntil) {
        this.behaviorState = "recovery";
        this.stateUntil = time + this.recoveryMs();
        body.setVelocityX(0);
      }
      return null;
    }

    if (this.behaviorState === "recovery") {
      body.setVelocityX(0);
      this.setEnemyFrame("hurt");
      this.showTell("OPEN", "#a6d34a");
      if (time >= this.stateUntil) {
        this.enterApproach(time + 520);
      }
      return null;
    }

    this.hideTell();
    if (time < this.enrageTellUntil) {
      this.showTell("OVERDUE!", "#ff6d8a");
    } else if (this.role === "shield-auditor" && this.shieldState(time) === "open") {
      this.showTell("SHIELD OPEN", "#9cc7ff");
    }
    const distance = playerX - this.x;
    const absoluteDistance = Math.abs(distance);
    this.chargeDirection = distance < 0 ? -1 : 1;
    this.setEnemyFacing(distance < 0);

    if (time >= this.nextAttackAt && this.canStartAttack(absoluteDistance)) {
      this.behaviorState = "windup";
      this.stateUntil = time + ROTTEN_ENEMY_ROLES[this.role].windupMs;
      body.setVelocityX(0);
      return null;
    }

    this.setEnemyFrame("patrol");
    if (this.role === "clerk" || this.role === "sump-scribe") {
      if (absoluteDistance < 255) {
        body.setVelocityX(-Math.sign(distance) * this.approachSpeed());
      } else if (absoluteDistance > 470) {
        body.setVelocityX(Math.sign(distance) * this.approachSpeed());
      } else {
        body.setVelocityX(0);
      }
    } else {
      body.setVelocityX(Math.sign(distance) * this.approachSpeed());
    }
    return null;
  }

  damage(
    amount: number,
    sourceX: number,
    time: number,
    knockback: number,
    interruptMs = 170,
    source: RottenEnemyDamageSource = "weapon",
  ): RottenEnemyDamageResult {
    const empty: RottenEnemyDamageResult = {
      applied: 0,
      killed: false,
      blocked: false,
      flankHit: false,
      armorAbsorbed: false,
      shieldOpened: false,
      enrageTriggered: false,
    };
    if (!this.alive) {
      return empty;
    }

    const shieldOpened = (source === "skill" || source === "bribe-bomb")
      ? this.openShield(time, "skill")
      : false;
    const shieldWeapon = this.role === "shield-auditor" && this.isWeaponSource(source);
    const flankHit = shieldWeapon && !this.sourceIsFrontal(sourceX);
    const closedShieldWeapon = shieldWeapon && this.shieldState(time) === "closed";
    if (closedShieldWeapon) {
      if (this.sourceIsFrontal(sourceX)) {
        this.shieldBlocks += 1;
        this.showTell("BLOCKED", "#fff1b8");
        this.shieldVisual.setFillStyle(0xffffff, 0.92);
        return { ...empty, blocked: true };
      }
      this.shieldFlankHits += 1;
    }
    if (flankHit && !closedShieldWeapon) {
      this.shieldFlankHits += 1;
    }

    if (this.armorPips > 0) {
      this.armorPips -= 1;
      this.armorPipVisual.setVisible(false);
      this.showTell("ARMOR BREAK", "#ffd36b");
      return { ...empty, flankHit, armorAbsorbed: true, shieldOpened };
    }

    this.health = Math.max(0, this.health - amount);
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.hideTell();
    let enrageTriggered = false;
    if (
      this.eliteVariant === "overdue"
      && !this.enrageAnnounced
      && this.health > 0
      && this.health < this.maxHealth / 2
    ) {
      this.enraged = true;
      this.enrageAnnounced = true;
      this.enrageTellUntil = time + 900;
      enrageTriggered = true;
    }

    if (!this.alive) {
      this.behaviorState = "dead";
      this.setEnemyFrame("dead");
      this.setTint(0x777777).setAlpha(0.64);
      body.setVelocity(0, 0);
      body.enable = false;
      this.hideTell();
      this.shieldVisual.setVisible(false);
      this.armorPipVisual.setVisible(false);
      this.eliteAura.setAlpha(0.04);
      return {
        applied: amount,
        killed: true,
        blocked: false,
        flankHit,
        armorAbsorbed: false,
        shieldOpened,
        enrageTriggered,
      };
    }

    this.behaviorState = "stunned";
    this.stateUntil = time + interruptMs;
    this.nextAttackAt = Math.max(this.nextAttackAt, this.stateUntil + 280);
    this.setEnemyFrame("hurt");
    this.applyTreatmentTint(true);
    body.setVelocityX(this.x >= sourceX ? knockback : -knockback);
    body.setVelocityY(-105);
    return {
      applied: amount,
      killed: false,
      blocked: false,
      flankHit,
      armorAbsorbed: false,
      shieldOpened,
      enrageTriggered,
    };
  }

  openShield(time: number, source: "skill" | "dash-through"): boolean {
    if (this.role !== "shield-auditor" || !this.alive) {
      return false;
    }
    const wasClosed = this.shieldState(time) === "closed";
    this.shieldOpenUntil = Math.max(
      this.shieldOpenUntil,
      time + STAGE_TWO_ENEMY_ROLES["shield-auditor"].shieldOpenMs,
    );
    if (wasClosed) {
      this.shieldOpens += 1;
    }
    this.shieldOpenSource = source;
    this.shieldVisual.setFillStyle(0x9cc7ff, 0.22).setStrokeStyle(3, 0x9cc7ff, 0.72);
    return wasClosed;
  }

  stun(time: number, durationMs: number): void {
    if (!this.alive) {
      return;
    }
    this.behaviorState = "stunned";
    this.stateUntil = Math.max(this.stateUntil, time + durationMs);
    this.nextAttackAt = this.stateUntil + 320;
    this.hideTell();
  }

  get alive(): boolean {
    return this.health > 0;
  }

  get isActiveAttack(): boolean {
    return this.behaviorState === "active" && this.onscreen;
  }

  get activeAttackSerial(): number {
    return this.attackSerial;
  }

  debugState(time = this.scene.time.now): RottenEnemyDebugState {
    const body = this.body as Phaser.Physics.Arcade.Body;
    return {
      id: this.runtimeId,
      role: this.role,
      state: this.behaviorState,
      health: this.health,
      maxHealth: this.maxHealth,
      alive: this.alive,
      tell: !this.alive
        ? ""
        : this.behaviorState === "windup"
          ? this.tellForRole()
          : this.behaviorState === "recovery"
            ? "OPEN"
            : time < this.enrageTellUntil
              ? "OVERDUE!"
              : "",
      eliteVariant: this.eliteVariant,
      armorPips: this.armorPips,
      enraged: this.enraged,
      shieldState: this.shieldState(time),
      shieldBlocks: this.shieldBlocks,
      shieldFlankHits: this.shieldFlankHits,
      shieldOpens: this.shieldOpens,
      shieldOpenSource: this.shieldOpenSource,
      onscreen: this.onscreen,
      feetY: Math.round(this.y * 10) / 10,
      bodyBottom: Math.round(body.bottom * 10) / 10,
      bodyLeft: Math.round(body.left * 10) / 10,
      bodyRight: Math.round(body.right * 10) / 10,
      velocityX: Math.round(body.velocity.x * 10) / 10,
      reacquisitionDirection: this.reacquisitionDirection,
      reacquiring: this.alive && !this.onscreen,
      reacquisitionCount: this.reacquisitionCount,
      lastReacquisitionMs: this.lastReacquisitionMs,
      offscreenForMs: this.offscreenForMs,
    };
  }

  displaceBeyondView(edge: "left" | "right", viewLeft: number, viewRight: number): void {
    if (!this.alive) {
      return;
    }
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.updateFromGameObject();
    const halfWidth = body.width / 2;
    const currentCenterX = body.left + halfWidth;
    const targetCenter = edge === "left"
      ? viewLeft - halfWidth - 48
      : viewRight + halfWidth + 48;
    this.setCollideWorldBounds(false);
    this.restoreWorldBoundsOnReacquisition = true;
    body.reset(this.x + targetCenter - currentCenterX, this.y);
  }

  override destroy(fromScene?: boolean): void {
    this.tellText.destroy();
    this.laneTell.destroy();
    this.shieldVisual.destroy();
    this.armorPipVisual.destroy();
    this.eliteAura.destroy();
    super.destroy(fromScene);
  }

  private canStartAttack(distance: number): boolean {
    if (this.role === "bailiff" || this.role === "shield-auditor") {
      return distance <= ROTTEN_ENEMY_ROLES[this.role].attackRange;
    }
    if (this.role === "clerk" || this.role === "sump-scribe") {
      return distance >= 210 && distance <= ROTTEN_ENEMY_ROLES[this.role].attackRange;
    }
    return distance >= 150 && distance <= ROTTEN_ENEMY_ROLES[this.role].attackRange;
  }

  private tellForRole(): string {
    switch (this.role) {
      case "clerk":
        return "RECEIPT!";
      case "writ-runner":
        return "LANE CHARGE!";
      case "shield-auditor":
        return "AUDIT!";
      case "sump-scribe":
        return "BILE MARK!";
      default:
        return "SWING!";
    }
  }

  private tellColor(): string {
    if (this.role === "writ-runner") {
      return "#d6b7ff";
    }
    if (this.role === "sump-scribe") {
      return "#cfff71";
    }
    return "#fff1b8";
  }

  private enterApproach(nextAttackAt: number): void {
    this.behaviorState = "approach";
    this.stateUntil = 0;
    this.nextAttackAt = nextAttackAt;
    this.applyTreatmentTint();
    this.hideTell();
  }

  private setEnemyFrame(frame: "idle" | "patrol" | "alert" | "attack" | "hurt" | "dead"): void {
    if (this.frame.name === frame) {
      return;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    const previousCenterX = body.left + body.width / 2;
    const previousBottom = body.bottom;
    this.setFrame(frame);
    this.setOrigin(0.5, 1);
    this.anchorBodyToCurrentFrame(
      this.role === "clerk" || this.role === "sump-scribe" ? 78 : 76,
      142,
    );
    body.updateFromGameObject();
    this.x += previousCenterX - (body.left + body.width / 2);
    this.y += previousBottom - body.bottom;
    body.updateFromGameObject();
    this.syncTellsToSilhouette(this.scene.time.now);
  }

  private setEnemyFacing(flipX: boolean): void {
    if (this.flipX === flipX) {
      return;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    const previousCenterX = body.left + body.width / 2;
    const previousBottom = body.bottom;
    this.setFlipX(flipX);
    body.updateFromGameObject();
    this.x += previousCenterX - (body.left + body.width / 2);
    this.y += previousBottom - body.bottom;
    body.updateFromGameObject();
    this.syncTellsToSilhouette(this.scene.time.now);
  }

  private anchorBodyToCurrentFrame(bodyWidth: number, bodyHeight: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(bodyWidth, bodyHeight, false);
    body.setOffset(
      Math.max(0, (this.frame.width - bodyWidth) / 2),
      Math.max(0, this.frame.height - bodyHeight - 10),
    );
    body.updateFromGameObject();
  }

  private keepAboveEncounterFloor(body: Phaser.Physics.Arcade.Body): void {
    const floorOverflow = body.bottom - this.maxFloorBodyBottom;
    if (floorOverflow <= 0) {
      return;
    }
    const velocityX = body.velocity.x;
    const velocityY = Math.min(0, body.velocity.y);
    body.reset(this.x, this.y - floorOverflow);
    body.setVelocity(velocityX, velocityY);
  }

  private syncTellsToSilhouette(time: number): void {
    this.tellText?.setPosition(this.x, this.y - 172);
    this.laneTell?.setPosition(this.x + this.chargeDirection * 215, this.y - 70);
    const facing = this.flipX ? -1 : 1;
    this.shieldVisual?.setPosition(this.x + facing * 50, this.y - 74);
    this.armorPipVisual?.setPosition(this.x, this.y - 190);
    this.eliteAura?.setPosition(this.x, this.y - 82);
    if (this.role === "shield-auditor" && this.alive) {
      const open = this.shieldState(time) === "open";
      this.shieldVisual.setVisible(true)
        .setFillStyle(open ? 0x9cc7ff : 0xe4d6a2, open ? 0.2 : 0.72)
        .setStrokeStyle(open ? 3 : 4, open ? 0x9cc7ff : 0xfff1b8, open ? 0.72 : 0.96);
    }
  }

  private showTell(label: string, color: string): void {
    this.tellText.setText(label).setColor(color).setVisible(true);
  }

  private hideTell(): void {
    this.tellText.setVisible(false);
    this.laneTell.setVisible(false);
  }

  private approachSpeed(): number {
    const multiplier = this.eliteVariant === "overdue" && this.enraged
      ? ROTTEN_ELITE_VARIANTS.overdue.belowHalfSpeedMultiplier
      : 1;
    return ROTTEN_ENEMY_ROLES[this.role].approachSpeed * multiplier;
  }

  private recoveryMs(): number {
    const multiplier = this.eliteVariant
      ? ROTTEN_ELITE_VARIANTS[this.eliteVariant].recoveryMultiplier
      : 1;
    return Math.round(ROTTEN_ENEMY_ROLES[this.role].recoveryMs * multiplier);
  }

  private shieldState(time: number): "none" | "closed" | "open" {
    if (this.role !== "shield-auditor") {
      return "none";
    }
    return time < this.shieldOpenUntil ? "open" : "closed";
  }

  private sourceIsFrontal(sourceX: number): boolean {
    return this.flipX ? sourceX < this.x : sourceX > this.x;
  }

  private isWeaponSource(source: RottenEnemyDamageSource): boolean {
    return source === "weapon" || source === "weapon-projectile" || source === "dead-letter";
  }

  private applyTreatmentTint(hurt = false): void {
    if (hurt) {
      this.setTint(this.eliteVariant === "overdue" ? 0xff8ca8 : 0xffd6a2);
      return;
    }
    if (this.eliteVariant === "gilded") {
      this.setTint(0xffd36b);
    } else if (this.eliteVariant === "overdue") {
      this.setTint(this.enraged ? 0xff446d : 0xc34d7b);
    } else if (this.role === "writ-runner") {
      this.setTint(0xc59cff);
    } else if (this.role === "shield-auditor") {
      this.setTint(0xe4d6a2);
    } else if (this.role === "sump-scribe") {
      this.setTint(0xa6d34a);
    } else {
      this.setTint(0xffffff);
    }
  }
}
