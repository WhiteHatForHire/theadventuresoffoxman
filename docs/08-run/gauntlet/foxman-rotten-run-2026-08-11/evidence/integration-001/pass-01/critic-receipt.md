# INTEGRATION-001 Revision Re-review Receipt

Run: `foxman-rotten-run-gauntlet-2026-08-11`

Gate: `INTEGRATION-001-REVISION-001` — explicit Rotten smoke-automation opt-in

Reviewer: sole fresh-context, read-only integration recritic

Reviewed: 2026-08-11

Decision: the two-file repair closes the reproduced automation leak without weakening authorized smoke evidence, the 23-route campaign baseline, normal Rotten entry, or the connected Stage 1 reward / Stage 2 carry product. No serious integration gap remains in this revision's authorized scope.

## Independence And Blindness

- I read repository, project, Gauntlet, reality-gate, and in-app Browser rules before acting.
- I did not edit the repository, candidate, Gauntlet state, or anybody else's evidence.
- Before any check, I froze the repository state, candidate files, hashes, binary diff hash, and a clean control archive in `candidate-freeze.json`.
- I did not open the repair builder receipt or evidence before freezing independent evidence and `provisional-verdict.json` with `PASS` at `2026-08-11T13:52:58Z`.
- Before that freeze, the only prior-review material consulted was the review contract and canonical preserved failure under `evidence/integration-001/revise-01/`, as authorized.
- Builder provenance was compared only after the provisional verdict was immutable. It agreed with the independent candidate identity and did not change the verdict.

## Candidate Identity And Scope

- Repository: `/Users/marcusvale/Documents/coding/marcusbrainhq/repos/theadventuresoffoxman`
- Branch / control HEAD: `main` / `e7d3e397289a178719520856c03935e9104df364`
- Pre-receipt runtime parent: `a4a3451dd174e3a6de532d75bee2014918e66e06`
- Last promoted product commit: `23e309e6dce71f039c4eab2508816a584bd53354`
- `a4a3451..e7d3e397` changes only control docs/evidence. An independent quiet diff across `src`, `tests`, `public`, `assets`, manifests, HTML, Vite, and TypeScript configuration returned zero.
- `23e309e..e7d3e397` likewise contains only project/control docs and preserved review evidence; no runtime source, test, manifest, or configuration change exists.
- Worktree candidate: exactly two tracked modifications, no untracked files:
  - `src/game/scenes/RottenRunScene.ts`
  - `tests/smoke/check-browser-routes.mjs`
- Diff summary: `2 files changed, 125 insertions(+), 4 deletions(-)`.
- Binary diff SHA-256: `7c518775453f51387f6748d512438acaf1d102c5c8a9b47930c1baa2d51f08e2`.
- Candidate file SHA-256:
  - `RottenRunScene.ts`: `89f8b26296ce85e454435d5a223ca4ef69fbfe951b09eb9e3a1ef2ce897976f2`
  - `check-browser-routes.mjs`: `2ba97d0c4239c0ed79904820303d4ebbc0cde248965d404a394f0d16bd210e6e`
- Control archive SHA-256: `02d90c1a603fe865944b99e0fc76b03c9c62f9916108f892d3f5ec2f5d194faa`.
- Final repository hashes still equal the freeze hashes. `git diff --check` is clean.

## Exact External Production Artifact

I exported control `e7d3e397` outside the repository, overlaid only the two frozen candidate files, installed the locked dependencies, and built there:

`/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/integration-001-recritic/candidate-src`

I then copied the fresh `dist/` byte-for-byte to:

`/Users/marcusvale/Documents/Codex/2026-08-11/foxman-gauntlet-live/work/integration-001-recritic/artifact/dist`

`diff -qr` remained empty before and after review. The artifact was served directly by a loopback static server at `http://127.0.0.1:4178`; every focused gate, the sole full matrix, and all direct in-app Browser proof used that same frozen production artifact. The smoke harness detected the existing server and did not launch its development server.

- Aggregate artifact manifest SHA-256: `6a9a4aade3c0467ab2ce5cd2a4e2113310dc19245c8e64aacaee9ef545714570`
- App bundle: `assets/index-kp_sjlIr.js`, SHA-256 `929fa5e38bed08064c4cb659cb04d7b3c562146c5c3b2f2af80dd6b567c6f4ac`
- Phaser bundle: `assets/phaser-vendor-DFK5Ua9d.js`, SHA-256 `f9025c1a29bc3ae097dd886ce07717b297466da1ce8f032c8294252ce6cf5cdb`

## Commands And Attempt Ledger

All commands below ran from the frozen external source unless noted:

| Gate | Command | Attempts | Result |
| --- | --- | ---: | --- |
| Locked install | `npm ci` | 1 | PASS |
| Unit | `npm test` | 1 | PASS, 4 files / 42 tests |
| Type | `npm run typecheck` | 1 | PASS |
| Fresh production build | `npm run build` | 1 | PASS, 52 Vite modules |
| Dist structure | `npm run smoke` | 1 | PASS |
| Whitespace | `git diff --check` in repository | 1 | PASS |
| Isolation | `FOXMAN_BASE_URL=http://127.0.0.1:4178 FOXMAN_SMOKE_ONLY=rottenIsolation npm run smoke:browser` | 1 | PASS |
| Contract | same command with `rottenContract` | 1 | PASS |
| Enemy cycle | same command with `rottenEnemyCycle` | 1 | PASS |
| Encounter | same command with `rottenEncounter` | 1 | PASS |
| Market | same command with `rottenMarket` | 1 | PASS |
| Full matrix | same command with no `FOXMAN_SMOKE_ONLY` | exactly 1 | PASS, exit 0, 28/28 |

The focused encounter and market commands outlived an outer command-result wait, but their original processes continued, terminated normally, and wrote `ok: true` evidence. I did not start replacement attempts. The full matrix remained one continuously polled process and was never retried.

## Focused Gates

All five required focused gates passed on their first and only attempts:

- `rottenIsolation`: exact DOM key ledger `3`, `6`, `Enter`, `2`; no combat input afterward; `4546 ms`; Tax Pike + Seized Stamp + Bailiffs' Ramp; phase `encounter`; HP `6/6`; two living enemies; one canvas; maximum weapon attacks/hits and skill uses/hits all `0`.
  - JSON SHA-256: `47857714e26b96f1a161ff1cc45faeaaebc5ef039c9fdc2fe40d122645d02fc6`
- `rottenContract`: title `R` entry stayed normal; authorized `smokeAuto=1&smoke=rottenContract` retained `GAUNTLET-ALPHA`, plan `RR1-1C93B57F`, Stage 1 options `unfiled-alley|bailiffs-ramp`, and real `2` route selection.
  - JSON SHA-256: `88a581a0a10c1cd453ff9ba0407c49c5071a721e0ad06a1572bd9d6f25ce9414`
- `rottenEnemyCycle`: bailiff, clerk, and writ-runner each traversed approach/windup/active/recovery; both reacquisitions completed within bounds; the reacquired runner remained hittable.
  - JSON SHA-256: `49d8a8923dfc8fdadf56e964e7a73c40bd1a1c4a52895e072ab5f0c3bc7224d6`
- `rottenEncounter`: death/same-seed retry reset to loadout and zero combat objects; Tax Pike/Stamp and Spitter/Bomb paths completed to reward with truthful counts and cleanup.
  - JSON SHA-256: `c9e0be0a86871da71fc284e2f09c5a3318afe4f3fcf9c61c8fac3dae81387e92`
- `rottenMarket`: purchase, damaged heal, bank, unaffordable no-op, invalid no-op, repeated-input no-op, and exact Stage 2 carry passed.
  - JSON SHA-256: `ffb4155abf44a682e0fdbbae1bad5a58ccbab70b56cce5cd245b05e3e7ed1e9a`

## Sole Full Browser Matrix

The unfiltered matrix ran exactly once. It exited `0` with `ok: true` and exactly 28 top-level results:

- 1 new negative isolation route
- 23 accepted campaign routes
- 4 previously accepted Rotten routes: death/retry, contract, encounter, and market

Matrix JSON:
`matrix/browser-smoke-results.json`

SHA-256: `5f8fb46149774aa184fe60b5e119b168f55d78c583cb19b6dab3ebc2c45757a5`

The matrix's embedded isolation observation independently remained at zero weapon attacks and zero skill uses for `4600 ms`.

## Direct In-app Browser Proof

### Negative isolation, 1366x768

URL:
`http://127.0.0.1:4178/?mode=rotten&seed=GAUNTLET-ALPHA&smoke=rottenEncounter`

`smokeAuto` was absent. In the real in-app Browser I used only:

1. `3` — Tax Pike, phase `loadout`, focus `BODY`
2. `6` — Seized Stamp, phase `loadout`, focus `BODY`
3. `Enter` — phase `route-choice`, focus `BODY`
4. `2` — Bailiffs' Ramp, phase `encounter`, focus `BODY`

No combat action followed. Across a `5121 ms` observation window, maximum `attackCount`, `attackHitCount`, `skillUseCount`, and `skillHitCount` were all `0`. Enemy AI legitimately killed Foxman during this direct no-action observation, so the final state was `dead`, HP `0/6`, two living enemies, one canvas, and still zero weapon/skill activity. This is permitted by the repair contract and is positive evidence that fixture input was absent while ordinary enemy behavior remained live.

Canvas: one `1280x720` backing canvas framed at `1365.328125x768` CSS in the `1366x768` viewport. No duplicate canvas, blank surface, or framing loss was visible.

Capture: `screenshots/iab-isolation-manual-1366x768.png`

SHA-256: `196b07e5aab234278ace8961d68e48a0caa37e0ee20cd174dad51755cb929ee7`

### Authorized contrast, 1366x768

URL:
`http://127.0.0.1:4178/?mode=rotten&seed=GAUNTLET-ALPHA&smokeAuto=1&smoke=rottenEncounter`

After the same real `3`, `6`, `Enter`, `2` selection, the first nonzero fixture state appeared at `1375 ms`: weapon attacks/hits `1/1`, skill uses/hits `1/1`, HP `6/6`. It then completed Stage 1 with attacks `6`, skill uses `2`, graft `7`, HP `6/6`, phase `reward-choice`, and zero combat objects. Explicit opt-in therefore still authorizes the fixture.

Capture: `screenshots/iab-authorized-auto-1366x768.png`

SHA-256: `c76b90fed1485bbf21fac5100c3625bd8cec42c44d2bfa38be22f4da8b84be48`

### Campaign and connected product

- Normal `/` title + real `Enter` reached `RunScene`, Rusty Knife, HP `5`, BODY focus, and one canvas at `1366x768`.
  - Capture: `screenshots/iab-campaign-enter-1366x768.png`
  - SHA-256: `b52c3121ba673e26342c177933ab894fd995fd34354f91c5098d9101220ae9a8`
- Normal `?mode=rotten&seed=GAUNTLET-ALPHA`, with no smoke parameters, reached the ordinary loadout at `1920x1080`: seed `GAUNTLET-ALPHA`, plan `RR1-1C93B57F`, Stage 1, graft `3`, no selected weapon/skill, zero combat objects, BODY focus, and one canvas.
  - Capture: `screenshots/iab-rotten-normal-loadout-1920x1080.png`
  - SHA-256: `04cfd73575ab4e06b2d29712a1e2f29bfc6986747bf00c6612b497d86ccf0631`
- At `1920x1080`, authorized automation after real `3`, `6`, `Enter`, `2` selection reached the reward docket; one real `1` purchase carried Tax Pike + Seized Stamp + Dead Letter, HP `6/6`, graft `0`, route history `1:bailiffs-ramp:upgrade:dead-letter`, reward decision count `1`, Stage 2 options `seized-goods-lift|late-fee-chapel`, and zero combat objects into the honest Stage 2 docket.
  - Capture: `screenshots/iab-stage2-carry-1920x1080.png`
  - SHA-256: `9a748cf455662b2f7bc3a84492b41ef7944fa0567712773336837b48963dab96`

The 1920 page reported `innerWidth=1920`, `innerHeight=1080`, `visualViewport=1920x1080`, device pixel ratio `1`, and canvas CSS `1920x1080`. The standard in-app Browser PNG encoder returned a visually complete `1873x1080` file; diagnostic clip/full-page calls exposed Browser capture coordinate/caching behavior and are not used as product evidence. This is an evidence-tool residual, not a product-layout failure. Automated focused evidence also contains native `1920x1080` captures.

## Console, Network, Resources, Canvas, And Visual Framing

- Direct Browser warning/error logs were empty on isolation, authorized encounter, Campaign, normal Rotten loadout, and Stage 2 carry.
- DOM resource inspection showed the production module `assets/index-kp_sjlIr.js`, production stylesheet `assets/index-BXaDcDRc.css`, `document.readyState=complete`, and one canvas.
- The exact loopback server ledger contained `138` HTTP 200 responses and `135` HTTP 304 responses. The only seven 404s were expected `/favicon.ico` probes; no production script, stylesheet, image, atlas, or background failed.
- The Browser read-only evaluator did not expose `PerformanceResourceTiming`, so the authoritative resource-status audit used the static server ledger plus direct console and DOM resource inspection. No product action was retried for that evaluator limitation.
- At both target viewports, the campaign fight, Rotten loadout, reward docket, and Stage 2 carry were readable, nonblank, production-coherent, and framed without clipping of required controls or state. Combat/background separation and HUD/card hierarchy remained coherent.

## Source Boundary And Architecture Audit

- `RottenRunScene` imports the existing `smokeAutoEnabled()` helper beside `smokeParam()`.
- It computes one effective value: `smokeAutoEnabled() ? smokeParam() : null`.
- Compatibility, encounter, market, heal, poor-market, and reacquisition fixture booleans all derive from that effective value. There is no second parser, permission flag, or split authority.
- Ordinary seed parsing still comes from the independent `mode=rotten&seed=...` query path.
- Encounter automation, combat timing, enemy behavior, player timing, market reduction, route planning, and presentation are untouched.
- The harness adds one negative isolation route and adds missing `smokeAuto=1` authorization to enemy-cycle and reacquisition fixture URLs. All other authorized Rotten fixture URLs retain explicit opt-in.
- No campaign runtime source, pure Rotten state/market/plan module, package, asset, or control document is part of the candidate.
- Direct reward, retry, and Stage 2 boundaries retained zero combat objects, supporting the existing controller ownership and cleanup model.

## Preserved Transient And Retry Audit

One direct Stage 2 selector observation expired immediately before `reward-choice/open` became visible. The required discriminator was preserved from the same live page: phase `reward-choice`, market `open`, HP `6/6`, graft `7`, attacks `6`, skill uses `2`, zero combat objects, one canvas. I did not reload, resend the route selection, or retry the flow. One subsequent `1` key completed the accepted carry. This was an observation-timing transient, not a deterministic product failure.

No nonzero isolation count was observed. No deterministic failure was retried to green. The full matrix ran once.

## Post-freeze Provenance Comparison

After the independent `PASS` was frozen, I opened the builder receipt. It independently reported:

- control `e7d3e397289a178719520856c03935e9104df364`;
- exactly the same two changed files;
- final hashes `89f8b262...` and `2ba97d0c...`;
- one expected pre-repair product red;
- first-attempt post-repair focused passes; and
- one 28/28 matrix.

The provenance matches the frozen candidate. Builder claims were not substituted for any acceptance evidence above.

## Cleanup And Residuals

- In-app Browser temporary viewport override was reset.
- The sole critic-owned tab was finalized with no kept tab.
- Static server on port `4178` was interrupted cleanly and exited `0`; final `lsof` found no listener.
- No headless Chrome, smoke harness, or critic server process remained.
- Repository status remained exactly the two frozen candidate files with unchanged hashes.
- All critic writes are confined to this external evidence directory.
- `npm ci` reported two high-severity audit findings in the pre-existing locked dependency graph. No dependency changed in this repair, and package remediation was outside authorized scope.
- Future Stage 2 combat, settings, records, accessibility completion, later enemies/elites, boss completion, and full-run proof remain explicitly outside this re-review.
- Ranked serious integration gaps: none.

Compact evidence:

- `candidate-freeze.json`
- `provisional-verdict.json`
- `independent-results.json`
- `direct-browser-evidence.json`
- `matrix/browser-smoke-results.json`
- `focused/`
- `screenshots/`

PASS
