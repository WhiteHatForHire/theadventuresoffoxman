import Phaser from "phaser";
import { GuardFrames, TaxClerkFrames, TollBaronFrames, type CropFrame } from "../assetFrames";
import { AssetKeys } from "../assets";
import { Health } from "../combat/Health";

export type GuardDebugState = {
  x: number;
  y: number;
  health: number;
  alive: boolean;
  state: "patrol" | "chase" | "attack" | "dead";
  variant: GuardVariant;
};

export class GuardEnemy extends Phaser.Physics.Arcade.Sprite {
  readonly health: Health;
  private readonly frames: Record<EnemyFrameKey, CropFrame>;
  private readonly frameMode: "crop" | "atlas";
  private behaviorState: GuardDebugState["state"] = "patrol";
  private patrolDirection = -1;
  private attackUntil = 0;
  private pose?: EnemyFrameKey;
  private staggerUntil = 0;
  private readonly variant: GuardVariant;

  constructor(scene: Phaser.Scene, x: number, y: number, variant: GuardVariant = "drunkenGuard") {
    super(
      scene,
      x,
      y,
      GuardEnemy.assetForVariant(variant),
    );
    this.variant = variant;
    this.frames = GuardEnemy.framesForVariant(variant);
    this.frameMode = GuardEnemy.frameModeForVariant(variant);
    this.health = new Health(this.healthForVariant(variant));

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 1);
    this.setGuardFrame("idle");
    this.setScale(this.scaleForVariant(variant));
    this.setTint(this.tintForVariant());
    this.setCollideWorldBounds(true);

    const body = this.body as Phaser.Physics.Arcade.Body;
    const bodySize = this.bodySizeForVariant();
    body.setSize(bodySize.width, bodySize.height);
    body.setOffset(bodySize.offsetX, bodySize.offsetY);
    body.setDragX(1200);
    body.setGravityY(1500);
  }

  update(time: number, playerX: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (!this.health.alive) {
      this.behaviorState = "dead";
      this.setGuardFrame("dead");
      body.setVelocityX(0);
      body.enable = false;
      this.setAlpha(0.72);
      return;
    }

    if (time < this.attackUntil) {
      this.behaviorState = "attack";
      this.setGuardFrame("attack");
      body.setVelocityX(0);
      return;
    }

    if (time < this.staggerUntil) {
      this.behaviorState = "chase";
      this.setGuardFrame("hurt");
      return;
    }

    const distance = playerX - this.x;

    if (Math.abs(distance) < 430) {
      this.behaviorState = "chase";
      this.setGuardFrame("alert");
      body.setVelocityX(Math.sign(distance) * 120);
      this.setFlipX(distance < 0);
      return;
    }

    this.behaviorState = "patrol";
    this.setGuardFrame("patrol");
    body.setVelocityX(this.patrolDirection * 70);
    this.setFlipX(this.patrolDirection < 0);

    if (this.x < 760) {
      this.patrolDirection = 1;
    } else if (this.x > 1080) {
      this.patrolDirection = -1;
    }
  }

  startAttack(time: number): void {
    this.attackUntil = time + 260;
  }

  damage(amount: number, sourceX = this.x, time = 0, knockback = 290): void {
    this.health.damage(amount);
    this.setGuardFrame(this.health.alive ? "hurt" : "dead");
    this.setTint(this.health.alive ? 0xffd6a2 : 0x777777);

    if (this.health.alive) {
      this.staggerUntil = time + 190;
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setVelocityX(this.x >= sourceX ? knockback : -knockback);
      body.setVelocityY(-120);
    }
  }

  resetEnemy(x: number, y: number): void {
    this.health.reset();
    this.behaviorState = "patrol";
    this.patrolDirection = -1;
    this.attackUntil = 0;
    this.staggerUntil = 0;
    this.setPosition(x, y);
    this.setAlpha(1);
    this.setTint(this.tintForVariant());
    this.setGuardFrame("idle");

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setVelocity(0, 0);
  }

  debugState(): GuardDebugState {
    return {
      x: Math.round(this.x),
      y: Math.round(this.y),
      health: this.health.current,
      alive: this.health.alive,
      state: this.behaviorState,
      variant: this.variant,
    };
  }

  private setGuardFrame(pose: EnemyFrameKey): void {
    if (this.pose === pose) {
      return;
    }

    const frame = this.frames[pose];
    this.pose = pose;
    if (this.frameMode === "atlas") {
      this.setFrame(pose);
      return;
    }

    this.setCrop(frame.x, frame.y, frame.width, frame.height);
  }

  private healthForVariant(variant: GuardVariant): number {
    switch (variant) {
      case "eliteAuditor":
        return 4;
      case "tollBaron":
        return 7;
      case "taxClerk":
        return 2;
      default:
        return 3;
    }
  }

  private scaleForVariant(variant: GuardVariant): number {
    switch (variant) {
      case "eliteAuditor":
        return 0.5;
      case "tollBaron":
        return 0.54;
      case "taxClerk":
        return 0.42;
      default:
        return 0.36;
    }
  }

  private tintForVariant(): number {
    switch (this.variant) {
      case "eliteAuditor":
        return 0xffd36b;
      default:
        return 0xffffff;
    }
  }

  private bodySizeForVariant(): BodyShape {
    switch (this.variant) {
      case "tollBaron":
        return { width: 140, height: 185, offsetX: 150, offsetY: 235 };
      case "eliteAuditor":
      case "taxClerk":
        return { width: 82, height: 150, offsetX: 94, offsetY: 410 };
      default:
        return { width: 82, height: 150, offsetX: 94, offsetY: 410 };
    }
  }

  private static assetForVariant(variant: GuardVariant): string {
    switch (variant) {
      case "taxClerk":
      case "eliteAuditor":
        return AssetKeys.taxClerkRuntime;
      case "tollBaron":
        return AssetKeys.tollBaronRuntime;
      default:
        return AssetKeys.drunkenGuardRuntime;
    }
  }

  private static framesForVariant(variant: GuardVariant): Record<EnemyFrameKey, CropFrame> {
    switch (variant) {
      case "taxClerk":
      case "eliteAuditor":
        return TaxClerkFrames;
      case "tollBaron":
        return TollBaronFrames;
      default:
        return GuardFrames;
    }
  }

  private static frameModeForVariant(variant: GuardVariant): "crop" | "atlas" {
    return variant === "drunkenGuard" ||
      variant === "taxClerk" ||
      variant === "eliteAuditor" ||
      variant === "tollBaron"
      ? "atlas"
      : "crop";
  }
}

export type GuardVariant = "drunkenGuard" | "taxClerk" | "eliteAuditor" | "tollBaron";
type EnemyFrameKey = keyof typeof GuardFrames;
type BodyShape = {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
};
