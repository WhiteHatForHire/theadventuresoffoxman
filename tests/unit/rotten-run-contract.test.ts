import { describe, expect, it } from "vitest";
import { buildRottenRunPlan, ROTTEN_PLAN_SCHEMA_VERSION } from "../../src/game/rotten/plan";
import { ROUTES_BY_STAGE } from "../../src/game/rotten/routes";
import { normalizeRottenSeed } from "../../src/game/rotten/seed";

describe("Rotten Run seed contract", () => {
  it("normalizes shareable ASCII tokens and falls back safely", () => {
    expect(normalizeRottenSeed("  gauntlet alpha  ")).toBe("GAUNTLET-ALPHA");
    expect(normalizeRottenSeed("fox!!! owes...tax")).toBe("FOX-OWES-TAX");
    expect(normalizeRottenSeed(" \t---...\n ")).toBe("ROTTEN-DEFAULT");

    const normalized = normalizeRottenSeed(`${"a".repeat(31)} !!! tail`);
    expect(normalized).toBe("A".repeat(31));
    expect(normalized).toHaveLength(31);
    expect(normalized).toMatch(/^[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?$/);
  });
});

describe("Rotten Run deterministic plan", () => {
  it("returns a stable fixture plan for the same normalized seed and schema", () => {
    const first = buildRottenRunPlan(" gauntlet alpha ");
    const second = buildRottenRunPlan("GAUNTLET-ALPHA");

    expect(first).toEqual(second);
    expect(first.schemaVersion).toBe(ROTTEN_PLAN_SCHEMA_VERSION);
    expect(first.planId).toBe("RR1-1C93B57F");
    expect(first.stages.map((stage) => stage.options.map((route) => route.id))).toEqual([
      ["unfiled-alley", "bailiffs-ramp"],
      ["seized-goods-lift", "late-fee-chapel"],
      ["collection-parade", "garnish-gallery"],
    ]);
  });

  it("changes at least one route pair or ordering for a different fixture seed", () => {
    const alpha = buildRottenRunPlan("GAUNTLET-ALPHA");
    const beta = buildRottenRunPlan("GAUNTLET-BETA");

    expect(beta.stages.map((stage) => stage.options.map((route) => route.id))).not.toEqual(
      alpha.stages.map((stage) => stage.options.map((route) => route.id)),
    );
  });

  it("builds exactly three valid stages with distinct options and the fixed boss", () => {
    for (const seed of ["GAUNTLET-ALPHA", "GAUNTLET-BETA", "punct!! seed", ""]) {
      const plan = buildRottenRunPlan(seed);

      expect(plan.stages).toHaveLength(3);
      expect(plan.finalBossId).toBe("commissioner-of-consequences");

      for (const stage of plan.stages) {
        expect(stage.options).toHaveLength(2);
        expect(new Set(stage.options.map((route) => route.id)).size).toBe(2);
        expect(stage.options.every((route) => ROUTES_BY_STAGE[stage.stage].includes(route))).toBe(true);
      }
    }
  });
});
