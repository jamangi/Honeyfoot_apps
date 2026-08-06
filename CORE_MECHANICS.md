# Honeyfoot Cards — Core Mechanics Specification

## 1. Purpose and authority

This document defines the rules contract for **Honeyfoot Cards**. It is intended to be understandable without reading the React UI or the current JavaScript engine and precise enough to guide a new implementation, including a server-authoritative multiplayer implementation.

`CARDS.md` defines the individual cards. When rebuilding the game:

1. Follow this document for general rules.
2. Follow `CARDS.md` for card-specific exceptions.
3. Treat a card-specific rule as overriding a general rule only where the card explicitly says so.
4. Do not infer a new rule merely from current UI layout, AI behavior, animation timing, or an implementation accident.

The words **MUST**, **MUST NOT**, **SHOULD**, and **MAY** are normative. “Current implementation note” describes the present prototype but is not automatically a permanent design rule.

## 2. The game in one paragraph

Two factions contest one shared **Comfort Level**. The **Archangels** raise Comfort by playing compatible **Care Actions** that ease the **Severity** of Conditions; the **Callus** lowers Comfort by placing persistent **Conditions** that deal **Discomfort** during each Care Check. A player may play any number of otherwise-legal cards during their turn and then must explicitly choose **End Turn**. The Callus may play no more than one Condition per turn, although it may also play legal non-Condition cards. The Archangels win when Comfort reaches its maximum. The Callus wins when Comfort reaches zero.

## 3. Core vocabulary

### 3.1 Match, round, and turn

- A **match** is one complete game between one Archangel deck and one Callus deck.
- A **round** contains the human/player turn, the opposing side's turn, the Care Check, and the draw/start-of-next-round transition.
- A **turn** is one side's opportunity to play cards. A player retains priority until they press **End Turn** or the match ends.
- **End Turn** is an explicit action. The turn MUST NOT pass merely because the player has played a card or has no obvious play.
- Unless an effect says otherwise, a player MAY play any number of legal cards during their turn.

The present single-player interface always gives the human the first actionable turn of a round, then resolves the computer opponent, then performs the Care Check and draw. A future symmetric or multiplayer implementation may represent turns differently, but it MUST preserve the same card limits and timing windows unless the rules are deliberately revised.

### 3.2 Factions

- **Archangels** specialize in Care Actions, Supporters, Equipment, and Environments. Their goal is maximum Comfort.
- **The Callus** specializes in Conditions, Supporters, Shoe Attributes, Habits, and Hazards. Its goal is zero Comfort.
- A deck and its cards belong to one faction. A normal deck MUST contain cards belonging to its faction.

### 3.3 Comfort Level, Comfort, and Discomfort

- **Comfort Level** is the single shared score and the match's win condition.
- The standard maximum Comfort is **16**.
- A standard match starts at **8 Comfort**, exactly 50% of the maximum.
- **Restore N Comfort** means add `N` to the shared Comfort Level, capped at the maximum.
- **Deal N Discomfort** means subtract `N` from the shared Comfort Level, floored at zero.
- If Comfort becomes 16 (or the configured maximum), the Archangels win immediately.
- If Comfort becomes 0, The Callus wins immediately.
- A match result is checked after every effect that changes Comfort; play stops once a winner exists.

Comfort is not owned separately by each faction. Both sides manipulate the same number.

### 3.4 Condition

A **Condition** is a persistent Callus card placed in one of three unique Condition slots. A Condition has:

- a card identity;
- a **subtype**;
- one or more **traits**;
- one or two physical **layers/copies**;
- a current total **Severity**;
- a printed Discomfort value; and
- an owner, normally The Callus.

A Condition remains in play until all of its layers have been removed. Conditions are not discarded merely because they triggered.

### 3.5 Severity and easing

- **Severity** is the amount of compatible care a Condition can resist before it is removed.
- **Ease/Reduce Severity by N** means subtract up to `N` Severity from the selected Condition.
- Severity cannot fall below zero.
- The amount **actually removed** may be less than the printed reduction. For example, reducing a 2-Severity Condition by 4 removes only 2 Severity.
- When a Condition's final layer reaches zero, that Condition leaves play and its physical card copy enters its owner's discard pile.

In the current rules, a compatible **Care Action** restores Comfort equal to the amount of Severity it actually removes. This is the central Severity-to-Comfort rule.

Example: Heavy Heel Balm reduces a Surface Condition from 4 to 1. It removed 3 Severity, so Comfort rises by 3.

Example: Targeted Cream reduces a 2-Severity Microbial Condition by up to 4. It removes only 2 Severity, so Comfort rises by 2.

### 3.6 Care Action

A **Care Action** is an Archangel card that normally targets one or more compatible Condition subtypes.

- If at least one compatible Condition exists, the Care Action MUST target one of them.
- It reduces the selected Condition's Severity by its stated amount, including applicable bonuses or penalties.
- It restores Comfort equal to the Severity actually removed.
- It then goes to the Archangel discard pile unless a card explicitly says it persists.
- If no compatible Condition exists, the Care Action has no Condition target and instead restores exactly **1 Comfort**.
- A Care Action with a valid target does not also receive the fallback 1 Comfort; it receives only the Severity-to-Comfort restoration.

This “no legal target” fallback is intentional. It lets Archangels convert otherwise unusable Care Actions into small finishing bursts, but compatible Conditions cannot be ignored in order to claim the fallback.

### 3.7 Compatibility and subtypes

The primary Condition subtypes are:

- **Surface**
- **Microbial**
- **Structural**
- **Keratin**

Most Care Actions name one compatible subtype. A Care Action is compatible when its targeting rule contains the Condition's subtype. Some cards, such as Pumice Stone, list more than one compatible subtype.

Traits such as `Kinetic`, `Precision`, `Friction`, and `Fungal` are additional hooks. A trait does not itself create subtype compatibility unless a card explicitly says it does.

### 3.8 Supporter

A **Supporter** is a one-use character card. It resolves its effect and enters its owner's discard pile. Supporter-based Severity reduction is not a Care Action:

- it reduces Severity as printed;
- it does **not** restore Comfort through the Severity-to-Comfort rule; and
- it may have another effect such as drawing or searching.

There is currently no global one-Supporter-per-turn limit in the engine. Do not add one during a rebuild unless it is adopted as a new explicit rule.

### 3.9 Influence

**Influence** is the collective rules term for persistent cards occupying the three Influence slots:

- Archangel: **Equipment**, **Environment**
- Callus: **Shoe Attribute**, **Habit**, **Hazard**

Supporters and Conditions are not Influence cards.

Each side has exactly **three Influence slots**.

- If an Influence is played while an empty slot exists, it enters an empty slot automatically.
- If all three slots are occupied, the player chooses an occupied slot to replace.
- The replaced Influence enters its owner's discard pile.
- The player MUST be able to cancel before replacement resolves; cancellation returns the newly played card to hand and refunds its Supply/cost and provisional play state.
- The UI SHOULD require confirmation before replacing an occupied Influence, with an optional “do not ask again this match” convenience setting.

Duplicate Influences are legal unless a card says otherwise. “This effect does not stack” means additional copies may occupy slots but do not multiply that named effect.

### 3.10 Supply

**Supply** is the Archangel resource used to pay card costs.

- An Archangel starts with **3 Supply**.
- The Callus currently has no Supply system and its cards cost zero.
- Playing an Archangel card subtracts its effective Supply cost immediately.
- A card cannot be played if its effective cost exceeds the player's current Supply.
- At the transition to each new round/turn, the Archangel gains **1 normal Supply**.
- Supply is cumulative and currently has no maximum.
- Persistent effects may add Supply or modify a card's effective cost.
- Supply spent on a canceled search, canceled Influence placement, or canceled target-selection transaction MUST be restored because the card play is rolled back.

### 3.11 Deck, hand, and discard pile

- A standard deck contains exactly **24 cards**.
- A deck may contain at most **3 copies** of one card identity.
- Each side draws an opening hand of **5 cards**.
- At the end-of-round transition, both players draw one card.
- Duplicate cards in a hand may be visually stacked, but each copy remains a distinct physical card.
- Removing one copy from a hand stack MUST NOT reorder unrelated stacks under the player's pointer.
- Both discard piles are public and inspectable.
- The contents of a player's hand and unrevealed deck are private.

If a deck is empty when it must draw, the current prototype creates a fallback card instead of causing a deck-out loss:

- Archangels receive **Basic Massage**.
- The Callus receives **Commercial Hard Floors**.

This fallback rule is current behavior and should be retained by a faithful rebuild unless the deck-out design is deliberately revisited.

### 3.12 Draw, search, reveal, and shuffle

- **Draw** moves the top card of a deck to its owner's hand. It is private information.
- A private draw may be shown in the drawing player's History but MUST NOT be exposed to the opponent in multiplayer.
- **Search** pauses resolution and lets the player inspect all valid cards remaining in their deck.
- A search interface SHOULD also provide an **All** view so the owner can inspect the full remaining deck.
- If the player selects a valid card, it moves to their hand, is **revealed** publicly, and the remaining deck is shuffled.
- If no valid card exists, or an optional search is finished without a card, the deck is still shuffled.
- A search may be canceled before resolution. Cancellation rolls back the entire card play: the source card returns to hand, spent Supply is refunded, the discard/log/play count is restored, and the deck remains unchanged.
- “Reveal” makes the named card public knowledge and therefore visible in History to both players.

### 3.13 History

**History** is the authoritative human-readable match record (formerly called Battle Log). It SHOULD record:

- setup and opening-hand count;
- each card played;
- card-specific resolution details;
- publicly revealed search results;
- private draw details visible only to the drawing player;
- Care Check modifiers and prevention;
- total Discomfort dealt;
- start-of-turn Supply generation;
- concession and match result.

In multiplayer, History entries MUST be filtered by visibility before being sent to a client. Hiding private information only in the rendering layer is insufficient.

## 4. Match setup

A standard match is initialized as follows:

1. Validate one 24-card Archangel deck and one 24-card Callus deck, each respecting the 3-copy limit.
2. Set maximum Comfort to 16 and current Comfort to 8.
3. Shuffle each deck independently, unless a tutorial supplies a deterministic order.
4. Draw the first 5 cards into each opening hand.
5. Give the Archangel side 3 Supply and The Callus 0 Supply.
6. Create three empty Influence slots for each side.
7. Create three empty unique Condition slots shared by the active Conditions.
8. Set “Condition played this turn” to false for both sides.
9. Begin round 1 with the human/player side active in the current single-player flow.

Tutorials MAY provide complete predetermined deck orders. The same tutorial MUST produce the same opening hands and subsequent draws every time unless the tutorial deliberately branches.

## 5. Playing a card: universal legality sequence

Before a card is removed from hand, an implementation MUST verify:

1. The card is actually in that side's hand.
2. The match has not ended.
3. It is that side's turn.
4. The card belongs to that side/faction in normal play.
5. The player can pay its effective Supply cost, if applicable.
6. If it is a Condition, the one-Condition-per-turn rule, unique-slot limit, and stack-copy limit allow it.
7. Any other card-specific prerequisite is satisfied.

Resolution should be transactional. A card that opens a cancelable choice may be provisionally removed and paid for, but canceling MUST restore the exact prior legal state.

## 6. Condition placement, limits, and stacks

### 6.1 One Condition per turn

Each side may play at most **one Condition card per turn**. Playing or stacking a Condition consumes that turn's Condition allowance. Playing non-Condition cards does not consume it.

### 6.2 Three unique Condition slots

At most **three different Condition identities** may be in play at once.

- A new Condition identity requires an empty unique Condition slot.
- A duplicate of a Condition already in play does not require another unique slot.
- When all three unique slots are occupied, a new identity is illegal, but a legal duplicate may still stack.

### 6.3 Maximum two copies per stack

Each Condition identity may have at most **two copies/layers** in its stack.

- The first copy creates the stack.
- The second copy adds a new layer.
- A third copy cannot be played while both layers remain.
- Each layer records the entrance Severity of that physical copy after all entrance modifiers.
- Total displayed Severity is the sum of remaining layer Severities.
- Total ordinary Discomfort is printed Discomfort multiplied by the number of remaining copies, before other effects.

### 6.4 Additive entrance modifiers

Entrance modifiers are calculated for each newly played copy and are additive unless an effect says it does not stack. The modified entrance value becomes that layer's own Severity.

Example: Mild Heel Fissures normally enters with 4 Severity. Aggressive Taper adds 1, so that layer enters with 5. A later second copy entering under the same effect also creates a 5-Severity layer, for 10 total Severity.

### 6.5 Layered removal

Severity reduction works through layers in play order, oldest layer first.

1. Apply reduction to the first layer.
2. If that layer reaches zero, discard one physical copy and carry unused reduction into the next layer.
3. Continue until the reduction is exhausted or no layers remain.
4. Update total Severity and copy count.
5. Remove the Condition stack entirely when no layers remain.

Example: a stack has layers `[4, 4]` and receives 5 reduction. The first layer is removed and 1 carries over, leaving one layer at 3 Severity. One physical copy is discarded; one remains in play.

The Comfort restored by a Care Action equals the total Severity actually removed across all affected layers.

## 7. Target-selection rules

Target choice is a rule, not merely a UI preference.

### 7.1 Care and Supporter targeting

When a card requires a Condition target:

- **Zero legal targets:** resolve the Care Action's 1-Comfort fallback; a Supporter simply has no Severity target unless its card says otherwise.
- **Exactly one legal target:** select it automatically.
- **More than one legal target:** pause and require the player to select one legal Condition.

All legal targets SHOULD glow or otherwise be clearly marked. Invalid Conditions MUST NOT be selectable. A cancel option MUST return the card to its pre-play state if the choice was opened as part of playing it.

The engine MUST NOT silently choose “the first” compatible Condition for a human when several exist.

### 7.2 Influence-removal targeting

If an effect removes an opposing Influence:

- zero legal targets: resolve the rest of the card, with no removal;
- one legal target: it MAY be selected automatically;
- multiple legal targets: the player MUST choose;
- canceling the choice rolls back the source card's play.

## 8. The Care Check and new-round transition

After both sides have completed their turns, perform one **Care Check**. The current rules resolve it in this conceptual order:

1. Determine each active Condition's ordinary Discomfort: `printed Discomfort × remaining copies`.
2. Apply trigger multipliers or additions from Conditions and active Callus Influences. Effects marked “does not stack” are counted once even if duplicate Influences are present.
3. Determine any Archangel prevention effect and the trigger it prevents.
4. Sum the final Discomfort and subtract it from Comfort once.
5. Discard any one-use prevention Influence that was consumed.
6. Check the win condition.
7. If the match continues, advance the round number.
8. Reset each side's “Condition played this turn” flag.
9. Each side draws one card (or receives its empty-deck fallback).
10. Each Archangel gains 1 normal Supply plus applicable persistent Supply generation.
11. Begin the next player turn.

The implementation should produce individual History entries for meaningful modifiers as well as a summary of total Discomfort.

## 9. Ending a match

A match ends immediately when one of these occurs:

- Comfort reaches the maximum: **Archangels win**.
- Comfort reaches 0: **The Callus wins**.
- A player concedes: the opposing faction wins.
- A debug-only instant-win card resolves in a development match.

Once `result` is set, no further cards, Care Checks, draws, or delayed effects may alter the match.

Concede MUST ask for confirmation before committing.

## 10. Rules that are intentionally not present

A faithful rebuild MUST NOT invent these common card-game rules:

- There is no automatic deck-out loss.
- There is no fixed one-card-per-turn rule; the general rule is any number of legal cards.
- There is no global one-Supporter-per-turn rule at present.
- There is no hand-size limit at present.
- There is no Supply maximum at present.
- There is no combat, attack target, creature health, or separate player health.
- Conditions do not attack each other.
- Reducing Severity with a Supporter does not restore Comfort.
- A player cannot choose the 1-Comfort fallback while a compatible Condition exists.

## 11. Current single-player opponent conventions

These are AI policies, not fundamental card rules:

- A Training Callus bot plays the first legal Condition readily and may play liabilities.
- Pressure and Executive Callus bots favor stronger or already-established Conditions.
- The present Callus opponent plays at most one selected card per computer turn.
- A normal Archangel bot may play multiple cards in one computer turn.
- A tutorial Archangel opponent is capped at one card per turn so it does not race ahead of lesson scripting.
- “Die Stoically” is an Archangel AI heuristic: preserve no-target Care Actions unless spending them wins immediately or is necessary to survive the next Care Check. This is not a restriction on human players.

AI must use the same legality, costs, targeting, and resolution functions as a human player.

## 12. Persistence and multiplayer requirements

### 12.1 Saved matches

The current app serializes match state locally so navigating elsewhere or refreshing does not interrupt a game. A reconstruction SHOULD preserve:

- exact deck order;
- hands and stable hand-stack ordering;
- discard piles;
- Condition layer values and owners;
- Influence slot positions;
- Comfort, Supply, round, and per-turn flags;
- pending choices;
- History with visibility metadata;
- match result and reward-granted flag.

### 12.2 Server-authoritative multiplayer

For multiplayer, the server MUST own and validate the canonical state. Clients should send intents such as:

- `PLAY_CARD(cardInstanceId)`
- `SELECT_CONDITION_TARGET(conditionKey)`
- `SELECT_INFLUENCE_SLOT(slotIndex)`
- `SELECT_SEARCH_CARD(deckInstanceId)`
- `CANCEL_PENDING_ACTION`
- `END_TURN`
- `CONCEDE`

The server validates legality, resolves the complete transaction, and sends each client a redacted view. Never send an opponent's full deck order, hand identities, or private draw details to the other client.

Use stable **physical card instance IDs** in a multiplayer rebuild. Card definition IDs alone are insufficient to distinguish three copies in a deck, individual stack layers, searches, and deterministic replay.

## 13. Required acceptance scenarios

A new engine should have automated tests for at least these cases:

1. Match starts at 8/16 with five-card hands and 3 Archangel Supply.
2. A player can play multiple legal cards, but Callus cannot play a second Condition in the same turn.
3. Three unique Conditions are legal; a fourth identity is rejected.
4. A duplicate forms a two-layer stack; a third copy is rejected.
5. Entrance modifiers are stored per layer and total Severity is additive.
6. Reduction crosses layer boundaries and discards each removed physical copy.
7. A compatible Care Action restores exactly the Severity actually removed.
8. A no-target Care Action restores exactly 1 Comfort.
9. A Supporter reduces Severity without restoring Comfort.
10. One target auto-resolves; multiple targets require a human choice.
11. Three Influence slots fill automatically; a fourth Influence requires replacement selection.
12. Canceling a search, placement, or removal restores hand, Supply, deck/board, play count, and History.
13. Search results are revealed; ordinary draws remain private.
14. Duplicate “does not stack” Influences occupy space but contribute their named effect only once.
15. Care Check calculates stack Discomfort, modifiers, and prevention correctly.
16. Empty-deck draws create the appropriate fallback card and do not end the match.
17. Comfort reaching either boundary stops all further resolution.
18. Saved and restored state produces the same next result as uninterrupted play.

## 14. Known specification/implementation gaps

The current prototype contains printed effects that are not fully represented in the generic resolver. These must not be silently forgotten:

- **Hydrocolloid Bandage:** printed text promises prevention of the treated blister's next trigger; the current engine performs the Severity reduction but does not attach that prevention to the Condition.
- **Friction Blister:** printed text says it gains Severity when paired with a friction card; the current engine does not implement a general “paired with Friction” rule.
- **The Morning Dagger:** printed text says its first trigger deals 1 additional Discomfort; the current engine does not track or apply a first-trigger flag.

`CARDS.md` marks these explicitly. A clean rebuild should implement the documented card rule or consciously revise the printed card before release; it should not reproduce the omission by accident.

