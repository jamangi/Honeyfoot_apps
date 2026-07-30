import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { applyFactionExperience } from '../game/economy.js'

export const PLAYER_PROFILE_STORAGE_KEY = 'honeyfoot-player-profile'
export const PLAYER_PROFILE_VERSION = 8

const STARTER_CARD_IDS = [
  'basic-massage', 'comfort-stretch', 'heel-balm', 'hydro-bandage', 'antifungal-cream',
  'proper-trimming', 'care-kit', 'dr-honeyfoot', 'fresh-socks', 'mild-fissures',
  'friction-blister', 'webbing-itch', 'morning-dagger', 'toe-cramp', 'spiking-corner',
  'narrow-box', 'chronic-dampness', 'hard-floors', 'haider',
]

const defaultFootProfile = {
  version: 1,
  basics: {
    sex: 'unspecified',
    ageRange: 'adult',
    shoeSize: 9,
  },
  appearance: {
    tone: 42,
    undertone: 'warm',
    width: 50,
    thickness: 48,
    archHeight: 52,
    wrinkles: 20,
    toeSpread: 50,
  },
  lifestyle: {
    dailyPattern: 'mixed',
    athleticActivity: 'casual',
  },
}

export const initialPlayerProfile = {
  version: PLAYER_PROFILE_VERSION,
  identity: {
    name: '',
    avatarId: 'lily',
  },
  wallet: {
    petals: 0,
  },
  collection: {
    ownedCardIds: STARTER_CARD_IDS,
  },
  presentation: {
    theme: 'garden',
    animations: { speed: 'relaxed', skip: false, reducedMotion: 'system' },
  },
  progression: {
    archangels: { level: 1, selectedLevel: 1, xp: 0 },
    callus: { level: 1, selectedLevel: 1, xp: 0 },
    story: { chapterId: null, sceneId: null },
  },
  footProfile: defaultFootProfile,
}

const copyDefaults = () => JSON.parse(JSON.stringify(initialPlayerProfile))

function mergeStoredProfile(stored) {
  const defaults = copyDefaults()
  if (!stored || typeof stored !== 'object') return defaults

  return {
    ...defaults,
    ...stored,
    version: PLAYER_PROFILE_VERSION,
    identity: { ...defaults.identity, ...stored.identity },
    wallet: { ...defaults.wallet, ...stored.wallet },
    collection: {
      ...defaults.collection,
      ...stored.collection,
      ownedCardIds: Array.isArray(stored.collection?.ownedCardIds) ? [...new Set(stored.collection.ownedCardIds)] : defaults.collection.ownedCardIds,
    },
    presentation: {
      ...defaults.presentation,
      ...stored.presentation,
      animations: { ...defaults.presentation.animations, ...stored.presentation?.animations },
    },
    progression: {
      ...defaults.progression,
      ...stored.progression,
      archangels: { ...defaults.progression.archangels, ...stored.progression?.archangels },
      callus: { ...defaults.progression.callus, ...stored.progression?.callus },
      story: { ...defaults.progression.story, ...stored.progression?.story },
    },
    footProfile: {
      ...defaults.footProfile,
      ...stored.footProfile,
      basics: { ...defaults.footProfile.basics, ...stored.footProfile?.basics },
      appearance: { ...defaults.footProfile.appearance, ...stored.footProfile?.appearance },
      lifestyle: { ...defaults.footProfile.lifestyle, ...stored.footProfile?.lifestyle },
    },
  }
}

function loadPlayerProfile() {
  if (typeof window === 'undefined') return copyDefaults()

  try {
    const stored = JSON.parse(window.localStorage.getItem(PLAYER_PROFILE_STORAGE_KEY))
    const profile = mergeStoredProfile(stored)

    // Version 2 used the Care Studio foot as a temporary default before the
    // profile picker existed. Lily becomes the intentional first-run identity.
    if (stored?.version < 3 && stored?.identity?.avatarId === 'care-studio-foot') {
      profile.identity.avatarId = 'lily'
    }

    // Carry the prototype's original standalone balance into the unified wallet.
    const legacyWallet = window.localStorage.getItem('honeyfoot-card-currency')
    if (!stored?.wallet && legacyWallet !== null) {
      const legacyPetals = Number(legacyWallet)
      if (Number.isFinite(legacyPetals) && legacyPetals >= 0) profile.wallet.petals = legacyPetals
    } else if (stored?.version === 1 && stored.wallet?.petals === 0 && legacyWallet === null) {
      // Version 1 briefly treated a missing legacy value as zero during development.
      profile.wallet.petals = initialPlayerProfile.wallet.petals
    }

    // Version 4 begins the playable economy at a true level-one baseline.
    // Earlier versions used showcase values before rewards existed, so those
    // prototype balances should not carry into the progression system.
    if (stored?.version < 4) {
      profile.wallet.petals = 0
      profile.progression.archangels.level = 1
      profile.progression.callus.level = 1
    }

    // Preserve theme choices made before presentation settings joined the
    // unified player profile.
    if (!stored?.presentation) {
      const legacyTheme = window.localStorage.getItem('honeyfoot-card-theme')
      if (legacyTheme) profile.presentation.theme = legacyTheme
    }

    // Version 8 gives the unhurried presentation pace its intended role as
    // the default. Earlier profiles only inherited Standard during prototyping.
    if (stored?.version < 8) profile.presentation.animations.speed = 'relaxed'

    return profile
  } catch {
    return copyDefaults()
  }
}

export function playerProfileReducer(profile, action) {
  switch (action.type) {
    case 'identity/set':
      return { ...profile, identity: { ...profile.identity, [action.field]: action.value } }
    case 'wallet/add':
      return {
        ...profile,
        wallet: { ...profile.wallet, petals: Math.max(0, profile.wallet.petals + Number(action.amount || 0)) },
      }
    case 'wallet/set':
      return {
        ...profile,
        wallet: { ...profile.wallet, petals: Math.max(0, Number(action.petals) || 0) },
      }
    case 'progression/set-level':
      if (!['archangels', 'callus'].includes(action.faction)) return profile
      return {
        ...profile,
        progression: {
          ...profile.progression,
          [action.faction]: {
            ...profile.progression[action.faction],
            level: Math.max(1, Number(action.level) || 1),
          },
        },
      }
    case 'collection/buy-card': {
      const cardId = String(action.cardId || '')
      const price = Math.max(0, Number(action.price) || 0)
      if (!cardId || profile.collection.ownedCardIds.includes(cardId) || profile.wallet.petals < price) return profile
      return {
        ...profile,
        wallet: { ...profile.wallet, petals: profile.wallet.petals - price },
        collection: { ...profile.collection, ownedCardIds: [...profile.collection.ownedCardIds, cardId] },
      }
    }
    case 'presentation/set-theme':
      return { ...profile, presentation: { ...profile.presentation, theme: action.theme } }
    case 'presentation/set-animation':
      return { ...profile, presentation: { ...profile.presentation, animations: { ...profile.presentation.animations, [action.field]: action.value } } }
    case 'progression/select-level': {
      if (!['archangels', 'callus'].includes(action.faction)) return profile
      const factionProgress = profile.progression[action.faction]
      const selectedLevel = Math.max(1, Math.min(factionProgress.level, Number(action.level) || 1))
      return {
        ...profile,
        progression: { ...profile.progression, [action.faction]: { ...factionProgress, selectedLevel } },
      }
    }
    case 'match/complete': {
      if (!['archangels', 'callus'].includes(action.faction)) return profile
      const factionProgress = applyFactionExperience(profile.progression[action.faction], Math.max(0, Number(action.xp) || 0))
      return {
        ...profile,
        wallet: { ...profile.wallet, petals: profile.wallet.petals + Math.max(0, Number(action.gold) || 0) },
        progression: { ...profile.progression, [action.faction]: factionProgress },
      }
    }
    case 'story/set-position':
      return {
        ...profile,
        progression: {
          ...profile.progression,
          story: { ...profile.progression.story, ...action.position },
        },
      }
    case 'foot/set':
      return {
        ...profile,
        footProfile: {
          ...profile.footProfile,
          [action.group]: {
            ...profile.footProfile[action.group],
            [action.field]: action.value,
          },
        },
      }
    case 'foot/reset':
      return { ...profile, footProfile: copyDefaults().footProfile }
    case 'profile/replace':
      return mergeStoredProfile(action.profile)
    case 'profile/reset':
      return copyDefaults()
    default:
      return profile
  }
}

const PlayerProfileContext = createContext(null)

export function PlayerProfileProvider({ children }) {
  const [profile, dispatch] = useReducer(playerProfileReducer, undefined, loadPlayerProfile)

  useEffect(() => {
    window.localStorage.setItem(PLAYER_PROFILE_STORAGE_KEY, JSON.stringify(profile))
  }, [profile])

  const value = useMemo(() => ({ profile, dispatch }), [profile])
  return <PlayerProfileContext.Provider value={value}>{children}</PlayerProfileContext.Provider>
}

export function usePlayerProfile() {
  const context = useContext(PlayerProfileContext)
  if (!context) throw new Error('usePlayerProfile must be used inside PlayerProfileProvider')
  return context
}
