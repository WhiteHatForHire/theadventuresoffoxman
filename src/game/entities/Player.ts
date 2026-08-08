import Phaser from "phaser";
import { FoxmanFrames } from "../assetFrames";
import { AssetKeys } from "../assets";
import { AudioBus } from "../audio/AudioBus";
import { Health } from "../combat/Health";
import type { InputSnapshot } from "../input/InputMapper";
import {
  PlayerMotor,
  type PlayerDebugState,
  type PlayerMovementState,
} from "../movement/PlayerMotor";

export type PlayerSurvivalDebugState = PlayerDebugState & {
  health: number;
  alive: boolean;
  invulnerable: boolean;
  dashTrailCount: number;
  dashCueCount: number;
};

export class Player extends Phaser.Physics.Arcade.Sprite {
  readonly health: Health;
  private readonly motor: PlayerMotor;
  private pose?: keyof typeof FoxmanFrames;
  private invulnerableUntil = 0;
  private lastDamageAt = -Infinity;
  private lastMovementState: PlayerMovementState = "idle";
  private dashTrailCount = 0;
  private dashCueCount = 0;
  private readonly dashTrails = new Set<Phaser.GameObjects.Image>();
  private readonly audio = new AudioBus();

  constructor(scene: Phaser.Scene, x: number, y: number, maxHealth = 5) {
    super(scene, x, y, AssetKeys.foxmanPrototype);
    this.health = new Health(maxHealth);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 1);
    this.setPose("idle");
    this.setScale(0.42);
    this.setCollideWorldBounds(true);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(72, 150);
    body.setOffset(86, 234);

    this.motor = new PlayerMotor(body);
  }

  update(time: number, input: InputSnapshot, attacking = false): void {
    if (!this.health.alive) {
      this.setPose("hurt");
      this.setTint(0x777777);
      this.setAlpha(0.72);
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setAccelerationX(0);
      body.setVelocityX(0);
      return;
    }

    const state = this.motor.update(time, input);
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (state === "dash" && this.lastMovementState !== "dash") {
      this.spawnDashTrail(body.velocity.x);
      this.audio.play("dash");
      this.dashCueCount += 1;
    }
    this.lastMovementState = state;

    if (body.velocity.x < -8) {
      this.setFlipX(true);
    } else if (body.velocity.x > 8) {
      this.setFlipX(false);
    }

    if (attacking) {
      this.setPose("attack");
    } else if (state === "dash") {
      this.setPose("dash");
    } else if (Math.abs(body.velocity.x) > 18 && body.blocked.down) {
      this.setPose("run");
    } else if (!body.blocked.down) {
      this.setPose("jump");
    } else {
      this.setPose("idle");
    }

    if (time < this.invulnerableUntil) {
      this.setAlpha(Math.floor(time / 70) % 2 === 0 ? 0.45 : 1);
      this.setTint(0xffd6a2);
      return;
    }

    this.setAlpha(1);
    this.setTint(this.tintForState(state));
  }

  damage(amount: number, sourceX = this.x, time = 0, invulnerabilityMs = 650): boolean {
    if (this.motor.debugState().state === "dash") {
      return false;
    }

    if (!this.isVulnerable(time)) {
      return false;
    }

    this.health.damage(amount);
    this.lastDamageAt = time;
    this.invulnerableUntil = this.health.alive ? time + invulnerabilityMs : Infinity;
    this.setPose("hurt");
    this.setTint(this.health.alive ? 0xffd6a2 : 0x777777);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(this.x >= sourceX ? 240 : -240);
    body.setVelocityY(-140);

    return true;
  }

  resetSurvival(x: number, y: number): void {
    this.health.reset();
    this.invulnerableUntil = 0;
    this.lastDamageAt = -Infinity;
    this.setPosition(x, y);
    this.setAlpha(1);
    this.setTint(0xffffff);
    this.setPose("idle");

    for (const trail of this.dashTrails) {
      trail.destroy();
    }
    this.dashTrails.clear();
    this.dashTrailCount = 0;
    this.dashCueCount = 0;
    this.lastMovementState = "idle";

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setAcceleration(0, 0);
    body.setVelocity(0, 0);
    this.motor.reset();
  }

  isVulnerable(time: number): boolean {
    return this.health.alive && time >= this.invulnerableUntil;
  }

  debugState(): PlayerSurvivalDebugState {
    return {
      ...this.motor.debugState(),
      health: this.health.current,
      alive: this.health.alive,
      invulnerable: this.lastDamageAt > -Infinity && !this.isVulnerable(this.scene.time.now),
      dashTrailCount: this.dashTrailCount,
      dashCueCount: this.dashCueCount,
    };
  }

  private spawnDashTrail(velocityX: number): void {
    const direction = Math.sign(velocityX) || (this.flipX ? -1 : 1);

    for (let index = 0; index < 3; index += 1) {
      const trail = this.scene.add.image(
        this.x - direction * (18 + index * 22),
        this.y,
        AssetKeys.foxmanPrototype,
      )
        .setFrame(this.frame.name)
        .setOrigin(0.5, 1)
        .setScale(0.42 - index * 0.025)
        .setFlipX(this.flipX)
        .setTint(0x9cc7ff)
        .setAlpha(0.24 - index * 0.045)
        .setDepth(this.depth - 1);

      this.dashTrails.add(trail);
      this.dashTrailCount += 1;
      this.scene.tweens.add({
        targets: trail,
        alpha: 0,
        duration: 125 + index * 35,
        x: trail.x - direction * 24,
        onComplete: () => {
          this.dashTrails.delete(trail);
          trail.destroy();
        },
      });
    }
  }

  private tintForState(state: string): number {
    switch (state) {
      case "jump":
        return 0xe4d6a2;
      case "fall":
        return 0xd4b879;
      case "land":
        return 0xffffff;
      case "dash":
        return 0x9cc7ff;
      default:
        return 0xffffff;
    }
  }

  private setPose(pose: keyof typeof FoxmanFrames): void {
    if (this.pose === pose) {
      return;
    }

    this.pose = pose;
    this.setFrame(pose);
    this.anchorBodyToCurrentFrame();
  }

  private anchorBodyToCurrentFrame(): void {
    const body = this.body as Phaser.Physics.Arcade.Body | null;
    if (!body) {
      return;
    }

    const bodyWidth = 72;
    const bodyHeight = 150;
    const footPadding = 10;
    const frameWidth = this.frame.width;
    const frameHeight = this.frame.height;

    body.setSize(bodyWidth, bodyHeight);
    body.setOffset(
      Math.max(0, (frameWidth - bodyWidth) / 2),
      Math.max(0, frameHeight - bodyHeight - footPadding),
    );
  }
}
