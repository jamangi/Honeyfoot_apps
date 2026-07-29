import { conditionPlayStatus } from './engine.js'

export const TEST_DIFFICULTIES = {
  training: {
    label: 'Training',
    description: 'Plays available Conditions readily, but may introduce liabilities unnecessarily.',
  },
  pressure: {
    label: 'Pressure',
    description: 'Reinforces successful Conditions and maintains steady pressure.',
  },
  executive: {
    label: 'Executive',
    description: 'Protects advantageous positions and avoids unnecessary liabilities.',
  },
}

const legalConditions = (state, cards) => cards.filter((card) => card?.type === 'Condition' && conditionPlayStatus(state, card, 'opponent').allowed)
const existingStack = (state, card) => state.conditions.find((condition) => condition.cardId === card.id)
const conditionScore = (state, card) => {
  const stack = existingStack(state, card)
  return (stack ? 100 : 0) + (card.severity || 0) * 5 + (card.discomfort || 0) * 3 + (stack?.severity || 0)
}
const publicAnswerExhaustion = (state, card, getCard) => state.playerDiscard
  .map(getCard)
  .filter((discarded) => discarded?.type === 'Care Action' && discarded.subtype === card.subtype)
  .length

export function selectCallusCard(state, getCard, difficulty = 'training') {
  const hand = state.opponentHand.map(getCard).filter(Boolean)
  const conditions = legalConditions(state, hand)
  const influences = hand.filter((card) => card.type !== 'Condition')

  if (difficulty === 'training') return conditions[0] || influences[0] || null

  const rankedConditions = [...conditions].sort((a, b) => conditionScore(state, b) - conditionScore(state, a))
  if (difficulty === 'pressure') return rankedConditions[0] || influences[0] || null

  const executiveRanking = [...conditions].sort((a, b) => {
    const stackDifference = Number(Boolean(existingStack(state, b))) - Number(Boolean(existingStack(state, a)))
    return stackDifference || publicAnswerExhaustion(state, b, getCard) - publicAnswerExhaustion(state, a, getCard) || conditionScore(state, b) - conditionScore(state, a)
  })
  const reinforcement = executiveRanking.find((card) => existingStack(state, card))
  if (reinforcement) return reinforcement
  return executiveRanking[0] || influences[0] || null
}
