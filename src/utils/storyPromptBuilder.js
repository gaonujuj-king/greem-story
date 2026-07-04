import {
  parseStoryScene,
  sceneToEnglishDescription,
  ENTITY_ENGLISH,
  SETTING_ENGLISH,
  WEATHER_ENGLISH,
  ACTION_ENGLISH,
} from './storySceneParser'

async function translateToEnglish(koreanText) {
  const text = koreanText.trim().slice(0, 400)
  if (!text) return null

  try {
    const url =
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=ko|en`
    const response = await fetch(url)
    if (!response.ok) return null

    const data = await response.json()
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translated = data.responseData.translatedText
      if (translated && !translated.includes('INVALID')) {
        return translated
      }
    }
  } catch (err) {
    console.warn('이야기 번역 실패:', err)
  }

  return null
}

export async function buildStoryImagePrompt(storyText, hasPhotos = false) {
  const scene = parseStoryScene(storyText)
  const translation = await translateToEnglish(storyText)
  const sceneDesc = sceneToEnglishDescription(scene)

  const mustInclude = scene.entities
    .map((e) => ENTITY_ENGLISH[e])
    .filter(Boolean)
    .join(', ')

  const storyLine = translation
    ? `The story is: "${translation}".`
    : `The story scene is about: ${sceneDesc}.`

  const prompt = [
    "Children's picture book watercolor illustration.",
    storyLine,
    `Setting: ${SETTING_ENGLISH[scene.setting] ?? 'outdoor scene'}.`,
    `Atmosphere: ${WEATHER_ENGLISH[scene.weather] ?? 'bright and cheerful'}.`,
    mustInclude
      ? `The image MUST clearly show these exact subjects: ${mustInclude}.`
      : '',
    scene.action && ACTION_ENGLISH[scene.action]
      ? `The characters are ${ACTION_ENGLISH[scene.action]}.`
      : '',
    hasPhotos
      ? 'Naturally include the objects from the reference photos in the scene.'
      : '',
    'Draw ONLY what is described in this story. Do not add unrelated objects.',
    'Cute, warm, colorful style for young children ages 3-8.',
    'Single clear scene, not a collage.',
    'Absolutely no text, no words, no letters, no writing, no captions in the image.',
  ]
    .filter(Boolean)
    .join(' ')

  return { prompt, scene, translation }
}
