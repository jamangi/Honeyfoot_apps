import assert from 'node:assert/strict'
import { cancelDeckSearch, cancelInfluencePlacement, cancelInfluenceRemoval, cardSupplyCost, createMatchState, finishRound, playCard, resolveDeckSearch, resolveInfluencePlacement, resolveInfluenceRemoval } from '../src/game/engine.js'
import { playArchangelTurn } from '../src/game/archangel-ai.js'
import { applyFactionExperience, matchRewards, xpRequiredForNextLevel } from '../src/game/economy.js'

const cards = [
  { id: 'webbing-itch', name: 'Webbing Itch', faction: 'callus', type: 'Condition', subtype: 'Microbial', severity: 4, discomfort: 1, cost: 0 },
  { id: 'morning-dagger', name: 'The Morning Dagger', faction: 'callus', type: 'Condition', subtype: 'Structural', severity: 6, discomfort: 1, cost: 0 },
  { id: 'toe-cramp', name: 'Toe Cramp', faction: 'callus', type: 'Condition', subtype: 'Structural', severity: 3, discomfort: 1, cost: 0 },
  { id: 'chronic-dampness', name: 'Chronic Dampness', faction: 'callus', type: 'Habit', subtype: null, severity: 0, discomfort: 0, cost: 0 },
  { id: 'hard-floors', name: 'Commercial Hard Floors', faction: 'callus', type: 'Hazard', subtype: 'Structural', severity: 0, discomfort: 0, cost: 0 },
  { id: 'haider', name: 'Haider', faction: 'callus', type: 'Supporter', subtype: null, severity: 0, discomfort: 0, cost: 0 },
  { id: 'narrow-box', name: 'Aggressive Taper', faction: 'callus', type: 'Shoe Attribute', subtype: 'Structural', severity: 0, discomfort: 0, cost: 0 },
  { id: 'basic-massage', name: 'Basic Massage', faction: 'archangels', type: 'Care Action', subtype: 'Structural', traits: ['Kinetic'], severity: 0, discomfort: 0, cost: 0 },
  { id: 'care-kit', name: 'Everyday Care Kit', faction: 'archangels', type: 'Equipment', subtype: null, severity: 0, discomfort: 0, cost: 2 },
  { id: 'paraffin-treatment', name: 'Paraffin Wax Treatment', faction: 'archangels', type: 'Care Action', subtype: 'Surface', traits: ['Topical'], cost: 2 },
  { id: 'podiatrist-consultation', name: 'Podiatrist Consultation', faction: 'archangels', type: 'Supporter', traits: ['Search'], cost: 1 },
  { id: 'pumice-stone', name: 'Pumice Stone', faction: 'archangels', type: 'Care Action', subtype: 'Surface', targetSubtypes: ['Surface','Keratin'], traits: ['Precision'], cost: 1 },
  { id: 'reflexology-session', name: 'Reflexology Session', faction: 'archangels', type: 'Care Action', subtype: 'Structural', traits: ['Kinetic'], cost: 1 },
  { id: 'orthotic-inserts', name: 'Orthotic Shoe Inserts', faction: 'archangels', type: 'Equipment', traits: ['Tools'], cost: 2 },
  { id: 'bunionette', name: 'Bunionette', faction: 'callus', type: 'Condition', subtype: 'Structural', traits: ['Pressure'], severity: 4, discomfort: 1, cost: 0 },
  { id: 'mild-fissures', name: 'Mild Heel Fissures', faction: 'callus', type: 'Condition', subtype: 'Surface', traits: ['Friction'], severity: 4, discomfort: 1, cost: 0 },
  { id: 'ignoring-hotspot', name: 'Ignoring the Hotspot', faction: 'callus', type: 'Habit', traits: ['Friction'], cost: 0 },
  { id: 'static-stand', name: 'The Static Stand', faction: 'callus', type: 'Hazard', traits: ['Pressure'], cost: 0 },
  { id: 'baron-blister', name: 'Baron von Blister', faction: 'callus', type: 'Supporter', traits: ['Friction'], cost: 0 },
]
const getCard = (id) => cards.find((card) => card.id === id)
const deck = (name, faction, id) => ({ name, faction, cards: { [id]: 5 } })
const base = () => createMatchState({ playerDeck: deck('Callus','callus','chronic-dampness'), opponentDeck: deck('Care','archangels','basic-massage'), random: () => .5 })

{
  const state = { ...base(), comfort: 10, playerBoard: ['chronic-dampness','chronic-dampness'], conditions: [{ key: 'web', cardId: 'webbing-itch', layers: [4,4], copies: 2, severity: 8, owner: 'player' }] }
  const result = finishRound(state, { playerFaction: 'callus', opponentFaction: 'archangels', getCard })
  assert.equal(result.comfort, 6, 'a Webbing Itch stack should trigger twice, not once per Dampness copy')
}

{
  let state = { ...base(), playerHand: ['haider'], playerDeck: ['narrow-box','webbing-itch'], playerDiscard: [] }
  state = playCard(state, { card: getCard('haider'), side: 'player', getCard, deferSearch: true })
  state = cancelDeckSearch(state)
  assert.equal(state.playerHand.includes('haider'), true, 'cancelling should return Haider to the hand')
  assert.equal(state.playerDiscard.includes('haider'), false, 'cancelling should remove Haider from the discard pile')
  assert.equal(state.playerDeck.length, 2, 'cancelling should leave the deck untouched')
  assert.equal(state.metrics.cardsPlayed.player, 0, 'cancelling should undo the provisional card play')
}

{
  const state = { ...base(), comfort: 10, playerBoard: ['hard-floors','hard-floors'], conditions: [{ key: 'dagger', cardId: 'morning-dagger', layers: [6], copies: 1, severity: 6, owner: 'player' }] }
  const result = finishRound(state, { playerFaction: 'callus', opponentFaction: 'archangels', getCard })
  assert.equal(result.comfort, 8, 'Hard Floors should add one total Structural Discomfort even with two copies')
  assert.equal(result.playerBoard.filter((id) => id === 'hard-floors').length, 2, 'Hard Floors should remain in play after the Care Check')
  const secondResult = finishRound(result, { playerFaction: 'callus', opponentFaction: 'archangels', getCard })
  assert.equal(secondResult.comfort, 6, 'persistent Hard Floors should deal its non-stacking bonus again next Care Check')
}

{
  let state = { ...base(), playerHand: ['chronic-dampness','webbing-itch'], playerBoard: [], playerDiscard: [], conditions: [] }
  state = playCard(state, { card: getCard('chronic-dampness'), side: 'player', getCard })
  state = playCard(state, { card: getCard('webbing-itch'), side: 'player', getCard })
  assert.equal(state.conditions[0].severity, 6, 'Dampness should give the next Microbial Condition +2 Severity')
  assert.equal(state.playerChronicDampnessCharges, 0, 'the Severity charge should be consumed once')
  assert.equal(state.playerBoard.includes('chronic-dampness'), true, 'Dampness should remain active for Webbing Itch')
}

{
  let state = { ...base(), playerHand: ['haider'], playerDeck: ['webbing-itch','narrow-box','morning-dagger'], playerDiscard: [] }
  state = playCard(state, { card: getCard('haider'), side: 'player', getCard })
  assert.equal(state.playerHand.includes('narrow-box'), true, 'Haider should add a Shoe Attribute to its owner’s hand')
  assert.equal(state.playerDeck.includes('narrow-box'), false, 'the searched Shoe Attribute should leave the deck')
  assert.equal(state.playerDiscard.includes('haider'), true, 'Haider should enter the discard pile after resolving')
}

{
  let state = { ...base(), playerHand: ['haider'], playerDeck: ['narrow-box','webbing-itch','narrow-box'], playerDiscard: [] }
  state = playCard(state, { card: getCard('haider'), side: 'player', getCard, deferSearch: true })
  assert.equal(state.pendingSearch?.cardType, 'Shoe Attribute', 'a human Haider play should pause for a deck search')
  assert.equal(state.playerHand.includes('narrow-box'), false, 'a deferred search should not choose automatically')
  state = resolveDeckSearch(state, { deckIndex: 2, getCard, random: () => .5 })
  assert.equal(state.playerHand.includes('narrow-box'), true, 'the selected physical copy should enter the hand')
  assert.equal(state.playerDeck.filter((id) => id === 'narrow-box').length, 1, 'only one selected copy should leave the deck')
  assert.equal(state.pendingSearch, null, 'the search should close after resolution')
}

{
  let state = { ...base(), playerHand: ['basic-massage'], playerDiscard: [], conditions: [{ key: 'cramp', cardId: 'toe-cramp', layers: [3], copies: 1, severity: 3, owner: 'opponent' }] }
  state = playCard(state, { card: getCard('basic-massage'), side: 'player', getCard })
  assert.equal(state.conditions.length, 0, 'Basic Massage should remove 3 Severity from Toe Cramp through its Kinetic bonus')
  assert.equal(state.comfort, 11, 'the additional Severity removed from Toe Cramp should also restore Comfort')
}

{
  let state = { ...base(), playerHand: ['hard-floors'], playerBoard: [null,null,null], playerDiscard: [] }
  state = playCard(state, { card: getCard('hard-floors'), side: 'player', getCard, deferInfluence: true })
  assert.equal(state.pendingInfluence?.cardId, 'hard-floors', 'an Influence should pause before entering a slot')
  state = resolveInfluencePlacement(state, { slotIndex: 2, getCard })
  assert.equal(state.playerBoard[2], 'hard-floors', 'the Influence should enter the chosen physical slot')
  state = { ...state, playerHand: ['chronic-dampness'] }
  state = playCard(state, { card: getCard('chronic-dampness'), side: 'player', getCard, deferInfluence: true })
  state = resolveInfluencePlacement(state, { slotIndex: 2, getCard })
  assert.equal(state.playerBoard[2], 'chronic-dampness', 'a new Influence should replace the selected occupied slot')
  assert.equal(state.playerDiscard.includes('hard-floors'), true, 'the replaced Influence should enter its owner’s discard pile')
}

{
  const careDeck = { name: 'Care', faction: 'archangels', cards: { 'care-kit': 5 } }
  const callusDeck = deck('Callus', 'callus', 'chronic-dampness')
  let state = createMatchState({ playerDeck: careDeck, opponentDeck: callusDeck, random: () => .5 })
  state = { ...state, playerHand: ['care-kit'], playerBoard: [null,null,null], playerSupplies: 3 }
  state = playCard(state, { card: getCard('care-kit'), side: 'player', getCard, deferInfluence: true })
  assert.equal(state.playerSupplies, 1, 'playing Care Kit should cost 2 Supply without an immediate rebate')
  state = resolveInfluencePlacement(state, { slotIndex: 0, getCard })
  assert.equal(state.playerSupplies, 1, 'placing Care Kit should not immediately produce Supply')
  state = finishRound(state, { playerFaction: 'archangels', opponentFaction: 'callus', getCard })
  assert.equal(state.playerSupplies, 3, 'the next turn should grant 1 normal and 1 Care Kit Supply')
  state = finishRound(state, { playerFaction: 'archangels', opponentFaction: 'callus', getCard })
  assert.equal(state.playerSupplies, 5, 'Care Kit should continue producing 1 additional Supply each turn')
}

{
  let state = { ...base(), playerHand: ['basic-massage', 'care-kit', 'basic-massage'], playerHandOrder: ['basic-massage', 'care-kit'], playerDiscard: [], conditions: [] }
  state = playCard(state, { card: getCard('basic-massage'), side: 'player', getCard })
  assert.deepEqual(state.playerHandOrder, ['basic-massage', 'care-kit'], 'playing one copy should not move its remaining hand stack')
  assert.equal(state.playerHand.filter((id) => id === 'basic-massage').length, 1, 'one copy should remain in its original stack')
}

{
  let state = { ...base(), playerHand: ['hard-floors'], playerBoard: [null,null,null], playerDiscard: [] }
  state = playCard(state, { card: getCard('hard-floors'), side: 'player', getCard, deferInfluence: true })
  state = cancelInfluencePlacement(state)
  assert.equal(state.playerHand.includes('hard-floors'), true, 'cancelling placement should return the Influence to hand')
  assert.deepEqual(state.playerBoard, [null,null,null], 'cancelling placement should leave all slots untouched')
  assert.equal(state.metrics.cardsPlayed.player, 0, 'cancelling placement should undo the provisional play count')
}

{
  const starting = { ...base(), comfort: 8, opponentHand: ['basic-massage'], opponentDiscard: [], opponentSupplies: 3, conditions: [] }
  const executive = playArchangelTurn(starting, getCard, 'executive', 'opponent')
  assert.deepEqual(executive.opponentHand, ['basic-massage'], 'Executive Archangels should preserve generic care when neither winning nor facing defeat')

  const pressure = playArchangelTurn(starting, getCard, 'pressure', 'opponent')
  assert.equal(pressure.comfort, 9, 'Pressure Archangels should spend generic care once Comfort reaches the midpoint')
  assert.equal(pressure.opponentHand.length, 0, 'Pressure Archangels should use the generic care card they selected')
}

{
  const starting = { ...base(), comfort: 8, opponentHand: ['basic-massage'], opponentDiscard: [], opponentSupplies: 3, conditions: [{ key: 'cramp-ai', cardId: 'toe-cramp', layers: [3], copies: 1, severity: 3, owner: 'player' }] }
  const executive = playArchangelTurn(starting, getCard, 'executive', 'opponent')
  assert.equal(executive.conditions.length, 0, 'Executive Archangels should use matching care against a valid Condition')
  assert.equal(executive.comfort, 11, 'Executive matching care should restore the Severity it removes')
}

{
  const starting = { ...base(), comfort: 8, opponentHand: ['basic-massage', 'basic-massage', 'care-kit'], opponentDiscard: [], opponentSupplies: 3, conditions: [] }
  const guided = playArchangelTurn(starting, getCard, 'training', 'opponent', { maxCards: 1 })
  assert.equal(guided.opponentHand.length, starting.opponentHand.length - 1, 'A guided Archangel opponent should play no more than one card per turn')
}

{
  const totalEfficientWins = Array.from({ length: 29 }, (_, index) => xpRequiredForNextLevel(index + 1) / 100).reduce((total, wins) => total + wins, 0)
  assert.equal(totalEfficientWins, 482, 'the level curve should require approximately four hours of efficient victories')
  assert.deepEqual(matchRewards({ won: true, difficulty: 'executive', opponentLevel: 10, playerLevel: 10 }), { xp: 100, gold: 100, difficultyModifier: 1, levelModifier: 1 }, 'a same-level Executive victory should grant full rewards')
  assert.equal(matchRewards({ won: true, difficulty: 'pressure', opponentLevel: 5, playerLevel: 10 }).xp, 40, 'difficulty and lower-level modifiers should combine')
  assert.deepEqual(matchRewards({ won: false, difficulty: 'executive', opponentLevel: 10, playerLevel: 10 }).xp, 0, 'defeats should grant no XP')
  assert.equal(matchRewards({ won: false, difficulty: 'executive', opponentLevel: 10, playerLevel: 10 }).gold, 25, 'defeats should grant one quarter of the available gold')
}

{
  const advancedAtMaximum = applyFactionExperience({ level: 1, selectedLevel: 1, xp: 550 }, 100)
  assert.deepEqual(advancedAtMaximum, { level: 2, selectedLevel: 2, xp: 50 }, 'leveling while playing at maximum should advance the selected level')
  const stayedLower = applyFactionExperience({ level: 5, selectedLevel: 2, xp: xpRequiredForNextLevel(5) - 50 }, 100)
  assert.equal(stayedLower.level, 6, 'earned XP should unlock the next level while a lower challenge is selected')
  assert.equal(stayedLower.selectedLevel, 2, 'leveling from a lower selection should preserve that deliberate selection')
}

{
  let state = { ...base(), comfort: 8, playerHand: ['paraffin-treatment'], playerDeck: ['basic-massage'], playerDiscard: [], playerSupplies: 3, conditions: [{ key: 'surface', cardId: 'mild-fissures', layers: [4], copies: 1, severity: 4, owner: 'opponent' }] }
  state = playCard(state, { card: getCard('paraffin-treatment'), side: 'player', getCard, targetKey: 'surface' })
  assert.equal(state.conditions.length, 0, 'Paraffin should remove up to 5 Surface Severity')
  assert.equal(state.comfort, 12, 'Paraffin should restore only the Severity actually removed')
  assert.equal(state.playerHand.includes('basic-massage'), true, 'Paraffin should draw after removing the Condition')
}

{
  let state = { ...base(), playerHand: ['reflexology-session'], playerDeck: ['basic-massage','care-kit'], playerDiscard: [], playerSupplies: 3, conditions: [{ key: 'structural', cardId: 'toe-cramp', layers: [3], copies: 1, severity: 3, owner: 'opponent' }] }
  state = playCard(state, { card: getCard('reflexology-session'), side: 'player', getCard, targetKey: 'structural' })
  assert.equal(state.conditions.length, 0, 'Reflexology should receive the Kinetic bonus against Toe Cramp')
  assert.equal(state.playerHand.length, 2, 'Reflexology should draw one card plus a removal bonus card')
}

{
  let state = { ...base(), playerHand: ['podiatrist-consultation'], playerDeck: ['basic-massage','care-kit'], playerDiscard: [], playerSupplies: 3 }
  state = playCard(state, { card: getCard('podiatrist-consultation'), side: 'player', getCard, deferSearch: true })
  assert.deepEqual(state.pendingSearch.allowedTypes, ['Equipment','Care Action'], 'Podiatrist Consultation should open the shared search flow with both valid types')
  state = resolveDeckSearch(state, { deckIndex: 1, getCard, random: () => .5 })
  assert.equal(state.playerHand.includes('care-kit'), true, 'Podiatrist Consultation should retrieve the selected Equipment')
}

{
  let state = { ...base(), playerHand: ['narrow-box','bunionette'], playerBoard: [], conditions: [] }
  state = playCard(state, { card: getCard('narrow-box'), side: 'player', getCard })
  state = playCard(state, { card: getCard('bunionette'), side: 'player', getCard })
  assert.equal(state.conditions[0].severity, 6, 'Bunionette should gain its own Shoe bonus in addition to Aggressive Taper')
}

{
  let state = { ...base(), comfort: 10, playerHand: ['ignoring-hotspot','mild-fissures'], playerBoard: [], playerDiscard: [], conditions: [] }
  state = playCard(state, { card: getCard('ignoring-hotspot'), side: 'player', getCard })
  state = playCard(state, { card: getCard('mild-fissures'), side: 'player', getCard })
  assert.equal(state.conditions[0].severity, 6, 'Ignoring the Hotspot should add 2 entrance Severity')
  assert.equal(state.comfort, 9, 'Ignoring the Hotspot should trigger the entering Surface Condition immediately')
  assert.equal(state.playerBoard.includes('ignoring-hotspot'), false, 'Ignoring the Hotspot should discard itself after use')
}

{
  const state = { ...base(), playerSupplies: 1, opponentBoard: ['static-stand'], playerHand: ['basic-massage'] }
  assert.equal(cardSupplyCost(state, getCard('basic-massage'), 'player'), 1, 'Static Stand should tax otherwise-free Kinetic cards')
  const played = playCard(state, { card: getCard('basic-massage'), side: 'player', getCard })
  assert.equal(played.playerSupplies, 0, 'the Static Stand tax should be paid by the engine')
}

{
  let state = { ...base(), playerHand: ['baron-blister'], playerDeck: ['toe-cramp','mild-fissures'], playerDiscard: [] }
  state = playCard(state, { card: getCard('baron-blister'), side: 'player', getCard, deferSearch: true })
  state = resolveDeckSearch(state, { deckIndex: 1, getCard, random: () => .5 })
  assert.equal(state.playerHand.includes('mild-fissures'), true, 'Baron should retrieve a Surface Condition')
}

{
  let state = { ...base(), playerHand: ['orthotic-inserts'], playerSupplies: 3, opponentBoard: ['narrow-box'], opponentDiscard: [] }
  state = playCard(state, { card: getCard('orthotic-inserts'), side: 'player', getCard })
  assert.equal(state.opponentBoard.includes('narrow-box'), false, 'Orthotic Inserts should remove an opposing Shoe Attribute')
  assert.equal(state.opponentDiscard.includes('narrow-box'), true, 'the removed Influence should enter its owner’s discard')
}

{
  const starting = { ...base(), playerHand: ['orthotic-inserts'], playerBoard: [], playerDiscard: [], playerSupplies: 3, opponentBoard: ['narrow-box','hard-floors',null], opponentDiscard: [] }
  let state = playCard(starting, { card: getCard('orthotic-inserts'), side: 'player', getCard, deferRemoval: true })
  assert.equal(state.pendingInfluenceRemoval?.sourceCardId, 'orthotic-inserts', 'Orthotic Inserts should pause when multiple removal targets are available')
  state = resolveInfluenceRemoval(state, { slotIndex: 1, getCard })
  assert.equal(state.opponentBoard[0], 'narrow-box', 'the unselected opposing Influence should remain')
  assert.equal(state.opponentBoard[1], null, 'the selected opposing Influence should be removed')
  assert.equal(state.opponentDiscard.includes('hard-floors'), true, 'the selected Influence should enter its owner’s discard')

  let cancelled = playCard(starting, { card: getCard('orthotic-inserts'), side: 'player', getCard, deferRemoval: true })
  cancelled = cancelInfluenceRemoval(cancelled)
  assert.equal(cancelled.playerHand.includes('orthotic-inserts'), true, 'cancelling removal should return Orthotic Inserts to hand')
  assert.deepEqual(cancelled.playerBoard, starting.playerBoard, 'cancelling removal should undo its provisional board placement')
  assert.equal(cancelled.playerSupplies, starting.playerSupplies, 'cancelling removal should refund its Supply cost')
}

console.log('Game engine and computer-player regression checks passed.')
