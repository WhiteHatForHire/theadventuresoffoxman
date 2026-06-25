import Phaser from "phaser";
import { playerMovement } from "../data/movement";
import type { InputSnapshot } from "../input/InputMapper";

export type PlayerMovementState =
  | "idle"
  | "run"
  | "jump"
  | "fall"
  | "land";

export type PlayerDebugState = {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  grounded: boolean;
  state: PlayerMovementState;
};

export class PlayerMotor {
  private lastGroundedAt = 0;
  private jumpBufferedAt = -Infinity;
  private state: PlayerMovementState = "idle";
  private wasGrounded = false;

  constructor(private readonly body: Phaser.Physics.Arcade.Body) {
    this.body.setMaxVelocity(playerMovement.maxRunSpeed, 1200);
    this.body.setDragX(playerMovement.drag);
    this.body.setGravityY(playerMovement.gravityY);
  }

  update(time: number, input: InputSnapshot): PlayerMovementState {
    const grounded = this.body.blocked.down || this.body.touching.down;

    if (grounded) {
      this.lastGroundedAt = time;
    }

    if (input.jumpPressed) {
      this.jumpBufferedAt = time;
    }

    const wantsLeft = input.left && !input.right;
    const wantsRight = input.right && !input.left;

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
    };
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
