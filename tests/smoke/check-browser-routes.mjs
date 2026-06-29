import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const baseUrl = process.env.FOXMAN_BASE_URL ?? "http://127.0.0.1:5173";
const chromeCandidates = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
].filter(Boolean);

let devServer;
let chrome;
let userDataDir;

async function smokeTitlePause(browser) {
  const page = await browser.open("/");
  await page.waitForDataset("scene", "TitleScene");
  await page.key("Enter");
  await page.waitForDataset("scene", "RunScene");
  await page.evaluate("window.__FOXMAN_PAUSE__()");
  await page.waitForDataset("paused", "true");
  await page.evaluate("window.__FOXMAN_RESUME__()");
  await page.waitForDataset("paused", "false");
  const state = await page.dataset(["scene", "paused", "playerState", "hudWeaponText"]);
  if (!String(state.hudWeaponText).includes("Weapon: Rusty Knife")) {
    throw new Error("title route HUD did not show the starting weapon");
  }
  await page.close();

  return { route: "/", state };
}

async function smokeFirstRoom(browser) {
  const page = await browser.open("/?smokeAuto=1&smoke=room");
  await page.waitForDataset("roomComplete", "true", 12000);
  await assertNoMissingTextureGreen(page, "first room presentation");
  const state = await page.dataset([
    "scene",
    "pickupCollected",
    "enemyAlive",
    "exitUnlocked",
    "roomComplete",
    "currentWeapon",
  ]);
  assertEqual(state.scene, "RunScene", "first room scene");
  assertEqual(state.pickupCollected, "true", "first room pickup");
  assertEqual(state.enemyAlive, "false", "first room enemy");
  assertEqual(state.exitUnlocked, "true", "first room exit");
  await page.close();

  return { route: "/?smokeAuto=1&smoke=room", state };
}

async function smokeManualOpeningRoute(browser) {
  const page = await browser.open("/");
  await page.waitForDataset("scene", "TitleScene");
  await page.key("Enter");
  await page.waitForDataset("scene", "RunScene");
  await page.holdKey("d", 1200);
  await page.holdKey("j", 700);
  await page.holdKey("d", 2600);
  await page.waitForDataset("scene", "RewardScene", 12000);
  const state = await page.dataset([
    "scene",
    "pickupCollected",
    "enemyAlive",
    "enemyHealth",
    "exitUnlocked",
    "roomComplete",
    "currentWeapon",
    "playerHealth",
  ]);
  assertEqual(state.scene, "RewardScene", "manual opening route destination");
  assertEqual(state.pickupCollected, "true", "manual opening route pickup");
  assertEqual(state.enemyAlive, "false", "manual opening route guard death");
  assertEqual(state.enemyHealth, "0", "manual opening route guard health");
  assertEqual(state.exitUnlocked, "true", "manual opening route exit");
  assertEqual(state.roomComplete, "true", "manual opening route complete");
  assertEqual(state.currentWeapon, "Butcher Saber", "manual opening route weapon");
  assertAtLeastNumber(state.playerHealth, 1, "manual opening route player survival");
  await page.close();

  return { route: "/ -> Enter, hold D/J/D", state };
}

async function assertNoMissingTextureGreen(page, label) {
  const sample = await page.evaluate(`(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return { canvasFound: false };
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const width = canvas.width;
    const height = canvas.height;
    const step = 4;
    const data = context.getImageData(0, 0, width, height).data;
    let sampled = 0;
    let neonGreen = 0;

    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const offset = (y * width + x) * 4;
        const red = data[offset];
        const green = data[offset + 1];
        const blue = data[offset + 2];
        const alpha = data[offset + 3];
        sampled += 1;

        if (alpha > 220 && green > 230 && red < 45 && blue < 45) {
          neonGreen += 1;
        }
      }
    }

    return {
      canvasFound: true,
      neonGreenRatio: neonGreen / sampled,
      neonGreen,
      sampled,
    };
  })()`);

  if (!sample.canvasFound) {
    throw new Error(`${label}: canvas was not found`);
  }

  if (sample.neonGreenRatio > 0.002) {
    throw new Error(
      `${label}: possible missing-texture green, ratio ${sample.neonGreenRatio}`,
    );
  }
}

async function smokeRangedCombat(browser) {
  const page = await browser.open("/?smokeAuto=1&smoke=ranged");
  await page.waitForDataset("enemyAlive", "false", 10000);
  const state = await page.dataset([
    "scene",
    "currentWeapon",
    "weaponKind",
    "secondaryPickupCollected",
    "rangedProjectileFired",
    "rangedProjectileHits",
    "enemyAlive",
    "enemyHealth",
    "progressUnlocks",
    "hudSkillText",
    "hitFeedbackCount",
  ]);
  assertEqual(state.scene, "RunScene", "ranged scene");
  assertEqual(state.currentWeapon, "Receipt Spitter", "ranged weapon");
  assertEqual(state.weaponKind, "ranged", "ranged weapon kind");
  assertEqual(state.secondaryPickupCollected, "true", "ranged pickup hook");
  assertEqual(state.enemyAlive, "false", "ranged enemy death");
  assertEqual(state.enemyHealth, "0", "ranged enemy health");

  if (Number(state.rangedProjectileFired) < 2) {
    throw new Error("ranged route did not fire enough projectiles");
  }

  if (Number(state.rangedProjectileHits) < 2) {
    throw new Error("ranged route did not hit with enough projectiles");
  }

  assertAtLeastNumber(state.hitFeedbackCount, 2, "ranged route hit feedback");

  if (!String(state.progressUnlocks).includes("receipt_spitter")) {
    throw new Error("ranged route did not persist receipt_spitter unlock");
  }

  assertEqual(state.hudSkillText, "Skill: none", "ranged route HUD skill lock state");

  await page.close();
  return { route: "/?smokeAuto=1&smoke=ranged", state };
}

async function smokeSkillCombat(browser) {
  const page = await browser.open("/?smokeAuto=1&smoke=skill");
  await page.waitForDataset("enemyAlive", "false", 10000);
  const state = await page.dataset([
    "scene",
    "currentSkill",
    "skillUnlocked",
    "skillUses",
    "skillHits",
    "skillCooldownReady",
    "enemyAlive",
    "enemyHealth",
    "progressUnlocks",
    "hudSkillText",
    "hitFeedbackCount",
  ]);
  assertEqual(state.scene, "RunScene", "skill scene");
  assertEqual(state.currentSkill, "Spite Belch", "skill name");
  assertEqual(state.skillUnlocked, "true", "skill unlocked");
  assertEqual(state.enemyAlive, "false", "skill enemy death");
  assertEqual(state.enemyHealth, "0", "skill enemy health");

  if (Number(state.skillUses) < 2) {
    throw new Error("skill route did not use Spite Belch enough");
  }

  if (Number(state.skillHits) < 2) {
    throw new Error("skill route did not hit with Spite Belch enough");
  }

  assertAtLeastNumber(state.hitFeedbackCount, 2, "skill route hit feedback");

  if (!String(state.progressUnlocks).includes("spite_belch")) {
    throw new Error("skill route did not persist spite_belch unlock");
  }

  if (!String(state.hudSkillText).includes("Spite Belch")) {
    throw new Error("skill route HUD did not show Spite Belch");
  }

  await page.close();
  return { route: "/?smokeAuto=1&smoke=skill", state };
}

async function smokeRewardHandoff(browser) {
  const page = await browser.open("/?smokeAuto=1&smoke=reward");
  await page.waitForDataset("scene", "RewardScene");
  const before = await page.dataset(["scene", "rewardStub", "rewardChoices", "shopChoices"]);
  await page.key("Enter");
  await page.waitForDataset("scene", "SecondRunScene");
  const after = await page.dataset([
    "scene",
    "currentWeapon",
    "rewardChoice",
    "taxClerkVariant",
    "eliteVariant",
    "weaponReach",
  ]);
  assertEqual(after.currentWeapon, "Tax Pike", "reward handoff weapon");
  assertEqual(after.rewardChoice, "pikeReach", "reward handoff default choice");
  assertEqual(after.taxClerkVariant, "taxClerk", "reward handoff enemy variant");
  assertEqual(after.eliteVariant, "eliteAuditor", "reward handoff elite variant");
  if (!String(before.shopChoices).includes("spiteBelch")) {
    throw new Error("reward shop did not expose skill choice");
  }
  await page.close();

  return { route: "/?smokeAuto=1&smoke=reward", before, after };
}

async function smokeRewardShopMutation(browser) {
  const page = await browser.open("/?smokeAuto=1&smoke=reward");
  await page.waitForDataset("scene", "RewardScene");
  await page.key("5");
  await page.waitForDataset("scene", "SecondRunScene");
  const state = await page.dataset([
    "scene",
    "shopChoice",
    "rewardChoice",
    "mutationChoice",
    "skillChoice",
    "weaponDamage",
    "weaponReach",
    "progressUnlocks",
  ]);
  assertEqual(state.scene, "SecondRunScene", "shop mutation destination");
  assertEqual(state.shopChoice, "pettyGrudge", "shop mutation choice");
  assertEqual(state.rewardChoice, "pikeReach", "shop mutation base reward");
  assertEqual(state.mutationChoice, "pettyGrudge", "shop mutation downstream state");
  assertEqual(state.skillChoice, "none", "shop mutation no skill");
  assertEqual(state.weaponDamage, "3", "shop mutation damage");
  assertEqual(state.weaponReach, "520", "shop mutation pike reach");

  if (!String(state.progressUnlocks).includes("mutation_pettyGrudge")) {
    throw new Error("shop mutation did not persist mutation unlock");
  }

  await page.close();
  return { route: "/?smokeAuto=1&smoke=reward -> key 5", state };
}

async function smokeRewardShopSkill(browser) {
  const page = await browser.open("/?smokeAuto=1&smoke=rewardSkill");
  await page.waitForDataset("scene", "RewardScene");
  await page.key("3");
  await page.waitForDataset("secondPathComplete", "true", 16000);
  const state = await page.dataset([
    "scene",
    "shopChoice",
    "rewardChoice",
    "mutationChoice",
    "skillChoice",
    "skillUnlocked",
    "currentSkill",
    "skillUses",
    "skillHits",
    "taxClerkAlive",
    "eliteAlive",
    "secondPathComplete",
    "progressUnlocks",
    "hudSkillText",
    "hudRouteText",
    "hitFeedbackCount",
  ]);
  assertEqual(state.scene, "SecondRunScene", "shop skill destination");
  assertEqual(state.shopChoice, "spiteBelch", "shop skill choice");
  assertEqual(state.rewardChoice, "pikeReach", "shop skill base reward");
  assertEqual(state.mutationChoice, "none", "shop skill no mutation");
  assertEqual(state.skillChoice, "Spite Belch", "shop skill downstream state");
  assertEqual(state.skillUnlocked, "true", "shop skill unlock state");
  assertEqual(state.currentSkill, "Spite Belch", "shop skill current skill");
  assertEqual(state.taxClerkAlive, "false", "shop skill tax clerk death");
  assertEqual(state.eliteAlive, "false", "shop skill elite death");
  assertEqual(state.secondPathComplete, "true", "shop skill path complete");

  if (Number(state.skillUses) < 2) {
    throw new Error("shop skill route did not use Spite Belch enough");
  }

  if (Number(state.skillHits) < 2) {
    throw new Error("shop skill route did not land Spite Belch enough");
  }

  assertAtLeastNumber(state.hitFeedbackCount, 2, "shop skill route hit feedback");

  if (!String(state.progressUnlocks).includes("spite_belch")) {
    throw new Error("shop skill did not persist spite_belch unlock");
  }

  if (!String(state.hudSkillText).includes("Spite Belch")) {
    throw new Error("shop skill HUD did not show Spite Belch");
  }

  if (!String(state.hudRouteText).includes("boss door")) {
    throw new Error("shop skill HUD did not show completed second-path route state");
  }

  await page.close();
  return { route: "/?smokeAuto=1&smoke=rewardSkill -> key 3", state };
}

async function smokeSecondPath(browser) {
  const page = await browser.open("/?smokeAuto=1&smoke=second&reward=pikeReach");
  await page.waitForDataset("secondPathComplete", "true", 10000);
  const state = await page.dataset([
    "scene",
    "currentWeapon",
    "rewardChoice",
    "taxClerkAlive",
    "taxClerkVariant",
    "eliteAlive",
    "eliteVariant",
    "secondPathComplete",
    "progressUnlocks",
    "weaponReach",
    "weaponDamage",
    "hitFeedbackCount",
  ]);
  assertEqual(state.scene, "SecondRunScene", "second path scene");
  assertEqual(state.currentWeapon, "Tax Pike", "second path weapon");
  assertEqual(state.rewardChoice, "pikeReach", "second path reward choice");
  assertEqual(state.taxClerkAlive, "false", "second path tax clerk death");
  assertEqual(state.taxClerkVariant, "taxClerk", "second path variant");
  assertEqual(state.eliteAlive, "false", "second path elite death");
  assertEqual(state.eliteVariant, "eliteAuditor", "second path elite variant");
  assertEqual(state.weaponReach, "520", "pike reach reward");

  assertAtLeastNumber(state.hitFeedbackCount, 3, "second path hit feedback");

  if (!String(state.progressUnlocks).includes("tax_clerk_evicted")) {
    throw new Error("second path did not persist tax_clerk_evicted unlock");
  }

  if (!String(state.progressUnlocks).includes("elite_auditor_embarrassed")) {
    throw new Error("second path did not persist elite_auditor_embarrassed unlock");
  }

  await page.close();
  return { route: "/?smokeAuto=1&smoke=second&reward=pikeReach", state };
}

async function smokeAuditShieldReward(browser) {
  const page = await browser.open("/?smokeAuto=1&smoke=second&reward=auditShield");
  await page.waitForDataset("secondPathComplete", "true", 12000);
  const state = await page.dataset([
    "scene",
    "rewardChoice",
    "playerHealth",
    "hudHealthText",
    "weaponReach",
    "secondPathComplete",
    "progressUnlocks",
  ]);
  assertEqual(state.rewardChoice, "auditShield", "audit shield reward choice");
  assertEqual(state.playerHealth, "6", "audit shield health bonus");
  assertEqual(state.hudHealthText, "HP: 6/6", "audit shield HUD health bonus");
  assertEqual(state.weaponReach, "430", "audit shield leaves pike reach unchanged");

  if (!String(state.progressUnlocks).includes("reward_auditShield")) {
    throw new Error("audit shield path did not persist reward_auditShield unlock");
  }

  await page.close();
  return { route: "/?smokeAuto=1&smoke=second&reward=auditShield", state };
}

async function smokeHangoverHideMutation(browser) {
  const page = await browser.open("/?smokeAuto=1&smoke=second&reward=pikeReach&mutation=hangoverHide");
  await page.waitForDataset("secondPathComplete", "true", 12000);
  const state = await page.dataset([
    "scene",
    "rewardChoice",
    "mutationChoice",
    "playerHealth",
    "playerMaxHealth",
    "weaponDamage",
    "secondPathComplete",
    "progressUnlocks",
  ]);
  assertEqual(state.scene, "SecondRunScene", "hangover mutation scene");
  assertEqual(state.mutationChoice, "hangoverHide", "hangover mutation choice");
  assertEqual(state.playerHealth, "6", "hangover mutation current health");
  assertEqual(state.playerMaxHealth, "6", "hangover mutation max health");
  assertEqual(state.weaponDamage, "2", "hangover mutation leaves pike damage");
  assertEqual(state.secondPathComplete, "true", "hangover mutation completes path");

  if (!String(state.progressUnlocks).includes("mutation_hangoverHide")) {
    throw new Error("hangover mutation did not persist unlock");
  }

  await page.close();
  return { route: "/?smokeAuto=1&smoke=second&reward=pikeReach&mutation=hangoverHide", state };
}

async function smokePettyGrudgeMutation(browser) {
  const page = await browser.open("/?smokeAuto=1&smoke=second&reward=pikeReach&mutation=pettyGrudge");
  await page.waitForDataset("secondPathComplete", "true", 12000);
  const state = await page.dataset([
    "scene",
    "rewardChoice",
    "mutationChoice",
    "playerMaxHealth",
    "weaponDamage",
    "weaponReach",
    "secondPathComplete",
    "progressUnlocks",
  ]);
  assertEqual(state.scene, "SecondRunScene", "grudge mutation scene");
  assertEqual(state.mutationChoice, "pettyGrudge", "grudge mutation choice");
  assertEqual(state.playerMaxHealth, "5", "grudge mutation leaves max health");
  assertEqual(state.weaponDamage, "3", "grudge mutation damage bonus");
  assertEqual(state.weaponReach, "520", "grudge mutation keeps pike reach reward");
  assertEqual(state.secondPathComplete, "true", "grudge mutation completes path");

  if (!String(state.progressUnlocks).includes("mutation_pettyGrudge")) {
    throw new Error("petty grudge mutation did not persist unlock");
  }

  await page.close();
  return { route: "/?smokeAuto=1&smoke=second&reward=pikeReach&mutation=pettyGrudge", state };
}

async function smokeSecondPathDeathRestart(browser) {
  const page = await browser.open("/?smokeAuto=1&smoke=secondDeath&reward=auditShield");
  await page.waitForDataset("deathBanner", "true", 15000);
  const dead = await page.dataset([
    "scene",
    "rewardChoice",
    "playerAlive",
    "playerHealth",
    "playerMaxHealth",
    "deathBanner",
    "deaths",
    "progressDeaths",
    "taxClerkAlive",
    "secondPathComplete",
  ]);
  assertEqual(dead.scene, "SecondRunScene", "second death scene");
  assertEqual(dead.rewardChoice, "auditShield", "second death reward choice");
  assertEqual(dead.playerAlive, "false", "second death player death");
  assertEqual(dead.playerHealth, "0", "second death player health");
  assertEqual(dead.playerMaxHealth, "6", "second death max health");
  assertEqual(dead.deathBanner, "true", "second death banner");
  assertEqual(dead.deaths, "1", "second death local count");
  assertEqual(dead.secondPathComplete, "false", "second death does not complete path");

  if (Number(dead.progressDeaths) < 1) {
    throw new Error("second path death did not persist a progress death");
  }

  await page.evaluate("window.__FOXMAN_RESTART_SECOND__()");
  await page.waitForDataset("deathBanner", "false", 5000);
  const restarted = await page.dataset([
    "scene",
    "rewardChoice",
    "playerAlive",
    "playerHealth",
    "playerMaxHealth",
    "deathBanner",
    "taxClerkAlive",
    "taxClerkHealth",
    "eliteAlive",
    "eliteHealth",
    "secondPathComplete",
    "weaponReach",
    "progressDeaths",
  ]);
  assertEqual(restarted.scene, "SecondRunScene", "second restart scene");
  assertEqual(restarted.rewardChoice, "auditShield", "second restart reward choice");
  assertEqual(restarted.playerAlive, "true", "second restart player alive");
  assertEqual(restarted.playerHealth, "6", "second restart restores audit shield health");
  assertEqual(restarted.playerMaxHealth, "6", "second restart keeps audit shield max health");
  assertEqual(restarted.taxClerkAlive, "true", "second restart tax clerk alive");
  assertEqual(restarted.taxClerkHealth, "2", "second restart tax clerk health");
  assertEqual(restarted.eliteAlive, "true", "second restart elite alive");
  assertEqual(restarted.eliteHealth, "4", "second restart elite health");
  assertEqual(restarted.secondPathComplete, "false", "second restart path incomplete");
  assertEqual(restarted.weaponReach, "430", "second restart keeps audit shield weapon reach");

  await page.close();
  return { route: "/?smokeAuto=1&smoke=secondDeath&reward=auditShield", dead, restarted };
}

async function smokeConnectedBossRoute(browser) {
  const page = await browser.open("/?smokeAuto=1&smoke=secondBoss&reward=pikeReach");
  await page.waitForDataset("bossDoorVisible", "true", 12000);
  const before = await page.dataset([
    "scene",
    "secondPathComplete",
    "bossDoorVisible",
    "bossTransitionReady",
    "progressUnlocks",
  ]);
  assertEqual(before.scene, "SecondRunScene", "connected boss route starts in second path");
  assertEqual(before.secondPathComplete, "true", "connected boss route second path complete");
  assertEqual(before.bossDoorVisible, "true", "connected boss route door visible");

  await page.waitForDataset("scene", "MiniBossScene", 12000);
  const after = await page.dataset([
    "scene",
    "bossAlive",
    "bossVariant",
    "bossComplete",
    "progressUnlocks",
    "hudSkillText",
    "hudRouteText",
    "hudTargetText",
    "hitFeedbackCount",
  ]);
  assertEqual(after.scene, "MiniBossScene", "connected boss route destination scene");
  assertEqual(after.bossAlive, "true", "connected boss route boss starts alive");
  assertEqual(after.bossVariant, "tollBaron", "connected boss route boss variant");
  assertEqual(after.bossComplete, "false", "connected boss route does not auto-complete boss");

  if (!String(after.progressUnlocks).includes("boss_room_found")) {
    throw new Error("connected boss route did not persist boss_room_found unlock");
  }

  await page.close();
  return { route: "/?smokeAuto=1&smoke=secondBoss&reward=pikeReach", before, after };
}

async function smokeFullSliceRoute(browser) {
  const page = await browser.open("/?smokeAuto=1&smoke=fullSlice");
  await page.waitForDataset("scene", "RewardScene", 18000);
  const shop = await page.dataset(["scene", "shopChoices", "rewardStub"]);
  assertEqual(shop.scene, "RewardScene", "full slice reward shop");

  if (!String(shop.shopChoices).includes("pettyGrudge")) {
    throw new Error("full slice shop did not expose Petty Grudge");
  }

  await page.key("5");
  await page.waitForDataset("bossComplete", "true", 45000);
  const state = await page.dataset([
    "scene",
    "currentWeapon",
    "shopChoice",
    "rewardChoice",
    "mutationChoice",
    "weaponDamage",
    "weaponReach",
    "bossAlive",
    "bossVariant",
    "bossComplete",
    "progressUnlocks",
    "hudSkillText",
    "hudRouteText",
    "hudTargetText",
    "hitFeedbackCount",
  ]);
  assertEqual(state.scene, "MiniBossScene", "full slice destination scene");
  assertEqual(state.currentWeapon, "Tax Pike", "full slice carried weapon");
  assertEqual(state.shopChoice, "pettyGrudge", "full slice shop choice");
  assertEqual(state.rewardChoice, "pikeReach", "full slice reward choice");
  assertEqual(state.mutationChoice, "pettyGrudge", "full slice mutation choice");
  assertEqual(state.weaponDamage, "3", "full slice mutation damage");
  assertEqual(state.weaponReach, "520", "full slice reward reach");
  assertEqual(state.bossAlive, "false", "full slice boss defeated");
  assertEqual(state.bossVariant, "tollBaron", "full slice boss variant");
  assertEqual(state.bossComplete, "true", "full slice boss complete");

  assertAtLeastNumber(state.hitFeedbackCount, 3, "full slice boss hit feedback");

  for (const unlock of [
    "reward_room_stub",
    "mutation_pettyGrudge",
    "tax_clerk_evicted",
    "elite_auditor_embarrassed",
    "boss_room_found",
    "toll_baron_humiliated",
  ]) {
    if (!String(state.progressUnlocks).includes(unlock)) {
      throw new Error(`full slice did not persist ${unlock}`);
    }
  }

  await page.close();
  return { route: "/?smokeAuto=1&smoke=fullSlice -> key 5", shop, state };
}

async function smokeSkillBossRoute(browser) {
  const page = await browser.open("/?smokeAuto=1&smoke=rewardSkillBoss");
  await page.waitForDataset("scene", "RewardScene", 18000);
  await page.key("3");
  await page.waitForDataset("bossComplete", "true", 50000);
  await page.waitForDataset("hudRouteText", "Route: boss cleared", 3000);
  const state = await page.dataset([
    "scene",
    "currentWeapon",
    "shopChoice",
    "rewardChoice",
    "mutationChoice",
    "skillChoice",
    "currentSkill",
    "skillUses",
    "skillHits",
    "weaponReach",
    "weaponDamage",
    "bossAlive",
    "bossVariant",
    "bossComplete",
    "progressUnlocks",
    "hudSkillText",
    "hudRouteText",
    "hudTargetText",
    "hitFeedbackCount",
  ]);
  assertEqual(state.scene, "MiniBossScene", "skill boss destination scene");
  assertEqual(state.currentWeapon, "Tax Pike", "skill boss carried weapon");
  assertEqual(state.shopChoice, "spiteBelch", "skill boss shop choice");
  assertEqual(state.rewardChoice, "pikeReach", "skill boss reward choice");
  assertEqual(state.mutationChoice, "none", "skill boss no mutation");
  assertEqual(state.skillChoice, "Spite Belch", "skill boss carried skill");
  assertEqual(state.currentSkill, "Spite Belch", "skill boss current skill");
  assertEqual(state.weaponReach, "520", "skill boss pike reach");
  assertEqual(state.weaponDamage, "2", "skill boss pike damage");
  assertEqual(state.bossAlive, "false", "skill boss defeated");
  assertEqual(state.bossVariant, "tollBaron", "skill boss variant");
  assertEqual(state.bossComplete, "true", "skill boss complete");

  assertAtLeastNumber(state.hitFeedbackCount, 4, "skill boss route hit feedback");

  if (!String(state.hudSkillText).includes("Spite Belch")) {
    throw new Error(`skill boss HUD did not show Spite Belch: ${state.hudSkillText}`);
  }

  if (!String(state.hudRouteText).includes("boss cleared")) {
    throw new Error("skill boss HUD did not show boss-cleared route state");
  }

  if (!String(state.hudTargetText).includes("Toll Baron 0")) {
    throw new Error("skill boss HUD did not show defeated Toll Baron target state");
  }

  if (Number(state.skillUses) < 2) {
    throw new Error("skill boss route did not use Spite Belch enough");
  }

  if (Number(state.skillHits) < 2) {
    throw new Error("skill boss route did not land Spite Belch enough");
  }

  for (const unlock of [
    "spite_belch",
    "tax_clerk_evicted",
    "elite_auditor_embarrassed",
    "boss_room_found",
    "toll_baron_humiliated",
  ]) {
    if (!String(state.progressUnlocks).includes(unlock)) {
      throw new Error(`skill boss route did not persist ${unlock}`);
    }
  }

  await page.close();
  return { route: "/?smokeAuto=1&smoke=rewardSkillBoss -> key 3", state };
}

async function smokeMiniBoss(browser) {
  const page = await browser.open("/?smokeAuto=1&smoke=boss");
  await page.waitForDataset("bossComplete", "true", 10000);
  const state = await page.dataset([
    "scene",
    "currentWeapon",
    "bossAlive",
    "bossVariant",
    "bossSpecialCount",
    "bossComplete",
    "progressUnlocks",
    "hitFeedbackCount",
  ]);
  assertEqual(state.scene, "MiniBossScene", "mini-boss scene");
  assertEqual(state.currentWeapon, "Butcher Saber", "mini-boss weapon");
  assertEqual(state.bossAlive, "false", "mini-boss death");
  assertEqual(state.bossVariant, "tollBaron", "mini-boss variant");

  if (Number(state.bossSpecialCount) < 1) {
    throw new Error("mini-boss did not perform toll stamp special");
  }

  assertAtLeastNumber(state.hitFeedbackCount, 3, "mini-boss hit feedback");

  if (!String(state.progressUnlocks).includes("toll_baron_humiliated")) {
    throw new Error("mini-boss did not persist toll_baron_humiliated unlock");
  }

  await page.close();
  return { route: "/?smokeAuto=1&smoke=boss", state };
}

async function smokeBossDeathRestart(browser) {
  const page = await browser.open("/?smokeAuto=1&smoke=bossDeath");
  await page.waitForDataset("deathBanner", "true", 15000);
  const dead = await page.dataset([
    "scene",
    "playerAlive",
    "playerHealth",
    "deathBanner",
    "deaths",
    "progressDeaths",
    "bossAlive",
    "bossSpecialCount",
    "hitFeedbackCount",
  ]);
  assertEqual(dead.scene, "MiniBossScene", "boss death scene");
  assertEqual(dead.playerAlive, "false", "boss death player death");
  assertEqual(dead.playerHealth, "0", "boss death player health");
  assertEqual(dead.deathBanner, "true", "boss death banner");
  assertEqual(dead.deaths, "1", "boss death local count");

  if (Number(dead.progressDeaths) < 1) {
    throw new Error("boss death did not persist a progress death");
  }

  if (Number(dead.bossSpecialCount) < 1) {
    throw new Error("boss death route did not use the toll stamp");
  }

  assertAtLeastNumber(dead.hitFeedbackCount, 3, "boss death hit feedback");

  await page.evaluate("window.__FOXMAN_RESTART_BOSS__()");
  await page.waitForDataset("deathBanner", "false", 5000);
  const restarted = await page.dataset([
    "scene",
    "playerAlive",
    "playerHealth",
    "deathBanner",
    "bossAlive",
    "bossHealth",
    "bossSpecialCount",
    "progressDeaths",
  ]);
  assertEqual(restarted.scene, "MiniBossScene", "boss restart scene");
  assertEqual(restarted.playerAlive, "true", "boss restart player alive");
  assertEqual(restarted.playerHealth, "5", "boss restart health");
  assertEqual(restarted.bossAlive, "true", "boss restart boss alive");
  assertEqual(restarted.bossHealth, "7", "boss restart boss health");
  assertEqual(restarted.bossSpecialCount, "0", "boss restart stamp reset");

  await page.close();
  return { route: "/?smokeAuto=1&smoke=bossDeath", dead, restarted };
}

async function ensureServer() {
  if (await isServerReady()) {
    return;
  }

  devServer = spawn("npm", ["run", "dev", "--", "--port", "5173", "--strictPort"], {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
  });

  let output = "";
  devServer.stdout.on("data", (chunk) => {
    output += chunk.toString();
  });
  devServer.stderr.on("data", (chunk) => {
    output += chunk.toString();
  });

  await waitFor(async () => isServerReady(), 20000, 250, () => {
    if (devServer.exitCode !== null) {
      throw new Error(`dev server exited before becoming ready:\n${output}`);
    }
  });
}

async function isServerReady() {
  try {
    const response = await fetch(baseUrl, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

async function launchChrome() {
  const chromePath = chromeCandidates.find(Boolean);

  if (!chromePath) {
    throw new Error("Set CHROME_PATH to run browser smoke; no Chrome candidate was configured.");
  }

  userDataDir = mkdtempSync(join(tmpdir(), "foxman-chrome-"));
  chrome = spawn(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking",
    "--remote-debugging-port=0",
    `--user-data-dir=${userDataDir}`,
    "about:blank",
  ], {
    stdio: ["ignore", "pipe", "pipe"],
  });

  const portFile = join(userDataDir, "DevToolsActivePort");
  await waitFor(() => {
    try {
      const [port] = readFileSync(portFile, "utf8").trim().split("\n");
      return Boolean(port);
    } catch {
      return false;
    }
  }, 15000, 100, () => {
    if (chrome.exitCode !== null) {
      throw new Error("Chrome exited before DevTools became available.");
    }
  });

  const [port] = readFileSync(portFile, "utf8").trim().split("\n");
  return new Browser(Number(port));
}

class Browser {
  constructor(port) {
    this.port = port;
  }

  async open(path) {
    const url = new URL(path, baseUrl).toString();
    const response = await fetch(
      `http://127.0.0.1:${this.port}/json/new?${encodeURIComponent(url)}`,
      { method: "PUT" },
    );

    if (!response.ok) {
      throw new Error(`Failed to open ${url}: ${response.status} ${response.statusText}`);
    }

    const target = await response.json();
    const page = new CdpPage(target.webSocketDebuggerUrl, target.id);
    await page.ready();
    return page;
  }
}

class CdpPage {
  constructor(webSocketUrl, targetId) {
    this.targetId = targetId;
    this.nextId = 1;
    this.pending = new Map();
    this.errors = [];
    this.ws = new WebSocket(webSocketUrl);
    this.opened = new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
    this.ws.addEventListener("message", (event) => this.onMessage(event));
  }

  async ready() {
    await this.opened;
    await this.send("Page.enable");
    await this.send("Runtime.enable");
    await this.send("Log.enable");
    await this.send("Network.enable");
  }

  async close() {
    this.ws.close();
  }

  async send(method, params = {}) {
    await this.opened;
    const id = this.nextId++;
    const response = new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
    this.ws.send(JSON.stringify({ id, method, params }));
    return response;
  }

  onMessage(event) {
    const message = JSON.parse(event.data);

    if (message.id && this.pending.has(message.id)) {
      const pending = this.pending.get(message.id);
      this.pending.delete(message.id);

      if (message.error) {
        pending.reject(new Error(`${message.error.message}: ${message.error.data ?? ""}`));
      } else {
        pending.resolve(message.result);
      }
      return;
    }

    if (message.method === "Runtime.exceptionThrown") {
      this.errors.push(message.params.exceptionDetails.text);
    }

    if (
      message.method === "Runtime.consoleAPICalled" &&
      message.params.type === "error"
    ) {
      this.errors.push(message.params.args.map((arg) => arg.value ?? arg.description).join(" "));
    }

    if (message.method === "Log.entryAdded" && message.params.entry.level === "error") {
      const text = message.params.entry.text;

      if (!text.includes("the server responded with a status of 404")) {
        this.errors.push(text);
      }
    }

    if (
      message.method === "Network.responseReceived" &&
      message.params.response.status >= 400 &&
      !message.params.response.url.endsWith("/favicon.ico")
    ) {
      this.errors.push(
        `${message.params.response.status} ${message.params.response.url}`,
      );
    }
  }

  async evaluate(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });

    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.text);
    }

    return result.result.value;
  }

  async dataset(keys) {
    const keyList = JSON.stringify(keys);
    return this.evaluate(`(() => {
      const d = document.body.dataset;
      const out = {};
      for (const key of ${keyList}) out[key] = d[key];
      out.canvasCount = document.querySelectorAll("canvas").length;
      return out;
    })()`);
  }

  async waitForDataset(key, expected, timeoutMs = 5000) {
    await waitFor(async () => {
      const value = await this.evaluate(`document.body.dataset.${key}`);
      return value === expected;
    }, timeoutMs, 100);

    if (this.errors.length > 0) {
      throw new Error(`browser errors detected: ${this.errors.join("; ")}`);
    }
  }

  async key(key) {
    await this.keyDown(key);
    await this.keyUp(key);
  }

  async holdKey(key, durationMs) {
    await this.keyDown(key);
    await new Promise((resolve) => setTimeout(resolve, durationMs));
    await this.keyUp(key);
  }

  async keyDown(key) {
    await this.dispatchKey(key, "keyDown");
  }

  async keyUp(key) {
    await this.dispatchKey(key, "keyUp");
  }

  async dispatchKey(key, type) {
    const isSingleLetter = key.length === 1;
    const upper = isSingleLetter ? key.toUpperCase() : key;
    const eventKey = isSingleLetter ? key.toLowerCase() : key;
    const specialKeys = {
      Enter: { code: "Enter", virtualKeyCode: 13 },
      Escape: { code: "Escape", virtualKeyCode: 27 },
    };
    const special = specialKeys[upper];
    const isDigit = /^[0-9]$/.test(key);
    const virtualKeyCode = special?.virtualKeyCode ?? upper.charCodeAt(0);
    const code = special?.code ?? (isDigit ? `Digit${key}` : `Key${upper}`);
    const printable = isSingleLetter ? eventKey : undefined;
    const event = {
      key: eventKey,
      code,
      windowsVirtualKeyCode: virtualKeyCode,
      nativeVirtualKeyCode: virtualKeyCode,
      text: printable,
      unmodifiedText: printable,
    };

    await this.send("Input.dispatchKeyEvent", { ...event, type });
  }
}

async function waitFor(predicate, timeoutMs, intervalMs, tick = () => {}) {
  const started = Date.now();
  let lastError;

  while (Date.now() - started < timeoutMs) {
    tick();

    try {
      if (await predicate()) {
        return;
      }
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw lastError ?? new Error(`Timed out after ${timeoutMs}ms`);
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

function assertAtLeastNumber(actual, expected, label) {
  const value = Number(actual);
  if (!Number.isFinite(value) || value < expected) {
    throw new Error(`${label}: expected at least ${expected}, got ${actual}`);
  }
}

try {
  await ensureServer();
  const browser = await launchChrome();

  const results = [];
  results.push(await smokeTitlePause(browser));
  results.push(await smokeManualOpeningRoute(browser));
  results.push(await smokeFirstRoom(browser));
  results.push(await smokeRangedCombat(browser));
  results.push(await smokeSkillCombat(browser));
  results.push(await smokeRewardHandoff(browser));
  results.push(await smokeRewardShopMutation(browser));
  results.push(await smokeRewardShopSkill(browser));
  results.push(await smokeSecondPath(browser));
  results.push(await smokeAuditShieldReward(browser));
  results.push(await smokeHangoverHideMutation(browser));
  results.push(await smokePettyGrudgeMutation(browser));
  results.push(await smokeSecondPathDeathRestart(browser));
  results.push(await smokeConnectedBossRoute(browser));
  results.push(await smokeFullSliceRoute(browser));
  results.push(await smokeSkillBossRoute(browser));
  results.push(await smokeMiniBoss(browser));
  results.push(await smokeBossDeathRestart(browser));

  console.log(JSON.stringify({ ok: true, results }, null, 2));
} finally {
  if (chrome) {
    chrome.kill("SIGTERM");
  }

  if (devServer) {
    devServer.kill("SIGTERM");
  }

  if (userDataDir) {
    rmSync(userDataDir, { force: true, maxRetries: 5, recursive: true, retryDelay: 150 });
  }
}
