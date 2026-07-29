import { useEffect, useState } from 'react'
import { cancelDeckSearch, cancelInfluencePlacement, conditionPlayStatus, createMatchState, eligibleTargets as findEligibleTargets, finishRound, isInfluenceCard, playCard as resolveCardPlay, resolveDeckSearch, resolveInfluencePlacement } from './game/engine.js'
import { selectCallusCard, TEST_DIFFICULTIES } from './game/callus-ai.js'
import { playArchangelTurn } from './game/archangel-ai.js'
import { usePlayerProfile } from './player-profile/PlayerProfileContext.jsx'

const assetUrl = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`

const navItems = ['Home', 'Services', 'Care Tools', 'About', 'News', 'Contact', 'Product', 'Blog']

const appTabs = [
  { id: 'explorer', verb: 'Explore', label: 'Foot Explorer' },
  { id: 'studio', verb: 'Personalize', label: 'Care Studio' },
  { id: 'cards', verb: 'Play', label: 'Honeyfoot Cards' },
]

const regions = {
  heel: {
    label: 'Heel',
    eyebrow: 'Everyday care focus',
    title: 'Give hardworking heels a little more attention.',
    copy: 'Pressure, friction, weather, and daily routines can all influence how heel skin looks and feels. Thoughtful, gentle care can support comfort without overdoing it.',
    actions: ['Moisturize consistently', 'Choose supportive footwear', 'Be gentle with thickened skin'],
  },
  arch: {
    label: 'Arch',
    eyebrow: 'Comfort focus',
    title: 'Support the part that supports every step.',
    copy: 'The arch works quietly throughout the day. Footwear, activity, and time spent standing can shape how this area feels after a long day.',
    actions: ['Notice patterns in comfort', 'Alternate demanding activities', 'Choose shoes that feel supportive'],
  },
  toes: {
    label: 'Toes',
    eyebrow: 'Routine focus',
    title: 'Small spaces deserve careful routines.',
    copy: 'Toes and the spaces between them benefit from clean, dry, breathable surroundings and enough room to move comfortably inside footwear.',
    actions: ['Dry carefully after bathing', 'Check shoe fit', 'Keep nail care simple'],
  },
  forefoot: {
    label: 'Ball of foot',
    eyebrow: 'Pressure focus',
    title: 'Notice where your stride meets the ground.',
    copy: 'The forefoot carries repeated pressure through walking and standing. Small changes in shoes, activity, and recovery can make everyday movement feel more considered.',
    actions: ['Rotate comfortable shoes', 'Build in recovery time', 'Notice recurring pressure points'],
  },
  toenails: {
    label: 'Toenails',
    eyebrow: 'Grooming focus',
    title: 'Keep nail care simple, clean, and unhurried.',
    copy: 'Comfortable nail care begins with good visibility, clean tools, and a shape that respects the natural edge of each nail.',
    actions: ['Trim without cutting deeply into corners', 'Give damp nails time to dry', 'Notice persistent changes in color or texture'],
  },
  topForefoot: {
    label: 'Top of forefoot',
    eyebrow: 'Fit focus',
    title: 'Leave room for the foot to move naturally.',
    copy: 'The top of the forefoot can feel crowded when footwear is shallow, tightly laced, or narrow through the front. A comfortable fit should feel secure without pressing.',
    actions: ['Check space across the forefoot', 'Adjust laces gradually', 'Notice marks left by footwear'],
  },
  instep: {
    label: 'Instep',
    eyebrow: 'Comfort focus',
    title: 'Let support feel supportive—not restrictive.',
    copy: 'The instep meets laces, straps, and the upper structure of a shoe. Small adjustments here can change how settled the whole foot feels.',
    actions: ['Loosen pressure points', 'Choose flexible uppers', 'Recheck comfort later in the day'],
  },
  ankle: {
    label: 'Ankle area',
    eyebrow: 'Transition focus',
    title: 'Care for the place where foot meets stride.',
    copy: 'The ankle area regularly meets sock bands, shoe collars, and repeated motion. Comfortable materials and a thoughtful fit can help reduce everyday rubbing.',
    actions: ['Check collars for rubbing', 'Avoid overly tight sock bands', 'Give irritated areas a break'],
  },
  innerArch: {
    label: 'Inside arch',
    eyebrow: 'Support focus',
    title: 'Notice how the inside of your foot meets support.',
    copy: 'The inside arch changes shape through standing and movement. Shoes and inserts can feel different depending on where and how firmly they meet this curve.',
    actions: ['Choose support that feels comfortable', 'Notice repeated pressure beneath the arch', 'Ease into unfamiliar footwear'],
  },
  innerHeel: {
    label: 'Inner heel',
    eyebrow: 'Contact focus',
    title: 'Give the heel a steady, comfortable landing.',
    copy: 'The inner heel regularly meets firm shoe counters and repeated ground contact. Fit, cushioning, and skin care all contribute to everyday comfort.',
    actions: ['Check the heel counter for rubbing', 'Keep dry skin comfortably moisturized', 'Replace badly compressed footwear'],
  },
  innerAnkle: {
    label: 'Inner ankle',
    eyebrow: 'Movement focus',
    title: 'Leave space for comfortable movement.',
    copy: 'The inner ankle sits close to shoe collars, straps, and seams. A thoughtful fit should allow movement without persistent rubbing or pinching.',
    actions: ['Check collar height', 'Adjust straps gradually', 'Notice recurring marks or irritation'],
  },
  bigToeSide: {
    label: 'Big toe',
    eyebrow: 'Toe-space focus',
    title: 'Let the big toe settle without crowding.',
    copy: 'From the side, the big toe reveals how much vertical and forward room footwear provides. Comfortable shoes should avoid pressing the nail or forcing the toe backward.',
    actions: ['Check room above the nail', 'Leave space at the shoe tip', 'Notice pressure during downhill walking'],
  },
  outerAnkle: {
    label: 'Outer ankle',
    eyebrow: 'Movement focus',
    title: 'Give the outside ankle room to move freely.',
    copy: 'The outer ankle can meet shoe collars, seams, and repeated side-to-side motion. Comfortable footwear should feel secure without persistent rubbing or pressure.',
    actions: ['Check collar height and padding', 'Notice repeated rubbing', 'Ease into unfamiliar footwear'],
  },
  outerHeel: {
    label: 'Outer heel',
    eyebrow: 'Contact focus',
    title: 'Notice how the heel settles into each shoe.',
    copy: 'The outside of the heel regularly meets firm counters and repeated contact. A steady fit can help the heel feel contained without being pinched.',
    actions: ['Look for uneven rubbing', 'Choose a comfortably shaped heel counter', 'Replace badly worn footwear'],
  },
  outerEdge: {
    label: 'Outer edge',
    eyebrow: 'Pressure focus',
    title: 'Pay attention to the quieter edge of each step.',
    copy: 'The lateral border runs from the heel toward the little toe. Footwear shape, activity, and walking patterns can all influence where this edge meets pressure.',
    actions: ['Notice recurring pressure points', 'Check the shape of the shoe base', 'Rotate comfortable footwear'],
  },
  littleToeSide: {
    label: 'Little-toe side',
    eyebrow: 'Toe-space focus',
    title: 'Leave the little-toe side enough breathing room.',
    copy: 'The outer toes are easy to crowd inside narrow or tapered footwear. A comfortable toe box should leave space without allowing the foot to slide around.',
    actions: ['Check width across the toes', 'Notice rubbing at the shoe edge', 'Choose socks without bulky seams'],
  },
}

function profileVisualStyle(profile) {
  const { appearance, basics } = profile
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
  const sexPreset = {
    female: { arch: 5, instep: -5, width: -3 },
    male: { arch: -2, instep: 6, width: 3 },
    unspecified: { arch: 0, instep: 0, width: 0 },
  }[basics.sex]
  const agePreset = {
    teen: { splay: 8, pad: 8, toeAngle: -2, smooth: 10, forefoot: 4 },
    adult: { splay: 0, pad: 0, toeAngle: 0, smooth: 0, forefoot: 0 },
    'older-adult': { splay: -2, pad: -5, toeAngle: 5, smooth: -8, forefoot: 3 },
    unspecified: { splay: 0, pad: 0, toeAngle: 0, smooth: 0, forefoot: 0 },
  }[basics.ageRange]
  const activityPreset = {
    none: { arch: -3, splay: -3, fullness: -2, definition: 0.08, pad: -2 },
    casual: { arch: 0, splay: 0, fullness: 0, definition: 0.18, pad: 0 },
    frequent: { arch: 4, splay: 5, fullness: 3, definition: 0.34, pad: 3 },
  }[profile.lifestyle.athleticActivity]
  const hueShift = appearance.undertone === 'cool' ? -8 : appearance.undertone === 'neutral' ? -3 : 3
  const lightness = 86 - appearance.tone * 0.43
  const saturation = appearance.undertone === 'neutral' ? 25 : 43
  const lengthScale = 0.9 + (basics.shoeSize - 5) * 0.018
  const widthScale = 0.84 + appearance.width * 0.0032 + agePreset.forefoot * 0.002 + sexPreset.width * 0.002 + activityPreset.fullness * 0.0015
  const depth = 0.8 + appearance.thickness * 0.006 + activityPreset.fullness * 0.006
  const archCurve = clamp(48 + sexPreset.arch + activityPreset.arch + (appearance.archHeight - 50) * 0.78, 16, 84)
  const toeSpread = clamp(50 + agePreset.splay + activityPreset.splay + (appearance.toeSpread - 50) * 0.9, 10, 92)
  const wrinkles = clamp(appearance.wrinkles - agePreset.smooth, 0, 100)
  const toeSpreadPixels = (toeSpread - 50) * 0.2
  const instep = 1 + sexPreset.instep * 0.018

  return {
    '--profile-skin-light': `hsl(${22 + hueShift} ${saturation}% ${Math.min(90, lightness + 7)}%)`,
    '--profile-skin-mid': `hsl(${18 + hueShift} ${saturation + 3}% ${lightness}%)`,
    '--profile-skin-shadow': `hsl(${16 + hueShift} ${saturation + 5}% ${lightness - 10}%)`,
    '--profile-length': lengthScale,
    '--profile-width': widthScale,
    '--profile-depth': depth,
    '--profile-arch': `${archCurve}%`,
    '--profile-toe-spread': `${toeSpreadPixels}px`,
    '--profile-toe-spread-quarter': `${toeSpreadPixels * 0.25}px`,
    '--profile-toe-spread-half': `${toeSpreadPixels * 0.45}px`,
    '--profile-big-toe-angle': `${-9 + agePreset.toeAngle}deg`,
    '--profile-pad-roundness': `${clamp(55 + agePreset.pad + activityPreset.pad, 38, 75)}%`,
    '--profile-instep': instep,
    '--profile-highlight-x': `${30 * depth}px`,
    '--profile-highlight-blur': `${25 * depth}px`,
    '--profile-shadow-x': `${-25 * depth}px`,
    '--profile-shadow-blur': `${24 * depth}px`,
    '--profile-drop-y': `${25 * depth}px`,
    '--profile-drop-blur': `${42 * depth}px`,
    '--profile-toe-highlight': `${8 * depth}px`,
    '--profile-toe-shadow': `${6 * depth}px`,
    '--profile-arch-shade-width': `${24 + archCurve * 0.15}px`,
    '--profile-arch-opacity': 0.22 + depth * 0.26 + activityPreset.definition * 0.15,
    '--profile-arch-blur': `${7 / instep}px`,
    '--profile-muscle-definition': activityPreset.definition,
    '--profile-wrinkles': wrinkles / 100,
  }
}

function describeFootProfile(profile) {
  const { basics, appearance, lifestyle } = profile
  const width = appearance.width < 34 ? 'slender' : appearance.width > 66 ? 'broad' : 'medium-width'
  const arch = appearance.archHeight < 34 ? 'lower' : appearance.archHeight > 66 ? 'higher' : 'moderate'
  const age = {
    teen: 'younger', adult: 'adult', 'older-adult': 'mature', unspecified: 'age-neutral',
  }[basics.ageRange]
  const pattern = {
    'mostly-seated': 'mostly seated', mixed: 'varied', 'mostly-standing': 'mostly standing',
  }[lifestyle.dailyPattern]
  const activity = {
    none: 'low-key', casual: 'casually active', frequent: 'frequently active',
  }[lifestyle.athleticActivity]
  const themes = []

  if (lifestyle.dailyPattern === 'mostly-standing') themes.push('end-of-day recovery')
  if (lifestyle.dailyPattern === 'mostly-seated') themes.push('movement breaks')
  if (lifestyle.athleticActivity === 'frequent') themes.push('activity recovery')
  if (appearance.width > 66) themes.push('roomy footwear fit')
  if (appearance.archHeight < 34 || appearance.archHeight > 66) themes.push('support preferences')
  if (themes.length === 0) themes.push('everyday comfort', 'consistent routines')

  return {
    headline: `A ${width}, ${age} foot with a ${arch} arch.`,
    detail: `Your selections describe a ${activity} routine with a ${pattern} daily pattern and a US shoe size of ${basics.shoeSize}.`,
    focus: `This profile brings ${themes.slice(0, 2).join(' and ')} into focus.`,
  }
}

function SiteHeader({ page, setPage, openLogin }) {
  return (
    <header className="legacy-header">
      <button className="clinic-title" onClick={() => setPage('Home')}>Foot and Surgery<br />Clinic,Inc</button>
      <nav className="legacy-nav" aria-label="Primary navigation">
        {navItems.map((item) => (
          <button
            key={item}
            className={page === item ? 'active' : ''}
            onClick={() => setPage(item)}
          >
            {item}
          </button>
        ))}
        <button onClick={openLogin}>Log In</button>
      </nav>
    </header>
  )
}

function HomePage() {
  return (
    <>
      <section className="legacy-hero">
        <img src={assetUrl('/clinic-assets/plumeria-stones.png')} alt="White plumeria flower resting on smooth stones" />
        <h1>2080 S. Frontage road<br />Vicksburg, MS 39180<br />Have feet issues...we travel</h1>
        <p>Foot and Surgery clinic, Inc&nbsp; podiatry service. Our central focus compass is<br />working diligently, striving to deliver quality podiatry care and compassion to<br />every resident as we offer podiatry service.</p>
        <a className="legacy-appointment" href="mailto:vershernejs@yahoo.com">Appointment email, text or call<br /><strong>601-918-0825</strong></a>
      </section>

      <section className="service-columns">
        <article>
          <h2>Wound Care</h2>
          <p>Diabetic ulcer<br />Diabetic foot screenings<br />Foot ulcers in Diabetic patients don't delay call <strong>TODAY!</strong></p>
        </article>
        <article>
          <h2>Rejuvenating FOOT Treatments</h2>
          <p>Healthy feet and ankles are foundational for stability and mobility.<br />Treatments will vary on conditions</p>
        </article>
        <article>
          <h2>Podiatry offerings</h2>
          <p>Ingrown nails<br />Neuropathy<br />Skin disorders</p>
        </article>
      </section>

      <section className="pamper-panel">
        <div>
          <h2>Getting Pampered Has Never Felt So Good</h2>
          <p>make appointment email,text or call<br /><strong>601-918-0825</strong><br />we will respond promtly, don't delay . Quality podiatry care contact us today.</p>
          <small>if this is an emergency or life threating go to nearest emergency room or call 911</small>
        </div>
      </section>

      <section className="insurance-panel">
        <h2>Insurance</h2>
        <p>We accept most insurance. It is the patient's responsibility to check with their insurance to see if they need a referral. If you do not see your insurance listed below, please email, text or call office to verify your insurance.</p>
        <div className="insurance-list">AARP · Aetna · Ambetter · Blue Cross and Blue Shield · Cigna · Medicare · Medicaid · Tricare · United Health Care</div>
      </section>
    </>
  )
}

const explorerViews = {
  sole: {
    label: 'Sole',
    defaultRegion: 'heel',
    hotspots: [
      ['toes', 'Toes'], ['forefoot', 'Ball of foot'], ['arch', 'Arch'], ['heel', 'Heel'],
    ],
  },
  top: {
    label: 'Top',
    defaultRegion: 'toenails',
    hotspots: [
      ['toenails', 'Toenails'], ['topForefoot', 'Top of forefoot'], ['instep', 'Instep'], ['ankle', 'Ankle area'],
    ],
  },
  inside: {
    label: 'Inside',
    defaultRegion: 'innerArch',
    hotspots: [
      ['innerAnkle', 'Inner ankle'], ['innerHeel', 'Inner heel'], ['innerArch', 'Inside arch'], ['bigToeSide', 'Big toe'],
    ],
  },
  outside: {
    label: 'Outside',
    defaultRegion: 'outerEdge',
    hotspots: [
      ['outerAnkle', 'Outer ankle'], ['outerHeel', 'Outer heel'], ['outerEdge', 'Outer edge'], ['littleToeSide', 'Little-toe side'],
    ],
  },
}

const hotspotLayouts = {
  masculine: {
    sole: { toes: [60, 14], forefoot: [58, 30], arch: [45, 52], heel: [49, 83] },
    top: { toenails: [60, 12], topForefoot: [58, 28], instep: [50, 49], ankle: [49, 78] },
    inside: { innerAnkle: [35, 43], innerHeel: [18, 67], innerArch: [48, 72], bigToeSide: [85, 69] },
    outside: { outerAnkle: [35, 44], outerHeel: [18, 67], outerEdge: [55, 72], littleToeSide: [85, 69] },
  },
  feminine: {
    sole: { toes: [59, 14], forefoot: [57, 29], arch: [48, 52], heel: [51, 83] },
    top: { toenails: [59, 12], topForefoot: [57, 28], instep: [50, 49], ankle: [49, 78] },
    inside: { innerAnkle: [35, 43], innerHeel: [18, 67], innerArch: [48, 72], bigToeSide: [85, 69] },
    outside: { outerAnkle: [35, 44], outerHeel: [18, 67], outerEdge: [55, 72], littleToeSide: [85, 69] },
  },
}

const explorerAssets = {
  masculine: {
    sole: assetUrl('/foot-explorer/sculpted/masculine-sole-v1.png'),
    top: assetUrl('/foot-explorer/sculpted/masculine-top-v1.png'),
    inside: assetUrl('/foot-explorer/sculpted/masculine-inside-v1.png'),
    outside: assetUrl('/foot-explorer/sculpted/masculine-outside-v1.png'),
  },
  feminine: {
    sole: assetUrl('/foot-explorer/sculpted/feminine-sole-v1.png'),
    top: assetUrl('/foot-explorer/sculpted/feminine-top-v1.png'),
    inside: assetUrl('/foot-explorer/sculpted/feminine-inside-v2.png'),
    outside: assetUrl('/foot-explorer/sculpted/feminine-outside-v1.png'),
  },
}

function SculptedFootDiagram({ view, presentation, selected, visited, onSelect }) {
  const viewData = explorerViews[view]
  const layout = hotspotLayouts[presentation][view]

  return (
    <div className={`sculpted-viewer is-${view}`} aria-label={`${presentation} ${viewData.label.toLowerCase()} foot model with selectable care areas`}>
      <div className="sculpted-stage">
        <img
          key={`${presentation}-${view}`}
          className="sculpted-foot-model"
          src={explorerAssets[presentation][view]}
          alt={`${viewData.label} view of a grayscale ${presentation} foot model`}
        />
        {viewData.hotspots.map(([id, label]) => {
          const [left, top] = layout[id]
          return (
            <button
              key={id}
              className={`hotspot ${left > 72 ? 'label-left' : ''} ${selected === id ? 'is-selected' : ''} ${visited.has(id) ? 'is-visited' : 'is-new'}`}
              style={{ left: `${left}%`, top: `${top}%` }}
              onClick={() => onSelect(id)}
              aria-label={`Explore ${label}`}
              aria-pressed={selected === id}
            ><span>{label}</span></button>
          )
        })}
      </div>
    </div>
  )
}

function FootExplorer() {
  const [view, setView] = useState('sole')
  const [presentation, setPresentation] = useState('masculine')
  const [selected, setSelected] = useState('heel')
  const [visited, setVisited] = useState(() => new Set(['heel']))
  const region = regions[selected]

  const selectView = (nextView) => {
    setView(nextView)
    const nextRegion = explorerViews[nextView].defaultRegion
    setSelected(nextRegion)
    setVisited((current) => new Set(current).add(nextRegion))
  }

  const selectRegion = (regionId) => {
    setSelected(regionId)
    setVisited((current) => new Set(current).add(regionId))
  }

  return (
    <div className="explorer-grid">
      <div className="explorer-intro">
        <p className="modern-eyebrow">Interactive care guide</p>
        <h3>Meet your feet,<br />one area at a time.</h3>
        <p>Select an area to discover approachable care ideas, everyday influences, and signs that may deserve a professional look.</p>
        <div className="view-switch" aria-label="Foot view">
          {Object.entries(explorerViews).map(([viewId, viewData]) => (
            <button key={viewId} className={view === viewId ? 'selected' : ''} onClick={() => selectView(viewId)}>{viewData.label}</button>
          ))}
        </div>
        <div className="presentation-picker">
          <span>Model presentation</span>
          <div className="presentation-switch" aria-label="Model presentation">
            <button className={presentation === 'masculine' ? 'selected' : ''} onClick={() => setPresentation('masculine')}>Masculine</button>
            <button className={presentation === 'feminine' ? 'selected' : ''} onClick={() => setPresentation('feminine')}>Feminine</button>
          </div>
        </div>
      </div>
      <SculptedFootDiagram
        view={view}
        presentation={presentation}
        selected={selected}
        visited={visited}
        onSelect={selectRegion}
      />
      <article className="care-card" aria-live="polite">
        <p className="modern-eyebrow">{region.eyebrow}</p>
        <p className="region-label">{region.label}</p>
        <h4>{region.title}</h4>
        <p>{region.copy}</p>
        <div className="care-actions">
          <strong>Care ideas</strong>
          <ul>{region.actions.map((action) => <li key={action}>{action}</li>)}</ul>
        </div>
        <small>Persistent, painful, or changing concerns are worth sharing with a qualified foot-care professional.</small>
      </article>
    </div>
  )
}

function StudioFoot({ profile }) {
  return (
    <div className="studio-foot-stage" style={profileVisualStyle(profile)} aria-label="Personalized foot preview">
      <div className="studio-foot-shadow" />
      <div className="studio-foot-model">
        <span className="studio-toe studio-toe-one" /><span className="studio-toe studio-toe-two" />
        <span className="studio-toe studio-toe-three" /><span className="studio-toe studio-toe-four" />
        <span className="studio-toe studio-toe-five" />
        <span className="studio-arch" />
        <span className="studio-muscle-tone" />
        <span className="studio-wrinkles" />
      </div>
    </div>
  )
}

function SelectField({ label, value, onChange, children }) {
  return (
    <label className="studio-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>{children}</select>
    </label>
  )
}

function RangeField({ label, value, min = 0, max = 100, onChange, valueLabel = value }) {
  return (
    <label className="studio-range">
      <span>{label}<output>{valueLabel}</output></span>
      <input type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  )
}

function CareStudio({ profile, dispatch }) {
  const [controlTab, setControlTab] = useState('basic')
  const summary = describeFootProfile(profile)
  const setField = (group, field, value) => dispatch({ type: 'set', group, field, value })

  return (
    <section className="studio-shell">
      <div className="studio-visual">
        <p className="modern-eyebrow">Live profile</p>
        <StudioFoot profile={profile} />
        <button className="studio-reset" onClick={() => dispatch({ type: 'reset' })}>Reset foot</button>
      </div>

      <article className="studio-summary" aria-live="polite">
        <p className="modern-eyebrow">Your foot, summarized</p>
        <h3>{summary.headline}</h3>
        <p>{summary.detail}</p>
        <p>{summary.focus}</p>
        <div className="profile-tags">
          <span>{profile.appearance.undertone} tone</span>
          <span>{profile.lifestyle.athleticActivity} activity</span>
          <span>{profile.lifestyle.dailyPattern.replace('mostly-', '')}</span>
        </div>
        <small>The summary describes your selections; it is not an assessment or diagnosis.</small>
      </article>

      <div className="studio-controls">
        <div className="control-tabs" role="tablist" aria-label="Personalization controls">
          <button role="tab" aria-selected={controlTab === 'basic'} onClick={() => setControlTab('basic')}>Basic</button>
          <button role="tab" aria-selected={controlTab === 'advanced'} onClick={() => setControlTab('advanced')}>Advanced</button>
        </div>

        {controlTab === 'basic' ? (
          <div className="control-panel">
            <SelectField label="Sex" value={profile.basics.sex} onChange={(value) => setField('basics', 'sex', value)}>
              <option value="unspecified">Unspecified</option><option value="female">Female</option><option value="male">Male</option>
            </SelectField>
            <SelectField label="Age range" value={profile.basics.ageRange} onChange={(value) => setField('basics', 'ageRange', value)}>
              <option value="teen">Teen</option><option value="adult">Adult</option><option value="older-adult">Older adult</option><option value="unspecified">Unspecified</option>
            </SelectField>
            <RangeField label="US shoe size" min={5} max={14} value={profile.basics.shoeSize} onChange={(value) => setField('basics', 'shoeSize', value)} />
            <RangeField label="Skin tone" value={profile.appearance.tone} onChange={(value) => setField('appearance', 'tone', value)} valueLabel={`${profile.appearance.tone}%`} />
            <SelectField label="Undertone" value={profile.appearance.undertone} onChange={(value) => setField('appearance', 'undertone', value)}>
              <option value="warm">Warm</option><option value="neutral">Neutral</option><option value="cool">Cool</option>
            </SelectField>
            <RangeField label="Foot width" value={profile.appearance.width} onChange={(value) => setField('appearance', 'width', value)} valueLabel={`${profile.appearance.width}%`} />
          </div>
        ) : (
          <div className="control-panel">
            <SelectField label="Daily pattern" value={profile.lifestyle.dailyPattern} onChange={(value) => setField('lifestyle', 'dailyPattern', value)}>
              <option value="mostly-seated">Mostly seated</option><option value="mixed">Mixed</option><option value="mostly-standing">Mostly standing</option>
            </SelectField>
            <SelectField label="Athletic activity" value={profile.lifestyle.athleticActivity} onChange={(value) => setField('lifestyle', 'athleticActivity', value)}>
              <option value="none">None</option><option value="casual">Casual</option><option value="frequent">Frequent</option>
            </SelectField>
            <RangeField label="Thickness" value={profile.appearance.thickness} onChange={(value) => setField('appearance', 'thickness', value)} valueLabel={`${profile.appearance.thickness}%`} />
            <RangeField label="Arch height" value={profile.appearance.archHeight} onChange={(value) => setField('appearance', 'archHeight', value)} valueLabel={`${profile.appearance.archHeight}%`} />
            <RangeField label="Toe spread" value={profile.appearance.toeSpread} onChange={(value) => setField('appearance', 'toeSpread', value)} valueLabel={`${profile.appearance.toeSpread}%`} />
            <RangeField label="Wrinkles" value={profile.appearance.wrinkles} onChange={(value) => setField('appearance', 'wrinkles', value)} valueLabel={`${profile.appearance.wrinkles}%`} />
          </div>
        )}
      </div>
    </section>
  )
}

const cardThemes = {
  garden: { label: 'Garden room' },
  dusk: { label: 'Velvet dusk' },
  linen: { label: 'Quiet linen' },
}

const profileAvatars = [
  { id: 'lily', label: 'White lily', kind: 'symbol' },
  { id: 'care-studio-foot', label: 'My Care Studio foot', kind: 'foot' },
  { id: 'man-silhouette', label: 'Man silhouette', kind: 'symbol' },
  { id: 'woman-silhouette', label: 'Woman silhouette', kind: 'symbol' },
  { id: 'piano', label: 'Piano', kind: 'symbol' },
  { id: 'cream-jar', label: 'Cream jar', kind: 'symbol' },
  { id: 'shoe', label: 'Shoe', kind: 'symbol' },
  { id: 'sock', label: 'Sock', kind: 'symbol' },
  { id: 'book', label: 'Book', kind: 'symbol' },
  ...Array.from({ length: 4 }, (_, index) => ({ id: `man-${index + 1}`, label: `Portrait ${index + 1}`, kind: 'portrait', src: assetUrl(`/honeyfoot-cards/avatars/man-${index + 1}.webp`) })),
  ...Array.from({ length: 4 }, (_, index) => ({ id: `woman-${index + 1}`, label: `Portrait ${index + 5}`, kind: 'portrait', src: assetUrl(`/honeyfoot-cards/avatars/woman-${index + 1}.webp`) })),
]

function AvatarSymbol({ id }) {
  if (id === 'lily') return <svg viewBox="0 0 100 100" aria-hidden="true"><g className="avatar-lily"><ellipse cx="50" cy="27" rx="14" ry="25" /><ellipse cx="70" cy="42" rx="14" ry="25" transform="rotate(55 70 42)" /><ellipse cx="63" cy="67" rx="14" ry="25" transform="rotate(145 63 67)" /><ellipse cx="37" cy="67" rx="14" ry="25" transform="rotate(215 37 67)" /><ellipse cx="30" cy="42" rx="14" ry="25" transform="rotate(305 30 42)" /><circle cx="50" cy="49" r="10" /></g></svg>
  if (id.includes('silhouette')) return <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="35" r="20" /><path d="M17 91c3-24 15-36 33-36s30 12 33 36z" />{id === 'woman-silhouette' && <path className="avatar-silhouette-hair" d="M27 39c-2-23 9-32 23-32 17 0 26 13 23 34l-9-17c-10 8-20 10-32 10l-5 5z" />}</svg>
  if (id === 'piano') return <svg viewBox="0 0 100 100" aria-hidden="true"><path d="M18 25h64v51H18z" /><g className="avatar-paper"><path d="M25 53h50v17H25z" /><path d="M34 53v17M43 53v17M52 53v17M61 53v17M70 53v17" /><path d="M38 53v10M47 53v10M56 53v10M65 53v10" /></g></svg>
  if (id === 'cream-jar') return <svg viewBox="0 0 100 100" aria-hidden="true"><path d="M27 30h46l5 13-5 40H27l-5-40z" /><path className="avatar-paper" d="M24 31h52v14H24zM33 55h34v17H33z" /><path d="M42 63h16" /></svg>
  if (id === 'shoe') return <svg viewBox="0 0 100 100" aria-hidden="true"><path d="M12 67c15-5 23-18 29-35 8 14 21 22 43 29 6 2 7 15-3 17H19c-8 0-10-8-7-11z" /><path className="avatar-detail" d="M38 45l21 14M32 53l19 12M17 68h69" /></svg>
  if (id === 'sock') return <svg viewBox="0 0 100 100" aria-hidden="true"><path d="M28 15h40l-5 45 20 10c6 3 3 15-6 16H32c-13 0-17-13-8-20l12-9z" /><path className="avatar-detail" d="M29 28h38" /></svg>
  return <svg viewBox="0 0 100 100" aria-hidden="true"><path d="M15 21c16-5 28-1 35 7 7-8 19-12 35-7v61c-16-5-28-1-35 7-7-8-19-12-35-7z" /><path className="avatar-paper" d="M50 29v59" /><path className="avatar-detail" d="M24 37h17M24 49h17M59 37h17M59 49h17" /></svg>
}

function ProfileAvatar({ avatar, footProfile, compact = false }) {
  return (
    <span className={`profile-avatar profile-avatar-${avatar.kind}${compact ? ' compact' : ''}`}>
      {avatar.kind === 'portrait' ? <img src={avatar.src} alt="" /> : avatar.kind === 'foot' ? (
        <span className="mini-foot" style={profileVisualStyle(footProfile)} aria-hidden="true"><b /><b /><b /><b /><b /></span>
      ) : <AvatarSymbol id={avatar.id} />}
    </span>
  )
}

function PlayerProfileView({ profile, dispatch }) {
  const [nameDraft, setNameDraft] = useState(profile.identity.name)
  const [saveMessage, setSaveMessage] = useState('')
  const activeAvatar = profileAvatars.find((avatar) => avatar.id === profile.identity.avatarId) || profileAvatars[0]
  const displayName = profile.identity.name.trim() || 'Care Guest'
  const storyLabel = profile.progression.story.chapterId ? `Chapter ${profile.progression.story.chapterId}` : 'Story not started'

  useEffect(() => setNameDraft(profile.identity.name), [profile.identity.name])

  const saveName = (event) => {
    event.preventDefault()
    const name = nameDraft.trim().slice(0, 24)
    dispatch({ type: 'identity/set', field: 'name', value: name })
    setNameDraft(name)
    setSaveMessage('Name saved')
  }

  return (
    <main className="profile-screen">
      <section className="profile-summary-card">
        <p className="modern-eyebrow">Your Honeyfoot profile</p>
        <ProfileAvatar avatar={activeAvatar} footProfile={profile.footProfile} />
        <h2>{displayName}</h2>
        <p className="profile-summary-note">A simple identity for cards, stories, and future care adventures.</p>
        <div className="profile-facts">
          <div><span>Petals</span><strong>{profile.wallet.petals.toLocaleString()}</strong></div>
          <div><span>Archangel level</span><strong>{profile.progression.archangels.level}</strong></div>
          <div><span>Story</span><strong>{storyLabel}</strong></div>
          <div><span>Most-played deck</span><strong>Everyday Comfort</strong></div>
        </div>
      </section>

      <section className="profile-editor">
        <div className="profile-editor-heading">
          <div><p className="modern-eyebrow">Make it yours</p><h3>Name and profile icon</h3></div>
          <p>Both can be changed whenever you like.</p>
        </div>
        <form className="profile-name-form" onSubmit={saveName}>
          <label htmlFor="player-name">Name used in the story</label>
          <div><input id="player-name" value={nameDraft} maxLength={24} placeholder="Care Guest" onChange={(event) => { setNameDraft(event.target.value); setSaveMessage('') }} /><button type="submit">Save name</button></div>
          <small aria-live="polite">{saveMessage || `${nameDraft.length}/24 characters`}</small>
        </form>

        <div className="profile-avatar-heading"><h4>Choose an icon</h4><span>{profileAvatars.length} gentle options</span></div>
        <div className="profile-avatar-grid">
          {profileAvatars.map((avatar) => (
            <button key={avatar.id} type="button" className={profile.identity.avatarId === avatar.id ? 'selected' : ''} aria-pressed={profile.identity.avatarId === avatar.id} onClick={() => dispatch({ type: 'identity/set', field: 'avatarId', value: avatar.id })}>
              <ProfileAvatar avatar={avatar} footProfile={profile.footProfile} compact />
              <span>{avatar.label}</span>
              {avatar.kind === 'foot' && <small>Follows Care Studio</small>}
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}

const GAME_RULES = Object.freeze({ maxComfort: 16, startingComfortRatio: 0.5, deckSize: 24, copyLimit: 3 })

const testCardLibrary = [
  { id: 'basic-massage', name: 'Basic Massage', faction: 'archangels', type: 'Care Action', subtype: 'Structural', traits: ['Kinetic', 'Massage'], specialty: 'Structural', cost: 0, rarity: 'Common', mark: '〰', text: 'Reduce a Structural Condition by 2 Severity, or restore 1 Comfort.' },
  { id: 'comfort-stretch', name: 'Comfort Stretch', faction: 'archangels', type: 'Care Action', subtype: 'Structural', traits: ['Kinetic', 'Stretch'], specialty: 'Structural', cost: 0, rarity: 'Common', mark: '↗', text: 'Reduce a Structural Condition by 3 Severity.' },
  { id: 'heel-balm', name: 'Heavy Heel Balm', faction: 'archangels', type: 'Care Action', subtype: 'Surface', traits: ['Topical', 'Moisture', 'Heel'], specialty: 'Surface', cost: 1, rarity: 'Common', mark: '◒', text: 'Reduce a Surface Condition by 3 Severity or restore 1 Comfort.' },
  { id: 'hydro-bandage', name: 'Hydrocolloid Bandage', faction: 'archangels', type: 'Care Action', subtype: 'Surface', traits: ['Protective', 'Blister', 'Barrier'], specialty: 'Surface', cost: 1, rarity: 'Uncommon', mark: '✚', text: 'Reduce a blister Condition by 4 Severity and prevent its next trigger.' },
  { id: 'antifungal-cream', name: 'Targeted Cream', faction: 'archangels', type: 'Care Action', subtype: 'Microbial', traits: ['Topical', 'Fungal', 'Targeted'], specialty: 'Microbial', cost: 1, rarity: 'Uncommon', mark: '✦', text: 'Reduce a Microbial Condition by 4 Severity.' },
  { id: 'proper-trimming', name: 'Proper Trimming', faction: 'archangels', type: 'Care Action', subtype: 'Keratin', traits: ['Precision', 'Nail'], specialty: 'Keratin', cost: 1, rarity: 'Common', mark: '⌁', text: 'Reduce a Keratin Condition by 3 Severity.' },
  { id: 'care-kit', name: 'Everyday Care Kit', faction: 'archangels', type: 'Equipment', traits: ['Tools', 'Supply'], specialty: 'General', cost: 2, rarity: 'Uncommon', mark: '▣', text: 'At the start of your turn, gain 1 additional Supply.' },
  { id: 'dr-honeyfoot', name: 'Dr. Honeyfoot', faction: 'archangels', type: 'Supporter', traits: ['Clinic', 'Draw'], specialty: 'General', cost: 0, rarity: 'Rare', mark: 'H', text: 'Choose a Condition. Reduce its Severity by 2, then draw a card.' },
  { id: 'fresh-socks', name: 'Fresh Breathable Socks', faction: 'archangels', type: 'Environment', traits: ['Breathable', 'Dry'], specialty: 'Surface', cost: 1, rarity: 'Common', mark: '≈', text: 'Prevent the next Surface or Microbial trigger this round.' },
  { id: 'fountain-youth', name: 'Fountain of Youth', faction: 'archangels', type: 'Debug', specialty: 'Debug', cost: 0, rarity: 'Debug', mark: '∞', text: 'Set Comfort to its maximum. Win the game.', debug: true },
  { id: 'mild-fissures', name: 'Mild Heel Fissures', faction: 'callus', type: 'Condition', subtype: 'Surface', traits: ['Dryness', 'Heel', 'Friction'], specialty: 'Surface', cost: 0, rarity: 'Common', mark: '⌁', severity: 4, discomfort: 1, text: 'A dry, thickened heel edge beginning to split under repeated pressure.' },
  { id: 'friction-blister', name: 'Friction Blister', faction: 'callus', type: 'Condition', subtype: 'Surface', traits: ['Friction', 'Blister'], specialty: 'Surface', cost: 0, rarity: 'Common', mark: '◉', severity: 3, discomfort: 1, text: 'Gains 1 Severity when paired with a friction card.' },
  { id: 'webbing-itch', name: 'Webbing Itch', faction: 'callus', type: 'Condition', subtype: 'Microbial', traits: ['Fungal', 'Moisture'], specialty: 'Microbial', cost: 0, rarity: 'Common', mark: '≋', severity: 4, discomfort: 1, text: 'Chronic Dampness makes this trigger twice. This effect does not stack.' },
  { id: 'morning-dagger', name: 'The Morning Dagger', faction: 'callus', type: 'Condition', subtype: 'Structural', traits: ['Heel', 'First Step'], specialty: 'Structural', cost: 0, rarity: 'Uncommon', mark: '⟡', severity: 6, discomfort: 1, text: 'Deals 1 additional Discomfort the first time it triggers.' },
  { id: 'toe-cramp', name: 'Toe Cramp', faction: 'callus', type: 'Condition', subtype: 'Structural', traits: ['Spasm', 'Toes'], specialty: 'Structural', cost: 0, rarity: 'Common', mark: '⌇', severity: 3, discomfort: 1, text: 'Kinetic cards reduce 1 additional Severity from this Condition.' },
  { id: 'spiking-corner', name: 'The Spiking Corner', faction: 'callus', type: 'Condition', subtype: 'Keratin', traits: ['Nail', 'Pressure', 'Toe'], specialty: 'Keratin', cost: 0, rarity: 'Uncommon', mark: '⌝', severity: 4, discomfort: 1, text: 'Precision Care Actions reduce 1 additional Severity from this Condition.' },
  { id: 'narrow-box', name: 'Aggressive Taper', faction: 'callus', type: 'Shoe Attribute', traits: ['Compression', 'Toe Box'], specialty: 'Structural', cost: 0, rarity: 'Uncommon', mark: '〉', text: 'Surface and Structural Conditions enter with +1 Severity. This effect does not stack.' },
  { id: 'chronic-dampness', name: 'Chronic Dampness', faction: 'callus', type: 'Habit', traits: ['Moisture', 'Fungal'], specialty: 'Microbial', cost: 0, rarity: 'Common', mark: '≈', text: 'Your next Microbial Condition enters with +2 Severity.' },
  { id: 'hard-floors', name: 'Commercial Hard Floors', faction: 'callus', type: 'Hazard', traits: ['Impact', 'Occupation'], specialty: 'Structural', cost: 0, rarity: 'Common', mark: '▤', text: 'Only if a Structural Condition is in play, deal 1 Discomfort during each Care Check. This effect does not stack.' },
  { id: 'haider', name: 'Haider', faction: 'callus', type: 'Supporter', traits: ['Shoe', 'Search'], specialty: 'General', cost: 0, rarity: 'Rare', mark: 'H', text: 'Search your deck for a Shoe Attribute, reveal it, and add it to your hand. Then shuffle your deck.' },
  { id: 'eternity', name: 'Eternity', faction: 'callus', type: 'Debug', specialty: 'Debug', cost: 0, rarity: 'Debug', mark: '∞', text: 'Set Comfort to zero. Win the game.', debug: true },
]

const starterDecks = [
  { id: 'everyday-comfort', name: 'Everyday Comfort', faction: 'archangels', active: true, cards: { 'basic-massage': 3, 'comfort-stretch': 3, 'heel-balm': 3, 'hydro-bandage': 3, 'antifungal-cream': 3, 'proper-trimming': 3, 'care-kit': 2, 'dr-honeyfoot': 2, 'fresh-socks': 2 } },
  { id: 'pressure-friction', name: 'Pressure & Friction', faction: 'callus', active: true, cards: { 'mild-fissures': 3, 'friction-blister': 3, 'webbing-itch': 3, 'morning-dagger': 3, 'toe-cramp': 3, 'narrow-box': 3, 'chronic-dampness': 2, 'hard-floors': 2, haider: 2 } },
]

const tutorialDeckOrders = Object.freeze({
  archangels: [
    'basic-massage', 'heel-balm', 'antifungal-cream', 'care-kit', 'dr-honeyfoot',
    'comfort-stretch', 'proper-trimming', 'hydro-bandage', 'fresh-socks', 'basic-massage',
    'antifungal-cream', 'comfort-stretch', 'heel-balm', 'proper-trimming', 'hydro-bandage',
    'care-kit', 'basic-massage', 'fresh-socks', 'dr-honeyfoot', 'comfort-stretch',
    'hydro-bandage', 'proper-trimming', 'heel-balm', 'antifungal-cream',
  ],
  callus: [
    'mild-fissures', 'webbing-itch', 'morning-dagger', 'narrow-box', 'chronic-dampness',
    'friction-blister', 'toe-cramp', 'hard-floors', 'haider', 'mild-fissures',
    'webbing-itch', 'morning-dagger', 'narrow-box', 'friction-blister', 'toe-cramp',
    'chronic-dampness', 'mild-fissures', 'hard-floors', 'haider', 'webbing-itch',
    'morning-dagger', 'narrow-box', 'friction-blister', 'toe-cramp',
  ],
})

const deckCardCount = (deck) => Object.values(deck.cards).reduce((total, count) => total + count, 0)
const deckIsValid = (deck) => deckCardCount(deck) === GAME_RULES.deckSize && Object.values(deck.cards).every((count) => count <= GAME_RULES.copyLimit)
const cardById = (id) => testCardLibrary.find((card) => card.id === id)

function cardWithEntrancePreview(card, state, side) {
  if (!card || card.type !== 'Condition' || card.faction !== 'callus') return card
  const board = state[`${side}Board`] || []
  const taperBonus = board.includes('narrow-box') && ['Surface','Structural'].includes(card.subtype) ? 1 : 0
  const dampBonus = card.subtype === 'Microbial' && (state[`${side}ChronicDampnessCharges`] || 0) > 0 ? 2 : 0
  const severityBoost = taperBonus + dampBonus
  return severityBoost ? { ...card, severity: card.severity + severityBoost, severityBoost } : card
}

function BoardCard({ card, count = 1, hidden = false, onClick, compact = false, currentSupply = null, highlighted = false }) {
  if (hidden) return <div className="board-card board-card-back" aria-label={`${count} hidden cards`}><span>✦</span>{count > 1 && <b>{count}</b>}</div>
  const unaffordable = currentSupply !== null && card.faction === 'archangels' && card.cost > currentSupply
  return (
    <button className={`board-card specialty-${card.specialty.toLowerCase()} ${compact ? 'compact' : ''} ${unaffordable ? 'is-unaffordable' : ''} ${card.severityBoost ? 'has-severity-boost' : ''} ${highlighted ? 'tutorial-highlight' : ''}`} onClick={onClick}>
      <span className="board-card-mark">{card.mark}</span>
      {card.faction === 'archangels' && card.cost > 0 && <span className="board-supply-cost" aria-label={`${card.cost} Supply cost`}>{card.cost}</span>}
      <small>{card.type}{card.subtype ? ` · ${card.subtype}` : ''}</small>
      <strong>{card.name}</strong>
      {card.severity && <em>{card.severity}{card.severityBoost ? <small>+{card.severityBoost}</small> : null}</em>}
      {count > 1 && <b>{count}</b>}
    </button>
  )
}

function CardPile({ label, count, faction, discard }) {
  return <div className={`board-pile ${discard ? 'discard' : ''} faction-${faction}`}><small>{label}</small><div><span>{discard ? '↶' : '✦'}</span></div><strong>{count}</strong></div>
}

function createMatch(playerDeck, opponentDeck, tutorialFaction = null) {
  return createMatchState({
    playerDeck,
    opponentDeck,
    maxComfort: GAME_RULES.maxComfort,
    startingComfortRatio: GAME_RULES.startingComfortRatio,
    playerCardOrder: tutorialFaction ? tutorialDeckOrders[playerDeck.faction] : null,
    opponentCardOrder: tutorialFaction ? tutorialDeckOrders[opponentDeck.faction] : null,
  })
}

function HoneyfootBoard({ playerDeck, opponentDeck, difficulty, onExit, tutorialFaction = null }) {
  const isTutorial = Boolean(tutorialFaction)
  const matchStorageKey = `${isTutorial ? `honeyfoot-tutorial-${tutorialFaction}-v1` : 'honeyfoot-match'}-${playerDeck.id}-${opponentDeck.id}-${difficulty}`
  const [match, setMatch] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(matchStorageKey))
      if (saved?.playerDeckId === playerDeck.id && saved?.opponentDeckId === opponentDeck.id && saved.match) return { ...saved.match, playerHandOrder: saved.match.playerHandOrder || [...new Set(saved.match.playerHand)], opponentHandOrder: saved.match.opponentHandOrder || [...new Set(saved.match.opponentHand)] }
      return createMatch(playerDeck, opponentDeck, tutorialFaction)
    } catch { return createMatch(playerDeck, opponentDeck, tutorialFaction) }
  })
  const [tutorialIntroOpen, setTutorialIntroOpen] = useState(isTutorial)
  const [tutorialGuide, setTutorialGuide] = useState(() => tutorialFaction === 'archangels' ? 'archangel-round1-comfort' : tutorialFaction === 'callus' ? 'callus-round1-dampness' : 'off')
  const [tutorialCareActionsRemaining, setTutorialCareActionsRemaining] = useState(3)
  const [selectedId, setSelectedId] = useState(null)
  const [inspectBoard, setInspectBoard] = useState(false)
  const [viewedCard, setViewedCard] = useState(null)
  const [logOpen, setLogOpen] = useState(false)
  const [targetingId, setTargetingId] = useState(null)
  const [searchView, setSearchView] = useState('valid')
  const [searchSelection, setSearchSelection] = useState(null)
  const [inspectSearchBoard, setInspectSearchBoard] = useState(false)
  const [replacementSlot, setReplacementSlot] = useState(null)
  const [skipReplacementConfirm, setSkipReplacementConfirm] = useState(false)
  const [expandedLogEntries, setExpandedLogEntries] = useState({})
  const selectedCard = cardById(selectedId)
  const tutorialPromptCardIds = tutorialGuide === 'archangel-round1-care-kit' ? ['care-kit']
        : tutorialGuide === 'callus-round1-dampness' ? ['chronic-dampness', 'webbing-itch']
      : tutorialGuide === 'callus-round1-itch' ? ['webbing-itch']
        : tutorialGuide === 'callus-round2-severity' ? ['narrow-box', 'morning-dagger']
          : tutorialGuide === 'callus-round2-dagger' ? ['morning-dagger']
            : tutorialGuide === 'callus-round3-toe' ? ['toe-cramp']
              : tutorialGuide === 'callus-round4-floors' ? ['hard-floors']
        : tutorialGuide === 'archangel-round2-balm' ? ['heel-balm']
          : tutorialGuide === 'archangel-round2-honeyfoot' ? ['dr-honeyfoot']
            : tutorialGuide === 'archangel-round3-cream' ? ['antifungal-cream']
              : tutorialGuide === 'archangel-round3-finish' ? testCardLibrary.filter((card) => card.faction === 'archangels' && card.type === 'Care Action').map((card) => card.id) : []
  const tutorialEndTurnHighlighted = ['archangel-round1-care-kit', 'archangel-round1-end', 'callus-round1-dampness', 'callus-round1-itch', 'callus-round1-end', 'callus-round2-severity', 'callus-round2-dagger', 'callus-round2-end', 'callus-round3-toe', 'callus-round3-end', 'callus-round4-floors', 'callus-round4-end', 'archangel-round2-honeyfoot', 'archangel-round2-end'].includes(tutorialGuide)

  useEffect(() => {
    localStorage.setItem(matchStorageKey, JSON.stringify({ playerDeckId: playerDeck.id, opponentDeckId: opponentDeck.id, match }))
  }, [match, matchStorageKey, playerDeck.id, opponentDeck.id])

  const handCounts = match.playerHand.reduce((groups, id) => ({ ...groups, [id]: (groups[id] || 0) + 1 }), {})
  const groupedHand = (match.playerHandOrder || [...new Set(match.playerHand)]).filter((id) => handCounts[id]).map((id) => [id, handCounts[id]])
  const eligibleTargets = (state, card) => findEligibleTargets(state, card, cardById)
  const applyCard = (state, card, side, targetKey = null, options = {}) => resolveCardPlay(state, { card, side, getCard: cardById, targetKey, ...options })

  const playSelected = () => {
    if (!selectedCard || match.result) return
    const targets = eligibleTargets(match, selectedCard)
    if (targets.length > 1) {
      setTargetingId(selectedCard.id)
      setSelectedId(null)
      setInspectBoard(false)
      return
    }
    if (selectedCard.id === 'haider') {
      const hasValidSearchCard = match.playerDeck.some((id) => cardById(id)?.type === 'Shoe Attribute')
      setSearchView(hasValidSearchCard ? 'valid' : 'all')
      setSearchSelection(null)
      setInspectSearchBoard(false)
    }
    if (isTutorial && tutorialGuide !== 'off') {
      if (tutorialGuide === 'archangel-round3-finish') {
        if (selectedCard.type !== 'Care Action') {
          setTutorialGuide('off')
        } else {
          const nextRemaining = Math.max(0, tutorialCareActionsRemaining - 1)
          setTutorialCareActionsRemaining(nextRemaining)
          if (nextRemaining === 0) setTutorialGuide('off')
        }
      } else {
      const expectedNext = {
        'archangel-round1-care-kit': ['care-kit', 'archangel-round1-end'],
        'callus-round1-dampness': ['chronic-dampness', 'callus-round1-itch'],
        'callus-round1-itch': ['webbing-itch', 'callus-round1-end'],
        'callus-round2-severity': ['narrow-box', 'callus-round2-dagger'],
        'callus-round2-dagger': ['morning-dagger', 'callus-round2-end'],
        'callus-round3-toe': ['toe-cramp', 'callus-round3-end'],
        'callus-round4-floors': ['hard-floors', 'callus-round4-end'],
        'archangel-round2-balm': ['heel-balm', 'archangel-round2-honeyfoot'],
        'archangel-round2-honeyfoot': ['dr-honeyfoot', 'archangel-round2-end'],
        'archangel-round3-cream': ['antifungal-cream', 'archangel-round3-finish'],
      }[tutorialGuide]
      if (!expectedNext || selectedCard.id !== expectedNext[0]) {
        setTutorialGuide('off')
        setTutorialIntroOpen(false)
      } else setTutorialGuide(expectedNext[1])
      }
    }
    const influenceNeedsReplacement = isInfluenceCard(selectedCard) && match.playerBoard.every(Boolean)
    if (isInfluenceCard(selectedCard)) setReplacementSlot(null)
    setMatch((current) => applyCard(current, selectedCard, 'player', null, { deferSearch: selectedCard.id === 'haider', deferInfluence: influenceNeedsReplacement }))
    setSelectedId(null); setInspectBoard(false)
  }
  const chooseTarget = (conditionKey) => {
    const card = cardById(targetingId)
    if (!card) return
    setMatch((current) => applyCard(current, card, 'player', conditionKey))
    setTargetingId(null)
  }
  const endTurn = () => {
    if (isTutorial) {
      setTutorialIntroOpen(false)
      setTutorialGuide((current) => current === 'archangel-round1-end' ? 'archangel-round2-balm' : current === 'archangel-round2-end' ? 'archangel-round3-cream' : current === 'callus-round1-end' ? 'callus-round2-result' : current === 'callus-round2-end' ? 'callus-round3-toe' : current === 'callus-round3-end' ? 'callus-round4-floors' : 'off')
    }
    setMatch((current) => {
      if (current.result) return current
      let next = { ...current }
      if (opponentDeck.faction === 'archangels') {
        next = playArchangelTurn(next, cardById, difficulty, 'opponent')
      } else {
        const preferred = selectCallusCard(next, cardById, difficulty)
        if (preferred) next = applyCard(next, preferred, 'opponent')
      }
      if (next.result) return next
      return finishRound(next, { playerFaction: playerDeck.faction, opponentFaction: opponentDeck.faction, getCard: cardById })
    })
  }

  const conditionStatus = selectedCard ? conditionPlayStatus(match, selectedCard, 'player') : { allowed: true, reason: null }
  const canPlay = selectedCard && !(selectedCard.faction === 'archangels' && selectedCard.cost > match.playerSupplies) && conditionStatus.allowed
  const winnerName = match.result === 'archangels' ? 'The Archangels' : 'The Callus'
  const pendingSearch = match.pendingSearch
  const pendingInfluence = match.pendingInfluence
  const searchDeck = pendingSearch ? match[`${pendingSearch.side}Deck`] : []
  const searchCards = searchDeck.map((id, index) => ({ id, index, card: cardById(id) })).filter((item) => item.card)
  const validSearchCards = pendingSearch ? searchCards.filter((item) => item.card.type === pendingSearch.cardType) : []
  const visibleSearchCards = searchView === 'all' ? searchCards : validSearchCards
  const selectedSearchCard = searchSelection == null ? null : searchCards.find((item) => item.index === searchSelection)
  const finishSearch = () => {
    setMatch((current) => resolveDeckSearch(current, { deckIndex: searchSelection, getCard: cardById }))
    setSearchSelection(null)
    setInspectSearchBoard(false)
  }
  const cancelSearch = () => {
    setMatch((current) => cancelDeckSearch(current))
    setSearchSelection(null)
    setInspectSearchBoard(false)
  }
  const chooseInfluenceSlot = (slotIndex) => {
    const occupied = Boolean(match.playerBoard[slotIndex])
    if (occupied && !skipReplacementConfirm) return setReplacementSlot(slotIndex)
    setMatch((current) => resolveInfluencePlacement(current, { slotIndex, getCard: cardById }))
    setReplacementSlot(null)
  }
  const cancelInfluence = () => {
    setMatch((current) => cancelInfluencePlacement(current))
    setReplacementSlot(null)
  }
  const confirmReplacement = () => {
    setMatch((current) => resolveInfluencePlacement(current, { slotIndex: replacementSlot, getCard: cardById }))
    setReplacementSlot(null)
  }
  const renderInfluenceSlots = (side) => {
    const board = match[`${side}Board`]
    const choosing = pendingInfluence?.side === side
    return [0,1,2].map((slotIndex) => {
      const id = board[slotIndex]
      const card = id ? cardById(id) : null
      if (!card) return <button key={slotIndex} className={`influence-slot empty ${choosing ? 'available' : ''}`} onClick={() => choosing && chooseInfluenceSlot(slotIndex)} disabled={!choosing}><i>+</i><small>Slot {slotIndex + 1}</small></button>
      return <div key={slotIndex} className={`influence-slot occupied ${choosing ? 'available' : ''}`}><BoardCard card={card} compact onClick={() => choosing ? chooseInfluenceSlot(slotIndex) : setViewedCard(card)} /><small>Slot {slotIndex + 1}</small></div>
    })
  }
  return (
    <div className="honeyfoot-board">
      <div className="board-topline"><button onClick={onExit}>← {isTutorial ? 'Lesson' : 'Decks'}</button><span>{isTutorial ? 'Guided lesson' : `Test match · ${TEST_DIFFICULTIES[difficulty].label}`} · Round {match.round}</span><strong>{opponentDeck.name}</strong></div>
      <section className="board-side opponent-side">
        <CardPile label="Discard" count={match.opponentDiscard.length} faction={opponentDeck.faction} discard />
        <div className="board-hand opponent-hand">{match.opponentHand.map((id, index) => <BoardCard key={`${id}-${index}`} hidden />)}</div>
        <CardPile label="Deck" count={match.opponentDeck.length} faction={opponentDeck.faction} />
      </section>
      <main className={`board-field ${['archangel-round2-honeyfoot', 'archangel-round2-end', 'archangel-round3-finish', 'callus-round2-result', 'callus-round2-severity', 'callus-round2-dagger', 'callus-round2-end', 'callus-round3-toe', 'callus-round3-end', 'callus-round4-floors', 'callus-round4-end'].includes(tutorialGuide) ? 'has-tutorial-round-two' : ''}`}>
        <div className="persistent-row opponent-persistents">{renderInfluenceSlots('opponent')}<span>{match.opponentBoard.some(Boolean) ? 'Opponent influences' : 'Opponent influence zone'}</span></div>
        <div className={`condition-lane ${targetingId ? 'is-targeting' : ''}`}>{match.conditions.map((condition) => {
          const card = cardById(condition.cardId)
          const validTarget = targetingId && eligibleTargets(match, cardById(targetingId)).some((target) => target.key === condition.key)
          const discomfort = card.discomfort * condition.copies
          return <div className={`condition-token ${targetingId ? validTarget ? 'valid-target' : 'invalid-target' : ''}`} key={condition.key}>
            <BoardCard card={{ ...card, severity: condition.severity }} count={condition.copies} compact onClick={() => validTarget ? chooseTarget(condition.key) : !targetingId && setViewedCard({ ...card, severity: condition.severity, copies: condition.copies, currentDiscomfort: discomfort })} />
            <span>{condition.copies > 1 ? `×${condition.copies} · ` : ''}{condition.severity} severity · {discomfort} discomfort</span>
            {tutorialGuide === 'archangel-round2-balm' && card.id === 'mild-fissures' && <aside className="tutorial-condition-callout"><small>Condition cards</small><p>The opponent has played a Condition card, <strong>Mild Heel Fissures</strong>. A Condition will decrease total Comfort by 1 every round until the condition is removed. The number 4 is its Severity, which represents how much care it can resist.</p><p>Click the <strong>Heavy Heel Balm</strong> card to read what it does, and then play it, but do not yet End Turn. Can you predict what will happen?</p></aside>}
            {tutorialGuide === 'archangel-round3-cream' && card.id === 'webbing-itch' && <aside className="tutorial-condition-callout"><small>Matching care</small><p>The opponent has played <strong>Webbing Itch</strong>, a Microbial Condition. The only card in hand that can help ease a Microbial Condition is <strong>Targeted Cream</strong>.</p><p>Play Targeted Cream, but do not End Turn.</p></aside>}
          </div>
        })}</div>
        <div className="game-foot">
          <div className="comfort-orbit"><span>Comfort</span><strong>{match.comfort}</strong><small>/ {GAME_RULES.maxComfort}</small></div>
          <img src={assetUrl('/foot-explorer/sculpted/feminine-top-v1.png')} alt="The shared game foot" />
          <div className="comfort-meter"><i style={{ width: `${(match.comfort / GAME_RULES.maxComfort) * 100}%` }} /></div>
          <p>{match.comfort <= 4 ? 'Comfort is strained.' : match.comfort >= 12 ? 'Comfort is flourishing.' : 'The balance is still in play.'}</p>
        </div>
        {tutorialIntroOpen && tutorialGuide !== 'off' && <aside className={`tutorial-comfort-callout ${tutorialGuide === 'archangel-round1-care-kit' ? 'tutorial-supplies-callout' : ''}`} role="dialog" aria-label="Opening lesson">
          {tutorialGuide === 'archangel-round1-comfort' ? <>
            <small>Lesson 1</small><h3>Comfort Level</h3><p>Both sides share this Comfort Level. The Archangels win by raising it to {match.maxComfort}. The Callus wins by lowering it to 0.</p>
            <button type="button" onClick={() => setTutorialGuide('archangel-round1-care-kit')}>Got it</button>
          </> : tutorialFaction === 'archangels' ? <>
            <small>Lesson 1</small><h3>Supplies</h3><p>Happy feet require adequate Supplies. You start with 3 Supplies and gain 1 every round. The Supply cost of a card is displayed on the top left of the card.</p><p className="tutorial-next-action">You have enough Supply to play <strong>Everyday Care Kit</strong>. Click it to read what it does, then play Everyday Care Kit, and then End Turn.</p>
            <button type="button" onClick={() => setTutorialIntroOpen(false)}>Got it</button>
          </> : <>
            <small>Lesson 1</small><h3>Comfort Level</h3><p>Both sides share this Comfort Level. The Archangels win by raising it to {match.maxComfort}. The Callus wins by lowering it to 0.</p><p className="tutorial-next-action">Try playing <strong>Chronic Dampness</strong> first and then play <strong>Webbing Itch</strong>. You can click them to read how they interact. Then End Turn.</p>
            <button type="button" onClick={() => setTutorialIntroOpen(false)}>Got it</button>
          </>}
        </aside>}
        {['archangel-round2-honeyfoot', 'archangel-round2-end'].includes(tutorialGuide) && <aside className="tutorial-comfort-callout tutorial-round-two" role="status"><small>Care and Comfort</small><h3>The Severity eased.</h3><p>Heavy Heel Balm reduced the Severity by 3, which increases Comfort by 3. Now you can finish it off by playing <strong>Dr. Honeyfoot</strong>, and then End Turn.</p><p className="tutorial-next-action"><strong>Note:</strong> Supporter cards may reduce the Severity of Conditions but will not increase Comfort.</p></aside>}
        {tutorialGuide === 'archangel-round3-finish' && <aside className="tutorial-comfort-callout tutorial-round-two" role="status"><small>Victory is within range</small><h3>{match.comfort} / {match.maxComfort} Comfort</h3><p>Notice that Comfort is at 13/16. Victory is within range. If you play a Care Action card with no target, it grants 1 Comfort.</p><p className="tutorial-next-action">Play any 3 of your remaining Care Action cards to win the game. <strong>{tutorialCareActionsRemaining} remaining.</strong></p></aside>}
        {tutorialGuide === 'callus-round2-result' && <aside className="tutorial-comfort-callout tutorial-round-two" role="dialog" aria-label="Discomfort lesson"><small>Round 2</small><h3>Follow the Comfort.</h3><p>Webbing Itch deals 1 Discomfort, but activates twice, so the score should have moved from 8 → 6. However, the opponent played a card to increase Comfort back up to 7. You can check the History to see what card they played.</p><button type="button" onClick={() => setTutorialGuide('callus-round2-severity')}>Got it</button></aside>}
        {['callus-round2-severity', 'callus-round2-dagger', 'callus-round2-end'].includes(tutorialGuide) && <aside className="tutorial-comfort-callout tutorial-round-two" role="status"><small>Condition cards</small><h3>Severity</h3><p>Severity is how much care a Condition can resist before being discarded. A Condition’s Severity is located on the top right of each Condition card. The greater the Severity, the more difficult it will be for the Archangels to manage the Condition.</p><p className="tutorial-next-action">Play <strong>Aggressive Taper</strong> first, then play <strong>The Morning Dagger</strong>, and then End Turn.</p></aside>}
        {['callus-round3-toe', 'callus-round3-end'].includes(tutorialGuide) && <aside className="tutorial-comfort-callout tutorial-round-two" role="status"><small>Condition limit</small><h3>Build the pressure.</h3><p>You can only have up to 3 unique Conditions in play at a time, but you can stack duplicates to increase their Severity and Discomfort. In this case, a Toe Cramp should add sufficient pressure.</p><p className="tutorial-next-action">Play <strong>Toe Cramp</strong> and then End Turn.</p></aside>}
        {['callus-round4-floors', 'callus-round4-end'].includes(tutorialGuide) && <aside className="tutorial-comfort-callout tutorial-round-two" role="status"><small>Influence cards</small><h3>Pressure can persist.</h3><p>The opponent removed 4 Severity from our Webbing Itch, but it is no matter, because we have <strong>Commercial Hard Floors</strong>.</p><p className="tutorial-next-action">Read what it does, and then play Commercial Hard Floors and then End Turn.</p></aside>}
        <div className={`persistent-row player-persistents ${pendingInfluence?.side === 'player' ? 'is-placing' : ''}`}>{renderInfluenceSlots('player')}<span>{match.playerBoard.some(Boolean) ? 'Your influences' : 'Equipment & influence zone'}</span></div>
        <aside className="board-status"><span>Supplies <strong>{match.playerSupplies}</strong></span><button className={tutorialEndTurnHighlighted ? 'tutorial-control-highlight' : ''} onClick={endTurn} disabled={match.result || pendingInfluence || pendingSearch}>End turn</button><button className="battle-log-toggle" onClick={() => setLogOpen(true)}>☷ History</button><small>{match.log.at(-1)?.text}</small></aside>
      </main>
      <section className="board-side player-side">
        <CardPile label="Discard" count={match.playerDiscard.length} faction={playerDeck.faction} discard />
        <div className="board-hand">{groupedHand.map(([id, count]) => <BoardCard key={id} card={cardWithEntrancePreview(cardById(id), match, 'player')} count={count} currentSupply={match.playerSupplies} highlighted={tutorialPromptCardIds.includes(id)} onClick={() => { setSelectedId(id); setInspectBoard(false) }} />)}</div>
        <CardPile label="Deck" count={match.playerDeck.length} faction={playerDeck.faction} />
      </section>

      {selectedCard && !inspectBoard && <div className="board-decision-backdrop">
        <div className="board-decision">
          <GameCard card={selectedCard} onInspect={() => {}} showTraits={false} />
          <div><small>{selectedCard.type}{selectedCard.subtype ? ` · ${selectedCard.subtype}` : ''}</small><h3>{selectedCard.name}</h3><p>{selectedCard.text}</p>{selectedCard.faction === 'archangels' && <span className="decision-supply"><strong>Supply cost:</strong> {selectedCard.cost} · You have {match.playerSupplies}</span>}{selectedCard.traits?.length > 0 && <span>Traits: {selectedCard.traits.join(', ')}</span>}<div className="decision-actions"><button onClick={() => setSelectedId(null)}>Cancel</button><button onClick={() => setInspectBoard(true)}>Inspect board</button><button className="primary" disabled={!canPlay} onClick={playSelected}>{canPlay ? 'Play card' : !conditionStatus.allowed ? conditionStatus.reason : `Requires ${selectedCard.cost} Supplies · You have ${match.playerSupplies}`}</button></div></div>
        </div>
      </div>}
      {selectedCard && inspectBoard && <button className="return-to-decision" onClick={() => setInspectBoard(false)}><span>{selectedCard.mark}</span> Return to {selectedCard.name}</button>}
      {targetingId && <div className="targeting-banner"><div><small>Choose a Condition</small><strong>{cardById(targetingId).name}</strong></div><span>Select one of the glowing cards.</span><button onClick={() => setTargetingId(null)}>Cancel</button></div>}
      {pendingSearch && !inspectSearchBoard && <div className="deck-search-backdrop">
        <section className="deck-search-panel">
          <header><div><small>{cardById(pendingSearch.sourceCardId).name}</small><h3>Search your deck</h3><p>Choose 1 {pendingSearch.cardType} to add to your hand.</p></div><div className="deck-search-tabs"><button className={searchView === 'valid' ? 'active' : ''} onClick={() => setSearchView('valid')}>Valid <strong>{validSearchCards.length}</strong></button><button className={searchView === 'all' ? 'active' : ''} onClick={() => setSearchView('all')}>All <strong>{searchCards.length}</strong></button></div></header>
          <div className="deck-search-tools"><button onClick={() => setInspectSearchBoard(true)}>Inspect board</button><span>{searchView === 'all' ? 'Review every card remaining before the deck is shuffled.' : `${validSearchCards.length} eligible card${validSearchCards.length === 1 ? '' : 's'} found.`}</span></div>
          <div className="deck-search-grid">{visibleSearchCards.length ? visibleSearchCards.map((item) => <button key={`${item.id}-${item.index}`} className={searchSelection === item.index ? 'selected' : ''} onClick={() => item.card.type === pendingSearch.cardType ? setSearchSelection((current) => current === item.index ? null : item.index) : setViewedCard(item.card)}><GameCard card={item.card} onInspect={() => {}} /></button>) : <div className="deck-search-empty"><strong>No valid cards</strong><span>You may inspect the full deck, then finish the search without a card.</span></div>}</div>
          <footer><div className={`search-selection-slot ${selectedSearchCard ? 'filled' : ''}`}>{selectedSearchCard ? <><BoardCard card={selectedSearchCard.card} compact onClick={() => setSearchSelection(null)} /><span>Selected</span></> : <><i>+</i><span>Choose 1 card</span></>}</div><div className="search-resolution-actions"><button className="cancel-search" onClick={cancelSearch}>Cancel</button><button className="finish-search" onClick={finishSearch}>{selectedSearchCard ? 'Add to hand' : 'Finish without card'}</button></div></footer>
        </section>
      </div>}
      {pendingSearch && inspectSearchBoard && <button className="return-to-decision return-to-search" onClick={() => setInspectSearchBoard(false)}><span>{cardById(pendingSearch.sourceCardId).mark}</span> Return to deck search</button>}
      {pendingInfluence && <div className="influence-placement-banner"><div><small>Choose an Influence slot</small><strong>{cardById(pendingInfluence.cardId).name}</strong></div><span>Choose an empty space or select an Influence to replace.</span><button onClick={cancelInfluence}>Cancel</button></div>}
      {replacementSlot !== null && pendingInfluence && <div className="influence-replace-backdrop"><section className="influence-replace-dialog"><small>Influence slot {replacementSlot + 1}</small><h3>Replace this Influence?</h3><p><strong>{cardById(pendingInfluence.cardId).name}</strong> will enter this slot. <strong>{cardById(match.playerBoard[replacementSlot]).name}</strong> will be discarded.</p><label><input type="checkbox" checked={skipReplacementConfirm} onChange={(event) => setSkipReplacementConfirm(event.target.checked)} /> Don’t ask again this match</label><div><button onClick={() => setReplacementSlot(null)}>Keep current</button><button className="primary" onClick={confirmReplacement}>Replace influence</button></div></section></div>}
      {viewedCard && <div className={`board-decision-backdrop ${pendingSearch ? 'search-card-inspector' : ''}`} onClick={() => setViewedCard(null)}><div className="board-card-view" onClick={(event) => event.stopPropagation()}><button className="card-view-close" onClick={() => setViewedCard(null)} aria-label="Close card details">×</button><GameCard card={viewedCard} onInspect={() => {}} showTraits={false} /><div><small>{viewedCard.type}{viewedCard.subtype ? ` · ${viewedCard.subtype}` : ''}</small><h3>{viewedCard.name}</h3><p>{viewedCard.text}</p>{viewedCard.severity && <strong>Current Severity: {viewedCard.severity}</strong>}{viewedCard.copies > 1 && <strong>Copies in stack: {viewedCard.copies} · Discomfort: {viewedCard.currentDiscomfort}</strong>}{viewedCard.traits?.length > 0 && <span>Traits: {viewedCard.traits.join(', ')}</span>}</div></div></div>}
      {logOpen && <aside className="battle-log-panel"><header><div><small>Match record</small><h3>History</h3></div><button onClick={() => setLogOpen(false)} aria-label="Close history">×</button></header><div className="battle-log-scroll">{[...new Set(match.log.map((entry) => entry.round))].reverse().map((round) => <section key={round}><h4>Round {round}</h4>{match.log.filter((entry) => entry.round === round).map((entry, index) => { const card = entry.cardId ? cardById(entry.cardId) : null; const visibleDetails = (entry.details || []).filter((detail) => detail.visibility === 'public' || detail.visibility === 'player'); const entryKey = `${round}-${index}-${entry.phase}`; const expanded = expandedLogEntries[entryKey]; return <div className={`battle-event-wrap actor-${entry.actor}`} key={entryKey}><button className={`battle-event ${visibleDetails.length ? 'has-details' : ''}`} onClick={() => visibleDetails.length && setExpandedLogEntries((current) => ({ ...current, [entryKey]: !current[entryKey] }))}>{card ? <span className={`event-card specialty-${card.specialty.toLowerCase()}`}>{card.mark}</span> : <span className="event-dot">•</span>}<div><small>{entry.phase}</small><p>{entry.text}</p></div>{visibleDetails.length > 0 && <b aria-label={expanded ? 'Hide card details' : 'Show card details'}>{expanded ? '⌃' : '⌄'}</b>}</button>{expanded && <div className="battle-event-details">{visibleDetails.map((detail, detailIndex) => { const detailCard = detail.cardId ? cardById(detail.cardId) : null; return <button key={`${detail.cardId}-${detailIndex}`} onClick={() => detailCard && setViewedCard(detailCard)}>{detailCard ? <span className={`event-card specialty-${detailCard.specialty.toLowerCase()}`}>{detailCard.mark}</span> : <span className="event-dot">•</span>}<span><small>{detail.visibility === 'public' ? 'Revealed' : 'Private to you'}</small><strong>{detail.text}</strong></span></button> })}</div>}</div> })}</section>)}</div></aside>}
      {match.result && <div className="board-result"><div><small>{isTutorial ? 'Lesson match complete' : 'Test match complete'}</small><h2>{winnerName} prevail</h2><p>{match.result === playerDeck.faction ? 'Your deck carried the foot to its goal.' : 'The opposing deck reached its goal first.'}</p><button onClick={() => setLogOpen(true)}>Review history</button><button onClick={() => { setMatch(createMatch(playerDeck, opponentDeck, tutorialFaction)); setTutorialIntroOpen(isTutorial); setTutorialGuide(tutorialFaction === 'archangels' ? 'archangel-round1-comfort' : tutorialFaction === 'callus' ? 'callus-round1-dampness' : 'off'); setTutorialCareActionsRemaining(3); setTargetingId(null); setSkipReplacementConfirm(false); setReplacementSlot(null) }}>Rematch</button><button onClick={onExit}>Return to {isTutorial ? 'lesson selection' : 'decks'}</button></div></div>}
    </div>
  )
}

function GameCard({ card, count = 0, incompatible = false, onInspect, onAdd, showTraits = true, showSupply = true }) {
  const traits = card.traits || []
  return (
    <article className={`game-card specialty-${card.specialty.toLowerCase()} ${incompatible ? 'is-incompatible' : ''}`} onClick={() => onInspect(card)}>
      <div className="game-card-art"><span>{card.mark}</span></div>
      {showSupply && card.faction === 'archangels' && <span className="game-card-supply" aria-label={`${card.cost} Supply cost`}>{card.cost} <small>Supply</small></span>}
      <div className="game-card-copy">
        <small>{card.type}{card.subtype ? ` · ${card.subtype}` : ''}</small>
        <strong>{card.name}</strong>
        <p>{card.text}</p>
      </div>
      {card.severity && <span className="severity-chip">{card.severity}</span>}
      {onAdd && <button onClick={(event) => { event.stopPropagation(); onAdd(card) }} aria-label={`Add ${card.name}`} disabled={incompatible}>+</button>}
      {count > 0 && <output>{count}</output>}
      {showTraits && traits.length > 0 && <div className="game-card-traits" aria-label={`Traits: ${traits.join(', ')}`}>
        {traits.slice(0, 2).map((trait) => <span key={trait}>{trait}</span>)}
        {traits.length > 2 && <span>+{traits.length - 2}</span>}
      </div>}
    </article>
  )
}

function DeckBuilder({ decks, setDecks, activeDeckId, setActiveDeckId, onTest, difficulty, setDifficulty }) {
  const [editingId, setEditingId] = useState(null)
  const [selectedId, setSelectedId] = useState(decks[0]?.id)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [showAllFactions, setShowAllFactions] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const [inspected, setInspected] = useState(null)
  const [detailedCard, setDetailedCard] = useState(null)
  const selectedDeck = decks.find((deck) => deck.id === selectedId) || decks[0]
  const editingDeck = decks.find((deck) => deck.id === editingId)

  useEffect(() => {
    if (!detailedCard) return undefined
    const closeOnEscape = (event) => event.key === 'Escape' && setDetailedCard(null)
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [detailedCard])

  const inspectCard = (card) => {
    setInspected(card)
    if (window.matchMedia('(max-width: 650px)').matches) setDetailedCard(card)
  }

  const updateDeck = (updater) => setDecks((current) => current.map((deck) => deck.id === editingId ? updater(deck) : deck))
  const addCard = (card) => {
    if (!editingDeck || card.faction !== editingDeck.faction) return setInspected(card)
    updateDeck((deck) => {
      const current = deck.cards[card.id] || 0
      if (current >= GAME_RULES.copyLimit || deckCardCount(deck) >= GAME_RULES.deckSize) return deck
      return { ...deck, cards: { ...deck.cards, [card.id]: current + 1 } }
    })
  }
  const removeCard = (cardId) => updateDeck((deck) => {
    const cards = { ...deck.cards }
    if (cards[cardId] <= 1) delete cards[cardId]
    else cards[cardId] -= 1
    return { ...deck, cards }
  })

  if (!editingDeck) return (
    <div className="decks-screen">
      <div className="decks-toolbar">
        <div><p>Deck workshop</p><h3>Your decks</h3></div>
        <button onClick={() => {
          const id = `deck-${Date.now()}`
          setDecks((current) => [...current, { id, name: 'New Archangel Deck', faction: 'archangels', cards: {} }])
          setSelectedId(id)
          setEditingId(id)
        }}>+ Create deck</button>
      </div>
      <div className="decks-layout">
        <div className="deck-grid">
          {decks.map((deck) => (
            <button key={deck.id} className={`deck-tile faction-${deck.faction} ${selectedDeck?.id === deck.id ? 'selected' : ''}`} onClick={() => setSelectedId(deck.id)}>
              <div className="deck-back"><span>{deck.faction === 'archangels' ? '✦' : '⌁'}</span></div>
              <small>{deck.faction === 'archangels' ? 'Archangels' : 'The Callus'}</small>
              <strong>{deck.name}</strong>
              <span>{deckCardCount(deck)} / {GAME_RULES.deckSize} · {deckIsValid(deck) ? 'Ready' : 'Incomplete'}</span>
            </button>
          ))}
        </div>
        {selectedDeck && <aside className="deck-summary-panel">
          <p>{selectedDeck.faction === 'archangels' ? 'Archangel deck' : 'The Callus deck'}</p>
          <h3>{selectedDeck.name}</h3>
          <div className="deck-status"><strong>{deckCardCount(selectedDeck)} / {GAME_RULES.deckSize}</strong><span>{deckIsValid(selectedDeck) ? 'Valid deck' : `Add ${GAME_RULES.deckSize - deckCardCount(selectedDeck)} cards`}</span></div>
          {activeDeckId[selectedDeck.faction] === selectedDeck.id ? <span className="active-deck-chip">Active deck</span> : <button className="quiet-deck-action" onClick={() => setActiveDeckId((current) => ({ ...current, [selectedDeck.faction]: selectedDeck.id }))}>Make active</button>}
          <div className="deck-actions"><button onClick={() => setEditingId(selectedDeck.id)}>Edit deck</button><button disabled={!deckIsValid(selectedDeck)} onClick={() => onTest(selectedDeck)}>Test deck</button></div>
          <label className="test-difficulty"><span>Test opponent</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>{Object.entries(TEST_DIFFICULTIES).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}</select><small>{TEST_DIFFICULTIES[difficulty].description}</small></label>
          <div className="deck-mini-list">{Object.entries(selectedDeck.cards).slice(0, 8).map(([id, count]) => { const card = testCardLibrary.find((item) => item.id === id); return card && <span key={id}>{card.name}<b>{count}</b></span> })}</div>
        </aside>}
      </div>
    </div>
  )

  const types = ['All', ...new Set(testCardLibrary.filter((card) => !card.debug).map((card) => card.type))]
  const visibleCards = testCardLibrary.filter((card) => (showDebug || !card.debug) && (showAllFactions || card.faction === editingDeck.faction) && (typeFilter === 'All' || card.type === typeFilter) && card.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="deck-editor">
      <div className="deck-editor-toolbar">
        <button onClick={() => setEditingId(null)}>← Decks</button>
        <input value={editingDeck.name} onChange={(event) => updateDeck((deck) => ({ ...deck, name: event.target.value }))} aria-label="Deck name" />
        <div className={deckIsValid(editingDeck) ? 'valid' : ''}>{deckCardCount(editingDeck)} / {GAME_RULES.deckSize}</div>
      </div>
      <div className="deck-editor-layout">
        <section className="card-library-panel">
          <div className="library-filters">
            <input type="search" placeholder="Search cards" value={search} onChange={(event) => setSearch(event.target.value)} />
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>{types.map((type) => <option key={type}>{type}</option>)}</select>
            <label><input type="checkbox" checked={showAllFactions} onChange={(event) => setShowAllFactions(event.target.checked)} /> Both factions</label>
            <label><input type="checkbox" checked={showDebug} onChange={(event) => setShowDebug(event.target.checked)} /> Debug</label>
          </div>
          <div className="card-library-grid">{visibleCards.map((card) => <GameCard key={card.id} card={card} count={editingDeck.cards[card.id]} incompatible={card.faction !== editingDeck.faction} onInspect={inspectCard} onAdd={addCard} />)}</div>
        </section>
        <aside className="current-deck-panel">
          <div className="current-deck-heading"><span>{editingDeck.faction === 'archangels' ? 'Archangels' : 'The Callus'}</span><strong>{deckIsValid(editingDeck) ? 'Ready to play' : 'Deck incomplete'}</strong></div>
          {inspected && <div className="inspection-card">
            <GameCard card={inspected} onInspect={() => setDetailedCard(inspected)} showTraits={false} />
            <div className="inspection-details">
              <p>{inspected.type}{inspected.subtype ? ` · ${inspected.subtype}` : ''}</p>
              <h4>{inspected.name}</h4>
              <span>{inspected.text}</span>
              {inspected.faction === 'archangels' && <small className="inspector-supply"><strong>Supply cost:</strong> {inspected.cost}</small>}
              {inspected.traits?.length > 0 && <small><strong>Traits:</strong> {inspected.traits.join(', ')}</small>}
              {inspected.faction !== editingDeck.faction && <em>{inspected.faction === 'callus' ? 'The Callus only' : 'Archangels only'}</em>}
              <button className="view-card-larger" onClick={() => setDetailedCard(inspected)}>View larger</button>
            </div>
          </div>}
          <div className="deck-card-list">{Object.entries(editingDeck.cards).map(([id, count]) => { const card = testCardLibrary.find((item) => item.id === id); return card && <button key={id} onClick={() => inspectCard(card)}><span>{card.mark}</span><strong>{card.name}</strong><small>× {count}</small><i onClick={(event) => { event.stopPropagation(); removeCard(id) }}>−</i></button> })}</div>
          <label className="test-difficulty"><span>Test opponent</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>{Object.entries(TEST_DIFFICULTIES).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}</select><small>{TEST_DIFFICULTIES[difficulty].description}</small></label>
          <button className="test-deck-button" disabled={!deckIsValid(editingDeck)} onClick={() => onTest(editingDeck)}>Test deck</button>
        </aside>
      </div>
      {detailedCard && <div className="deck-card-detail-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setDetailedCard(null)}>
        <section className="deck-card-detail" role="dialog" aria-modal="true" aria-label={`${detailedCard.name} card details`}>
          <button className="deck-card-detail-close" onClick={() => setDetailedCard(null)} aria-label="Close card details">×</button>
          <GameCard card={detailedCard} count={editingDeck.cards[detailedCard.id] || 0} onInspect={() => {}} showTraits={false} />
          <div><small>{detailedCard.type}{detailedCard.subtype ? ` · ${detailedCard.subtype}` : ''}</small><h3>{detailedCard.name}</h3><p>{detailedCard.text}</p>{detailedCard.faction === 'archangels' && <span><strong>Supply cost:</strong> {detailedCard.cost}</span>}{detailedCard.severity && <span><strong>Starting Severity:</strong> {detailedCard.severity}</span>}{detailedCard.traits?.length > 0 && <span><strong>Traits:</strong> {detailedCard.traits.join(', ')}</span>}<span><strong>In this deck:</strong> {editingDeck.cards[detailedCard.id] || 0}</span></div>
        </section>
      </div>}
    </div>
  )
}

function HoneyfootCards() {
  const { profile: playerProfile, dispatch: playerProfileDispatch } = usePlayerProfile()
  const [section, setSection] = useState(() => localStorage.getItem('honeyfoot-card-section') || 'Home')
  const [mode, setMode] = useState(() => localStorage.getItem('honeyfoot-card-mode') || 'archangels')
  const [theme, setTheme] = useState(() => localStorage.getItem('honeyfoot-card-theme') || 'garden')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [decks, setDecks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('honeyfoot-card-decks')) || starterDecks } catch { return starterDecks }
  })
  const [activeDeckId, setActiveDeckId] = useState(() => {
    try { return JSON.parse(localStorage.getItem('honeyfoot-active-decks')) || { archangels: 'everyday-comfort', callus: 'pressure-friction' } } catch { return { archangels: 'everyday-comfort', callus: 'pressure-friction' } }
  })
  const [testNotice, setTestNotice] = useState('')
  const [boardDeckId, setBoardDeckId] = useState(() => localStorage.getItem('honeyfoot-board-deck-id') || null)
  const [testDifficulty, setTestDifficulty] = useState(() => localStorage.getItem('honeyfoot-test-difficulty') || 'training')
  const [lessonSelecting, setLessonSelecting] = useState(false)
  const [lessonFaction, setLessonFaction] = useState(null)
  const [tutorialFaction, setTutorialFaction] = useState(() => localStorage.getItem('honeyfoot-tutorial-faction') || null)

  useEffect(() => {
    localStorage.setItem('honeyfoot-card-theme', theme)
  }, [theme])

  useEffect(() => { localStorage.setItem('honeyfoot-card-decks', JSON.stringify(decks)) }, [decks])
  useEffect(() => { localStorage.setItem('honeyfoot-active-decks', JSON.stringify(activeDeckId)) }, [activeDeckId])
  useEffect(() => { localStorage.setItem('honeyfoot-test-difficulty', testDifficulty) }, [testDifficulty])
  useEffect(() => { localStorage.setItem('honeyfoot-card-section', section) }, [section])
  useEffect(() => { localStorage.setItem('honeyfoot-card-mode', mode) }, [mode])
  useEffect(() => { boardDeckId ? localStorage.setItem('honeyfoot-board-deck-id', boardDeckId) : localStorage.removeItem('honeyfoot-board-deck-id') }, [boardDeckId])
  useEffect(() => { tutorialFaction ? localStorage.setItem('honeyfoot-tutorial-faction', tutorialFaction) : localStorage.removeItem('honeyfoot-tutorial-faction') }, [tutorialFaction])

  const activeFaction = mode === 'callus' ? 'callus' : 'archangels'
  const activeDeck = decks.find((deck) => deck.id === activeDeckId[activeFaction])
  const activeAvatar = profileAvatars.find((avatar) => avatar.id === playerProfile.identity.avatarId)
  const testDeck = (deck) => {
    setTutorialFaction(null)
    setMode(deck.faction)
    setBoardDeckId(deck.id)
    setSection('Board')
    setTestNotice('')
  }
  const beginLessonMatch = () => {
    if (!lessonFaction) return
    const lessonDeckId = lessonFaction === 'archangels' ? 'everyday-comfort' : 'pressure-friction'
    const lessonOpponentId = lessonFaction === 'archangels' ? 'pressure-friction' : 'everyday-comfort'
    localStorage.removeItem(`honeyfoot-tutorial-${lessonFaction}-v1-${lessonDeckId}-${lessonOpponentId}`)
    setTutorialFaction(lessonFaction)
    setMode(lessonFaction)
    setTestDifficulty('training')
    setBoardDeckId(lessonDeckId)
    setSection('Board')
  }
  const beginHomeMatch = () => {
    if (mode === 'learn') return setLessonSelecting(true)
    if (!activeDeck || !deckIsValid(activeDeck)) {
      setTestNotice('Choose a complete 24-card deck before playing.')
      return
    }
    setTutorialFaction(null)
    setBoardDeckId(activeDeck.id)
    setSection('Board')
    setTestNotice('')
  }
  const boardDeck = decks.find((deck) => deck.id === boardDeckId)
  const tutorialOpponentId = tutorialFaction === 'archangels' ? 'pressure-friction' : tutorialFaction === 'callus' ? 'everyday-comfort' : null
  const opponentDeck = tutorialOpponentId
    ? decks.find((deck) => deck.id === tutorialOpponentId) || starterDecks.find((deck) => deck.id === tutorialOpponentId)
    : decks.find((deck) => deck.faction !== boardDeck?.faction && deckIsValid(deck)) || starterDecks.find((deck) => deck.faction !== boardDeck?.faction)

  return (
    <section className={`cards-home theme-${theme}`}>
      <header className="cards-nav">
        <button className="cards-wordmark" onClick={() => setSection('Home')} aria-label="Honeyfoot Cards home">
          <span>Honeyfoot</span> Cards
        </button>
        <nav aria-label="Honeyfoot Cards navigation">
          {['Home', 'Decks', 'Profile', 'Shop'].map((item) => (
            <button key={item} className={section === item ? 'active' : ''} onClick={() => setSection(item)}>{item}</button>
          ))}
        </nav>
        <div className="cards-wallet">
          <span className="petal-token" aria-hidden="true">✦</span>
          <strong>{playerProfile.wallet.petals.toLocaleString()}</strong>
          <button className="cards-settings" onClick={() => setSettingsOpen((open) => !open)} aria-label="Theme settings" aria-expanded={settingsOpen}>•••</button>
          {settingsOpen && (
            <div className="theme-menu">
              <small>Choose a theme</small>
              {Object.entries(cardThemes).map(([id, item]) => (
                <button key={id} className={theme === id ? 'active' : ''} onClick={() => { setTheme(id); setSettingsOpen(false) }}>{item.label}</button>
              ))}
            </div>
          )}
        </div>
      </header>

      {section === 'Board' && boardDeck && opponentDeck ? (
        <HoneyfootBoard playerDeck={boardDeck} opponentDeck={opponentDeck} difficulty={testDifficulty} tutorialFaction={tutorialFaction} onExit={() => {
          if (tutorialFaction) { setMode('learn'); setLessonFaction(tutorialFaction); setLessonSelecting(true); setTutorialFaction(null); setSection('Home') }
          else setSection('Decks')
        }} />
      ) : section === 'Home' ? (
        <div className="cards-home-layout">
          <div className="cards-character-panel">
            <div className="cards-ambient-shape shape-one" />
            <div className="cards-ambient-shape shape-two" />
            <img src={assetUrl('/honeyfoot-cards/home-care-character-v1-edit.png')} alt="A stylish woman enjoying a relaxed foot-care routine" />
            <div className="cards-character-copy">
              <p>Season one</p>
              <h3>Every step<br />tells a story.</h3>
            </div>
          </div>

          <div className={`cards-dashboard ${mode === 'learn' && lessonSelecting ? 'is-lesson-selecting' : ''}`}>
            {mode === 'learn' && lessonSelecting ? (
              <div className="lesson-faction-select">
                <header>
                  <button type="button" onClick={() => { setLessonSelecting(false); setLessonFaction(null) }}>← Back</button>
                  <div><p className="modern-eyebrow">First lesson</p><h3>Select a faction</h3><span>Choose the side you would like to learn first.</span></div>
                </header>
                <div className="lesson-faction-cards">
                  {[
                    { faction: 'archangels', label: 'Archangels', deck: 'Everyday Comfort', mark: '✦', copy: 'Ease Conditions and restore Comfort through thoughtful care.' },
                    { faction: 'callus', label: 'The Callus', deck: 'Pressure & Friction', mark: '⌁', copy: 'Build everyday pressure through Conditions and disruptive influences.' },
                  ].map((choice) => (
                    <button key={choice.faction} type="button" className={`lesson-faction-card faction-${choice.faction} ${lessonFaction === choice.faction ? 'selected' : ''}`} aria-pressed={lessonFaction === choice.faction} onClick={() => setLessonFaction(choice.faction)}>
                      <span className="lesson-deck-back"><i>{choice.mark}</i></span>
                      <small>{choice.label}</small>
                      <strong>{choice.deck}</strong>
                      <em>24 cards · Starter deck</em>
                      <p>{choice.copy}</p>
                    </button>
                  ))}
                </div>
                <div className={`lesson-confirm ${lessonFaction ? 'ready' : ''}`} aria-live="polite">
                  {lessonFaction ? <><span>You selected {lessonFaction === 'archangels' ? 'the Archangels' : 'The Callus'}.</span><button type="button" onClick={beginLessonMatch}>Begin as {lessonFaction === 'archangels' ? 'Archangels' : 'The Callus'}</button></> : <span>Select a starter deck to continue.</span>}
                </div>
              </div>
            ) : <>
            <div className="faction-tabs" role="tablist" aria-label="Play mode">
              <button role="tab" aria-selected={mode === 'archangels'} onClick={() => { setMode('archangels'); setLessonSelecting(false) }}>Archangels</button>
              <button role="tab" aria-selected={mode === 'callus'} onClick={() => { setMode('callus'); setLessonSelecting(false) }}>The Callus</button>
              <button role="tab" aria-selected={mode === 'learn'} onClick={() => setMode('learn')}>Learn</button>
            </div>

            <div className="cards-play-center">
              <div className={`level-hex faction-${mode}`}>
                <span>{mode === 'callus' ? 'The Callus' : mode === 'learn' ? 'Care studies' : 'Archangel'}</span>
                <strong>12</strong>
                <small>Level</small>
              </div>
              <div className="active-deck">
                <span>Selected deck</span>
                <strong>{mode === 'learn' ? 'Guided practice' : activeDeck?.name || 'Choose a deck'}</strong>
              </div>
              {mode !== 'learn' && <label className="home-opponent-select"><span>Computer opponent</span><select value={testDifficulty} onChange={(event) => setTestDifficulty(event.target.value)}>{Object.entries(TEST_DIFFICULTIES).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}</select></label>}
              <button className="cards-play-button" onClick={beginHomeMatch}>{mode === 'learn' ? 'Begin lesson' : 'Play'}</button>
              {testNotice && <p className="test-notice">{testNotice}</p>}
            </div>

            <div className="cards-shortcuts">
              <button onClick={() => setSection('Decks')}><span>▱</span><strong>Decks</strong><small>Build your strategy</small></button>
              <button onClick={() => setSection('Profile')}>{activeAvatar ? <ProfileAvatar avatar={activeAvatar} footProfile={playerProfile.footProfile} compact /> : <span className="empty-profile">+</span>}<strong>Profile</strong>{!activeAvatar && <small>Choose an icon</small>}</button>
              <button onClick={() => setSection('Shop')}><span>✦</span><strong>Shop</strong><small>Discover new cards</small></button>
            </div>
            </>}
          </div>
        </div>
      ) : section === 'Decks' ? (
        <DeckBuilder decks={decks} setDecks={setDecks} activeDeckId={activeDeckId} setActiveDeckId={setActiveDeckId} onTest={testDeck} difficulty={testDifficulty} setDifficulty={setTestDifficulty} />
      ) : section === 'Profile' ? (
        <PlayerProfileView profile={playerProfile} dispatch={playerProfileDispatch} />
      ) : (
        <div className="cards-coming-soon">
          <p className="modern-eyebrow">Honeyfoot Cards</p>
          <h3>{section}</h3>
          <p>This area is ready for its next design pass. The home navigation is already connected.</p>
          <button onClick={() => setSection('Home')}>Return home</button>
        </div>
      )}
    </section>
  )
}

function CareToolsPage({ profile, dispatch }) {
  const [activeApp, setActiveApp] = useState(() => localStorage.getItem('honeyfoot-active-app') || 'explorer')

  useEffect(() => { localStorage.setItem('honeyfoot-active-app', activeApp) }, [activeApp])

  return (
    <main className="care-tools-page">
      <div className="tools-heading">
        <p className="modern-eyebrow">Honeyfoot care tools</p>
        <h1>Care more curiously.</h1>
        <p>Explore, personalize, and play through a growing collection of approachable foot-care experiences.</p>
      </div>
      <div className="app-tabs" role="tablist" aria-label="Honeyfoot apps">
        {appTabs.map((tab) => (
          <button key={tab.id} role="tab" aria-selected={activeApp === tab.id} onClick={() => setActiveApp(tab.id)}>
            <small>{tab.verb}</small>{tab.label}
          </button>
        ))}
      </div>
      <div className="care-app-panel" hidden={activeApp !== 'explorer'} aria-hidden={activeApp !== 'explorer'}>
        <FootExplorer />
      </div>
      <div className="care-app-panel" hidden={activeApp !== 'studio'} aria-hidden={activeApp !== 'studio'}>
        <CareStudio profile={profile} dispatch={dispatch} />
      </div>
      <div className="care-app-panel" hidden={activeApp !== 'cards'} aria-hidden={activeApp !== 'cards'}>
        <HoneyfootCards />
      </div>
    </main>
  )
}

function LegacyPlaceholder({ page }) {
  return (
    <main className="legacy-placeholder">
      <img src={assetUrl('/clinic-assets/stones-leaves.png')} alt="Smooth stones and green leaves" />
      <h1>{page}</h1>
      <p>This page is represented in the client mockup. Select Home or Care Tools to explore the working presentation.</p>
    </main>
  )
}

function LoginDialog({ onClose }) {
  useEffect(() => {
    const closeOnEscape = (event) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [onClose])

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="login-dialog" role="dialog" aria-modal="true" aria-labelledby="login-title">
        <button className="dialog-close" onClick={onClose} aria-label="Close login notice">×</button>
        <p className="modern-eyebrow">Presentation mode</p>
        <h2 id="login-title">Login is disabled.</h2>
        <p>This is a demonstration website. No account information is collected and login functionality has not been connected.</p>
        <button className="dialog-button" onClick={onClose}>Return to the mockup</button>
      </section>
    </div>
  )
}

function SiteFooter() {
  return (
    <footer className="legacy-footer">
      <h2>We Would Love to Have You Visit Soon!</h2>
      <div>
        <p><strong>Hours</strong><br />M-F: 8am - 5pm</p>
        <p><strong>601-918-0825</strong></p>
        <p><strong>Email</strong><br />versherne@gmail.com</p>
      </div>
    </footer>
  )
}

export default function App() {
  const { profile: playerProfile, dispatch: dispatchPlayerProfile } = usePlayerProfile()
  const [page, setPage] = useState(() => localStorage.getItem('honeyfoot-site-page') || 'Home')
  const [loginOpen, setLoginOpen] = useState(false)

  useEffect(() => { localStorage.setItem('honeyfoot-site-page', page) }, [page])
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [page])

  return (
    <>
      <SiteHeader page={page} setPage={setPage} openLogin={() => setLoginOpen(true)} />
      {page === 'Home' && <HomePage />}
      {page === 'Care Tools' && <CareToolsPage profile={playerProfile.footProfile} dispatch={(action) => dispatchPlayerProfile(action.type === 'reset' ? { type: 'foot/reset' } : { ...action, type: 'foot/set' })} />}
      {!['Home', 'Care Tools'].includes(page) && <LegacyPlaceholder page={page} />}
      <SiteFooter />
      {loginOpen && <LoginDialog onClose={() => setLoginOpen(false)} />}
    </>
  )
}
