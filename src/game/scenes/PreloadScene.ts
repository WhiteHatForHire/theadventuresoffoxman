import Phaser from "phaser";
import { AssetKeys, assetUrls } from "../assets";
import { smokeParam } from "../smoke";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }

  preload(): void {
    this.load.image(AssetKeys.rottenBoroughMood, assetUrls.rottenBoroughMood);
    this.load.image(AssetKeys.rewardShopCounter, assetUrls.rewardShopCounter);
    this.load.atlas(
      AssetKeys.rewardShopIcons,
      assetUrls.rewardShopIcons,
      assetUrls.rewardShopIconsAtlas,
    );
    this.load.atlas(
      AssetKeys.foxmanPrototype,
      assetUrls.foxmanPrototype,
      assetUrls.foxmanPrototypeAtlas,
    );
    this.load.atlas(
      AssetKeys.drunkenGuardRuntime,
      assetUrls.drunkenGuardRuntime,
      assetUrls.drunkenGuardRuntimeAtlas,
    );
    this.load.atlas(
      AssetKeys.taxClerkRuntime,
      assetUrls.taxClerkRuntime,
      assetUrls.taxClerkRuntimeAtlas,
    );
    this.load.atlas(
      AssetKeys.tollBaronRuntime,
      assetUrls.tollBaronRuntime,
      assetUrls.tollBaronRuntimeAtlas,
    );
    this.load.atlas(
      AssetKeys.pickupExitRuntime,
      assetUrls.pickupExitRuntime,
      assetUrls.pickupExitRuntimeAtlas,
    );
  }

  create(): void {
    const smoke = smokeParam();

    if (smoke === "reward" || smoke === "rewardSkill" || smoke === "rewardSkillBoss") {
      this.scene.start("RewardScene");
      return;
    }

    if (smoke === "second" || smoke === "secondBoss" || smoke === "secondDeath") {
      this.scene.start("SecondRunScene");
      this.scene.launch("UIScene");
      return;
    }

    if (smoke === "boss" || smoke === "bossDeath") {
      this.scene.start("MiniBossScene");
      this.scene.launch("UIScene");
      return;
    }

    if (smoke) {
      this.scene.start("RunScene");
      this.scene.launch("UIScene");
      return;
    }

    this.scene.start("TitleScene");
  }
}
