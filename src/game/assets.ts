export const assetUrls = {
  foxmanPrototype: new URL(
    "../../assets/game/atlases/characters/foxman/foxman_atlas.png",
    import.meta.url,
  ).href,
  foxmanPrototypeAtlas: new URL(
    "../../assets/game/atlases/characters/foxman/foxman_atlas.json",
    import.meta.url,
  ).href,
  rottenBoroughMood: new URL(
    "../../assets/game/backgrounds/rotten_borough/bg_rotten_borough_mood_runtime.webp",
    import.meta.url,
  ).href,
  drunkenGuardRuntime: new URL(
    "../../assets/game/atlases/enemies/drunken_guard/drunken_guard_atlas.png",
    import.meta.url,
  ).href,
  drunkenGuardRuntimeAtlas: new URL(
    "../../assets/game/atlases/enemies/drunken_guard/drunken_guard_atlas.json",
    import.meta.url,
  ).href,
  taxClerkRuntime: new URL(
    "../../assets/game/atlases/enemies/tax_clerk/tax_clerk_atlas.png",
    import.meta.url,
  ).href,
  taxClerkRuntimeAtlas: new URL(
    "../../assets/game/atlases/enemies/tax_clerk/tax_clerk_atlas.json",
    import.meta.url,
  ).href,
  tollBaronRuntime: new URL(
    "../../assets/game/atlases/enemies/toll_baron/toll_baron_atlas.png",
    import.meta.url,
  ).href,
  tollBaronRuntimeAtlas: new URL(
    "../../assets/game/atlases/enemies/toll_baron/toll_baron_atlas.json",
    import.meta.url,
  ).href,
  pickupExitRuntime: new URL(
    "../../assets/game/atlases/props/rotten_borough/pickup_exit_atlas.png",
    import.meta.url,
  ).href,
  pickupExitRuntimeAtlas: new URL(
    "../../assets/game/atlases/props/rotten_borough/pickup_exit_atlas.json",
    import.meta.url,
  ).href,
  rewardShopCounter: new URL(
    "../../assets/game/ui/menus/reward_shop_counter_runtime.webp",
    import.meta.url,
  ).href,
  rewardShopIcons: new URL(
    "../../assets/game/atlases/ui/reward_shop_icons/reward_shop_icons_atlas.png",
    import.meta.url,
  ).href,
  rewardShopIconsAtlas: new URL(
    "../../assets/game/atlases/ui/reward_shop_icons/reward_shop_icons_atlas.json",
    import.meta.url,
  ).href,
} as const;

export const AssetKeys = {
  foxmanPrototype: "foxman-prototype",
  rottenBoroughMood: "rotten-borough-mood",
  drunkenGuardRuntime: "drunken-guard-runtime",
  taxClerkRuntime: "tax-clerk-runtime",
  tollBaronRuntime: "toll-baron-runtime",
  pickupExitRuntime: "pickup-exit-runtime",
  rewardShopCounter: "reward-shop-counter",
  rewardShopIcons: "reward-shop-icons",
} as const;
