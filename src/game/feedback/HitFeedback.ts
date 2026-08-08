import Phaser from "phaser";

export class HitFeedback {
  private impactCount = 0;
  private readonly activeObjects = new Set<Phaser.GameObjects.GameObject>();

  constructor(private readonly scene: Phaser.Scene) {}

  get count(): number {
    return this.impactCount;
  }

  get activeCount(): number {
    return this.activeObjects.size;
  }

  reset(): void {
    this.impactCount = 0;
    for (const object of this.activeObjects) {
      object.destroy();
    }
    this.activeObjects.clear();
  }

  spawn(x: number, y: number, label: string, color = "#ffd36b"): void {
    this.impactCount += 1;

    const spark = this.scene.add.circle(x, y, 8, 0xffd36b, 0.88)
      .setDepth(30);
    this.activeObjects.add(spark);
    this.scene.tweens.add({
      targets: spark,
      alpha: 0,
      duration: 260,
      scale: 2.6,
      onComplete: () => {
        this.activeObjects.delete(spark);
        spark.destroy();
      },
    });

    const text = this.scene.add.text(x, y - 18, label, {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "18px",
      color,
      stroke: "#161315",
      strokeThickness: 4,
    }).setOrigin(0.5, 0.5)
      .setDepth(31);
    this.activeObjects.add(text);

    this.scene.tweens.add({
      targets: text,
      alpha: 0,
      duration: 520,
      y: y - 62,
      onComplete: () => {
        this.activeObjects.delete(text);
        text.destroy();
      },
    });
  }
}
