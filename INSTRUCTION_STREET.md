# Honeyfoot Cards Engine — Instruction Street

## Document control

| Field | Value |
|---|---|
| Document | `INSTRUCTION_STREET.md` |
| Version | `1.0.0-experiment` |
| Governing plan | `Honeyfoot_Engine_SAIP.md` |
| Authorities | `Honeyfoot_Engine_SAIP.md`, `CORE_MECHANICS.md`, `CARDS.md` |
| Builder | Diligent implementation model or human |
| Output | Deterministic, UI-independent Honeyfoot Cards engine |

This street translates the Honeyfoot engine SAIP into small, paired units of
work. It does not replace the SAIP. If this file and the SAIP disagree, stop
and follow the SAIP's authority and escalation rules.

## Starting package and clean-room meaning

This street is designed to let a builder construct the new engine from scratch
inside `src/honeyfoot-engine/`; it is not designed to repair or gradually
refactor the legacy engine.

Before Street 01, the builder must have:

1. A clean checkout of `jamangi/Honeyfoot_apps` with its existing package file.
2. `Honeyfoot_Engine_SAIP.md`, which supplies architecture, invariants, phase
   gates, golden scenarios, and escalation rules.
3. `CORE_MECHANICS.md`, which supplies canonical turn, zone, timing, targeting,
   and outcome rules.
4. `CARDS.md`, which supplies the canonical card catalog and card-specific
   resolution requirements.
5. A supported Node.js/npm runtime capable of running the repository scripts.

`CARDS.md` is therefore necessary but not sufficient by itself. The SAIP and
`CORE_MECHANICS.md` are equally required authorities. The existing
`src/game/` implementation is deliberately *not* a starting resource: the
builder may inspect it only at Street 61, after the clean-room engine and its
tests already exist. That late comparison can reveal missing conformance cases,
but legacy behavior cannot silently redefine the new engine.

The street has two lanes:

- **Lane A — Instruction:** perform one bounded change.
- **Lane B — Verification:** prove that exact change before continuing.

Never execute two Lane A sections before completing the first section's Lane B.

## Street operating rules

1. Read `Honeyfoot_Engine_SAIP.md`, `CORE_MECHANICS.md`, and `CARDS.md`
   completely before Street 01.
2. Do not inspect or copy `src/game/`, its tests, or legacy engine behavior
   before Street 61.
3. Work only in `src/honeyfoot-engine/`, `reports/honeyfoot-engine/`, the
   named engine documentation files, and `package.json` unless a street section
   explicitly permits another path.
4. Do not add React, DOM, browser, animation, networking, storage I/O, or UI
   imports to the engine.
5. Do not continue after a failed verification. Repair the current street
   section and rerun its verification.
6. Do not reinterpret an observable rule. Record a stop report when authorities
   conflict or the result has two plausible interpretations.
7. Do not weaken a test to make incorrect code pass.
8. Keep authored source readable: one logical statement per line, named helper
   functions, domain vocabulary in identifiers, and no minified source.
9. After every street section, append its result and resource use to
   `reports/honeyfoot-engine/STREET_LOG.md`.
10. Commit only at the named checkpoint streets or when the owner instructs it.

## Standard street log entry

```markdown
### Street NN — title
- Result: PASS | REPAIR | ESCALATE
- Started / finished:
- Files changed:
- Verification command:
- Verification result:
- Model and effort setting, if known:
- Tokens/credits/tool calls, if available:
- Repair attempts:
- Decisions or assumptions created:
- Notes for a human reader:
```

## Stop report

When a section says **STOP**, create one file under
`reports/honeyfoot-engine/stops/` named for the stop code. Include the exact
reproduction, cited authorities, plausible options, consequences, and smallest
decision needed. Do not guess.

Valid prefixes are `SPEC-CONFLICT`, `SAIP-GAP`, `DECISION-NEEDED`, and
`LEGACY-DIFF`.

==========================================================================
## Street 01 — Freeze the starting condition

### Lane A — Instruction

Confirm the current branch and worktree. Record the starting commit in
`reports/honeyfoot-engine/STREET_LOG.md`. Do not modify engine code.

### Lane B — Verification

Run `git status --short` and `git rev-parse HEAD`.

**PASS:** the starting revision is recorded and all pre-existing changes are
identified as owned or out of scope. **REPAIR:** resolve scope before continuing.

==========================================================================
## Street 02 — Install the engine test command

### Lane A — Instruction

Add `"test:engine": "node --test src/honeyfoot-engine/tests"` to the existing
`scripts` object in `package.json`. Change nothing else in the package file.

### Lane B — Verification

Run `npm run test:engine`.

**PASS:** Node starts the test runner; zero tests or a missing test directory is
acceptable only at this street. **REPAIR:** correct only the script or create
the empty test directory marker. Do not add dependencies.

==========================================================================
## Street 03 — Create the experiment records

### Lane A — Instruction

Create:

- `HONEYFOOT_ENGINE_DECISIONS.md` using SAIP section 15;
- `reports/honeyfoot-engine/ASSUMPTIONS.md`;
- `reports/honeyfoot-engine/PHASE_00.md` using SAIP section 22;
- `reports/honeyfoot-engine/STREET_LOG.md`;
- `reports/honeyfoot-engine/EXPERIMENT_METRICS.md`.

In the metrics file record the starting revision, builder/model, start time,
available credit or token counters, and the experiment questions from the user.

### Lane B — Verification

Open each file and check that every required heading exists.

**PASS:** all five artifacts exist and contain no invented product decisions.

==========================================================================
## Street 04 — Restate the contract

### Lane A — Instruction

In `PHASE_00.md`, restate all 30 non-negotiable invariants in your own words.
Then reproduce the closed type-to-zone matrix without copying it mechanically.

### Lane B — Verification

Compare the restatement line by line with SAIP sections 5 and 6.

**PASS:** there are exactly 30 invariant rows; every type has the correct family,
zone, persistence, and Condition-play behavior. **STOP:** any unresolved meaning
becomes `SAIP-GAP-001` or `SPEC-CONFLICT-001`.

==========================================================================
## Street 05 — Prove the two adversarial interpretations

### Lane A — Instruction

Answer these in `PHASE_00.md` with state before and after:

1. Can Callus play Mild Heel Fissures and Chronic Dampness in one turn?
2. What exactly happens when Heavy Heel Balm is played on Mild Heel Fissures
   at Severity 4, Comfort 8, Supply 3?

### Lane B — Verification

**PASS:** answer 1 is yes when an Influence slot is available; Dampness is a
Habit/Influence. Answer 2 ends at Supply 2, Severity 1, Comfort 11, with Balm in
discard. **REPAIR:** reread authorities. Do not add a name-based exception.

==========================================================================
## Street 06 — Inventory every card

### Lane A — Instruction

Create `reports/honeyfoot-engine/CARD_INVENTORY.md`. Give every documented card
one row containing stable ID, faction, exact type, subtype if applicable,
traits, starter count, zone family, persistence, and named effect mechanisms.

### Lane B — Verification

Compare every row manually with `CARDS.md`.

**PASS:** all 30 cards appear once; the two starter decks contain exactly 24
cards each; Debug cards are not starters; Chronic Dampness is Habit.

==========================================================================
## Street 07 — Seal Phase 0

### Lane A — Instruction

Complete `PHASE_00.md`. Record assumptions and decisions. Mark the phase gate
PASS only if Streets 04–06 passed.

### Lane B — Verification

Ask a human reviewer five random card classification questions or, if no human
is available, sample five rows and re-check all source citations.

**PASS:** no classification error and no hidden conflict. Commit checkpoint is
permitted here.

==========================================================================
## Street 08 — Create closed vocabulary constants

### Lane A — Instruction

Create `src/honeyfoot-engine/vocabulary.js`. Export frozen closed values for
faction, card type, subtype, trait, zone, visibility, side, and result status.
Use `archangel` and `callus`; never `you`, `opponent`, `top`, or `bottom`.

### Lane B — Verification

Create `tests/vocabulary.test.js`. Test every required value and prove unknown
values are absent.

**PASS:** `npm run test:engine` passes and the file imports no UI modules.

==========================================================================
## Street 09 — Define immutable card schemas

### Lane A — Instruction

Create `schema.js` with runtime validation for card definitions. Enforce fields
by type. Only Conditions may define entrance Severity and ordinary Discomfort.
Unknown types and subtypes must reject.

### Lane B — Verification

Test one valid specimen per type and malformed specimens for unknown type,
unknown subtype, missing ID, duplicate ID input, and Severity on a Habit.

**PASS:** every malformed specimen rejects with a stable reason.

==========================================================================
## Street 10 — Enter canonical card definitions

### Lane A — Instruction

Create `definitions.js`. Enter all cards as data from `CARDS.md`. Do not parse
printed rules and do not implement effects yet. Freeze exported definitions.

### Lane B — Verification

Generate `reports/honeyfoot-engine/DEFINITION_REPORT.md` from the definitions.
Test: 30 unique IDs, exact types, Dampness Habit, Balm Surface compatibility,
Pumice Surface+Keratin, Dr Supporter, no starter Debug cards.

**PASS:** report matches `CARD_INVENTORY.md` with zero unexplained differences.

==========================================================================
## Street 11 — Define exact starter decks

### Lane A — Instruction

Create `starter-decks.js` containing definition IDs and counts only. Do not
create instances or shuffle.

### Lane B — Verification

Test each faction deck has exactly 24 cards and exact documented multiplicity.

**PASS:** deck contents equal the inventory; no unknown IDs.

==========================================================================
## Street 12 — Seal Phase 1

### Lane A — Instruction

Create `reports/honeyfoot-engine/PHASE_01.md` and a requirement-to-test table for
definitions.

### Lane B — Verification

Run `npm run test:engine` twice and compare results.

**PASS:** all Phase 1 tests pass twice; no reducer, state mutation, or UI exists.

==========================================================================
## Street 13 — Implement seeded RNG

### Lane A — Instruction

Create `rng.js` with explicit serializable RNG state. It must support the exact
bounded integer and shuffle operations needed by setup and search.

### Lane B — Verification

Test identical seed sequences, different-seed divergence, serialize/restore
continuation, and bounds.

**PASS:** restored RNG produces the same next values as uninterrupted RNG.

==========================================================================
## Street 14 — Allocate deterministic physical instances

### Lane A — Instruction

Create `instances.js`. Expand starter counts into unique, stable, match-local
physical IDs without time, globals, or random UUID APIs.

### Lane B — Verification

Test duplicate definitions receive distinct IDs, same seed/setup gives the
same IDs, and every instance starts in exactly one location.

**PASS:** byte-equivalent instance arrays for identical input.

==========================================================================
## Street 15 — Create MatchState setup

### Lane A — Instruction

Create `state.js` and `create-match.js`. Setup must produce Comfort 8/16,
Archangel Supply 3, round 1, Archangel active first, five-card hands, 19-card
decks, empty persistent zones, no result, and explicit RNG state.

### Lane B — Verification

Test exact setup values, 100 seeded reproducible setups, and different seeds
preserving deck contents.

**PASS:** all 100 identical-seed repetitions serialize byte-equivalently.

==========================================================================
## Street 16 — Validate state invariants

### Lane A — Instruction

Create `validate-state.js`. Validate versions, known IDs, unique physical IDs,
exactly one location per instance, zone capacity, Condition layer capacity,
valid active side, Comfort bounds, Supply bounds, and JSON safety.

### Lane B — Verification

Corrupt one invariant at a time and assert stable rejection. Include duplicate
zone placement and unknown IDs.

**PASS:** valid setup passes; every corruption fails for the intended reason.

==========================================================================
## Street 17 — Seal Phase 2

### Lane A — Instruction

Complete `PHASE_02.md`. Record state and RNG schema versions.

### Lane B — Verification

Serialize one setup and inspect it manually.

**PASS:** no functions, callbacks, dates, timers, DOM data, or UI-relative sides.

==========================================================================
## Street 18 — Define command and rejection envelopes

### Lane A — Instruction

Create `commands.js` and `rejections.js`. Define the SAIP command set and stable
rejection codes. Validate command version, actor, match, and required IDs.

### Lane B — Verification

Test every rejection code can be represented and malformed envelopes reject
without accessing mutation logic.

**PASS:** rejection vocabulary matches SAIP section 8.4.

==========================================================================
## Street 19 — Build pure dispatch preflight

### Lane A — Instruction

Create `dispatch.js`. Implement only universal preflight: state validity, match
status, actor, active side, pending-decision blocking, and instance existence.
Return a new result object; never mutate input state.

### Lane B — Verification

For every rejection, serialize state before and after and assert exact equality.

**PASS:** all rejections are byte-equivalent no-ops.

==========================================================================
## Street 20 — Add serializable pending decisions

### Lane A — Instruction

Create `decisions.js`. Represent a synthetic choice as plain JSON with command
context and legal options. Add select, invalid select, cancel, and unrelated
command blocking. Do not use closures.

### Lane B — Verification

Test serialize/restore mid-decision; invalid and cancel preserve state and RNG;
valid selection commits once.

**PASS:** no callback is required to resume a restored decision.

==========================================================================
## Street 21 — Add semantic event envelopes

### Lane A — Instruction

Create `events.js` with version, sequence, round, actor, type, payload, and
visibility. Emit events only for committed actions.

### Lane B — Verification

Test rejection and cancel emit no committed mutation events; accepted synthetic
command emits one ordered event.

**PASS:** event order is deterministic.

==========================================================================
## Street 22 — Seal Phase 3

### Lane A — Instruction

Complete `PHASE_03.md` and document the atomicity boundary.

### Lane B — Verification

Run all tests, then run the atomicity tests alone ten times.

**PASS:** no partial mutation or nondeterministic failure.

==========================================================================
## Street 23 — Route cards by closed type family

### Lane A — Instruction

Create `placement.js`. Route types using the closed matrix only: Condition,
Influence, or transient action. Unknown values reject. Do not branch on card ID,
name, subtype, trait, or printed text.

### Lane B — Verification

Test every card type. Explicitly test Chronic Dampness routes to Influence and
does not set Condition-play allowance.

**PASS:** no individual card appears in placement branching.

==========================================================================
## Street 24 — Implement Condition slots and layers

### Lane A — Instruction

Implement three unique Condition identities, two physical layers per identity,
one Condition play per Callus turn, stable layer order, and physical instance
movement.

### Lane B — Verification

Test first/second copy, third-copy rejection, three unique identities,
fourth-unique rejection, and second distinct Condition in one turn.

**PASS:** rejected actions are byte-equivalent no-ops.

==========================================================================
## Street 25 — Implement Influence slots and replacement

### Lane A — Instruction

Implement three slots per side. Use the lowest empty stable slot. When full,
create a replace-or-cancel pending decision before changing resources or zones.

### Lane B — Verification

Test every Influence type, automatic empty placement, full-zone options,
invalid slot, exact replacement, and exact cancellation.

**PASS:** all Influence types share one family path.

==========================================================================
## Street 26 — Implement transient placement and costs

### Lane A — Instruction

Implement Care Action and Supporter resolution-to-discard routing plus Supply
preflight. Do not implement card effects yet.

### Lane B — Verification

Test insufficient Supply rejects unchanged, legal cost is charged only on
commit, and Supporter does not inherit Care's Severity-to-Comfort policy.

**PASS:** resource movement is atomic.

==========================================================================
## Street 27 — Prove type separation

### Lane A — Instruction

Add a scripted scenario: Callus plays Mild Heel Fissures, then Chronic Dampness,
then attempts another Condition in the same turn.

### Lane B — Verification

**PASS:** Fissures occupies Condition; Dampness occupies Influence; Dampness
succeeds; second Condition rejects. Save the state fixture as `G02`.

==========================================================================
## Street 28 — Seal Phase 4

### Lane A — Instruction

Complete `PHASE_04.md` and include a serialized G02 snapshot.

### Lane B — Verification

Search placement source for card titles and IDs.

**PASS:** none occur in generic topology logic.

==========================================================================
## Street 29 — Query compatible Care targets

### Lane A — Instruction

Create `targeting.js`. Query active Conditions using accepted subtype data from
immutable definitions. Zero targets means fallback; one auto-selects; two or
more creates a pending target decision.

### Lane B — Verification

Test Surface, Microbial, Structural, Keratin, multi-subtype Pumice, zero, one,
many, invalid choice, and cancel.

**PASS:** title, color, prose, and unrelated traits are never compatibility.

==========================================================================
## Street 30 — Ease oldest physical layers

### Lane A — Instruction

Create `easing.js`. Reduce the oldest layer first, carry excess to the next,
discard exhausted physical instances, and return attempted amount, actual
removed amount, removed IDs, and remaining layers.

### Lane B — Verification

Test partial, exact, overkill, and `[4,4]` reduced by 5 leaving the second layer
at 3. Check physical locations.

**PASS:** no lost or duplicated instance.

==========================================================================
## Street 31 — Convert actual Care removal to Comfort

### Lane A — Instruction

Implement Care policy: compatible target restores actual Severity removed;
zero compatible targets normally restores exactly 1; no additional fallback
point when a target existed. Check terminal result immediately.

### Lane B — Verification

Prove Heavy Heel Balm G03: Comfort 8→11, Supply 3→2, Fissures 4→1, Balm discard.
Also test remaining Severity 2 restores 2 and no Surface target restores 1.

**PASS:** assert state and semantic events, not display text.

==========================================================================
## Street 32 — Add multi-target transaction

### Lane A — Instruction

Ensure two compatible targets pause before resource or card movement. Implement
select and cancel through the common decision subsystem.

### Lane B — Verification

Save G04 and G05 fixtures. Assert invalid target and cancel preserve serialized
state and RNG exactly.

**PASS:** engine never silently selects the first target.

==========================================================================
## Street 33 — Add explicit Supporter policy seam

### Lane A — Instruction

Create the mechanism for Supporter handlers to reduce Conditions without
automatically restoring Comfort. Implement Dr. Honeyfoot only when Street 45
permits the card wave.

### Lane B — Verification

Use a synthetic Supporter effect. Assert Severity changes and Comfort does not.

**PASS:** Supporter resolution does not call the Care conversion implicitly.

==========================================================================
## Street 34 — Seal Phase 5

### Lane A — Instruction

Complete `PHASE_05.md` with the subtype target matrix and G03–G05 evidence.

### Lane B — Verification

Run the full suite and inspect event payloads for attempted, actual, remaining,
target IDs, Supply, movement, and Comfort.

**PASS:** full matrix and all golden Care scenarios pass.

==========================================================================
## Street 35 — Implement explicit end-turn cadence

### Lane A — Instruction

Implement unlimited legal plays followed by explicit End Turn. First side End
Turn activates second without Care Check. Second side End Turn begins Care Check.

### Lane B — Verification

Test multiple plays, no automatic end, first transition, and no premature check.

**PASS:** cadence matches SAIP Phase 6.

==========================================================================
## Street 36 — Implement ordinary Care Check

### Lane A — Instruction

Sum ordinary Discomfort per physical Condition layer, apply it once at the
second-side transition, and check Callus victory immediately.

### Lane B — Verification

Test one layer deals 1, two layers deal 2, multiple stacks add, and Comfort 1
reaches terminal Callus victory with no later transition.

**PASS:** completed state rejects further commands.

==========================================================================
## Street 37 — Start a new round

### Lane A — Instruction

If match remains active: increment round, reset temporary allowances, draw one
for both sides in fixed order, add one Archangel Supply, preserve persistent
zones, then activate the first side.

### Lane B — Verification

Test exact order, both draws, Supply +1, Condition allowance reset, and zones
unchanged.

**PASS:** semantic round events are stable and ordered.

==========================================================================
## Street 38 — Handle empty decks and concede

### Lane A — Instruction

Implement deterministic physical fallback creation: Basic Massage for
Archangel, Commercial Hard Floors for Callus. Implement immediate concede.

### Lane B — Verification

Test unique deterministic fallback IDs, no deck-out loss, correct winner on
concede, and post-terminal command rejection.

**PASS:** no instance duplication or missing location.

==========================================================================
## Street 39 — Seal Phase 6

### Lane A — Instruction

Create a deterministic five-round scripted baseline and `PHASE_06.md`.

### Lane B — Verification

Run the script ten times from the same seed and compare final state/events.

**PASS:** byte-equivalent results every time.

==========================================================================
## Street 40 — Define generic effect hooks

### Lane A — Instruction

Create an explicit effect registry with named lifecycle hooks for entrance,
cost, reduction, trigger, Care Check, round start, and leave play. Do not put
all card titles in one switch.

### Lane B — Verification

Register synthetic effects for each hook and test deterministic hook order.

**PASS:** lifecycle names generic hooks; definitions reference stable handlers.

==========================================================================
## Street 41 — Implement modifier grouping and charges

### Lane A — Instruction

Implement non-stack groups and source-owned consumable charges as match state.
Do not store mutable data on definitions.

### Lane B — Verification

Test duplicate non-stack sources apply once, stackable sources apply separately,
and each charge consumes once and survives serialization.

**PASS:** source instance IDs own markers.

==========================================================================
## Street 42 — Implement prevention

### Lane A — Instruction

Implement prevention entries with explicit source, matching rule, target or
scope, count, and expiry. Consume only on a matching trigger.

### Lane B — Verification

Test matching, non-matching, one-use consumption, expiry, duplicates, and
serialization.

**PASS:** unrelated triggers do not consume prevention.

==========================================================================
## Street 43 — Implement private draw and public reveal

### Lane A — Instruction

Separate physical movement from event visibility. Ordinary draw identity is
owner-private. Explicit reveal is public.

### Lane B — Verification

Project one draw and one reveal to authority, owner, opponent, and spectator.

**PASS:** only permitted viewers receive hidden identity.

==========================================================================
## Street 44 — Implement atomic search

### Lane A — Instruction

Implement search as a serializable transaction: compute physical candidates,
offer valid/all view, select or finish, reveal if specified, add, shuffle on
resolution only, and cancel restoring state and RNG.

### Lane B — Verification

Test valid candidates, all view without mutation, invalid selection, finish,
no candidates, reveal, shuffle, and exact cancellation.

**PASS:** candidates and deck order remain private.

==========================================================================
## Street 45 — Seal Phase 7

### Lane A — Instruction

Complete `PHASE_07.md`. List every generic mechanism and its synthetic tests.

### Lane B — Verification

Inspect effect source for prose parsing and a monolithic title switch.

**PASS:** neither exists; all synthetic tests pass.

==========================================================================
## Street 46 — Implement Card Wave A

### Lane A — Instruction

Implement only Wave A from SAIP Phase 8: Basic Massage, Stretch, Balm, Cream,
Trimming, Pumice, Fissures, Bunionette base, and Debug wins. Use existing generic
mechanisms; add no unrelated cards.

### Lane B — Verification

Add direct tests for every Wave A card, subtype/Supply/fallback paths, and exact
physical movement. Re-run G03–G05.

**PASS:** all Wave A rows in `CARD_CONFORMANCE.md` are complete.

==========================================================================
## Street 47 — Implement Card Wave B

### Lane A — Instruction

Implement only Wave B interactions named in SAIP Phase 8, including Dampness,
Webbing, Friction Blister, Morning Dagger, Hard Floors, Static Stand, and
Ignoring Hotspot.

### Lane B — Verification

Test every cross-interaction and each duplicate non-stack source. Re-run G02,
G07, G08, G12, and G18.

**PASS:** Dampness remains Habit/Influence and has no Severity.

==========================================================================
## Street 48 — Implement Card Wave C

### Lane A — Instruction

Implement only Wave C from SAIP Phase 8: Care Kit, Socks, Hydrocolloid, Dr.,
Paraffin, Reflexology, three searches, and Orthotic removal.

### Lane B — Verification

Test direct behavior, conditional draws, privacy, replacement, one/many target,
invalid target, and cancel. Re-run G06, G09–G11, G14, and G17.

**PASS:** Hydrocolloid is Blister-only plus one next-trigger prevention; Dr.
restores no Comfort and draws privately.

==========================================================================
## Street 49 — Audit all cards

### Lane A — Instruction

Finish `CARD_CONFORMANCE.md`. Map every card to direct tests and every documented
interaction to interaction tests. Mark no row complete without executable proof.

### Lane B — Verification

**PASS:** 30 direct card rows, exact 24-card starter decks, every non-stack source
duplicated in tests, all target/cancel paths covered, zero unexplained partials.

==========================================================================
## Street 50 — Seal Phase 8

### Lane A — Instruction

Complete `PHASE_08.md` and generate a human-readable conformance summary.

### Lane B — Verification

A human compares the matrix to `CARDS.md`, or the builder performs a second
independent line-by-line comparison and records it.

**PASS:** no undocumented omission or balance change.

==========================================================================
## Street 51 — Inventory semantic mutations

### Lane A — Instruction

List every meaningful state mutation and ensure a versioned semantic event
exists for it: play, removal, Comfort, discard, draw, reveal, search, shuffle,
prevention, replacement, Care Check, transition, and match end.

### Lane B — Verification

Run golden scenarios and compare state diffs with events.

**PASS:** every meaningful mutation is explained without display text parsing.

==========================================================================
## Street 52 — Implement viewer projections

### Lane A — Instruction

Create projections for authority, Archangel, Callus, and spectator. Filter
payload fields by visibility. Never merely hide a rendered text string.

### Lane B — Verification

Use one mid-search state and compare four JSON projections. Search all
unauthorized projections for private card names, IDs, candidates, and deck order.

**PASS:** no hidden information leaks; public counts remain useful.

==========================================================================
## Street 53 — Prove history sufficiency

### Lane A — Instruction

Build History only from semantic events. Preserve target, attempted/actual
amounts, remaining Severity, Comfort, movement, cost, round, and actor where
relevant.

### Lane B — Verification

Inspect Heavy Heel Balm G03 History and Dr. private draw History for all viewers.

**PASS:** History explains the action while respecting privacy.

==========================================================================
## Street 54 — Seal Phase 9

### Lane A — Instruction

Complete `PHASE_09.md` with projection samples and adversarial searches.

### Lane B — Verification

Run the full suite with logs configured to use projections only.

**PASS:** tests and diagnostic evidence contain no authoritative hidden dump.

==========================================================================
## Street 55 — Implement versioned serialization

### Lane A — Instruction

Create serialize/deserialize functions and runtime validation. Include engine,
catalog, state, and RNG versions. Reject unknown future and corrupt versions.

### Lane B — Verification

Round-trip setup, mid-turn, target decision, search, replacement, multilayer,
and terminal states.

**PASS:** each restored state has the same legal actions and next RNG outcome.

==========================================================================
## Street 56 — Add migration registry

### Lane A — Instruction

Create a pure migration registry with no storage I/O. Version 1 may have no
incoming migration, but the dispatch path for known versions must be explicit.

### Lane B — Verification

Test current version, malformed version, and unknown future version.

**PASS:** failures are explicit; no silent reinterpretation.

==========================================================================
## Street 57 — Implement deterministic replay

### Lane A — Instruction

Replay a versioned initial state plus semantic commands through the same public
dispatch path. Do not add a replay-only mutation path.

### Lane B — Verification

Re-run G15 and 100 seeded scripted matches. Compare uninterrupted, restored,
and replayed final state/events.

**PASS:** exact equivalence.

==========================================================================
## Street 58 — Seal Phase 10

### Lane A — Instruction

Complete `PHASE_10.md` with snapshot and replay samples.

### Lane B — Verification

Run corruption tests and all golden scenarios.

**PASS:** physical IDs, layers, markers, charges, RNG, and decisions survive.

==========================================================================
## Street 59 — Create the public engine entry point

### Lane A — Instruction

Create one public entry module exporting only the SAIP contracts: create match,
legal actions, dispatch, projection, validation, serialization, and replay.
Do not export internal mutation helpers.

### Lane B — Verification

Inspect exports and test a consumer can complete a scripted match using only
the public entry.

**PASS:** consumer imports no internal file.

==========================================================================
## Street 60 — Add CLI and random-legal adapters

### Lane A — Instruction

Create thin CLI/script and random-legal policy adapters. They may query legal
actions and submit commands only. Run both faction-control directions.

### Lane B — Verification

Run 1,000 seeded matches or the documented cap. Record completion, cap hits,
runtime, state size, and invalid-state count without rebalancing.

**PASS:** zero invalid states; no privileged mutation or hidden strategy input.

==========================================================================
## Street 61 — Seal Phase 11 and freeze the clean-room build

### Lane A — Instruction

Complete `PHASE_11.md`, run all tests, and record the exact freeze commit. Only
after this record exists may the legacy engine be inspected.

### Lane B — Verification

Search engine and adapter imports for React, DOM, storage, networking, legacy
`src/game/`, and internal adapter mutation.

**PASS:** no forbidden dependency and all tests pass from a clean install.

==========================================================================
## Street 62 — Compare with the legacy engine

### Lane A — Instruction

Now inspect legacy code and tests. Run shared scenarios through both engines.
Classify each difference as `BUILDER-DEVIATION`, `SAIP-AMBIGUITY`,
`SOURCE-AMBIGUITY`, `LEGACY-BUG`, `INTENTIONAL-CORRECTION`, or
`ADAPTER-MISMATCH`. Do not silently change the clean-room engine.

### Lane B — Verification

Produce `reports/honeyfoot-engine/FINAL_AUDIT.md` with reproduction, highest
authority, decision chain, proposed response, and approval needs for every diff.

**PASS:** no unexplained discrepancy.

==========================================================================
## Street 63 — Re-run the adversarial reconstruction tests

### Lane A — Instruction

Re-run Chronic Dampness classification/play allowance, Heavy Heel Balm actual
targeting/restoration, all golden scenarios, legacy acceptance scenarios, and
random overlapping commands.

### Lane B — Verification

**PASS:** Dampness is never semantically Condition; Balm reduces Fissures and
restores actual removal; no regression or unexplained differential.

==========================================================================
## Street 64 — Close the experiment

### Lane A — Instruction

Complete `PHASE_12.md`, `FINAL_AUDIT.md`, traceability, discrepancy attribution,
dependency audit, projection/replay samples, simulation metrics, decision ledger,
assumptions, and `EXPERIMENT_METRICS.md`.

Calculate, where available:

- architect resources used to write the SAIP and Instruction Street;
- builder resources used to execute the street;
- repair attempts and escalations;
- percentage of requirements and cards passing on first implementation;
- defects attributable to street ambiguity, SAIP ambiguity, source ambiguity,
  or builder deviation;
- human review time and comprehension notes.

### Lane B — Verification

From a clean environment run `npm ci`, `npm run test:engine`, and the recorded
simulation command. Check every SAIP final-verification item.

Set exactly one final status:

- `READY_FOR_COMPARATIVE_REVIEW`;
- `BLOCKED_BY_SPECIFICATION`;
- `RECONSTRUCTION_FAILED`;
- or, only with owner approval, `APPROVED_FOR_INTEGRATION`.

**PASS:** evidence supports the selected status and every street entry is logged.

==========================================================================
## Human comprehension check

Before using this street as a reusable success, ask a human reader to answer:

1. What files must be read before coding?
2. When may the legacy engine first be inspected?
3. What happens after a verification fails?
4. Why is Chronic Dampness not a Condition?
5. What exact state follows the Heavy Heel Balm golden scenario?
6. Where are choices stored, and may they contain callbacks?
7. Which layer owns legality and mutation?
8. What evidence closes the experiment?

If the reader cannot answer from this file without reconstructing the SAIP,
record the unclear street numbers and revise only those sections.

## Revision history

| Version | Date | Change |
|---|---|---|
| 1.0.0-experiment | 2026-08-08 | Initial paired instruction/verification street for the clean-room engine experiment. |
