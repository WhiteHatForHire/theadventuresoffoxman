import type { RottenRouteId } from "./routes";

export type RottenRunShellPhase = "route-choice" | "encounter";

export interface RottenRunDebugSnapshot {
  readonly scene: "RottenRunScene";
  readonly phase: RottenRunShellPhase;
  readonly schemaVersion: number;
  readonly seed: string;
  readonly planId: string;
  readonly stage: 1;
  readonly routeOptions: readonly [RottenRouteId, RottenRouteId];
  readonly selectedRoute: RottenRouteId | null;
  readonly weapon: null;
  readonly skill: null;
  readonly upgrades: readonly [];
  readonly graft: 3;
  readonly hp: null;
  readonly livingEnemies: 0;
  readonly eliteCount: 0;
  readonly bossHealth: null;
  readonly bossPhase: null;
  readonly elapsedActiveMilliseconds: 0;
  readonly result: null;
  readonly traceDigest: string;
}
