import assert from 'node:assert/strict'
import { cancelDeckSearch, cancelInfluencePlacement, createMatchState, finishRound, playCard, resolveDeckSearch, resolveInfluencePlacement } from '../src/game/engine.js'

const cards = [
  { id: 'webbing-itch', name: 'Webbing Itch', faction: 'callus', type: 'Condition', subtype: 'Microbial', severity: 4, discomfort: 1, cost: 0 },
  { id: 'morning-dagger', name: 'The Morning Dagger', faction: 'callus', type: 'Condition', subtype: 'Structural', severity: 6, discomfort: 1, cost: 0 },
  { id: 'toe-cramp', name: 'Toe Cramp', faction: 'callus', type: 'Condition', subtype: 'Structural', severity: 3, discomfort: 1, cost: 0 },
  { id: 'chronic-dampness', name: 'Chronic Dampness', faction: 'callus', type: 'Habit', subtype: null, severity: 0, discomfort: 0, cost: 0 },
  { id: 'hard-floors', name: 'Commercial Hard Floors', faction: 'callus', type: 'Hazard', subtype: 'Structural', severity: 0, discomfort: 0, cost: 0 },
  { id: 'haider', name: 'Haider', faction: 'callus', type: 'Supporter', subtype: null, severity: 0, discomfort: 0, cost: 0 },
  { id: 'narrow-box', name: 'Aggressive Taper', faction: 'callus', type: 'Shoe Attribute', subtype: 'Structural', severity: 0, discomfort: 0, cost: 0 },
  { id: 'basic-massage', name: 'Basic Massage', faction: 'archangels', type: 'Care Action', subtype: 'Structural', severity: 0, discomfort: 0, cost: 0 },
  { id: 'care-kit', name: 'Everyday Care Kit', faction: 'archangels', type: 'Equipment', subtype: null, severity: 0, discomfort: 0, cost: 2 },
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

console.log('Callus influence regression checks passed.')
