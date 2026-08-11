import Phaser from "phaser";
import { AssetKeys } from "../assets";
import { STAGE_ONE_ENEMY_ROLES, type StageOneEnemyRoleId } from "./enemyRoles";

export type RottenEnemyState =
  | "approach"
  | "windup"
  | "active"
  | "recovery"
  | "stunned"
  | "dead";

export interface RottenEnemyAttackIntent {
  readonly role: StageOneEnemyRoleId;
  readonly enemyId: number;
  readonly serial: number;
  readonly x: number;
  readonly y: number;
  readonly direction: -1 | 1;
}

export interface RottenEnemyDebugState {
  readonly id: number;
  readonly role: StageOneEnemyRoleId;
  readonly state: RottenEnemyState;
  readonly health: number;
  readonly alive: boolean;
  readonly tell: string;
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
  readonly role: StageOneEnemyRoleId;
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
  private readonly tellText: Phaser.GameObjects.Text;
  private readonly laneTell: Phaser.GameObjects.Rectangle;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    role: StageOneEnemyRoleId,
    private readonly maxFloorBodyBottom: number,
  ) {
    super(
      scene,
      x,
      y,
      role === "clerk" ? AssetKeys.taxClerkRuntime : AssetKeys.drunkenGuardRuntime,
      "idle",
    );
    this.role = role;
    this.health = STAGE_ONE_ENEMY_ROLES[role].health;

    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1)
      .setScale(role === "clerk" ? 0.37 : 0.33)
      .setTint(role === "writ-runner" ? 0xc59cff : 0xffffff)
      .setDepth(8)
      .setCollideWorldBounds(true);

    const body = this.body as Phaser.Physics.Arcade.Body;
    const bodyWidth = role === "clerk" ? 78 : 76;
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
    this.syncTellsToSilhouette();

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
      body.setVelocityX(direction * Math.max(150, STAGE_ONE_ENEMY_ROLES[this.role].approachSpeed));
      return null;
    }

    if (this.behaviorState === "stunned") {
      body.setVelocityX(0);
      this.setEnemyFrame("hurt");
      this.showTell("STUNNED", "#9cc7ff");
      if (time >= this.stateUntil) {
        this.enterApproach(time + 420);
      }
      return null;
    }

    if (this.behaviorState === "windup") {
      body.setVelocityX(0);
      this.setEnemyFrame("alert");
      this.showTell(this.tellForRole(), this.role === "writ-runner" ? "#d6b7ff" : "#fff1b8");
      this.laneTell.setVisible(this.role === "writ-runner");
      if (time >= this.stateUntil) {
        this.behaviorState = "active";
        this.stateUntil = time + STAGE_ONE_ENEMY_ROLES[this.role].activeMs;
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
        this.stateUntil = time + STAGE_ONE_ENEMY_ROLES[this.role].recoveryMs;
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
    const distance = playerX - this.x;
    const absoluteDistance = Math.abs(distance);
    this.chargeDirection = distance < 0 ? -1 : 1;
    this.setEnemyFacing(distance < 0);

    if (time >= this.nextAttackAt && this.canStartAttack(absoluteDistance)) {
      this.behaviorState = "windup";
      this.stateUntil = time + STAGE_ONE_ENEMY_ROLES[this.role].windupMs;
      body.setVelocityX(0);
      return null;
    }

    this.setEnemyFrame("patrol");
    if (this.role === "clerk") {
      if (absoluteDistance < 255) {
        body.setVelocityX(-Math.sign(distance) * STAGE_ONE_ENEMY_ROLES[this.role].approachSpeed);
      } else if (absoluteDistance > 470) {
        body.setVelocityX(Math.sign(distance) * STAGE_ONE_ENEMY_ROLES[this.role].approachSpeed);
      } else {
        body.setVelocityX(0);
      }
    } else {
      body.setVelocityX(Math.sign(distance) * STAGE_ONE_ENEMY_ROLES[this.role].approachSpeed);
    }
    return null;
  }

  damage(amount: number, sourceX: number, time: number, knockback: number, interruptMs = 170): boolean {
    if (!this.alive) {
      return false;
    }

    this.health = Math.max(0, this.health - amount);
    const body = this.body as Phaser.Physics.Arcade.Body;
    this.hideTell();

    if (!this.alive) {
      this.behaviorState = "dead";
      this.setEnemyFrame("dead");
      this.setTint(0x777777).setAlpha(0.64);
      body.setVelocity(0, 0);
      body.enable = false;
      return true;
    }

    this.behaviorState = "stunned";
    this.stateUntil = time + interruptMs;
    this.nextAttackAt = Math.max(this.nextAttackAt, this.stateUntil + 280);
    this.setEnemyFrame("hurt");
    this.setTint(this.role === "writ-runner" ? 0xe1c9ff : 0xffd6a2);
    body.setVelocityX(this.x >= sourceX ? knockback : -knockback);
    body.setVelocityY(-105);
    return false;
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

  debugState(): RottenEnemyDebugState {
    const body = this.body as Phaser.Physics.Arcade.Body;
    return {
      id: this.runtimeId,
      role: this.role,
      state: this.behaviorState,
      health: this.health,
      alive: this.alive,
      tell: this.behaviorState === "windup"
        ? this.tellForRole()
        : this.behaviorState === "recovery"
          ? "OPEN"
          : "",
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
    super.destroy(fromScene);
  }

  private canStartAttack(distance: number): boolean {
    if (this.role === "bailiff") {
      return distance <= STAGE_ONE_ENEMY_ROLES[this.role].attackRange;
    }
    if (this.role === "clerk") {
      return distance >= 210 && distance <= STAGE_ONE_ENEMY_ROLES[this.role].attackRange;
    }
    return distance >= 150 && distance <= STAGE_ONE_ENEMY_ROLES[this.role].attackRange;
  }

  private tellForRole(): string {
    switch (this.role) {
      case "clerk":
        return "RECEIPT!";
      case "writ-runner":
        return "LANE CHARGE!";
      default:
        return "SWING!";
    }
  }

  private enterApproach(nextAttackAt: number): void {
    this.behaviorState = "approach";
    this.stateUntil = 0;
    this.nextAttackAt = nextAttackAt;
    this.setTint(this.role === "writ-runner" ? 0xc59cff : 0xffffff);
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
    this.anchorBodyToCurrentFrame(this.role === "clerk" ? 78 : 76, 142);
    body.updateFromGameObject();
    this.x += previousCenterX - (body.left + body.width / 2);
    this.y += previousBottom - body.bottom;
    body.updateFromGameObject();
    this.syncTellsToSilhouette();
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
    this.syncTellsToSilhouette();
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

  private syncTellsToSilhouette(): void {
    this.tellText?.setPosition(this.x, this.y - 172);
    this.laneTell?.setPosition(this.x + this.chargeDirection * 215, this.y - 70);
  }

  private showTell(label: string, color: string): void {
    this.tellText.setText(label).setColor(color).setVisible(true);
  }

  private hideTell(): void {
    this.tellText.setVisible(false);
    this.laneTell.setVisible(false);
  }
}
