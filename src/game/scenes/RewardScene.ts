import Phaser from "phaser";
import { AssetKeys } from "../assets";
import { GAME_HEIGHT, GAME_WIDTH } from "../GameConfig";
import { shopChoices, type ShopChoice, type ShopChoiceId } from "../rewards/RewardChoice";

export class RewardScene extends Phaser.Scene {
  constructor() {
    super("RewardScene");
  }

  create(): void {
    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, AssetKeys.rewardShopCounter)
      .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
      .setAlpha(0.96);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x161315, 0.28);

    this.add.text(GAME_WIDTH / 2, 84, "PICK YOUR BAD IDEA", {
      fontFamily: "Georgia, serif",
      fontSize: "42px",
      color: "#e4d6a2",
      stroke: "#161315",
      strokeThickness: 7,
    }).setOrigin(0.5, 0.5);

    this.add.text(GAME_WIDTH / 2, 132, "The counter offers weapons, mutations, and one bottled personal problem.", {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "18px",
      color: "#d4b879",
      stroke: "#161315",
      strokeThickness: 4,
    }).setOrigin(0.5, 0.5);

    this.addChoice(190, "1", shopChoices.pikeReach, 0x9cc7ff);
    this.addChoice(274, "2", shopChoices.auditShield, 0xa6d34a);
    this.addChoice(358, "3", shopChoices.spiteBelch, 0xff7d55);
    this.addChoice(442, "4", shopChoices.hangoverHide, 0xd4b879);
    this.addChoice(526, "5", shopChoices.pettyGrudge, 0xffd36b);

    this.add.text(GAME_WIDTH / 2, 640, "Press 1-5. Enter buys the pike reach because defaults are cowards.", {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "17px",
      color: "#a6d34a",
      stroke: "#161315",
      strokeThickness: 5,
    }).setOrigin(0.5, 0.5);

    document.body.dataset.scene = "RewardScene";
    document.body.dataset.rewardStub = "true";
    document.body.dataset.rewardChoices = "pikeReach,auditShield";
    document.body.dataset.shopChoices = Object.keys(shopChoices).join(",");
    document.body.dataset.hoveredShopChoice = "none";

    this.input.keyboard?.once("keydown-ONE", () => this.choose("pikeReach"));
    this.input.keyboard?.once("keydown-ENTER", () => this.choose("pikeReach"));
    this.input.keyboard?.once("keydown-TWO", () => this.choose("auditShield"));
    this.input.keyboard?.once("keydown-THREE", () => this.choose("spiteBelch"));
    this.input.keyboard?.once("keydown-FOUR", () => this.choose("hangoverHide"));
    this.input.keyboard?.once("keydown-FIVE", () => this.choose("pettyGrudge"));
  }

  private addChoice(y: number, keyLabel: string, choice: ShopChoice, accent: number): void {
    const card = this.add.rectangle(GAME_WIDTH / 2, y + 24, 640, 74, 0x2b2634, 0.86)
      .setStrokeStyle(2, accent, 0.82);
    card.setInteractive({ useHandCursor: true })
      .on("pointerover", () => {
        card.setFillStyle(0x3a3145, 0.94);
        card.setStrokeStyle(4, accent, 0.96);
        document.body.dataset.hoveredShopChoice = choice.id;
      })
      .on("pointerout", () => {
        card.setFillStyle(0x2b2634, 0.86);
        card.setStrokeStyle(2, accent, 0.82);
        document.body.dataset.hoveredShopChoice = "none";
      })
      .on("pointerdown", () => this.choose(choice.id));

    this.add.text(348, y + 24, keyLabel, {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "22px",
      color: "#161315",
      backgroundColor: "#e4d6a2",
      padding: { x: 8, y: 4 },
    }).setOrigin(0.5, 0.5);
    this.add.image(386, y + 24, AssetKeys.rewardShopIcons, this.iconFrameFor(choice))
      .setDisplaySize(50, 50)
      .setAlpha(0.96);
    this.add.text(420, y, choice.title, {
      fontFamily: "Georgia, serif",
      fontSize: "22px",
      color: "#e4d6a2",
      stroke: "#161315",
      strokeThickness: 4,
    }).setOrigin(0, 0.5);
    this.add.text(420, y + 30, choice.description, {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "15px",
      color: "#d4b879",
    }).setOrigin(0, 0.5);
    this.add.text(874, y, choice.category.toUpperCase(), {
      fontFamily: "Menlo, Consolas, monospace",
      fontSize: "13px",
      color: "#161315",
      backgroundColor: "#ffd36b",
      padding: { x: 7, y: 4 },
    }).setOrigin(0.5, 0.5);
  }

  private iconFrameFor(choice: ShopChoice): string {
    if (choice.id === "pikeReach") {
      return "weapon";
    }

    if (choice.id === "auditShield") {
      return "survival";
    }

    if (choice.id === "spiteBelch") {
      return "skill";
    }

    return "mutation";
  }

  private choose(choiceId: ShopChoiceId): void {
    const choice = shopChoices[choiceId];
    document.body.dataset.shopChoice = choice.id;
    document.body.dataset.rewardChoice = choice.reward;
    document.body.dataset.mutationChoice = choice.mutation ?? "none";
    document.body.dataset.skillChoice = choice.skill ?? "none";
    this.scene.start("SecondRunScene", {
      mutation: choice.mutation,
      reward: choice.reward,
      shopChoice: choice.id,
      skill: choice.skill,
    });
    this.scene.launch("UIScene");
  }
}
