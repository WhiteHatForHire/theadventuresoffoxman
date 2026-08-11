import Phaser from "phaser";
import { playerMovement } from "../data/movement";
import type { InputSnapshot } from "../input/InputMapper";

export type PlayerMovementState =
  | "idle"
  | "run"
  | "jump"
  | "fall"
  | "land"
  | "dash";

export type PlayerDebugState = {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  grounded: boolean;
  state: PlayerMovementState;
  dashReady: boolean;
  dashCount: number;
};

export interface PlayerMotorConfig {
  readonly dashCooldownMs?: number;
}

export class PlayerMotor {
  private lastGroundedAt = 0;
  private jumpBufferedAt = -Infinity;
  private dashUntil = -Infinity;
  private nextDashAt = 0;
  private dashDirection = 1;
  private airDashAvailable = true;
  private dashCount = 0;
  private state: PlayerMovementState = "idle";
  private wasGrounded = false;

  private readonly dashCooldownMs: number;

  constructor(
    private readonly body: Phaser.Physics.Arcade.Body,
    config: PlayerMotorConfig = {},
  ) {
    this.dashCooldownMs = config.dashCooldownMs ?? playerMovement.dashCooldownMs;
    this.body.setMaxVelocity(playerMovement.maxRunSpeed, 1200);
    this.body.setDragX(playerMovement.drag);
    this.body.setGravityY(playerMovement.gravityY);
  }

  update(time: number, input: InputSnapshot): PlayerMovementState {
    const grounded = this.body.blocked.down || this.body.touching.down;

    if (grounded) {
      this.lastGroundedAt = time;
      this.airDashAvailable = true;
    }

    if (input.jumpPressed) {
      this.jumpBufferedAt = time;
    }

    const wantsLeft = input.left && !input.right;
    const wantsRight = input.right && !input.left;
    const canDash = time >= this.nextDashAt && (grounded || this.airDashAvailable);

    if (wantsLeft) {
      this.dashDirection = -1;
    } else if (wantsRight) {
      this.dashDirection = 1;
    }

    if (input.dashPressed && canDash) {
      this.dashUntil = time + playerMovement.dashDurationMs;
      this.nextDashAt = time + this.dashCooldownMs;
      this.airDashAvailable = false;
      this.dashCount += 1;
      this.jumpBufferedAt = -Infinity;
    }

    if (time < this.dashUntil) {
      this.body.setMaxVelocity(playerMovement.dashSpeed, 1200);
      this.body.setAccelerationX(0);
      this.body.setVelocityX(this.dashDirection * playerMovement.dashSpeed);
      if (this.body.velocity.y > 80) {
        this.body.setVelocityY(80);
      }
      this.state = "dash";
      this.wasGrounded = grounded;
      return this.state;
    }

    this.body.setMaxVelocity(playerMovement.maxRunSpeed, 1200);

    if (wantsLeft) {
      this.body.setAccelerationX(-playerMovement.acceleration);
    } else if (wantsRight) {
      this.body.setAccelerationX(playerMovement.acceleration);
    } else {
      this.body.setAccelerationX(0);
    }

    const hasBufferedJump = time - this.jumpBufferedAt <= playerMovement.jumpBufferMs;
    const hasCoyoteGround = time - this.lastGroundedAt <= playerMovement.coyoteMs;

    if (hasBufferedJump && hasCoyoteGround) {
      this.body.setVelocityY(playerMovement.jumpVelocity);
      this.jumpBufferedAt = -Infinity;
      this.lastGroundedAt = -Infinity;
    }

    if (!input.jumpHeld && this.body.velocity.y < -180) {
      this.body.setVelocityY(-180);
    }

    this.state = this.resolveState(grounded);
    this.wasGrounded = grounded;

    return this.state;
  }

  debugState(): PlayerDebugState {
    return {
      x: Math.round(this.body.x),
      y: Math.round(this.body.y),
      velocityX: Math.round(this.body.velocity.x),
      velocityY: Math.round(this.body.velocity.y),
      grounded: this.body.blocked.down || this.body.touching.down,
      state: this.state,
      dashReady: this.state !== "dash" && this.body.world.scene.time.now >= this.nextDashAt,
      dashCount: this.dashCount,
    };
  }

  reset(): void {
    this.lastGroundedAt = 0;
    this.jumpBufferedAt = -Infinity;
    this.dashUntil = -Infinity;
    this.nextDashAt = 0;
    this.dashDirection = 1;
    this.airDashAvailable = true;
    this.dashCount = 0;
    this.state = "idle";
    this.wasGrounded = false;
  }

  private resolveState(grounded: boolean): PlayerMovementState {
    if (grounded && !this.wasGrounded) {
      return "land";
    }

    if (!grounded && this.body.velocity.y < 0) {
      return "jump";
    }

    if (!grounded && this.body.velocity.y >= 0) {
      return "fall";
    }

    if (Math.abs(this.body.velocity.x) > 12) {
      return "run";
    }

    return "idle";
  }
}
