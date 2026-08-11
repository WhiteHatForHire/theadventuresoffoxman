# Foxman Rotten Run Gauntlet Manifest

Run ID: `foxman-rotten-run-gauntlet-2026-08-11`

Authority: [`MASTER_DIRECTIVE.md`](MASTER_DIRECTIVE.md)

Goal: Finish the bounded Foxman Rotten Run side-scrolling roguelite vertical slice through the Gauntlet Loop

Started: `2026-08-11T04:05:26Z`

## Run Shape

Single-project Gauntlet with one visible lead, one bounded builder at a time,
and fresh-context blind critics. The lead alone promotes work.

## Baseline

- Repository: `WhiteHatForHire/theadventuresoffoxman`
- Expected branch at launch: `main`
- Launch status: clean
- Stack: Vite, TypeScript, Phaser 3
- Existing campaign and smoke matrix are preserved regression baselines.
- Verified launch head: `779f93571b22f4b7606328d82626719220e31ac9`.
- Verified launch evidence: `npm run smoke:all` passed all 23 existing browser routes on 2026-08-11.

## Dependency Order

1. Audit and deterministic seeded-run contract.
2. Minimal complete run spine using existing systems.
3. Route, weapon, skill, mutation, and encounter diversity.
4. Presentation, audio, feedback, accessibility, and performance.
5. Integration critic, three-build proof, product story, and postmortem.

## Concurrency And Ownership

- One active descendant maximum.
- Builders receive disjoint allowed paths and cannot edit lead control files.
- Critics are read-only and receive no builder rationale.
- Lead owns state, decisions, promotions, commits, and pushes.

## Run Controls

- Concurrency cap: one active descendant.
- Token ceiling: `1250000000` project tokens.
- Autonomous trajectory audits: `25M`, `50M`, `100M`, then each additional `100M`; protocol controls also apply at 70/85/95 percent.
- Degradation rule: narrow to the strongest complete slice before adding content; at 85 percent admit only release-closing work.
- Receipt: [`RUN_RECEIPT.md`](RUN_RECEIPT.md), append-only at consequential transitions.
- State: [`RUN_STATE.json`](RUN_STATE.json), rewritten atomically after consequential transitions.
- Checkpoint cadence: every leaf verdict, promotion, gate boundary, trajectory audit, external action, and completion decision.

## Error Policy

| Class | Action |
| --- | --- |
| Transient tool/browser failure | Retry once with fresh runtime evidence, then diagnose. |
| Invalid command or worker return | Correct once; do not promote without required evidence. |
| Missing information or dependency | Stop the leaf and return the decision to the lead. |
| Authority, privacy, credential, or licensing issue | Halt the affected action immediately. |
| Same no-progress state twice | Stop under the protocol and record the evidence. |

## External Actions

- Authorized: local edits, original project-local assets, installs, tests, managed local servers, browser evidence, commits, and pushes to this repository.
- Human approval required: public deployment or domains, purchases or paid services, store actions, credentials, destructive history changes, or deletion of accepted campaign work.

## Stop Conditions

Stop only at bounded completion, unreconcilable repository state, a truly
irreversible human-only action, repeated no-progress under the protocol, or the
token ceiling. Human unavailability alone is not a stop condition for local
implementation and evidence work.
