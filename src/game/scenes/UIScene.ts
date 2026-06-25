import Phaser from "phaser";
import { GAME_WIDTH } from "../GameConfig";

export class UIScene extends Phaser.Scene {
  private healthBar!: Phaser.GameObjects.Rectangle;
  private healthText!: Phaser.GameObjects.Text;
  private weaponText!: Phaser.GameObjects.Text;
  private skillText!: Phaser.GameObjects.Text;
  private routeText!: Phaser.GameObjects.Text;
  private targetText!: Phaser.GameObjects.Text;

  constructor() {
    super("UIScene");
  }

  create(): void {
    const panelX = GAME_WIDTH - 142;
    const textX = GAME_WIDTH - 224;

    this.add.rectangle(panelX, 70, 216, 110, 0x161315, 0.82)
      .setStrokeStyle(2, 0xb88a3b, 0.96);
    this.add.rectangle(panelX, 36, 172, 22, 0x161315, 0.78)
      .setStrokeStyle(2, 0xb88a3b, 1);
    this.healthBar = this.add.rectangle(panelX, 36, 150, 10, 0xb3312b, 1);

    this.healthText = this.add.text(textX, 52, "HP: 5/5", {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "14px",
      color: "#e4d6a2",
    });

    this.weaponText = this.add.text(textX, 72, "Weapon: Rusty Knife", {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "14px",
      color: "#d4b879",
    });

    this.skillText = this.add.text(textX, 92, "Skill: none", {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "14px",
      color: "#ffb06b",
    });

    this.routeText = this.add.text(textX, 112, "Route: opening scam", {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "13px",
      color: "#9cc7ff",
    });

    this.targetText = this.add.text(textX, 130, "Target: pending", {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "13px",
      color: "#a6d34a",
    });
  }

  update(): void {
    const health = Number(document.body.dataset.playerHealth ?? 5);
    const maxHealth = Math.max(Number(document.body.dataset.playerMaxHealth ?? 5), 1);
    const weapon = document.body.dataset.currentWeapon ?? "Rusty Knife";
    const skill = document.body.dataset.currentSkill ?? document.body.dataset.skillChoice ?? "none";
    const skillUnlocked = document.body.dataset.skillUnlocked === "true";
    const skillReady = document.body.dataset.skillCooldownReady;
    const route = this.routeLabel(document.body.dataset.scene);
    const target = this.targetLabel();
    const clampedHealth = Phaser.Math.Clamp(health, 0, maxHealth);
    const skillLabel =
      skillUnlocked && skill && skill !== "none" && skill !== "undefined"
        ? `Skill: ${skill} ${skillReady === "false" ? "(cooling)" : "(ready)"}`
        : "Skill: none";

    this.healthBar.setDisplaySize(150 * (clampedHealth / maxHealth), 10);
    this.healthText.setText(`HP: ${clampedHealth}/${maxHealth}`);
    this.weaponText.setText(`Weapon: ${weapon}`);
    this.skillText.setText(skillLabel);
    this.routeText.setText(`Route: ${route}`);
    this.targetText.setText(`Target: ${target}`);

    document.body.dataset.hudHealthText = this.healthText.text;
    document.body.dataset.hudWeaponText = this.weaponText.text;
    document.body.dataset.hudSkillText = this.skillText.text;
    document.body.dataset.hudRouteText = this.routeText.text;
    document.body.dataset.hudTargetText = this.targetText.text;
  }

  private routeLabel(scene?: string): string {
    switch (scene) {
      case "RunScene":
        return document.body.dataset.roomComplete === "true" ? "shop exit" : "first room";
      case "SecondRunScene":
        return document.body.dataset.secondPathComplete === "true" ? "boss door" : "audit office";
      case "MiniBossScene":
        return document.body.dataset.bossComplete === "true" ? "boss cleared" : "toll baron";
      default:
        return "opening scam";
    }
  }

  private targetLabel(): string {
    if (document.body.dataset.scene === "MiniBossScene") {
      const bossHealth = document.body.dataset.bossHealth ?? "?";
      return `Toll Baron ${bossHealth}`;
    }

    if (document.body.dataset.scene === "SecondRunScene") {
      const clerk = document.body.dataset.taxClerkHealth ?? "?";
      const elite = document.body.dataset.eliteHealth ?? "?";
      return `clerk ${clerk} / elite ${elite}`;
    }

    const enemyHealth = document.body.dataset.enemyHealth ?? "?";
    return `guard ${enemyHealth}`;
  }
}
