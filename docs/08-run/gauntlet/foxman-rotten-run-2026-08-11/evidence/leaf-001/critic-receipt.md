# LEAF-001 fresh critic receipt

- Candidate: uncommitted working tree on `main`, parent `ca2cd8740cb1`.
- URLs: `http://127.0.0.1:4177/` and `http://127.0.0.1:4177/?mode=rotten&seed=GAUNTLET-ALPHA`.
- Viewports: 1366x768 and 1920x1080. Saved PNG dimensions were checked with `sips`.
- Real keys: `Enter` reached `RunScene`; `R` reached `RottenRunScene`; `1` selected `unfiled-alley`; `2` selected `bailiffs-ramp`.
- Seeded initial state: seed `GAUNTLET-ALPHA`, plan `RR1-1C93B57F`, phase `route-choice`, Stage 1 options `unfiled-alley|bailiffs-ramp`, no route selected, trace `07210060`.
- After `1`: phase `encounter`, selected `unfiled-alley`, trace `EF23087D`.
- After `2`: phase `encounter`, selected `bailiffs-ramp`, trace `37B47681`.
- Focused Chrome shell smoke passed title entry, direct seeded entry, structured `window.__FOXMAN_ROTTEN__`, 1366x768 viewport, and network/console error guard.
- Full browser smoke passed all accepted campaign routes plus the Rotten Run route; the harness reports failure on JavaScript exceptions, console errors, log errors, or HTTP responses >=400 other than favicon.
- Deterministic checks passed: `npm run typecheck`, `npm test` (27/27), `npm run build`, `npm run smoke`, focused `npm run smoke:browser`, full `npm run smoke:browser`, and `git diff --check`.
- Visual review: title retains the accepted Foxman illustration and campaign hierarchy while making Rotten Run visible without displacing Enter semantics. The shell is clearly a separate mode, uses coherent rotten-civic typography/color/copy, shows the entire three-stage plan and fixed boss, and keeps both Stage 1 choices legible at both target viewports.
- Verdict: pass.
