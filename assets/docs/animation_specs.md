# Animation Specs

## Runtime Style

Sprites use a high-res pixel-painted hybrid style: painted shapes and texture density, but clean enough to animate and atlas.

## Frame Sizes

| Asset | Frame Size | Notes |
|---|---:|---|
| Foxman player | `128x128` | Must include tail and weapon poses without clipping. |
| Small enemy | `96x96` | Rats and pests. |
| Medium enemy | `128x128` | Guards and brutes. |
| Mini-boss | `192x192` | Larger anticipation and attack arcs. |
| Pickup | `32x32` or `48x48` | Strong silhouette. |
| VFX burst | `128x128` | Hit sparks, dust, splatter, smoke. |
| UI icon | `64x64` source | Display size can vary. |

## Foxman Animation Set

| Animation | Frames | FPS | Loop | Notes |
|---|---:|---:|---|---|
| idle | 8 | 8 | yes | Tail and ear motion, no large foot drift. |
| walk | 10 | 12 | yes | Secondary if run carries early slice. |
| run | 10 | 16 | yes | Fast, springy, readable stride. |
| jump_start | 4 | 12 | no | Clear compression and launch. |
| jump_loop | 2 | 8 | yes | Airborne pose. |
| fall | 2 | 8 | yes | Downward readable pose. |
| land | 4 | 12 | no | Squash, dust trigger. |
| attack_1 | 6 | 14 | no | Anticipation, active, follow-through. |
| attack_2 | 6 | 14 | no | Optional chain. |
| heavy_attack | 10 | 12 | no | Later. |
| hurt | 4 | 12 | no | Clear damage response. |
| death | 12 | 10 | no | Comedic collapse, not overlong. |
| dash | 6 | 18 | no | Low silhouette, invuln window. |
| interact | 6 | 10 | no | Later. |

## Enemy Animation Set

| Animation | Frames | FPS | Loop | Notes |
|---|---:|---:|---|---|
| idle | 6 | 8 | yes | Distinct from patrol. |
| patrol | 8 | 10 | yes | Clear foot contacts. |
| alert | 4 | 10 | no | Big readable surprise. |
| attack | 6-10 | 12 | no | Windup, active, recovery. |
| hurt | 3 | 12 | no | Snappy. |
| death | 8-12 | 10 | no | Remove damage early. |

## Alignment Rules

- Feet/contact point should not crawl during idle.
- Character center should remain stable unless animation intentionally moves root.
- Tail and weapon arcs must fit inside the frame.
- Use consistent origin: bottom center for characters unless a scene needs otherwise.
- Keep a 4px minimum transparent padding around the subject after cleanup.

## Combat Timing Notes

Player attack frames:

- Anticipation: frames 1-2.
- Active: frames 3-4.
- Recovery: frames 5-6.

Drunken guard attack:

- Anticipation: 3-4 frames.
- Active: 1-2 frames.
- Recovery: 3-4 frames.

VFX should begin on the first confirmed hit frame, not on attack windup.
