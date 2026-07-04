import { finalizeImagePrompt } from './childFriendlyPrompt'
import { hasUnrecognizedNouns, findNounMatchesInText } from './koreanNounDictionary'

const TEXT_API = [
  (prompt) => `https://text.pollinations.ai/${encodeURIComponent(prompt)}`,
  (prompt) => `https://text.pollinations.ai/?prompt=${encodeURIComponent(prompt)}`,
]

export async function callTextLLM(prompt, timeoutMs = 15000) {
  for (const buildUrl of TEXT_API) {
    try {
      const response = await fetch(buildUrl(prompt), { signal: AbortSignal.timeout(timeoutMs) })
      if (!response.ok) continue
      const text = (await response.text()).trim()
      if (text.length > 8) return text
    } catch {
      continue
    }
  }
  return null
}

export function extractJsonFromLLM(text) {
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```/g, '')
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) return null
  try {
    return JSON.parse(cleaned.slice(start, end + 1))
  } catch {
    return null
  }
}

const STORY_ANALYSIS_PROMPT = (text) =>
  `You are an expert at reading Korean children's stories and planning photorealistic photos. ` +
  `Read EVERY Korean word — animals, plants, fruits, vegetables, food, toys, vehicles, nature, people. ` +
  `Examples: 개미=ant, 피아노=piano, 인형=doll, 신발=shoe, 목걸이=necklace, 원피스=dress, 수박=watermelon, 치약=toothpaste, 칫솔=toothbrush. ` +
  `Do not ignore nouns. Map each important Korean noun to an English type in characters or objects. ` +
  `Image must be SAFE and gentle for young children — no blood, gore, horror, or scary violence. ` +
  `Story: "${text}" ` +
  `If the story mentions 개미 (ants), characters MUST include type "ant". ` +
  `Respond with ONLY valid JSON (no markdown): ` +
  `{"caption":"한국어 한줄 요약",` +
  `"setting":"picnic|park|sea|forest|garden|house|school|city|farm|space|savanna|sky|mountain",` +
  `"weather":"sunny|rain|snow|night|sunset|cloudy",` +
  `"formation":"line|group|single",` +
  `"action":"smiling|laughing|crying|angry|surprised|scared|singing|talking|hugging|waving|walking|playing|eating|chasing|sleeping|running|swimming|flying|reading|drawing|jumping|sitting|standing|hiding|waiting|fighting|dancing",` +
  `"conflictIntensity":"physical|verbal|null",` +
  `"fightOutcome":"ongoing|someone_won|someone_lost|null",` +
  `"mood":"happy|peaceful|exciting|cozy|playful",` +
  `"characters":[{"type":"english noun e.g. cloud, child, cat","count":1,"action":"...","role":"subject","detail":"visual detail","english":"한국어 label"}],` +
  `"objects":["all visible objects in English"],` +
  `"sceneDescription":"2-3 English sentences describing the exact photorealistic scene, child-friendly",` +
  `"imagePrompt":"One English photorealistic photo prompt under 400 chars. Describe exactly what appears in the image. Natural proportions, soft light, no text in image."}`

const DIRECT_PROMPT_TEMPLATE = (text) =>
  `Write ONE English photorealistic photograph prompt for this Korean children's story. ` +
  `Include every important noun: people, animals, objects, place, weather, and action. ` +
  `Child-friendly, soft natural light, natural accurate proportions, no distortion, no text in image. ` +
  `Maximum 400 characters. Reply with ONLY the English prompt, nothing else.\n\n` +
  `Korean story: "${text}"`

export async function analyzeKoreanStoryWithAI(text) {
  const raw = await callTextLLM(STORY_ANALYSIS_PROMPT(text), 18000)
  if (!raw) return null
  const parsed = extractJsonFromLLM(raw)
  if (parsed?.imagePrompt || parsed?.sceneDescription || parsed?.caption) {
    return parsed
  }
  return null
}

export async function generateDirectImagePromptFromKorean(text) {
  const raw = await callTextLLM(DIRECT_PROMPT_TEMPLATE(text), 15000)
  if (!raw) return null
  const cleaned = raw.replace(/^["']|["']$/g, '').trim()
  if (cleaned.length < 20) return null
  return finalizeImagePrompt(cleaned, {})
}

export function isWeakLexicalAnalysis(analysis, originalText) {
  const entities = analysis?.entities ?? []
  const normalized = originalText.replace(/\s+/g, '')

  if (normalized.length <= 2) return false

  if (hasUnrecognizedNouns(originalText, entities)) return true

  const childOnly =
    entities.length === 0 ||
    (entities.length === 1 && entities[0] === 'child')

  if (childOnly) {
    const mentionsChild = /아이|어린이|친구|아기|소년|소녀/.test(normalized)
    if (!mentionsChild) return true
  }

  const dictTypes = findNounMatchesInText(originalText).types
  if (dictTypes.length > 0 && entities.length === 0) return true

  if (!analysis.caption && entities.length === 0) return true

  return false
}
