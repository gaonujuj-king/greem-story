import {
  findNounMatchesInText,
  KOREAN_NOUN_LABELS,
  buildCaptionFromNouns,
  buildSceneHintFromTypes,
  ACTION_LABELS_KO,
  getActionSceneHint,
  isSeaEntity,
  isSkyEntity,
  isLandEntity,
  isFoodEntity,
  isAnimalEntity,
  isPersonEntity,
  isPlaygroundObject,
  getPlaygroundObject,
  isPlaceEntity,
  NOUN_CATEGORIES,
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
  { id: 'sea', keywords: ['바다', '해변', '파도', '바닷물', '심해', '수중', '물속', '수족관'] },
  { id: 'forest', keywords: ['숲', '숲속', '산', '계곡'] },
  { id: 'picnic', keywords: ['소풍', '피크닉', '도시락'] },
  { id: 'park', keywords: ['공원', '놀이터', '잔디', '놀이공원'] },
  { id: 'house', keywords: ['집', '방', '마을', '동네'] },
  { id: 'school', keywords: ['학교', '교실', '유치원', '어린이집'] },
  { id: 'farm', keywords: ['농장', '들판', '밭', '논'] },
  { id: 'space', keywords: ['우주', '로켓'] },
  { id: 'sky', keywords: ['하늘', '하늘에서', '하늘위', '하늘을'] },
  { id: 'city', keywords: ['도시', '시장', '상점', '편의점', '마트'] },
  { id: 'hospital', keywords: ['병원'] },
  { id: 'library', keywords: ['도서관'] },
  { id: 'zoo', keywords: ['동물원'] },
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
  'octopus', 'crab', 'watermelon', 'cotton_candy', 'cake',
])

const ACTION_PATTERNS = [
  {
    id: 'fighting',
    patterns: [
      '싸우', '싸움', '싸워', '싸웠', '싸울', '격투', '대결', '붙었', '붙어', '맞붙',
      '주먹', '발로차', '발로 차', '때리', '공격', '몸싸움', '난투',
      '말싸움', '언쟁', '다투', '입총',
    ],
  },
  {
    id: 'angry',
    patterns: ['화가나', '화가 나', '화났', '화내', '성냈', '성난', '짜증', '삐졌', '화가났', '화가 났'],
  },
  {
    id: 'crying',
    patterns: ['울고있', '울고 있', '울고', '울었', '울어', '울음', '흑흑', '엉엉', '눈물', '울며'],
  },
  {
    id: 'smiling',
    patterns: ['웃고있', '웃고 있', '웃고', '웃었', '웃어', '웃는', '웃음', '방긋', '활짝', '싱글벙글', '미소', '웃었어', '웃고있어'],
  },
  {
    id: 'laughing',
    patterns: ['깔깔', '크게웃', '폭소', '하하', '호호', '낄낄'],
  },
  {
    id: 'surprised',
    patterns: ['놀랐', '놀라', '깜짝', '헉', '어머', '어라', '놀람'],
  },
  {
    id: 'scared',
    patterns: ['무서', '겁나', '겁이', '떨고', '무서워'],
  },
  {
    id: 'singing',
    patterns: ['노래하', '노래부', '노래를', '노래하고', '노래', '노래중', '노래 중'],
  },
  {
    id: 'talking',
    patterns: ['말하고', '말하', '이야기하', '대화', '수다', '말해', '말했', '이야기해'],
  },
  {
    id: 'hugging',
    patterns: ['껴안', '포옹', '안아', '안기', '안고', '안고있', '안고 있'],
  },
  {
    id: 'waving',
    patterns: ['손흔', '손을흔', '손을 흔', '인사해', '인사하', '반갑'],
  },
  { id: 'dancing', patterns: ['춤을추', '춤추', '춤을', '춤', '댄스'] },
  { id: 'eating', patterns: ['잡아먹', '먹고있', '먹고 있', '삼키', '잡아 먹', '먹어', '먹는'] },
  { id: 'chasing', patterns: ['쫓', '뒤쫓', '도망', '도망가'] },
  { id: 'swimming', patterns: ['헤엄', '수영', '헤어'] },
  { id: 'reading', patterns: ['책읽', '책 읽', '읽고있', '읽고 있', '읽어', '독서'] },
  { id: 'drawing', patterns: ['그림그', '그려', '그렸', '색칠', '그림을', '그리는'] },
  { id: 'jumping', patterns: ['점프', '깡충', '폴짝', '뛰어올', '뛰어 올'] },
  {
    id: 'playing',
    patterns: ['놀', '게임', '만든', '만들', '짓', '짓는', '거미줄', '타요', '탔', '타고', '타는', '미끄럼', '그네'],
  },
  { id: 'sleeping', patterns: ['자고', '잠자', '잔다', '자는', '잤', '낮잠', '꿈꾸'] },
  { id: 'flying', patterns: ['날아', '비행', '떠있', '떠 있', '흘러'] },
  { id: 'running', patterns: ['달리', '뛰어가', '뛰는', '뛰었', '뛰'] },
  { id: 'sitting', patterns: ['앉아', '앉았', '앉은', '앉'] },
  { id: 'standing', patterns: ['서있', '서 있', '서서', '일어서'] },
  { id: 'hiding', patterns: ['숨바', '숨었', '숨어', '숨는', '숨기'] },
  { id: 'waiting', patterns: ['기다리', '기다려', '기다'] },
  { id: 'walking', patterns: ['걸어', '걷', '걸었', '걸어가', '걸어서', '산책'] },
]

const EMOTION_ACTION_DETAILS = {
  smiling: 'big happy smile',
  laughing: 'laughing with open happy mouth',
  crying: 'gentle teary eyes',
  angry: 'mildly upset expression',
  surprised: 'surprised wide eyes',
  scared: 'slightly scared but safe expression',
  singing: 'singing with open mouth',
  talking: 'talking friendly',
  hugging: 'warm hug pose',
  waving: 'waving hello',
}

function isActionPatternAllowed(normalized, pattern, idx) {
  if (['잠', '잠자'].includes(pattern)) {
    if (normalized.slice(idx, idx + 3) === '잠자리') return false
    if (normalized.slice(idx, idx + 2) === '잠깐') return false
  }
  if (pattern === '울' && normalized.slice(idx, idx + 2) === '울타') return false
  if (pattern === '숨' && normalized.slice(idx, idx + 3) === '숨결') return false
  if (pattern === '날' && normalized.slice(idx, idx + 3) === '날씨') return false
  if (pattern === '떠' && normalized.slice(idx, idx + 3) === '떠나') return false
  if (pattern === '노래' && normalized.slice(idx, idx + 4) === '노래방') return false
  if (pattern === '안' && normalized.slice(idx, idx + 3) === '안녕') return false
  if (pattern === '말' && normalized.slice(idx, idx + 3) === '말씀') return false
  if (pattern === '놀' && normalized.slice(idx, idx + 3) === '놀랐') return false
  if (pattern === '놀' && normalized.slice(idx, idx + 2) === '놀라') return false
  return true
}

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

const BATHROOM_OBJECT_TYPES = new Set([
  'toothpaste', 'toothbrush', 'soap', 'towel', 'toilet', 'sink', 'shower', 'bathtub',
])

function inferSetting(entityTypes, explicitSetting) {
  if (explicitSetting) return explicitSetting

  const placeToSetting = {
    school: 'school', kindergarten: 'school', library: 'school',
    hospital: 'hospital', zoo: 'zoo', aquarium: 'sea',
    farm: 'farm', amusement_park: 'park', playground: 'park',
    castle: 'house', village: 'house', store: 'city', cafe: 'city',
    restaurant: 'city', market: 'city', museum: 'city',
  }
  for (const t of entityTypes) {
    if (placeToSetting[t]) return placeToSetting[t]
  }

  if (entityTypes.some((t) => BATHROOM_OBJECT_TYPES.has(t))) return 'house'

  if (entityTypes.some(isPlaygroundObject)) return 'park'
  if (entityTypes.includes('spider')) return 'house'
  if (entityTypes.includes('rocket')) return 'space'
  if (entityTypes.some((t) => t === 'cloud') && entityTypes.every((t) => isSkyEntity(t) || t === 'cloud')) return 'sky'
  if (entityTypes.some((t) => ['elephant', 'lion'].includes(t))) return 'savanna'
  if (entityTypes.includes('mountain')) return 'forest'
  if (entityTypes.some(isSeaEntity)) return 'sea'
  if (entityTypes.some(isSkyEntity) && !entityTypes.some(isLandEntity)) return 'sky'
  if (entityTypes.some(isLandEntity)) return 'park'
  return 'park'
}

function detectAction(text) {
  const normalized = normalize(text)
  for (const { id, patterns } of ACTION_PATTERNS) {
    const sorted = [...patterns].sort((a, b) => b.length - a.length)
    for (const pat of sorted) {
      const p = pat.replace(/\s+/g, '')
      let start = 0
      while (start < normalized.length) {
        const idx = normalized.indexOf(p, start)
        if (idx === -1) break
        if (isActionPatternAllowed(normalized, p, idx)) return id
        start = idx + 1
      }
    }
  }
  return 'standing'
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
  return 1
}

function splitEaterAndFood(entityTypes, action) {
  if (action !== 'eating' || entityTypes.length < 2) return { eater: null, food: null }
  const foodIdx = entityTypes.findIndex(isFoodEntity)
  if (foodIdx === -1) return { eater: null, food: null }
  const food = entityTypes[foodIdx]
  const eater = entityTypes.find((t, i) => i !== foodIdx && (isAnimalEntity(t) || isPersonEntity(t))) ?? entityTypes[0]
  return { eater, food }
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
      action: type === 'cloud' ? (['walking', 'standing'].includes(action) ? 'flying' : action) : action,
      role: 'subject',
      detail: type === 'cloud' ? 'large fluffy white cumulus cloud' : '',
      english: SUBJECT_KOREAN[type] ?? type,
    }))
  }

  return entityTypes.map((type, i) => {
    let role = 'subject'
    let charAction = action

    const { eater, food } = splitEaterAndFood(entityTypes, action)
    const isEatingFood = action === 'eating' && eater && food

    const playgroundObj = getPlaygroundObject(entityTypes)
    const isPlayScene = playgroundObj && (
      action === 'playing' || /타|미끄|그네/.test(normalize(originalText))
    )

    if (isPlayScene) {
      if (type === playgroundObj) {
        role = 'playground'
        charAction = 'playing'
      } else if (isAnimalEntity(type) || isPersonEntity(type)) {
        role = 'player'
        charAction = 'playing'
      }
    } else if (isEatingFood) {
      if (type === eater) {
        role = 'eater'
        charAction = 'eating'
      } else if (type === food) {
        role = 'food'
        charAction = 'food'
      }
    } else if (action === 'eating' && entityTypes.length >= 2 && isAnimalEntity(entityTypes[1])) {
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
    const category = NOUN_CATEGORIES[type]
    const isFoodLike = ['fruit', 'vegetable', 'food'].includes(category)
    return {
      type,
      count: isAnt ? parseAntCount(originalText) : 1,
      action: charAction,
      role,
      size: isBaby ? 'small' : type === 'shark' ? 'large' : type === 'watermelon' ? 'large' : 'normal',
      detail: EMOTION_ACTION_DETAILS[charAction]
        ?? (isBaby ? 'tiny cute baby fish'
        : isAnt ? 'black insect ant with six legs'
        : isSpider ? 'small friendly spider on a delicate web'
        : isFoodLike ? `clearly visible ${SUBJECT_KOREAN[type] ?? type}`
        : ''),
      english: SUBJECT_KOREAN[type] ?? type,
    }
  })
}

function detectScenario(entityTypes, action, setting, text) {
  const normalized = normalize(text)
  const { eater, food } = splitEaterAndFood(entityTypes, action)

  if (eater && food) {
    return 'animal_eating_food'
  }

  if (entityTypes.some((t) => ['toothpaste', 'toothbrush'].includes(t))) {
    return 'bathroom_hygiene'
  }

  const playgroundObj = getPlaygroundObject(entityTypes)
  const players = entityTypes.filter((t) => isAnimalEntity(t) || isPersonEntity(t))
  if (playgroundObj && players.length >= 1 && (action === 'playing' || /타/.test(normalized))) {
    return 'animals_on_playground'
  }

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
  const settingKo = {
    sea: '바다', picnic: '소풍', park: '공원', forest: '숲', house: '집', savanna: '사바나', sky: '하늘',
    school: '학교', city: '도시', hospital: '병원', zoo: '동물원', library: '도서관', farm: '농장',
  }

  let actionLabel = ACTION_LABELS_KO[action]
  if (action === 'fighting') {
    actionLabel = options.conflictIntensity === 'verbal' ? '말다툼 중' : ACTION_LABELS_KO.fighting
  } else if (action === 'eating' && entityTypes.length >= 2 && !entityTypes.some(isFoodEntity)) {
    actionLabel = '잡아먹는 중'
  }

  const parts = []
  if (settingKo[setting]) parts.push(settingKo[setting])
  entityTypes.slice(0, 3).forEach((t) => {
    if (SUBJECT_KOREAN[t]) parts.push(SUBJECT_KOREAN[t])
  })
  if (actionLabel && action !== 'standing') parts.push(actionLabel)
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

  if (
    options.scenarioId === 'animals_on_playground' ||
    characters.some((c) => c.role === 'playground')
  ) {
    const players = characters.filter((c) => c.role === 'player')
    const equip = characters.find((c) => c.role === 'playground')
    const names = players.map((c) => c.english).join(' and ')
    const equipName = equip?.english ?? SUBJECT_KOREAN.slide ?? '미끄럼틀'
    return (
      `${settingDesc.park}. ` +
      `${names} riding a colorful ${equipName} at a playground. ` +
      `The ${equipName} and every character are clearly visible. Sunny day, child-friendly, playful mood.`
    )
  }

  if (options.entityTypes?.includes('spider') || characters.some((c) => c.type === 'spider')) {
    return (
      `${settingDesc[setting] ?? 'a cozy corner'}. ` +
      'A small friendly spider with eight legs on a delicate web, soft daylight, child-friendly, not scary.'
    )
  }

  if (options.entityTypes?.includes('watermelon') || characters.some((c) => c.type === 'watermelon')) {
    return (
      `${settingDesc[setting] ?? 'sunny green park'}. ` +
      'A large fresh watermelon with green striped rind and bright red juicy slice, summer picnic mood, child-friendly.'
    )
  }

  if (options.entityTypes?.includes('cotton_candy') || characters.some((c) => c.type === 'cotton_candy')) {
    return (
      `${settingDesc[setting] ?? 'sunny amusement park'}. ` +
      'Fluffy pink cotton candy on a paper stick, cheerful carnival atmosphere, soft daylight, child-friendly.'
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
    const eater = characters.find((c) => c.role === 'eater' || c.role === 'predator') ?? characters[0]
    const food = characters.find((c) => c.role === 'food' || c.role === 'prey') ?? characters[1]
    if (isFoodEntity(food.type)) {
      return (
        `${settingDesc[setting] ?? 'a sunny gentle scene'}. ` +
        `A ${eater.english} eating ${food.english}, both clearly visible in the scene. ` +
        `The ${food.english} is placed in front of the ${eater.english}. Friendly calm mood, child-friendly, no scary moments.`
      )
    }
    return (
      `${settingDesc[setting] ?? 'a calm gentle scene'}. ` +
      `A ${eater.english} and a small ${food.english} swimming peacefully together in soft blue water. ` +
      `Friendly calm mood, both animals safe and gentle, no scary or violent moments.`
    )
  }

  const antChar = characters.find((c) => c.type === 'ant')
  if (antChar && !characters.some((c) => c.type !== 'ant')) {
    const count = antChar.count ?? 8
    const line = options.formation === 'line'
    return (
      `${settingDesc[setting] ?? 'sunny green park'}. ` +
      `${line ? `A neat line of ${count} small black ants marching in single file` : `A group of ${count} small black ants`} ` +
      `on green grass. Clearly identifiable as ants (insect ants, six legs, segmented black bodies), not beetles or spiders.`
    )
  }

  const entityTypes = options.entityTypes ?? characters.map((c) => c.type)
  const actionHint = getActionSceneHint(action)
  if (actionHint && characters.length > 0) {
    const names = characters.map((c) => c.english).join(' and ')
    return (
      `${settingDesc[setting] ?? 'a sunny gentle scene'}. ` +
      `${names}. ${actionHint}. Soft daylight, child-friendly.`
    )
  }

  const hints = buildSceneHintFromTypes(entityTypes)
  if (hints) {
    return `${settingDesc[setting] ?? 'a sunny gentle scene'}. ${hints}. Soft daylight, child-friendly.`
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
  if (entityTypes.includes('cloud') && entityTypes.every((t) => SKY_TYPES.has(t)) && ['walking', 'standing'].includes(action)) {
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
  const sceneDescription = buildSceneDescription(characters, action, setting, {
    ...parseOptions, formation, weather, entityTypes, scenarioId,
  })

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
    mood: ['smiling', 'laughing', 'playing', 'dancing', 'hugging', 'waving'].includes(action)
      ? 'happy'
      : action === 'fighting'
        ? 'playful'
        : action === 'eating'
          ? 'peaceful'
          : action === 'crying'
            ? 'cozy'
            : 'happy',
    entities: entityTypes,
    characters,
    objects: [],
    sceneDescription,
    originalText: trimmed,
    seed: normalized,
    fromLLM: false,
  }
}
