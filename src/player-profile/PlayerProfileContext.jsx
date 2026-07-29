import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'

export const PLAYER_PROFILE_STORAGE_KEY = 'honeyfoot-player-profile'
export const PLAYER_PROFILE_VERSION = 3

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
    petals: 1240,
  },
  progression: {
    archangels: { level: 12 },
    callus: { level: 1 },
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
