import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const baseUrl = process.env.FOXMAN_BASE_URL ?? "http://127.0.0.1:5173";
const evidenceDir = process.env.FOXMAN_EVIDENCE_DIR;
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

async function smokeRottenRunContract(browser) {
  const titlePage = await browser.open("/", { viewport: { width: 1366, height: 768 } });
  await titlePage.waitForDataset("scene", "TitleScene");
  await captureEvidence(titlePage, "rotten-mode-title-1366x768.png");
  await titlePage.key("r");
  await titlePage.waitForDataset("rottenScene", "RottenRunScene");
  const titleEntry = await titlePage.dataset([
    "scene",
    "rottenScene",
    "rottenPhase",
    "rottenSeed",
    "rottenPlanId",
  ]);
  assertEqual(titleEntry.scene, "RottenRunScene", "Rotten Run title entry scene");
  assertEqual(titleEntry.rottenPhase, "loadout", "Rotten Run title entry phase");
  if (!String(titleEntry.rottenSeed).startsWith("RR-")) {
    throw new Error(`Rotten Run title entry did not freeze a visible RR seed: ${titleEntry.rottenSeed}`);
  }
  await titlePage.close();

  const route = "/?mode=rotten&seed=GAUNTLET-ALPHA&smokeAuto=1&smoke=rottenContract";
  const page = await browser.open(route, { viewport: { width: 1366, height: 768 } });
  await page.waitForDataset("rottenScene", "RottenRunScene");
  const planned = await page.dataset([
    "scene",
    "rottenScene",
    "rottenPhase",
    "rottenSeed",
    "rottenPlanId",
    "rottenStage",
    "rottenRouteOptions",
    "rottenSelectedRoute",
  ]);
  assertEqual(planned.scene, "RottenRunScene", "Rotten Run seeded scene");
  assertEqual(planned.rottenPhase, "route-choice", "Rotten Run initial phase");
  assertEqual(planned.rottenSeed, "GAUNTLET-ALPHA", "Rotten Run normalized seed");
  assertEqual(planned.rottenPlanId, "RR1-1C93B57F", "Rotten Run fixture plan ID");
  assertEqual(planned.rottenStage, "1", "Rotten Run planned stage");
  assertEqual(
    planned.rottenRouteOptions,
    "unfiled-alley|bailiffs-ramp",
    "Rotten Run Stage 1 route cards",
  );
  assertEqual(planned.rottenSelectedRoute, "", "Rotten Run initial route selection");

  const snapshot = await page.evaluate("window.__FOXMAN_ROTTEN__");
  assertEqual(snapshot.scene, "RottenRunScene", "Rotten Run structured scene");
  assertEqual(snapshot.seed, "GAUNTLET-ALPHA", "Rotten Run structured seed");
  assertEqual(snapshot.stages, undefined, "Rotten Run snapshot stays scalar and bounded");
  assertEqual(snapshot.routeOptions.length, 2, "Rotten Run structured route option count");

  await page.key("2");
  await page.waitForDataset("rottenPhase", "encounter");
  await page.waitForDataset("rottenSelectedRoute", "bailiffs-ramp");
  const selected = await page.dataset([
    "scene",
    "rottenPhase",
    "rottenSeed",
    "rottenPlanId",
    "rottenStage",
    "rottenRouteOptions",
    "rottenSelectedRoute",
    "rottenTraceDigest",
  ]);
  assertEqual(selected.rottenPhase, "encounter", "Rotten Run selected phase");
  assertEqual(selected.rottenSelectedRoute, "bailiffs-ramp", "Rotten Run real 2-key selection");

  const viewport = await page.evaluate(`({
    width: window.innerWidth,
    height: window.innerHeight,
  })`);
  assertEqual(String(viewport.width), "1366", "Rotten Run evidence viewport width");
  assertEqual(String(viewport.height), "768", "Rotten Run evidence viewport height");
  await captureEvidence(page, "rotten-contract-gauntlet-alpha-1366x768.png");
  await page.close();

  return { route: "/ -> R; seeded Rotten Run -> 2", titleEntry, planned, selected, viewport };
}

async function smokeRottenRunEncounter(browser) {
  const enemyCycles = await smokeRottenEnemyAnchoring(browser);
  const reacquisition = await smokeRottenEnemyReacquisition(browser);
  const route = "/?mode=rotten&seed=GAUNTLET-ALPHA&smokeAuto=1&smoke=rottenEncounter";
  const page = await browser.open(route, { viewport: { width: 1366, height: 768 } });
  await page.send("Page.bringToFront");
  await page.send("Emulation.setFocusEmulationEnabled", { enabled: true });
  await page.waitForDataset("rottenPhase", "loadout");
  const loadout = await page.dataset([
    "scene",
    "rottenPhase",
    "rottenSeed",
    "rottenPlanId",
    "rottenWeapon",
    "rottenSkill",
    "rottenTraceDigest",
    "rottenCombatObjectCount",
  ]);
  assertEqual(loadout.scene, "RottenRunScene", "Rotten encounter loadout scene");
  assertEqual(loadout.rottenSeed, "GAUNTLET-ALPHA", "Rotten encounter seed");
  assertEqual(loadout.rottenPlanId, "RR1-1C93B57F", "Rotten encounter plan ID");
  assertEqual(loadout.rottenCombatObjectCount, "0", "Rotten loadout combat objects");
  await captureEvidence(page, "rotten-encounter-loadout-1366x768.png");

  await page.key("3");
  await page.waitForDataset("rottenWeapon", "tax-pike");
  await page.key("6");
  await page.waitForDataset("rottenSkill", "seized-stamp");
  await page.key("Enter");
  await page.waitForDataset("rottenPhase", "route-choice");
  await page.key("2");
  await page.waitForDataset("rottenPhase", "encounter");
  await page.waitForDataset("rottenSelectedRoute", "bailiffs-ramp");

  await installRottenObservationLatch(page);
  let latchedEnemyTell = "";
  await waitFor(
    async () => {
      const observed = await readRottenObservationLatch(page);
      latchedEnemyTell ||= observed.enemyTell;
      return Boolean(latchedEnemyTell);
    },
    12_000,
    80,
  );
  await page.waitForDataset("rottenScene", "RottenRunScene");
  const activeCombat = await page.dataset([
    "rottenPhase",
    "rottenWave",
    "rottenLivingEnemies",
    "rottenEnemyStates",
    "rottenEnemyTell",
    "rottenWeapon",
    "rottenSkill",
    "rottenCombatObjectCount",
  ]);
  activeCombat.latchedEnemyTell = latchedEnemyTell;
  if (!String(latchedEnemyTell).includes("windup")) {
    throw new Error(`Rotten encounter did not expose a readable windup tell: ${latchedEnemyTell}`);
  }
  if (Number(activeCombat.rottenCombatObjectCount) <= 0) {
    throw new Error(`Rotten encounter did not expose live owned objects: ${activeCombat.rottenCombatObjectCount}`);
  }
  await captureEvidence(page, "rotten-encounter-readable-tell-1366x768.png");
  await assertNoMissingTextureGreen(page, "Rotten Run active encounter");

  await page.waitForDataset("rottenPhase", "reward-choice", 30_000);
  const reward = await page.dataset([
    "scene",
    "rottenPhase",
    "rottenSeed",
    "rottenPlanId",
    "rottenWeapon",
    "rottenSkill",
    "rottenSelectedRoute",
    "rottenWave",
    "rottenWavesCleared",
    "rottenSpawnHistory",
    "rottenLivingEnemies",
    "rottenAttackCount",
    "rottenAttackHitCount",
    "rottenWeaponStyle",
    "rottenSkillUseCount",
    "rottenSkillHitCount",
    "rottenGraft",
    "rottenOfferIds",
    "rottenHp",
    "rottenTraceDigest",
    "rottenCombatObjectCount",
  ]);
  assertEqual(reward.scene, "RottenRunScene", "Rotten reward scene");
  assertEqual(reward.rottenWeapon, "tax-pike", "Rotten real-key weapon");
  assertEqual(reward.rottenSkill, "seized-stamp", "Rotten real-key skill");
  assertEqual(reward.rottenSelectedRoute, "bailiffs-ramp", "Rotten real-key route");
  assertEqual(reward.rottenWave, "2", "Rotten completed wave number");
  assertEqual(reward.rottenWavesCleared, "2", "Rotten completed wave count");
  assertEqual(
    reward.rottenSpawnHistory,
    "1:bailiff,bailiff|2:bailiff,writ-runner",
    "Rotten seeded Stage 1 spawn history",
  );
  assertEqual(reward.rottenLivingEnemies, "0", "Rotten reward living enemies");
  assertAtLeastNumber(reward.rottenAttackCount, 1, "Rotten production weapon attacks");
  assertAtLeastNumber(reward.rottenAttackHitCount, 1, "Rotten production weapon hits");
  assertEqual(reward.rottenWeaponStyle, "spacing", "Rotten Tax Pike style");
  assertAtLeastNumber(reward.rottenSkillUseCount, 1, "Rotten production skill uses");
  assertAtLeastNumber(reward.rottenSkillHitCount, 1, "Rotten production skill hits");
  assertEqual(reward.rottenGraft, "7", "Rotten route graft award");
  assertEqual(
    reward.rottenOfferIds,
    "dead-letter|petty-grudge|spite-reserve",
    "Rotten deterministic offer fixture",
  );
  assertEqual(reward.rottenCombatObjectCount, "0", "Rotten reward stale combat objects");
  if (reward.rottenTraceDigest === loadout.rottenTraceDigest) {
    throw new Error("Rotten encounter trace digest did not change after decisions and combat");
  }
  if (!String(reward.rottenHp).endsWith("/6") || Number(String(reward.rottenHp).split("/")[0]) < 1) {
    throw new Error(`Rotten encounter did not leave Foxman alive: ${reward.rottenHp}`);
  }
  await assertNoMissingTextureGreen(page, "Rotten Run reward docket");
  await captureEvidence(page, "rotten-encounter-reward-1366x768.png");
  await page.close();

  const spitterBombPage = await browser.open(route, { viewport: { width: 1920, height: 1080 } });
  await selectRottenBuild(spitterBombPage, "4", "7", "2");
  await spitterBombPage.waitForDataset("rottenPhase", "reward-choice", 30_000);
  const spitterBomb = await spitterBombPage.dataset([
    "rottenPhase",
    "rottenWeapon",
    "rottenSkill",
    "rottenSelectedRoute",
    "rottenAttackCount",
    "rottenAttackHitCount",
    "rottenSkillUseCount",
    "rottenSkillHitCount",
    "rottenCombatObjectCount",
  ]);
  assertEqual(spitterBomb.rottenWeapon, "receipt-spitter", "Rotten contrasting weapon");
  assertEqual(spitterBomb.rottenSkill, "bribe-bomb", "Rotten contrasting skill");
  assertAtLeastNumber(spitterBomb.rottenAttackHitCount, 1, "Rotten Receipt Spitter hits");
  assertAtLeastNumber(spitterBomb.rottenSkillHitCount, 1, "Rotten Bribe Bomb hits");
  assertEqual(spitterBomb.rottenCombatObjectCount, "0", "Rotten contrasting build cleanup");
  await captureEvidence(spitterBombPage, "rotten-encounter-spitter-bomb-1920x1080.png");
  await spitterBombPage.close();

  return {
    route: "Rotten Run real 3/6/Enter/2 combat",
    enemyCycles,
    reacquisition,
    loadout,
    activeCombat,
    reward,
    spitterBomb,
  };
}

async function smokeRottenMarketPurchase(browser) {
  const route = "/?mode=rotten&seed=GAUNTLET-ALPHA&smokeAuto=1&smoke=rottenMarket";

  const purchasePage = await browser.open(route, { viewport: { width: 1366, height: 768 } });
  await purchasePage.waitForDataset("rottenPhase", "loadout");
  await installRottenMarketPhaseLatch(purchasePage);
  await selectRottenBuild(purchasePage, "3", "6", "2");
  await releaseRottenSelectionKeys(purchasePage);
  const purchaseArming = await waitForOpenRottenMarket(purchasePage);
  const purchaseBefore = await purchasePage.dataset(rottenMarketTruthKeys());
  assertEqual(purchaseBefore.rottenStage, "1", "Rotten purchase starts at Stage 1 market");
  assertEqual(purchaseBefore.rottenGraft, "7", "Rotten purchase starting purse");
  assertEqual(
    purchaseBefore.rottenOfferIds,
    "dead-letter|petty-grudge|spite-reserve",
    "Rotten purchase fixed offers",
  );
  assertEqual(purchaseBefore.rottenOfferPrices, "7|5|5", "Rotten purchase effective prices");
  await captureEvidence(purchasePage, "rotten-market-before-choice-1366x768.png");

  await purchasePage.key("1");
  await purchasePage.waitForDataset("rottenStage", "2", 5_000);
  await purchasePage.waitForDataset("rottenUpgrades", "dead-letter", 2_000);
  const purchase = await purchasePage.dataset([
    ...rottenMarketTruthKeys(),
    "rottenRewardFeedback",
    "rottenRewardFeedbackReason",
  ]);
  assertEqual(purchase.rottenPhase, "route-choice", "Rotten purchase Stage 2 phase");
  assertEqual(purchase.rottenRouteOptions, "seized-goods-lift|late-fee-chapel", "Rotten Stage 2 pair");
  assertEqual(purchase.rottenSelectedRoute, "", "Rotten Stage 2 route remains unselected");
  assertEqual(purchase.rottenWeapon, "tax-pike", "Rotten purchase carried weapon");
  assertEqual(purchase.rottenSkill, "seized-stamp", "Rotten purchase carried skill");
  assertEqual(purchase.rottenGraft, "0", "Rotten Dead Letter payment");
  assertEqual(purchase.rottenHp, purchaseBefore.rottenHp, "Rotten purchase carried HP");
  assertEqual(purchase.rottenMarketStatus, "resolved", "Rotten purchase resolved market");
  assertEqual(purchase.rottenMarketChoice, "upgrade:dead-letter", "Rotten purchase choice");
  assertEqual(
    purchase.rottenMarketTraceEvent,
    "market:1:bailiffs-ramp:upgrade:dead-letter:spent-7",
    "Rotten purchase trace event",
  );
  assertEqual(
    purchase.rottenRouteHistory,
    "1:bailiffs-ramp:upgrade:dead-letter",
    "Rotten purchase route history",
  );
  assertEqual(purchase.rottenRewardDecisionCount, "1", "Rotten purchase decision count");
  assertEqual(purchase.rottenOfferIds, "", "Rotten purchase clears active offers");
  assertEqual(purchase.rottenCombatObjectCount, "0", "Rotten purchase stale combat objects");
  assertEqual(purchase.canvasCount, 1, "Rotten purchase canvas count");
  assertEqual(purchase.rottenRewardFeedbackReason, "accepted", "Rotten purchase feedback reason");
  if (purchase.rottenTraceDigest === purchaseBefore.rottenTraceDigest) {
    throw new Error("Rotten purchase trace digest did not change");
  }
  await assertNoMissingTextureGreen(purchasePage, "Rotten Run Stage 2 purchase docket");
  await captureEvidence(purchasePage, "rotten-market-purchase-accepted-1366x768.png");
  await captureEvidence(purchasePage, "rotten-stage-two-docket-1366x768.png");
  const purchaseTruth = pickDataset(purchase, rottenMarketTruthKeys());
  await purchasePage.key("1");
  await new Promise((resolve) => setTimeout(resolve, 120));
  const repeatedPurchase = await purchasePage.dataset(rottenMarketTruthKeys());
  assertDeepEqual(repeatedPurchase, purchaseTruth, "Rotten resolved market repeat input no-op");
  await purchasePage.close();

  return {
    route: "Rotten Run real upgrade purchase key",
    purchaseArming,
    purchaseBefore,
    purchase,
    repeatedPurchase,
  };
}

async function smokeRottenMarketHeal(browser) {
  const healPage = await browser.open(
    "/?mode=rotten&seed=GAUNTLET-ALPHA&smokeAuto=1&smoke=rottenMarketHeal",
    { viewport: { width: 1920, height: 1080 } },
  );
  await healPage.waitForDataset("rottenPhase", "loadout");
  await installRottenMarketPhaseLatch(healPage);
  await installRottenHealDamageLatch(healPage);
  await selectRottenBuild(healPage, "3", "6", "2");
  await releaseRottenSelectionKeys(healPage);
  const healArming = await waitForOpenRottenMarket(healPage);
  const healDamage = await readRottenHealDamageLatch(healPage);
  const healBefore = await healPage.dataset(rottenMarketTruthKeys());
  const [healCurrent, healMax] = parseHealth(healBefore.rottenHp, "Rotten heal before HP");
  if (healCurrent >= healMax) {
    throw new Error(`Rotten heal path reached market undamaged: ${healBefore.rottenHp}`);
  }
  assertEqual(String(healDamage.damaged), "true", "Rotten heal real damage observation");
  assertEqual(healDamage.attackCountAtFirstDamage, "0", "Rotten heal attack count at first damage");
  assertEqual(healDamage.skillUseCountAtFirstDamage, "0", "Rotten heal skill count at first damage");
  assertEqual(healBefore.rottenHealAvailable, "true", "Rotten heal availability");
  await healPage.key("4");
  await healPage.waitForDataset("rottenStage", "2", 5_000);
  const heal = await healPage.dataset([
    ...rottenMarketTruthKeys(),
    "rottenRewardFeedback",
    "rottenRewardFeedbackReason",
  ]);
  const [healedCurrent, healedMax] = parseHealth(heal.rottenHp, "Rotten healed HP");
  const restored = Math.min(2, healMax - healCurrent);
  assertEqual(String(healedCurrent), String(healCurrent + restored), "Rotten heal current HP");
  assertEqual(String(healedMax), String(healMax), "Rotten heal max HP");
  assertEqual(heal.rottenGraft, String(Number(healBefore.rottenGraft) - 2), "Rotten heal payment");
  assertEqual(heal.rottenUpgrades, "", "Rotten heal owns no upgrade");
  assertEqual(heal.rottenMarketChoice, `heal:${restored}`, "Rotten heal choice");
  assertEqual(
    heal.rottenRouteHistory,
    `1:bailiffs-ramp:heal:${restored}`,
    "Rotten heal route history",
  );
  assertEqual(heal.rottenRewardDecisionCount, "1", "Rotten heal decision count");
  assertEqual(heal.rottenRewardFeedbackReason, "accepted", "Rotten heal feedback reason");
  assertEqual(heal.rottenCombatObjectCount, "0", "Rotten heal stale combat objects");
  await assertNoMissingTextureGreen(healPage, "Rotten Run Stage 2 heal docket");
  await captureEvidence(healPage, "rotten-market-heal-accepted-1920x1080.png");
  await healPage.close();

  return {
    route: "Rotten Run real damaged-health heal key",
    healDamage,
    healBefore,
    healArming,
    heal,
  };
}

async function smokeRottenMarketBank(browser) {
  const route = "/?mode=rotten&seed=GAUNTLET-ALPHA&smokeAuto=1&smoke=rottenMarket";
  const bankPage = await browser.open(route, { viewport: { width: 1366, height: 768 } });
  await bankPage.waitForDataset("rottenPhase", "loadout");
  await installRottenMarketPhaseLatch(bankPage);
  await selectRottenBuild(bankPage, "4", "7", "2");
  await releaseRottenSelectionKeys(bankPage);
  const bankArming = await waitForOpenRottenMarket(bankPage);
  const bankBefore = await bankPage.dataset(rottenMarketTruthKeys());
  await bankPage.key("5");
  await bankPage.waitForDataset("rottenStage", "2", 5_000);
  const bank = await bankPage.dataset([
    ...rottenMarketTruthKeys(),
    "rottenRewardFeedbackReason",
  ]);
  assertEqual(bank.rottenGraft, bankBefore.rottenGraft, "Rotten bank preserves purse");
  assertEqual(bank.rottenHp, bankBefore.rottenHp, "Rotten bank preserves HP");
  assertEqual(bank.rottenUpgrades, "", "Rotten bank owns no upgrade");
  assertEqual(bank.rottenMarketChoice, "bank", "Rotten bank choice");
  assertEqual(bank.rottenRouteHistory, "1:bailiffs-ramp:bank", "Rotten bank route history");
  assertEqual(bank.rottenRewardDecisionCount, "1", "Rotten bank decision count");
  assertEqual(bank.rottenRewardFeedbackReason, "accepted", "Rotten bank feedback reason");
  assertEqual(bank.rottenCombatObjectCount, "0", "Rotten bank stale combat objects");
  await bankPage.evaluate(
    "new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve(true))))",
  );
  await captureEvidence(bankPage, "rotten-market-bank-accepted-1366x768.png");
  await bankPage.close();

  return {
    route: "Rotten Run real bank key",
    bankBefore,
    bankArming,
    bank,
  };
}

async function smokeRottenMarketRejected(browser) {
  const poorPage = await browser.open(
    "/?mode=rotten&seed=GAUNTLET-ALPHA&smokeAuto=1&smoke=rottenMarketPoor",
    { viewport: { width: 1366, height: 768 } },
  );
  await poorPage.waitForDataset("rottenPhase", "loadout");
  await installRottenMarketPhaseLatch(poorPage);
  await selectRottenBuild(poorPage, "3", "6", "2");
  await releaseRottenSelectionKeys(poorPage);
  const poorArming = await waitForOpenRottenMarket(poorPage);
  const poorBefore = await poorPage.dataset(rottenMarketTruthKeys());
  assertEqual(poorBefore.rottenGraft, "4", "Rotten poor-market fixture purse");
  assertEqual(poorBefore.rottenOfferPrices, "7|5|5", "Rotten poor-market prices");
  await poorPage.key("1");
  await poorPage.waitForDataset("rottenRewardFeedbackReason", "unaffordable", 2_000);
  const unaffordable = await poorPage.dataset(rottenMarketTruthKeys());
  assertDeepEqual(unaffordable, poorBefore, "Rotten unaffordable purchase state no-op");
  await poorPage.key("6");
  await poorPage.waitForDataset("rottenRewardFeedbackReason", "invalid-input", 2_000);
  const invalid = await poorPage.dataset(rottenMarketTruthKeys());
  assertDeepEqual(invalid, poorBefore, "Rotten invalid input state no-op");
  await poorPage.evaluate(
    "new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve(true))))",
  );
  await captureEvidence(poorPage, "rotten-market-rejected-input-1366x768.png");
  const rejectedCaptureBefore = await poorPage.dataset([
    ...rottenMarketTruthKeys(),
    "rottenRewardFeedback",
    "rottenRewardFeedbackReason",
  ]);
  await captureEvidence(poorPage, "rotten-market-rejected-input-settled-1366x768.png");
  const rejectedCaptureAfter = await poorPage.dataset([
    ...rottenMarketTruthKeys(),
    "rottenRewardFeedback",
    "rottenRewardFeedbackReason",
  ]);
  assertDeepEqual(
    rejectedCaptureAfter,
    rejectedCaptureBefore,
    "Rotten rejected evidence double-capture state",
  );
  await poorPage.close();

  return {
    route: "Rotten Run real unaffordable and invalid no-op keys",
    poorBefore,
    poorArming,
    unaffordable,
    invalid,
    rejectedCaptureBefore,
    rejectedCaptureAfter,
  };
}

async function smokeRottenRunMarket(browser) {
  return {
    route: "Rotten Run real purchase/heal/bank/rejected market keys",
    purchase: await smokeRottenMarketPurchase(browser),
    heal: await smokeRottenMarketHeal(browser),
    bank: await smokeRottenMarketBank(browser),
    rejected: await smokeRottenMarketRejected(browser),
  };
}

function rottenMarketTruthKeys() {
  return [
    "rottenPhase",
    "rottenStage",
    "rottenRouteOptions",
    "rottenSelectedRoute",
    "rottenWeapon",
    "rottenSkill",
    "rottenUpgrades",
    "rottenGraft",
    "rottenHp",
    "rottenRouteHistory",
    "rottenMarketStatus",
    "rottenMarketStage",
    "rottenMarketRoute",
    "rottenMarketChoice",
    "rottenMarketTraceEvent",
    "rottenRewardDecisionCount",
    "rottenOfferIds",
    "rottenOfferPrices",
    "rottenHealAvailable",
    "rottenTraceDigest",
    "rottenWave",
    "rottenWavesCleared",
    "rottenSpawnHistory",
    "rottenLivingEnemies",
    "rottenCombatObjectCount",
  ];
}

async function installRottenMarketPhaseLatch(page) {
  await page.evaluate(`(() => {
    if (window.__FOXMAN_ROTTEN_MARKET_OBSERVATION__) return true;
    const observation = {
      consecutiveOpenFrames: 0,
      maxOpenFrames: 0,
      resolvedBeforeIntended: false,
      keyEvents: [],
    };
    window.__FOXMAN_ROTTEN_MARKET_OBSERVATION__ = observation;
    window.addEventListener("keydown", (event) => {
      const data = document.body.dataset;
      observation.keyEvents.push({
        key: event.key,
        phase: data.rottenPhase ?? "",
        marketStatus: data.rottenMarketStatus ?? "",
        decisionCount: data.rottenRewardDecisionCount ?? "",
      });
    });
    const sample = () => {
      const data = document.body.dataset;
      const open = data.rottenPhase === "reward-choice"
        && data.rottenMarketStatus === "open"
        && data.rottenRewardDecisionCount === "0";
      observation.consecutiveOpenFrames = open ? observation.consecutiveOpenFrames + 1 : 0;
      observation.maxOpenFrames = Math.max(
        observation.maxOpenFrames,
        observation.consecutiveOpenFrames,
      );
      if (data.rottenStage === "2" && data.rottenRewardDecisionCount === "1") {
        observation.resolvedBeforeIntended = true;
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
    return true;
  })()`);
}

async function readRottenMarketPhaseLatch(page) {
  return page.evaluate(`(() => {
    const observed = window.__FOXMAN_ROTTEN_MARKET_OBSERVATION__;
    return {
      consecutiveOpenFrames: observed?.consecutiveOpenFrames ?? 0,
      maxOpenFrames: observed?.maxOpenFrames ?? 0,
      resolvedBeforeIntended: observed?.resolvedBeforeIntended ?? false,
      keyEvents: [...(observed?.keyEvents ?? [])],
    };
  })()`);
}

async function installRottenHealDamageLatch(page) {
  await page.evaluate(`(() => {
    if (window.__FOXMAN_ROTTEN_HEAL_DAMAGE__) return true;
    const observation = {
      damaged: false,
      firstDamagedHp: "",
      attackCountAtFirstDamage: "",
      skillUseCountAtFirstDamage: "",
    };
    window.__FOXMAN_ROTTEN_HEAL_DAMAGE__ = observation;
    const sample = () => {
      const data = document.body.dataset;
      const [current, max] = String(data.rottenHp ?? "").split("/").map(Number);
      if (!observation.damaged && Number.isFinite(current) && Number.isFinite(max) && current < max) {
        observation.damaged = true;
        observation.firstDamagedHp = data.rottenHp ?? "";
        observation.attackCountAtFirstDamage = data.rottenAttackCount ?? "";
        observation.skillUseCountAtFirstDamage = data.rottenSkillUseCount ?? "";
      }
      if (data.rottenPhase !== "dead" && data.rottenStage !== "2") {
        requestAnimationFrame(sample);
      }
    };
    requestAnimationFrame(sample);
    return true;
  })()`);
}

async function readRottenHealDamageLatch(page) {
  return page.evaluate(`(() => ({
    ...window.__FOXMAN_ROTTEN_HEAL_DAMAGE__,
  }))()`);
}

async function releaseRottenSelectionKeys(page) {
  for (const key of ["1", "2", "3", "4", "5", "6", "7", "Enter"]) {
    await page.keyUp(key);
  }
  await page.evaluate("new Promise((resolve) => requestAnimationFrame(() => resolve(true)))");
}

async function waitForOpenRottenMarket(page, timeoutMs = 40_000) {
  const keys = [
    "rottenPhase",
    "rottenStage",
    "rottenMarketStatus",
    "rottenRewardDecisionCount",
    "rottenMarketChoice",
    "rottenWave",
    "rottenWavesCleared",
    "rottenHp",
    "rottenLivingEnemies",
    "rottenAttackCount",
    "rottenAttackHitCount",
    "rottenSkillUseCount",
    "rottenSkillHitCount",
    "rottenCombatObjectCount",
  ];
  const started = Date.now();
  let stableFrames = 0;
  let lastState;
  while (Date.now() - started < timeoutMs) {
    await page.evaluate("new Promise((resolve) => requestAnimationFrame(() => resolve(true)))");
    lastState = await page.dataset(keys);
    const open = lastState.rottenPhase === "reward-choice"
      && lastState.rottenStage === "1"
      && lastState.rottenMarketStatus === "open"
      && lastState.rottenRewardDecisionCount === "0"
      && lastState.rottenMarketChoice === "";
    stableFrames = open ? stableFrames + 1 : 0;
    if (stableFrames >= 2) {
      const observed = await readRottenMarketPhaseLatch(page);
      if (observed.resolvedBeforeIntended) {
        throw new Error(`Rotten market resolved before intended input: ${JSON.stringify(observed)}`);
      }
      const staleRewardKeys = observed.keyEvents.filter(({ phase }) => phase === "reward-choice");
      if (staleRewardKeys.length > 0) {
        throw new Error(`Rotten market received stale reward keys: ${JSON.stringify(staleRewardKeys)}`);
      }
      if (observed.maxOpenFrames < 2) {
        throw new Error(`Rotten market was not frame-stable: ${JSON.stringify(observed)}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 320));
      const armedState = await page.dataset(keys);
      const armedObservation = await readRottenMarketPhaseLatch(page);
      const armedRewardKeys = armedObservation.keyEvents.filter(({ phase }) => phase === "reward-choice");
      if (
        armedState.rottenPhase !== "reward-choice"
        || armedState.rottenMarketStatus !== "open"
        || armedState.rottenRewardDecisionCount !== "0"
        || armedObservation.resolvedBeforeIntended
        || armedRewardKeys.length > 0
      ) {
        throw new Error(
          `Rotten market did not remain armed before intended input: `
          + `${JSON.stringify({ armedState, armedObservation })}`,
        );
      }
      return { ...armedObservation, stableState: armedState };
    }
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  throw new Error(`Rotten market did not arm across two frames: ${JSON.stringify(lastState)}`);
}

function parseHealth(value, label) {
  const [current, max] = String(value).split("/").map(Number);
  if (!Number.isFinite(current) || !Number.isFinite(max)) {
    throw new Error(`${label}: invalid HP ${value}`);
  }
  return [current, max];
}

function pickDataset(state, keys) {
  return Object.fromEntries([...keys, "canvasCount"].map((key) => [key, state[key]]));
}

async function smokeRottenEnemyReacquisition(browser) {
  const page = await browser.open(
    "/?mode=rotten&seed=GAUNTLET-ALPHA&smoke=rottenReacquire",
    { viewport: { width: 1920, height: 1080 } },
  );
  await selectRottenBuild(page, "4", "6", "1");
  await page.waitForDataset("rottenSelectedRoute", "unfiled-alley");
  const started = Date.now();
  let runner;
  let maxFeetY = Number.NEGATIVE_INFINITY;
  let maxBodyBottom = Number.NEGATIVE_INFINITY;
  const reacquisitionDurations = [];

  while (Date.now() - started < 5_000) {
    const state = await page.dataset([
      "rottenPhase",
      "rottenEnemyGeometry",
      "rottenEnemyReacquisition",
      "rottenEnemyTell",
    ]);
    const geometry = parseRottenEnemyGeometry(state.rottenEnemyGeometry)
      .find((enemy) => enemy.role === "writ-runner" && enemy.alive);
    if (geometry) {
      maxFeetY = Math.max(maxFeetY, geometry.feetY);
      maxBodyBottom = Math.max(maxBodyBottom, geometry.bodyBottom);
      if (geometry.feetY > 587 || geometry.bodyBottom > 583) {
        throw new Error(
          `Rotten reacquiring writ-runner fell below floor: feet=${geometry.feetY}, `
          + `bodyBottom=${geometry.bodyBottom}`,
        );
      }
    }
    runner = parseRottenEnemyReacquisition(state.rottenEnemyReacquisition)
      .find((enemy) => enemy.role === "writ-runner" && enemy.alive);
    if (runner && runner.reacquisitionCount > reacquisitionDurations.length) {
      reacquisitionDurations.push(runner.lastReacquisitionMs);
    }
    if (runner?.reacquiring && runner.state !== "approach") {
      throw new Error(`Rotten offscreen writ-runner remained attack-eligible in ${runner.state}`);
    }
    if (runner?.reacquiring && state.rottenEnemyTell) {
      throw new Error(`Rotten offscreen writ-runner retained a tell: ${state.rottenEnemyTell}`);
    }
    if (runner?.reacquisitionCount >= 2 && runner.onscreen) {
      break;
    }
    if (state.rottenPhase !== "encounter") {
      throw new Error(`Rotten reacquisition left encounter early: ${state.rottenPhase}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 40));
  }

  if (!runner || runner.reacquisitionCount < 2 || !runner.onscreen) {
    throw new Error(`Rotten writ-runner did not reacquire both edges: ${JSON.stringify(runner)}`);
  }
  assertAtMostNumber(runner.lastReacquisitionMs, 750, "Rotten writ-runner reacquisition time");

  await page.holdKey("a", 420);
  await page.holdKey("d", 90);
  await new Promise((resolve) => setTimeout(resolve, 100));
  const beforeHit = await page.dataset(["rottenAttackCount", "rottenAttackHitCount"]);
  for (let index = 0; index < 10; index += 1) {
    await page.holdKey("j", 40);
    await new Promise((resolve) => setTimeout(resolve, 260));
    const hits = await page.dataset(["rottenAttackCount", "rottenAttackHitCount"]);
    if (Number(hits.rottenAttackHitCount) > Number(beforeHit.rottenAttackHitCount)) {
      const result = {
        reacquisitionCount: runner.reacquisitionCount,
        reacquisitionDurations,
        lastReacquisitionMs: runner.lastReacquisitionMs,
        maxFeetY,
        maxBodyBottom,
        attacksBefore: Number(beforeHit.rottenAttackCount),
        hitsBefore: Number(beforeHit.rottenAttackHitCount),
        attacksAfter: Number(hits.rottenAttackCount),
        hitsAfter: Number(hits.rottenAttackHitCount),
      };
      await captureEvidence(page, "rotten-enemy-reacquired-1920x1080.png");
      await page.close();
      return result;
    }
  }

  const failed = await page.dataset([
    "rottenAttackCount",
    "rottenAttackHitCount",
    "rottenEnemyStates",
    "rottenEnemyReacquisition",
  ]);
  await page.close();
  throw new Error(`Rotten Spitter could not hit reacquired writ-runner: ${JSON.stringify(failed)}`);
}

async function smokeRottenEnemyAnchoring(browser) {
  const cases = [
    {
      name: "bribe-line",
      seed: "CYCLE-4",
      routeKey: "1",
      routeId: "bribe-line",
      expectedRoles: ["bailiff", "clerk"],
      viewport: { width: 1366, height: 768 },
      evidence: "rotten-enemy-cycle-bribe-line-1366x768.png",
    },
    {
      name: "unfiled-alley",
      seed: "GAUNTLET-ALPHA",
      routeKey: "1",
      routeId: "unfiled-alley",
      expectedRoles: ["writ-runner"],
      viewport: { width: 1920, height: 1080 },
      evidence: "rotten-enemy-cycle-unfiled-alley-1920x1080.png",
    },
  ];
  const results = [];

  for (const testCase of cases) {
    const page = await browser.open(
      `/?mode=rotten&seed=${testCase.seed}&smoke=rottenEnemyCycle`,
      { viewport: testCase.viewport },
    );
    await selectRottenBuild(page, "3", "6", testCase.routeKey);
    await page.waitForDataset("rottenSelectedRoute", testCase.routeId);
    await installRottenObservationLatch(page);
    const traversed = Object.fromEntries(testCase.expectedRoles.map((role) => [role, new Set()]));
    let maxFeetY = Number.NEGATIVE_INFINITY;
    let maxBodyBottom = Number.NEGATIVE_INFINITY;
    let moving = true;
    const started = Date.now();
    await page.keyDown("d");

    try {
      while (Date.now() - started < 14_000) {
        if (moving && Date.now() - started >= 700) {
          await page.keyUp("d");
          moving = false;
        }
        const state = await page.dataset([
          "rottenPhase",
          "rottenSelectedRoute",
          "rottenEnemyGeometry",
        ]);
        for (const enemy of parseRottenEnemyGeometry(state.rottenEnemyGeometry)) {
          if (!enemy.alive) {
            continue;
          }
          maxFeetY = Math.max(maxFeetY, enemy.feetY);
          maxBodyBottom = Math.max(maxBodyBottom, enemy.bodyBottom);
          if (enemy.feetY > 587 || enemy.bodyBottom > 583) {
            throw new Error(
              `Rotten ${testCase.name} ${enemy.role}:${enemy.state} fell below floor: `
              + `feet=${enemy.feetY}, bodyBottom=${enemy.bodyBottom}`,
            );
          }
          traversed[enemy.role]?.add(enemy.state);
        }
        const latched = await readRottenObservationLatch(page);
        for (const [role, states] of Object.entries(latched.enemyStates)) {
          for (const stateName of states) {
            traversed[role]?.add(stateName);
          }
        }
        const complete = testCase.expectedRoles.every((role) =>
          ["windup", "active", "recovery"].every((stateName) => traversed[role].has(stateName)));
        if (complete) {
          break;
        }
        if (state.rottenPhase === "dead") {
          throw new Error(`Rotten ${testCase.name} died before all enemy attack states were sampled`);
        }
        await new Promise((resolve) => setTimeout(resolve, 45));
      }
    } finally {
      if (moving) {
        await page.keyUp("d");
      }
    }

    for (const role of testCase.expectedRoles) {
      for (const stateName of ["windup", "active", "recovery"]) {
        if (!traversed[role].has(stateName)) {
          throw new Error(
            `Rotten ${testCase.name} ${role} did not traverse ${stateName}: ${[...traversed[role]].join(",")}`,
          );
        }
      }
    }
    await captureEvidence(page, testCase.evidence);
    await page.close();
    results.push({
      route: testCase.routeId,
      viewport: testCase.viewport,
      traversed: Object.fromEntries(
        Object.entries(traversed).map(([role, states]) => [role, [...states]]),
      ),
      maxFeetY,
      maxBodyBottom,
    });
  }

  return results;
}

function parseRottenEnemyGeometry(value) {
  if (!value) {
    return [];
  }
  return String(value).split("|").map((entry) => {
    const [role, state, alive, feetY, bodyBottom] = entry.split(":");
    return {
      role,
      state,
      alive: alive === "1",
      feetY: Number(feetY),
      bodyBottom: Number(bodyBottom),
    };
  });
}

function parseRottenEnemyReacquisition(value) {
  if (!value) {
    return [];
  }
  return String(value).split("|").map((entry) => {
    const [
      role,
      state,
      alive,
      onscreen,
      reacquiring,
      reacquisitionCount,
      lastReacquisitionMs,
      offscreenForMs,
      bodyLeft,
      bodyRight,
      velocityX,
      reacquisitionDirection,
    ] = entry.split(":");
    return {
      role,
      state,
      alive: alive === "1",
      onscreen: onscreen === "1",
      reacquiring: reacquiring === "1",
      reacquisitionCount: Number(reacquisitionCount),
      lastReacquisitionMs: Number(lastReacquisitionMs),
      offscreenForMs: Number(offscreenForMs),
      bodyLeft: Number(bodyLeft),
      bodyRight: Number(bodyRight),
      velocityX: Number(velocityX),
      reacquisitionDirection: Number(reacquisitionDirection),
    };
  });
}

async function selectRottenBuild(page, weaponKey, skillKey, routeKey) {
  await page.send("Page.bringToFront");
  await page.send("Emulation.setFocusEmulationEnabled", { enabled: true });
  await page.waitForDataset("rottenPhase", "loadout");
  await page.key(weaponKey);
  await new Promise((resolve) => setTimeout(resolve, 50));
  await page.key(skillKey);
  await new Promise((resolve) => setTimeout(resolve, 50));
  await page.key("Enter");
  await page.waitForDataset("rottenPhase", "route-choice");
  await page.key(routeKey);
  await page.waitForDataset("rottenPhase", "encounter");
}

async function installRottenObservationLatch(page) {
  await page.evaluate(`(() => {
    if (window.__FOXMAN_ROTTEN_OBSERVATION__) return true;
    const observation = { enemyTell: "", enemyStates: {} };
    window.__FOXMAN_ROTTEN_OBSERVATION__ = observation;

    const sample = () => {
      const data = document.body.dataset;
      const tell = data.rottenEnemyTell ?? "";
      if (!observation.enemyTell && tell.includes(":windup:")) {
        observation.enemyTell = tell;
      }
      for (const entry of String(data.rottenEnemyStates ?? "").split("|")) {
        if (!entry) continue;
        const [role, state] = entry.split(":");
        observation.enemyStates[role] ??= [];
        if (!observation.enemyStates[role].includes(state)) {
          observation.enemyStates[role].push(state);
        }
      }
      if (data.rottenPhase === "encounter") requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
    return true;
  })()`);
}

async function readRottenObservationLatch(page) {
  return page.evaluate(`(() => {
    const observed = window.__FOXMAN_ROTTEN_OBSERVATION__ ?? { enemyTell: "", enemyStates: {} };
    return {
      enemyTell: observed.enemyTell,
      enemyStates: Object.fromEntries(
        Object.entries(observed.enemyStates).map(([role, states]) => [role, [...states]]),
      ),
    };
  })()`);
}

async function waitForTwoAnimationFramesOfTruth(page, keys, predicate, timeoutMs) {
  let stableFrames = 0;
  let latest;
  await waitFor(async () => {
    await page.evaluate("new Promise((resolve) => requestAnimationFrame(() => resolve(true)))");
    latest = await page.dataset(keys);
    stableFrames = predicate(latest) ? stableFrames + 1 : 0;
    return stableFrames >= 2;
  }, timeoutMs, 20);
  return latest;
}

async function smokeRottenRunRetry(browser) {
  const retryPage = await browser.open("/?mode=rotten&seed=GAUNTLET-ALPHA", {
    viewport: { width: 1366, height: 768 },
  });
  await retryPage.send("Page.bringToFront");
  await retryPage.send("Emulation.setFocusEmulationEnabled", { enabled: true });
  await retryPage.waitForDataset("rottenPhase", "loadout");
  await retryPage.key("3");
  await retryPage.waitForDataset("rottenWeapon", "tax-pike");
  await new Promise((resolve) => setTimeout(resolve, 50));
  await retryPage.key("6");
  await retryPage.waitForDataset("rottenSkill", "seized-stamp");
  await new Promise((resolve) => setTimeout(resolve, 50));
  await retryPage.send("Page.bringToFront");
  await retryPage.key("Enter");
  await retryPage.waitForDataset("rottenPhase", "route-choice");
  await retryPage.key("2");
  await retryPage.waitForDataset("rottenPhase", "encounter");
  await retryPage.holdKey("d", 2_600);
  await retryPage.waitForDataset("rottenPhase", "dead", 25_000);
  await new Promise((resolve) => setTimeout(resolve, 50));
  const dead = await retryPage.dataset([
    "rottenPhase",
    "rottenSeed",
    "rottenPlanId",
    "rottenHp",
    "rottenCombatObjectCount",
  ]);
  assertEqual(dead.rottenHp, "0/6", "Rotten explicit death health");
  if (Number(dead.rottenCombatObjectCount) <= 0) {
    throw new Error(`Rotten death did not retain owned encounter objects before retry: ${dead.rottenCombatObjectCount}`);
  }
  await retryPage.key("r");
  const retryKeys = [
    "rottenPhase",
    "rottenSeed",
    "rottenPlanId",
    "rottenWeapon",
    "rottenSkill",
    "rottenWave",
    "rottenWavesCleared",
    "rottenGraft",
    "rottenUpgrades",
    "rottenRouteHistory",
    "rottenMarketStatus",
    "rottenMarketChoice",
    "rottenRewardDecisionCount",
    "rottenOfferIds",
    "rottenHp",
    "rottenCombatObjectCount",
  ];
  const retried = await waitForTwoAnimationFramesOfTruth(
    retryPage,
    retryKeys,
    (state) => state.rottenPhase === "loadout"
      && state.rottenWeapon === ""
      && state.rottenSkill === ""
      && state.rottenWave === "0"
      && state.rottenWavesCleared === "0"
      && state.rottenGraft === "3"
      && state.rottenUpgrades === ""
      && state.rottenRouteHistory === ""
      && state.rottenMarketStatus === ""
      && state.rottenMarketChoice === ""
      && state.rottenRewardDecisionCount === "0"
      && state.rottenOfferIds === ""
      && state.rottenHp === ""
      && state.rottenCombatObjectCount === "0",
    8_000,
  );
  assertEqual(retried.rottenSeed, dead.rottenSeed, "Rotten retry seed");
  assertEqual(retried.rottenPlanId, dead.rottenPlanId, "Rotten retry plan");
  assertEqual(retried.rottenWeapon, "", "Rotten retry weapon reset");
  assertEqual(retried.rottenSkill, "", "Rotten retry skill reset");
  assertEqual(retried.rottenWave, "0", "Rotten retry wave reset");
  assertEqual(retried.rottenWavesCleared, "0", "Rotten retry clear count reset");
  assertEqual(retried.rottenGraft, "3", "Rotten retry graft reset");
  assertEqual(retried.rottenUpgrades, "", "Rotten retry upgrades reset");
  assertEqual(retried.rottenRouteHistory, "", "Rotten retry route history reset");
  assertEqual(retried.rottenMarketStatus, "", "Rotten retry market status reset");
  assertEqual(retried.rottenMarketChoice, "", "Rotten retry market choice reset");
  assertEqual(retried.rottenRewardDecisionCount, "0", "Rotten retry market decision count reset");
  assertEqual(retried.rottenOfferIds, "", "Rotten retry offers reset");
  assertEqual(retried.rottenHp, "", "Rotten retry HP modifiers reset");
  assertEqual(retried.rottenCombatObjectCount, "0", "Rotten retry stale combat objects");
  await captureEvidence(retryPage, "rotten-encounter-retry-clean-1366x768.png");
  await retryPage.key("r");
  await new Promise((resolve) => setTimeout(resolve, 150));
  assertEqual(
    (await retryPage.dataset(["rottenPhase"])).rottenPhase,
    "loadout",
    "Rotten post-retry R is inert outside dead state",
  );
  await retryPage.close();

  return { route: "Rotten Run death -> same-seed R retry", dead, retried };
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

async function smokePlatformRoute(browser) {
  const page = await browser.open("/?smokeAuto=1&smoke=platforms");
  await page.waitForDataset("platformRouteComplete", "true", 9000);
  await assertNoMissingTextureGreen(page, "platform traversal route");
  const state = await page.dataset([
    "scene",
    "playerX",
    "playerY",
    "playerGrounded",
    "platformRouteComplete",
    "secondaryPickupCollected",
    "currentWeapon",
  ]);
  assertEqual(state.scene, "RunScene", "platform route scene");
  assertEqual(state.platformRouteComplete, "true", "platform route completion");
  assertEqual(state.currentWeapon, "Receipt Spitter", "platform route upper pickup");
  await page.close();

  return { route: "/?smokeAuto=1&smoke=platforms", state };
}

async function smokeDashRoute(browser) {
  const page = await browser.open("/?smokeAuto=1&smoke=dash");
  await page.waitForDataset("scene", "RunScene");
  await page.evaluate(`(() => {
    const observation = {
      active: true,
      samples: 0,
      peakAbsoluteVelocityX: 0,
      peakVelocityX: 0,
      peakPlayerState: "",
      peakDashCount: "",
      peakDashTrailCount: "",
      peakDashCueCount: "",
    };
    window.__FOXMAN_DASH_OBSERVATION__ = observation;
    const sample = () => {
      if (!observation.active) return;
      const dataset = document.body?.dataset;
      const velocityX = Number(dataset?.playerVelocityX);
      if (Number.isFinite(velocityX)) {
        observation.samples += 1;
        const absoluteVelocityX = Math.abs(velocityX);
        if (absoluteVelocityX > observation.peakAbsoluteVelocityX) {
          observation.peakAbsoluteVelocityX = absoluteVelocityX;
          observation.peakVelocityX = velocityX;
          observation.peakPlayerState = dataset.playerState ?? "";
          observation.peakDashCount = dataset.playerDashCount ?? "";
          observation.peakDashTrailCount = dataset.playerDashTrailCount ?? "";
          observation.peakDashCueCount = dataset.playerDashCueCount ?? "";
        }
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
    return true;
  })()`);
  await page.waitForDataset("playerDashCount", "1", 5000);
  let waitResolved;
  await waitFor(async () => {
    const observation = await page.evaluate("window.__FOXMAN_DASH_OBSERVATION__");
    const feedback = await page.dataset([
      "playerX",
      "playerDashCount",
      "playerDashTrailCount",
      "playerDashCueCount",
    ]);
    const resolved = Number(observation.peakAbsoluteVelocityX) >= 500
      && Number(feedback.playerX) >= 260
      && feedback.playerDashCount === "1"
      && Number(feedback.playerDashTrailCount) >= 3
      && feedback.playerDashCueCount === "1";
    if (resolved) {
      waitResolved = {
        playerX: feedback.playerX,
        peakAbsoluteVelocityX: observation.peakAbsoluteVelocityX,
        playerDashCount: feedback.playerDashCount,
        playerDashTrailCount: feedback.playerDashTrailCount,
        playerDashCueCount: feedback.playerDashCueCount,
      };
    }
    return resolved;
  }, 5000, 16);
  const state = await page.dataset([
    "scene",
    "playerState",
    "playerX",
    "playerVelocityX",
    "playerDashCount",
    "playerDashReady",
    "playerDashTrailCount",
    "playerDashCueCount",
  ]);
  const observation = await page.evaluate(`(() => {
    const observed = window.__FOXMAN_DASH_OBSERVATION__;
    observed.active = false;
    return { ...observed };
  })()`);
  assertEqual(state.scene, "RunScene", "dash route scene");
  assertEqual(state.playerDashCount, "1", "dash route count");
  assertAtLeastNumber(state.playerX, 260, "dash route movement");
  assertAtLeastNumber(observation.peakAbsoluteVelocityX, 500, "dash route peak burst speed");
  assertAtLeastNumber(state.playerDashTrailCount, 3, "dash route trail images");
  assertEqual(state.playerDashCueCount, "1", "dash route audio cue count");
  await captureEvidence(page, "dash-feedback.png");
  await page.close();

  return { route: "/?smokeAuto=1&smoke=dash", waitResolved, state, observation };
}

async function smokeSumpWarrens(browser) {
  const page = await browser.open("/?smokeAuto=1&smoke=sump");
  await page.waitForDataset("sumpComplete", "true", 18000);
  await assertNoMissingTextureGreen(page, "sump warrens");
  const state = await page.dataset([
    "scene",
    "sumpLivingEnemies",
    "sumpComplete",
    "currentWeapon",
    "playerAlive",
    "playerHealth",
    "kills",
    "progressUnlocks",
    "hudRouteText",
    "hudTargetText",
    "hitFeedbackCount",
    "hitFeedbackActiveCount",
  ]);
  assertEqual(state.scene, "SumpWarrensScene", "sump scene");
  assertEqual(state.sumpLivingEnemies, "0", "sump living enemies");
  assertEqual(state.sumpComplete, "true", "sump complete");
  assertEqual(state.currentWeapon, "Tax Pike", "sump weapon");
  assertEqual(state.playerAlive, "true", "sump player alive");
  assertAtLeastNumber(state.playerHealth, 1, "sump player survival");
  assertAtLeastNumber(state.kills, 3, "sump kills");
  assertAtLeastNumber(state.hitFeedbackCount, 3, "sump hit feedback");
  if (!String(state.progressUnlocks).includes("act2_sump_warrens_cleared")) {
    throw new Error("sump route did not persist act2_sump_warrens_cleared");
  }
  if (!String(state.hudRouteText).includes("sump cleared")) {
    throw new Error("sump route HUD did not show cleared route state");
  }
  await captureEvidence(page, "sump-complete.png");
  await page.close();

  return { route: "/?smokeAuto=1&smoke=sump", state };
}

async function smokeSumpDeathRestart(browser) {
  const page = await browser.open("/?smokeAuto=1&smoke=sumpDeath");
  await page.waitForDataset("deathBanner", "true", 15000);
  const dead = await page.dataset([
    "scene",
    "playerAlive",
    "playerHealth",
    "playerMaxHealth",
    "deathBanner",
    "deaths",
    "progressDeaths",
    "sumpLivingEnemies",
    "sumpComplete",
    "sumpGuardHealth",
    "sumpClerkHealth",
    "sumpEliteHealth",
    "kills",
  ]);
  assertEqual(dead.scene, "SumpWarrensScene", "sump death scene");
  assertEqual(dead.playerAlive, "false", "sump death player death");
  assertEqual(dead.playerHealth, "0", "sump death player health");
  assertEqual(dead.playerMaxHealth, "6", "sump death max health");
  assertEqual(dead.deathBanner, "true", "sump death banner");
  assertEqual(dead.deaths, "1", "sump death local count");
  assertEqual(dead.sumpLivingEnemies, "3", "sump death leaves encounter active");
  assertEqual(dead.sumpComplete, "false", "sump death does not complete Act 2");
  assertEqual(dead.kills, "0", "sump death records no false kills");
  assertAtLeastNumber(dead.progressDeaths, 1, "sump death persisted progress death");
  await captureEvidence(page, "sump-death.png");

  const restartMethod = process.env.FOXMAN_SMOKE_ONLY === "sumpDeath"
    ? "keyboard-r"
    : "deterministic-restart-hook";
  if (restartMethod === "keyboard-r") {
    await page.send("Page.bringToFront");
    await page.key("r");
  } else {
    await page.evaluate("window.__FOXMAN_RESTART_SUMP__()");
  }
  await page.waitForDataset("sumpRestartCount", "1", 5000);
  await page.waitForDataset("deathBanner", "false", 5000);
  const restarted = await page.dataset([
    "scene",
    "playerAlive",
    "playerHealth",
    "playerMaxHealth",
    "playerDashCount",
    "playerDashTrailCount",
    "playerDashCueCount",
    "deathBanner",
    "sumpRestartCount",
    "sumpLivingEnemies",
    "sumpComplete",
    "sumpGuardHealth",
    "sumpGuardAlive",
    "sumpClerkHealth",
    "sumpClerkAlive",
    "sumpEliteHealth",
    "sumpEliteAlive",
    "hitFeedbackCount",
    "hitFeedbackActiveCount",
    "kills",
    "progressDeaths",
  ]);
  assertEqual(restarted.scene, "SumpWarrensScene", "sump restart scene");
  assertEqual(restarted.playerAlive, "true", "sump restart player alive");
  assertEqual(restarted.playerHealth, "6", "sump restart restores health");
  assertEqual(restarted.playerMaxHealth, "6", "sump restart keeps max health");
  assertEqual(restarted.playerDashCount, "0", "sump restart clears dash state");
  assertEqual(restarted.playerDashTrailCount, "0", "sump restart clears dash trails");
  assertEqual(restarted.playerDashCueCount, "0", "sump restart clears dash cue state");
  assertEqual(restarted.deathBanner, "false", "sump restart hides death UI");
  assertEqual(restarted.sumpLivingEnemies, "3", "sump restart restores all enemies");
  assertEqual(restarted.sumpComplete, "false", "sump restart relocks completion");
  assertEqual(restarted.sumpGuardHealth, "3", "sump restart restores guard health");
  assertEqual(restarted.sumpGuardAlive, "true", "sump restart restores guard actor");
  assertEqual(restarted.sumpClerkHealth, "2", "sump restart restores clerk health");
  assertEqual(restarted.sumpClerkAlive, "true", "sump restart restores clerk actor");
  assertEqual(restarted.sumpEliteHealth, "4", "sump restart restores elite health");
  assertEqual(restarted.sumpEliteAlive, "true", "sump restart restores elite actor");
  assertEqual(restarted.hitFeedbackCount, "0", "sump restart clears hit feedback state");
  assertEqual(restarted.hitFeedbackActiveCount, "0", "sump restart removes active hit VFX");
  assertEqual(restarted.kills, "0", "sump restart clears local kills");
  assertEqual(restarted.progressDeaths, dead.progressDeaths, "sump restart does not duplicate death");
  await captureEvidence(page, "sump-restart.png");
  await page.close();

  return { route: "/?smokeAuto=1&smoke=sumpDeath -> restart", restartMethod, dead, restarted };
}

async function smokeMobileViewport(browser) {
  const page = await browser.open("/", { viewport: { width: 390, height: 844 } });
  await page.waitForDataset("scene", "TitleScene");
  const titleViewport = await page.evaluate(`(() => {
    const canvas = document.querySelector("canvas");
    const rect = canvas?.getBoundingClientRect();
    return {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      canvasWidth: rect?.width ?? 0,
      canvasHeight: rect?.height ?? 0,
      canvasLeft: rect?.left ?? -1,
      canvasRight: rect?.right ?? 9999,
      canvasTop: rect?.top ?? -1,
      canvasBottom: rect?.bottom ?? 9999,
    };
  })()`);
  assertEqual(String(titleViewport.innerWidth), "390", "mobile viewport width");
  assertAtLeastNumber(titleViewport.canvasWidth, 389, "mobile canvas width");
  assertAtMostNumber(titleViewport.canvasRight, 390.5, "mobile canvas right edge");
  assertAtMostNumber(titleViewport.canvasBottom, 844.5, "mobile canvas bottom edge");
  assertAtMostNumber(titleViewport.scrollWidth, 390, "mobile horizontal overflow");

  await page.key("Enter");
  await page.waitForDataset("scene", "RunScene");
  const state = await page.dataset(["scene", "playerAlive", "hudWeaponText"]);
  assertEqual(state.scene, "RunScene", "mobile start control reaches game");
  assertEqual(state.playerAlive, "true", "mobile viewport player alive");
  if (!String(state.hudWeaponText).includes("Rusty Knife")) {
    throw new Error("mobile viewport HUD weapon text was not reachable");
  }
  await captureEvidence(page, "mobile-390-opening.png");
  await page.close();

  return { route: "/ at 390x844 -> Enter", titleViewport, state };
}

async function captureEvidence(page, fileName) {
  if (!evidenceDir) {
    return;
  }

  mkdirSync(evidenceDir, { recursive: true });
  const screenshot = await page.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
  });
  writeFileSync(join(evidenceDir, fileName), Buffer.from(screenshot.data, "base64"));
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
  assertEqual(state.weaponReach, "365", "shop mutation pike reach");

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
  assertEqual(state.weaponReach, "365", "pike reach reward");

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
  assertEqual(state.weaponReach, "310", "audit shield leaves pike reach unchanged");

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
  assertEqual(state.weaponReach, "365", "grudge mutation keeps pike reach reward");
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
  assertEqual(restarted.weaponReach, "310", "second restart keeps audit shield weapon reach");

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
    "v1SliceComplete",
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
    "v1SliceComplete",
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
  assertEqual(state.weaponReach, "365", "full slice reward reach");
  assertEqual(state.bossAlive, "false", "full slice boss defeated");
  assertEqual(state.bossVariant, "tollBaron", "full slice boss variant");
  assertEqual(state.bossComplete, "true", "full slice boss complete");
  assertEqual(state.v1SliceComplete, "true", "full slice V1 clear prompt");

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
    "v1SliceComplete",
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
  assertEqual(state.weaponReach, "365", "skill boss pike reach");
  assertEqual(state.weaponDamage, "2", "skill boss pike damage");
  assertEqual(state.bossAlive, "false", "skill boss defeated");
  assertEqual(state.bossVariant, "tollBaron", "skill boss variant");
  assertEqual(state.bossComplete, "true", "skill boss complete");
  assertEqual(state.v1SliceComplete, "true", "skill boss V1 clear prompt");

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
    "v1SliceComplete",
    "progressUnlocks",
    "hitFeedbackCount",
  ]);
  assertEqual(state.scene, "MiniBossScene", "mini-boss scene");
  assertEqual(state.currentWeapon, "Butcher Saber", "mini-boss weapon");
  assertEqual(state.bossAlive, "false", "mini-boss death");
  assertEqual(state.bossVariant, "tollBaron", "mini-boss variant");
  assertEqual(state.v1SliceComplete, "true", "mini-boss V1 clear prompt");

  if (Number(state.bossSpecialCount) < 1) {
    throw new Error("mini-boss did not perform toll stamp special");
  }

  assertAtLeastNumber(state.hitFeedbackCount, 3, "mini-boss hit feedback");

  if (!String(state.progressUnlocks).includes("toll_baron_humiliated")) {
    throw new Error("mini-boss did not persist toll_baron_humiliated unlock");
  }

  await page.key("Enter");
  await page.waitForDataset("scene", "SumpWarrensScene", 5000);
  const after = await page.dataset([
    "scene",
    "currentWeapon",
    "sumpLivingEnemies",
    "progressUnlocks",
    "hudRouteText",
    "hudTargetText",
  ]);
  assertEqual(after.scene, "SumpWarrensScene", "mini-boss completion advances to Act 2");
  assertEqual(after.currentWeapon, "Tax Pike", "Act 2 starting weapon");
  assertEqual(after.sumpLivingEnemies, "3", "Act 2 starts with its encounter intact");

  for (const unlock of ["act1_cleared", "act2_sump_warrens_found"]) {
    if (!String(after.progressUnlocks).includes(unlock)) {
      throw new Error(`mini-boss handoff did not persist ${unlock}`);
    }
  }

  await page.close();
  return { route: "/?smokeAuto=1&smoke=boss -> Enter -> Act 2", state, after };
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

  async open(path, options = {}) {
    const url = new URL(path, baseUrl).toString();
    const initialUrl = options.viewport ? "about:blank" : url;
    const response = await fetch(
      `http://127.0.0.1:${this.port}/json/new?${encodeURIComponent(initialUrl)}`,
      { method: "PUT" },
    );

    if (!response.ok) {
      throw new Error(`Failed to open ${url}: ${response.status} ${response.statusText}`);
    }

    const target = await response.json();
    const page = new CdpPage(target.webSocketDebuggerUrl, target.id);
    await page.ready();
    if (options.viewport) {
      await page.send("Emulation.setDeviceMetricsOverride", {
        ...options.viewport,
        deviceScaleFactor: 1,
        mobile: true,
      });
      await page.send("Page.navigate", { url });
    }
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
      const details = message.params.exceptionDetails;
      this.errors.push(details.exception?.description ?? details.text);
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
    const event = {
      key: eventKey,
      code,
      windowsVirtualKeyCode: virtualKeyCode,
    };

    await this.send("Input.dispatchKeyEvent", {
      ...event,
      type: type === "keyDown" ? "rawKeyDown" : type,
    });
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

function assertDeepEqual(actual, expected, label) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    throw new Error(`${label}: expected ${expectedJson}, got ${actualJson}`);
  }
}

function assertAtLeastNumber(actual, expected, label) {
  const value = Number(actual);
  if (!Number.isFinite(value) || value < expected) {
    throw new Error(`${label}: expected at least ${expected}, got ${actual}`);
  }
}

function assertAtMostNumber(actual, expected, label) {
  const value = Number(actual);
  if (!Number.isFinite(value) || value > expected) {
    throw new Error(`${label}: expected at most ${expected}, got ${actual}`);
  }
}

try {
  await ensureServer();
  const browser = await launchChrome();

  const results = [];
  if (process.env.FOXMAN_SMOKE_ONLY === "sumpDeath") {
    results.push(await smokeSumpDeathRestart(browser));
  } else if (process.env.FOXMAN_SMOKE_ONLY === "dash") {
    results.push(await smokeDashRoute(browser));
  } else if (process.env.FOXMAN_SMOKE_ONLY === "rottenContract") {
    results.push(await smokeRottenRunContract(browser));
  } else if (process.env.FOXMAN_SMOKE_ONLY === "rottenEnemyCycle") {
    results.push({
      route: "Rotten enemy anchored state cycles",
      cases: await smokeRottenEnemyAnchoring(browser),
      reacquisition: await smokeRottenEnemyReacquisition(browser),
    });
  } else if (process.env.FOXMAN_SMOKE_ONLY === "rottenEncounter") {
    results.push(await smokeRottenRunRetry(browser));
    results.push(await smokeRottenRunEncounter(browser));
  } else if (process.env.FOXMAN_SMOKE_ONLY === "rottenMarketPurchase") {
    results.push(await smokeRottenMarketPurchase(browser));
  } else if (process.env.FOXMAN_SMOKE_ONLY === "rottenMarketHeal") {
    results.push(await smokeRottenMarketHeal(browser));
  } else if (process.env.FOXMAN_SMOKE_ONLY === "rottenMarketBank") {
    results.push(await smokeRottenMarketBank(browser));
  } else if (process.env.FOXMAN_SMOKE_ONLY === "rottenMarketPoor") {
    results.push(await smokeRottenMarketRejected(browser));
  } else if (process.env.FOXMAN_SMOKE_ONLY === "rottenMarket") {
    results.push(await smokeRottenRunMarket(browser));
  } else {
    results.push(await smokeRottenRunRetry(browser));
    results.push(await smokeTitlePause(browser));
    results.push(await smokeManualOpeningRoute(browser));
    results.push(await smokePlatformRoute(browser));
    results.push(await smokeDashRoute(browser));
    results.push(await smokeSumpWarrens(browser));
    results.push(await smokeSumpDeathRestart(browser));
    results.push(await smokeMobileViewport(browser));
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
    results.push(await smokeRottenRunContract(browser));
    results.push(await smokeRottenRunEncounter(browser));
    results.push(await smokeRottenRunMarket(browser));
  }

  const payload = { ok: true, results };
  if (evidenceDir) {
    mkdirSync(evidenceDir, { recursive: true });
    const resultFile = process.env.FOXMAN_SMOKE_ONLY
      ? `browser-smoke-${process.env.FOXMAN_SMOKE_ONLY}-results.json`
      : "browser-smoke-results.json";
    writeFileSync(
      join(evidenceDir, resultFile),
      `${JSON.stringify(payload, null, 2)}\n`,
    );
  }
  console.log(JSON.stringify(payload, null, 2));
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

process.exit(0);
