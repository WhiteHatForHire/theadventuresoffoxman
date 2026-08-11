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
let browser;
const smokeStartedAt = Date.now();
const progressEvents = [];
const cdpSendTimeoutMs = positiveIntegerEnv("FOXMAN_CDP_TIMEOUT_MS", 12_000);
const cdpNavigationTimeoutMs = positiveIntegerEnv("FOXMAN_CDP_NAVIGATION_TIMEOUT_MS", 15_000);
const cdpScreenshotTimeoutMs = positiveIntegerEnv("FOXMAN_CDP_SCREENSHOT_TIMEOUT_MS", 15_000);
const cdpCloseTimeoutMs = positiveIntegerEnv("FOXMAN_CDP_CLOSE_TIMEOUT_MS", 5_000);
const browserHttpTimeoutMs = positiveIntegerEnv("FOXMAN_BROWSER_HTTP_TIMEOUT_MS", 5_000);

function positiveIntegerEnv(name, fallback) {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function recordProgress(kind, details = {}) {
  const event = {
    elapsedMs: Date.now() - smokeStartedAt,
    kind,
    ...details,
  };
  progressEvents.push(event);
  console.error("[smoke-progress] " + JSON.stringify(event));
  return event;
}

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

async function smokeRottenSmokeIsolation(browser) {
  const route = "/?mode=rotten&seed=GAUNTLET-ALPHA&smoke=rottenEncounter";
  const page = await browser.open(route, { viewport: { width: 1366, height: 768 } });
  await page.send("Page.bringToFront");
  await page.send("Emulation.setFocusEmulationEnabled", { enabled: true });
  await page.waitForDataset("rottenPhase", "loadout");
  await page.evaluate(`(() => {
    const observation = { keyEvents: [] };
    window.__FOXMAN_ROTTEN_ISOLATION_OBSERVATION__ = observation;
    window.addEventListener("keydown", (event) => {
      const data = document.body.dataset;
      observation.keyEvents.push({
        key: event.key,
        phase: data.rottenPhase ?? "",
        weapon: data.rottenWeapon ?? "",
        skill: data.rottenSkill ?? "",
        route: data.rottenSelectedRoute ?? "",
      });
    });
    return true;
  })()`);

  const initial = await page.dataset([
    "rottenPhase",
    "rottenWeapon",
    "rottenSkill",
    "rottenSelectedRoute",
    "rottenHp",
    "rottenAttackCount",
    "rottenAttackHitCount",
    "rottenSkillUseCount",
    "rottenSkillHitCount",
    "rottenTraceDigest",
  ]);

  const transitionKeys = [
    "rottenPhase",
    "rottenWeapon",
    "rottenSkill",
    "rottenSelectedRoute",
    "rottenTraceDigest",
  ];
  const transitionLedger = [];
  const pressAndRecordTransition = async (key, waitForTransition) => {
    const before = await page.dataset(transitionKeys);
    await page.key(key);
    await waitForTransition();
    const after = await page.dataset(transitionKeys);
    transitionLedger.push({ key, before, after });
  };

  await pressAndRecordTransition("3", () => page.waitForDataset("rottenWeapon", "tax-pike"));
  await pressAndRecordTransition("6", () => page.waitForDataset("rottenSkill", "seized-stamp"));
  await pressAndRecordTransition("Enter", () => page.waitForDataset("rottenPhase", "route-choice"));
  await pressAndRecordTransition("2", async () => {
    await page.waitForDataset("rottenPhase", "encounter");
    await page.waitForDataset("rottenSelectedRoute", "bailiffs-ramp");
  });

  const telemetryKeys = [
    "rottenPhase",
    "rottenWeapon",
    "rottenSkill",
    "rottenSelectedRoute",
    "rottenHp",
    "rottenLivingEnemies",
    "rottenAttackCount",
    "rottenAttackHitCount",
    "rottenSkillUseCount",
    "rottenSkillHitCount",
    "rottenTraceDigest",
    "rottenCombatObjectCount",
  ];
  const samples = [];
  const observedAt = Date.now();
  while (Date.now() - observedAt < 4_500) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    samples.push({
      observedMilliseconds: Date.now() - observedAt,
      ...await page.dataset(telemetryKeys),
    });
  }
  const state = samples.at(-1);
  const domInput = await page.evaluate(`(() => ({
    activeElement: document.activeElement?.tagName ?? "",
    keyEvents: [...(window.__FOXMAN_ROTTEN_ISOLATION_OBSERVATION__?.keyEvents ?? [])],
  }))()`);
  const maximumCounts = {
    weaponAttacks: Math.max(...samples.map(({ rottenAttackCount }) => Number(rottenAttackCount))),
    weaponHits: Math.max(...samples.map(({ rottenAttackHitCount }) => Number(rottenAttackHitCount))),
    skillUses: Math.max(...samples.map(({ rottenSkillUseCount }) => Number(rottenSkillUseCount))),
    skillHits: Math.max(...samples.map(({ rottenSkillHitCount }) => Number(rottenSkillHitCount))),
  };
  const evidence = {
    route,
    smokeAutoQueryValue: null,
    combatInputsAfterEncounterEntry: [],
    observationWindowMilliseconds: Date.now() - observedAt,
    initial,
    state,
    maximumCounts,
    domInput,
    transitionLedger,
    samples,
  };

  await captureEvidence(page, "rotten-smoke-isolation-1366x768.png");
  await page.close();

  assertEqual(initial.rottenPhase, "loadout", "Rotten isolation initial phase");
  assertEqual(state.rottenWeapon, "tax-pike", "Rotten isolation real-key weapon");
  assertEqual(state.rottenSkill, "seized-stamp", "Rotten isolation real-key skill");
  assertEqual(state.rottenSelectedRoute, "bailiffs-ramp", "Rotten isolation real-key route");
  assertDeepEqual(
    domInput.keyEvents.map(({ key }) => key),
    ["3", "6", "Enter", "2"],
    "Rotten isolation DOM key events",
  );
  assertDeepEqual(
    domInput.keyEvents.map(({ phase }) => phase),
    ["loadout", "loadout", "route-choice", "encounter"],
    "Rotten isolation DOM key phases",
  );
  assertDeepEqual(
    transitionLedger.map(({ key, before, after }) => ({
      key,
      beforePhase: before.rottenPhase,
      afterPhase: after.rottenPhase,
    })),
    [
      { key: "3", beforePhase: "loadout", afterPhase: "loadout" },
      { key: "6", beforePhase: "loadout", afterPhase: "loadout" },
      { key: "Enter", beforePhase: "loadout", afterPhase: "route-choice" },
      { key: "2", beforePhase: "route-choice", afterPhase: "encounter" },
    ],
    "Rotten isolation independent pre/post key transition ledger",
  );
  if (state.rottenPhase !== "encounter" && state.rottenPhase !== "dead") {
    throw new Error(`Rotten isolation left combat unexpectedly: ${JSON.stringify(evidence)}`);
  }
  if (maximumCounts.weaponAttacks !== 0 || maximumCounts.skillUses !== 0) {
    throw new Error(`Rotten smoke name authorized combat automation: ${JSON.stringify(evidence)}`);
  }

  return evidence;
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

async function smokeRottenStageTwoTopology(browser) {
  const cases = [
    {
      seed: "GAUNTLET-ALPHA",
      planId: "RR1-1C93B57F",
      stageOneRouteKey: "2",
      stageOneRoute: "bailiffs-ramp",
      stageTwoRouteKey: "1",
      stageTwoRoute: "seized-goods-lift",
      stageTwoWaves: [
        "2.1:shield-auditor,clerk",
        "2.2:shield-auditor,bailiff,clerk",
      ],
      expectedGraft: "12",
      expectedEliteCount: "0",
      viewport: { width: 1366, height: 768 },
      evidence: "rotten-stage-two-lift-1366x768.png",
    },
    {
      seed: "GAUNTLET-ALPHA",
      planId: "RR1-1C93B57F",
      stageOneRouteKey: "2",
      stageOneRoute: "bailiffs-ramp",
      stageTwoRouteKey: "2",
      stageTwoRoute: "late-fee-chapel",
      stageTwoWaves: [
        "2.1:clerk,writ-runner",
        "2.2:shield-auditor,sump-scribe",
      ],
      expectedGraft: "14",
      expectedEliteCount: "1",
      viewport: { width: 1920, height: 1080 },
      evidence: "rotten-stage-two-chapel-1920x1080.png",
    },
    {
      seed: "BILE-PROOF",
      planId: "RR1-91887DBF",
      stageOneRouteKey: "1",
      stageOneRoute: "bailiffs-ramp",
      stageTwoRouteKey: "2",
      stageTwoRoute: "bile-registry",
      stageTwoWaves: [
        "2.1:bailiff,sump-scribe",
        "2.2:sump-scribe,clerk,bailiff",
      ],
      expectedGraft: "12",
      expectedEliteCount: "0",
      viewport: { width: 1366, height: 768 },
      evidence: "rotten-stage-two-bile-registry-1366x768.png",
    },
  ];
  const results = [];

  for (const testCase of cases) {
    const page = await browser.open(
      `/?mode=rotten&seed=${testCase.seed}&smokeAuto=1&smoke=rottenStageTwoTopology`,
      { viewport: testCase.viewport },
    );
    await page.waitForDataset("rottenPhase", "loadout");
    await enterRottenStageTwo(page, {
      weaponKey: "3",
      skillKey: "6",
      stageOneRouteKey: testCase.stageOneRouteKey,
      stageOneMarketKey: "5",
      stageTwoRouteKey: testCase.stageTwoRouteKey,
    });
    await installRottenObservationLatch(page);
    const entered = await page.dataset([
      "rottenPhase",
      "rottenSeed",
      "rottenPlanId",
      "rottenStage",
      "rottenRouteOptions",
      "rottenSelectedRoute",
      "rottenSpawnHistory",
      "rottenLivingEnemies",
      "rottenCombatObjectCount",
    ]);
    assertEqual(entered.rottenSeed, testCase.seed, `${testCase.stageTwoRoute} seed`);
    assertEqual(entered.rottenPlanId, testCase.planId, `${testCase.stageTwoRoute} plan`);
    assertEqual(entered.rottenStage, "2", `${testCase.stageTwoRoute} entered stage`);
    assertEqual(entered.rottenSelectedRoute, testCase.stageTwoRoute, `${testCase.stageTwoRoute} real key`);
    if (!String(entered.rottenSpawnHistory).includes(testCase.stageTwoWaves[0])) {
      throw new Error(`${testCase.stageTwoRoute} missing Wave 1 roster: ${entered.rottenSpawnHistory}`);
    }
    if (Number(entered.rottenCombatObjectCount) <= 0) {
      throw new Error(`${testCase.stageTwoRoute} did not own live combat objects`);
    }

    await page.waitForDataset("rottenPhase", "reward-choice", 45_000);
    const reward = await page.dataset([
      "rottenPhase",
      "rottenSeed",
      "rottenPlanId",
      "rottenStage",
      "rottenRouteOptions",
      "rottenSelectedRoute",
      "rottenWave",
      "rottenStageWavesCleared",
      "rottenWavesCleared",
      "rottenSpawnHistory",
      "rottenGraft",
      "rottenHp",
      "rottenEliteCount",
      "rottenCurrentEliteCount",
      "rottenEliteDefeatedCount",
      "rottenRouteHistory",
      "rottenRewardDecisionCount",
      "rottenCombatObjectCount",
    ]);
    assertEqual(reward.rottenStageWavesCleared, "2", `${testCase.stageTwoRoute} stage clears`);
    assertEqual(reward.rottenWavesCleared, "4", `${testCase.stageTwoRoute} total clears`);
    for (const roster of testCase.stageTwoWaves) {
      if (!String(reward.rottenSpawnHistory).includes(roster)) {
        throw new Error(`${testCase.stageTwoRoute} missing frozen roster ${roster}: ${reward.rottenSpawnHistory}`);
      }
    }
    assertEqual(reward.rottenGraft, testCase.expectedGraft, `${testCase.stageTwoRoute} reward graft`);
    assertEqual(reward.rottenEliteCount, testCase.expectedEliteCount, `${testCase.stageTwoRoute} elite count`);
    assertEqual(reward.rottenCurrentEliteCount, "0", `${testCase.stageTwoRoute} current elite cleanup`);
    assertEqual(reward.rottenRewardDecisionCount, "1", `${testCase.stageTwoRoute} one prior decision`);
    assertEqual(reward.rottenCombatObjectCount, "0", `${testCase.stageTwoRoute} reward cleanup`);
    if (!String(reward.rottenRouteHistory).startsWith(`1:${testCase.stageOneRoute}:bank|2:${testCase.stageTwoRoute}:pending`)) {
      throw new Error(`${testCase.stageTwoRoute} history mismatch: ${reward.rottenRouteHistory}`);
    }
    const observed = await readRottenObservationLatch(page);
    await assertNoMissingTextureGreen(page, `${testCase.stageTwoRoute} presentation`);
    await captureEvidence(page, testCase.evidence);
    await page.close();
    results.push({ ...testCase, entered, reward, observed });
  }

  return { route: "Rotten Stage 2 all frozen route topologies", cases: results };
}

async function enterRottenStageTwo(page, {
  label = "Stage 2 helper",
  weaponKey,
  skillKey,
  stageOneRouteKey,
  stageOneMarketKey,
  stageTwoRouteKey,
}) {
  await selectRottenBuild(page, weaponKey, skillKey, stageOneRouteKey);
  try {
    await page.waitForDataset("rottenPhase", "reward-choice", 40_000);
  } catch (error) {
    const stalled = await page.dataset([
      "rottenPhase",
      "rottenStage",
      "rottenSelectedRoute",
      "rottenHp",
      "rottenLivingEnemies",
      "rottenEnemyStates",
      "rottenAttackCount",
      "rottenAttackHitCount",
      "rottenSkillUseCount",
      "rottenSkillHitCount",
      "rottenWave",
      "rottenSpawnHistory",
      "rottenCombatObjectCount",
    ]);
    throw new Error(`${label} did not reach the first market: ${JSON.stringify(stalled)}; ${error}`);
  }
  await new Promise((resolve) => setTimeout(resolve, 340));
  const firstMarket = await page.dataset([
    "rottenStage",
    "rottenMarketStatus",
    "rottenRewardDecisionCount",
    "rottenCombatObjectCount",
  ]);
  assertEqual(firstMarket.rottenStage, "1", "Stage 2 helper first market stage");
  assertEqual(firstMarket.rottenMarketStatus, "open", "Stage 2 helper first market open");
  assertEqual(firstMarket.rottenRewardDecisionCount, "0", "Stage 2 helper first decision count");
  assertEqual(firstMarket.rottenCombatObjectCount, "0", "Stage 2 helper first reward cleanup");
  await page.key(stageOneMarketKey);
  await page.waitForDataset("rottenStage", "2", 5_000);
  await page.waitForDataset("rottenPhase", "route-choice", 5_000);
  const docket = await page.dataset([
    "rottenStage",
    "rottenRouteOptions",
    "rottenSelectedRoute",
    "rottenRewardDecisionCount",
    "rottenCombatObjectCount",
  ]);
  assertEqual(docket.rottenRewardDecisionCount, "1", "Stage 2 helper carried first decision");
  assertEqual(docket.rottenCombatObjectCount, "0", "Stage 2 helper docket cleanup");
  await new Promise((resolve) => setTimeout(resolve, 300));
  await page.key(stageTwoRouteKey);
  await page.waitForDataset("rottenPhase", "encounter", 5_000);
  await page.waitForDataset("rottenStage", "2", 5_000);
  return { firstMarket, docket };
}

async function smokeRottenStageTwoRoles(browser) {
  const shieldPage = await browser.open(
    "/?mode=rotten&seed=GAUNTLET-ALPHA&smokeAuto=1&smoke=rottenStageTwoRoles",
    { viewport: { width: 1366, height: 768 } },
  );
  await shieldPage.waitForDataset("rottenPhase", "loadout");
  await enterRottenStageTwo(shieldPage, {
    weaponKey: "3",
    skillKey: "6",
    stageOneRouteKey: "2",
    stageOneMarketKey: "5",
    stageTwoRouteKey: "1",
  });
  await installRottenStageTwoMechanicsLatch(shieldPage);
  await waitFor(async () => {
    const live = await shieldPage.dataset(["rottenPhase", "rottenEnemyStates"]);
    return live.rottenPhase === "encounter"
      && String(live.rottenEnemyStates).split("|").some((enemy) =>
        enemy.startsWith("shield-auditor:") && enemy.endsWith(":open"));
  }, 15_000, 25);
  await captureEvidence(shieldPage, "rotten-stage-two-shield-open-live-1366x768.png");
  try {
    await shieldPage.waitForDataset("rottenPhase", "reward-choice", 45_000);
  } catch (error) {
    const stalled = await shieldPage.dataset([
      ...rottenStageTwoMechanicTruthKeys(),
      "rottenLivingEnemies",
      "rottenAttackCount",
      "rottenAttackHitCount",
      "rottenSkillUseCount",
      "rottenWave",
      "rottenSpawnHistory",
    ]);
    throw new Error(`Shield role did not clear after ordered proof: ${JSON.stringify(stalled)}; ${error}`);
  }
  const shield = await readRottenStageTwoMechanicsLatch(shieldPage);
  const shieldReward = await shieldPage.dataset(rottenStageTwoMechanicTruthKeys());
  if (shield.maxShieldBlockCount < 1) {
    throw new Error(`Shield Auditor frontal block missing: ${JSON.stringify({ shield, shieldReward })}`);
  }
  if (shield.maxShieldFlankHitCount < 1) {
    throw new Error(`Shield Auditor successful flank missing: ${JSON.stringify({ shield, shieldReward })}`);
  }
  if (!shield.shieldOpenSources.includes("skill")) {
    throw new Error(`Shield Auditor did not record a skill open: ${JSON.stringify(shield)}`);
  }
  if (!shield.shieldOpenSources.includes("dash-through")) {
    throw new Error(`Shield Auditor did not record a dash-through open: ${JSON.stringify(shield)}`);
  }
  for (const state of ["closed", "open"]) {
    if (!shield.shieldStates.includes(state)) {
      throw new Error(`Shield Auditor did not expose ${state} state: ${JSON.stringify(shield)}`);
    }
  }
  assertEqual(shieldReward.rottenCombatObjectCount, "0", "Shield role reward cleanup");
  await captureEvidence(shieldPage, "rotten-stage-two-shield-counterplay-1366x768.png");
  await shieldPage.close();

  const hazardPage = await browser.open(
    "/?mode=rotten&seed=BILE-PROOF&smokeAuto=1&smoke=rottenStageTwoRoles",
    { viewport: { width: 1920, height: 1080 } },
  );
  await hazardPage.waitForDataset("rottenPhase", "loadout");
  await enterRottenStageTwo(hazardPage, {
    weaponKey: "3",
    skillKey: "6",
    stageOneRouteKey: "1",
    stageOneMarketKey: "5",
    stageTwoRouteKey: "2",
  });
  await installRottenStageTwoMechanicsLatch(hazardPage);
  await waitFor(async () => {
    const live = await hazardPage.dataset(["rottenPhase", "rottenHazardActiveCount"]);
    return live.rottenPhase === "encounter" && Number(live.rottenHazardActiveCount) >= 1;
  }, 15_000, 25);
  await captureEvidence(hazardPage, "rotten-stage-two-sump-hazard-live-1920x1080.png");
  await hazardPage.waitForDataset("rottenPhase", "reward-choice", 45_000);
  const hazard = await readRottenStageTwoMechanicsLatch(hazardPage);
  const hazardReward = await hazardPage.dataset(rottenStageTwoMechanicTruthKeys());
  assertAtLeastNumber(hazard.maxHazardTelegraphCount, 1, "Sump Scribe telegraph");
  assertAtLeastNumber(hazard.maxHazardActiveCount, 1, "Sump Scribe active hazard");
  assertAtLeastNumber(hazard.maxHazardHitCount, 1, "Sump Scribe legitimate hazard hit");
  assertAtLeastNumber(hazard.maxHazardExpiryCount, 1, "Sump Scribe hazard expiry");
  if (!hazard.enemyTells.some((tell) => tell.includes("sump-scribe:windup:BILE MARK!"))) {
    throw new Error(`Sump Scribe did not expose BILE MARK!: ${JSON.stringify(hazard)}`);
  }
  assertEqual(hazardReward.rottenCombatObjectCount, "0", "Sump role reward cleanup");
  await captureEvidence(hazardPage, "rotten-stage-two-sump-hazard-1920x1080.png");
  await hazardPage.close();

  const bombPage = await browser.open(
    "/?mode=rotten&seed=BILE-PROOF&smokeAuto=1&smoke=rottenStageTwoRoles",
    { viewport: { width: 1366, height: 768 } },
  );
  await bombPage.waitForDataset("rottenPhase", "loadout");
  await enterRottenStageTwo(bombPage, {
    weaponKey: "4",
    skillKey: "7",
    stageOneRouteKey: "1",
    stageOneMarketKey: "5",
    stageTwoRouteKey: "2",
  });
  await installRottenStageTwoMechanicsLatch(bombPage);
  await waitFor(async () => {
    const live = await bombPage.dataset([
      "rottenPhase",
      "rottenHazardTelegraphCount",
      "rottenHazardClearCount",
      "rottenSkillUseCount",
    ]);
    return live.rottenPhase === "encounter"
      && Number(live.rottenHazardTelegraphCount) >= 1
      && Number(live.rottenHazardClearCount) === 0
      && Number(live.rottenSkillUseCount) >= 1;
  }, 15_000, 20);
  await captureEvidence(bombPage, "rotten-stage-two-bomb-hazard-live-1366x768.png");
  try {
    await bombPage.waitForDataset("rottenPhase", "reward-choice", 45_000);
  } catch (error) {
    const stalled = await bombPage.dataset([
      ...rottenStageTwoMechanicTruthKeys(),
      "rottenLivingEnemies",
      "rottenSkillReady",
      "rottenSkillUseCount",
      "rottenAttackCount",
      "rottenAttackHitCount",
      "rottenWave",
      "rottenSpawnHistory",
    ]);
    throw new Error(`Bribe Bomb role proof did not clear: ${JSON.stringify(stalled)}; ${error}`);
  }
  const bomb = await readRottenStageTwoMechanicsLatch(bombPage);
  const bombReward = await bombPage.dataset(rottenStageTwoMechanicTruthKeys());
  assertAtLeastNumber(bomb.maxHazardClearCount, 1, "Bribe Bomb hazard clear");
  assertEqual(bombReward.rottenCombatObjectCount, "0", "Bomb role reward cleanup");
  await captureEvidence(bombPage, "rotten-stage-two-bomb-clears-hazard-1366x768.png");
  await bombPage.close();

  return {
    route: "Rotten Stage 2 Shield Auditor and Sump Scribe counterplay",
    shield: { observation: shield, reward: shieldReward },
    hazard: { observation: hazard, reward: hazardReward },
    bomb: { observation: bomb, reward: bombReward },
  };
}

async function smokeRottenStageTwoElites(browser) {
  const cases = [
    {
      seed: "ELITE-OVERDUE-PROOF",
      planId: "RR1-43C9A578",
      expectedVariant: "gilded",
      weaponKey: "3",
      skillKey: "6",
      stageOneRouteKey: "1",
      stageTwoRouteKey: "2",
      expectedStageTwoOptions: "seized-goods-lift|late-fee-chapel",
      viewport: { width: 1366, height: 768 },
      evidence: "rotten-stage-two-gilded-armor-1366x768.png",
    },
    {
      seed: "ELITE-GILDED-PROOF",
      planId: "RR1-D3B6650A",
      expectedVariant: "overdue",
      weaponKey: "1",
      skillKey: "6",
      stageOneRouteKey: "1",
      stageTwoRouteKey: "1",
      expectedStageTwoOptions: "late-fee-chapel|seized-goods-lift",
      viewport: { width: 1920, height: 1080 },
      evidence: "rotten-stage-two-overdue-enrage-1920x1080.png",
    },
  ];
  const results = [];

  for (const testCase of cases) {
    const page = await browser.open(
      `/?mode=rotten&seed=${testCase.seed}&smokeAuto=1&smoke=rottenStageTwoElites`,
      { viewport: testCase.viewport },
    );
    await page.waitForDataset("rottenPhase", "loadout");
    await enterRottenStageTwo(page, {
      weaponKey: testCase.weaponKey,
      skillKey: testCase.skillKey,
      stageOneRouteKey: testCase.stageOneRouteKey,
      stageOneMarketKey: "5",
      stageTwoRouteKey: testCase.stageTwoRouteKey,
    });
    await installRottenEliteLatch(page);
    const entered = await page.dataset([
      "rottenSeed",
      "rottenPlanId",
      "rottenRouteOptions",
      "rottenSelectedRoute",
      "rottenCurrentEliteCount",
      "rottenEnemyStates",
      "rottenCombatObjectCount",
    ]);
    assertEqual(entered.rottenSeed, testCase.seed, `${testCase.expectedVariant} seed`);
    assertEqual(entered.rottenPlanId, testCase.planId, `${testCase.expectedVariant} plan`);
    assertEqual(entered.rottenRouteOptions, testCase.expectedStageTwoOptions, `${testCase.expectedVariant} routes`);
    assertEqual(entered.rottenSelectedRoute, "late-fee-chapel", `${testCase.expectedVariant} chapel route`);
    assertEqual(entered.rottenCurrentEliteCount, "1", `${testCase.expectedVariant} current elite`);
    if (!String(entered.rottenEnemyStates).includes(`:${testCase.expectedVariant}:`)) {
      throw new Error(`${testCase.expectedVariant} treatment missing at spawn: ${entered.rottenEnemyStates}`);
    }
    await captureEvidence(page, testCase.evidence);

    if (testCase.expectedVariant === "overdue") {
      await waitFor(async () => {
        const observed = await readRottenEliteLatch(page);
        return observed.sawAliveEnraged;
      }, 20_000, 40);
      await captureEvidence(page, "rotten-stage-two-overdue-live-enrage-1920x1080.png");
    }

    await page.waitForDataset("rottenPhase", "reward-choice", 45_000);
    const observation = await readRottenEliteLatch(page);
    const reward = await page.dataset([
      "rottenPhase",
      "rottenHp",
      "rottenGraft",
      "rottenEliteCount",
      "rottenCurrentEliteCount",
      "rottenEliteDefeatedCount",
      "rottenEliteDefeatedVariants",
      "rottenEliteBountyGraft",
      "rottenEliteArmorBreakCount",
      "rottenEliteEnrageCount",
      "rottenSpawnHistory",
      "rottenCombatObjectCount",
    ]);
    assertEqual(reward.rottenGraft, "14", `${testCase.expectedVariant} base plus bounty graft`);
    assertEqual(reward.rottenEliteCount, "1", `${testCase.expectedVariant} total elite`);
    assertEqual(reward.rottenCurrentEliteCount, "0", `${testCase.expectedVariant} current elite cleanup`);
    assertEqual(reward.rottenEliteDefeatedCount, "1", `${testCase.expectedVariant} defeat count`);
    assertEqual(reward.rottenEliteDefeatedVariants, testCase.expectedVariant, `${testCase.expectedVariant} defeated variant`);
    assertEqual(reward.rottenEliteBountyGraft, "1", `${testCase.expectedVariant} bounty`);
    assertEqual(reward.rottenCombatObjectCount, "0", `${testCase.expectedVariant} reward cleanup`);
    if (!observation.baseRoleWindups.includes("writ-runner")) {
      throw new Error(`${testCase.expectedVariant} hid the base writ-runner tell: ${JSON.stringify(observation)}`);
    }
    if (testCase.expectedVariant === "gilded") {
      assertEqual(reward.rottenEliteArmorBreakCount, "1", "gilded single armor absorption");
      assertEqual(String(observation.maxArmorPips), "1", "gilded visible armor pip");
      assertEqual(reward.rottenEliteEnrageCount, "0", "gilded no enrage");
    } else {
      assertEqual(reward.rottenEliteArmorBreakCount, "0", "overdue no armor pip");
      assertEqual(reward.rottenEliteEnrageCount, "1", "overdue once-only enrage");
      assertEqual(String(observation.sawAliveEnraged), "true", "overdue live enrage state");
    }
    await page.close();
    results.push({ ...testCase, entered, observation, reward });
  }

  return { route: "Rotten Stage 2 deterministic gilded and overdue elites", cases: results };
}

async function smokeRottenStageTwoBuilds(browser) {
  const cases = [
    {
      upgradeId: "compound-interest",
      archetype: "Knife/Belch/Compound",
      seed: "BUILD-PROOF-1",
      planId: "RR1-7F26E13F",
      weaponKey: "1",
      skillKey: "5",
      stageOneRouteKey: "2",
      stageOneMarketKey: "2",
      stageTwoRouteKey: "2",
      stageTwoRoute: "bile-registry",
      proofKey: "rottenMaxCompoundBonusDamage",
      proofMinimum: 2,
      viewport: { width: 1366, height: 768 },
    },
    {
      upgradeId: "hangover-hide",
      archetype: "Pike/Stamp/Hangover",
      seed: "BUILD-PROOF-2",
      planId: "RR1-A1F7D62F",
      weaponKey: "3",
      skillKey: "6",
      stageOneRouteKey: "1",
      stageOneMarketKey: "2",
      stageTwoRouteKey: "2",
      stageTwoRoute: "bile-registry",
      proofKey: "rottenHp",
      proofExpected: "8/8",
      viewport: { width: 1920, height: 1080 },
    },
    {
      upgradeId: "dead-letter",
      archetype: "Spitter/Bomb/Dead Letter",
      seed: "BUILD-PROOF-0",
      planId: "RR1-BFDF8B11",
      weaponKey: "4",
      skillKey: "7",
      stageOneRouteKey: "1",
      stageOneMarketKey: "2",
      stageTwoRouteKey: "1",
      stageTwoRoute: "bile-registry",
      proofKey: "rottenDeadLetterHitCount",
      proofMinimum: 1,
      viewport: { width: 1366, height: 768 },
    },
    {
      upgradeId: "petty-grudge",
      seed: "BUILD-PROOF-0",
      planId: "RR1-BFDF8B11",
      weaponKey: "3",
      skillKey: "6",
      stageOneRouteKey: "1",
      stageOneMarketKey: "3",
      stageTwoRouteKey: "2",
      stageTwoRoute: "seized-goods-lift",
      proofKey: "rottenMaxGrudgeBonusDamage",
      proofMinimum: 1,
      viewport: { width: 1366, height: 768 },
    },
    {
      upgradeId: "counterfeit-soles",
      seed: "BUILD-PROOF-0",
      planId: "RR1-BFDF8B11",
      weaponKey: "3",
      skillKey: "6",
      stageOneRouteKey: "1",
      stageOneMarketKey: "1",
      stageTwoRouteKey: "2",
      stageTwoRoute: "seized-goods-lift",
      proofKey: "rottenDashWakeHitCount",
      proofMinimum: 1,
      viewport: { width: 1920, height: 1080 },
    },
    {
      upgradeId: "red-tape-tourniquet",
      seed: "BUILD-PROOF-0",
      planId: "RR1-BFDF8B11",
      weaponKey: "3",
      skillKey: "6",
      stageOneRouteKey: "2",
      stageOneMarketKey: "2",
      stageTwoRouteKey: "2",
      stageTwoRoute: "seized-goods-lift",
      proofKey: "rottenWaveHealRestored",
      proofMinimum: 1,
      viewport: { width: 1366, height: 768 },
    },
    {
      upgradeId: "spite-reserve",
      seed: "BUILD-PROOF-0",
      planId: "RR1-BFDF8B11",
      weaponKey: "3",
      skillKey: "6",
      stageOneRouteKey: "2",
      stageOneMarketKey: "1",
      stageTwoRouteKey: "2",
      stageTwoRoute: "seized-goods-lift",
      proofKey: "rottenSkillCooldownMs",
      proofExpected: "1008",
      viewport: { width: 1366, height: 768 },
    },
    {
      upgradeId: "graft-dividend",
      seed: "DIVIDEND-CHAPEL-1",
      planId: "RR1-D66285FF",
      weaponKey: "3",
      skillKey: "6",
      stageOneRouteKey: "2",
      stageOneMarketKey: "2",
      stageTwoRouteKey: "1",
      stageTwoRoute: "late-fee-chapel",
      proofKey: "rottenEliteBountyGraft",
      proofExpected: "2",
      viewport: { width: 1920, height: 1080 },
    },
  ];
  const results = [];

  for (const testCase of cases) {
    const page = await browser.open(
      `/?mode=rotten&seed=${testCase.seed}&smokeAuto=1&smoke=rottenStageTwoBuilds`,
      { viewport: testCase.viewport },
    );
    await page.waitForDataset("rottenPhase", "loadout");
    await enterRottenStageTwo(page, {
      label: testCase.upgradeId,
      weaponKey: testCase.weaponKey,
      skillKey: testCase.skillKey,
      stageOneRouteKey: testCase.stageOneRouteKey,
      stageOneMarketKey: testCase.stageOneMarketKey,
      stageTwoRouteKey: testCase.stageTwoRouteKey,
    });
    const entered = await page.dataset([
      "rottenSeed",
      "rottenPlanId",
      "rottenStage",
      "rottenSelectedRoute",
      "rottenWeapon",
      "rottenSkill",
      "rottenUpgrades",
      "rottenHp",
      "rottenDashCooldownMs",
      "rottenSkillCooldownMs",
      "rottenCombatObjectCount",
    ]);
    assertEqual(entered.rottenPlanId, testCase.planId, `${testCase.upgradeId} plan`);
    assertEqual(entered.rottenSelectedRoute, testCase.stageTwoRoute, `${testCase.upgradeId} Stage 2 route`);
    assertEqual(entered.rottenUpgrades, testCase.upgradeId, `${testCase.upgradeId} carried ownership`);
    try {
      if (testCase.proofExpected !== undefined) {
        await page.waitForDataset(testCase.proofKey, testCase.proofExpected, 25_000);
      } else {
        await waitFor(async () => {
          const state = await page.dataset([testCase.proofKey]);
          return Number(state[testCase.proofKey]) >= testCase.proofMinimum;
        }, 25_000, 40);
      }
    } catch (error) {
      const stalled = await page.dataset([
        "rottenPhase",
        "rottenHp",
        "rottenEnemyStates",
        "rottenAttackCount",
        "rottenAttackHitCount",
        "rottenSkillUseCount",
        "rottenSkillHitCount",
        "rottenCompoundBonusDamage",
        "rottenMaxCompoundBonusDamage",
        "rottenMaxGrudgeBonusDamage",
        "rottenDashWakeHitCount",
        "rottenDeadLetterHitCount",
        "rottenWaveHealRestored",
        "rottenCombatObjectCount",
      ]);
      throw new Error(`${testCase.upgradeId} build proof stalled: ${JSON.stringify(stalled)}; ${error}`);
    }
    await captureEvidence(
      page,
      `rotten-stage-two-build-${testCase.upgradeId}-${testCase.viewport.width}x${testCase.viewport.height}.png`,
    );
    await page.waitForDataset("rottenPhase", "reward-choice", 45_000);
    const reward = await page.dataset([
      "rottenPhase",
      "rottenSeed",
      "rottenPlanId",
      "rottenSelectedRoute",
      "rottenWeapon",
      "rottenSkill",
      "rottenUpgrades",
      "rottenHp",
      "rottenGraft",
      "rottenAttackHitCount",
      "rottenSkillHitCount",
      "rottenSkillCooldownMs",
      "rottenMaxGrudgeBonusDamage",
      "rottenMaxCompoundBonusDamage",
      "rottenMaxTotalWeaponBonusDamage",
      "rottenDashCooldownMs",
      "rottenDashWakeCount",
      "rottenDashWakeHitCount",
      "rottenDeadLetterCount",
      "rottenDeadLetterHitCount",
      "rottenWaveHealCount",
      "rottenWaveHealRestored",
      "rottenEliteBountyGraft",
      "rottenEliteDefeatedCount",
      "rottenOfferIds",
      "rottenOfferPrices",
      "rottenCombatObjectCount",
    ]);
    const [currentHp, maxHp] = parseHealth(reward.rottenHp, `${testCase.upgradeId} reward HP`);
    assertAtLeastNumber(currentHp, 2, `${testCase.upgradeId} meaningful HP margin`);
    assertAtLeastNumber(reward.rottenAttackHitCount, 1, `${testCase.upgradeId} weapon hits`);
    assertAtLeastNumber(reward.rottenSkillHitCount, 1, `${testCase.upgradeId} skill hits`);
    assertEqual(reward.rottenCombatObjectCount, "0", `${testCase.upgradeId} reward cleanup`);

    switch (testCase.upgradeId) {
      case "hangover-hide":
        assertEqual(String(maxHp), "8", "Hangover Stage 2 max HP");
        break;
      case "petty-grudge":
        assertEqual(reward.rottenMaxGrudgeBonusDamage, "1", "Petty Grudge resolved weapon bonus");
        break;
      case "counterfeit-soles":
        assertEqual(reward.rottenDashCooldownMs, "340", "Counterfeit dash cooldown");
        assertAtLeastNumber(reward.rottenDashWakeCount, 1, "Counterfeit wake count");
        assertAtLeastNumber(reward.rottenDashWakeHitCount, 1, "Counterfeit wake hit");
        break;
      case "compound-interest":
        assertEqual(reward.rottenMaxCompoundBonusDamage, "2", "Compound capped bonus");
        assertEqual(reward.rottenMaxTotalWeaponBonusDamage, "2", "Compound actual total bonus");
        break;
      case "red-tape-tourniquet":
        assertEqual(reward.rottenWaveHealCount, "2", "Tourniquet per-wave events");
        assertAtLeastNumber(reward.rottenWaveHealRestored, 1, "Tourniquet actual restoration");
        break;
      case "spite-reserve":
        assertEqual(reward.rottenSkillCooldownMs, "1008", "Spite Reserve rounded cooldown");
        break;
      case "dead-letter":
        assertAtLeastNumber(reward.rottenDeadLetterCount, 1, "Dead Letter projectile pierce emissions");
        assertAtLeastNumber(reward.rottenDeadLetterHitCount, 1, "Dead Letter projectile pierce hits");
        break;
      case "graft-dividend":
        assertEqual(reward.rottenEliteBountyGraft, "2", "Dividend doubled elite bounty");
        assertEqual(reward.rottenEliteDefeatedCount, "1", "Dividend elite defeat");
        assertEqual(reward.rottenGraft, "9", "Dividend carried purse plus base and double bounty");
        assertEqual(reward.rottenOfferIds, "spite-reserve|hangover-hide|compound-interest", "Dividend later offers");
        assertEqual(reward.rottenOfferPrices, "4|4|5", "Dividend later market discount");
        break;
    }
    await page.close();
    results.push({ ...testCase, entered, reward });
  }

  return { route: "Rotten Stage 2 all eight carried build effects", cases: results };
}

async function smokeRottenStageTwoMarket(browser) {
  const purchasePage = await browser.open(
    "/?mode=rotten&seed=DIVIDEND-CHAPEL-1&smokeAuto=1&smoke=rottenStageTwoMarket",
    { viewport: { width: 1920, height: 1080 } },
  );
  await purchasePage.waitForDataset("rottenPhase", "loadout");
  await enterRottenStageTwo(purchasePage, {
    label: "Stage 2 Dividend purchase",
    weaponKey: "3",
    skillKey: "6",
    stageOneRouteKey: "2",
    stageOneMarketKey: "2",
    stageTwoRouteKey: "1",
  });
  const purchaseBefore = await waitForOpenRottenStageTwoMarket(
    purchasePage,
    "Stage 2 Dividend purchase",
  );
  assertEqual(purchaseBefore.rottenPlanId, "RR1-D66285FF", "Stage 2 purchase plan");
  assertEqual(purchaseBefore.rottenSelectedRoute, "late-fee-chapel", "Stage 2 purchase route");
  assertEqual(purchaseBefore.rottenGraft, "9", "Stage 2 purchase purse with elite bounty");
  assertEqual(purchaseBefore.rottenHp, "5/6", "Stage 2 purchase honest carried HP");
  assertEqual(purchaseBefore.rottenUpgrades, "graft-dividend", "Stage 2 purchase prior ownership");
  assertEqual(
    purchaseBefore.rottenOfferIds,
    "spite-reserve|hangover-hide|compound-interest",
    "Stage 2 purchase deterministic eligible offers",
  );
  assertEqual(purchaseBefore.rottenOfferPrices, "4|4|5", "Stage 2 purchase Dividend prices");
  assertEqual(purchaseBefore.rottenEliteBountyGraft, "2", "Stage 2 purchase elite bounty carry");
  assertEqual(purchaseBefore.rottenEliteDefeatedCount, "1", "Stage 2 purchase elite carry");
  assertEqual(
    purchaseBefore.rottenRouteHistory,
    "1:bailiffs-ramp:upgrade:graft-dividend|2:late-fee-chapel:pending",
    "Stage 2 purchase pending two-entry history",
  );
  const purchaseTruth = pickDataset(purchaseBefore, rottenStageTwoMarketTruthKeys());
  await purchasePage.key("6");
  await purchasePage.waitForDataset("rottenRewardFeedbackReason", "invalid-input", 2_000);
  const purchaseInvalid = await purchasePage.dataset(rottenStageTwoMarketTruthKeys());
  assertDeepEqual(
    pickDataset(purchaseInvalid, rottenStageTwoMarketTruthKeys()),
    purchaseTruth,
    "Stage 2 invalid input strict no-op",
  );
  await captureEvidence(purchasePage, "rotten-stage-two-market-purchase-open-1920x1080.png");
  await purchasePage.key("1");
  await purchasePage.waitForDataset("rottenStage", "3", 5_000);
  const purchase = await assertRottenStageThreeDocket(purchasePage, {
    label: "Stage 2 purchase",
    expectedRoutes: "garnish-gallery|collection-parade",
    expectedHistory:
      "1:bailiffs-ramp:upgrade:graft-dividend|2:late-fee-chapel:upgrade:spite-reserve",
    evidence: "rotten-stage-three-after-purchase-1920x1080.png",
  });
  assertEqual(purchase.rottenGraft, "5", "Stage 2 purchase payment");
  assertEqual(purchase.rottenHp, "5/6", "Stage 2 purchase carried HP");
  assertEqual(
    purchase.rottenUpgrades,
    "graft-dividend|spite-reserve",
    "Stage 2 purchase carried ownership",
  );
  assertEqual(purchase.rottenMarketChoice, "upgrade:spite-reserve", "Stage 2 purchase choice");
  assertEqual(
    purchase.rottenMarketTraceEvent,
    "market:2:late-fee-chapel:upgrade:spite-reserve:spent-4",
    "Stage 2 purchase trace",
  );
  assertEqual(purchase.rottenEliteBountyGraft, "2", "Stage 3 elite bounty carry");
  const purchaseBuild = JSON.parse(purchase.rottenBuildSummary);
  assertEqual(String(purchaseBuild.marketDiscount), "1", "Stage 3 Dividend build carry");
  assertEqual(
    String(purchaseBuild.activeSkillCooldownReduced),
    "true",
    "Stage 3 purchased build carry",
  );
  await purchasePage.close();

  const healPage = await browser.open(
    "/?mode=rotten&seed=GAUNTLET-ALPHA&smokeAuto=1&smoke=rottenStageTwoMarket",
    { viewport: { width: 1366, height: 768 } },
  );
  await healPage.waitForDataset("rottenPhase", "loadout");
  await enterRottenStageTwo(healPage, {
    label: "Stage 2 heal",
    weaponKey: "3",
    skillKey: "6",
    stageOneRouteKey: "2",
    stageOneMarketKey: "5",
    stageTwoRouteKey: "1",
  });
  const healBefore = await waitForOpenRottenStageTwoMarket(healPage, "Stage 2 heal");
  assertEqual(healBefore.rottenPlanId, "RR1-1C93B57F", "Stage 2 heal GA plan");
  assertEqual(healBefore.rottenSelectedRoute, "seized-goods-lift", "Stage 2 heal route");
  assertEqual(healBefore.rottenHp, "5/6", "Stage 2 heal actual damaged HP");
  assertEqual(healBefore.rottenGraft, "12", "Stage 2 heal purse");
  assertEqual(healBefore.rottenHealAvailable, "true", "Stage 2 heal available");
  await captureEvidence(healPage, "rotten-stage-two-market-heal-open-1366x768.png");
  await healPage.key("4");
  await healPage.waitForDataset("rottenStage", "3", 5_000);
  const heal = await assertRottenStageThreeDocket(healPage, {
    label: "Stage 2 heal",
    expectedRoutes: "collection-parade|garnish-gallery",
    expectedHistory: "1:bailiffs-ramp:bank|2:seized-goods-lift:heal:1",
    evidence: "rotten-stage-three-after-heal-1366x768.png",
  });
  assertEqual(heal.rottenGraft, "10", "Stage 2 heal payment");
  assertEqual(heal.rottenHp, "6/6", "Stage 2 heal restored exact missing HP");
  assertEqual(heal.rottenMarketChoice, "heal:1", "Stage 2 heal choice");
  assertEqual(
    heal.rottenMarketTraceEvent,
    "market:2:seized-goods-lift:heal:1:spent-2",
    "Stage 2 heal trace",
  );
  await healPage.close();

  const bankBoundary = await smokeRottenStageTwoMarketBoundary(browser);

  const fullPage = await browser.open(
    "/?mode=rotten&seed=BILE-PROOF&smokeAuto=1&smoke=rottenStageTwoMarket",
    { viewport: { width: 1920, height: 1080 } },
  );
  await fullPage.waitForDataset("rottenPhase", "loadout");
  await enterRottenStageTwo(fullPage, {
    label: "Stage 2 full-health no-op",
    weaponKey: "3",
    skillKey: "6",
    stageOneRouteKey: "1",
    stageOneMarketKey: "5",
    stageTwoRouteKey: "2",
  });
  const fullBefore = await waitForOpenRottenStageTwoMarket(fullPage, "Stage 2 full-health no-op");
  assertEqual(fullBefore.rottenSelectedRoute, "bile-registry", "Stage 2 full-health route");
  assertEqual(fullBefore.rottenHp, "6/6", "Stage 2 full-health honest state");
  assertEqual(fullBefore.rottenHealAvailable, "false", "Stage 2 full-health unavailable heal");
  const fullTruth = pickDataset(fullBefore, rottenStageTwoMarketTruthKeys());
  await fullPage.key("4");
  await fullPage.waitForDataset("rottenRewardFeedbackReason", "full-health", 2_000);
  const fullHealth = await fullPage.dataset(rottenStageTwoMarketTruthKeys());
  assertDeepEqual(
    pickDataset(fullHealth, rottenStageTwoMarketTruthKeys()),
    fullTruth,
    "Stage 2 full-health heal strict no-op",
  );
  await captureEvidence(fullPage, "rotten-stage-two-market-full-health-no-op-1920x1080.png");
  await fullPage.key("5");
  await fullPage.waitForDataset("rottenStage", "3", 5_000);
  const fullBank = await assertRottenStageThreeDocket(fullPage, {
    label: "Stage 2 full-health bank",
    expectedRoutes: "appeal-furnace|collection-parade",
    expectedHistory: "1:bailiffs-ramp:bank|2:bile-registry:bank",
    evidence: "rotten-stage-three-bile-bank-1920x1080.png",
  });
  assertEqual(fullBank.rottenHp, "6/6", "Stage 2 full-health bank carried HP");
  assertEqual(fullBank.rottenGraft, "12", "Stage 2 full-health bank carried purse");
  await fullPage.close();

  return {
    route: "Rotten Stage 2 purchase, heal, bank, no-ops, and inert Stage 3 docket",
    purchase: { before: purchaseBefore, invalid: purchaseInvalid, after: purchase },
    heal: { before: healBefore, after: heal },
    bank: {
      before: bankBoundary.before,
      unaffordable: bankBoundary.unaffordable,
      keyLedger: bankBoundary.keyLedger,
      docketHold: bankBoundary.docketHold,
      after: bankBoundary.after,
    },
    fullHealth: { before: fullBefore, rejected: fullHealth, after: fullBank },
  };
}

async function smokeRottenStageTwoMarketBoundary(browser) {
  const page = await browser.open(
    "/?mode=rotten&seed=GAUNTLET-ALPHA&smokeAuto=1&smoke=rottenStageTwoMarket",
    { viewport: { width: 1366, height: 768 } },
  );
  await page.waitForDataset("rottenPhase", "loadout");
  await enterRottenStageTwo(page, {
    label: "Stage 2 bank",
    weaponKey: "3",
    skillKey: "6",
    stageOneRouteKey: "2",
    stageOneMarketKey: "1",
    stageTwoRouteKey: "1",
  });
  const before = await waitForOpenRottenStageTwoMarket(page, "Stage 2 bank");
  assertEqual(before.rottenGraft, "5", "Stage 2 bank purse after Stage 1 purchase");
  assertEqual(before.rottenUpgrades, "dead-letter", "Stage 2 bank carried upgrade");
  assertEqual(
    before.rottenOfferIds,
    "counterfeit-soles|compound-interest|petty-grudge",
    "Stage 2 bank ownership-excluding offers",
  );
  assertEqual(before.rottenOfferPrices, "4|6|5", "Stage 2 bank offer prices");
  const bankTruth = pickDataset(before, rottenStageTwoMarketTruthKeys());
  await installRottenNumericKeyLedger(page);
  await page.key("2");
  await page.waitForDataset("rottenRewardFeedbackReason", "unaffordable", 2_000);
  const unaffordable = await page.dataset(rottenStageTwoMarketTruthKeys());
  assertDeepEqual(
    pickDataset(unaffordable, rottenStageTwoMarketTruthKeys()),
    bankTruth,
    "Stage 2 unaffordable purchase strict no-op",
  );
  await page.key("5");
  await page.waitForDataset("rottenStage", "3", 5_000);
  const expectedKeyLedger = [
    { type: "keydown", key: "2", code: "Digit2", repeat: false },
    { type: "keyup", key: "2", code: "Digit2", repeat: false },
    { type: "keydown", key: "5", code: "Digit5", repeat: false },
    { type: "keyup", key: "5", code: "Digit5", repeat: false },
  ];
  const keyLedger = await readRottenNumericKeyLedger(page);
  assertDeepEqual(
    keyLedger,
    expectedKeyLedger,
    "Stage 2 rejected 2 and bank 5 exact non-repeating DOM key ledger",
  );
  const docketHold = await holdRottenStageThreeDocketWithoutInput(page, {
    label: "Stage 2 rejected 2 then bank 5",
    durationMs: 2_200,
  });
  const keyLedgerAfterHold = await readRottenNumericKeyLedger(page);
  assertDeepEqual(
    keyLedgerAfterHold,
    expectedKeyLedger,
    "Stage 2 bank docket hold received no new route key",
  );
  const after = await assertRottenStageThreeDocket(page, {
    label: "Stage 2 bank",
    expectedRoutes: "collection-parade|garnish-gallery",
    expectedHistory: "1:bailiffs-ramp:upgrade:dead-letter|2:seized-goods-lift:bank",
    evidence: "rotten-stage-three-after-bank-1366x768.png",
  });
  assertEqual(after.rottenGraft, "5", "Stage 2 bank preserves purse");
  assertEqual(after.rottenUpgrades, "dead-letter", "Stage 2 bank preserves ownership");
  assertEqual(after.rottenMarketChoice, "bank", "Stage 2 bank choice");
  assertEqual(
    after.rottenMarketTraceEvent,
    "market:2:seized-goods-lift:bank:spent-0",
    "Stage 2 bank trace",
  );
  await page.key("1");
  await page.waitForDataset("rottenPhase", "encounter", 2_000);
  const releasedRoute = await page.dataset([
    "rottenPhase",
    "rottenStage",
    "rottenSelectedRoute",
    "rottenLivingEnemies",
    "rottenCombatObjectCount",
  ]);
  assertEqual(releasedRoute.rottenStage, "3", "Stage 2 bank released key enters Stage 3");
  assertEqual(
    releasedRoute.rottenSelectedRoute,
    "collection-parade",
    "Stage 2 bank released key selects exactly one intended route",
  );
  assertAtLeastNumber(
    releasedRoute.rottenCombatObjectCount,
    1,
    "Stage 2 bank released key creates the intended encounter",
  );
  await page.close();

  return {
    route: "Rotten Stage 2 rejected-key to bank to inert Stage 3 docket boundary",
    before,
    unaffordable,
    keyLedger: keyLedgerAfterHold,
    docketHold,
    after,
    releasedRoute,
  };
}

async function installRottenNumericKeyLedger(page) {
  await page.evaluate(`(() => {
    const ledger = [];
    window.__FOXMAN_ROTTEN_NUMERIC_KEY_LEDGER__ = ledger;
    const record = (event) => {
      if (!/^Digit[1-7]$/.test(event.code)) return;
      ledger.push({
        type: event.type,
        key: event.key,
        code: event.code,
        repeat: event.repeat,
      });
    };
    window.addEventListener("keydown", record, true);
    window.addEventListener("keyup", record, true);
    return true;
  })()`);
}

async function readRottenNumericKeyLedger(page) {
  return page.evaluate(`(() => (
    window.__FOXMAN_ROTTEN_NUMERIC_KEY_LEDGER__ ?? []
  ).map((entry) => ({ ...entry })))()`);
}

async function holdRottenStageThreeDocketWithoutInput(page, { label, durationMs }) {
  const startedAt = Date.now();
  let samples = 0;
  let state;
  while (Date.now() - startedAt < durationMs) {
    state = await page.dataset([
      "rottenPhase",
      "rottenStage",
      "rottenSelectedRoute",
      "rottenLivingEnemies",
      "rottenCombatObjectCount",
      "canvasCount",
    ]);
    assertEqual(state.rottenPhase, "route-choice", `${label} held phase`);
    assertEqual(state.rottenStage, "3", `${label} held stage`);
    assertEqual(state.rottenSelectedRoute, "", `${label} held route selection`);
    assertEqual(state.rottenLivingEnemies, "0", `${label} held living enemies`);
    assertEqual(state.rottenCombatObjectCount, "0", `${label} held combat objects`);
    assertEqual(state.canvasCount, 1, `${label} held canvas`);
    samples += 1;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return { durationMs: Date.now() - startedAt, samples, state };
}

function rottenStageTwoMarketTruthKeys() {
  return [
    ...rottenMarketTruthKeys(),
    "rottenSeed",
    "rottenPlanId",
    "rottenEliteBountyGraft",
    "rottenEliteDefeatedCount",
    "rottenEliteDefeatedVariants",
    "rottenBuildSummary",
  ];
}

async function waitForOpenRottenStageTwoMarket(page, label) {
  try {
    await page.waitForDataset("rottenPhase", "reward-choice", 45_000);
    await page.waitForDataset("rottenStage", "2", 2_000);
    await page.waitForDataset("rottenMarketStatus", "open", 2_000);
  } catch (error) {
    const stalled = await page.dataset(rottenStageTwoMarketTruthKeys());
    throw new Error(`${label} did not open the Stage 2 market: ${JSON.stringify(stalled)}; ${error}`);
  }
  await new Promise((resolve) => setTimeout(resolve, 340));
  const state = await page.dataset(rottenStageTwoMarketTruthKeys());
  assertEqual(state.rottenRewardDecisionCount, "1", `${label} prior decision count`);
  assertEqual(state.rottenMarketStage, "2", `${label} market stage`);
  assertEqual(state.rottenOfferIds.split("|").filter(Boolean).length, 3, `${label} offer count`);
  assertEqual(new Set(state.rottenOfferIds.split("|")).size, 3, `${label} unique offers`);
  assertEqual(state.rottenOfferPrices.split("|").filter(Boolean).length, 3, `${label} price count`);
  assertEqual(state.rottenCombatObjectCount, "0", `${label} reward cleanup`);
  assertEqual(state.canvasCount, 1, `${label} canvas count`);
  return state;
}

async function assertRottenStageThreeDocket(page, {
  label,
  expectedRoutes,
  expectedHistory,
  evidence,
}) {
  try {
    await page.waitForDataset("rottenPhase", "route-choice", 2_000);
  } catch (error) {
    const stalled = await page.dataset([
      ...rottenStageTwoMarketTruthKeys(),
      "rottenRewardFeedback",
      "rottenRewardFeedbackReason",
    ]);
    throw new Error(`${label} did not hold the Stage 3 docket: ${JSON.stringify(stalled)}; ${error}`);
  }
  await new Promise((resolve) => setTimeout(resolve, 180));
  const state = await page.dataset([
    ...rottenStageTwoMarketTruthKeys(),
    "rottenRewardFeedback",
    "rottenRewardFeedbackReason",
  ]);
  assertEqual(state.rottenStage, "3", `${label} Stage 3 number`);
  assertEqual(state.rottenRouteOptions, expectedRoutes, `${label} planned Stage 3 routes`);
  assertEqual(state.rottenSelectedRoute, "", `${label} Stage 3 route remains unselected`);
  assertEqual(state.rottenRouteHistory, expectedHistory, `${label} two-entry history`);
  assertEqual(state.rottenRewardDecisionCount, "2", `${label} two decisions`);
  assertEqual(state.rottenMarketStatus, "resolved", `${label} market resolved`);
  assertEqual(state.rottenMarketStage, "2", `${label} resolved market provenance`);
  assertEqual(state.rottenOfferIds, "", `${label} no active offers`);
  assertEqual(state.rottenLivingEnemies, "0", `${label} no Stage 3 enemies`);
  assertEqual(state.rottenCombatObjectCount, "0", `${label} no Stage 3 combat objects`);
  assertEqual(state.canvasCount, 1, `${label} one canvas`);
  await assertNoMissingTextureGreen(page, `${label} Stage 3 docket`);
  await captureEvidence(page, evidence);

  const inertTruth = pickDataset(state, [
    ...rottenStageTwoMarketTruthKeys(),
    "rottenRewardFeedback",
    "rottenRewardFeedbackReason",
  ]);
  for (const key of ["4", "5"]) {
    await page.key(key);
  }
  await new Promise((resolve) => setTimeout(resolve, 180));
  const afterLateInput = await page.dataset([
    ...rottenStageTwoMarketTruthKeys(),
    "rottenRewardFeedback",
    "rottenRewardFeedbackReason",
  ]);
  assertDeepEqual(
    pickDataset(afterLateInput, [
      ...rottenStageTwoMarketTruthKeys(),
      "rottenRewardFeedback",
      "rottenRewardFeedbackReason",
    ]),
    inertTruth,
    `${label} late resolved-market inputs are inert at the operative Stage 3 docket`,
  );
  return afterLateInput;
}

async function smokeRottenStageTwoRetry(browser) {
  const page = await browser.open(
    "/?mode=rotten&seed=GAUNTLET-ALPHA&smokeAuto=1&smoke=rottenStageTwoRetry",
    { viewport: { width: 1366, height: 768 } },
  );
  await page.waitForDataset("rottenPhase", "loadout");
  const initial = await page.dataset([
    "rottenPhase",
    "rottenSeed",
    "rottenPlanId",
    "rottenStage",
    "rottenRouteOptions",
    "rottenGraft",
    "rottenTraceDigest",
    "rottenCombatObjectCount",
  ]);
  await enterRottenStageTwo(page, {
    label: "Stage 2 death/retry",
    weaponKey: "3",
    skillKey: "6",
    stageOneRouteKey: "2",
    stageOneMarketKey: "1",
    stageTwoRouteKey: "2",
  });
  const entered = await page.dataset([
    ...rottenStageTwoMarketTruthKeys(),
    "rottenStageWavesCleared",
  ]);
  assertEqual(entered.rottenStage, "2", "Stage 2 retry entered stage");
  assertEqual(entered.rottenSelectedRoute, "late-fee-chapel", "Stage 2 retry route");
  assertEqual(entered.rottenUpgrades, "dead-letter", "Stage 2 retry carried upgrade");
  assertEqual(
    entered.rottenRouteHistory,
    "1:bailiffs-ramp:upgrade:dead-letter",
    "Stage 2 retry carried history",
  );
  if (Number(entered.rottenCombatObjectCount) <= 0) {
    throw new Error(`Stage 2 retry did not enter live combat: ${JSON.stringify(entered)}`);
  }
  try {
    await page.waitForDataset("rottenPhase", "dead", 30_000);
  } catch (error) {
    const stalled = await page.dataset([
      ...rottenStageTwoMarketTruthKeys(),
      "rottenEnemyStates",
      "rottenEnemyTell",
      "rottenStageWavesCleared",
    ]);
    throw new Error(`Stage 2 retry did not reach an actual death: ${JSON.stringify(stalled)}; ${error}`);
  }
  const dead = await page.dataset([
    ...rottenStageTwoMarketTruthKeys(),
    "rottenStageWavesCleared",
    "rottenEnemyStates",
  ]);
  assertEqual(dead.rottenStage, "2", "Stage 2 retry death stage");
  assertEqual(dead.rottenPhase, "dead", "Stage 2 retry death phase");
  assertEqual(dead.rottenHp, "0/6", "Stage 2 retry actual death HP");
  assertEqual(dead.rottenUpgrades, "dead-letter", "Stage 2 retry death ownership");
  assertEqual(dead.rottenRewardDecisionCount, "1", "Stage 2 retry prior market decision");
  if (!String(dead.rottenSpawnHistory).includes("2.1:clerk,writ-runner")) {
    throw new Error(`Stage 2 retry missing live Stage 2 spawn: ${dead.rottenSpawnHistory}`);
  }
  if (Number(dead.rottenCombatObjectCount) <= 0) {
    throw new Error(`Stage 2 death did not retain owned objects before R: ${dead.rottenCombatObjectCount}`);
  }
  await captureEvidence(page, "rotten-stage-two-death-before-retry-1366x768.png");

  await page.key("r");
  const retryKeys = [
    ...rottenStageTwoMarketTruthKeys(),
    "rottenStageWavesCleared",
    "rottenEliteCount",
  ];
  const retried = await waitForTwoAnimationFramesOfTruth(
    page,
    retryKeys,
    (state) => state.rottenPhase === "loadout"
      && state.rottenStage === "1"
      && state.rottenRouteOptions === "unfiled-alley|bailiffs-ramp"
      && state.rottenSelectedRoute === ""
      && state.rottenWeapon === ""
      && state.rottenSkill === ""
      && state.rottenWave === "0"
      && state.rottenStageWavesCleared === "0"
      && state.rottenWavesCleared === "0"
      && state.rottenSpawnHistory === ""
      && state.rottenGraft === "3"
      && state.rottenUpgrades === ""
      && state.rottenRouteHistory === ""
      && state.rottenMarketStatus === ""
      && state.rottenMarketChoice === ""
      && state.rottenRewardDecisionCount === "0"
      && state.rottenOfferIds === ""
      && state.rottenHp === ""
      && state.rottenEliteCount === "0"
      && state.rottenEliteDefeatedCount === "0"
      && state.rottenEliteBountyGraft === "0"
      && state.rottenCombatObjectCount === "0",
    8_000,
  );
  assertEqual(retried.rottenSeed, initial.rottenSeed, "Stage 2 retry same seed");
  assertEqual(retried.rottenPlanId, initial.rottenPlanId, "Stage 2 retry same plan");
  assertEqual(retried.rottenTraceDigest, initial.rottenTraceDigest, "Stage 2 retry baseline trace");
  assertEqual(retried.rottenMarketStage, "", "Stage 2 retry market provenance reset");
  assertEqual(retried.rottenMarketRoute, "", "Stage 2 retry market route reset");
  assertEqual(retried.rottenEliteDefeatedVariants, "", "Stage 2 retry elite variants reset");
  const retryBuild = JSON.parse(retried.rottenBuildSummary);
  assertEqual(String(retryBuild.weaponPatternRepeatOrPierce), "false", "Stage 2 retry build reset");
  assertEqual(String(retryBuild.marketDiscount), "0", "Stage 2 retry discount reset");
  assertEqual(retried.canvasCount, 1, "Stage 2 retry one canvas");
  await assertNoMissingTextureGreen(page, "Stage 2 retry clean loadout");
  await captureEvidence(page, "rotten-stage-two-retry-clean-1366x768.png");
  await page.key("r");
  await new Promise((resolve) => setTimeout(resolve, 150));
  const afterInertR = await page.dataset(retryKeys);
  assertDeepEqual(afterInertR, retried, "Stage 2 post-retry R is inert");
  await page.close();

  return {
    route: "Rotten Stage 2 actual death to one-key same-seed clean retry",
    initial,
    entered,
    dead,
    retried,
  };
}

async function enterRottenStageThree(page, {
  label = "Stage 3 helper",
  weaponKey,
  skillKey,
  stageOneRouteKey,
  stageOneMarketKey,
  stageTwoRouteKey,
  stageTwoMarketKey,
  stageThreeRouteKey,
}) {
  await enterRottenStageTwo(page, {
    label,
    weaponKey,
    skillKey,
    stageOneRouteKey,
    stageOneMarketKey,
    stageTwoRouteKey,
  });
  try {
    await page.waitForDataset("rottenPhase", "reward-choice", 50_000);
    await page.waitForDataset("rottenStage", "2", 2_000);
  } catch (error) {
    const stalled = await page.dataset(rottenStageThreeTruthKeys());
    throw new Error(`${label} did not reach the second market: ${JSON.stringify(stalled)}; ${error}`);
  }
  await new Promise((resolve) => setTimeout(resolve, 340));
  const secondMarket = await page.dataset(rottenStageThreeTruthKeys());
  assertEqual(secondMarket.rottenMarketStage, "2", `${label} second market stage`);
  assertEqual(secondMarket.rottenRewardDecisionCount, "1", `${label} first decision carry`);
  assertEqual(secondMarket.rottenCombatObjectCount, "0", `${label} second market cleanup`);
  const resolvedStageTwoMarketKey = stageTwoMarketKey === "heal-or-bank"
    ? secondMarket.rottenHealAvailable === "true" ? "4" : "5"
    : stageTwoMarketKey;
  await page.key(resolvedStageTwoMarketKey);
  await page.waitForDataset("rottenStage", "3", 5_000);
  await page.waitForDataset("rottenPhase", "route-choice", 5_000);
  const docket = await page.dataset(rottenStageThreeTruthKeys());
  assertEqual(docket.rottenRewardDecisionCount, "2", `${label} second decision carry`);
  assertEqual(docket.rottenCombatObjectCount, "0", `${label} Stage 3 docket cleanup`);
  await new Promise((resolve) => setTimeout(resolve, 300));
  await page.key(stageThreeRouteKey);
  await page.waitForDataset("rottenPhase", "encounter", 5_000);
  await page.waitForDataset("rottenStage", "3", 5_000);
  return { secondMarket, docket, resolvedStageTwoMarketKey };
}

function rottenStageThreeTruthKeys() {
  return [
    ...rottenStageTwoMarketTruthKeys(),
    "rottenKillCount",
    "rottenEnemyStates",
    "rottenEnemyGeometry",
    "rottenEnemyReacquisition",
    "rottenStageWavesCleared",
    "rottenEliteCount",
    "rottenCurrentEliteCount",
    "rottenEliteDefeatedCount",
    "rottenEliteDefeatedRoles",
    "rottenBossId",
    "rottenBossDossierReady",
    "rottenBossObjectCount",
    "rottenBossHealth",
    "rottenBossPhase",
    "rottenElapsedActiveMilliseconds",
    "rottenResult",
  ];
}

async function smokeRottenStageThreeTopology(browser) {
  const cases = [
    {
      seed: "GAUNTLET-ALPHA",
      planId: "RR1-1C93B57F",
      stageOneRouteKey: "2",
      stageOneRoute: "bailiffs-ramp",
      stageTwoRouteKey: "1",
      stageTwoRoute: "seized-goods-lift",
      stageThreeRouteKey: "1",
      stageThreeRoute: "collection-parade",
      stageThreeOptions: "collection-parade|garnish-gallery",
      waves: [
        "3.1:clerk,writ-runner,shield-auditor",
        "3.2:writ-runner,bailiff,sump-scribe",
      ],
      graft: "21",
      eliteCount: "2",
      eliteVariants: "gilded|overdue",
      eliteRoles: "clerk|writ-runner",
      kills: "15",
      viewport: { width: 1366, height: 768 },
      evidence: "rotten-stage-three-collection-live-1366x768.png",
    },
    {
      seed: "GAUNTLET-ALPHA",
      planId: "RR1-1C93B57F",
      stageOneRouteKey: "2",
      stageOneRoute: "bailiffs-ramp",
      stageTwoRouteKey: "1",
      stageTwoRoute: "seized-goods-lift",
      stageThreeRouteKey: "2",
      stageThreeRoute: "garnish-gallery",
      stageThreeOptions: "collection-parade|garnish-gallery",
      waves: [
        "3.1:clerk,writ-runner",
        "3.2:clerk,sump-scribe,shield-auditor",
      ],
      graft: "18",
      eliteCount: "0",
      eliteVariants: "",
      eliteRoles: "",
      kills: "14",
      viewport: { width: 1920, height: 1080 },
      evidence: "rotten-stage-three-garnish-live-1920x1080.png",
    },
    {
      seed: "BILE-PROOF",
      planId: "RR1-91887DBF",
      stageOneRouteKey: "1",
      stageOneRoute: "bailiffs-ramp",
      stageTwoRouteKey: "2",
      stageTwoRoute: "bile-registry",
      stageThreeRouteKey: "1",
      stageThreeRoute: "appeal-furnace",
      stageThreeOptions: "appeal-furnace|collection-parade",
      waves: [
        "3.1:sump-scribe,bailiff",
        "3.2:sump-scribe,clerk,shield-auditor",
      ],
      graft: "18",
      eliteCount: "0",
      eliteVariants: "",
      eliteRoles: "",
      kills: "14",
      viewport: { width: 1366, height: 768 },
      evidence: "rotten-stage-three-appeal-live-1366x768.png",
    },
  ];
  const results = [];

  for (const testCase of cases) {
    const page = await browser.open(
      `/?mode=rotten&seed=${testCase.seed}&smokeAuto=1&smoke=rottenStageThreeTopology`,
      { viewport: testCase.viewport },
    );
    await page.waitForDataset("rottenPhase", "loadout");
    await enterRottenStageThree(page, {
      label: testCase.stageThreeRoute,
      weaponKey: "3",
      skillKey: "6",
      stageOneRouteKey: testCase.stageOneRouteKey,
      stageOneMarketKey: "5",
      stageTwoRouteKey: testCase.stageTwoRouteKey,
      stageTwoMarketKey: "5",
      stageThreeRouteKey: testCase.stageThreeRouteKey,
    });
    const entered = await page.dataset(rottenStageThreeTruthKeys());
    assertEqual(entered.rottenPlanId, testCase.planId, `${testCase.stageThreeRoute} plan`);
    assertEqual(entered.rottenRouteOptions, testCase.stageThreeOptions, `${testCase.stageThreeRoute} options`);
    assertEqual(entered.rottenSelectedRoute, testCase.stageThreeRoute, `${testCase.stageThreeRoute} real key`);
    if (!String(entered.rottenSpawnHistory).includes(testCase.waves[0])) {
      throw new Error(`${testCase.stageThreeRoute} missing first roster: ${entered.rottenSpawnHistory}`);
    }
    if (Number(entered.rottenCombatObjectCount) <= 0) {
      throw new Error(`${testCase.stageThreeRoute} did not own live combat objects`);
    }
    await assertNoMissingTextureGreen(page, `${testCase.stageThreeRoute} live arena`);
    await captureEvidence(page, testCase.evidence);

    await page.waitForDataset("rottenPhase", "reward-choice", 55_000);
    const reward = await page.dataset(rottenStageThreeTruthKeys());
    assertEqual(reward.rottenStageWavesCleared, "2", `${testCase.stageThreeRoute} stage waves`);
    assertEqual(reward.rottenWavesCleared, "6", `${testCase.stageThreeRoute} cumulative waves`);
    for (const roster of testCase.waves) {
      if (!String(reward.rottenSpawnHistory).includes(roster)) {
        throw new Error(`${testCase.stageThreeRoute} missing frozen roster ${roster}`);
      }
    }
    assertEqual(reward.rottenGraft, testCase.graft, `${testCase.stageThreeRoute} graft`);
    assertEqual(reward.rottenEliteCount, testCase.eliteCount, `${testCase.stageThreeRoute} elite count`);
    assertEqual(reward.rottenEliteDefeatedVariants, testCase.eliteVariants, `${testCase.stageThreeRoute} elite variants`);
    assertEqual(reward.rottenEliteDefeatedRoles, testCase.eliteRoles, `${testCase.stageThreeRoute} elite roles`);
    assertEqual(reward.rottenKillCount, testCase.kills, `${testCase.stageThreeRoute} kill count`);
    assertEqual(reward.rottenRewardDecisionCount, "2", `${testCase.stageThreeRoute} prior decisions`);
    assertEqual(reward.rottenMarketStage, "3", `${testCase.stageThreeRoute} third market`);
    assertEqual(reward.rottenCombatObjectCount, "0", `${testCase.stageThreeRoute} reward cleanup`);
    assertEqual(reward.rottenBossObjectCount, "0", `${testCase.stageThreeRoute} no boss object`);
    assertEqual(reward.canvasCount, 1, `${testCase.stageThreeRoute} one canvas`);
    if (!String(reward.rottenRouteHistory).endsWith(`3:${testCase.stageThreeRoute}:pending`)) {
      throw new Error(`${testCase.stageThreeRoute} pending third history mismatch: ${reward.rottenRouteHistory}`);
    }
    await captureEvidence(
      page,
      `rotten-stage-three-${testCase.stageThreeRoute}-market-${testCase.viewport.width}x${testCase.viewport.height}.png`,
    );
    await page.close();
    results.push({ ...testCase, entered, reward });
  }

  return { route: "Rotten Stage 3 all frozen route topologies", cases: results };
}

async function smokeRottenStageThreeElites(browser) {
  const cases = [
    {
      label: "Collection double elite",
      seed: "GAUNTLET-ALPHA",
      planId: "RR1-1C93B57F",
      stageOneRouteKey: "2",
      stageOneMarketKey: "5",
      stageTwoRouteKey: "1",
      stageTwoMarketKey: "5",
      stageThreeRouteKey: "1",
      expectedRoles: ["clerk", "writ-runner"],
      expectedVariants: ["gilded", "overdue"],
      enteredGraft: "12",
      rewardGraft: "21",
      enteredBounty: "0",
      rewardBounty: "2",
      viewport: { width: 1366, height: 768 },
    },
    {
      label: "Collection Graft Dividend",
      seed: "DIVIDEND-CHAPEL-1",
      planId: "RR1-D66285FF",
      stageOneRouteKey: "2",
      stageOneMarketKey: "2",
      stageTwoRouteKey: "1",
      stageTwoMarketKey: "5",
      stageThreeRouteKey: "2",
      expectedRoles: ["clerk", "bailiff"],
      expectedVariants: ["gilded", "overdue"],
      enteredGraft: "9",
      rewardGraft: "20",
      enteredBounty: "2",
      rewardBounty: "6",
      viewport: { width: 1920, height: 1080 },
      dividend: true,
    },
  ];
  const results = [];

  for (const testCase of cases) {
    const page = await browser.open(
      `/?mode=rotten&seed=${testCase.seed}&smokeAuto=1&smoke=rottenStageThreeElites`,
      { viewport: testCase.viewport },
    );
    await page.waitForDataset("rottenPhase", "loadout");
    await enterRottenStageThree(page, {
      label: testCase.label,
      weaponKey: "3",
      skillKey: "6",
      stageOneRouteKey: testCase.stageOneRouteKey,
      stageOneMarketKey: testCase.stageOneMarketKey,
      stageTwoRouteKey: testCase.stageTwoRouteKey,
      stageTwoMarketKey: testCase.stageTwoMarketKey,
      stageThreeRouteKey: testCase.stageThreeRouteKey,
    });
    await installRottenEliteLatch(page);
    const entered = await page.dataset(rottenStageThreeTruthKeys());
    assertEqual(entered.rottenPlanId, testCase.planId, `${testCase.label} plan`);
    assertEqual(entered.rottenSelectedRoute, "collection-parade", `${testCase.label} route`);
    assertEqual(entered.rottenGraft, testCase.enteredGraft, `${testCase.label} entered graft`);
    assertEqual(entered.rottenEliteBountyGraft, testCase.enteredBounty, `${testCase.label} prior bounty`);
    assertEqual(entered.rottenCurrentEliteCount, "1", `${testCase.label} one Wave 1 elite`);
    if (!String(entered.rottenEnemyStates).includes(`:${testCase.expectedVariants[0]}:`)) {
      throw new Error(`${testCase.label} missing Wave 1 elite treatment: ${entered.rottenEnemyStates}`);
    }
    await captureEvidence(
      page,
      `rotten-stage-three-collection-wave1-${testCase.viewport.width}x${testCase.viewport.height}.png`,
    );

    await waitFor(async () => {
      const state = await page.dataset(["rottenPhase", "rottenSpawnHistory", "rottenEnemyStates"]);
      return state.rottenPhase === "encounter"
        && String(state.rottenSpawnHistory).includes("3.2:")
        && String(state.rottenEnemyStates).includes(`:${testCase.expectedVariants[1]}:`);
    }, 35_000, 40);
    await captureEvidence(
      page,
      `rotten-stage-three-collection-wave2-${testCase.viewport.width}x${testCase.viewport.height}.png`,
    );
    await page.waitForDataset("rottenPhase", "reward-choice", 55_000);
    const observation = await readRottenEliteLatch(page);
    const reward = await page.dataset([
      ...rottenStageThreeTruthKeys(),
      "rottenEliteArmorBreakCount",
      "rottenEliteEnrageCount",
    ]);
    assertEqual(reward.rottenGraft, testCase.rewardGraft, `${testCase.label} reward graft`);
    assertEqual(reward.rottenEliteCount, "2", `${testCase.label} exact Stage 3 elites`);
    assertEqual(reward.rottenEliteDefeatedCount, "2", `${testCase.label} exact defeats`);
    assertEqual(
      reward.rottenEliteDefeatedVariants,
      testCase.expectedVariants.join("|"),
      `${testCase.label} deterministic variant order`,
    );
    if (!String(reward.rottenEliteDefeatedRoles).endsWith(testCase.expectedRoles.join("|"))) {
      throw new Error(`${testCase.label} deterministic role order mismatch: ${reward.rottenEliteDefeatedRoles}`);
    }
    assertEqual(reward.rottenEliteBountyGraft, testCase.rewardBounty, `${testCase.label} exact bounty`);
    assertEqual(reward.rottenEliteArmorBreakCount, "1", `${testCase.label} gilded armor break`);
    assertEqual(reward.rottenEliteEnrageCount, "1", `${testCase.label} overdue enrage`);
    assertEqual(String(observation.maxArmorPips), "1", `${testCase.label} visible armor pip`);
    assertEqual(String(observation.sawAliveEnraged), "true", `${testCase.label} live overdue enrage`);
    for (const variant of testCase.expectedVariants) {
      if (!observation.variants.includes(variant)) {
        throw new Error(`${testCase.label} latch missed ${variant}: ${JSON.stringify(observation)}`);
      }
    }
    for (const role of testCase.expectedRoles) {
      if (!observation.baseRoleWindups.includes(role)) {
        throw new Error(`${testCase.label} hid ${role} base tell: ${JSON.stringify(observation)}`);
      }
    }
    if (testCase.dividend) {
      assertEqual(reward.rottenUpgrades, "graft-dividend", "Dividend carried ownership");
      assertEqual(reward.rottenOfferIds, "petty-grudge|hangover-hide|compound-interest", "Dividend Stage 3 offers");
      assertEqual(reward.rottenOfferPrices, "4|4|5", "Dividend Stage 3 discount");
      const build = JSON.parse(reward.rottenBuildSummary);
      assertEqual(String(build.elitesAwardBonusGraft), "true", "Dividend elite bonus build");
      assertEqual(String(build.marketDiscount), "1", "Dividend market discount build");
      assertEqual(
        String(Number(reward.rottenEliteBountyGraft) - Number(entered.rottenEliteBountyGraft)),
        "4",
        "Dividend exact two-elite Stage 3 bounty delta",
      );
      assertEqual(
        String(Number(reward.rottenGraft) - Number(entered.rottenGraft)),
        "11",
        "Dividend Stage 3 base-plus-bounty delta",
      );
    }
    assertEqual(reward.rottenCombatObjectCount, "0", `${testCase.label} cleanup`);
    await page.close();
    results.push({ ...testCase, entered, observation, reward });
  }

  return { route: "Rotten Stage 3 deterministic double elites and Dividend bounty", cases: results };
}

async function installRottenStageThreeRoleLatch(page) {
  await page.evaluate(`(() => {
    const observation = {
      states: {},
      onscreenRoles: [],
      maxFeetY: 0,
      maxBodyBottom: 0,
      invalidGround: [],
    };
    window.__FOXMAN_ROTTEN_STAGE_THREE_ROLES__ = observation;
    const sample = () => {
      const data = document.body.dataset;
      for (const entry of String(data.rottenEnemyStates ?? "").split("|").filter(Boolean)) {
        const [role, state] = entry.split(":");
        observation.states[role] ??= [];
        if (!observation.states[role].includes(state)) observation.states[role].push(state);
      }
      for (const entry of String(data.rottenEnemyGeometry ?? "").split("|").filter(Boolean)) {
        const [role, state, alive, feetY, bodyBottom] = entry.split(":");
        if (alive !== "1") continue;
        observation.maxFeetY = Math.max(observation.maxFeetY, Number(feetY));
        observation.maxBodyBottom = Math.max(observation.maxBodyBottom, Number(bodyBottom));
        if (Number(feetY) > 587 || Number(bodyBottom) > 583) {
          observation.invalidGround.push([role, state, feetY, bodyBottom].join(":"));
        }
      }
      for (const entry of String(data.rottenEnemyReacquisition ?? "").split("|").filter(Boolean)) {
        const [role, , alive, onscreen] = entry.split(":");
        if (alive === "1" && onscreen === "1" && !observation.onscreenRoles.includes(role)) {
          observation.onscreenRoles.push(role);
        }
      }
      if (data.rottenPhase === "encounter") requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
    return true;
  })()`);
}

async function readRottenStageThreeRoleLatch(page) {
  return page.evaluate(`(() => {
    const observed = window.__FOXMAN_ROTTEN_STAGE_THREE_ROLES__;
    return {
      ...observed,
      states: Object.fromEntries(
        Object.entries(observed.states).map(([role, states]) => [role, [...states]]),
      ),
      onscreenRoles: [...observed.onscreenRoles],
      invalidGround: [...observed.invalidGround],
    };
  })()`);
}

async function smokeRottenStageThreeRoles(browser) {
  const results = [];

  const garnishPage = await browser.open(
    "/?mode=rotten&seed=GAUNTLET-ALPHA&smokeAuto=1&smoke=rottenStageThreeRoles",
    { viewport: { width: 1920, height: 1080 } },
  );
  await garnishPage.waitForDataset("rottenPhase", "loadout");
  await enterRottenStageThree(garnishPage, {
    label: "Garnish mixed-range roles",
    weaponKey: "3",
    skillKey: "6",
    stageOneRouteKey: "2",
    stageOneMarketKey: "5",
    stageTwoRouteKey: "1",
    stageTwoMarketKey: "5",
    stageThreeRouteKey: "2",
  });
  await installRottenStageThreeRoleLatch(garnishPage);
  await garnishPage.waitForDataset("rottenPhase", "reward-choice", 55_000);
  const garnishObservation = await readRottenStageThreeRoleLatch(garnishPage);
  const garnish = await garnishPage.dataset([
    ...rottenStageThreeTruthKeys(),
    "rottenAttackHitCount",
    "rottenSkillHitCount",
  ]);
  for (const role of ["clerk", "writ-runner", "shield-auditor"]) {
    const states = garnishObservation.states[role] ?? [];
    if (!states.includes("windup") || !states.some((state) => state === "active" || state === "recovery")) {
      throw new Error(`Garnish ${role} cycle incomplete: ${JSON.stringify(garnishObservation)}`);
    }
    if (!garnishObservation.onscreenRoles.includes(role)) {
      throw new Error(`Garnish ${role} never exposed onscreen truth: ${JSON.stringify(garnishObservation)}`);
    }
  }
  if (!garnishObservation.onscreenRoles.includes("sump-scribe")) {
    throw new Error(`Garnish sump-scribe never exposed onscreen truth: ${JSON.stringify(garnishObservation)}`);
  }
  assertEqual(garnishObservation.invalidGround.length, 0, "Garnish ground continuity");
  assertAtMostNumber(garnishObservation.maxFeetY, 587, "Garnish maximum feet Y");
  assertAtMostNumber(garnishObservation.maxBodyBottom, 583, "Garnish maximum body bottom");
  assertAtLeastNumber(garnish.rottenAttackHitCount, 1, "Garnish real weapon hits");
  assertAtLeastNumber(garnish.rottenSkillHitCount, 1, "Garnish real skill hits");
  assertEqual(garnish.rottenCombatObjectCount, "0", "Garnish cleanup");
  await captureEvidence(garnishPage, "rotten-stage-three-garnish-role-proof-1920x1080.png");
  await garnishPage.close();
  results.push({ route: "garnish-gallery", observation: garnishObservation, reward: garnish });

  const appealExpiryPage = await browser.open(
    "/?mode=rotten&seed=BILE-PROOF&smokeAuto=1&smoke=rottenStageThreeRoles",
    { viewport: { width: 1920, height: 1080 } },
  );
  await appealExpiryPage.waitForDataset("rottenPhase", "loadout");
  await enterRottenStageThree(appealExpiryPage, {
    label: "Appeal hazard expiry",
    weaponKey: "3",
    skillKey: "6",
    stageOneRouteKey: "1",
    stageOneMarketKey: "5",
    stageTwoRouteKey: "2",
    stageTwoMarketKey: "heal-or-bank",
    stageThreeRouteKey: "1",
  });
  await installRottenStageTwoMechanicsLatch(appealExpiryPage);
  await appealExpiryPage.waitForDataset("rottenPhase", "reward-choice", 60_000);
  const expiryMechanics = await readRottenStageTwoMechanicsLatch(appealExpiryPage);
  const expiryReward = await appealExpiryPage.dataset([
    ...rottenStageThreeTruthKeys(),
    ...rottenStageTwoMechanicTruthKeys(),
  ]);
  assertAtLeastNumber(expiryMechanics.maxHazardTelegraphCount, 1, "Appeal expiry telegraph");
  assertAtLeastNumber(expiryMechanics.maxHazardActivationCount, 1, "Appeal expiry activation");
  assertAtLeastNumber(expiryMechanics.maxHazardHitCount, 1, "Appeal legitimate hazard hit");
  assertAtLeastNumber(expiryMechanics.maxHazardExpiryCount, 1, "Appeal hazard expiry");
  assertEqual(expiryReward.rottenHazardActiveCount, "0", "Appeal expiry cleanup");
  assertEqual(expiryReward.rottenCombatObjectCount, "0", "Appeal expiry combat cleanup");
  await appealExpiryPage.close();
  results.push({ route: "appeal-furnace-expiry", mechanics: expiryMechanics, reward: expiryReward });

  const appealPage = await browser.open(
    "/?mode=rotten&seed=BILE-PROOF&smokeAuto=1&smoke=rottenStageThreeRoles",
    { viewport: { width: 1366, height: 768 } },
  );
  await appealPage.waitForDataset("rottenPhase", "loadout");
  await enterRottenStageThree(appealPage, {
    label: "Appeal hazard control",
    weaponKey: "4",
    skillKey: "7",
    stageOneRouteKey: "1",
    stageOneMarketKey: "5",
    stageTwoRouteKey: "2",
    stageTwoMarketKey: "heal-or-bank",
    stageThreeRouteKey: "1",
  });
  await installRottenStageThreeRoleLatch(appealPage);
  await installRottenStageTwoMechanicsLatch(appealPage);
  await waitFor(async () => {
    const state = await appealPage.dataset(["rottenPhase", "rottenHazardActiveCount"]);
    return state.rottenPhase === "encounter" && Number(state.rottenHazardActiveCount) >= 1;
  }, 18_000, 25);
  await captureEvidence(appealPage, "rotten-stage-three-appeal-hazard-live-1366x768.png");
  await appealPage.waitForDataset("rottenPhase", "reward-choice", 60_000);
  const appealObservation = await readRottenStageThreeRoleLatch(appealPage);
  const mechanics = await readRottenStageTwoMechanicsLatch(appealPage);
  const appeal = await appealPage.dataset([
    ...rottenStageThreeTruthKeys(),
    ...rottenStageTwoMechanicTruthKeys(),
    "rottenAttackHitCount",
    "rottenSkillHitCount",
  ]);
  assertAtLeastNumber(mechanics.maxHazardTelegraphCount, 1, "Appeal hazard telegraph");
  assertAtLeastNumber(mechanics.maxHazardActivationCount, 1, "Appeal hazard activation");
  assertAtLeastNumber(mechanics.maxHazardClearCount, 1, "Appeal Bribe Bomb clear");
  assertAtLeastNumber(mechanics.maxSkillHitCount, 1, "Appeal Bribe Bomb hit");
  assertEqual(appealObservation.invalidGround.length, 0, "Appeal ground continuity");
  for (const role of ["sump-scribe", "bailiff", "clerk", "shield-auditor"]) {
    if (!appealObservation.onscreenRoles.includes(role)) {
      throw new Error(`Appeal ${role} never exposed onscreen truth: ${JSON.stringify(appealObservation)}`);
    }
  }
  assertAtLeastNumber(appeal.rottenAttackHitCount, 1, "Appeal real weapon hits");
  assertAtLeastNumber(appeal.rottenSkillHitCount, 1, "Appeal real skill hits");
  assertEqual(appeal.rottenHazardActiveCount, "0", "Appeal hazard cleanup");
  assertEqual(appeal.rottenCombatObjectCount, "0", "Appeal combat cleanup");
  await captureEvidence(appealPage, "rotten-stage-three-appeal-role-proof-1366x768.png");
  await appealPage.close();
  results.push({ route: "appeal-furnace", observation: appealObservation, mechanics, reward: appeal });

  return { route: "Rotten Stage 3 mixed-range and hazard-control role proof", cases: results };
}

async function smokeRottenStageThreeBuilds(browser) {
  const cases = [
    {
      archetype: "Knife/Belch/Compound",
      upgradeId: "compound-interest",
      seed: "BUILD-PROOF-1",
      planId: "RR1-7F26E13F",
      weaponKey: "1",
      skillKey: "5",
      stageOneRouteKey: "2",
      stageOneMarketKey: "2",
      stageTwoRouteKey: "2",
      stageThreeRouteKey: "1",
      stageThreeRoute: "appeal-furnace",
      viewport: { width: 1366, height: 768 },
    },
    {
      archetype: "Pike/Stamp/Hangover",
      upgradeId: "hangover-hide",
      seed: "BUILD-PROOF-2",
      planId: "RR1-A1F7D62F",
      weaponKey: "3",
      skillKey: "6",
      stageOneRouteKey: "1",
      stageOneMarketKey: "2",
      stageTwoRouteKey: "2",
      stageThreeRouteKey: "1",
      stageThreeRoute: "garnish-gallery",
      viewport: { width: 1920, height: 1080 },
    },
    {
      archetype: "Spitter/Bomb/Dead Letter",
      upgradeId: "dead-letter",
      seed: "BUILD-PROOF-0",
      planId: "RR1-BFDF8B11",
      weaponKey: "4",
      skillKey: "7",
      stageOneRouteKey: "1",
      stageOneMarketKey: "2",
      stageTwoRouteKey: "1",
      stageThreeRouteKey: "1",
      stageThreeRoute: "garnish-gallery",
      viewport: { width: 1366, height: 768 },
    },
  ];
  const results = [];

  for (const testCase of cases) {
    const page = await browser.open(
      `/?mode=rotten&seed=${testCase.seed}&smokeAuto=1&smoke=rottenStageThreeBuilds`,
      { viewport: testCase.viewport },
    );
    await page.waitForDataset("rottenPhase", "loadout");
    const transition = await enterRottenStageThree(page, {
      label: testCase.archetype,
      weaponKey: testCase.weaponKey,
      skillKey: testCase.skillKey,
      stageOneRouteKey: testCase.stageOneRouteKey,
      stageOneMarketKey: testCase.stageOneMarketKey,
      stageTwoRouteKey: testCase.stageTwoRouteKey,
      stageTwoMarketKey: "heal-or-bank",
      stageThreeRouteKey: testCase.stageThreeRouteKey,
    });
    const entered = await page.dataset(rottenStageThreeTruthKeys());
    assertEqual(entered.rottenPlanId, testCase.planId, `${testCase.archetype} plan`);
    assertEqual(entered.rottenSelectedRoute, testCase.stageThreeRoute, `${testCase.archetype} route`);
    assertEqual(entered.rottenUpgrades, testCase.upgradeId, `${testCase.archetype} carried upgrade`);
    await captureEvidence(
      page,
      `rotten-stage-three-build-${testCase.upgradeId}-live-${testCase.viewport.width}x${testCase.viewport.height}.png`,
    );
    await page.waitForDataset("rottenPhase", "reward-choice", 65_000);
    const reward = await page.dataset([
      ...rottenStageThreeTruthKeys(),
      "rottenAttackHitCount",
      "rottenSkillHitCount",
      "rottenMaxCompoundBonusDamage",
      "rottenMaxTotalWeaponBonusDamage",
      "rottenDeadLetterCount",
      "rottenDeadLetterHitCount",
    ]);
    const [currentHp, maxHp] = parseHealth(reward.rottenHp, `${testCase.archetype} Stage 3 HP`);
    assertAtLeastNumber(currentHp, 1, `${testCase.archetype} alive margin`);
    assertAtLeastNumber(reward.rottenAttackHitCount, 1, `${testCase.archetype} Stage 3 weapon hits`);
    assertAtLeastNumber(reward.rottenSkillHitCount, 1, `${testCase.archetype} Stage 3 skill hits`);
    assertEqual(reward.rottenWavesCleared, "6", `${testCase.archetype} six-wave carry`);
    assertEqual(reward.rottenCombatObjectCount, "0", `${testCase.archetype} reward cleanup`);
    const build = JSON.parse(reward.rottenBuildSummary);

    if (testCase.upgradeId === "compound-interest") {
      assertEqual(reward.rottenMaxCompoundBonusDamage, "2", "Compound Stage 3 cap");
      assertAtLeastNumber(reward.rottenMaxTotalWeaponBonusDamage, 2, "Compound Stage 3 material damage");
      assertEqual(String(build.boundedRapidHitDamageBonus), "true", "Compound carried build flag");
    } else if (testCase.upgradeId === "hangover-hide") {
      assertEqual(String(maxHp), "8", "Hangover Stage 3 max HP");
      assertEqual(String(build.maxHealthBonus), "2", "Hangover carried build bonus");
    } else {
      assertAtLeastNumber(reward.rottenDeadLetterCount, 1, "Dead Letter Stage 3 emissions");
      assertAtLeastNumber(reward.rottenDeadLetterHitCount, 1, "Dead Letter Stage 3 hits");
      assertEqual(String(build.weaponPatternRepeatOrPierce), "true", "Dead Letter carried build flag");
    }
    await captureEvidence(
      page,
      `rotten-stage-three-build-${testCase.upgradeId}-market-${testCase.viewport.width}x${testCase.viewport.height}.png`,
    );
    await page.close();
    results.push({ ...testCase, transition, entered, reward });
  }

  return { route: "Rotten Stage 3 three required carried build proofs", cases: results };
}

async function waitForOpenRottenStageThreeMarket(page, label) {
  try {
    await page.waitForDataset("rottenPhase", "reward-choice", 65_000);
    await page.waitForDataset("rottenStage", "3", 2_000);
    await page.waitForDataset("rottenMarketStatus", "open", 2_000);
  } catch (error) {
    const stalled = await page.dataset(rottenStageThreeTruthKeys());
    throw new Error(`${label} did not open the third market: ${JSON.stringify(stalled)}; ${error}`);
  }
  await new Promise((resolve) => setTimeout(resolve, 340));
  const state = await page.dataset(rottenStageThreeTruthKeys());
  assertEqual(state.rottenRewardDecisionCount, "2", `${label} prior decision count`);
  assertEqual(state.rottenMarketStage, "3", `${label} market stage`);
  assertEqual(state.rottenOfferIds.split("|").filter(Boolean).length, 3, `${label} offer count`);
  assertEqual(new Set(state.rottenOfferIds.split("|")).size, 3, `${label} unique offers`);
  assertEqual(state.rottenOfferPrices.split("|").filter(Boolean).length, 3, `${label} price count`);
  assertEqual(state.rottenCombatObjectCount, "0", `${label} reward cleanup`);
  assertEqual(state.rottenBossObjectCount, "0", `${label} no boss object before decision`);
  assertEqual(state.canvasCount, 1, `${label} canvas count`);
  return state;
}

async function assertRottenCommissionerDossier(page, {
  label,
  expectedHistory,
  expectedUpgrades,
  expectedGraft,
  expectedHp,
  expectedChoice,
  expectedTraceEvent,
  expectedKillCount,
  evidence,
}) {
  await page.waitForDataset("rottenPhase", "boss", 5_000);
  await new Promise((resolve) => setTimeout(resolve, 220));
  const keys = [
    ...rottenStageThreeTruthKeys(),
    ...rottenStageTwoMechanicTruthKeys(),
    "rottenAttackCount",
    "rottenAttackHitCount",
    "rottenSkillUseCount",
    "rottenSkillHitCount",
    "rottenRewardFeedback",
    "rottenRewardFeedbackReason",
  ];
  const state = await page.dataset(keys);
  assertEqual(state.rottenStage, "3", `${label} Stage 3 provenance`);
  assertEqual(state.rottenSelectedRoute, "", `${label} no selected boss route`);
  assertEqual(state.rottenRouteHistory, expectedHistory, `${label} exact three-entry history`);
  assertEqual(state.rottenRewardDecisionCount, "3", `${label} exact decision count`);
  assertEqual(state.rottenUpgrades, expectedUpgrades, `${label} exact carried upgrades`);
  assertEqual(state.rottenGraft, expectedGraft, `${label} exact carried graft`);
  assertEqual(state.rottenHp, expectedHp, `${label} exact carried HP`);
  assertEqual(state.rottenMarketStatus, "resolved", `${label} resolved market`);
  assertEqual(state.rottenMarketStage, "3", `${label} market provenance`);
  assertEqual(state.rottenMarketChoice, expectedChoice, `${label} accepted choice`);
  assertEqual(state.rottenMarketTraceEvent, expectedTraceEvent, `${label} market trace`);
  assertEqual(state.rottenOfferIds, "", `${label} no active offers`);
  assertEqual(state.rottenOfferPrices, "", `${label} no active prices`);
  assertEqual(state.rottenBossId, "commissioner-of-consequences", `${label} boss identity`);
  assertEqual(state.rottenBossDossierReady, "true", `${label} dossier ready`);
  assertEqual(state.rottenBossHealth, "", `${label} null boss health`);
  assertEqual(state.rottenBossPhase, "", `${label} null boss phase`);
  assertEqual(state.rottenBossObjectCount, "0", `${label} zero boss objects`);
  assertEqual(state.rottenResult, "", `${label} no result claim`);
  assertEqual(state.rottenLivingEnemies, "0", `${label} zero living enemies`);
  assertEqual(state.rottenCombatObjectCount, "0", `${label} zero combat objects`);
  assertEqual(state.rottenKillCount, expectedKillCount, `${label} carried kills`);
  assertEqual(state.rottenWavesCleared, "6", `${label} six-wave carry`);
  assertEqual(state.canvasCount, 1, `${label} one canvas`);
  assertAtLeastNumber(state.rottenElapsedActiveMilliseconds, 1, `${label} active time`);
  await assertNoMissingTextureGreen(page, `${label} Commissioner dossier`);
  await captureEvidence(page, evidence);

  const inertTruth = pickDataset(state, keys);
  for (const key of ["1", "5", "Enter", "j", "k", "r"]) {
    await page.key(key);
  }
  await new Promise((resolve) => setTimeout(resolve, 220));
  const afterLateInput = await page.dataset(keys);
  assertDeepEqual(
    pickDataset(afterLateInput, keys),
    inertTruth,
    `${label} route, market, loadout, combat, and retry keys are inert`,
  );
  return afterLateInput;
}

async function smokeRottenStageThreeMarket(browser) {
  const purchasePage = await browser.open(
    "/?mode=rotten&seed=GAUNTLET-ALPHA&smokeAuto=1&smoke=rottenStageThreeMarket",
    { viewport: { width: 1920, height: 1080 } },
  );
  await purchasePage.waitForDataset("rottenPhase", "loadout");
  await enterRottenStageThree(purchasePage, {
    label: "Stage 3 purchase",
    weaponKey: "3",
    skillKey: "6",
    stageOneRouteKey: "2",
    stageOneMarketKey: "1",
    stageTwoRouteKey: "1",
    stageTwoMarketKey: "1",
    stageThreeRouteKey: "1",
  });
  const purchaseBefore = await waitForOpenRottenStageThreeMarket(purchasePage, "Stage 3 purchase");
  assertEqual(purchaseBefore.rottenPlanId, "RR1-1C93B57F", "Stage 3 purchase plan");
  assertEqual(purchaseBefore.rottenSelectedRoute, "collection-parade", "Stage 3 purchase route");
  assertEqual(purchaseBefore.rottenHp, "3/6", "Stage 3 purchase honest HP");
  assertEqual(purchaseBefore.rottenGraft, "10", "Stage 3 purchase purse");
  assertEqual(
    purchaseBefore.rottenUpgrades,
    "dead-letter|counterfeit-soles",
    "Stage 3 purchase prior ownership",
  );
  assertEqual(
    purchaseBefore.rottenOfferIds,
    "graft-dividend|red-tape-tourniquet|spite-reserve",
    "Stage 3 purchase deterministic eligible offers",
  );
  assertEqual(purchaseBefore.rottenOfferPrices, "6|4|5", "Stage 3 purchase exact prices");
  assertEqual(purchaseBefore.rottenEliteBountyGraft, "2", "Stage 3 purchase elite bounty");
  assertEqual(purchaseBefore.rottenEliteDefeatedCount, "2", "Stage 3 purchase elite defeats");
  assertEqual(
    purchaseBefore.rottenRouteHistory,
    "1:bailiffs-ramp:upgrade:dead-letter|2:seized-goods-lift:upgrade:counterfeit-soles|3:collection-parade:pending",
    "Stage 3 purchase pending history",
  );
  const purchaseTruth = pickDataset(purchaseBefore, rottenStageThreeTruthKeys());
  await purchasePage.key("7");
  await purchasePage.waitForDataset("rottenRewardFeedbackReason", "invalid-input", 2_000);
  const invalid = await purchasePage.dataset(rottenStageThreeTruthKeys());
  assertDeepEqual(
    pickDataset(invalid, rottenStageThreeTruthKeys()),
    purchaseTruth,
    "Stage 3 invalid input strict no-op",
  );
  await captureEvidence(purchasePage, "rotten-stage-three-market-purchase-open-1920x1080.png");
  await purchasePage.key("1");
  const purchase = await assertRottenCommissionerDossier(purchasePage, {
    label: "Stage 3 purchase",
    expectedHistory:
      "1:bailiffs-ramp:upgrade:dead-letter|2:seized-goods-lift:upgrade:counterfeit-soles|3:collection-parade:upgrade:graft-dividend",
    expectedUpgrades: "dead-letter|counterfeit-soles|graft-dividend",
    expectedGraft: "4",
    expectedHp: "3/6",
    expectedChoice: "upgrade:graft-dividend",
    expectedTraceEvent: "market:3:collection-parade:upgrade:graft-dividend:spent-6",
    expectedKillCount: "15",
    evidence: "rotten-commissioner-dossier-purchase-1920x1080.png",
  });
  const purchaseBuild = JSON.parse(purchase.rottenBuildSummary);
  assertEqual(String(purchaseBuild.weaponPatternRepeatOrPierce), "true", "Dossier Dead Letter carry");
  assertEqual(String(purchaseBuild.marketDiscount), "1", "Dossier Dividend carry");
  assertEqual(purchase.rottenEliteDefeatedVariants, "gilded|overdue", "Dossier elite variants");
  assertEqual(purchase.rottenEliteDefeatedRoles, "clerk|writ-runner", "Dossier elite roles");
  await purchasePage.close();

  const healPage = await browser.open(
    "/?mode=rotten&seed=GAUNTLET-ALPHA&smokeAuto=1&smoke=rottenStageThreeMarket",
    { viewport: { width: 1366, height: 768 } },
  );
  await healPage.waitForDataset("rottenPhase", "loadout");
  await enterRottenStageThree(healPage, {
    label: "Stage 3 heal",
    weaponKey: "3",
    skillKey: "6",
    stageOneRouteKey: "2",
    stageOneMarketKey: "5",
    stageTwoRouteKey: "1",
    stageTwoMarketKey: "5",
    stageThreeRouteKey: "1",
  });
  const healBefore = await waitForOpenRottenStageThreeMarket(healPage, "Stage 3 heal");
  const [healCurrent, healMax] = parseHealth(healBefore.rottenHp, "Stage 3 heal actual damaged HP");
  if (healCurrent >= healMax) {
    throw new Error(`Stage 3 heal route did not carry honest damage: ${healBefore.rottenHp}`);
  }
  assertAtLeastNumber(healCurrent, 1, "Stage 3 heal alive damaged HP");
  const expectedHealRestored = Math.min(2, healMax - healCurrent);
  const expectedHealHp = `${healCurrent + expectedHealRestored}/${healMax}`;
  const expectedHealGraft = String(Number(healBefore.rottenGraft) - 2);
  assertEqual(healBefore.rottenGraft, "21", "Stage 3 heal purse");
  assertEqual(healBefore.rottenHealAvailable, "true", "Stage 3 heal available");
  await captureEvidence(healPage, "rotten-stage-three-market-heal-open-1366x768.png");
  await healPage.key("4");
  const heal = await assertRottenCommissionerDossier(healPage, {
    label: "Stage 3 heal",
    expectedHistory:
      `1:bailiffs-ramp:bank|2:seized-goods-lift:bank|3:collection-parade:heal:${expectedHealRestored}`,
    expectedUpgrades: "",
    expectedGraft: expectedHealGraft,
    expectedHp: expectedHealHp,
    expectedChoice: `heal:${expectedHealRestored}`,
    expectedTraceEvent: `market:3:collection-parade:heal:${expectedHealRestored}:spent-2`,
    expectedKillCount: "15",
    evidence: "rotten-commissioner-dossier-heal-1366x768.png",
  });
  await healPage.close();

  const bankPage = await browser.open(
    "/?mode=rotten&seed=BILE-PROOF&smokeAuto=1&smoke=rottenStageThreeMarket",
    { viewport: { width: 1920, height: 1080 } },
  );
  await bankPage.waitForDataset("rottenPhase", "loadout");
  await enterRottenStageThree(bankPage, {
    label: "Stage 3 full-health bank",
    weaponKey: "3",
    skillKey: "6",
    stageOneRouteKey: "1",
    stageOneMarketKey: "5",
    stageTwoRouteKey: "2",
    stageTwoMarketKey: "5",
    stageThreeRouteKey: "1",
  });
  const bankBefore = await waitForOpenRottenStageThreeMarket(bankPage, "Stage 3 full-health bank");
  assertEqual(bankBefore.rottenSelectedRoute, "appeal-furnace", "Stage 3 bank route");
  assertEqual(bankBefore.rottenHp, "6/6", "Stage 3 full-health honest state");
  assertEqual(bankBefore.rottenGraft, "18", "Stage 3 bank purse");
  assertEqual(bankBefore.rottenHealAvailable, "false", "Stage 3 full-health unavailable heal");
  const bankTruth = pickDataset(bankBefore, rottenStageThreeTruthKeys());
  await bankPage.key("4");
  await bankPage.waitForDataset("rottenRewardFeedbackReason", "full-health", 2_000);
  const fullHealth = await bankPage.dataset(rottenStageThreeTruthKeys());
  assertDeepEqual(
    pickDataset(fullHealth, rottenStageThreeTruthKeys()),
    bankTruth,
    "Stage 3 full-health heal strict no-op",
  );
  await captureEvidence(bankPage, "rotten-stage-three-market-full-health-no-op-1920x1080.png");
  await bankPage.key("5");
  const bank = await assertRottenCommissionerDossier(bankPage, {
    label: "Stage 3 bank",
    expectedHistory: "1:bailiffs-ramp:bank|2:bile-registry:bank|3:appeal-furnace:bank",
    expectedUpgrades: "",
    expectedGraft: "18",
    expectedHp: "6/6",
    expectedChoice: "bank",
    expectedTraceEvent: "market:3:appeal-furnace:bank:spent-0",
    expectedKillCount: "14",
    evidence: "rotten-commissioner-dossier-bank-1920x1080.png",
  });
  await bankPage.close();

  return {
    route: "Rotten Stage 3 purchase, heal, bank, strict no-ops, and inert Commissioner dossier",
    purchase: { before: purchaseBefore, invalid, after: purchase },
    heal: { before: healBefore, after: heal },
    bank: { before: bankBefore, fullHealth, after: bank },
  };
}

async function smokeRottenStageThreeRetry(browser) {
  const page = await browser.open(
    "/?mode=rotten&seed=GAUNTLET-ALPHA&smokeAuto=1&smoke=rottenStageThreeRetry",
    { viewport: { width: 1366, height: 768 } },
  );
  await page.waitForDataset("rottenPhase", "loadout");
  const retryKeys = [
    ...rottenStageThreeTruthKeys(),
    ...rottenStageTwoMechanicTruthKeys(),
    "rottenAttackCount",
    "rottenAttackHitCount",
    "rottenSkillUseCount",
    "rottenSkillHitCount",
    "rottenRewardFeedback",
    "rottenRewardFeedbackReason",
  ];
  const initial = await page.dataset(retryKeys);
  await enterRottenStageThree(page, {
    label: "Stage 3 death/retry",
    weaponKey: "3",
    skillKey: "6",
    stageOneRouteKey: "2",
    stageOneMarketKey: "1",
    stageTwoRouteKey: "1",
    stageTwoMarketKey: "5",
    stageThreeRouteKey: "1",
  });
  const entered = await page.dataset(retryKeys);
  assertEqual(entered.rottenStage, "3", "Stage 3 retry entered stage");
  assertEqual(entered.rottenSelectedRoute, "collection-parade", "Stage 3 retry route");
  assertEqual(entered.rottenUpgrades, "dead-letter", "Stage 3 retry carried upgrade");
  assertEqual(
    entered.rottenRouteHistory,
    "1:bailiffs-ramp:upgrade:dead-letter|2:seized-goods-lift:bank",
    "Stage 3 retry carried history",
  );
  if (Number(entered.rottenCombatObjectCount) <= 0) {
    throw new Error(`Stage 3 retry did not enter live combat: ${JSON.stringify(entered)}`);
  }
  try {
    await page.waitForDataset("rottenPhase", "dead", 45_000);
  } catch (error) {
    const stalled = await page.dataset(retryKeys);
    throw new Error(`Stage 3 retry did not reach an actual death: ${JSON.stringify(stalled)}; ${error}`);
  }
  const dead = await page.dataset(retryKeys);
  assertEqual(dead.rottenStage, "3", "Stage 3 retry death stage");
  assertEqual(dead.rottenPhase, "dead", "Stage 3 retry death phase");
  assertEqual(dead.rottenHp, "0/6", "Stage 3 retry actual death HP");
  assertEqual(dead.rottenStageWavesCleared, "1", "Stage 3 retry one cleared Stage 3 wave");
  assertEqual(dead.rottenWavesCleared, "5", "Stage 3 retry five cumulative cleared waves");
  assertEqual(dead.rottenUpgrades, "dead-letter", "Stage 3 retry death ownership");
  assertEqual(dead.rottenRewardDecisionCount, "2", "Stage 3 retry prior market decisions");
  assertEqual(dead.rottenEliteDefeatedVariants, "gilded", "Stage 3 retry defeated gilded carry");
  assertEqual(dead.rottenEliteDefeatedRoles, "clerk", "Stage 3 retry defeated elite role");
  assertEqual(dead.rottenEliteBountyGraft, "1", "Stage 3 retry earned first elite bounty");
  assertAtLeastNumber(dead.rottenHazardTelegraphCount, 1, "Stage 3 retry live hazard state");
  for (const roster of [
    "3.1:clerk,writ-runner,shield-auditor",
    "3.2:writ-runner,bailiff,sump-scribe",
  ]) {
    if (!String(dead.rottenSpawnHistory).includes(roster)) {
      throw new Error(`Stage 3 retry missing live roster ${roster}: ${dead.rottenSpawnHistory}`);
    }
  }
  if (Number(dead.rottenCombatObjectCount) <= 0) {
    throw new Error(`Stage 3 death did not retain owned objects before R: ${dead.rottenCombatObjectCount}`);
  }
  await captureEvidence(page, "rotten-stage-three-death-before-retry-1366x768.png");

  await page.key("r");
  const retried = await waitForTwoAnimationFramesOfTruth(
    page,
    retryKeys,
    (state) => state.rottenPhase === "loadout"
      && state.rottenStage === "1"
      && state.rottenRouteOptions === "unfiled-alley|bailiffs-ramp"
      && state.rottenSelectedRoute === ""
      && state.rottenWeapon === ""
      && state.rottenSkill === ""
      && state.rottenWave === "0"
      && state.rottenStageWavesCleared === "0"
      && state.rottenWavesCleared === "0"
      && state.rottenSpawnHistory === ""
      && state.rottenGraft === "3"
      && state.rottenUpgrades === ""
      && state.rottenRouteHistory === ""
      && state.rottenMarketStatus === ""
      && state.rottenMarketStage === ""
      && state.rottenMarketRoute === ""
      && state.rottenMarketChoice === ""
      && state.rottenRewardDecisionCount === "0"
      && state.rottenOfferIds === ""
      && state.rottenHp === ""
      && state.rottenEliteCount === "0"
      && state.rottenCurrentEliteCount === "0"
      && state.rottenEliteDefeatedCount === "0"
      && state.rottenEliteDefeatedVariants === ""
      && state.rottenEliteDefeatedRoles === ""
      && state.rottenEliteBountyGraft === "0"
      && state.rottenHazardTelegraphCount === "0"
      && state.rottenHazardActiveCount === "0"
      && state.rottenHazardActivationCount === "0"
      && state.rottenHazardHitCount === "0"
      && state.rottenHazardClearCount === "0"
      && state.rottenHazardExpiryCount === "0"
      && state.rottenHazardTeardownCount === "0"
      && state.rottenBossId === ""
      && state.rottenBossDossierReady === "false"
      && state.rottenBossHealth === ""
      && state.rottenBossPhase === ""
      && state.rottenBossObjectCount === "0"
      && state.rottenResult === ""
      && state.rottenKillCount === "0"
      && state.rottenLivingEnemies === "0"
      && state.rottenCombatObjectCount === "0",
    8_000,
  );
  assertEqual(retried.rottenSeed, initial.rottenSeed, "Stage 3 retry same seed");
  assertEqual(retried.rottenPlanId, initial.rottenPlanId, "Stage 3 retry same plan");
  assertEqual(retried.rottenTraceDigest, initial.rottenTraceDigest, "Stage 3 retry baseline trace");
  assertEqual(retried.rottenElapsedActiveMilliseconds, "0", "Stage 3 retry active time reset");
  const retryBuild = JSON.parse(retried.rottenBuildSummary);
  assertEqual(String(retryBuild.weaponPatternRepeatOrPierce), "false", "Stage 3 retry build reset");
  assertEqual(String(retryBuild.marketDiscount), "0", "Stage 3 retry discount reset");
  assertEqual(retried.canvasCount, 1, "Stage 3 retry one canvas");
  await assertNoMissingTextureGreen(page, "Stage 3 retry clean loadout");
  await captureEvidence(page, "rotten-stage-three-retry-clean-1366x768.png");
  await page.key("r");
  await new Promise((resolve) => setTimeout(resolve, 160));
  const afterInertR = await page.dataset(retryKeys);
  assertDeepEqual(afterInertR, retried, "Stage 3 post-retry R is inert");
  await page.close();

  return {
    route: "Rotten Stage 3 actual death to same-seed complete reset",
    initial,
    entered,
    dead,
    retried,
  };
}

async function installRottenEliteLatch(page) {
  await page.evaluate(`(() => {
    const observation = {
      variants: [],
      maxArmorPips: 0,
      sawArmorBroken: false,
      sawAliveEnraged: false,
      baseRoleWindups: [],
      maxArmorBreakCount: 0,
      maxEnrageCount: 0,
      tells: [],
    };
    window.__FOXMAN_ROTTEN_ELITE_OBSERVATION__ = observation;
    const sample = () => {
      const data = document.body.dataset;
      observation.maxArmorBreakCount = Math.max(
        observation.maxArmorBreakCount,
        Number(data.rottenEliteArmorBreakCount ?? 0),
      );
      observation.maxEnrageCount = Math.max(
        observation.maxEnrageCount,
        Number(data.rottenEliteEnrageCount ?? 0),
      );
      for (const entry of String(data.rottenEnemyStates ?? "").split("|").filter(Boolean)) {
        const [role, state, health, variant, armorPips, enraged] = entry.split(":");
        if (state === "windup" && !observation.baseRoleWindups.includes(role)) {
          observation.baseRoleWindups.push(role);
        }
        if (variant !== "none") {
          if (!observation.variants.includes(variant)) observation.variants.push(variant);
          observation.maxArmorPips = Math.max(observation.maxArmorPips, Number(armorPips));
          if (Number(armorPips) === 0) observation.sawArmorBroken = true;
          if (enraged === "1" && Number(health) > 0) observation.sawAliveEnraged = true;
        }
      }
      const tell = data.rottenEnemyTell ?? "";
      if (tell && !observation.tells.includes(tell)) observation.tells.push(tell);
      if (data.rottenPhase !== "reward-choice" && data.rottenPhase !== "dead") {
        requestAnimationFrame(sample);
      }
    };
    requestAnimationFrame(sample);
    return true;
  })()`);
}

async function readRottenEliteLatch(page) {
  return page.evaluate(`({
    ...window.__FOXMAN_ROTTEN_ELITE_OBSERVATION__,
    variants: [...window.__FOXMAN_ROTTEN_ELITE_OBSERVATION__.variants],
    baseRoleWindups: [...window.__FOXMAN_ROTTEN_ELITE_OBSERVATION__.baseRoleWindups],
    tells: [...window.__FOXMAN_ROTTEN_ELITE_OBSERVATION__.tells],
  })`);
}

function rottenStageTwoMechanicTruthKeys() {
  return [
    "rottenPhase",
    "rottenStage",
    "rottenSelectedRoute",
    "rottenHp",
    "rottenEnemyStates",
    "rottenEnemyTell",
    "rottenShieldBlockCount",
    "rottenShieldFlankHitCount",
    "rottenShieldOpenCount",
    "rottenShieldOpenSources",
    "rottenHazardTelegraphCount",
    "rottenHazardActiveCount",
    "rottenHazardActivationCount",
    "rottenHazardHitCount",
    "rottenHazardClearCount",
    "rottenHazardExpiryCount",
    "rottenHazardTeardownCount",
    "rottenSkillHitCount",
    "rottenCombatObjectCount",
  ];
}

async function installRottenStageTwoMechanicsLatch(page) {
  await page.evaluate(`(() => {
    const observation = {
      maxShieldBlockCount: 0,
      maxShieldFlankHitCount: 0,
      maxShieldOpenCount: 0,
      shieldOpenSources: [],
      shieldStates: [],
      shieldHealthSamples: [],
      maxHazardTelegraphCount: 0,
      maxHazardActiveCount: 0,
      maxHazardActivationCount: 0,
      maxHazardHitCount: 0,
      maxHazardClearCount: 0,
      maxHazardExpiryCount: 0,
      maxHazardTeardownCount: 0,
      maxSkillHitCount: 0,
      enemyTells: [],
    };
    window.__FOXMAN_ROTTEN_STAGE_TWO_MECHANICS__ = observation;
    const sample = () => {
      const data = document.body.dataset;
      const number = (key) => Number(data[key] ?? 0);
      observation.maxShieldBlockCount = Math.max(observation.maxShieldBlockCount, number("rottenShieldBlockCount"));
      observation.maxShieldFlankHitCount = Math.max(observation.maxShieldFlankHitCount, number("rottenShieldFlankHitCount"));
      observation.maxShieldOpenCount = Math.max(observation.maxShieldOpenCount, number("rottenShieldOpenCount"));
      observation.maxHazardTelegraphCount = Math.max(observation.maxHazardTelegraphCount, number("rottenHazardTelegraphCount"));
      observation.maxHazardActiveCount = Math.max(observation.maxHazardActiveCount, number("rottenHazardActiveCount"));
      observation.maxHazardActivationCount = Math.max(observation.maxHazardActivationCount, number("rottenHazardActivationCount"));
      observation.maxHazardHitCount = Math.max(observation.maxHazardHitCount, number("rottenHazardHitCount"));
      observation.maxHazardClearCount = Math.max(observation.maxHazardClearCount, number("rottenHazardClearCount"));
      observation.maxHazardExpiryCount = Math.max(observation.maxHazardExpiryCount, number("rottenHazardExpiryCount"));
      observation.maxHazardTeardownCount = Math.max(observation.maxHazardTeardownCount, number("rottenHazardTeardownCount"));
      observation.maxSkillHitCount = Math.max(observation.maxSkillHitCount, number("rottenSkillHitCount"));
      for (const source of String(data.rottenShieldOpenSources ?? "").split("|").filter(Boolean)) {
        if (!observation.shieldOpenSources.includes(source)) observation.shieldOpenSources.push(source);
      }
      for (const entry of String(data.rottenEnemyStates ?? "").split("|").filter(Boolean)) {
        const [role, state, health, eliteVariant, armorPips, enraged, shieldState] = entry.split(":");
        if (role === "shield-auditor") {
          if (!observation.shieldStates.includes(shieldState)) observation.shieldStates.push(shieldState);
          const healthSample = [state, health, shieldState].join(":");
          if (!observation.shieldHealthSamples.includes(healthSample)) observation.shieldHealthSamples.push(healthSample);
        }
      }
      const tell = data.rottenEnemyTell ?? "";
      if (tell && !observation.enemyTells.includes(tell)) observation.enemyTells.push(tell);
      if (data.rottenPhase !== "reward-choice" && data.rottenPhase !== "dead") {
        requestAnimationFrame(sample);
      }
    };
    requestAnimationFrame(sample);
    return true;
  })()`);
}

async function readRottenStageTwoMechanicsLatch(page) {
  return page.evaluate(`({ ...window.__FOXMAN_ROTTEN_STAGE_TWO_MECHANICS__,
    shieldOpenSources: [...window.__FOXMAN_ROTTEN_STAGE_TWO_MECHANICS__.shieldOpenSources],
    shieldStates: [...window.__FOXMAN_ROTTEN_STAGE_TWO_MECHANICS__.shieldStates],
    shieldHealthSamples: [...window.__FOXMAN_ROTTEN_STAGE_TWO_MECHANICS__.shieldHealthSamples],
    enemyTells: [...window.__FOXMAN_ROTTEN_STAGE_TWO_MECHANICS__.enemyTells],
  })`);
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
  await purchasePage.key("3");
  await new Promise((resolve) => setTimeout(resolve, 120));
  const latePurchase = await purchasePage.dataset(rottenMarketTruthKeys());
  assertDeepEqual(latePurchase, purchaseTruth, "Rotten resolved market late input no-op");
  await purchasePage.close();

  return {
    route: "Rotten Run real upgrade purchase key",
    purchaseArming,
    purchaseBefore,
    purchase,
    latePurchase,
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
    "/?mode=rotten&seed=GAUNTLET-ALPHA&smokeAuto=1&smoke=rottenReacquire",
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
      `/?mode=rotten&seed=${testCase.seed}&smokeAuto=1&smoke=rottenEnemyCycle`,
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
  }, {
    timeoutMs: cdpScreenshotTimeoutMs,
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
  const browser = new Browser(Number(port));
  await browser.captureBaseline();
  return browser;
}

async function fetchWithTimeout(url, options, timeoutMs, label) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(label + " failed within " + timeoutMs + "ms: " + reason);
  } finally {
    clearTimeout(timer);
  }
}

class Browser {
  constructor(port) {
    this.port = port;
    this.baselineTargetIds = new Set();
  }

  async captureBaseline() {
    const targets = await this.listPageTargets();
    this.baselineTargetIds = new Set(targets.map(({ id }) => id));
    recordProgress("browser-baseline", {
      pageTargetCount: targets.length,
      baselineTargetIds: [...this.baselineTargetIds],
    });
  }

  async listPageTargets() {
    const response = await fetchWithTimeout(
      "http://127.0.0.1:" + this.port + "/json/list",
      {},
      browserHttpTimeoutMs,
      "Chrome /json/list",
    );
    if (!response.ok) {
      throw new Error(
        "Chrome /json/list failed: " + response.status + " " + response.statusText,
      );
    }
    const targets = await response.json();
    return targets.filter(({ type }) => type === "page");
  }

  async targetSnapshot() {
    const targets = await this.listPageTargets();
    const testTargets = targets.filter(({ id }) => !this.baselineTargetIds.has(id));
    return {
      pageTargetCount: targets.length,
      testPageTargetCount: testTargets.length,
      targetIds: targets.map(({ id }) => id),
      testTargetIds: testTargets.map(({ id }) => id),
    };
  }

  async safeTargetSnapshot() {
    try {
      return await this.targetSnapshot();
    } catch (error) {
      return {
        targetSnapshotError: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async targetExists(targetId) {
    return (await this.listPageTargets()).some(({ id }) => id === targetId);
  }

  async closeTargetViaHttp(targetId) {
    const response = await fetchWithTimeout(
      "http://127.0.0.1:" + this.port + "/json/close/" + encodeURIComponent(targetId),
      {},
      browserHttpTimeoutMs,
      "Chrome /json/close target=" + targetId,
    );
    if (!response.ok) {
      throw new Error(
        "Chrome /json/close failed for target=" + targetId + ": "
          + response.status + " " + response.statusText,
      );
    }
  }

  async waitForTargetGone(targetId, timeoutMs = cdpCloseTimeoutMs) {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      if (!await this.targetExists(targetId)) {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    return !await this.targetExists(targetId);
  }

  async open(path, options = {}) {
    const url = new URL(path, baseUrl).toString();
    const initialUrl = options.viewport ? "about:blank" : url;
    recordProgress("target-open-start", {
      route: url,
      ...await this.safeTargetSnapshot(),
    });
    const response = await fetchWithTimeout(
      "http://127.0.0.1:" + this.port + "/json/new?" + encodeURIComponent(initialUrl),
      { method: "PUT" },
      browserHttpTimeoutMs,
      "Chrome /json/new route=" + url,
    );

    if (!response.ok) {
      throw new Error("Failed to open " + url + ": " + response.status + " " + response.statusText);
    }

    const target = await response.json();
    const page = new CdpPage({
      browser: this,
      webSocketUrl: target.webSocketDebuggerUrl,
      targetId: target.id,
      route: url,
    });
    try {
      await page.ready();
      if (options.viewport) {
        await page.send("Emulation.setDeviceMetricsOverride", {
          ...options.viewport,
          deviceScaleFactor: 1,
          mobile: true,
        });
        await page.send("Page.navigate", { url }, {
          timeoutMs: cdpNavigationTimeoutMs,
        });
      }
      recordProgress("target-open-ready", {
        route: url,
        targetId: target.id,
        ...await this.safeTargetSnapshot(),
      });
      return page;
    } catch (error) {
      try {
        await page.close();
      } catch (closeError) {
        recordProgress("target-open-cleanup-failed", {
          route: url,
          targetId: target.id,
          error: closeError instanceof Error ? closeError.message : String(closeError),
        });
      }
      throw error;
    }
  }
}

class CdpPage {
  constructor({ browser, webSocketUrl, targetId, route }) {
    this.browser = browser;
    this.targetId = targetId;
    this.route = route;
    this.currentUrl = route;
    this.nextId = 1;
    this.pending = new Map();
    this.errors = [];
    this.lastKnownContext = {};
    this.closing = false;
    this.closed = false;
    this.socketClosed = false;
    this.closePromise = null;
    this.ws = new WebSocket(webSocketUrl);
    let openedSettled = false;
    this.opened = new Promise((resolve, reject) => {
      this.ws.addEventListener("open", () => {
        openedSettled = true;
        resolve();
      }, { once: true });
      this.ws.addEventListener("error", (event) => {
        if (!openedSettled) {
          openedSettled = true;
          reject(this.cdpError("WebSocket.open", this.socketEventDetail("error", event)));
        }
      }, { once: true });
      this.ws.addEventListener("close", (event) => {
        if (!openedSettled) {
          openedSettled = true;
          reject(this.cdpError("WebSocket.open", this.socketEventDetail("close", event)));
        }
      }, { once: true });
    });
    this.opened.catch(() => {});
    this.ws.addEventListener("message", (event) => this.onMessage(event));
    this.ws.addEventListener("error", (event) => {
      this.rejectPending(this.socketEventDetail("error", event));
    });
    this.ws.addEventListener("close", (event) => {
      this.socketClosed = true;
      this.rejectPending(this.socketEventDetail("close", event));
    });
  }

  async ready() {
    await this.send("Page.enable");
    await this.send("Runtime.enable");
    await this.send("Log.enable");
    await this.send("Network.enable");
  }

  async close() {
    if (!this.closePromise) {
      this.closePromise = this.closeTarget();
    }
    return this.closePromise;
  }

  async closeTarget() {
    if (this.closed) {
      return;
    }

    this.closing = true;
    let closeCommandError;
    let targetGone = false;

    try {
      targetGone = !await this.browser.targetExists(this.targetId);
    } catch (error) {
      closeCommandError = error;
    }

    if (!targetGone && this.ws.readyState === WebSocket.OPEN) {
      try {
        await this.send("Target.closeTarget", { targetId: this.targetId }, {
          timeoutMs: cdpCloseTimeoutMs,
          allowWhileClosing: true,
        });
      } catch (error) {
        closeCommandError = error;
      }
    }

    try {
      targetGone = await this.browser.waitForTargetGone(this.targetId);
    } catch (error) {
      closeCommandError ??= error;
    }

    if (!targetGone) {
      try {
        await this.browser.closeTargetViaHttp(this.targetId);
        targetGone = await this.browser.waitForTargetGone(this.targetId);
      } catch (error) {
        closeCommandError ??= error;
      }
    }

    if (!targetGone) {
      const reason = closeCommandError instanceof Error
        ? closeCommandError.message
        : String(closeCommandError ?? "target remained in /json/list");
      throw this.cdpError("Target.closeTarget", "target did not disappear: " + reason);
    }

    this.closed = true;
    this.rejectPending("target closed and disappeared from /json/list");
    if (
      this.ws.readyState === WebSocket.OPEN
      || this.ws.readyState === WebSocket.CONNECTING
    ) {
      this.ws.close();
    }
    await this.waitForSocketClose(1_000);
    recordProgress("target-close-complete", {
      route: this.route,
      targetId: this.targetId,
      ...await this.browser.safeTargetSnapshot(),
    });
  }

  async waitForSocketClose(timeoutMs) {
    if (this.socketClosed || this.ws.readyState === WebSocket.CLOSED) {
      return;
    }
    await new Promise((resolve) => {
      const timer = setTimeout(resolve, timeoutMs);
      this.ws.addEventListener("close", () => {
        clearTimeout(timer);
        resolve();
      }, { once: true });
    });
  }

  async send(method, params = {}, options = {}) {
    const timeoutMs = options.timeoutMs ?? cdpSendTimeoutMs;
    const deadline = Date.now() + timeoutMs;
    if (this.closed) {
      throw this.cdpError(method, "target is already closed");
    }
    if (this.closing && !options.allowWhileClosing) {
      throw this.cdpError(method, "target is closing");
    }
    if (method === "Page.navigate" && typeof params.url === "string") {
      this.currentUrl = params.url;
    }
    await this.awaitOpened(deadline, method, timeoutMs);
    if (this.ws.readyState !== WebSocket.OPEN) {
      throw this.cdpError(method, "websocket is not open");
    }

    const id = this.nextId++;
    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) {
      throw this.cdpError(method, "timeout after " + timeoutMs + "ms");
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(this.cdpError(method, "timeout after " + timeoutMs + "ms"));
      }, remainingMs);
      this.pending.set(id, { resolve, reject, timer, method });
      try {
        this.ws.send(JSON.stringify({ id, method, params }));
      } catch (error) {
        clearTimeout(timer);
        this.pending.delete(id);
        const reason = error instanceof Error ? error.message : String(error);
        reject(this.cdpError(method, "websocket send failed: " + reason));
      }
    });
  }

  async awaitOpened(deadline, method, timeoutMs) {
    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) {
      throw this.cdpError(method, "timeout after " + timeoutMs + "ms opening websocket");
    }
    let timer;
    try {
      await Promise.race([
        this.opened,
        new Promise((_, reject) => {
          timer = setTimeout(() => {
            reject(this.cdpError(
              method,
              "timeout after " + timeoutMs + "ms opening websocket",
            ));
          }, remainingMs);
        }),
      ]);
    } finally {
      clearTimeout(timer);
    }
  }

  rejectPending(detail) {
    for (const { resolve: _resolve, reject, timer, method } of this.pending.values()) {
      clearTimeout(timer);
      reject(this.cdpError(method, detail));
    }
    this.pending.clear();
  }

  socketEventDetail(kind, event) {
    const code = "code" in event ? event.code : "";
    const reason = "reason" in event ? event.reason : "";
    const message = "message" in event ? event.message : "";
    return "websocket " + kind + " code=" + code + " reason=" + reason + " message=" + message;
  }

  cdpError(method, detail) {
    return new Error(
      "CDP " + detail
        + "; method=" + method
        + "; target=" + this.targetId
        + "; route=" + this.route
        + "; url=" + this.currentUrl
        + "; lastKnownDOM=" + JSON.stringify(this.lastKnownContext),
    );
  }

  onMessage(event) {
    let message;
    try {
      message = JSON.parse(event.data);
    } catch (error) {
      this.errors.push(
        "Malformed CDP message: " + (error instanceof Error ? error.message : String(error)),
      );
      return;
    }

    if (message.id && this.pending.has(message.id)) {
      const pending = this.pending.get(message.id);
      this.pending.delete(message.id);
      clearTimeout(pending.timer);

      if (message.error) {
        pending.reject(this.cdpError(
          pending.method,
          message.error.message + ": " + (message.error.data ?? ""),
        ));
      } else {
        pending.resolve(message.result);
      }
      return;
    }

    if (message.method === "Page.frameNavigated" && message.params.frame?.url) {
      this.currentUrl = message.params.frame.url;
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
      throw this.cdpError("Runtime.evaluate", result.exceptionDetails.text);
    }

    return result.result.value;
  }

  async dataset(keys) {
    const keyList = JSON.stringify(keys);
    const value = await this.evaluate(`(() => {
      const d = document.body.dataset;
      const out = {};
      for (const key of ${keyList}) out[key] = d[key];
      out.canvasCount = document.querySelectorAll("canvas").length;
      return out;
    })()`);
    this.updateLastKnownContext(value);
    return value;
  }

  updateLastKnownContext(value) {
    if (!value || typeof value !== "object") {
      return;
    }
    for (const key of [
      "scene",
      "rottenScene",
      "rottenPhase",
      "rottenStage",
      "rottenSelectedRoute",
      "rottenLivingEnemies",
      "rottenCombatObjectCount",
      "canvasCount",
    ]) {
      if (key in value) {
        this.lastKnownContext[key] = value[key];
      }
    }
  }

  async waitForDataset(key, expected, timeoutMs = 5000) {
    await waitFor(async () => {
      const value = await this.evaluate(`document.body.dataset.${key}`);
      this.lastKnownContext[key] = value;
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

async function smokeCdpLifecycle(browserInstance) {
  const baseline = await browserInstance.targetSnapshot();
  assertEqual(
    baseline.testPageTargetCount,
    0,
    "CDP lifecycle baseline leaked test targets",
  );
  const closes = [];

  for (let iteration = 1; iteration <= 40; iteration += 1) {
    const page = await browserInstance.open("about:blank?foxmanLifecycle=" + iteration);
    const opened = await browserInstance.targetSnapshot();
    assertEqual(
      opened.testPageTargetCount,
      1,
      "CDP lifecycle opened target count iteration " + iteration,
    );
    const targetId = page.targetId;
    await page.close();
    const closed = await browserInstance.targetSnapshot();
    assertEqual(
      closed.pageTargetCount,
      baseline.pageTargetCount,
      "CDP lifecycle baseline page count iteration " + iteration,
    );
    assertEqual(
      closed.testPageTargetCount,
      0,
      "CDP lifecycle leaked test target iteration " + iteration,
    );
    closes.push({
      iteration,
      targetId,
      openedPageTargetCount: opened.pageTargetCount,
      closedPageTargetCount: closed.pageTargetCount,
      leakedTestTargets: closed.testPageTargetCount,
    });
  }

  const final = await browserInstance.targetSnapshot();
  assertEqual(final.testPageTargetCount, 0, "CDP lifecycle final leaked test targets");
  return {
    route: "CDP target lifecycle: 40 open/close cycles",
    baseline,
    closes,
    final,
  };
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
  browser = await launchChrome();
  recordProgress("run-start", {
    filter: process.env.FOXMAN_SMOKE_ONLY ?? "unfiltered",
    baseUrl,
  });

  const results = [];
  if (process.env.FOXMAN_SMOKE_ONLY === "cdpLifecycle") {
    results.push(await smokeCdpLifecycle(browser));
  } else if (process.env.FOXMAN_SMOKE_ONLY === "sumpDeath") {
    results.push(await smokeSumpDeathRestart(browser));
  } else if (process.env.FOXMAN_SMOKE_ONLY === "dash") {
    results.push(await smokeDashRoute(browser));
  } else if (process.env.FOXMAN_SMOKE_ONLY === "rottenContract") {
    results.push(await smokeRottenRunContract(browser));
  } else if (process.env.FOXMAN_SMOKE_ONLY === "rottenIsolation") {
    results.push(await smokeRottenSmokeIsolation(browser));
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
  } else if (process.env.FOXMAN_SMOKE_ONLY === "rottenStageTwoTopology") {
    results.push(await smokeRottenStageTwoTopology(browser));
  } else if (process.env.FOXMAN_SMOKE_ONLY === "rottenStageTwoRoles") {
    results.push(await smokeRottenStageTwoRoles(browser));
  } else if (process.env.FOXMAN_SMOKE_ONLY === "rottenStageTwoElites") {
    results.push(await smokeRottenStageTwoElites(browser));
  } else if (process.env.FOXMAN_SMOKE_ONLY === "rottenStageTwoBuilds") {
    results.push(await smokeRottenStageTwoBuilds(browser));
  } else if (process.env.FOXMAN_SMOKE_ONLY === "rottenStageTwoMarketBoundary") {
    results.push(await smokeRottenStageTwoMarketBoundary(browser));
  } else if (process.env.FOXMAN_SMOKE_ONLY === "rottenStageTwoMarket") {
    results.push(await smokeRottenStageTwoMarket(browser));
  } else if (process.env.FOXMAN_SMOKE_ONLY === "rottenStageTwoRetry") {
    results.push(await smokeRottenStageTwoRetry(browser));
  } else if (process.env.FOXMAN_SMOKE_ONLY === "rottenStageThreeTopology") {
    results.push(await smokeRottenStageThreeTopology(browser));
  } else if (process.env.FOXMAN_SMOKE_ONLY === "rottenStageThreeElites") {
    results.push(await smokeRottenStageThreeElites(browser));
  } else if (process.env.FOXMAN_SMOKE_ONLY === "rottenStageThreeRoles") {
    results.push(await smokeRottenStageThreeRoles(browser));
  } else if (process.env.FOXMAN_SMOKE_ONLY === "rottenStageThreeBuilds") {
    results.push(await smokeRottenStageThreeBuilds(browser));
  } else if (process.env.FOXMAN_SMOKE_ONLY === "rottenStageThreeMarket") {
    results.push(await smokeRottenStageThreeMarket(browser));
  } else if (process.env.FOXMAN_SMOKE_ONLY === "rottenStageThreeRetry") {
    results.push(await smokeRottenStageThreeRetry(browser));
  } else {
    results.push(await smokeRottenSmokeIsolation(browser));
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
    results.push(await smokeRottenStageTwoTopology(browser));
    results.push(await smokeRottenStageTwoRoles(browser));
    results.push(await smokeRottenStageTwoElites(browser));
    results.push(await smokeRottenStageTwoBuilds(browser));
    results.push(await smokeRottenStageTwoMarket(browser));
    results.push(await smokeRottenStageTwoRetry(browser));
    results.push(await smokeRottenStageThreeTopology(browser));
    results.push(await smokeRottenStageThreeElites(browser));
    results.push(await smokeRottenStageThreeRoles(browser));
    results.push(await smokeRottenStageThreeBuilds(browser));
    results.push(await smokeRottenStageThreeMarket(browser));
    results.push(await smokeRottenStageThreeRetry(browser));
  }

  const finalTargetSnapshot = await browser.targetSnapshot();
  assertEqual(
    finalTargetSnapshot.testPageTargetCount,
    0,
    "browser smoke final leaked test targets",
  );
  recordProgress("run-complete", {
    filter: process.env.FOXMAN_SMOKE_ONLY ?? "unfiltered",
    resultCount: results.length,
    ...finalTargetSnapshot,
  });
  const payload = {
    ok: true,
    results,
    diagnostics: {
      elapsedMs: Date.now() - smokeStartedAt,
      filter: process.env.FOXMAN_SMOKE_ONLY ?? "unfiltered",
      baselinePageTargetCount: browser.baselineTargetIds.size,
      finalTargetSnapshot,
      progress: progressEvents,
    },
  };
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
} catch (error) {
  const targetSnapshot = browser
    ? await browser.safeTargetSnapshot()
    : { browserLaunched: false };
  const message = error instanceof Error ? error.message : String(error);
  recordProgress("run-failure", {
    filter: process.env.FOXMAN_SMOKE_ONLY ?? "unfiltered",
    error: message,
    ...targetSnapshot,
  });
  if (evidenceDir) {
    try {
      mkdirSync(evidenceDir, { recursive: true });
      const failureFile = process.env.FOXMAN_SMOKE_ONLY
        ? `browser-smoke-${process.env.FOXMAN_SMOKE_ONLY}-failure.json`
        : "browser-smoke-failure.json";
      writeFileSync(
        join(evidenceDir, failureFile),
        `${JSON.stringify({
          ok: false,
          error: message,
          stack: error instanceof Error ? error.stack : undefined,
          diagnostics: {
            elapsedMs: Date.now() - smokeStartedAt,
            filter: process.env.FOXMAN_SMOKE_ONLY ?? "unfiltered",
            targetSnapshot,
            progress: progressEvents,
          },
        }, null, 2)}\n`,
      );
    } catch (writeError) {
      console.error(
        "[smoke-progress] failed to write failure diagnostics: "
          + (writeError instanceof Error ? writeError.message : String(writeError)),
      );
    }
  }
  console.error("[smoke-progress] terminal failure: " + (error instanceof Error ? error.stack : message));
  throw error;
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
