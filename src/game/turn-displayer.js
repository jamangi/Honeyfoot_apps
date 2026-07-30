import { finishRound, playCard } from './engine.js'
import { playArchangelTurn } from './archangel-ai.js'
import { selectCallusCard } from './callus-ai.js'

const event = (type, state, details = {}) => ({ type, state, actor: 'system', duration: 700, ...details })

function cardDestination(card) {
  if (card.type === 'Condition') return 'condition-zone'
  if (['Equipment', 'Environment', 'Habit', 'Hazard', 'Shoe Attribute'].includes(card.type)) return 'influence-zone'
  return 'discard'
}

// Produce a deterministic visual transcript while the game engine stays synchronous.
export function buildOpponentTurnTranscript({ state, playerFaction, opponentFaction, difficulty, getCard, tutorial = false }) {
  let next = { ...state }
  const events = [event('turn-start', next, { actor: 'opponent', title: "Opponent's turn", detail: 'The opponent is considering their options.', duration: 620 })]
  const recordPlay = ({ state: playedState, card }) => {
    next = playedState
    events.push(event('card-play', next, {
      actor: 'opponent', cardId: card.id, title: card.name, detail: card.text, duration: 1450,
      movement: { from: 'opponent-hand', to: cardDestination(card) },
    }))
  }

  if (opponentFaction === 'archangels') {
    next = playArchangelTurn(next, getCard, difficulty, 'opponent', { maxCards: tutorial ? 1 : Infinity, onStep: recordPlay })
  } else {
    const chosenCard = selectCallusCard(next, getCard, difficulty)
    if (chosenCard) {
      next = playCard(next, { card: chosenCard, side: 'opponent', getCard })
      recordPlay({ state: next, card: chosenCard })
    }
  }

  if (!next.result) {
    const completed = finishRound(next, { playerFaction, opponentFaction, getCard })
    const careEntry = [...completed.log].reverse().find((entry) => entry.phase === 'Care check')
    events.push(event('care-check', completed, { title: 'Care Check', detail: careEntry?.text || 'The board has been checked.', duration: 900 }))
    events.push(event('draw', completed, { title: 'Draw', detail: 'Both players draw a card for the new round.', duration: 700, movement: { from: 'deck', to: 'hand' } }))
    next = completed
  }

  events.push(event(next.result ? 'match-end' : 'turn-end', next, next.result
    ? { title: 'Match complete', detail: 'The Comfort Level has reached its goal.', duration: 750 }
    : { title: 'Your turn', detail: 'The opponent has passed the turn.', duration: 620 }))
  return events
}

export function turnEventDelay(turnEvent, settings, reducedMotion) {
  const speedScale = settings.speed === 'relaxed' ? 2.7 : settings.speed === 'quick' ? 1 : 1.35
  if (settings.skip) return 35
  const duration = turnEvent.duration * speedScale
  return reducedMotion ? Math.min(360, duration) : duration
}
