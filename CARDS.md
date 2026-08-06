# Honeyfoot Cards — Card Reference

## 1. How to read this reference

This file specifies every card currently present in the Honeyfoot Cards library. It supplements `CORE_MECHANICS.md`.

Each entry separates:

- **Printed rule:** wording players should see.
- **Required resolution:** unambiguous engine behavior.
- **Interactions:** important combinations and exceptions.
- **Implementation status:** whether the present prototype fully implements the required resolution.

When a printed rule and the current JavaScript disagree, the discrepancy is stated instead of hidden. A new engine should implement the **required resolution**, then add an automated test for it. If the design is changed later, update both the printed rule and this reference together.

## 2. Card data vocabulary

Every card definition should have these stable fields:

- `id`: stable machine identifier; never use the display name as a database key.
- `name`: player-facing title.
- `faction`: `archangels` or `callus`.
- `type`: highest-level rules category.
- `subtype`: Condition/Care compatibility category when applicable.
- `traits`: additional effect hooks; traits do not imply subtype compatibility by themselves.
- `cost`: printed base Supply cost. Callus cards currently cost 0.
- `severity`: a Condition's unmodified entrance Severity.
- `discomfort`: a Condition's ordinary Discomfort per remaining copy at each Care Check.
- `text`: player-facing rule or flavor text.
- `price`: Petal purchase price for a non-starter card.
- `debug`: excludes a development card from ordinary play and collection rules.

For multiplayer, deck entries and cards in play also need unique physical instance IDs. The `id` below identifies the definition, not an individual copy.

## 3. Collection and deck-building status

The starter collection owns the 19 cards used in the two starter decks. Owning one card definition permits the player to place up to the normal **3-copy deck limit** in decks; individual copies are not separately collected.

The nine expansion cards are initially unowned and appear greyed out in the deck builder. They can be bought individually there:

- Care Action or Condition: **120 Petals**
- Equipment, Environment, Shoe Attribute, Habit, Hazard, or Supporter: **300 Petals**

Debug cards are development-only and should not appear in normal deck building.

## 4. Archangel cards

### 4.1 Basic Massage

| Field | Value |
|---|---|
| ID | `basic-massage` |
| Type | Care Action — Structural |
| Traits | Kinetic, Massage |
| Supply cost | 0 |
| Starter owned | Yes |

**Printed rule:** Reduce a Structural Condition by 2 Severity, or restore 1 Comfort.

**Required resolution:** If one or more Structural Conditions exist, select one and reduce it by 2. Restore Comfort equal to the Severity actually removed. If none exists, restore 1 Comfort instead.

**Interactions:** Because it has the Kinetic trait, it removes 1 additional Severity from Toe Cramp. Therefore it removes up to 3 from Toe Cramp. The Static Stand raises its effective cost from 0 to 1 while active.

**Implementation status:** Implemented.

### 4.2 Comfort Stretch

| Field | Value |
|---|---|
| ID | `comfort-stretch` |
| Type | Care Action — Structural |
| Traits | Kinetic, Stretch |
| Supply cost | 0 |
| Starter owned | Yes |

**Printed rule:** Reduce a Structural Condition by 3 Severity.

**Required resolution:** Select a Structural Condition and reduce it by 3, restoring Comfort equal to actual Severity removed. With no legal Structural target, restore 1 Comfort.

**Interactions:** Removes 4 from Toe Cramp because it is Kinetic. Costs 1 while The Static Stand is active.

**Implementation status:** Implemented.

### 4.3 Heavy Heel Balm

| Field | Value |
|---|---|
| ID | `heel-balm` |
| Type | Care Action — Surface |
| Traits | Topical, Moisture, Heel |
| Supply cost | 1 |
| Starter owned | Yes |

**Printed rule:** Reduce a Surface Condition by 3 Severity or restore 1 Comfort.

**Required resolution:** Select a Surface Condition and reduce it by 3, restoring Comfort equal to actual Severity removed. Only when no Surface Condition exists does it restore 1 Comfort instead. The word “or” expresses the normal no-target fallback; the player cannot choose the fallback while a valid target exists.

**Implementation status:** Implemented.

### 4.4 Hydrocolloid Bandage

| Field | Value |
|---|---|
| ID | `hydro-bandage` |
| Type | Care Action — Surface |
| Traits | Protective, Blister, Barrier |
| Supply cost | 1 |
| Starter owned | Yes |

**Printed rule:** Reduce a blister Condition by 4 Severity and prevent its next trigger.

**Required resolution:** Select a Condition with the `Blister` trait, reduce it by 4, and restore Comfort equal to actual Severity removed. If it remains in play, attach a one-use prevention marker to that Condition. The next time that Condition would contribute its ordinary trigger, prevent that trigger and remove the marker. If no Blister Condition exists, restore 1 Comfort.

**Interactions:** Friction Blister is currently the only Condition with the Blister trait. A future card may also qualify regardless of subtype.

**Implementation status:** **Partial.** The current engine treats this as compatible with every Surface Condition, not only Blister Conditions, and does not create the promised next-trigger prevention. A rebuild should correct both points or revise the printed card deliberately.

### 4.5 Targeted Cream

| Field | Value |
|---|---|
| ID | `antifungal-cream` |
| Type | Care Action — Microbial |
| Traits | Topical, Fungal, Targeted |
| Supply cost | 1 |
| Starter owned | Yes |

**Printed rule:** Reduce a Microbial Condition by 4 Severity.

**Required resolution:** Select a Microbial Condition, reduce it by 4, and restore Comfort equal to actual Severity removed. With no legal target, restore 1 Comfort.

**Implementation status:** Implemented.

### 4.6 Proper Trimming

| Field | Value |
|---|---|
| ID | `proper-trimming` |
| Type | Care Action — Keratin |
| Traits | Precision, Nail |
| Supply cost | 1 |
| Starter owned | Yes |

**Printed rule:** Reduce a Keratin Condition by 3 Severity.

**Required resolution:** Select a Keratin Condition, reduce it by 3, and restore Comfort equal to actual Severity removed. With no legal target, restore 1 Comfort.

**Interactions:** The Spiking Corner grants Precision Care Actions +1 reduction against it, so Proper Trimming removes up to 4 Severity from it.

**Implementation status:** Implemented.

### 4.7 Everyday Care Kit

| Field | Value |
|---|---|
| ID | `care-kit` |
| Type | Equipment |
| Traits | Tools, Supply |
| Supply cost | 2 |
| Starter owned | Yes |

**Printed rule:** At the start of your turn, gain 1 additional Supply.

**Required resolution:** Place this card in an Archangel Influence slot. It produces no immediate rebate. At each later new-round/start-of-turn Supply step, its controller gains 1 Supply in addition to the normal 1 Supply. Each active copy produces 1; this effect currently stacks because the card does not say otherwise.

**Implementation status:** Implemented. The prototype permits multiple Care Kits and adds one Supply per active copy.

### 4.8 Dr. Honeyfoot

| Field | Value |
|---|---|
| ID | `dr-honeyfoot` |
| Type | Supporter |
| Traits | Clinic, Draw |
| Supply cost | 0 |
| Starter owned | Yes |

**Printed rule:** Choose a Condition. Reduce its Severity by 2, then draw a card.

**Required resolution:** If Conditions exist, choose any one regardless of subtype and reduce it by 2. This Supporter reduction does **not** restore Comfort. Then draw one private card. Dr. Honeyfoot enters the discard pile after resolving. If more than one Condition exists, the human chooses; if exactly one exists, it may auto-target. The draw still occurs after the card resolves.

**Interactions:** Often reserved for a subtype the current hand cannot otherwise address. It may remove a layer but grants no Severity-to-Comfort conversion because it is not a Care Action.

**Implementation status:** Implemented, including private History detail for the drawing player.

### 4.9 Fresh Breathable Socks

| Field | Value |
|---|---|
| ID | `fresh-socks` |
| Type | Environment |
| Traits | Breathable, Dry |
| Supply cost | 1 |
| Starter owned | Yes |

**Printed rule:** Prevent the next Surface or Microbial trigger this round.

**Required resolution:** Place this card in an Influence slot. During the next Care Check, prevent one eligible Surface or Microbial Condition trigger, then discard Fresh Breathable Socks. If no eligible Condition triggers that round, it remains until it can prevent one.

**Clarification:** “One trigger” means the ordinary Discomfort contribution of one eligible physical Condition copy, not all triggers of a two-copy stack and not global bonuses such as Commercial Hard Floors. If a future design wants the entire stack prevented, the printed rule should say so explicitly.

**Implementation status:** Implemented using the first eligible Condition in board order and preventing one printed Discomfort unit. The UI does not currently let the human choose among multiple eligible Conditions.

### 4.10 Paraffin Wax Treatment

| Field | Value |
|---|---|
| ID | `paraffin-treatment` |
| Type | Care Action — Surface |
| Traits | Topical, Moisture |
| Supply cost | 2 |
| Purchase price | 120 Petals |
| Starter owned | No |

**Printed rule:** Reduce a Surface Condition by 5 Severity. If this removes the Condition, draw 1 card.

**Required resolution:** Select a Surface Condition and reduce it by 5, restoring Comfort equal to actual Severity removed. If the entire Condition stack is removed, draw one private card. Removing only one layer of a two-layer stack does not earn the draw. With no legal target, restore 1 Comfort and do not draw.

**Implementation status:** Implemented.

### 4.11 Podiatrist Consultation

| Field | Value |
|---|---|
| ID | `podiatrist-consultation` |
| Type | Supporter |
| Traits | Clinic, Search |
| Supply cost | 1 |
| Purchase price | 300 Petals |
| Starter owned | No |

**Printed rule:** Search your deck for an Equipment or Care Action, reveal it, and add it to your hand. Then shuffle your deck.

**Required resolution:** Open the shared search flow showing all Equipment and Care Action copies remaining in the owner's deck. The player may select one physical copy, reveal it publicly, move it to hand, and shuffle the remaining deck. The player may inspect the full deck, finish without a card, or cancel the entire play. On resolution the Supporter is discarded.

**Implementation status:** Implemented.

### 4.12 Pumice Stone

| Field | Value |
|---|---|
| ID | `pumice-stone` |
| Type | Care Action — Surface |
| Additional targets | Keratin |
| Traits | Exfoliation, Precision |
| Supply cost | 1 |
| Purchase price | 120 Petals |
| Starter owned | No |

**Printed rule:** Reduce a Surface or Keratin Condition by 3 Severity.

**Required resolution:** Select one Surface or Keratin Condition and reduce it by 3, restoring Comfort equal to actual Severity removed. With no legal target, restore 1 Comfort.

**Interactions:** Because it has Precision, it removes 1 additional Severity from The Spiking Corner, for up to 4 total.

**Implementation status:** Implemented.

### 4.13 Reflexology Session

| Field | Value |
|---|---|
| ID | `reflexology-session` |
| Type | Care Action — Structural |
| Traits | Kinetic, Draw |
| Supply cost | 1 base |
| Purchase price | 120 Petals |
| Starter owned | No |

**Printed rule:** Reduce a Structural Condition by 2 Severity, then draw 1 card. If this removes the Condition, draw 1 additional card.

**Required resolution:** Select a Structural Condition and reduce it by 2, restoring Comfort equal to actual Severity removed. Draw one private card. If the entire Condition stack is removed, draw a second private card. With no legal target, restore 1 Comfort and do not draw.

**Interactions:** Kinetic grants +1 reduction against Toe Cramp, for 3 total. The Static Stand adds 1 to its effective Supply cost.

**Implementation status:** Implemented.

### 4.14 Orthotic Shoe Inserts

| Field | Value |
|---|---|
| ID | `orthotic-inserts` |
| Type | Equipment |
| Traits | Orthopedic, Tools |
| Supply cost | 2 |
| Purchase price | 300 Petals |
| Starter owned | No |

**Printed rule:** When played, discard an active Shoe Attribute or Hazard.

**Required resolution:** Place Orthotic Shoe Inserts in one of the controller's Influence slots. Then inspect the opposing Influence slots for Shoe Attributes and Hazards. If one legal target exists, remove it automatically; if multiple exist, the player chooses one; if none exist, no opposing card is removed. The removed card enters its owner's discard pile. Canceling a multi-target removal rolls back the complete play, including the Inserts' placement and Supply cost.

**Clarification:** Orthotic Shoe Inserts remains in its own Equipment slot after its on-play removal resolves. Habits are not legal removal targets.

**Implementation status:** Implemented, including manual selection and rollback.

### 4.15 Fountain of Youth — debug only

| Field | Value |
|---|---|
| ID | `fountain-youth` |
| Type | Debug |
| Supply cost | 0 |

**Rule:** Set Comfort to its maximum and immediately award the match to the Archangels. Discard this card. It exists only to test match-ending flows and MUST be excluded from ordinary decks, ownership, rewards, and competitive play.

**Implementation status:** Implemented.

## 5. Callus cards

### 5.1 Mild Heel Fissures

| Field | Value |
|---|---|
| ID | `mild-fissures` |
| Type | Condition — Surface |
| Traits | Dryness, Heel, Friction |
| Entrance Severity | 4 |
| Discomfort | 1 per copy per Care Check |
| Starter owned | Yes |

**Printed text:** A dry, thickened heel edge beginning to split under repeated pressure.

**Required resolution:** No additional card-specific rule. It follows all general Condition rules. Its `Friction` trait makes it searchable by Baron von Blister and may satisfy effects that refer to a Friction card.

**Implementation status:** Implemented.

### 5.2 Friction Blister

| Field | Value |
|---|---|
| ID | `friction-blister` |
| Type | Condition — Surface |
| Traits | Friction, Blister |
| Entrance Severity | 3 |
| Discomfort | 1 per copy per Care Check |
| Starter owned | Yes |

**Printed rule:** Gains 1 Severity when paired with a friction card.

**Required resolution:** When this copy enters play, if another active card controlled by The Callus has the `Friction` trait, this layer enters with +1 Severity. This entrance bonus is evaluated once for that copy; it is not continuously recalculated. The entering Friction Blister should not count itself as “another” card.

**Interactions:** Baron von Blister can search for it by subtype or trait. Ignoring the Hotspot can add a separate +2 entrance Severity and immediate trigger. Hydrocolloid Bandage is intended to target its Blister trait.

**Implementation status:** **Not implemented.** The prototype currently applies only other explicit entrance modifiers and does not check a paired Friction card.

### 5.3 Webbing Itch

| Field | Value |
|---|---|
| ID | `webbing-itch` |
| Type | Condition — Microbial |
| Traits | Fungal, Moisture |
| Entrance Severity | 4 |
| Discomfort | 1 per copy per ordinary trigger |
| Starter owned | Yes |

**Printed rule:** Chronic Dampness makes this trigger twice. This effect does not stack.

**Required resolution:** During a Care Check, calculate Webbing Itch's ordinary stack Discomfort (`1 × copies`). If at least one Chronic Dampness is active, add that same amount once, causing two total triggers. Multiple Chronic Dampness cards do not create a third or later trigger.

**Interactions:** Playing Webbing Itch may also consume one unused Chronic Dampness entrance charge and enter with +2 Severity. The persistent double-trigger effect and the consumable entrance charge are separate parts of Chronic Dampness.

**Implementation status:** Implemented and regression-tested, including a two-copy Webbing Itch stack and duplicate non-stacking Dampness.

### 5.4 The Morning Dagger

| Field | Value |
|---|---|
| ID | `morning-dagger` |
| Type | Condition — Structural |
| Traits | Heel, First Step |
| Entrance Severity | 6 |
| Discomfort | 1 per copy per Care Check |
| Starter owned | Yes |

**Printed rule:** Deals 1 additional Discomfort the first time it triggers.

**Required resolution:** Each physical copy/layer tracks whether it has triggered. The first Care Check in which that copy contributes ordinary Discomfort, it contributes 1 additional Discomfort, then its first-trigger flag is consumed. A second copy has its own unused first-trigger bonus. Removing a layer also removes its associated flag.

**Implementation status:** **Not implemented.** The current engine applies only ordinary Discomfort and does not store per-layer first-trigger state.

### 5.5 Toe Cramp

| Field | Value |
|---|---|
| ID | `toe-cramp` |
| Type | Condition — Structural |
| Traits | Spasm, Toes |
| Entrance Severity | 3 |
| Discomfort | 1 per copy per Care Check |
| Starter owned | Yes |

**Printed rule:** Kinetic cards reduce 1 additional Severity from this Condition.

**Required resolution:** Whenever a Care Action with the `Kinetic` trait reduces this Condition, increase that action's reduction by 1 before layered reduction is calculated. Apply the bonus once per Care Action, not once per layer.

**Implementation status:** Implemented.

### 5.6 The Spiking Corner

| Field | Value |
|---|---|
| ID | `spiking-corner` |
| Type | Condition — Keratin |
| Traits | Nail, Pressure, Toe |
| Entrance Severity | 4 |
| Discomfort | 1 per copy per Care Check |
| Starter owned | Yes |

**Printed rule:** Precision Care Actions reduce 1 additional Severity from this Condition.

**Required resolution:** Whenever a Care Action with the `Precision` trait reduces this Condition, increase that action's reduction by 1. Apply the bonus once per Care Action.

**Interactions:** Proper Trimming and Pumice Stone each remove up to 4 from it.

**Implementation status:** Implemented.

### 5.7 Bunionette

| Field | Value |
|---|---|
| ID | `bunionette` |
| Type | Condition — Structural |
| Traits | Pressure, Toes |
| Entrance Severity | 4 |
| Discomfort | 1 per copy per Care Check |
| Purchase price | 120 Petals |
| Starter owned | No |

**Printed rule:** Enters with +1 Severity if a Shoe Attribute is in play.

**Required resolution:** When each Bunionette copy enters, if its controller has at least one Shoe Attribute in an Influence slot, that layer receives +1 entrance Severity. Multiple Shoe Attributes still grant only +1 from Bunionette's own rule.

**Interactions:** Aggressive Taper is a Shoe Attribute and separately gives Structural Conditions +1. With Aggressive Taper active, Bunionette enters at 6: base 4, +1 from its own rule, +1 from Aggressive Taper.

**Implementation status:** Implemented and regression-tested.

### 5.8 Aggressive Taper

| Field | Value |
|---|---|
| ID | `narrow-box` |
| Type | Shoe Attribute |
| Traits | Compression, Toe Box |
| Supply cost | 0 |
| Starter owned | Yes |

**Printed rule:** Surface and Structural Conditions enter with +1 Severity. This effect does not stack.

**Required resolution:** While at least one Aggressive Taper is in the controller's Influence slots, each newly played Surface or Structural Condition layer receives +1 entrance Severity. Multiple active copies provide only +1 total. Existing Conditions do not gain or lose Severity when Aggressive Taper enters or leaves play.

**Implementation status:** Implemented. The hand preview also displays the calculated boosted entrance Severity.

### 5.9 Chronic Dampness

| Field | Value |
|---|---|
| ID | `chronic-dampness` |
| Type | Habit |
| Traits | Moisture, Fungal |
| Supply cost | 0 |
| Starter owned | Yes |

**Printed rule:** Your next Microbial Condition enters with +2 Severity.

**Required resolution:** When played, place this Habit in an Influence slot and create one unused entrance charge. The next Microbial Condition copy its controller plays consumes one charge and gains +2 entrance Severity. Chronic Dampness remains in play after its entrance charge is spent.

While it remains active, it also causes Webbing Itch to trigger twice as defined on Webbing Itch. That double-trigger effect does not stack. A second Chronic Dampness creates a second entrance charge, but duplicate copies consume Influence space and do not multiply Webbing Itch beyond two triggers.

**Implementation status:** Implemented.

### 5.10 Commercial Hard Floors

| Field | Value |
|---|---|
| ID | `hard-floors` |
| Type | Hazard |
| Traits | Impact, Occupation |
| Supply cost | 0 |
| Starter owned | Yes |

**Printed rule:** Only if a Structural Condition is in play, deal 1 Discomfort during each Care Check. This effect does not stack.

**Required resolution:** This Hazard remains in an Influence slot. During every Care Check in which at least one Structural Condition is active, add exactly 1 total Discomfort. The number of Structural Conditions, their copies, and duplicate Commercial Hard Floors do not increase this bonus.

**Implementation status:** Implemented, persistent, non-stacking, and regression-tested over multiple rounds.

### 5.11 Ignoring the Hotspot

| Field | Value |
|---|---|
| ID | `ignoring-hotspot` |
| Type | Habit |
| Traits | Neglect, Friction |
| Supply cost | 0 |
| Purchase price | 300 Petals |
| Starter owned | No |

**Printed rule:** Your next Surface Condition enters with +2 Severity and immediately deals its Discomfort. Then discard this card.

**Required resolution:** Place this card in an Influence slot and create one unused charge. The next Surface Condition copy its controller plays consumes one charge, gains +2 entrance Severity, and immediately deals that card's printed Discomfort once. Then discard the consumed Ignoring the Hotspot from its Influence slot. The immediate trigger is in addition to later Care Checks.

**Interactions:** Entrance bonuses from Aggressive Taper and any other valid source are additive. A duplicate Ignoring the Hotspot may hold a separate charge, but only one charge is consumed by one entering Condition unless a future card explicitly changes that rule.

**Implementation status:** Implemented and regression-tested.

### 5.12 The Static Stand

| Field | Value |
|---|---|
| ID | `static-stand` |
| Type | Hazard |
| Traits | Stagnation, Pressure |
| Supply cost | 0 |
| Purchase price | 300 Petals |
| Starter owned | No |

**Printed rule:** Kinetic Care Actions cost 1 Supply while this card is active. This effect does not stack.

**Required resolution:** While at least one Static Stand is active, add 1 to the effective Supply cost of every opposing Archangel card that has the `Kinetic` trait. This changes 0-cost Kinetic cards to 1 and 1-cost Kinetic cards to 2. Multiple copies add only 1 total.

**Implementation status:** Implemented and regression-tested.

### 5.13 Haider

| Field | Value |
|---|---|
| ID | `haider` |
| Type | Supporter |
| Traits | Shoe, Search |
| Supply cost | 0 |
| Starter owned | Yes |

**Printed rule:** Search your deck for a Shoe Attribute, reveal it, and add it to your hand. Then shuffle your deck.

**Required resolution:** Open the shared search flow with every physical Shoe Attribute copy remaining in the owner's deck as a valid option. The player may select one, reveal it publicly, add it to hand, and shuffle; inspect All; finish without a card; or cancel the complete play. Haider is discarded when the search resolves.

**Implementation status:** Implemented, including manual selection and rollback.

### 5.14 Baron von Blister

| Field | Value |
|---|---|
| ID | `baron-blister` |
| Type | Supporter |
| Traits | Friction, Search |
| Supply cost | 0 |
| Purchase price | 300 Petals |
| Starter owned | No |

**Printed rule:** Search your deck for a Surface Condition or a card with the Friction trait, reveal it, and add it to your hand. Then shuffle your deck.

**Required resolution:** A valid search result is either (a) a Condition whose subtype is Surface, or (b) any card with the `Friction` trait. Select at most one physical copy, reveal it, add it to hand, and shuffle. The standard inspect-all, finish-without-card, and cancel rules apply. Discard Baron von Blister when the search resolves.

**Implementation status:** Implemented.

### 5.15 Eternity — debug only

| Field | Value |
|---|---|
| ID | `eternity` |
| Type | Debug |
| Supply cost | 0 |

**Rule:** Set Comfort to zero and immediately award the match to The Callus. Discard this card. It is development-only and MUST be excluded from ordinary decks, ownership, rewards, and competitive play.

**Implementation status:** Implemented.

## 6. Starter deck lists

### Everyday Comfort — Archangels (24)

| Card | Copies |
|---|---:|
| Basic Massage | 3 |
| Comfort Stretch | 3 |
| Heavy Heel Balm | 3 |
| Hydrocolloid Bandage | 3 |
| Targeted Cream | 3 |
| Proper Trimming | 3 |
| Everyday Care Kit | 2 |
| Dr. Honeyfoot | 2 |
| Fresh Breathable Socks | 2 |

### Pressure & Friction — The Callus (24)

| Card | Copies |
|---|---:|
| Mild Heel Fissures | 3 |
| Friction Blister | 3 |
| Webbing Itch | 3 |
| The Morning Dagger | 3 |
| Toe Cramp | 3 |
| Aggressive Taper | 3 |
| Chronic Dampness | 2 |
| Commercial Hard Floors | 2 |
| Haider | 2 |

The Spiking Corner is starter-owned but is not in the default Pressure & Friction list.

## 7. Compatibility map

| Condition subtype | Starter direct Care Actions | Expansion direct Care Actions |
|---|---|---|
| Surface | Heavy Heel Balm; Hydrocolloid Bandage is intended for Blister only | Paraffin Wax Treatment; Pumice Stone |
| Microbial | Targeted Cream | — |
| Structural | Basic Massage; Comfort Stretch | Reflexology Session |
| Keratin | Proper Trimming | Pumice Stone |

Dr. Honeyfoot can reduce any subtype by 2 but does not restore Comfort. A no-target Care Action always retains the general 1-Comfort fallback.

## 8. Cross-card interaction checklist

These combinations are important enough to deserve dedicated engine tests:

1. Aggressive Taper + Mild Heel Fissures: enters at 5 Severity.
2. Aggressive Taper + Bunionette: enters at 6 Severity because two distinct +1 effects apply.
3. Chronic Dampness + Webbing Itch: the next Itch enters at 6, and active Dampness later doubles its stack trigger.
4. Two Chronic Dampness + Webbing Itch: two entrance charges exist, but one Itch consumes only one; trigger count remains two, not three.
5. Ignoring the Hotspot + a Surface Condition: +2 entrance Severity, immediate printed Discomfort, then Hotspot discards itself.
6. Commercial Hard Floors + any Structural Condition: +1 total Discomfort each Care Check, regardless of duplicates.
7. The Static Stand + Basic Massage: effective Supply cost becomes 1.
8. Toe Cramp + Basic Massage: 3 Severity removed because of Kinetic.
9. The Spiking Corner + Proper Trimming or Pumice Stone: 4 Severity removed because of Precision.
10. Paraffin Wax Treatment removes the final layer: restore actual Severity removed and draw one.
11. Reflexology Session removes Toe Cramp: Kinetic bonus applies; draw one normally and a second for removing the full stack.
12. Orthotic Shoe Inserts against both Aggressive Taper and Commercial Hard Floors: human chooses one; cancel rolls back the whole play.
13. Baron von Blister can find Mild Heel Fissures by both Surface and Friction, and can find any future non-Condition Friction card by trait.
14. Hydrocolloid Bandage must not target a non-Blister Surface Condition in a corrected engine.
15. A two-layer Morning Dagger stack needs independent first-trigger state for each physical layer.

## 9. Implementation discrepancy register

| Card | Required rule | Present prototype behavior |
|---|---|---|
| Hydrocolloid Bandage | Target a Blister Condition and prevent its next trigger | Targets any Surface Condition; reduction works; prevention is absent |
| Friction Blister | +1 entrance Severity when another Friction card is active/paired | Pairing bonus is absent |
| The Morning Dagger | Each copy deals +1 on its first trigger | First-trigger bonus/state is absent |

These are known gaps, not permission to omit the rules in a new engine. Resolve them explicitly during reconstruction and keep tests next to the card resolver.

## 10. Recommended card-effect architecture for a rebuild

Avoid a single growing chain of card-ID conditionals. Define card behavior using declarative hooks plus small named effect handlers. A card definition might expose:

- `playRestrictions`
- `targetQuery`
- `onPlay`
- `onEnterCondition`
- `modifyCareReduction`
- `modifySupplyCost`
- `beforeCareCheck`
- `modifyConditionTrigger`
- `afterConditionRemoved`
- `onTurnStart`
- `searchQuery`
- `visibility`

Every effect should return an event list alongside the new state. The same events can drive History, animations, replay, tests, and WebSocket messages. This preserves rules clarity while preventing the UI from becoming the authority for game logic.

