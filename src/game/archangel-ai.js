import { eligibleTargets, playCard } from './engine.js'

const reductionFor = (card) => ['hydro-bandage', 'antifungal-cream'].includes(card.id)
  ? 4
  : ['comfort-stretch', 'heel-balm', 'proper-trimming'].includes(card.id) ? 3 : 2

const chooseCareTarget = (state, card, getCard) => [...eligibleTargets(state, card, getCard)].sort((a, b) => {
  const aRemoval = a.severity <= reductionFor(card) ? 1 : 0
  const bRemoval = b.severity <= reductionFor(card) ? 1 : 0
  return bRemoval - aRemoval || a.severity - b.severity
})[0]

const chooseDoctorTarget = (state, hand, getCard) => {
  const coveredSubtypes = new Set(hand.filter((card) => card?.type === 'Care Action').map((card) => card.subtype))
  return [...state.conditions].sort((a, b) => {
    const cardA = getCard(a.cardId), cardB = getCard(b.cardId)
    const layerA = a.layers?.[0] || a.severity, layerB = b.layers?.[0] || b.severity
    const removableA = layerA <= 2 ? 1 : 0, removableB = layerB <= 2 ? 1 : 0
    const uncoveredA = coveredSubtypes.has(cardA?.subtype) ? 0 : 1
    const uncoveredB = coveredSubtypes.has(cardB?.subtype) ? 0 : 1
    const priorityA = cardA?.id === 'mild-fissures' ? 2 : cardA?.id === 'morning-dagger' ? 1 : 0
    const priorityB = cardB?.id === 'mild-fissures' ? 2 : cardB?.id === 'morning-dagger' ? 1 : 0
    return removableB - removableA || uncoveredB - uncoveredA || priorityB - priorityA || b.severity - a.severity
  })[0]
}

const projectedDiscomfort = (state, getCard) => state.conditions.reduce((total, condition) => {
  const card = getCard(condition.cardId)
  return total + (card?.discomfort || 0) * (condition.copies || 1)
}, 0)

const affordableGenericCare = (state, cards, side, getCard) => {
  let supplies = state[`${side}Supplies`]
  return cards
    .filter((card) => card.type === 'Care Action' && !eligibleTargets(state, card, getCard).length)
    .sort((a, b) => a.cost - b.cost)
    .filter((card) => {
      if (card.cost > supplies) return false
      supplies -= card.cost
      return true
    })
}

const chooseGenericCare = (state, playable, side, difficulty, getCard) => {
  const generic = affordableGenericCare(state, playable, side, getCard)
  if (!generic.length) return null
  const neededToWin = state.maxComfort - state.comfort
  if (neededToWin > 0 && generic.length >= neededToWin) return generic[0]

  const discomfort = projectedDiscomfort(state, getCard)
  const neededToSurvive = Math.max(0, discomfort - state.comfort + 1)
  if (neededToSurvive > 0 && generic.length >= neededToSurvive) return generic[0]

  if (difficulty === 'training') return generic[0]
  if (difficulty === 'pressure' && state.comfort <= state.maxComfort / 2) return generic[0]
  return null
}

export function playArchangelTurn(state, getCard, difficulty = 'executive', side = 'opponent') {
  let next = state
  let guard = 0

  while (!next.result && guard++ < 20) {
    const hand = next[`${side}Hand`].map(getCard).filter(Boolean)
    const playable = hand.filter((card) => card.cost <= next[`${side}Supplies`])
    const matchingCare = playable.find((card) => card.type === 'Care Action' && eligibleTargets(next, card, getCard).length)
    const doctor = playable.find((card) => card.id === 'dr-honeyfoot' && next.conditions.length)
    const socks = playable.find((card) => card.id === 'fresh-socks' && next.conditions.some((condition) => ['Surface', 'Microbial'].includes(getCard(condition.cardId)?.subtype)))
    const genericCare = chooseGenericCare(next, playable, side, difficulty, getCard)
    const careKit = playable.find((card) => card.id === 'care-kit')
    const card = matchingCare || doctor || socks || genericCare || careKit
    if (!card) break

    const target = card.id === 'dr-honeyfoot'
      ? chooseDoctorTarget(next, hand, getCard)
      : chooseCareTarget(next, card, getCard)
    const resolved = playCard(next, { card, side, getCard, targetKey: target?.key })
    if (resolved === next) break
    next = resolved
  }

  return next
}
