import Phaser from "phaser";

export type InputSnapshot = {
  left: boolean;
  right: boolean;
  jumpPressed: boolean;
  jumpHeld: boolean;
  attackPressed: boolean;
  skillPressed: boolean;
};

type MovementKeys = {
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  jump: Phaser.Input.Keyboard.Key;
  attack: Phaser.Input.Keyboard.Key;
  skill: Phaser.Input.Keyboard.Key;
  altLeft: Phaser.Input.Keyboard.Key;
  altRight: Phaser.Input.Keyboard.Key;
};

export class InputMapper {
  private readonly keys: MovementKeys;

  constructor(scene: Phaser.Scene) {
    if (!scene.input.keyboard) {
      throw new Error("Keyboard input is unavailable.");
    }

    this.keys = {
      left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      jump: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      attack: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
      skill: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K),
      altLeft: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      altRight: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
    };
  }

  snapshot(): InputSnapshot {
    return {
      left: this.keys.left.isDown || this.keys.altLeft.isDown,
      right: this.keys.right.isDown || this.keys.altRight.isDown,
      jumpPressed: Phaser.Input.Keyboard.JustDown(this.keys.jump),
      jumpHeld: this.keys.jump.isDown,
      attackPressed: Phaser.Input.Keyboard.JustDown(this.keys.attack),
      skillPressed: Phaser.Input.Keyboard.JustDown(this.keys.skill),
    };
  }
}
