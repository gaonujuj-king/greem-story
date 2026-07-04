import { parseKoreanStory, SUBJECT_KOREAN as SEMANTIC_KOREAN } from './storySemanticParser'
import { KOREAN_NOUN_LABELS, buildLexiconTypeMap, getActionLabelKo, findNounMatchesInText } from './koreanNounDictionary'
import { buildRealisticImagePrompt } from './realisticPromptBuilder'
import { finalizeImagePrompt, softenSceneDescription } from './childFriendlyPrompt'
import {
  analyzeKoreanStoryWithAI,
  generateDirectImagePromptFromKorean,
  isWeakLexicalAnalysis,
} from './koreanStoryInterpreter'

const SUBJECT_KOREAN = {
  ...KOREAN_NOUN_LABELS,
  ...SEMANTIC_KOREAN,
  shark: '상어', baby_fish: '아기 물고기',
  bear: '곰', fish: '물고기', whale: '고래', butterfly: '나비', flower: '꽃',
  tree: '나무', child: '아이', dinosaur: '공룡', bee: '벌', frog: '개구리',
  duck: '오리', pig: '돼지', cow: '소', horse: '말', chicken: '닭',
  snail: '달팽이', worm: '벌레', spider: '거미', family: '가족',
  princess: '공주', robot: '로봇', dragon: '용', elephant: '코끼리',
  lion: '사자',   penguin: '펭귄', snowman: '눈사람', car: '자동차',
  cloud: '구름', rainbow: '무지개', sun: '해', moon: '달', star: '별',
}

const TYPE_MAP = {
  ...buildLexiconTypeMap(),
  ants: 'ant', cats: 'cat', kittens: 'cat', dogs: 'dog', puppies: 'dog',
  birds: 'bird', children: 'child', kids: 'child', 'baby fish': 'baby_fish',
}

const SETTING_MAP = {
  picnic: 'picnic', park: 'park', sea: 'sea', beach: 'sea', ocean: 'sea', 바다: 'sea',
  forest: 'forest', 숲: 'forest', garden: 'garden', 정원: 'garden',
  house: 'house', home: 'house', 집: 'house',
  school: 'school', 학교: 'school',
  city: 'city', farm: 'farm', space: 'space', mountain: 'forest', sky: 'sky',
  river: 'park', lake: 'park', field: 'park', grass: 'park',
  소풍: 'picnic', 공원: 'park', 하늘: 'sky',
}

const WEATHER_MAP = {
  sunny: 'sunny', rainy: 'rain', rain: 'rain', snowy: 'snow', snow: 'snow',
  night: 'night', sunset: 'sunset', cloudy: 'cloudy',
  맑: 'sunny', 비: 'rain', 눈: 'snow', 밤: 'night',
  구름: 'cloudy', 흐림: 'cloudy',
}

const FORMATION_MAP = {
  line: 'line', group: 'group', single: 'single', scattered: 'group',
  row: 'line', queue: 'line',
}

const ACTION_MAP = {
  walking: 'walking', running: 'running', playing: 'playing',
  eating: 'eating', sleeping: 'sleeping', swimming: 'swimming',
  flying: 'flying', reading: 'reading', marching: 'walking',
  sitting: 'sitting', standing: 'standing', dancing: 'dancing', chasing: 'chasing',
  fleeing: 'fleeing', being_eaten: 'being_eaten', fighting: 'fighting',
  smiling: 'smiling', laughing: 'laughing', crying: 'crying', angry: 'angry',
  surprised: 'surprised', scared: 'scared', singing: 'singing', talking: 'talking',
  hugging: 'hugging', waving: 'waving', jumping: 'jumping', drawing: 'drawing',
  hiding: 'hiding', waiting: 'waiting',
}

function mapType(raw) {
  if (!raw) return null
  const key = String(raw).toLowerCase().trim()
  if (TYPE_MAP[key] ?? TYPE_MAP[raw]) return TYPE_MAP[key] ?? TYPE_MAP[raw]
  if (SUBJECT_KOREAN[key]) return key
  if (/^[a-z][a-z0-9_]*$/.test(key)) return key
  return null
}

function normalizeCharacter(char) {
  const raw = char.type ?? char.name ?? char.subject
  if (!raw) return null
  const type = mapType(raw) ?? (String(raw).toLowerCase().replace(/\s+/g, '_').replace(/[^\w_]/g, '') || 'object')
  const role = char.role ?? 'subject'
  return {
    type,
    count: Math.min(Math.max(Number(char.count) || 1, 1), 12),
    action: ACTION_MAP[String(char.action ?? '').toLowerCase()] ?? 'standing',
    role,
    detail: char.detail ?? char.description ?? '',
    english: char.english ?? char.label ?? String(raw),
    facing: char.facing ?? (role === 'fighter' ? 'right' : role === 'opponent' ? 'left' : undefined),
  }
}

function buildCaptionFromAnalysis(analysis) {
  if (analysis.caption) return analysis.caption

  const parts = []
  const settingKo = {
    picnic: '소풍', park: '공원', sea: '바다', forest: '숲', garden: '정원',
    house: '집', school: '학교', city: '도시', farm: '농장', space: '우주', savanna: '사바나', sky: '하늘',
  }
  if (settingKo[analysis.setting]) parts.push(settingKo[analysis.setting])

  analysis.characters?.slice(0, 2).forEach((c) => {
    if (SUBJECT_KOREAN[c.type]) parts.push(SUBJECT_KOREAN[c.type])
    else if (c.english) parts.push(c.english)
  })

  if (parts.length <= 1 && analysis.objects?.length) {
    analysis.objects.slice(0, 2).forEach((obj) => {
      if (typeof obj === 'string') parts.push(obj)
    })
  }

  if (analysis.formation === 'line') parts.push('줄')
  const actionLabel = getActionLabelKo(analysis.action)
  if (actionLabel && analysis.action !== 'standing') {
    if (analysis.action === 'fighting') {
      parts.push(analysis.conflictIntensity === 'verbal' ? '말다툼' : '싸움')
    } else {
      parts.push(actionLabel)
    }
  }

  return parts.join(' · ')
}

function buildImagePromptFromAnalysis(analysis, originalText) {
  return buildRealisticImagePrompt(analysis, originalText)
}

function analysisToScene(analysis) {
  const entities = (analysis.characters ?? []).map((c) => c.type).filter(Boolean)
  const mainChar = analysis.characters?.[0]
  const antChar = analysis.characters?.find((c) => c.type === 'ant')

  let scenarioId = analysis.scenarioId ?? null
  if (
    !scenarioId &&
    entities.includes('ant') &&
    analysis.formation === 'line' &&
    ['picnic', 'park'].includes(analysis.setting)
  ) {
    scenarioId = 'ants_line_picnic'
  }
  if (!scenarioId && entities.includes('ant') && analysis.formation === 'line') {
    scenarioId = 'ants_line'
  }
  if (!scenarioId && entities.includes('ant')) {
    scenarioId = 'ants_group'
  }
  if (
    !scenarioId &&
    entities.includes('shark') &&
    (entities.includes('baby_fish') || entities.includes('fish')) &&
    ['eating', 'chasing'].includes(analysis.action)
  ) {
    scenarioId = 'shark_eating_fish'
  }
  if (!scenarioId && analysis.action === 'fighting' && entities.length >= 2) {
    scenarioId = 'characters_fighting'
  }

  return {
    scenarioId,
    caption: buildCaptionFromAnalysis(analysis),
    setting: analysis.setting ?? 'park',
    weather: analysis.weather ?? 'sunny',
    underwater: analysis.underwater ?? (analysis.setting === 'sea' && entities.some((e) => ['shark', 'fish', 'baby_fish', 'whale'].includes(e))),
    entities: entities.length > 0 ? entities : ['child'],
    characters: analysis.characters ?? [],
    objects: analysis.objects ?? [],
    formation: analysis.formation ?? 'group',
    count: antChar?.count ?? mainChar?.count ?? analysis.characters?.length ?? 5,
    action: mainChar?.action ?? analysis.action ?? 'standing',
    mood: analysis.mood ?? 'happy',
    conflictIntensity: analysis.conflictIntensity ?? null,
    fightOutcome: analysis.fightOutcome ?? null,
    sceneDescription: analysis.sceneDescription ?? '',
    imagePrompt: analysis.imagePrompt ?? '',
    seed: analysis.originalText?.replace(/\s+/g, '') ?? '',
    originalText: analysis.originalText ?? '',
    fromLLM: analysis.fromLLM ?? false,
  }
}

async function callStoryLLM(text) {
  return analyzeKoreanStoryWithAI(text)
}

function analyzeOffline(text) {
  return parseKoreanStory(text)
}

function normalizeLLMResult(raw, originalText) {
  const characters = (raw.characters ?? [])
    .map(normalizeCharacter)
    .filter(Boolean)

  let setting = SETTING_MAP[String(raw.setting ?? '').toLowerCase()] ??
    SETTING_MAP[raw.setting] ?? null

  const entityTypes = characters.map((c) => c.type)
  if (!setting || setting === 'park') {
    setting = entityTypes.some((t) => ['shark', 'fish', 'baby_fish', 'whale'].includes(t))
      ? 'sea'
      : (setting ?? 'park')
  }

  const weather = WEATHER_MAP[String(raw.weather ?? '').toLowerCase()] ??
    WEATHER_MAP[raw.weather] ?? 'sunny'

  const formation = FORMATION_MAP[String(raw.formation ?? '').toLowerCase()] ?? 'group'

  const analysis = {
    caption: raw.caption ?? '',
    setting,
    weather,
    formation,
    action: ACTION_MAP[String(raw.action ?? '').toLowerCase()] ?? characters[0]?.action ?? 'standing',
    mood: raw.mood ?? 'happy',
    conflictIntensity: raw.conflictIntensity === 'verbal' ? 'verbal' : raw.conflictIntensity === 'physical' ? 'physical' : null,
    fightOutcome: ['ongoing', 'someone_won', 'someone_lost'].includes(raw.fightOutcome) ? raw.fightOutcome : null,
    characters,
    objects: Array.isArray(raw.objects) ? raw.objects : [],
    sceneDescription: raw.sceneDescription ?? '',
    imagePrompt: raw.imagePrompt ?? '',
    originalText: originalText.trim(),
    fromLLM: true,
    underwater: setting === 'sea' && entityTypes.some((t) => ['shark', 'fish', 'baby_fish', 'whale'].includes(t)),
    scenarioId: null,
  }

  if (!analysis.imagePrompt) {
    analysis.imagePrompt = buildImagePromptFromAnalysis(analysis, originalText)
  }
  analysis.sceneDescription = softenSceneDescription(analysis.sceneDescription, analysis)
  if (!analysis.caption) {
    analysis.caption = buildCaptionFromAnalysis(analysis)
  }

  return analysis
}

function storyMentionsAnt(text) {
  return text.replace(/\s+/g, '').includes('개미')
}

function enrichWithDictionaryEntities(analysis, text) {
  const dictTypes = findNounMatchesInText(text).types
  if (dictTypes.length === 0) return analysis

  const charMap = new Map((analysis.characters ?? []).map((c) => [c.type, c]))
  for (const type of dictTypes) {
    if (!charMap.has(type)) {
      charMap.set(type, {
        type,
        count: 1,
        action: analysis.action ?? 'standing',
        role: 'subject',
        english: KOREAN_NOUN_LABELS[type] ?? type,
        detail: '',
      })
    }
  }

  const ordered = []
  for (const type of dictTypes) {
    if (charMap.has(type)) ordered.push(charMap.get(type))
  }
  for (const c of analysis.characters ?? []) {
    if (!ordered.some((o) => o.type === c.type)) ordered.push(c)
  }

  return {
    ...analysis,
    characters: ordered,
    entities: ordered.map((c) => c.type),
  }
}

function mergeLLMIntoSemantic(semantic, llmRaw, trimmed, lexicalWeak = false) {
  if (!llmRaw) return semantic

  const llmAnalysis = normalizeLLMResult(llmRaw, trimmed)
  const hadAnt = semantic.entities?.includes('ant') || storyMentionsAnt(trimmed)
  const isFight = !hadAnt && (semantic.action === 'fighting' || llmAnalysis.action === 'fighting')

  if (hadAnt) {
    if (llmAnalysis.formation) semantic.formation = llmAnalysis.formation
    if (llmAnalysis.setting && ['picnic', 'park', 'forest'].includes(llmAnalysis.setting)) {
      semantic.setting = llmAnalysis.setting
    }
    if (llmAnalysis.caption?.includes('개미')) semantic.caption = llmAnalysis.caption
    if (llmAnalysis.imagePrompt) semantic.imagePrompt = llmAnalysis.imagePrompt
    semantic.fromLLM = true
    return semantic
  }

  if (isFight) {
    semantic.action = 'fighting'
    semantic.mood = 'playful'
    semantic.scenarioId = 'characters_fighting'
    semantic.conflictIntensity = semantic.conflictIntensity ?? llmAnalysis.conflictIntensity ?? 'physical'
    semantic.fightOutcome = semantic.fightOutcome ?? llmAnalysis.fightOutcome ?? 'ongoing'

    if (llmAnalysis.characters?.length >= 2) {
      semantic.characters = llmAnalysis.characters.map((c, i) => ({
        ...c,
        action: 'fighting',
        role: c.role === 'fighter' || c.role === 'opponent' ? c.role : i === 0 ? 'fighter' : 'opponent',
        facing: i === 0 ? 'right' : 'left',
      }))
      semantic.entities = semantic.characters.map((c) => c.type)
    }

    if (llmAnalysis.setting && llmAnalysis.setting !== 'park') semantic.setting = llmAnalysis.setting
    if (llmAnalysis.caption) semantic.caption = llmAnalysis.caption
    if (llmAnalysis.sceneDescription) semantic.sceneDescription = llmAnalysis.sceneDescription
    if (llmAnalysis.imagePrompt) semantic.imagePrompt = llmAnalysis.imagePrompt
    semantic.fromLLM = true
    return semantic
  }

  const useLLMPrimary =
    lexicalWeak ||
    llmAnalysis.imagePrompt ||
    llmAnalysis.sceneDescription ||
    llmAnalysis.caption ||
    llmAnalysis.characters?.length > 0

  if (useLLMPrimary) {
    const merged = {
      ...semantic,
      caption: llmAnalysis.caption || semantic.caption,
      setting: llmAnalysis.setting || semantic.setting,
      weather: llmAnalysis.weather || semantic.weather,
      formation: llmAnalysis.formation || semantic.formation,
      action: llmAnalysis.action || semantic.action,
      mood: llmAnalysis.mood || semantic.mood,
      characters: llmAnalysis.characters?.length ? llmAnalysis.characters : semantic.characters,
      entities: llmAnalysis.characters?.length
        ? llmAnalysis.characters.map((c) => c.type)
        : semantic.entities,
      objects: llmAnalysis.objects?.length ? llmAnalysis.objects : semantic.objects,
      sceneDescription: llmAnalysis.sceneDescription || semantic.sceneDescription,
      imagePrompt: llmAnalysis.imagePrompt || semantic.imagePrompt,
      fromLLM: true,
      scenarioId: semantic.scenarioId,
    }
    return enrichWithDictionaryEntities(merged, trimmed)
  }

  if (llmRaw.imagePrompt) {
    semantic.imagePrompt = llmRaw.imagePrompt
    if (llmRaw.sceneDescription) semantic.sceneDescription = llmRaw.sceneDescription
    if (llmAnalysis.characters?.length) {
      semantic.characters = llmAnalysis.characters
      semantic.entities = llmAnalysis.characters.map((c) => c.type)
    }
    if (llmAnalysis.action && !['walking', 'standing'].includes(llmAnalysis.action)) {
      semantic.action = llmAnalysis.action
    }
    if (llmAnalysis.mood) semantic.mood = llmAnalysis.mood
    if (llmAnalysis.caption) semantic.caption = llmAnalysis.caption
    semantic.fromLLM = true
  }

  return enrichWithDictionaryEntities(semantic, trimmed)
}

export async function analyzeStory(text) {
  const trimmed = text.trim()
  if (!trimmed) return null

  let semantic = parseKoreanStory(trimmed)
  const lexicalWeak = isWeakLexicalAnalysis(semantic, trimmed)

  if (navigator.onLine) {
    try {
      const llmRaw = await callStoryLLM(trimmed)
      if (llmRaw) {
        semantic = mergeLLMIntoSemantic(semantic, llmRaw, trimmed, lexicalWeak)
      } else if (lexicalWeak) {
        const directPrompt = await generateDirectImagePromptFromKorean(trimmed)
        if (directPrompt) {
          semantic.imagePrompt = directPrompt
          semantic.caption = semantic.caption || trimmed.slice(0, 50)
          semantic.fromLLM = true
        }
      }
    } catch (err) {
      console.warn('[이야기 분석] AI 분석 실패, 오프라인 분석 사용:', err)
    }
  }

  const hasAnt = semantic.entities?.includes('ant') || storyMentionsAnt(trimmed)

  if (hasAnt) {
    semantic.imagePrompt = buildImagePromptFromAnalysis(semantic, trimmed)
  } else if (semantic.fromLLM && semantic.imagePrompt && !/[\u3131-\uD79D]/.test(semantic.imagePrompt)) {
    semantic.imagePrompt = finalizeImagePrompt(semantic.imagePrompt, semantic)
  } else if (
    !semantic.imagePrompt ||
    /[\u3131-\uD79D]/.test(semantic.imagePrompt) ||
    /cartoon|illustration|picture book|distorted|deformed|warped/i.test(semantic.imagePrompt)
  ) {
    semantic.imagePrompt = buildImagePromptFromAnalysis(semantic, trimmed)
  } else {
    semantic.imagePrompt = finalizeImagePrompt(semantic.imagePrompt, semantic)
  }

  if (
    !semantic.imagePrompt &&
    semantic.sceneDescription &&
    !/[\u3131-\uD79D]/.test(semantic.sceneDescription)
  ) {
    semantic.imagePrompt = finalizeImagePrompt(semantic.sceneDescription, semantic)
  }

  semantic.sceneDescription = softenSceneDescription(semantic.sceneDescription, semantic)

  console.log('[이야기 분석] 결과:', semantic)
  return analysisToScene(enrichWithDictionaryEntities(semantic, trimmed))
}

export function analyzeStorySync(text) {
  const semantic = parseKoreanStory(text.trim())
  return analysisToScene(semantic)
}

export function getSceneCaption(scene) {
  return scene?.caption || buildCaptionFromAnalysis(scene ?? {})
}

export { SUBJECT_KOREAN, buildImagePromptFromAnalysis }
