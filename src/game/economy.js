export const MAX_FACTION_LEVEL = 30

export const DIFFICULTY_REWARD_MODIFIERS = Object.freeze({
  training: 0.6,
  pressure: 0.8,
  executive: 1,
})

export const winsRequiredForNextLevel = (level) => Math.round(6 + 0.75 * (Math.max(1, level) - 1))

export const xpRequiredForNextLevel = (level) => level >= MAX_FACTION_LEVEL
  ? 0
  : winsRequiredForNextLevel(level) * 100

export function matchRewards({ won, difficulty, opponentLevel, playerLevel }) {
  const difficultyModifier = DIFFICULTY_REWARD_MODIFIERS[difficulty] || DIFFICULTY_REWARD_MODIFIERS.training
  const levelModifier = Math.max(0.01, Math.min(1, opponentLevel / Math.max(1, playerLevel)))
  const fullReward = Math.max(1, Math.round(100 * difficultyModifier * levelModifier))
  return {
    xp: won ? fullReward : 0,
    gold: won ? fullReward : Math.max(1, Math.round(fullReward * 0.25)),
    difficultyModifier,
    levelModifier,
  }
}

export function applyFactionExperience(progression, earnedXp) {
  const previousLevel = progression.level
  const wasPlayingAtMaximum = progression.selectedLevel === previousLevel
  let level = previousLevel
  let xp = Math.max(0, progression.xp + earnedXp)

  while (level < MAX_FACTION_LEVEL) {
    const required = xpRequiredForNextLevel(level)
    if (xp < required) break
    xp -= required
    level += 1
  }

  if (level >= MAX_FACTION_LEVEL) xp = 0
  return {
    ...progression,
    level,
    xp,
    selectedLevel: wasPlayingAtMaximum ? level : Math.min(progression.selectedLevel, level),
  }
}
