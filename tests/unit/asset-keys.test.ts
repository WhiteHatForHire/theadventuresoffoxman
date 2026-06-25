import { describe, expect, it } from "vitest";
import foxmanAtlas from "../../assets/game/atlases/characters/foxman/foxman_atlas.json";
import drunkenGuardAtlas from "../../assets/game/atlases/enemies/drunken_guard/drunken_guard_atlas.json";
import taxClerkAtlas from "../../assets/game/atlases/enemies/tax_clerk/tax_clerk_atlas.json";
import tollBaronAtlas from "../../assets/game/atlases/enemies/toll_baron/toll_baron_atlas.json";
import pickupExitAtlas from "../../assets/game/atlases/props/rotten_borough/pickup_exit_atlas.json";
import rewardShopIconsAtlas from "../../assets/game/atlases/ui/reward_shop_icons/reward_shop_icons_atlas.json";
import {
  FoxmanFrames,
  GuardFrames,
  PropFrames,
  TaxClerkFrames,
  TollBaronFrames,
} from "../../src/game/assetFrames";
import { AudioBus } from "../../src/game/audio/AudioBus";
import { AssetKeys, assetUrls } from "../../src/game/assets";
import { applyTaxPikeReachReward, weaponStats } from "../../src/game/combat/WeaponStats";
import { playerMovement } from "../../src/game/data/movement";
import { BarkDeck } from "../../src/game/dialogue/BarkDeck";
import { PickupDebug } from "../../src/game/entities/Pickup";
import { RoomObjective } from "../../src/game/levels/RoomObjective";
import {
  applyMutationHealthBonus,
  applyMutationWeaponBonus,
  mutationDefinitions,
  mutationFromQuery,
} from "../../src/game/mutations/MutationStats";
import { ProgressStore } from "../../src/game/progression/ProgressStore";
import { rewardChoices, rewardFromQuery, shopChoices } from "../../src/game/rewards/RewardChoice";
import { activeSkillStats } from "../../src/game/skills/SkillStats";

describe("asset registry", () => {
  it("exposes stable keys for the first scaffold assets", () => {
    expect(AssetKeys.foxmanPrototype).toBe("foxman-prototype");
    expect(AssetKeys.rottenBoroughMood).toBe("rotten-borough-mood");
    expect(AssetKeys.rewardShopCounter).toBe("reward-shop-counter");
    expect(AssetKeys.rewardShopIcons).toBe("reward-shop-icons");
    expect(AssetKeys.tollBaronRuntime).toBe("toll-baron-runtime");
  });

  it("resolves workspace assets through Vite URLs", () => {
    expect(assetUrls.foxmanPrototype).toContain("foxman_atlas.png");
    expect(assetUrls.foxmanPrototypeAtlas).toContain("foxman_atlas.json");
    expect(assetUrls.rottenBoroughMood).toContain("bg_rotten_borough_mood_runtime.webp");
    expect(assetUrls.rewardShopCounter).toContain("reward_shop_counter_runtime.webp");
    expect(assetUrls.rewardShopIcons).toContain("reward_shop_icons_atlas.png");
    expect(assetUrls.rewardShopIconsAtlas).toContain("reward_shop_icons_atlas.json");
    expect(assetUrls.drunkenGuardRuntime).toContain("drunken_guard_atlas.png");
    expect(assetUrls.drunkenGuardRuntimeAtlas).toContain("drunken_guard_atlas.json");
    expect(assetUrls.taxClerkRuntime).toContain("tax_clerk_atlas.png");
    expect(assetUrls.taxClerkRuntimeAtlas).toContain("tax_clerk_atlas.json");
    expect(assetUrls.tollBaronRuntime).toContain("toll_baron_atlas.png");
    expect(assetUrls.tollBaronRuntimeAtlas).toContain("toll_baron_atlas.json");
    expect(assetUrls.pickupExitRuntime).toContain("pickup_exit_atlas.png");
    expect(assetUrls.pickupExitRuntimeAtlas).toContain("pickup_exit_atlas.json");
  });

  it("defines crop frames for integrated runtime sprite sheets", () => {
    expect(FoxmanFrames.attack.width).toBeGreaterThan(FoxmanFrames.idle.width);
    expect(GuardFrames.dead.height).toBeLessThan(GuardFrames.attack.height);
    expect(TaxClerkFrames.dead.height).toBeLessThan(TaxClerkFrames.idle.height);
    expect(TollBaronFrames.attack.width).toBeGreaterThan(400);
    expect(TollBaronFrames.dead.width).toBeGreaterThan(TollBaronFrames.idle.width);
    expect(PropFrames.unlockedGate.width).toBeGreaterThan(400);
  });

  it("exports Foxman as a named-frame atlas", () => {
    expect(Object.keys(foxmanAtlas.frames)).toEqual([
      "idle",
      "run",
      "jump",
      "attack",
      "hurt",
      "dash",
    ]);
    expect(foxmanAtlas.meta.size.w).toBeLessThan(1536);
    expect(foxmanAtlas.meta.size.h).toBeLessThan(1024);
  });

  it("exports the Toll Baron as a named-frame atlas", () => {
    expect(Object.keys(tollBaronAtlas.frames)).toEqual([
      "idle",
      "patrol",
      "alert",
      "attack",
      "hurt",
      "dead",
    ]);
    expect(tollBaronAtlas.meta.size.w).toBeLessThan(1536);
    expect(tollBaronAtlas.meta.size.h).toBeGreaterThan(1024);
  });

  it("exports the Tax Clerk as a named-frame atlas", () => {
    expect(Object.keys(taxClerkAtlas.frames)).toEqual([
      "idle",
      "patrol",
      "alert",
      "attack",
      "hurt",
      "dead",
    ]);
    expect(taxClerkAtlas.meta.size.w).toBeLessThan(1536);
    expect(taxClerkAtlas.meta.size.h).toBeGreaterThan(1024);
  });

  it("exports the Drunken Guard as a named-frame atlas", () => {
    expect(Object.keys(drunkenGuardAtlas.frames)).toEqual([
      "attack",
      "idle",
      "patrol",
      "alert",
      "hurt",
      "dead",
    ]);
    expect(drunkenGuardAtlas.meta.size.w).toBeLessThan(1536);
    expect(drunkenGuardAtlas.meta.size.h).toBeLessThan(1024);
  });

  it("exports the pickup and exit props as a named-frame atlas", () => {
    expect(Object.keys(pickupExitAtlas.frames)).toEqual([
      "lockedGate",
      "unlockedGate",
      "butcherSaber",
      "pickupRing",
      "lockIcon",
      "exitArrow",
    ]);
    expect(pickupExitAtlas.meta.size.w).toBeLessThan(1536);
    expect(pickupExitAtlas.meta.size.h).toBeLessThan(1024);
  });

  it("exports reward shop category icons as a named-frame atlas", () => {
    expect(Object.keys(rewardShopIconsAtlas.frames)).toEqual([
      "weapon",
      "survival",
      "skill",
      "mutation",
    ]);
    expect(rewardShopIconsAtlas.meta.size.w).toBeLessThanOrEqual(1280);
    expect(rewardShopIconsAtlas.meta.size.h).toBeLessThanOrEqual(1280);
  });
});

describe("movement tuning", () => {
  it("keeps the first sandbox responsive but bounded", () => {
    expect(playerMovement.maxRunSpeed).toBeGreaterThan(250);
    expect(playerMovement.maxRunSpeed).toBeLessThanOrEqual(420);
    expect(playerMovement.coyoteMs).toBeGreaterThanOrEqual(90);
    expect(playerMovement.jumpBufferMs).toBeGreaterThanOrEqual(100);
  });
});

describe("room objective", () => {
  it("requires pickup and encounter completion before exit completion", () => {
    const pickup = new PickupDebug("weapon_pickup");
    const room = new RoomObjective();

    room.update(pickup.collected);
    room.complete();
    expect(room.debugState()).toEqual({ exitUnlocked: false, complete: false });

    pickup.collect();
    room.update(pickup.collected);
    room.complete();
    expect(room.debugState()).toEqual({ exitUnlocked: true, complete: true });
  });
});

describe("audio cue bus", () => {
  it("records the latest cue for smoke and future sound hooks", () => {
    const bus = new AudioBus();
    bus.play("pickup");
    bus.play("room-complete");

    expect(bus.debugState()).toEqual({ lastCue: "room-complete" });
  });
});

describe("bark deck", () => {
  it("respects cooldown between placeholder barks", () => {
    const deck = new BarkDeck();
    const first = deck.trySpeak("pickup", 1000);
    const blocked = deck.trySpeak("enemy-dead", 1200);
    const next = deck.trySpeak("enemy-dead", 3000);

    expect(first).toContain("saber");
    expect(blocked).toBeUndefined();
    expect(next).toContain("medicinal violence");
  });
});

describe("progress store", () => {
  it("falls back to default progress outside browser storage", () => {
    const store = new ProgressStore();

    expect(store.load()).toEqual({ deaths: 0, kills: 0, unlocks: [] });
  });
});

describe("weapon stats", () => {
  it("makes the Tax Pike a distinct reach weapon", () => {
    expect(weaponStats["Tax Pike"].reach).toBeGreaterThan(weaponStats["Butcher Saber"].reach);
    expect(weaponStats["Tax Pike"].damage).toBeLessThan(weaponStats["Butcher Saber"].damage);
    expect(weaponStats["Tax Pike"].knockback).toBeGreaterThan(
      weaponStats["Butcher Saber"].knockback,
    );
  });

  it("defines the Receipt Spitter as the first ranged option", () => {
    expect(weaponStats["Receipt Spitter"].kind).toBe("ranged");
    expect(weaponStats["Receipt Spitter"].projectileSpeed).toBeGreaterThan(700);
    expect(weaponStats["Receipt Spitter"].projectileRange).toBeGreaterThan(
      weaponStats["Butcher Saber"].reach,
    );
    expect(weaponStats["Receipt Spitter"].damage).toBeLessThan(
      weaponStats["Butcher Saber"].damage,
    );
  });

  it("applies the pike reach reward without changing damage", () => {
    const rewarded = applyTaxPikeReachReward(weaponStats["Tax Pike"]);

    expect(rewarded.reach).toBe(weaponStats["Tax Pike"].reach + 90);
    expect(rewarded.damage).toBe(weaponStats["Tax Pike"].damage);
  });
});

describe("reward choices", () => {
  it("defines two route-affecting reward choices", () => {
    expect(Object.keys(rewardChoices)).toEqual(["pikeReach", "auditShield"]);
    expect(rewardFromQuery("?reward=auditShield")).toBe("auditShield");
    expect(rewardFromQuery("?reward=anything-else")).toBe("pikeReach");
  });

  it("defines a shop surface with reward, skill, and mutation choices", () => {
    expect(Object.keys(shopChoices)).toEqual([
      "pikeReach",
      "auditShield",
      "spiteBelch",
      "hangoverHide",
      "pettyGrudge",
    ]);
    expect(shopChoices.spiteBelch.skill).toBe("Spite Belch");
    expect(shopChoices.hangoverHide.mutation).toBe("hangoverHide");
    expect(shopChoices.pettyGrudge.reward).toBe("pikeReach");
  });
});

describe("active skills", () => {
  it("defines Spite Belch as the first cooldown skill", () => {
    expect(activeSkillStats["Spite Belch"].damage).toBeGreaterThan(0);
    expect(activeSkillStats["Spite Belch"].range).toBeGreaterThan(
      weaponStats["Butcher Saber"].reach,
    );
    expect(activeSkillStats["Spite Belch"].cooldownMs).toBeGreaterThan(500);
  });
});

describe("mutations", () => {
  it("defines two route-affecting mutation prototypes", () => {
    expect(Object.keys(mutationDefinitions)).toEqual(["hangoverHide", "pettyGrudge"]);
    expect(mutationFromQuery("?mutation=hangoverHide")).toBe("hangoverHide");
    expect(mutationFromQuery("?mutation=pettyGrudge")).toBe("pettyGrudge");
    expect(mutationFromQuery("?mutation=nonsense")).toBeUndefined();
  });

  it("applies survival and weapon mutation bonuses", () => {
    expect(applyMutationHealthBonus(5, "hangoverHide")).toBe(6);
    expect(applyMutationHealthBonus(5, "pettyGrudge")).toBe(5);

    const grudged = applyMutationWeaponBonus(weaponStats["Tax Pike"], "pettyGrudge");
    expect(grudged.damage).toBe(weaponStats["Tax Pike"].damage + 1);
    expect(grudged.reach).toBe(weaponStats["Tax Pike"].reach);
  });
});
