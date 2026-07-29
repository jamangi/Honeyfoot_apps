export function createSeededRandom(seed = 1) {
  let value = seed >>> 0
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

export function shuffleCards(cards, random = Math.random) {
  const result = [...cards]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1))
    ;[result[index], result[swap]] = [result[swap], result[index]]
  }
  return result
}

export const expandDeck = (deck) => Object.entries(deck.cards).flatMap(([id, count]) => Array.from({ length: count }, () => id))
export const removeFromHand = (hand, id) => { const index = hand.indexOf(id); return index < 0 ? hand : [...hand.slice(0, index), ...hand.slice(index + 1)] }
const INFLUENCE_TYPES = ['Equipment', 'Environment', 'Shoe Attribute', 'Habit', 'Hazard']
export const isInfluenceCard = (card) => INFLUENCE_TYPES.includes(card?.type)
const normalizeInfluenceSlots = (board = []) => board.length === 3 ? [...board] : [...board.filter(Boolean).slice(0, 3), null, null, null].slice(0, 3)
const appendHandOrder = (state, side, ids) => {
  const key = `${side}HandOrder`
  const order = state[key] || [...new Set(state[`${side}Hand`] || [])]
  return { ...state, [key]: [...order, ...ids.filter((id) => !order.includes(id))] }
}

export function drawOne(deck, hand, faction) {
  return deck.length ? { deck: deck.slice(1), hand: [...hand, deck[0]], fallback: false }
    : { deck, hand: [...hand, faction === 'archangels' ? 'basic-massage' : 'hard-floors'], fallback: true }
}

export function resolveResult(state, maxComfort) {
  if (state.comfort <= 0) return { ...state, comfort: 0, result: 'callus' }
  if (state.comfort >= maxComfort) return { ...state, comfort: maxComfort, result: 'archangels' }
  return state
}

export function createMatchState({ playerDeck, opponentDeck, maxComfort = 16, startingComfortRatio = .5, random = Math.random, playerCardOrder = null, opponentCardOrder = null, openingHandSize = 5 }) {
  const playerCards = playerCardOrder ? [...playerCardOrder] : shuffleCards(expandDeck(playerDeck), random)
  const opponentCards = opponentCardOrder ? [...opponentCardOrder] : shuffleCards(expandDeck(opponentDeck), random)
  const playerOpeningHand = playerCards.slice(0, openingHandSize)
  const opponentOpeningHand = opponentCards.slice(0, openingHandSize)
  return {
    round: 1, comfort: maxComfort * startingComfortRatio, maxComfort,
    playerDeck: playerCards.slice(openingHandSize), playerHand: playerOpeningHand, playerHandOrder: [...new Set(playerOpeningHand)], playerDiscard: [], playerBoard: [null,null,null], playerSupplies: playerDeck.faction === 'archangels' ? 3 : 0,
    opponentDeck: opponentCards.slice(openingHandSize), opponentHand: opponentOpeningHand, opponentHandOrder: [...new Set(opponentOpeningHand)], opponentDiscard: [], opponentBoard: [null,null,null], opponentSupplies: opponentDeck.faction === 'archangels' ? 3 : 0,
    playerChronicDampnessCharges: 0, opponentChronicDampnessCharges: 0,
    conditions: [], playerConditionPlayed: false, opponentConditionPlayed: false,
    pendingSearch: null, pendingInfluence: null,
    log: [{ round: 1, phase: 'Setup', actor: 'system', text: `${playerDeck.name} faces ${opponentDeck.name}. Both players drew ${openingHandSize} cards.` }], result: null,
    metrics: { cardsPlayed: { player: 0, opponent: 0 }, deadCarePlays: 0, conditionTriggers: 0, comfortHistory: [maxComfort * startingComfortRatio], handHistory: [{ player: openingHandSize, opponent: openingHandSize }] },
  }
}

export function eligibleTargets(state, card, getCard) {
  return card.faction === 'archangels' && (card.type === 'Care Action' || card.id === 'dr-honeyfoot')
    ? state.conditions.filter((condition) => card.id === 'dr-honeyfoot' || getCard(condition.cardId)?.subtype === card.subtype) : []
}

export function conditionPlayStatus(state, card, side) {
  if (card.type !== 'Condition') return { allowed: true, reason: null }
  if (state[`${side}ConditionPlayed`]) return { allowed: false, reason: 'One Condition per turn' }
  const stack = state.conditions.find((condition) => condition.cardId === card.id)
  if (stack && stack.copies >= 2) return { allowed: false, reason: 'Condition stack is full' }
  if (!stack && state.conditions.length >= 3) return { allowed: false, reason: 'All Condition slots are full' }
  return { allowed: true, reason: null }
}

function reduceConditionStack(condition, reduction) {
  let remaining = reduction
  let removedCopies = 0
  const layers = []
  for (const originalLayer of condition.layers || [condition.severity]) {
    if (remaining <= 0) { layers.push(originalLayer); continue }
    if (remaining >= originalLayer) { remaining -= originalLayer; removedCopies += 1 }
    else { layers.push(originalLayer - remaining); remaining = 0 }
  }
  return { ...condition, layers, copies: layers.length, severity: layers.reduce((sum, layer) => sum + layer, 0), removedCopies }
}

function placeInfluence(state, { card, side, slotIndex }) {
  const boardKey = `${side}Board`, discardKey = `${side}Discard`, suppliesKey = `${side}Supplies`
  const slots = normalizeInfluenceSlots(state[boardKey])
  const replacedId = slots[slotIndex] || null
  slots[slotIndex] = card.id
  let next = { ...state, [boardKey]: slots, [discardKey]: replacedId ? [...state[discardKey], replacedId] : state[discardKey] }
  const dampKey = `${side}ChronicDampnessCharges`
  if (replacedId === 'chronic-dampness') next[dampKey] = Math.min(next[dampKey] || 0, slots.filter((id) => id === 'chronic-dampness').length)
  if (card.id === 'chronic-dampness') next[dampKey] = (next[dampKey] || 0) + 1
  return { next, replacedId }
}

export function playCard(state, { card, side, getCard, targetKey = null, deferSearch = false, deferInfluence = false }) {
  const isPlayer = side === 'player'
  const handKey = `${side}Hand`, discardKey = `${side}Discard`, boardKey = `${side}Board`, suppliesKey = `${side}Supplies`
  if (!state[handKey].includes(card.id)) return state
  if (card.faction === 'archangels' && card.cost > state[suppliesKey]) return state
  if (!conditionPlayStatus(state, card, side).allowed) return state
  let next = { ...state, metrics: { ...state.metrics, cardsPlayed: { ...state.metrics.cardsPlayed, [side]: state.metrics.cardsPlayed[side] + 1 } }, [handKey]: removeFromHand(state[handKey], card.id) }
  const logEntry = { round: state.round, phase: isPlayer ? 'Your turn' : "Opponent's turn", actor: side, cardId: card.id, text: `${isPlayer ? 'You played' : 'Opponent played'} ${card.name}.` }
  if (card.id === 'fountain-youth') return resolveResult({ ...next, comfort: state.maxComfort, [discardKey]: [...next[discardKey], card.id], log: [...next.log, logEntry] }, state.maxComfort)
  if (card.id === 'eternity') return resolveResult({ ...next, comfort: 0, [discardKey]: [...next[discardKey], card.id], log: [...next.log, logEntry] }, state.maxComfort)
  if (card.faction === 'archangels') next[suppliesKey] -= card.cost
  const resolutionEntries = []
  let honeyfootDrawnId = null
  if (card.type === 'Condition') {
    const pressureBonus = next[boardKey].includes('narrow-box') && ['Surface', 'Structural'].includes(card.subtype) ? 1 : 0
    const dampChargeKey = `${side}ChronicDampnessCharges`
    const usesDampCharge = card.subtype === 'Microbial' && (next[dampChargeKey] || 0) > 0
    const dampBonus = usesDampCharge ? 2 : 0
    if (usesDampCharge) {
      next[dampChargeKey] -= 1
      resolutionEntries.push({ round: state.round, phase: logEntry.phase, actor: side, cardId: 'chronic-dampness', text: `Chronic Dampness gave ${card.name} +2 Severity.` })
    }
    const layerSeverity = card.severity + pressureBonus + dampBonus
    const existingStack = next.conditions.find((condition) => condition.cardId === card.id)
    next.conditions = existingStack
      ? next.conditions.map((condition) => condition.key === existingStack.key ? { ...condition, layers: [...(condition.layers || [condition.severity]), layerSeverity], copies: condition.copies + 1, severity: condition.severity + layerSeverity } : condition)
      : [...next.conditions, { key: `${card.id}-${state.round}-${next.metrics.cardsPlayed[side]}`, cardId: card.id, layers: [layerSeverity], copies: 1, severity: layerSeverity, owner: side }]
    next[`${side}ConditionPlayed`] = true
  } else if (card.type === 'Care Action' || card.type === 'Supporter') {
    const targetIndex = next.conditions.findIndex((condition) => targetKey ? condition.key === targetKey : card.id === 'dr-honeyfoot' || (card.type === 'Care Action' && getCard(condition.cardId)?.subtype === card.subtype))
    let severityRemoved = 0
    if (targetIndex >= 0 && card.faction === 'archangels') {
      const baseReduction = ['hydro-bandage', 'antifungal-cream'].includes(card.id) ? 4 : ['comfort-stretch', 'heel-balm', 'proper-trimming'].includes(card.id) ? 3 : 2
      const targetCard = getCard(next.conditions[targetIndex].cardId)
      const kineticBonus = targetCard?.id === 'toe-cramp' && (card.traits?.includes('Kinetic') || ['basic-massage','comfort-stretch'].includes(card.id)) ? 1 : 0
      const precisionBonus = targetCard?.id === 'spiking-corner' && (card.traits?.includes('Precision') || card.id === 'proper-trimming') ? 1 : 0
      const reduction = baseReduction + kineticBonus + precisionBonus
      const reduced = reduceConditionStack(next.conditions[targetIndex], reduction)
      severityRemoved = next.conditions[targetIndex].severity - reduced.severity
      if (card.type === 'Care Action') resolutionEntries.push({ round: state.round, phase: logEntry.phase, actor: side, cardId: card.id, text: `${card.name} removed ${severityRemoved} Severity${kineticBonus ? ' (including +1 against Toe Cramp)' : precisionBonus ? ' (including +1 against The Spiking Corner)' : ''} and restored ${severityRemoved} Comfort.` })
      next.conditions = next.conditions.map((condition, index) => index === targetIndex ? reduced : condition).filter((condition) => condition.copies > 0)
      next[discardKey] = [...next[discardKey], card.id, ...Array.from({ length: reduced.removedCopies }, () => reduced.cardId)]
    } else {
      if (card.type === 'Care Action') { next.comfort += 1; next.metrics = { ...next.metrics, deadCarePlays: next.metrics.deadCarePlays + 1 }; resolutionEntries.push({ round: state.round, phase: logEntry.phase, actor: side, cardId: card.id, text: `${card.name} had no legal target and restored 1 Comfort.` }) }
      next[discardKey] = [...next[discardKey], card.id]
    }
    if (card.type === 'Care Action' && targetIndex >= 0) next.comfort += severityRemoved
    if (card.id === 'dr-honeyfoot') { const draw = drawOne(next[`${side}Deck`], next[`${side}Hand`], card.faction); honeyfootDrawnId = draw.hand.at(-1); next[`${side}Deck`] = draw.deck; next[`${side}Hand`] = draw.hand; next = appendHandOrder(next, side, [honeyfootDrawnId]) }
    if (card.id === 'haider') {
      const deckKey = `${side}Deck`
      const shoeIndex = next[deckKey].findIndex((id) => getCard(id)?.type === 'Shoe Attribute')
      if (deferSearch) next.pendingSearch = {
        side, sourceCardId: card.id, cardType: 'Shoe Attribute', maxSelections: 1,
        logLengthBefore: state.log.length,
        discardLengthBefore: state[discardKey].length,
        suppliesBefore: state[suppliesKey],
        cardsPlayedBefore: state.metrics.cardsPlayed[side],
      }
      else if (shoeIndex >= 0) {
        const shoeId = next[deckKey][shoeIndex]
        next[deckKey] = [...next[deckKey].slice(0, shoeIndex), ...next[deckKey].slice(shoeIndex + 1)]
        next[handKey] = [...next[handKey], shoeId]
        next = appendHandOrder(next, side, [shoeId])
        resolutionEntries.push({ round: state.round, phase: logEntry.phase, actor: side, cardId: shoeId, text: `${card.name} revealed ${getCard(shoeId).name}, added it to ${isPlayer ? 'your' : 'the opponent’s'} hand, then shuffled the deck.`, details: [{ cardId: shoeId, visibility: 'public', text: `Revealed ${getCard(shoeId).name}.` }] })
      } else resolutionEntries.push({ round: state.round, phase: logEntry.phase, actor: side, cardId: card.id, text: `${card.name} found no Shoe Attribute in the deck.` })
    }
  } else if (isInfluenceCard(card)) {
    if (deferInfluence) next.pendingInfluence = {
      side, cardId: card.id,
      logLengthBefore: state.log.length,
      suppliesBefore: state[suppliesKey],
      cardsPlayedBefore: state.metrics.cardsPlayed[side],
    }
    else {
      const slots = normalizeInfluenceSlots(next[boardKey])
      const openSlot = slots.findIndex((id) => !id)
      const placed = placeInfluence(next, { card, side, slotIndex: openSlot >= 0 ? openSlot : 0 })
      next = placed.next
      if (placed.replacedId) resolutionEntries.push({ round: state.round, phase: logEntry.phase, actor: side, cardId: placed.replacedId, text: `${card.name} replaced ${getCard(placed.replacedId).name}.` })
    }
  } else next[discardKey] = [...next[discardKey], card.id]
  const extra = card.id === 'dr-honeyfoot' ? [{ round: state.round, phase: logEntry.phase, actor: side, cardId: card.id, text: `${isPlayer ? 'You drew' : 'Opponent drew'} a card with Dr. Honeyfoot.`, details: honeyfootDrawnId ? [{ cardId: honeyfootDrawnId, visibility: side, text: `${isPlayer ? 'You drew' : 'Opponent drew'} ${getCard(honeyfootDrawnId)?.name || 'a card'}.` }] : [] }] : []
  return resolveResult({ ...next, log: [...next.log, logEntry, ...resolutionEntries, ...extra] }, state.maxComfort)
}

export function resolveInfluencePlacement(state, { slotIndex, getCard }) {
  const pending = state.pendingInfluence
  if (!pending || slotIndex < 0 || slotIndex > 2) return state
  const card = getCard(pending.cardId)
  if (!card) return state
  const placed = placeInfluence({ ...state, pendingInfluence: null }, { card, side: pending.side, slotIndex })
  const text = placed.replacedId ? `${card.name} replaced ${getCard(placed.replacedId).name} in Influence slot ${slotIndex + 1}.` : `${card.name} entered Influence slot ${slotIndex + 1}.`
  return { ...placed.next, log: [...placed.next.log, { round: state.round, phase: pending.side === 'player' ? 'Your turn' : "Opponent's turn", actor: pending.side, cardId: card.id, text }] }
}

export function cancelInfluencePlacement(state) {
  const pending = state.pendingInfluence
  if (!pending) return state
  const handKey = `${pending.side}Hand`, suppliesKey = `${pending.side}Supplies`
  const resolved = {
    ...state,
    [handKey]: [...state[handKey], pending.cardId],
    [suppliesKey]: pending.suppliesBefore,
    pendingInfluence: null,
    metrics: { ...state.metrics, cardsPlayed: { ...state.metrics.cardsPlayed, [pending.side]: pending.cardsPlayedBefore } },
    log: state.log.slice(0, pending.logLengthBefore),
  }
  return appendHandOrder(resolved, pending.side, [pending.cardId])
}

export function resolveDeckSearch(state, { deckIndex = null, getCard, random = Math.random }) {
  const search = state.pendingSearch
  if (!search) return state
  const deckKey = `${search.side}Deck`, handKey = `${search.side}Hand`
  const selectedId = Number.isInteger(deckIndex) ? state[deckKey][deckIndex] : null
  const validSelection = selectedId && getCard(selectedId)?.type === search.cardType
  const remainingDeck = validSelection ? [...state[deckKey].slice(0, deckIndex), ...state[deckKey].slice(deckIndex + 1)] : [...state[deckKey]]
  const actorLabel = search.side === 'player' ? 'You' : 'Opponent'
  const resultText = validSelection
    ? `${actorLabel} revealed ${getCard(selectedId).name}, added it to ${search.side === 'player' ? 'your' : 'the opponent’s'} hand, then shuffled the deck.`
    : `${actorLabel} completed the search without finding a ${search.cardType}.`
  const resolved = {
    ...state,
    [deckKey]: shuffleCards(remainingDeck, random),
    [handKey]: validSelection ? [...state[handKey], selectedId] : state[handKey],
    pendingSearch: null,
    log: [...state.log, { round: state.round, phase: search.side === 'player' ? 'Your turn' : "Opponent's turn", actor: search.side, cardId: validSelection ? selectedId : search.sourceCardId, text: resultText, details: validSelection ? [{ cardId: selectedId, visibility: 'public', text: `Revealed ${getCard(selectedId).name}.` }] : [] }],
  }
  return validSelection ? appendHandOrder(resolved, search.side, [selectedId]) : resolved
}

export function cancelDeckSearch(state) {
  const search = state.pendingSearch
  if (!search) return state
  const handKey = `${search.side}Hand`, discardKey = `${search.side}Discard`, suppliesKey = `${search.side}Supplies`
  return {
    ...state,
    [handKey]: [...state[handKey], search.sourceCardId],
    [discardKey]: state[discardKey].slice(0, search.discardLengthBefore),
    [suppliesKey]: search.suppliesBefore,
    pendingSearch: null,
    metrics: { ...state.metrics, cardsPlayed: { ...state.metrics.cardsPlayed, [search.side]: search.cardsPlayedBefore } },
    log: state.log.slice(0, search.logLengthBefore),
  }
}

export function finishRound(state, { playerFaction, opponentFaction, getCard }) {
  if (state.result) return state
  let next = { ...state }
  const archangelSide = playerFaction === 'archangels' ? 'player' : 'opponent'
  const callusSide = playerFaction === 'callus' ? 'player' : 'opponent'
  const boardKey = `${archangelSide}Board`, discardKey = `${archangelSide}Discard`
  const callusBoardKey = `${callusSide}Board`
  const playerKitSupply = playerFaction === 'archangels' ? next.playerBoard.filter((id) => id === 'care-kit').length : 0
  const opponentKitSupply = opponentFaction === 'archangels' ? next.opponentBoard.filter((id) => id === 'care-kit').length : 0
  const chronicDampnessActive = next[callusBoardKey].includes('chronic-dampness')
  const hardFloorsActive = next[callusBoardKey].includes('hard-floors')
  const socksIndex = next[boardKey].indexOf('fresh-socks')
  const protectedCondition = socksIndex >= 0 ? next.conditions.find((condition) => ['Surface', 'Microbial'].includes(getCard(condition.cardId)?.subtype)) : null
  const webbingBonus = chronicDampnessActive ? next.conditions.reduce((total, condition) => condition.cardId === 'webbing-itch' ? total + (getCard(condition.cardId)?.discomfort || 0) * (condition.copies || 1) : total, 0) : 0
  const structuralFloorBonus = hardFloorsActive && next.conditions.some((condition) => getCard(condition.cardId)?.subtype === 'Structural') ? 1 : 0
  const raw = next.conditions.reduce((total, condition) => total + (getCard(condition.cardId)?.discomfort || 0) * (condition.copies || 1), 0) + webbingBonus + structuralFloorBonus
  const prevented = protectedCondition ? (getCard(protectedCondition.cardId)?.discomfort || 0) : 0
  const discomfort = Math.max(0, raw - prevented)
  if (protectedCondition) { next[boardKey] = normalizeInfluenceSlots(next[boardKey]).map((id, index) => index === socksIndex ? null : id); next[discardKey] = [...next[discardKey], 'fresh-socks'] }
  const playerDraw = drawOne(next.playerDeck, next.playerHand, playerFaction), opponentDraw = drawOne(next.opponentDeck, next.opponentHand, opponentFaction)
  const playerDrawnId = playerDraw.hand.at(-1), opponentDrawnId = opponentDraw.hand.at(-1)
  next = { ...next, round: next.round + 1, comfort: next.comfort - discomfort, playerConditionPlayed: false, opponentConditionPlayed: false,
    playerDeck: playerDraw.deck, playerHand: playerDraw.hand, opponentDeck: opponentDraw.deck, opponentHand: opponentDraw.hand,
    playerSupplies: next.playerSupplies + (playerFaction === 'archangels' ? 1 + playerKitSupply : 0), opponentSupplies: next.opponentSupplies + (opponentFaction === 'archangels' ? 1 + opponentKitSupply : 0),
    metrics: { ...next.metrics, conditionTriggers: next.metrics.conditionTriggers + raw, comfortHistory: [...next.metrics.comfortHistory, Math.max(0, next.comfort - discomfort)], handHistory: [...next.metrics.handHistory, { player: playerDraw.hand.length, opponent: opponentDraw.hand.length }] },
    log: [...next.log,
      ...(webbingBonus ? [{ round: next.round, phase: 'Care check', actor: callusSide, cardId: 'chronic-dampness', text: `Chronic Dampness made Webbing Itch trigger twice, adding ${webbingBonus} Discomfort. This effect does not stack.` }] : []),
      ...(structuralFloorBonus ? [{ round: next.round, phase: 'Care check', actor: callusSide, cardId: 'hard-floors', text: 'Commercial Hard Floors dealt 1 Discomfort because a Structural Condition was in play.' }] : []),
      ...(protectedCondition ? [{ round: next.round, phase: 'Care check', actor: archangelSide, cardId: 'fresh-socks', text: `Fresh Breathable Socks prevented ${prevented} Discomfort from ${getCard(protectedCondition.cardId).name}.` }] : []),
      { round: next.round, phase: 'Care check', actor: 'system', text: discomfort ? `${next.conditions.length} active condition${next.conditions.length === 1 ? '' : 's'} reduced Comfort by ${discomfort}.` : 'No active Conditions reduced Comfort.' },
      ...(playerKitSupply ? [{ round: next.round + 1, phase: 'Start of turn', actor: 'player', cardId: 'care-kit', text: `${playerKitSupply} Everyday Care Kit${playerKitSupply === 1 ? '' : 's'} produced ${playerKitSupply} additional Supply.` }] : []),
      ...(opponentKitSupply ? [{ round: next.round + 1, phase: 'Start of turn', actor: 'opponent', cardId: 'care-kit', text: `${opponentKitSupply} opposing Everyday Care Kit${opponentKitSupply === 1 ? '' : 's'} produced ${opponentKitSupply} additional Supply.` }] : []),
      { round: next.round + 1, phase: 'Draw', actor: 'system', text: 'Both players drew a card.', details: [{ cardId: playerDrawnId, visibility: 'player', text: `You drew ${getCard(playerDrawnId)?.name || 'a card'}.` }, { cardId: opponentDrawnId, visibility: 'opponent', text: `Opponent drew ${getCard(opponentDrawnId)?.name || 'a card'}.` }] }] }
  next = appendHandOrder(appendHandOrder(next, 'player', [playerDrawnId]), 'opponent', [opponentDrawnId])
  return resolveResult(next, state.maxComfort)
}
