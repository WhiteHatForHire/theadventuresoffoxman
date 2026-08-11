# Foxman Rotten Run Recovery Audit

Run ID: `foxman-rotten-run-gauntlet-2026-08-11`
Audited: `2026-08-11T04:09:00Z`

| Receipt or directive claim | Live evidence | Status | Safe next action |
| --- | --- | --- | --- |
| Prepared baseline is `779f935` on clean `main` | Git status and local/remote-tracking rev-parse | complete | Preserve as regression base. |
| Existing campaign smoke matrix is accepted | Fresh `npm run smoke:all`; 23/23 browser routes | complete | Run it before every gate promotion. |
| Exact goal must exist before implementation | Platform goal state | complete | Retain active goal through bounded completion. |
| Rotten Run implementation has begun | No Rotten Run runtime files or active leaf | pending | Freeze deterministic contract first. |
| Public deployment is authorized | Directive explicitly prohibits it without Marcus | unauthorized | Produce local review artifact only. |

## Authority Check

- Newest directive: [`MASTER_DIRECTIVE.md`](MASTER_DIRECTIVE.md) plus the delegated operator instruction in the visible lead task.
- Receipt authority still valid: yes.
- Scope removed or added: none; the campaign remains preserved and Rotten Run remains bounded.

## Irreversible-Action Check

- None occurred or is uncertain.

## Recovery Decision

`resume`

The verified repository matches the prepared state. Proceed only with unfinished, authorized Rotten Run work.

## Crash Recovery Audit - 2026-08-11T08:29:50Z

Event: Codex was force-quit around `2026-08-11T08:21:00Z` while a third LEAF-002 critic was attempting the final post-repair review.

| Receipt or live claim | Recovery evidence | Status | Safe next action |
| --- | --- | --- | --- |
| LEAF-001 requires promotion or repetition | `main` and `origin/main` are both `206a087`; history contains accepted LEAF-001 implementation `fa94e97` and its promotion/control commit | complete | Preserve; do not repeat LEAF-001. |
| LEAF-002 builder has not started | Dirty-set inspection shows exactly the bounded LEAF-002 Rotten implementation and additive tests; builder evidence is complete | superseded | Do not launch another builder unless a fresh critic returns `REVISE`. |
| LEAF-002 has a passing blind verdict | Two completed real-browser critics returned `REVISE`; the third produced only automated support before connector failure and force-quit | pending | Run one fresh post-repair blind browser critic. |
| The latest two critic defects remain unfixed | Candidate source and focused evidence show centralized floor anchoring plus bounded two-edge reacquisition and subsequent weapon hit | complete as candidate evidence | Require independent manual confirmation before promotion. |
| A Foxman worker or runtime may still own state | Agent tree has only the lead; process scan found no Foxman preview/harness; exactly one Foxman worktree exists | complete | It is safe to create one replacement critic after checkpoint commit. |
| PID `62255` belongs to the interrupted Foxman run | `lsof` cwd is `/Users/marcusvale/Documents/coding/marcusbrainhq/repos/carpet-front/.worktrees/cf-l002-r01-recritic` | false | Leave the unrelated process untouched. |
| Preserved candidate/review evidence may have been lost | All `leaf-002-evidence`, `leaf-002-critic`, `leaf-002-recritic`, and `leaf-002-recritic2` directories and key JSON/PNG receipts exist | complete | Use a new `leaf-002-recritic3` directory; never overwrite prior evidence. |

### Authority Check

- The canonical directive and Gauntlet protocol remain authoritative.
- The force-quit did not broaden permissions: local build, explicit Git commit, and push remain authorized; public deployment remains unauthorized.
- Exactly one active descendant remains the limit. No descendant survived, so one replacement critic is allowed after the durable checkpoint.
- The authored campaign and its accepted smoke matrix remain protected regression truth.

### Irreversible-Action Check

- No uncertain irreversible action was found. Remote-tracking and local accepted heads match.
- No source candidate was staged, committed, pushed, deleted, or rewritten during recovery.
- The unrelated Carpet Front preview was inspected read-only and left running.

### Recovery Decision

`resume`

Resume only LEAF-002's unfinished post-repair blind acceptance. If the real-browser connectors remain unavailable, record a pending human verdict and preserve a human-ready local artifact; do not convert headless automation into a manual pass.
