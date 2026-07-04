import { PHOTO_QUALITY, CHILD_SAFE_MOOD, finalizeImagePrompt } from './childFriendlyPrompt'

const ANIMAL_DETAILS = {
  elephant: 'a natural African elephant with correct proportions, gray skin, large ears, trunk',
  lion: 'a natural male lion with golden mane, correct feline anatomy',
  shark: 'a natural shark with smooth gray skin, correct fish anatomy, mouth closed',
  baby_fish: 'a small orange baby fish with round eyes, correct proportions',
  fish: 'colorful fish with natural scales and correct proportions',
  whale: 'a blue whale with natural proportions in calm ocean',
  bear: 'a brown bear with natural fur and correct anatomy',
  bird: 'birds with natural feathers and correct proportions',
  cat: 'a domestic cat with natural fur and correct proportions',
  dog: 'a dog with natural fur and correct proportions',
  rabbit: 'a rabbit with soft fur and natural proportions',
  dinosaur: 'a dinosaur with natural proportions',
  frog: 'a green frog with natural proportions',
  duck: 'ducks with natural feathers',
  bee: 'a honeybee in a garden',
  caterpillar: 'a green caterpillar with natural proportions on a leaf',
  butterfly: 'a colorful butterfly with natural wing patterns and correct proportions',
  turtle: 'a green sea turtle or land turtle with shell and natural proportions',
  tiger: 'a tiger with orange fur and black stripes, natural proportions',
  fox: 'a red fox with bushy tail and natural proportions',
  pig: 'a pink pig with natural proportions',
  cow: 'a cow in a sunny field',
  horse: 'a horse with natural mane and correct anatomy',
  chicken: 'a chicken with natural feathers',
  penguin: 'penguins with natural black and white feathers',
  ant: 'small black ants (insect Formicidae) with six legs and segmented bodies marching on grass',
  spider: 'a small friendly spider with eight legs on a delicate web, child-friendly, not scary',
  octopus: 'a purple octopus with eight tentacles in clear ocean water',
  crab: 'a red crab on sandy beach',
  worm: 'a small earthworm on soil',
  dragonfly: 'a blue dragonfly flying near water',
  ladybug: 'a red ladybug with black spots on a leaf',
  monkey: 'a playful monkey in a tree',
  giraffe: 'a tall giraffe with long neck in savanna',
  sheep: 'a fluffy white sheep in a meadow',
  goat: 'a goat on a farm hill',
  deer: 'a gentle deer in the forest',
  chicken: 'a chicken in a farmyard',
  flower: 'colorful flowers in bloom',
  tree: 'a large green tree',
  mountain: 'green mountains under blue sky',
  robot: 'a friendly colorful robot',
}

const SETTING_DETAILS = {
  sea: 'calm underwater ocean, blue water, soft sunlight rays',
  forest: 'green forest with natural lighting',
  park: 'sunny meadow with green grass and trees',
  picnic: 'outdoor picnic on green grass',
  farm: 'sunny savanna with golden grass',
  house: 'countryside home with sunny yard',
  school: 'school building outdoors',
  city: 'pleasant city park',
  space: 'starry sky',
  savanna: 'African savanna at golden hour with acacia trees',
  sky: 'wide open blue sky above green meadow',
}

const WILDLIFE_ANIMALS = new Set([
  'elephant', 'lion', 'bear', 'whale', 'shark', 'horse', 'cow',
  'bird', 'penguin', 'frog', 'duck', 'pig', 'chicken', 'dinosaur', 'turtle', 'butterfly', 'tiger', 'fox',
])

export function needsRealisticAI(scene) {
  const types = [
    ...(scene.entities ?? []),
    ...(scene.characters?.map((c) => c.type) ?? []),
  ]
  return types.some((t) => WILDLIFE_ANIMALS.has(t))
}

export function inferSavannaSetting(scene) {
  const types = scene.entities ?? scene.characters?.map((c) => c.type) ?? []
  if (types.some((t) => ['elephant', 'lion'].includes(t))) return 'savanna'
  return scene.setting
}

function buildEnglishSceneLine(analysis) {
  const desc = analysis.sceneDescription?.trim()
  if (desc && !/[\u3131-\uD79D]/.test(desc)) return desc
  return ''
}

function buildAntImagePrompt(analysis) {
  const setting = SETTING_DETAILS[analysis.setting] ?? 'sunny green park with grass'
  const count = analysis.characters?.find((c) => c.type === 'ant')?.count ?? analysis.count ?? 8
  const inLine = analysis.formation === 'line' || analysis.scenarioId?.includes('line')
  const picnic = analysis.setting === 'picnic' || analysis.scenarioId?.includes('picnic')

  let antAction = inLine
    ? `a clear single-file line of ${count} small black ants marching on green grass`
    : `a group of ${count} small black ants walking on green grass`

  if (picnic) {
    antAction += ', red and white picnic blanket and picnic basket nearby'
  }

  return finalizeImagePrompt(
    `${PHOTO_QUALITY} Macro nature photograph, close-up on ground level. ${setting}. ` +
    `${antAction}. ` +
    'Must clearly show ANTS only: black insect ants, Formicidae, six legs, segmented bodies, ant antennae. ' +
    'NOT beetles, NOT spiders, NOT caterpillars, NOT flies, NOT other bugs. Only ants. ' +
    `${CHILD_SAFE_MOOD} No text.`,
    analysis
  )
}

function hasAntSubject(analysis) {
  const types = [
    ...(analysis.entities ?? []),
    ...(analysis.characters?.map((c) => c.type) ?? []),
  ]
  return types.includes('ant') || analysis.scenarioId?.startsWith('ants_')
}

export function buildRealisticImagePrompt(analysis, originalText) {
  if (analysis.imagePrompt?.trim() && !/[\u3131-\uD79D]/.test(analysis.imagePrompt)) {
    return finalizeImagePrompt(analysis.imagePrompt, analysis)
  }

  if (hasAntSubject(analysis)) {
    return buildAntImagePrompt(analysis)
  }

  const sceneLine = buildEnglishSceneLine(analysis)
  if (sceneLine && analysis.fromLLM) {
    const setting = SETTING_DETAILS[analysis.setting] ?? 'peaceful natural outdoor scene'
    const objects = (analysis.objects ?? []).slice(0, 4).join(', ')
    const objectPart = objects ? ` Including ${objects}.` : ''
    return finalizeImagePrompt(
      `${PHOTO_QUALITY} ${setting}. ${sceneLine}${objectPart} ${CHILD_SAFE_MOOD} No text, no watermark.`,
      analysis
    )
  }

  const entityTypes = [
    ...(analysis.entities ?? []),
    ...(analysis.characters?.map((c) => c.type) ?? []),
  ]

  if (entityTypes.includes('cloud') || analysis.weather === 'cloudy' || analysis.scenarioId === 'cloud_sky') {
    return finalizeImagePrompt(
      `${PHOTO_QUALITY} Beautiful skyscape photograph. Wide blue sky filled with large fluffy white cumulus clouds, ` +
      'natural cloud shapes, soft daylight, peaceful atmosphere. ' +
      `${CHILD_SAFE_MOOD} No text, no watermark.`,
      analysis
    )
  }

  const setting = SETTING_DETAILS[inferSavannaSetting(analysis)] ??
    SETTING_DETAILS[analysis.setting] ??
    'peaceful natural outdoor scene'

  const characters = analysis.characters ?? []
  const characterDesc = characters
    .map((c) => ANIMAL_DETAILS[c.type] ?? `natural ${c.english || c.type}`)
    .join(', ')

  let core = ''

  if (analysis.action === 'eating' && characters.length >= 2) {
    const a = characters.find((c) => c.role === 'predator') ?? characters[0]
    const b = characters.find((c) => c.role === 'prey') ?? characters[1]
    const aDetail = ANIMAL_DETAILS[a.type] ?? a.english
    const bDetail = ANIMAL_DETAILS[b.type] ?? b.english
    core = `${setting}. ${aDetail} swimming peacefully near ${bDetail}, both with natural proportions.`
  } else if (analysis.action === 'fighting' && characters.length >= 2) {
    const a = characters.find((c) => c.role === 'fighter') ?? characters[0]
    const b = characters.find((c) => c.role === 'opponent') ?? characters[1]
    const aDetail = ANIMAL_DETAILS[a.type] ?? a.english
    const bDetail = ANIMAL_DETAILS[b.type] ?? b.english
    core = `${setting}. ${aDetail} and ${bDetail} facing each other calmly, natural proportions, gentle mood.`
  } else if (sceneLine) {
    core = `${setting}. ${sceneLine}`
    if (characterDesc) core += ` Featuring ${characterDesc}.`
  } else if (characterDesc) {
    core = `${setting}. ${characterDesc}.`
  } else {
    core = `${setting}. Peaceful nature scene.`
  }

  return finalizeImagePrompt(
    `${PHOTO_QUALITY} ${core} ${CHILD_SAFE_MOOD} No text, no watermark.`,
    analysis
  )
}

export { WILDLIFE_ANIMALS, ANIMAL_DETAILS as ANIMAL_REALISTIC_DETAILS }
