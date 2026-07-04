const LLM_SCARY_CLEANUP = [
  [/National Geographic documentary/gi, 'nature photograph'],
  [/hyperrealistic|ultra detailed|8k resolution/gi, 'high quality'],
  [/blood|gore|horror|terrifying|gruesome|disgusting|scary/gi, ''],
  [/sharp teeth|open mouth/gi, 'natural appearance'],
  [/predator|prey/gi, 'animal'],
]

export const PHOTO_QUALITY =
  'Photorealistic photograph, natural accurate proportions, correct anatomy, ' +
  'no distortion, no deformation, no warped limbs or faces, sharp clear focus, ' +
  'realistic perspective.'

export const CHILD_SAFE_MOOD =
  'Gentle calm mood, child-friendly, soft warm natural light, ' +
  'peaceful wholesome atmosphere, no violence, no horror.'

const MAX_PROMPT_LENGTH = 520

function truncateAtWord(text, maxLen) {
  if (text.length <= maxLen) return text
  const cut = text.slice(0, maxLen)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > maxLen * 0.6 ? cut.slice(0, lastSpace) : cut).trim()
}

function cleanLLMPrompt(text) {
  let result = text
  for (const [pattern, replacement] of LLM_SCARY_CLEANUP) {
    result = result.replace(pattern, replacement)
  }
  return result.replace(/\s{2,}/g, ' ').trim()
}

export function softenSceneDescription(description, analysis = {}) {
  if (!description) return description

  if (analysis.action === 'eating') {
    return (
      'A calm underwater ocean with soft blue water. ' +
      'A shark and small fish swimming peacefully together, natural proportions, friendly mood.'
    )
  }

  if (analysis.action === 'fighting') {
    return (
      'Two animals standing face to face in a sunny meadow, natural proportions, ' +
      'calm playful mood, gentle expressions, no aggression.'
    )
  }

  return cleanLLMPrompt(description)
}

export function finalizeImagePrompt(prompt, analysis = {}) {
  if (!prompt) return prompt

  const alreadyFinal = prompt.includes('no distortion') && prompt.includes('child-friendly')
  if (alreadyFinal) return truncateAtWord(prompt, MAX_PROMPT_LENGTH)

  let text = cleanLLMPrompt(prompt)

  if (!text.includes('no distortion')) {
    text = `${PHOTO_QUALITY} ${text}`
  }
  if (!text.includes('child-friendly')) {
    text = `${text} ${CHILD_SAFE_MOOD}`
  }

  return truncateAtWord(text, MAX_PROMPT_LENGTH)
}

/** @deprecated use finalizeImagePrompt */
export function softenImagePrompt(prompt, analysis = {}) {
  return finalizeImagePrompt(prompt, analysis)
}

export const CHILD_FRIENDLY_STYLE = CHILD_SAFE_MOOD
