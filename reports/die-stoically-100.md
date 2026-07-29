# Die Stoically — 100-match baseline

The same fixed seeds (1–100), decks, card rules, 16 maximum Comfort, and 8 starting Comfort were used for direct comparison with `severity-to-comfort-100.md`.

## Policy change

The Archangel agent now preserves unmatched Care Actions unless their generic Comfort would either complete a winning burst or provide the minimum Comfort needed to survive the next condition check. Dr. Honeyfoot prefers targets that remove a condition layer, lack a matching Care Action in hand, or are high-priority Mild Heel Fissures / Morning Dagger targets. No cards or game rules changed.

## Results

| Metric | Previous policy | Die Stoically |
| --- | ---: | ---: |
| Archangel wins | 12 | 82 |
| Callus wins | 88 | 18 |
| Average rounds | 9.26 | 5.25 |
| Median rounds | — | 4 |
| Average final Comfort | 1.92 | 13.12 |
| Average Archangel cards played | 13.21 | 8.14 |
| Average Callus cards played | 8.26 | 4.25 |
| Average generic Care plays | 6.33 | 2.24 |
| Average condition triggers | 24.32 | 8.11 |
| Average conditions at end | 2.68 | 0.89 |
| Average final Archangel hand | 1.21 | 1.92 |
| Average final Callus hand | 5.00 | 5.00 |

## Interpretation

The matchup changed from strongly Callus-favored to strongly Archangel-favored without a balance change. The present Callus computer frequently supplies highly efficient matching targets while the Archangel waits, and it does not account for an opponent preserving a finishing burst. This result measures the interaction between the two agents as much as the underlying card balance.

The large swing means future balance work should distinguish at least three variables: the game rules, the deck lists, and each side's decision policy. The Care Kit can still be evaluated separately, but these results do not justify strengthening the Archangel deck in isolation.
