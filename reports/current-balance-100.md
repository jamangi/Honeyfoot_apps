# Honeyfoot Cards — Current Balance Baseline

> Historical baseline: this report predates the three-slot, two-layer Condition-stack rule. It is retained for before-and-after comparison.

## Test

- 100 deterministic, seeded matches
- Archangels: Everyday Comfort
- The Callus: Pressure & Friction
- Starting Comfort: 8 of 16
- Current production rules, unchanged
- The same UI-independent engine now powers both the React board and these simulations

The Archangel agent prioritizes matching Care Actions, targets Conditions it can finish when possible, uses Dr. Honeyfoot while Conditions are active, uses relevant Fresh Socks protection, spends otherwise mismatched Care Actions for their generic Comfort, and plays the Care Kit when no more immediate care is available. The current computer Callus behavior plays one Condition when possible, otherwise its first available card.

## Results

| Measure | Result |
|---|---:|
| Archangel wins | 0 |
| Callus wins | 100 |
| Average match length | 8.10 rounds |
| Median match length | 8 rounds |
| Average Archangel cards played | 11.77 |
| Average Callus cards played | 7.10 |
| Average mismatched Care Actions | 6.15 |
| Average Condition triggers | 19.21 |
| Average active Conditions at match end | 4.44 |
| Average final Archangel hand | 1.43 cards |
| Average final Callus hand | 5.00 cards |

## Average Comfort trajectory

| Opening / completed round | Average Comfort |
|---|---:|
| Opening | 8.00 |
| Round 1 | 10.40 |
| Round 2 | 10.15 |
| Round 3 | 8.98 |
| Round 4 | 7.09 |
| Round 5 | 4.66 |
| Round 6 | 2.40 |
| Round 7* | 1.55 |

\*Later-round averages include only games that survived long enough to reach that point.

## Average Archangel hand trajectory

| Opening / completed round | Cards in hand |
|---|---:|
| Opening | 5.00 |
| Round 1 | 2.45 |
| Round 2 | 2.00 |
| Round 3 | 1.76 |
| Round 4 | 1.66 |
| Round 5 | 1.53 |
| Round 6 | 1.48 |
| Round 7* | 1.29 |

## Findings

1. The current matchup is not merely Callus-favored; it appears functionally unwinnable for the current automated Archangel policy across this seed sample.
2. Archangels briefly gain Comfort by rapidly spending the opening hand, peaking after Round 1. From Round 2 onward, accumulating Condition triggers outpace one-card natural draws.
3. More than half of Archangel Care Actions played were mismatched generic-Comfort plays on average. This quantifies the subtype dead-draw problem.
4. The Archangel played roughly 66% more cards than The Callus, yet still lost every match. The issue is therefore not passive Archangel play: Callus cards generate continuing value after being played.
5. The Callus hand remains near five cards because its current computer behavior plays approximately one card and draws one card per round. The Archangel hand rapidly stabilizes near one to two cards because it must spend several cards to compete.
6. Matches typically end with more than four unresolved Conditions, confirming that board pressure accumulates faster than the starter deck removes it.

## Interpretation limits

- This is a baseline of the current prototype, not a final balance verdict.
- The agents use transparent heuristics rather than exhaustive game-tree search.
- The current Callus computer does not yet exploit every Habit, Hazard, Shoe Attribute, or Supporter combination, so a stronger Callus policy could perform even better.
- The simulator intentionally applies no proposed balance adjustments.
