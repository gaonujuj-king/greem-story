const SCENE_RULES = {
  weather: [
    { id: 'rain', keywords: ['비', '장마', '우산', '빗방울', '소나기', '천둥'] },
    { id: 'snow', keywords: ['눈', '겨울', '눈사람', '하얀', '춥'] },
    { id: 'night', keywords: ['밤', '달', '별', '초저녁', '잠', '꿈'] },
    { id: 'sunset', keywords: ['노을', '저녁', '황혼', '석양'] },
    { id: 'sunny', keywords: ['햇님', '해', '태양', '맑', '화창', '봄', '여름', '따뜻'] },
  ],
  setting: [
    { id: 'sea', keywords: ['바다', '해변', '모래', '파도', '갯벌', '섬', '해변가'] },
    { id: 'forest', keywords: ['숲', '숲속', '캠핑', '등산', '산길'] },
    { id: 'garden', keywords: ['정원', '화단', '텃밭', '마당'] },
    { id: 'park', keywords: ['공원', '놀이터', '운동장', '잔디'] },
    { id: 'house', keywords: ['집', '우리집', '방', '마을', '부엌', '거실'] },
    { id: 'school', keywords: ['학교', '교실', '유치원', '선생님', '책상'] },
    { id: 'city', keywords: ['도시', '거리', '상점', '가게', '마트'] },
    { id: 'space', keywords: ['우주', '달', '로켓', '별', '행성'] },
    { id: 'farm', keywords: ['농장', '밭', '목장', '들판'] },
    { id: 'picnic', keywords: ['소풍', '피크닉', '도시락', '천막', '돗자리'] },
  ],
  entities: [
    { id: 'ant', keywords: ['개미', '개미들', '아기개미'] },
    { id: 'cat', keywords: ['고양이', '야옹', '냥이'] },
    { id: 'dog', keywords: ['강아지', '멍멍', '개', '댕댕'] },
    { id: 'bird', keywords: ['새', '비둘기', '참새', '까치', '앵무'] },
    { id: 'rabbit', keywords: ['토끼'] },
    { id: 'bear', keywords: ['곰', '곰돌이'] },
    { id: 'fish', keywords: ['물고기', '금붕어', '열대어'] },
    { id: 'whale', keywords: ['고래', '돌고래'] },
    { id: 'butterfly', keywords: ['나비'] },
    { id: 'flower', keywords: ['꽃', '튤립', '장미', '해바라기', '벚꽃'] },
    { id: 'tree', keywords: ['나무', '큰나무', '소나무', '벚나무', '숲'] },
    { id: 'house', keywords: ['집', '오두막', '성'] },
    { id: 'car', keywords: ['자동차', '버스', '기차', '자전거', '비행기'] },
    { id: 'ball', keywords: ['공', '풍선', '연'] },
    { id: 'child', keywords: ['아이', '어린이', '친구', '동생', '형', '누나', '오빠'] },
    { id: 'family', keywords: ['엄마', '아빠', '할머니', '할아버지', '가족', '부모'] },
    { id: 'book', keywords: ['책', '동화', '연필'] },
    { id: 'dinosaur', keywords: ['공룡', '티라노', '브라키오'] },
    { id: 'princess', keywords: ['공주', '왕자', '성', '요정'] },
    { id: 'robot', keywords: ['로봇', '우주선', '로켓'] },
    { id: 'cake', keywords: ['케이크', '과자', '사탕', '아이스크림', '빵'] },
    { id: 'rainbow', keywords: ['무지개'] },
    { id: 'dragon', keywords: ['용', '드래곤'] },
    { id: 'elephant', keywords: ['코끼리'] },
    { id: 'lion', keywords: ['사자'] },
    { id: 'penguin', keywords: ['펭귄'] },
    { id: 'snowman', keywords: ['눈사람'] },
    { id: 'bee', keywords: ['벌', '꿀벌'] },
    { id: 'frog', keywords: ['개구리', '청개구리'] },
    { id: 'duck', keywords: ['오리', '병아리'] },
    { id: 'snail', keywords: ['달팽이'] },
    { id: 'pig', keywords: ['돼지', '꿀꿀'] },
  ],
  actions: [
    { id: 'walking', keywords: ['간', '가', '걸', '이동', '출발', '향해'] },
    { id: 'playing', keywords: ['놀', '게임', '함께', '같이'] },
    { id: 'eating', keywords: ['먹', '밥', '식사', '간식'] },
    { id: 'sleeping', keywords: ['자', '잠', '꿈', '낮잠'] },
    { id: 'running', keywords: ['뛰', '달리', '달려'] },
    { id: 'swimming', keywords: ['수영', '헤엄', '물놀이'] },
    { id: 'flying', keywords: ['날', '하늘', '비행'] },
    { id: 'reading', keywords: ['읽', '책'] },
  ],
}

export const WEATHER_ENGLISH = {
  rain: 'rainy day with raindrops',
  snow: 'snowy winter day',
  night: 'starry night sky with moon',
  sunset: 'warm orange sunset',
  sunny: 'bright sunny day with blue sky',
}

export const SETTING_ENGLISH = {
  sea: 'ocean beach with blue waves and sand',
  forest: 'green forest with tall trees',
  garden: 'colorful flower garden',
  park: 'sunny green park with grass',
  house: 'cozy home and yard',
  school: 'friendly school classroom',
  city: 'city street with buildings',
  space: 'outer space with stars and planets',
  farm: 'peaceful countryside farm',
  picnic: 'sunny picnic on green grass with checkered blanket',
}

export const ENTITY_ENGLISH = {
  cat: 'cute orange cat',
  dog: 'friendly happy puppy dog',
  bird: 'small colorful bird',
  rabbit: 'white fluffy rabbit',
  bear: 'cute brown bear',
  fish: 'colorful fish',
  whale: 'big friendly blue whale in the ocean',
  butterfly: 'colorful butterfly',
  flower: 'beautiful flowers',
  tree: 'big green tree',
  house: 'small cozy house',
  car: 'colorful car',
  ball: 'red ball',
  child: 'happy child',
  family: 'loving family members',
  book: 'storybook',
  dinosaur: 'friendly cartoon dinosaur',
  princess: 'princess in a dress',
  robot: 'cute robot',
  cake: 'delicious birthday cake',
  rainbow: 'bright rainbow in the sky',
  dragon: 'friendly cartoon dragon',
  elephant: 'cute elephant',
  lion: 'friendly lion',
  penguin: 'cute penguin',
  snowman: 'happy snowman',
  ant: 'cute black ants',
  bee: 'yellow bee',
  frog: 'green frog',
  duck: 'yellow duck',
  snail: 'snail',
  pig: 'pink pig',
}

export const ACTION_ENGLISH = {
  playing: 'playing together happily',
  eating: 'eating food together',
  sleeping: 'sleeping peacefully',
  running: 'running joyfully',
  swimming: 'swimming in water',
  flying: 'flying in the sky',
  reading: 'reading a book',
  walking: 'walking together in a line',
}

function findFirstMatch(text, rules) {
  for (const rule of rules) {
    if (rule.keywords.some((word) => text.includes(word))) {
      return rule.id
    }
  }
  return null
}

function findAllMatches(text, rules, limit = 6) {
  const found = []
  for (const rule of rules) {
    if (rule.keywords.some((word) => text.includes(word))) {
      found.push(rule.id)
      if (found.length >= limit) break
    }
  }
  return found
}

export function parseStoryScene(text) {
  const normalized = text.replace(/\s+/g, '')

  const weather = findFirstMatch(normalized, SCENE_RULES.weather) ?? 'sunny'
  const setting = findFirstMatch(normalized, SCENE_RULES.setting) ?? 'park'
  const action = findFirstMatch(normalized, SCENE_RULES.actions)
  let entities = findAllMatches(normalized, SCENE_RULES.entities, 6)

  if (entities.length === 0) {
    entities = setting === 'sea' ? ['fish'] : ['child', 'tree']
  }

  return { weather, setting, action, entities, seed: normalized, originalText: text.trim() }
}

export function sceneToEnglishDescription(scene) {
  const parts = []

  parts.push(SETTING_ENGLISH[scene.setting] ?? 'pleasant outdoor scene')
  parts.push(WEATHER_ENGLISH[scene.weather] ?? 'bright day')

  const subjects = scene.entities
    .map((e) => ENTITY_ENGLISH[e])
    .filter(Boolean)

  if (subjects.length > 0) {
    parts.push(`featuring ${subjects.join(', ')}`)
  }

  if (scene.action && ACTION_ENGLISH[scene.action]) {
    parts.push(ACTION_ENGLISH[scene.action])
  }

  return parts.join(', ')
}
