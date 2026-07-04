import { parseStoryScene } from './storySceneParser'

const SCENARIO_PATTERNS = [
  {
    id: 'ants_line_picnic',
    caption: '줄 지은 개미 · 소풍',
    test: (t) =>
      t.includes('개미') &&
      ['줄', '일렬', '줄지어', '줄서'].some((k) => t.includes(k)) &&
      ['소풍', '나들이', '피크닉', '들판', '공원'].some((k) => t.includes(k)),
    scene: {
      scenarioId: 'ants_line_picnic',
      setting: 'picnic',
      weather: 'sunny',
      entities: ['ant'],
      formation: 'line',
      count: 8,
      action: 'walking',
    },
  },
  {
    id: 'ants_line',
    caption: '줄 지은 개미',
    test: (t) =>
      t.includes('개미') && ['줄', '일렬', '줄지어', '줄서'].some((k) => t.includes(k)),
    scene: {
      scenarioId: 'ants_line',
      setting: 'park',
      weather: 'sunny',
      entities: ['ant'],
      formation: 'line',
      count: 7,
      action: 'walking',
    },
  },
  {
    id: 'ants_picnic',
    caption: '개미 · 소풍',
    test: (t) =>
      t.includes('개미') && ['소풍', '나들이', '피크닉'].some((k) => t.includes(k)),
    scene: {
      scenarioId: 'ants_picnic',
      setting: 'picnic',
      weather: 'sunny',
      entities: ['ant'],
      formation: 'group',
      count: 6,
      action: 'walking',
    },
  },
  {
    id: 'ants_general',
    caption: '개미',
    test: (t) => t.includes('개미'),
    scene: {
      scenarioId: 'ants_group',
      setting: 'park',
      weather: 'sunny',
      entities: ['ant'],
      formation: 'group',
      count: 5,
      action: 'walking',
    },
  },
]

function extractJson(text) {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) return null
  try {
    return JSON.parse(text.slice(start, end + 1))
  } catch {
    return null
  }
}

const LLM_SUBJECT_MAP = {
  ant: 'ant', ants: 'ant', 개미: 'ant',
  cat: 'cat', cats: 'cat', kitten: 'cat',
  dog: 'dog', dogs: 'dog', puppy: 'dog',
  bird: 'bird', birds: 'bird',
  rabbit: 'rabbit', bear: 'bear', fish: 'fish', whale: 'whale',
  butterfly: 'butterfly', flower: 'flower', tree: 'tree',
  child: 'child', children: 'child', kid: 'child',
  dinosaur: 'dinosaur', bee: 'bee', frog: 'frog', duck: 'duck',
  pig: 'pig', cow: 'cow', horse: 'horse', chicken: 'chicken',
  snail: 'snail', worm: 'worm', spider: 'spider',
}

const LLM_SETTING_MAP = {
  picnic: 'picnic', park: 'park', sea: 'sea', beach: 'sea', ocean: 'sea',
  forest: 'forest', garden: 'garden', home: 'house', house: 'house',
  school: 'school', city: 'city', farm: 'farm', space: 'space',
  mountain: 'forest', river: 'park', lake: 'park',
}

async function parseStoryWithLLM(text) {
  const prompt =
    `Parse this Korean children's story into JSON only, no explanation. Fields: ` +
    `subjects (array of English nouns like "ant"), count (number, default 5), ` +
    `formation ("line"|"group"|"single"), setting (English like "picnic"), ` +
    `action ("walking"|"playing"|"eating"|"sleeping"), weather ("sunny"|"rainy"|"snowy"|"night"). ` +
    `Story: "${text}" JSON:`

  try {
    const response = await fetch(
      `https://text.pollinations.ai/${encodeURIComponent(prompt)}`,
      { signal: AbortSignal.timeout(15000) }
    )
    if (!response.ok) return null

    const raw = await response.text()
    const parsed = extractJson(raw)
    if (!parsed) return null

    const subjects = (parsed.subjects ?? []).map((s) =>
      LLM_SUBJECT_MAP[String(s).toLowerCase()] ?? String(s).toLowerCase()
    ).filter(Boolean)

    if (subjects.length === 0) return null

    return {
      scenarioId: null,
      caption: subjects.map((s) => SUBJECT_KOREAN[s] ?? s).join(' · '),
      setting: LLM_SETTING_MAP[parsed.setting?.toLowerCase()] ?? 'park',
      weather: parsed.weather ?? 'sunny',
      entities: subjects,
      formation: parsed.formation ?? 'group',
      count: parsed.count ?? 5,
      action: parsed.action ?? 'walking',
      seed: text.replace(/\s+/g, ''),
      originalText: text.trim(),
      fromLLM: true,
    }
  } catch {
    return null
  }
}

const SUBJECT_KOREAN = {
  ant: '개미', cat: '고양이', dog: '강아지', bird: '새', rabbit: '토끼',
  bear: '곰', fish: '물고기', whale: '고래', butterfly: '나비', flower: '꽃',
  tree: '나무', child: '아이', dinosaur: '공룡', bee: '벌', frog: '개구리',
  duck: '오리', pig: '돼지', cow: '소', horse: '말', chicken: '닭',
  snail: '달팽이', worm: '벌레', spider: '거미',
}

function detectFormation(text) {
  if (['줄', '일렬', '줄지어', '줄서', '행렬'].some((k) => text.includes(k))) return 'line'
  if (['함께', '같이', '무리'].some((k) => text.includes(k))) return 'group'
  return 'single'
}

function detectCount(text) {
  const numMatch = text.match(/(\d+)\s*(마리|명|개|마리의)/)
  if (numMatch) return Math.min(parseInt(numMatch[1], 10), 12)

  if (['많은', '여러', '수많은'].some((k) => text.includes(k))) return 8
  if (['한', '하나', '한마리'].some((k) => text.includes(k))) return 1
  return 5
}

export function interpretStorySync(text) {
  const normalized = text.replace(/\s+/g, '')
  const trimmed = text.trim()

  for (const pattern of SCENARIO_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        ...pattern.scene,
        caption: pattern.caption,
        seed: normalized,
        originalText: trimmed,
      }
    }
  }

  const base = parseStoryScene(trimmed)
  const formation = detectFormation(normalized)
  const count = detectCount(normalized)

  const captionParts = []
  if (base.entities[0] && SUBJECT_KOREAN[base.entities[0]]) {
    captionParts.push(SUBJECT_KOREAN[base.entities[0]])
  }
  if (formation === 'line') captionParts.push('줄')
  if (base.setting === 'picnic') captionParts.push('소풍')

  return {
    ...base,
    scenarioId: null,
    formation,
    count,
    caption: captionParts.length > 0 ? captionParts.join(' · ') : getSceneCaption(base),
  }
}

export async function interpretStory(text) {
  const normalized = text.replace(/\s+/g, '')
  const trimmed = text.trim()

  for (const pattern of SCENARIO_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        ...pattern.scene,
        caption: pattern.caption,
        seed: normalized,
        originalText: trimmed,
      }
    }
  }

  if (navigator.onLine) {
    const llmScene = await parseStoryWithLLM(trimmed)
    if (llmScene) return llmScene
  }

  return interpretStorySync(trimmed)
}

export function getSceneCaption(scene) {
  if (scene.caption) return scene.caption

  const parts = []
  const settingNames = {
    picnic: '소풍', park: '공원', sea: '바다', forest: '숲', garden: '정원',
    house: '집', school: '학교', city: '도시', farm: '농장', space: '우주',
  }
  if (settingNames[scene.setting]) parts.push(settingNames[scene.setting])
  scene.entities?.slice(0, 3).forEach((e) => {
    if (SUBJECT_KOREAN[e]) parts.push(SUBJECT_KOREAN[e])
  })
  if (scene.formation === 'line') parts.push('줄')
  return parts.join(' · ')
}