import {
  findNounMatchesInText,
  KOREAN_NOUN_LABELS,
  buildCaptionFromNouns,
} from './koreanNounDictionary'

const ENTITY_LEXICON = [
  { type: 'baby_fish', keywords: ['아기물고기', '아기 물고기', '새끼물고기', '작은물고기'] },
  { type: 'shark', keywords: ['상어', '만타', '고등어상어'] },
  { type: 'whale', keywords: ['고래', '돌고래'] },
  { type: 'fish', keywords: ['물고기', '금붕어', '열대어'] },
  { type: 'ant', keywords: ['개미', '아기개미', '개미들', '개미가', '개미는', '개미를'] },
  { type: 'cat', keywords: ['고양이', '야옹', '냥이'] },
  { type: 'dog', keywords: ['강아지', '멍멍', '댕댕이', '개'] },
  { type: 'bird', keywords: ['새', '비둘기', '참새', '까치'] },
  { type: 'rabbit', keywords: ['토끼'] },
  { type: 'bear', keywords: ['곰', '곰돌이'] },
  { type: 'butterfly', keywords: ['나비'] },
  { type: 'dinosaur', keywords: ['공룡'] },
  { type: 'child', keywords: ['아이', '어린이', '친구'] },
  { type: 'family', keywords: ['엄마', '아빠', '할머니', '할아버지', '가족'] },
  { type: 'frog', keywords: ['개구리'] },
  { type: 'duck', keywords: ['오리', '병아리'] },
  { type: 'caterpillar', keywords: ['애벌레', '애벌'] },
  { type: 'turtle', keywords: ['바다거북', '육지거북', '거북이', '거북'] },
  { type: 'snail', keywords: ['달팽이'] },
  { type: 'pig', keywords: ['돼지', '멧돼지'] },
  { type: 'cow', keywords: ['화소', '소'] },
  { type: 'horse', keywords: ['말', '조랑말', 'pony'] },
  { type: 'tiger', keywords: ['호랑이', '범'] },
  { type: 'fox', keywords: ['여우'] },
  { type: 'bee', keywords: ['꿀벌', '벌'] },
  { type: 'lion', keywords: ['사자'] },
  { type: 'elephant', keywords: ['코끼리'] },
  { type: 'penguin', keywords: ['펭귄'] },
  { type: 'cloud', keywords: ['구름', '뭉게구름', '흰구름', '먹구름', '구름이', '구름은', '구름을', '구름들'] },
  { type: 'rainbow', keywords: ['무지개'] },
  { type: 'sun', keywords: ['해', '햇님', '태양'] },
  { type: 'moon', keywords: ['달', '보름달', '초승달'] },
  { type: 'star', keywords: ['별', '별들'] },
]

const SETTING_KEYWORDS = [
  { id: 'sea', keywords: ['바다', '해변', '파도', '바닷물', '심해', '수중', '물속'] },
  { id: 'forest', keywords: ['숲', '숲속', '산'] },
  { id: 'picnic', keywords: ['소풍', '피크닉', '도시락'] },
  { id: 'park', keywords: ['공원', '놀이터', '잔디'] },
  { id: 'house', keywords: ['집', '방', '마을'] },
  { id: 'school', keywords: ['학교', '교실'] },
  { id: 'farm', keywords: ['농장', '들판'] },
  { id: 'space', keywords: ['우주', '로켓'] },
  { id: 'sky', keywords: ['하늘', '하늘에서', '하늘위', '하늘을'] },
]

const SEA_TYPES = new Set(['shark', 'fish', 'baby_fish', 'whale', 'dolphin', 'octopus', 'jellyfish', 'turtle'])
const WEATHER_KEYWORDS = [
  { id: 'rain', keywords: ['비', '장마', '우산', '빗방울', '소나기', '천둥'] },
  { id: 'snow', keywords: ['눈', '눈사람', '눈송이', '눈이'] },
  { id: 'night', keywords: ['밤', '별', '초저녁', '꿈'] },
  { id: 'sunset', keywords: ['노을', '저녁', '황혼', '석양'] },
  { id: 'cloudy', keywords: ['구름', '흐림', '흐려', '구름낀', '먹구름', '뭉게구름', '흰구름'] },
  { id: 'sunny', keywords: ['햇님', '맑', '화창', '태양', '해'] },
]

const SKY_TYPES = new Set(['bird', 'butterfly', 'bee', 'cloud', 'rainbow', 'sun', 'moon', 'star'])
const LAND_TYPES = new Set([
  'cat', 'dog', 'rabbit', 'bear', 'lion', 'elephant', 'child', 'family',
  'ant', 'dinosaur', 'caterpillar', 'turtle', 'snail', 'pig', 'cow', 'horse', 'tiger', 'fox', 'frog', 'penguin',
  'spider', 'worm', 'dragonfly', 'ladybug', 'monkey', 'giraffe', 'sheep', 'goat', 'deer', 'chicken',
  'octopus', 'crab',
])

const ACTION_PATTERNS = [
  {
    id: 'fighting',
    patterns: [
      '싸우', '싸움', '싸워', '싸웠', '싸울', '격투', '대결', '붙었', '붙어', '맞붙',
      '주먹', '발로차', '발로 차', '때리', '공격', '몸싸움', '난투', '싸웠',
      '말싸움', '언쟁', '다투', '입총', '화가나', '화가 나', '성냈', '화내',
    ],
  },
  { id: 'dancing', patterns: ['춤을추', '춤추', '춤을', '춤', '댄스'] },
  { id: 'eating', patterns: ['잡아먹', '먹고있', '먹고 있', '삼키', '잡아 먹', '먹어', '먹는'] },
  { id: 'chasing', patterns: ['쫓', '뒤쫓', '도망', '도망가'] },
  { id: 'swimming', patterns: ['헤엄', '수영', '헤어'] },
  { id: 'walking', patterns: ['걸어', '걷', '간', '가고', '간다', '갔'] },
  { id: 'playing', patterns: ['놀', '게임', '만든', '만들', '짓', '짓는', '거미줄'] },
  { id: 'sleeping', patterns: ['자고', '잠', '잔다'] },
  { id: 'flying', patterns: ['날', '날아', '비행', '떠', '떠있', '떠 있', '흘러'] },
  { id: 'running', patterns: ['뛰', '달리'] },
]

const PHYSICAL_FIGHT_PATTERNS = ['주먹', '발로차', '발로차', '때리', '공격', '몸싸움', '난투', '맞붙', '격투']
const VERBAL_FIGHT_PATTERNS = ['말싸움', '언쟁', '다투', '입총', '말로']

export const SUBJECT_KOREAN = {
  ...KOREAN_NOUN_LABELS,
  shark: '상어', baby_fish: '아기 물고기', fish: '물고기', whale: '고래',
  ant: '개미', cat: '고양이', dog: '강아지', bird: '새', rabbit: '토끼',
  bear: '곰', butterfly: '나비', child: '아이', dinosaur: '공룡',
  family: '가족', frog: '개구리', duck: '오리', bee: '벌', caterpillar: '애벌레',
  turtle: '거북이', snail: '달팽이', pig: '돼지', cow: '소', horse: '말',
  tiger: '호랑이', fox: '여우',
  lion: '사자', elephant: '코끼리', penguin: '펭귄',
  cloud: '구름', rainbow: '무지개', sun: '해', moon: '달', star: '별',
}

function isKeywordAllowed(normalized, kw, idx) {
  if (kw === '벌' && idx > 0 && normalized[idx - 1] === '애') return false
  if (kw === '개') {
    const next = normalized[idx + 1]
    if (['미', '발', '선', '요', '인'].includes(next)) return false
  }
  if (kw === '말') {
    const next = normalized[idx + 1]
    const prev = normalized[idx - 1]
    if (['하', '했', '해', '함', '투'].includes(next)) return false
    if (prev === '할' || prev === '음') return false
  }
  if (kw === '소') {
    const next = normalized[idx + 1]
    if (['풍', '리', '속', '통', '개'].includes(next)) return false
  }
  if (kw === '새') {
    if (normalized.slice(idx, idx + 2) === '새로') return false
    if (normalized.slice(idx, idx + 3) === '새롭') return false
  }
  if (kw === '범' && idx > 0 && normalized[idx - 1] === '범') return false
  if (kw === '해') {
    const next = normalized[idx + 1]
    if (['어', '염', '결', '당', '체'].includes(next)) return false
  }
  return true
}

function normalize(text) {
  return text.replace(/\s+/g, '')
}

function findEntitiesInOrder(text) {
  return findNounMatchesInText(text).types
}

function findExplicitSetting(text) {
  const normalized = normalize(text)
  for (const rule of SETTING_KEYWORDS) {
    if (rule.keywords.some((k) => normalized.includes(k.replace(/\s+/g, '')))) {
      return rule.id
    }
  }
  return null
}

function findExplicitWeather(text, entityTypes) {
  if (entityTypes.includes('cloud')) return 'cloudy'
  const normalized = normalize(text)
  for (const rule of WEATHER_KEYWORDS) {
    if (rule.keywords.some((k) => normalized.includes(k.replace(/\s+/g, '')))) {
      return rule.id
    }
  }
  return 'sunny'
}

function inferSetting(entityTypes, explicitSetting) {
  if (explicitSetting) return explicitSetting
  if (entityTypes.includes('spider')) return 'house'
  if (entityTypes.some((t) => t === 'cloud') && entityTypes.every((t) => SKY_TYPES.has(t))) return 'sky'
  if (entityTypes.some((t) => ['elephant', 'lion'].includes(t))) return 'savanna'
  if (entityTypes.includes('mountain')) return 'forest'
  if (entityTypes.some((t) => SEA_TYPES.has(t))) return 'sea'
  if (entityTypes.some((t) => SKY_TYPES.has(t)) && !entityTypes.some((t) => LAND_TYPES.has(t))) return 'park'
  if (entityTypes.some((t) => LAND_TYPES.has(t))) return 'park'
  return 'park'
}

function detectAction(text) {
  const normalized = normalize(text)
  for (const { id, patterns } of ACTION_PATTERNS) {
    if (patterns.some((p) => normalized.includes(p.replace(/\s+/g, '')))) {
      return id
    }
  }
  return 'walking'
}

function splitStoryClauses(text) {
  return text
    .split(/[.!?…]+|\s*(?:그리고|그런데|하지만|그래서|그러자|그러나|그리고나서|한편)\s*/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function clauseHasFighting(clause) {
  const n = normalize(clause)
  return ACTION_PATTERNS.find((p) => p.id === 'fighting')?.patterns.some((pat) =>
    n.includes(pat.replace(/\s+/g, ''))
  )
}

function detectConflictIntensity(text) {
  const n = normalize(text)
  if (PHYSICAL_FIGHT_PATTERNS.some((p) => n.includes(p.replace(/\s+/g, '')))) return 'physical'
  if (VERBAL_FIGHT_PATTERNS.some((p) => n.includes(p.replace(/\s+/g, '')))) return 'verbal'
  return 'physical'
}

function extractFightingEntities(text, fallbackTypes) {
  const clauses = splitStoryClauses(text)
  const fightingClauses = clauses.filter(clauseHasFighting)

  const n = normalize(text)
  if (/두(?:명의)?아이|두(?:명의)?어린이|두(?:명의)?친구/.test(n)) {
    return ['child', 'child']
  }

  for (const clause of fightingClauses) {
    const inClause = findEntitiesInOrder(clause)
    if (inClause.length >= 2) return inClause.slice(0, 2)
    if (inClause.length === 1 && fallbackTypes.length >= 2) {
      const other = fallbackTypes.find((t) => t !== inClause[0])
      if (other) return [inClause[0], other]
    }
  }

  const pairMatch = n.match(
    /([\uac00-\ud7a3]+)(?:와|과|랑|하고)([\uac00-\ud7a3]+)(?:가|은|는|이)?.*?(?:싸우|격투|대결|다투|붙|말싸움|언쟁)/
  )
  if (pairMatch) {
    const left = findEntitiesInOrder(pairMatch[1])
    const right = findEntitiesInOrder(pairMatch[2])
    if (left.length && right.length) return [left[0], right[0]]
  }

  return fallbackTypes.slice(0, 2)
}

function detectFightOutcome(text) {
  const n = normalize(text)
  if (['이겼', '이기', '승리', '이겼다'].some((k) => n.includes(k))) return 'someone_won'
  if (['졌', '패배', '도망', '물러'].some((k) => n.includes(k))) return 'someone_lost'
  return 'ongoing'
}

function detectFormation(text) {
  const normalized = normalize(text)
  if (['줄', '일렬', '줄지어', '줄서'].some((k) => normalized.includes(k))) return 'line'
  if (['함께', '같이', '무리'].some((k) => normalized.includes(k))) return 'group'
  return 'single'
}

function parseAntCount(text) {
  const n = normalize(text)
  const numMatch = n.match(/(\d+)마리의?개미|개미(\d+)마리/)
  if (numMatch) return Math.min(Math.max(parseInt(numMatch[1] || numMatch[2], 10), 2), 20)
  if (/여러|많은|무리/.test(n)) return 12
  if (/줄|일렬|줄지어|줄서/.test(n)) return 10
  return 8
}

function buildCharacters(entityTypes, action, options = {}) {
  const { conflictIntensity = 'physical', originalText = '' } = options

  if (action === 'fighting') {
    const fighters = entityTypes.slice(0, 2)
    if (fighters.length === 1) fighters.push('child')
    if (fighters.length === 0) fighters.push('child', 'child')

    return fighters.map((type, i) => ({
      type,
      count: 1,
      action: 'fighting',
      role: i === 0 ? 'fighter' : 'opponent',
      facing: i === 0 ? 'right' : 'left',
      size: type === 'shark' ? 'large' : 'normal',
      detail: conflictIntensity === 'verbal' ? 'calm curious expression' : 'gentle playful pose',
      english: SUBJECT_KOREAN[type] ?? type,
    }))
  }

  if (entityTypes.length === 0) return [{ type: 'child', count: 1, action, role: 'subject', english: '아이' }]

  const skyOnly = entityTypes.every((t) => SKY_TYPES.has(t))
  if (skyOnly && entityTypes.includes('cloud')) {
    return entityTypes.map((type) => ({
      type,
      count: 1,
      action: type === 'cloud' ? (action === 'walking' ? 'flying' : action) : action,
      role: 'subject',
      detail: type === 'cloud' ? 'large fluffy white cumulus cloud' : '',
      english: SUBJECT_KOREAN[type] ?? type,
    }))
  }

  return entityTypes.map((type, i) => {
    let role = 'subject'
    let charAction = action

    if (action === 'eating' && entityTypes.length >= 2) {
      if (i === 0) {
        role = 'predator'
        charAction = 'eating'
      } else {
        role = 'prey'
        charAction = 'being_eaten'
      }
    } else if (action === 'chasing' && entityTypes.length >= 2) {
      role = i === 0 ? 'chaser' : 'fleeing'
      charAction = i === 0 ? 'chasing' : 'fleeing'
    }

    const isBaby = type === 'baby_fish'
    const isAnt = type === 'ant'
    const isSpider = type === 'spider'
    return {
      type,
      count: isAnt ? parseAntCount(originalText) : 1,
      action: charAction,
      role,
      size: isBaby ? 'small' : type === 'shark' ? 'large' : 'normal',
      detail: isBaby ? 'tiny cute baby fish' : isAnt ? 'black insect ant with six legs' : isSpider ? 'small friendly spider on a delicate web' : '',
      english: SUBJECT_KOREAN[type] ?? type,
    }
  })
}

function detectScenario(entityTypes, action, setting, text) {
  const normalized = normalize(text)

  if (
    entityTypes.includes('ant') &&
    detectFormation(text) === 'line' &&
    (setting === 'picnic' || ['소풍', '피크닉', '공원'].some((k) => normalized.includes(k)))
  ) {
    return 'ants_line_picnic'
  }

  if (entityTypes.includes('ant') && detectFormation(text) === 'line') {
    return 'ants_line'
  }

  if (entityTypes.includes('ant') && (setting === 'picnic' || ['소풍', '피크닉'].some((k) => normalized.includes(k)))) {
    return 'ants_picnic'
  }

  if (entityTypes.includes('ant')) {
    return 'ants_group'
  }

  if (
    entityTypes.includes('shark') &&
    (entityTypes.includes('baby_fish') || entityTypes.includes('fish')) &&
    (action === 'eating' || action === 'chasing')
  ) {
    return 'shark_eating_fish'
  }

  if (entityTypes.includes('shark') && action === 'eating') {
    return 'shark_eating_fish'
  }

  if (action === 'fighting' && entityTypes.length >= 2) {
    return 'characters_fighting'
  }

  if (entityTypes.includes('cloud') && entityTypes.every((t) => SKY_TYPES.has(t))) {
    return 'cloud_sky'
  }

  if (entityTypes.includes('spider') && /거미줄|만든|만들|짓/.test(normalized)) {
    return 'spider_web'
  }

  return null
}

function buildCaption(entityTypes, action, setting, options = {}) {
  const settingKo = { sea: '바다', picnic: '소풍', park: '공원', forest: '숲', house: '집', savanna: '사바나', sky: '하늘' }
  const actionKo = {
    eating: '잡아먹는 중',
    chasing: '쫓는 중',
    swimming: '헤엄치는 중',
    playing: '노는 중',
    dancing: '춤추는 중',
    walking: '걷는 중',
    running: '달리는 중',
    sleeping: '자는 중',
    flying: '떠 있는 중',
    fighting: options.conflictIntensity === 'verbal' ? '말다툼 중' : '싸우는 중',
  }

  const parts = []
  if (settingKo[setting]) parts.push(settingKo[setting])
  entityTypes.slice(0, 3).forEach((t) => {
    if (SUBJECT_KOREAN[t]) parts.push(SUBJECT_KOREAN[t])
  })
  if (actionKo[action]) parts.push(actionKo[action])
  return parts.join(' · ')
}

function buildSceneDescription(characters, action, setting, options = {}) {
  const settingDesc = {
    sea: 'underwater ocean scene with blue water and light rays',
    park: 'sunny green park',
    picnic: 'picnic on grass',
    forest: 'green forest',
    savanna: 'African savanna with dry grass',
    house: 'outdoor yard near a house',
    sky: 'wide open blue sky',
  }

  if (options.entityTypes?.includes('spider') || characters.some((c) => c.type === 'spider')) {
    return (
      `${settingDesc[setting] ?? 'a cozy corner'}. ` +
      'A small friendly spider with eight legs on a delicate web, soft daylight, child-friendly, not scary.'
    )
  }

  if (options.entityTypes?.includes('cloud') || options.weather === 'cloudy') {
    return (
      `${settingDesc[setting] ?? 'wide open blue sky'}. ` +
      'Large fluffy white cumulus clouds floating peacefully in a bright blue sky. ' +
      'Soft daylight, gentle and calm, child-friendly skyscape.'
    )
  }

  if (action === 'fighting' && characters.length >= 2) {
    const fighter = characters.find((c) => c.role === 'fighter') ?? characters[0]
    const opponent = characters.find((c) => c.role === 'opponent') ?? characters[1]
    const interaction =
      options.conflictIntensity === 'verbal'
        ? 'talking face to face with curious calm expressions'
        : 'standing face to face in a mild playful way'

    return (
      `${settingDesc[setting] ?? 'a sunny gentle scene'}. ` +
      `A ${fighter.english} and a ${opponent.english} are ${interaction}. ` +
      `Soft warm colors, child-friendly, calm and wholesome, no aggression or fear.`
    )
  }

  if (action === 'eating' && characters.length >= 2) {
    const predator = characters.find((c) => c.role === 'predator') ?? characters[0]
    const prey = characters.find((c) => c.role === 'prey') ?? characters[1]
    return (
      `${settingDesc[setting] ?? 'a calm gentle scene'}. ` +
      `A ${predator.english} and a small ${prey.english} swimming peacefully together in soft blue water. ` +
      `Friendly calm mood, both animals safe and gentle, no scary or violent moments.`
    )
  }

  const antChar = characters.find((c) => c.type === 'ant')
  if (antChar) {
    const count = antChar.count ?? 8
    const line = options.formation === 'line'
    return (
      `${settingDesc[setting] ?? 'sunny green park'}. ` +
      `${line ? `A neat line of ${count} small black ants marching in single file` : `A group of ${count} small black ants`} ` +
      `on green grass. Clearly identifiable as ants (insect ants, six legs, segmented black bodies), not beetles or spiders.`
    )
  }

  return (
    `${settingDesc[setting] ?? 'a scene'}. ` +
    characters.map((c) => `${c.english} is ${c.action}`).join('. ') + '.'
  )
}

export function parseKoreanStory(text) {
  const trimmed = text.trim()
  const normalized = normalize(trimmed)
  let entityTypes = findEntitiesInOrder(trimmed)
  const explicitSetting = findExplicitSetting(trimmed)
  let action = detectAction(trimmed)
  if (entityTypes.includes('cloud') && entityTypes.every((t) => SKY_TYPES.has(t)) && action === 'walking') {
    action = 'flying'
  }
  const conflictIntensity = action === 'fighting' ? detectConflictIntensity(trimmed) : null
  const fightOutcome = action === 'fighting' ? detectFightOutcome(trimmed) : null

  if (action === 'fighting') {
    entityTypes = extractFightingEntities(trimmed, entityTypes)
  }

  const setting = inferSetting(entityTypes, explicitSetting)
  const formation = detectFormation(trimmed)
  const weather = findExplicitWeather(trimmed, entityTypes)
  const parseOptions = { conflictIntensity, fightOutcome, originalText: trimmed, weather }
  const characters = buildCharacters(entityTypes, action, parseOptions)
  const scenarioId = detectScenario(entityTypes, action, setting, trimmed)
  const underwater = setting === 'sea' && entityTypes.some((t) => SEA_TYPES.has(t))
  const antChar = characters.find((c) => c.type === 'ant')

  const caption = buildCaption(entityTypes, action, setting, parseOptions) ||
    buildCaptionFromNouns(entityTypes, action, setting)
  const sceneDescription = buildSceneDescription(characters, action, setting, { ...parseOptions, formation, weather, entityTypes })

  return {
    scenarioId,
    caption,
    setting,
    weather,
    underwater,
    formation,
    action,
    conflictIntensity,
    fightOutcome,
    mood: action === 'fighting' ? 'playful' : action === 'eating' ? 'peaceful' : 'happy',
    entities: entityTypes,
    characters,
    objects: [],
    sceneDescription,
    originalText: trimmed,
    seed: normalized,
    fromLLM: false,
  }
}
