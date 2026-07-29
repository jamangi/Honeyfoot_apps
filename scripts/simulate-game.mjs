import { conditionPlayStatus, createMatchState, createSeededRandom, eligibleTargets, finishRound, playCard } from '../src/game/engine.js'
import { selectCallusCard, TEST_DIFFICULTIES } from '../src/game/callus-ai.js'

const cards = [
  ['basic-massage','Basic Massage','archangels','Care Action','Structural',0,0,0],
  ['comfort-stretch','Comfort Stretch','archangels','Care Action','Structural',0,0,0],
  ['heel-balm','Heavy Heel Balm','archangels','Care Action','Surface',1,0,0],
  ['hydro-bandage','Hydrocolloid Bandage','archangels','Care Action','Surface',1,0,0],
  ['antifungal-cream','Targeted Cream','archangels','Care Action','Microbial',1,0,0],
  ['proper-trimming','Proper Trimming','archangels','Care Action','Keratin',1,0,0],
  ['care-kit','Everyday Care Kit','archangels','Equipment',null,2,0,0],
  ['dr-honeyfoot','Dr. Honeyfoot','archangels','Supporter',null,0,0,0],
  ['fresh-socks','Fresh Breathable Socks','archangels','Environment','Surface',1,0,0],
  ['mild-fissures','Mild Heel Fissures','callus','Condition','Surface',0,4,1],
  ['friction-blister','Friction Blister','callus','Condition','Surface',0,3,1],
  ['webbing-itch','Webbing Itch','callus','Condition','Microbial',0,4,1],
  ['morning-dagger','The Morning Dagger','callus','Condition','Structural',0,6,1],
  ['toe-cramp','Toe Cramp','callus','Condition','Structural',0,3,1],
  ['narrow-box','Aggressive Taper','callus','Shoe Attribute','Structural',0,0,0],
  ['chronic-dampness','Chronic Dampness','callus','Habit','Microbial',0,0,0],
  ['hard-floors','Commercial Hard Floors','callus','Hazard','Structural',0,0,0],
  ['haider','Haider','callus','Supporter',null,0,0,0],
].map(([id,name,faction,type,subtype,cost,severity,discomfort]) => ({ id,name,faction,type,subtype,cost,severity,discomfort }))
const getCard = (id) => cards.find((card) => card.id === id)
const archangelDeck = { name: 'Everyday Comfort', faction: 'archangels', cards: { 'basic-massage':3,'comfort-stretch':3,'heel-balm':3,'hydro-bandage':3,'antifungal-cream':3,'proper-trimming':3,'care-kit':2,'dr-honeyfoot':2,'fresh-socks':2 } }
const callusDeck = { name: 'Pressure & Friction', faction: 'callus', cards: { 'mild-fissures':3,'friction-blister':3,'webbing-itch':3,'morning-dagger':3,'toe-cramp':3,'narrow-box':3,'chronic-dampness':2,'hard-floors':2,haider:2 } }

function reductionFor(card) { return ['hydro-bandage','antifungal-cream'].includes(card.id) ? 4 : ['comfort-stretch','heel-balm','proper-trimming'].includes(card.id) ? 3 : 2 }
function chooseTarget(state, card) {
  const targets = eligibleTargets(state, card, getCard)
  return [...targets].sort((a,b) => {
    const aKill = a.severity <= reductionFor(card) ? 1 : 0, bKill = b.severity <= reductionFor(card) ? 1 : 0
    return bKill - aKill || a.severity - b.severity
  })[0]
}
function currentDiscomfort(state) {
  const protectedSubtype = state.playerBoard.includes('fresh-socks') ? ['Surface','Microbial'] : []
  let protectionAvailable = protectedSubtype.length > 0
  return state.conditions.reduce((total, condition) => {
    const card = getCard(condition.cardId)
    const raw = (card?.discomfort || 0) * (condition.copies || 1)
    if (protectionAvailable && protectedSubtype.includes(card?.subtype)) {
      protectionAvailable = false
      return total + Math.max(0, raw - (card?.discomfort || 0))
    }
    return total + raw
  }, 0)
}
function genericCarePlan(state, playable) {
  const generic = playable
    .filter((card) => card.type === 'Care Action' && !eligibleTargets(state,card,getCard).length)
    .sort((a,b) => a.cost - b.cost)
  let supplies = state.playerSupplies
  const affordable = generic.filter((card) => {
    if (card.cost > supplies) return false
    supplies -= card.cost
    return true
  })
  const neededToWin = state.maxComfort - state.comfort
  if (neededToWin > 0 && affordable.length >= neededToWin) return affordable[0]
  const neededToSurvive = Math.max(0, currentDiscomfort(state) - state.comfort + 1)
  if (neededToSurvive > 0 && affordable.length >= neededToSurvive) return affordable[0]
  return null
}
function chooseDoctorTarget(state, hand) {
  const coveredSubtypes = new Set(hand.filter((card) => card?.type === 'Care Action').map((card) => card.subtype))
  return [...state.conditions].sort((a,b) => {
    const cardA = getCard(a.cardId), cardB = getCard(b.cardId)
    const layerA = a.layers?.[0] || a.severity, layerB = b.layers?.[0] || b.severity
    const peelsA = layerA <= 2 ? 1 : 0, peelsB = layerB <= 2 ? 1 : 0
    const uncoveredA = coveredSubtypes.has(cardA?.subtype) ? 0 : 1
    const uncoveredB = coveredSubtypes.has(cardB?.subtype) ? 0 : 1
    const priorityA = cardA?.id === 'mild-fissures' ? 2 : cardA?.id === 'morning-dagger' ? 1 : 0
    const priorityB = cardB?.id === 'mild-fissures' ? 2 : cardB?.id === 'morning-dagger' ? 1 : 0
    return peelsB - peelsA || uncoveredB - uncoveredA || priorityB - priorityA || b.severity - a.severity
  })[0]
}
function archangelTurn(state) {
  let next = state, guard = 0
  while (!next.result && guard++ < 20) {
    const hand = next.playerHand.map(getCard)
    const playable = hand.filter((card) => card && card.cost <= next.playerSupplies)
    const matching = playable.filter((card) => card.type === 'Care Action' && eligibleTargets(next,card,getCard).length)
    const doctor = playable.find((card) => card.id === 'dr-honeyfoot' && next.conditions.length)
    const socks = playable.find((card) => card.id === 'fresh-socks' && next.conditions.some((condition) => ['Surface','Microbial'].includes(getCard(condition.cardId).subtype)))
    const kit = playable.find((card) => card.id === 'care-kit')
    const genericCare = genericCarePlan(next, playable)
    const card = matching[0] || doctor || socks || genericCare || kit
    if (!card) break
    const target = card.id === 'dr-honeyfoot' ? chooseDoctorTarget(next, hand) : chooseTarget(next, card)
    const resolved = playCard(next,{card,side:'player',getCard,targetKey:target?.key})
    if (resolved === next) break
    next = resolved
  }
  return next
}
function callusTurn(state, difficulty) {
  const card = selectCallusCard(state, getCard, difficulty)
  return card ? playCard(state,{card,side:'opponent',getCard}) : state
}
function run(seed, difficulty) {
  let state = createMatchState({playerDeck:archangelDeck,opponentDeck:callusDeck,maxComfort:16,startingComfortRatio:.5,random:createSeededRandom(seed)})
  while (!state.result && state.round <= 50) {
    state = archangelTurn(state)
    if (state.result) break
    state = callusTurn(state, difficulty)
    if (state.result) break
    state = finishRound(state,{playerFaction:'archangels',opponentFaction:'callus',getCard})
  }
  return state
}

const average = (values) => values.reduce((sum,value) => sum + value,0) / values.length
const summarize = (results) => ({
  simulations: results.length,
  wins: { archangels: results.filter((r) => r.result === 'archangels').length, callus: results.filter((r) => r.result === 'callus').length, unresolved: results.filter((r) => !r.result).length },
  averageRounds: Number(average(results.map((r) => r.round)).toFixed(2)),
  medianRounds: results.map((r) => r.round).sort((a,b)=>a-b)[49],
  averageFinalComfort: Number(average(results.map((r) => r.comfort)).toFixed(2)),
  averageArchangelCardsPlayed: Number(average(results.map((r) => r.metrics.cardsPlayed.player)).toFixed(2)),
  averageCallusCardsPlayed: Number(average(results.map((r) => r.metrics.cardsPlayed.opponent)).toFixed(2)),
  averageDeadCarePlays: Number(average(results.map((r) => r.metrics.deadCarePlays)).toFixed(2)),
  averageConditionTriggers: Number(average(results.map((r) => r.metrics.conditionTriggers)).toFixed(2)),
  averageConditionsAtEnd: Number(average(results.map((r) => r.conditions.length)).toFixed(2)),
  averageFinalArchangelHand: Number(average(results.map((r) => r.playerHand.length)).toFixed(2)),
  averageFinalCallusHand: Number(average(results.map((r) => r.opponentHand.length)).toFixed(2)),
  comfortByRound: Array.from({length:10},(_,index) => { const values=results.map((r)=>r.metrics.comfortHistory[index]).filter((v)=>v!==undefined); return values.length ? Number(average(values).toFixed(2)) : null }),
  archangelHandByRound: Array.from({length:10},(_,index) => { const values=results.map((r)=>r.metrics.handHistory[index]?.player).filter((v)=>v!==undefined); return values.length ? Number(average(values).toFixed(2)) : null }),
})
const report = Object.fromEntries(Object.keys(TEST_DIFFICULTIES).map((difficulty) => {
  const results = Array.from({length:100},(_,index) => run(index + 1, difficulty))
  return [difficulty, summarize(results)]
}))
console.log(JSON.stringify(report,null,2))
