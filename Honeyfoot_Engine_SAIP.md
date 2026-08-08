# Honeyfoot Cards Engine — Sequential Architectural Implementation Plan

## Document control

| Field | Value |
|---|---|
| Document | `Honeyfoot_Engine_SAIP.md` |
| Version | 1.0.0-experiment |
| Status | Approved for first clean-room reconstruction experiment |
| Date | 2026-08-05 |
| Architect / builder | Sol / Luna (or equivalent implementation agent) |
| Authorities | This SAIP, `CORE_MECHANICS.md`, `CARDS.md` |
| Method | CRCS `SAIP_PHILOSOPHY.md` and `SAIP_TEMPLATE.md` |
| Output | Deterministic, UI-independent Honeyfoot Cards engine |

This is both a build plan and an experiment. The builder will reconstruct the engine without copying the legacy implementation. Her decisions, reports, tests, and defects will then let us distinguish builder error, source ambiguity, SAIP ambiguity, legacy bugs, and intentional corrections.

## 1. Builder reading instruction

Read this file, `CORE_MECHANICS.md`, and `CARDS.md` completely before coding. Ordinary words such as **Condition**, **Habit**, **Influence**, **subtype**, **trait**, **draw**, and **search** have strict meanings.

Before Phase 1 create:

- `HONEYFOOT_ENGINE_DECISIONS.md` using section 15;
- `reports/honeyfoot-engine/ASSUMPTIONS.md`;
- `reports/honeyfoot-engine/PHASE_00.md`.

In Phase 0, restate every invariant and reproduce the type-to-zone matrix. Execute phases in order. Gates are blocking. Record meaningful choices before relying on them. Stop on ambiguity that changes observable rules. Never parse card prose to execute effects. Do not inspect/copy the legacy engine until Phase 12. Do not connect React, DOM, animation, storage, or networking during this plan.

## 2. Mission

### 2.1 Outcome

Build a pure engine that creates, validates, advances, serializes, replays, and safely projects Honeyfoot matches while implementing all documented mechanics and cards.

### 2.2 Purpose

React, Unity, simulations, tutorials, AI, and a future authoritative server should all request semantic commands from this same rules authority. Consumers decide presentation and intent; they do not reinterpret rules.

### 2.3 Definition of complete

- No UI/browser/storage/network imports.
- Same setup, seed, and commands produce the same states/events.
- Every card is canonical data plus explicit effect behavior; no prose interpreter.
- Types always use the correct zone and limits.
- Targets, cancellation, search, replacement, stacks, triggers, and privacy work as specified.
- Every invariant/golden scenario and card has automated evidence.
- Every `CARDS.md` interaction is tested.
- Viewer projections leak no hidden information.
- Save/restore preserves legal actions and future outcomes.
- Requirement-to-test matrix has no unexplained gaps.
- Decision ledger and phase reports are complete.

### 2.4 Non-goals

No board UI, animation, sound, art, economy, profiles, levels, campaign, shop, reward system, balance changes, undocumented cards/rules, sophisticated AI, WebSocket transport, authentication, or production-engine replacement.

## 3. Authority hierarchy

1. Later explicit user direction.
2. Non-negotiable invariants in this SAIP.
3. `CORE_MECHANICS.md` for general rules.
4. `CARDS.md` for card-specific specialization and explicit exceptions.
5. Golden scenarios here.
6. Approved decision-ledger entries.
7. Current card data where non-conflicting.
8. Legacy tests/code, Phase 12 only.
9. UI behavior, screenshots, labels, printed summaries.
10. Builder inference.

If core and card authorities genuinely conflict, stop with `SPEC-CONFLICT`; do not choose the easiest behavior. Dr. Honeyfoot's explicit no-Comfort behavior is a card exception, not a new general Care rule.

## 4. Required source material

### Required before Phase 1

This SAIP; all of `CORE_MECHANICS.md`; all of `CARDS.md`; CRCS philosophy/template.

### Required before later phases

Prior report, ledger, tests, and assumptions; before effects also read the card discrepancy register; before projections read section 19.

### Reference only

Legacy engine, opponent heuristics, React handlers, UI persistence, and legacy implementation tests are quarantined until Phase 12. They may then reveal undocumented dependencies, but never outrank specifications.

## 5. Canonical vocabulary

| Term/type | Exact meaning | Zone/lifetime | Limit family |
|---|---|---|---|
| Comfort | Shared score, normally 0–16 | Match | Immediate win checks |
| Discomfort | Amount subtracted from Comfort | Effect/event | Not “negative Comfort” |
| Severity | Care resistance stored per physical Condition layer | Layer | Eased by effects |
| Condition | Persistent Callus challenge with subtype, Severity, Discomfort | Condition zone | One played/Callus turn |
| Condition stack | One identity with 1–2 physical layers | 1 of 3 slots | Two copies maximum |
| Influence | Persistent non-Condition family | 1 of 3 Influence slots | Does not spend Condition play |
| Equipment | Influence type, commonly Archangel | Influence | Persistent |
| Environment | Influence type, commonly Archangel | Influence | Persistent |
| Shoe Attribute | Influence type, commonly Callus | Influence | Persistent |
| Habit | Influence type, commonly Callus | Influence | Persistent |
| Hazard | Influence type, commonly Callus | Influence | Persistent |
| Care Action | Transient Archangel action | Resolve → discard | Any number while legal |
| Supporter | Transient character action | Resolve → discard | No global one/turn rule |
| Debug | Development-only action | Resolve/terminal | No ordinary decks |
| Subtype | Surface, Microbial, Structural, Keratin compatibility axis | Definition | Not inferred |
| Trait | Keyword only where an effect names it | Definition | Not default compatibility |
| Ease | Reduce Severity; Care normally restores actual removed | Resolution | Not merely “play care” |
| Supply | Archangel play resource | Side state | Starts 3, +1/round, no max |
| Draw | Unknown top physical card → hand, privately | Movement | No shuffle |
| Search | Inspect matches, choose physical copy, reveal if stated, add, shuffle | Transaction | Finish/cancel supported |
| Reveal | Make identity public | Visibility event | Distinct from private draw |
| Pending decision | Serializable unresolved transaction | Match state | Blocks unrelated commands |
| Physical instance | Uniquely identified card copy | One exact location | Required for replay |

### 5.1 Closed type-to-zone matrix

| `type` | Family | Destination | Spends Condition play? | Persists? |
|---|---|---|---|---|
| Condition | Condition | Condition zone | Yes | Yes |
| Equipment | Influence | Influence zone | No | Yes |
| Environment | Influence | Influence zone | No | Yes |
| Shoe Attribute | Influence | Influence zone | No | Yes |
| Habit | Influence | Influence zone | No | Yes |
| Hazard | Influence | Influence zone | No | Yes |
| Care Action | Action | Discard after resolution | No | No |
| Supporter | Action | Discard after resolution | No | No |
| Debug | Action | Discard/terminal | No | No |

Unknown values never default to Condition. **Chronic Dampness is a Habit/Influence:** it may be played after a Condition in the same turn, uses an Influence slot, has no Severity, never occupies/stacks in the Condition zone.

Use semantic sides `archangel` and `callus`, never `you`, `opponent`, `top`, or `bottom`. Controller kind is an adapter concern.

## 6. Non-negotiable invariants

1. Standard match starts at Comfort 8/16.
2. Comfort 16 immediately wins for Archangels; 0 immediately wins for Callus.
3. Completed matches reject further match commands.
4. Active side may play any number of otherwise legal cards and must explicitly end turn.
5. Callus may play at most one Condition per turn.
6. Influence/Supporter plays do not consume Condition allowance.
7. Exactly 3 Influence slots per side; exactly 3 unique Condition identities.
8. A Condition stack has at most 2 physical layers.
9. Each layer stores entrance-modified Severity, instance ID, and first-trigger state.
10. Stack Severity and ordinary Discomfort are additive by layer unless explicitly modified.
11. Easing removes oldest layer first, carries excess, discards every exhausted physical copy.
12. Care with 0 compatible targets uses documented fallback, normally +1 Comfort.
13. Care with 1 compatible target auto-selects it.
14. Care with 2+ targets pauses; never silently chooses first.
15. Compatible Care restores Comfort equal to actual Severity removed, with no extra fallback point. Printed reduction is not automatically restored when less Severity remained.
16. Traits do not imply compatibility unless an effect expressly names them.
17. Dr. Honeyfoot targets any Condition, removes 2, restores no Comfort, privately draws 1.
18. Archangels start with 3 Supply, gain 1/new round, no max; Callus has no Supply.
19. Cancel/rejection leaves hand, Supply, zones, counters, RNG, and authoritative History unchanged.
20. Empty Influence slot auto-places; full zone requires replace choice or cancel.
21. Search selects a physical copy, obeys reveal rules, and shuffles only on resolution.
22. Ordinary draw is private; explicitly revealed search result is public.
23. Both sides draw 1 at new-round transition.
24. Empty deck is not loss: Archangel gets Basic Massage; Callus gets Commercial Hard Floors.
25. “Does not stack” applies once despite duplicate active sources.
26. Definitions are immutable; match changes live on instances/stacks/markers/state.
27. Randomness is injected, seeded, serializable, deterministic.
28. Engine emits structured semantic events; never parses display text.
29. Opponent/spectator projections hide hands, private draws, candidates, deck order, unrevealed IDs.
30. Save/restore preserves legal actions and next-command/RNG outcome.

## 7. System boundaries

### 7.1 In scope

Definitions/decks; physical instances; deterministic setup; state validation; legal queries/commands; Supply; zones; stacks; targeting; effects; triggers; Care Check; search/draw; win/concede; pending decisions; semantic events/projections; versioned serialization/replay; thin public adapter contract.

### 7.2 Outside boundary

DOM/React/Unity, animation/audio, storage I/O, user/economy/collection, tutorial prose, strategic AI, network transport.

### 7.3 Ownership of truth

Engine owns legality, mutation, RNG, choices, outcomes, and event visibility. Clients own display/input. A future server authenticates actors then asks engine legality.

### 7.4 Dependency rule

`UI/CLI/AI/server adapter → public engine commands/projections → pure rules/effects → immutable definitions`. Nothing points outward from engine.

## 8. Architecture overview

### 8.1 Components

Definitions/schema; physical instances; state model; pure queries; atomic command reducer; explicit effect registry; serializable decision subsystem; semantic event system; seeded RNG; persistence/replay; external adapters.

### 8.2 Public contracts

Semantically provide:

```js
createMatch(setup, options) -> { state, events }
getLegalActions(state, viewerOrSide) -> LegalAction[]
dispatch(state, command) -> { accepted, state, events, rejection?, pendingDecision? }
projectState(state, viewer) -> SafeProjection
serializeState(state) / deserializeState(serialized)
replay(initialState, commands) -> { state, events }
validateState(state) -> ValidationResult
```

Commands include `PLAY_CARD`, target/influence/search selections, `FINISH_SEARCH`, `CANCEL_DECISION`, `END_TURN`, `CONCEDE`; reference stable side/instance IDs.

### 8.3 State ownership

Definitions immutable. Each instance exists once. No components, callbacks, promises, timers, dates, DOM, unserializable classes, or hidden global state. Pending decisions contain declarative continuation/rollback context. RNG state is explicit.

### 8.4 Error model

Stable rejection codes: `MATCH_COMPLETE`, `NOT_ACTIVE_SIDE`, `PENDING_DECISION_EXISTS`, `NO_PENDING_DECISION`, `CARD_NOT_IN_HAND`, `WRONG_FACTION`, `UNKNOWN_CARD_TYPE`, `INSUFFICIENT_SUPPLY`, `CONDITION_ALREADY_PLAYED`, `CONDITION_ZONE_FULL`, `CONDITION_STACK_FULL`, `INFLUENCE_SELECTION_REQUIRED`, `INVALID_INFLUENCE_SLOT`, `TARGET_SELECTION_REQUIRED`, `INVALID_TARGET`, `INVALID_SEARCH_SELECTION`, `COMMAND_NOT_ALLOWED`, `INVALID_STATE`. Rejections preserve state byte-equivalently.

## 9. Construction sequence

| Phase | Layer | Gate |
|---:|---|---|
| 0 | Contract intake | Vocabulary/type quiz |
| 1 | Definitions/schema | All cards classify/validate |
| 2 | Instances/setup/RNG | Seeded reproducibility |
| 3 | Command transactions | Reject/cancel cannot mutate |
| 4 | Zones/stacks | Habit cannot become Condition |
| 5 | Care/targets/easing | Balm scenario passes |
| 6 | Lifecycle | Multi-round baseline |
| 7 | Generic effects | Hooks/search/prevention pass |
| 8 | All cards | 100% conformance matrix |
| 9 | Events/privacy | Adversarial leak tests |
| 10 | Persistence/replay | Equivalence tests |
| 11 | Consumer ports | Public API only |
| 12 | Legacy comparison | No unexplained discrepancy |

## 10. Phase instructions

Every phase must produce `reports/honeyfoot-engine/PHASE_NN.md` using section 22. “Forbidden” work is part of its gate.

### Phase 0 — Contract intake

**Objective / why now:** prove understanding before encoding mistakes.

**Prerequisites/inputs:** no reconstruction code; read all authorities.

**Permitted:** documentation, diagrams, inventories. **Forbidden:** engine code, legacy implementation inspection, intuitive semantic choices.

**Outputs/procedure:** initialize ledger/assumptions/report; restate invariants; reproduce closed matrix and lifecycle; list all cards/types and source conflicts. Explicitly answer:

- Fissures then Chronic Dampness same turn? **Yes**, if Influence slot available.
- Heavy Heel Balm on Mild Heel Fissures at Severity 4, Comfort 8, Supply 3? **Supply 2, Severity 1, Comfort 11, Heavy Heel Balm discarded.**

**Evidence/checkpoint:** reviewer quizzes five cards for family/zone/persistence/limit. Human approves matrix and answers.

**Gate/pitfalls/repair:** pass only with correct Dampness/Balm reasoning and no concealed conflicts. If failed, reread/restate—never plan name-based patches.

**Handoff:** approved vocabulary/card inventory.

### Phase 1 — Closed definitions

**Objective / why now:** make invalid classification rejected before state exists.

**Inputs:** full cards reference and Phase 0 inventory. **Permitted:** JS ESM data, JSDoc, runtime validators. **Forbidden:** reducer/UI/prose execution/unknown defaults.

**Outputs/procedure:** create `src/honeyfoot-engine/`; closed enums for faction/type/subtype/trait/zone/visibility; immutable schema; all 30 documented cards; exact 24-card starters. Only Conditions may have entrance Severity/ordinary Discomfort. Generate definition report.

**Tests/checkpoint:** every ID once; exact documented type; Dampness Habit; Heavy Heel Balm accepts Surface targets; Pumice Surface+Keratin; Dr Supporter; starters exactly 24/no debug; unknown values fail; definitions cannot mutate. Human line-compares report to `CARDS.md`.

**Gate/pitfalls/repair:** zero unresolved rows. Never use arbitrary strings, trait-as-subtype, or omit unowned/debug cards. Repair schema/data, not placement exceptions.

### Phase 2 — Deterministic state/setup

**Objective:** create serializable MatchState, physical IDs, seeded RNG, setup, invariant validator.

**Why/prerequisites:** atomic rules need stable identity; Phase 1 passed.

**Permitted:** pure setup/selectors/RNG. **Forbidden:** plays, `Math.random`, time IDs, UI-relative sides.

**Procedure/outputs:** version state; deterministic instance allocation/shuffle; instantiate decks; draw 5 each; Comfort 8/16, Supply 3, round 1, empty zones/no result; each instance exactly once; explicit RNG state.

**Tests/checkpoint:** same seed byte-equivalent; different seed preserves contents; 5 hands/19 decks; distinct duplicate IDs; corrupt duplicate-zone/unknown IDs fail; JSON-safe snapshot contains no UI/timer/function.

**Gate:** 100 seeded setups reproducible. Repair ambient/global/order nondeterminism before proceeding.

### Phase 3 — Atomic command kernel

**Objective:** pure reducer, rejection union, serializable pause/resume/cancel transaction.

**Why:** choices must not partly consume resources. **Prerequisite:** Phase 2.

**Permitted:** command envelopes/preflight/events. **Forbidden:** scattered card branches, input mutation, UI callbacks.

**Procedure/outputs:** validate state/match/actor/pending/instance; no-op rejection; synthetic decision; valid/invalid/cancel handling; events only for committed actions.

**Tests/checkpoint:** every rejection; wrong/stale/repeated selections; unrelated commands blocked during decision; reject/cancel preserve serialized state and RNG; confirm once. Inspect pending JSON: no closure required.

**Gate:** all atomicity adversaries pass. Repair centrally, never per-card refunds.

### Phase 4 — Type-driven zones and stacks

**Objective:** generic placement by closed matrix; Condition limits/layers; Influence replacement.

**Permitted:** type/faction/cost legality, zones. **Forbidden:** name/trait routing, effects beyond entrance hooks, silent replacement.

**Procedure/outputs:** transient vs persistent routing; unique Condition placement; second identical layer; reject third/fourth unique/second Condition same turn; every Influence type through one family rule; stable first empty slot; full zone pause/replace/cancel; Supporter/Care discard route.

**Tests/checkpoint:** Fissures then Dampness succeeds in distinct zones; second Condition rejects; 2-copy stack/3 unique maxima; distinct layers; every Influence type does not set Condition flag; empty auto/full choice/cancel; unknown type rejects. Inspect snapshot proving Dampness is never semantically Condition.

**Gate:** all topology tests, no individual-card placement branches. Repair type routing, not Dampness special-case.

### Phase 5 — Care compatibility and easing

**Objective:** target query, layered Severity removal, actual removal → Comfort, non-Care policy.

**Why:** central game loop and observed rebuild failure. **Prerequisite:** stable stacks.

**Forbidden:** trait/color/title/prose compatibility; silent first target; printed rather than actual removal; Supporter inheriting Care conversion.

**Procedure/outputs:** query only active Conditions by accepted subtype; zero → fallback; one → auto; many → pending before commit; oldest-first carry/discard; return attempted/actual/removed IDs; Care restores actual; Supporter explicit; terminal check immediately.

**Tests/checkpoint:** Heavy Heel Balm/Mild Heel Fissures 4→1 and 8→11; Severity 2 restores 2; no Surface restores 1; cannot choose fallback when target exists; two Surface pause/choose/cancel; Targeted Cream cannot target Surface; Pumice accepts Surface/Keratin; `[4,4]` reduced 5 leaves second at 3 and restores 5; overkill restores 8; Dr removes 2/restores 0. Assert state and events, not a status sentence.

**Gate:** full subtype target matrix passes. Debug definition → query → decision → removal → Comfort → events.

### Phase 6 — Lifecycle

**Objective:** turns, Care Check, transition, draws/Supply/fallback, terminal/concede.

**Procedure:** first side End Turn activates second without check; second End Turn begins check; compute per-layer ordinary Discomfort; hook modifiers/prevention; subtract/check terminal; if active increment round/reset temporary flags/draw both/add 1 Archangel Supply; fixed deterministic draw order; empty-deck faction fallback; concede immediate.

**Forbidden:** UI delay, AI strategy, automatic End Turn.

**Tests/checkpoint:** unlimited legal plays before explicit end; no premature check; 1/2 layers deal 1/2; both draw; Supply +1; Condition allowance resets/persistent zones remain; terminal blocks transition; correct fallbacks/no deck loss; post-terminal rejects. Review ordered semantic round events.

**Gate:** scripted 5-round match repeats identically.

### Phase 7 — Generic effect mechanisms

**Objective:** pure registry/hooks for entrance/cost/reduction/trigger/start-round/leave-play; charges, non-stack groups, prevention, search.

**Why:** prevent card-switch spaghetti. **Forbidden:** prose parsing, monolithic title switch, public candidates, happy-path-only cancellation.

**Procedure/outputs:** deterministic hook order; modifiers grouped by non-stack key; source-owned charges; target/expiry prevention; private draws/public reveals; search transaction with valid/all, physical choose, finish, reveal, add, shuffle, cancel restoring RNG/source.

**Tests/checkpoint:** duplicate non-stack once; stackable sources independently; charge once; prevention matching only; correct physical candidates; all view no mutation; finish semantics; cancel exact; draw private/reveal public; no-candidate safe. Inspect registry: lifecycle names hooks, not all titles.

**Gate:** synthetic effect tests pass before real complex handlers.

### Phase 8 — Card waves

**Objective:** all `CARDS.md` behavior and known intended omissions. Output `CARD_CONFORMANCE.md` mapping each card to direct/interaction tests.

**Wave A:** Basic Massage, Stretch, Balm, Cream, Trimming, Pumice, Fissures, Bunionette base, debug wins. Gate subtype/Supply/fallback/basic Conditions.

**Wave B:** Toe Kinetic bonus; Spiking Precision bonus; Taper entrance/non-stack; Bunionette + Shoe and + Taper; Dampness charge; Webbing double/non-stack; Friction Blister friction entrance; Morning Dagger first trigger per layer; Hard Floors structural bonus/non-stack; Static Stand tax/non-stack; Ignoring Hotspot charge. Gate every `CARDS.md` cross-interaction and duplicate source.

**Wave C:** Care Kit subsequent-turn Supply/copies stack; Socks prevention; Hydrocolloid **Blister-only + next-trigger prevention**; Dr target/no Comfort/private draw; Paraffin conditional draw; Reflexology conditional draws; Consultation/Haider/Baron search; Orthotic opposing Shoe/Hazard removal with multi-target pause.

**Wave D audit:** every card direct test; every checklist row; prove discrepancy corrections: Hydrocolloid, Friction Blister, Morning Dagger. No legacy omission copied.

**Forbidden:** balance/text changes, skipped unowned/debug cards, UI decisions, handler-driven architecture.

**Required evidence/gate:** all 30 cards direct-tested; physical movements; each non-stack duplicated; draw/search visibility; partial/exact/overkill/no-target paths; auto-one/choose-many/invalid/cancel; zero unexplained partial rows. Human compares matrix to prose.

### Phase 9 — Events and privacy

**Objective:** versioned semantic events and authority/Archangel/Callus/spectator projections.

**Procedure:** inventory mutations; events carry IDs, round/turn, actor, source, targets, amounts, movement, visibility; separate play/removal/Comfort/discard/draw/reveal/search/shuffle/prevention/replacement/check/end; filter payload fields, not merely text; History groups without losing facts; adversarial search for hidden names/IDs/order.

**Tests:** Dr draw identity only owner/authority; revealed searches public; candidates/order private; hand count not identities; public discard/in-play; every golden mutation evented; Balm History includes target, attempted/actual, remaining, Comfort, movement, cost.

**Gate/checkpoint:** compare four JSON views of same mid-search state; consumers need no authoritative state. Repair projection centrally.

### Phase 10 — Serialization/replay

**Objective:** version 1 JSON state, validation, migration registry, deterministic command replay.

**Forbidden:** storage I/O, functions/UI state, silent corrupt/future version acceptance.

**Procedure/tests:** freeze fields; round-trip setup, mid-turn, target, search, replacement, multilayer, terminal; legal actions/next RNG command same; replay equivalent; malformed/duplicate/unknown/version reject; pending decision resumes without closure; 100 seeded scripted matches.

**Gate:** exact equivalence. Preserve layer markers, charges, IDs, RNG, pending context.

### Phase 11 — Consumer ports

**Objective:** prove CLI/script/random-legal AI can use only public API.

**Forbidden:** AI mutation path, internal imports, authoritative secrets for strategy, balance changes.

**Procedure/tests:** query legal actions; submit commands only; both faction-control directions; 1,000 seeded matches complete or declared cap without invalid state; adapters use public entry only; all mutation via dispatch. Record stats, do not rebalance.

**Gate:** useful without React or privileged internals.

### Phase 12 — Comparative audit

**Objective:** compare frozen independent build with legacy and attribute every difference.

**Permitted:** now inspect legacy code/tests; black-box differentials; feature-flag adapter. **Forbidden:** treating old code as oracle, silent matching, production replacement.

**Procedure/outputs:** freeze commit; final suite; inspect legacy; compare shared scenarios; cite highest authority; inspect causative ledger entry; classify `BUILDER-DEVIATION`, `SAIP-AMBIGUITY`, `SOURCE-AMBIGUITY`, `LEGACY-BUG`, `INTENTIONAL-CORRECTION`, `ADAPTER-MISMATCH`; propose repair/spec/SAIP revision; integration only after approval. Produce `FINAL_AUDIT.md`, traceability, differential, attribution, rollback recommendation.

**Required adversaries:** Chronic Dampness zone/play allowance; Balm actually reducing Fissures and restoring actual removal; all golden/legacy acceptance/random overlapping commands.

**Gate/checkpoint:** architect/user inspect attribution and decision chains; no unexplained discrepancy. Do not conclude model incapability when an earlier gate/source/SAIP explains failure.

## 11. Cross-phase conformance matrix

| Requirement | Introduced | First proved | Reproved |
|---|---:|---:|---:|
| Closed type/zone | 0 | 1 | 4, 8, 12 |
| Determinism/instances | 2 | 2 | 10, 11 |
| Atomic cancellation | 3 | 3 | 4, 5, 7, 8 |
| Condition/Influence limits | 4 | 4 | 6, 8 |
| Compatibility/targeting | 5 | 5 | 8, 12 |
| Severity → Comfort | 5 | 5 | 8, 12 |
| Lifecycle/resources | 6 | 6 | 8, 10 |
| Effect subsystems | 7 | 7 | 8, 9 |
| All cards | 8 | 8 | 12 |
| Privacy | 9 | 9 | 10, 11 |
| Persistence/replay | 10 | 10 | 11, 12 |
| UI independence | 7 | 7 | 11, 12 |

## 12. Golden scenarios

All run through public commands and assert state **and** events.

1. **G01 Setup:** same seed yields same IDs/order/events; 8/16, Supply 3, 5-card hands, 19-card decks.
2. **G02 Type separation:** play Fissures then Dampness same turn; Condition + Influence; another Condition rejects.
3. **G03 Heavy Heel Balm:** 8 Comfort/3 Supply/Mild Heel Fissures 4 → 11 Comfort/2 Supply/Mild Heel Fissures 1/Heavy Heel Balm discard.
4. **G04 Multi-target:** two Surface targets pause with exactly both IDs; invalid reject; select affects one; cancel exact.
5. **G05 Fallback:** no Surface target; Balm yields exactly +1.
6. **G06 Dr:** Severity 4→2, Comfort unchanged, one private draw.
7. **G07 Layers:** Taper makes two Fissures layers `[5,5]`; reduce 6 discards first/leaves 4/restores 6.
8. **G08 Dampness/Webbing:** +2 entrance charge; double trigger; duplicate Dampness never exceeds twice.
9. **G09 Influence replacement:** full zone pauses; cancel exact; choose slot discards exact old instance.
10. **G10 Search:** Haider shows 3 physical Tapers; all view private; select reveals/adds/shuffles; cancel preserves deck/RNG/source.
11. **G11 Hydrocolloid:** Blister valid, Fissures invalid despite Surface; reduces and prevents next trigger once.
12. **G12 Morning Dagger:** each physical layer receives first-trigger bonus once; serialization preserves markers.
13. **G13 Empty deck:** faction fallback, unique deterministic ID, no deck-out.
14. **G14 Privacy:** Dr draw X owner-only; Haider revealed Y public.
15. **G15 Replay:** serialize mid-target, restore/select; equals uninterrupted; command replay equivalent.
16. **G16 Terminal:** fallback Care at 15 wins immediately; Discomfort at 1 wins Callus; no later transition.
17. **G17 Orthotic:** one Shoe/Hazard auto; many pause; Habit invalid; cancel exact.
18. **G18 Classification adversary:** every Influence type routes Influence; malformed Dampness Severity fails schema.

## 13. Stop and escalation conditions

Stop for equal-authority conflict; two plausible observable outcomes; missing timing/target/visibility; unplanned hook; invariant change; later discovery of earlier-gate failure; unexplained nondeterminism; UI/legacy dependency; privacy leak; production replacement; or “probably intended” reasoning.

Record `SPEC-CONFLICT-NNN`, `SAIP-GAP-NNN`, `DECISION-NEEDED-NNN`, or `LEGACY-DIFF-NNN` with reproduction, citations, options, consequences, reversible recommendation, and safe remaining work.

## 14. Repair and regression protocol

Freeze seed/state/command/events; add failing test; classify earliest layer (source, definition, state, legality, generic resolution, lifecycle, handler, projection, serialization, adapter); inspect decision chain; repair earliest layer; rerun phase plus all prior/golden/affected suites; record whether SAIP should have prevented/detected sooner. Never weaken an assertion to match code.

For Dampness, repair type data/routing—not a name patch. For Balm, debug definition subtype → target query → decision → removal → Comfort → events.

## 15. Decision ledger

### Entry template

```markdown
#### DEC-NNN — Title
- Date / phase / status:
- Trigger and authorities:
- Decision:
- Alternatives and why chosen:
- Invariants affected:
- Observable behavior: None | describe
- Reversibility:
- Tests/evidence/follow-up:
```

Observable changes require authority/user approval.

### Initial entries

- **DEC-001 JS ESM:** repository-native modern JS, runtime boundary validation, framework-free; future C# port follows semantic contract.
- **DEC-002 Physical IDs:** stable match-local instance IDs, never array indexes.
- **DEC-003 Registry:** explicit handlers/hooks keyed by stable IDs; no prose interpreter.
- **DEC-004 Intended gaps:** implement Hydrocolloid prevention/Blister-only, Friction Blister bonus, Morning Dagger first-trigger despite legacy omissions.
- **DEC-005 Serializable transactions:** pending choices are data, atomic, cancelable; no callbacks/partial commits.

## 16. Assumption register

| ID | Assumption | Validation/expiry |
|---|---|---|
| ASM-001 | New build stays isolated in `src/honeyfoot-engine/`, not `src/game/`. | Integration SAIP only. |
| ASM-002 | Existing JS toolchain can host tests. | Validate Phase 1. |
| ASM-003 | Documented single-player round cadence is first adapter target. | Multiplayer redesign requires approval. |
| ASM-004 | Auto Influence uses lowest empty stable index. | Revise only if source contradicts. |
| ASM-005 | Correct bounded execution, not arbitrary speed, is initial budget. | Measure Phase 11. |

Assumptions may not decide balance, target eligibility, visibility, timing, or cancellation.

## 17. Risk register

| Risk | Impact | Control/evidence |
|---|---:|---|
| Type-family collapse | Critical | Phase 0/1/4; G02/G18 |
| Care silently misses target | Critical | Phase 5; G03/G04 |
| Partial mutation before choice | High | Phase 3 cancel equivalence |
| Stack loses physical layers | High | IDs/layers; G07/G12 |
| Card-switch spaghetti | High | Phase 7 registry inspection |
| Hidden data leak | Critical | Phase 9; G14 |
| Legacy bug copied | High | Authority order/DEC-004/Phase 12 |
| Test overfitting | High | matrices/random simulations |
| SAIP too large/misread | High | Phase 0 restatement and narrow gates |
| UI enters engine | High | dependency audits Phase 2/11 |

## 18. Visual validation protocol

None: this is engine-only. Screenshots/DOM are insufficient. Manual gates inspect classification tables, state JSON, decisions, events, projections, and traceability. Human approval occurs at Phase 0 contract, Phase 8 card matrix, Phase 12 attribution/integration. React/Unity need separate visual SAIPs with screenshot/human review.

## 19. Security, privacy, and information boundaries

Authority may know all. Actor sees own hand and permitted private deck/search view. Opponent sees counts, not hidden identities/order. Discard, play, Conditions, public counters, revealed results are public. Ordinary draw identity and candidates/all-deck view are owner-private. Hidden instance IDs must not enable tracking. Future server authenticates actor rather than trusting client side. Invalid commands reveal nothing extra. Diagnostic logs use projections, never authoritative dumps.

## 20. Persistence, migration, and compatibility

Snapshot declares engine/catalog/RNG versions. Definition IDs, not titles, are stable keys. Physical IDs, layer flags, charges, and decisions survive load. Deserialize validates. Unknown versions fail. Migrations are pure/tested. Replays identify rules version. Rule-changing catalog updates require saved-match analysis.

## 21. Performance and scale budgets

Dispatch performs no I/O/timers/rendering. Rules are bounded by current zones/decks, no unbounded retries. Run 1,000 seeded legal matches without corruption or abandoned-decision growth; record time/size in Phase 11. No optimization may weaken determinism, validation, privacy, or atomicity.

## 22. Builder phase report template

```markdown
# Phase NN completion report — Name
## Outcome
## Inputs/authorities
## Files changed
## Procedure mapping
## Exact tests/evidence
## Invariant audit
## Decisions relied on/created
## Assumptions/open questions
## SAIP deviations
## Defects/root layer/regressions
## Gate: PASS | FAIL
## Handoff
```

## 23. Final verification

From clean environment run every phase suite/golden scenario. Generate card type inventory, conformance, traceability, discrepancy attribution, dependency audit, projection samples, replay samples, simulation metrics. Confirm 30 direct card tests, exact 24-card starters, no unknown-type default, Influence-after-Condition, Care changes target and Comfort, all choice/cancel paths, no UI imports, all known intended gaps, complete ledger, and no unapproved production replacement.

Final status: `READY_FOR_COMPARATIVE_REVIEW`, `BLOCKED_BY_SPECIFICATION`, `RECONSTRUCTION_FAILED` with evidence, or—only after user approval—`APPROVED_FOR_INTEGRATION`.

## 24. Handoff and future extension

### Stable foundations

Vocabulary/schema, deterministic instances/state, atomic commands/decisions, generic hooks, versioned events/projections/snapshots/replay, card conformance.

### Approved extension points

New tested cards; external deterministic AI; React/Unity/CLI/server adapters; tutorial command constraints; multiplayer transport around authority; migrations.

### Known limitations

Current documented cadence, not multiplayer redesign; no strategic AI/economy/visual pacing; future hooks need ledger review.

### Recommended next SAIPs

Engine integration; React UI; multiplayer/server authority; optional Unity UI.

## 25. Revision history

| Version | Date | Change/reason |
|---|---|---|
| 1.0.0-experiment | 2026-08-05 | Initial Honeyfoot clean-room engine SAIP for Luna reconstruction and SAIP-effectiveness analysis. |
