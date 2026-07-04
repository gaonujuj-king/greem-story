/**
 * 어린이 이야기에 자주 나오는 한국어 명사 사전
 */
export const KOREAN_NOUN_LEXICON = [
  { type: 'baby_fish', keywords: ['아기물고기', '아기 물고기', '새끼물고기'] },
  { type: 'caterpillar', keywords: ['애벌레'] },
  { type: 'turtle', keywords: ['바다거북', '육지거북', '거북이', '거북'] },
  { type: 'dragonfly', keywords: ['잠자리'] },
  { type: 'ladybug', keywords: ['무당벌레'] },
  { type: 'spider', keywords: ['거미줄', '거미'] },
  { type: 'shark', keywords: ['상어'] },
  { type: 'whale', keywords: ['돌고래', '고래'] },
  { type: 'octopus', keywords: ['문어', '오징어', '낙지'] },
  { type: 'crab', keywords: ['꽃게', '게'] },
  { type: 'fish', keywords: ['금붕어', '물고기', '열대어'] },
  { type: 'ant', keywords: ['아기개미', '개미'] },
  { type: 'butterfly', keywords: ['나비'] },
  { type: 'bee', keywords: ['꿀벌', '벌'] },
  { type: 'snail', keywords: ['달팽이'] },
  { type: 'worm', keywords: ['지렁이', '벌레'] },
  { type: 'elephant', keywords: ['코끼리'] },
  { type: 'giraffe', keywords: ['기린'] },
  { type: 'zebra', keywords: ['얼룩말'] },
  { type: 'hippo', keywords: ['하마'] },
  { type: 'lion', keywords: ['사자'] },
  { type: 'tiger', keywords: ['호랑이', '범'] },
  { type: 'bear', keywords: ['곰돌이', '곰'] },
  { type: 'penguin', keywords: ['펭귄'] },
  { type: 'monkey', keywords: ['원숭이'] },
  { type: 'deer', keywords: ['사슴', '멧돌사슴'] },
  { type: 'sheep', keywords: ['양'] },
  { type: 'goat', keywords: ['염소'] },
  { type: 'horse', keywords: ['조랑말', '말'] },
  { type: 'cow', keywords: ['화소', '소'] },
  { type: 'pig', keywords: ['멧돼지', '돼지'] },
  { type: 'chicken', keywords: ['병아리', '닭'] },
  { type: 'duck', keywords: ['오리'] },
  { type: 'frog', keywords: ['개구리'] },
  { type: 'rabbit', keywords: ['토끼'] },
  { type: 'fox', keywords: ['여우'] },
  { type: 'cat', keywords: ['고양이', '냥이', '야옹'] },
  { type: 'dog', keywords: ['강아지', '멍멍', '댕댕이'] },
  { type: 'bird', keywords: ['까치', '참새', '비둘기', '앵무새', '새'] },
  { type: 'dinosaur', keywords: ['티라노', '공룡'] },
  { type: 'dragon', keywords: ['드래곤', '용'] },
  { type: 'robot', keywords: ['로봇'] },
  { type: 'princess', keywords: ['왕자', '공주'] },
  { type: 'snowman', keywords: ['눈사람'] },
  { type: 'child', keywords: ['어린이', '아기', '친구', '아이'] },
  { type: 'family', keywords: ['할아버지', '할머니', '아빠', '엄마', '가족'] },
  { type: 'rainbow', keywords: ['무지개'] },
  { type: 'cloud', keywords: ['뭉게구름', '흰구름', '먹구름', '구름'] },
  { type: 'sun', keywords: ['햇님', '태양', '해'] },
  { type: 'moon', keywords: ['보름달', '초승달', '달'] },
  { type: 'star', keywords: ['별'] },
  { type: 'flower', keywords: ['벚꽃', '해바라기', '튤립', '장미', '꽃'] },
  { type: 'tree', keywords: ['벚나무', '소나무', '나무'] },
  { type: 'mountain', keywords: ['산꼭대기', '산'] },
  { type: 'river', keywords: ['시냇물', '개울', '강'] },
  { type: 'car', keywords: ['자전거', '비행기', '기차', '버스', '자동차'] },
  { type: 'ball', keywords: ['풍선', '공'] },
  { type: 'kite', keywords: ['연'] },
  { type: 'book', keywords: ['동화책', '책'] },
  { type: 'cake', keywords: ['아이스크림', '과자', '케이크'] },
  { type: 'house', keywords: ['우리집', '집'] },
]

export const KOREAN_NOUN_LABELS = {
  spider: '거미', dragonfly: '잠자리', ladybug: '무당벌레', worm: '벌레',
  octopus: '문어', crab: '게', chicken: '닭', sheep: '양', goat: '염소',
  deer: '사슴', monkey: '원숭이', zebra: '얼룩말', giraffe: '기린', hippo: '하마',
  dragon: '용', robot: '로봇', princess: '공주', mountain: '산', river: '강',
  car: '자동차', ball: '공', kite: '연', book: '책', cake: '케이크',
  flower: '꽃', tree: '나무', house: '집', snowman: '눈사람',
  shark: '상어', baby_fish: '아기 물고기', fish: '물고기', whale: '고래',
  ant: '개미', cat: '고양이', dog: '강아지', bird: '새', rabbit: '토끼',
  bear: '곰', butterfly: '나비', child: '아이', dinosaur: '공룡',
  family: '가족', frog: '개구리', duck: '오리', bee: '벌', caterpillar: '애벌레',
  turtle: '거북이', snail: '달팽이', pig: '돼지', cow: '소', horse: '말',
  tiger: '호랑이', fox: '여우', lion: '사자', elephant: '코끼리', penguin: '펭귄',
  cloud: '구름', rainbow: '무지개', sun: '해', moon: '달', star: '별',
}

function normalize(text) {
  return text.replace(/\s+/g, '')
}

function isKeywordAllowed(normalized, kw, idx) {
  if (kw === '벌' && idx > 0 && normalized[idx - 1] === '애') return false
  if (kw === '개') {
    const next = normalized[idx + 1]
    if (['미', '발', '선', '요', '인', '울'].includes(next)) return false
  }
  if (kw === '말') {
    const next = normalized[idx + 1]
    const prev = normalized[idx - 1]
    if (['하', '했', '해', '함', '투'].includes(next)) return false
    if (prev === '할' || prev === '음') return false
  }
  if (kw === '소') {
    const next = normalized[idx + 1]
    if (['풍', '리', '속', '통', '개', '홀'].includes(next)) return false
  }
  if (kw === '새') {
    if (normalized.slice(idx, idx + 2) === '새로') return false
    if (normalized.slice(idx, idx + 3) === '새롭') return false
  }
  if (kw === '범' && idx > 0 && normalized[idx - 1] === '범') return false
  if (kw === '게') {
    const next = normalized[idx + 1]
    if (['임', '속', '하', '장'].includes(next)) return false
  }
  if (kw === '해') {
    const next = normalized[idx + 1]
    if (['어', '염', '결', '당', '체', '품'].includes(next)) return false
  }
  if (kw === '양' && normalized.slice(idx, idx + 2) === '양말') return false
  if (kw === '산' && normalized.slice(idx, idx + 2) === '산책') return false
  return true
}

export function findNounMatchesInText(text) {
  const normalized = normalize(text)
  const matches = []

  for (const entry of KOREAN_NOUN_LEXICON) {
    for (const keyword of entry.keywords) {
      const kw = keyword.replace(/\s+/g, '')
      let start = 0
      while (true) {
        const idx = normalized.indexOf(kw, start)
        if (idx === -1) break
        if (!isKeywordAllowed(normalized, kw, idx)) {
          start = idx + 1
          continue
        }
        matches.push({ type: entry.type, keyword: kw, index: idx, length: kw.length })
        start = idx + kw.length
      }
    }
  }

  matches.sort((a, b) => b.length - a.length || a.index - b.index)

  const used = []
  const selected = []
  for (const m of matches) {
    const overlap = used.some((u) => !(m.index + m.length <= u.start || m.index >= u.end))
    if (overlap) continue
    used.push({ start: m.index, end: m.index + m.length })
    selected.push(m)
  }

  selected.sort((a, b) => a.index - b.index)
  const types = []
  for (const m of selected) {
    if (!types.includes(m.type)) types.push(m.type)
  }
  return { types, matches: selected }
}

export function hasUnrecognizedNouns(text, recognizedTypes = []) {
  const { types } = findNounMatchesInText(text)
  if (types.length === 0) return false
  const recognized = new Set(recognizedTypes)
  return types.some((t) => !recognized.has(t))
}

export function buildCaptionFromNouns(types, action, setting) {
  const settingKo = {
    sea: '바다', picnic: '소풍', park: '공원', forest: '숲', house: '집',
    school: '학교', sky: '하늘', mountain: '산', farm: '농장', savanna: '사바나',
  }
  const actionKo = {
    eating: '먹는 중', chasing: '쫓는 중', swimming: '헤엄치는 중', playing: '노는 중',
    dancing: '춤추는 중', walking: '걷는 중', running: '달리는 중', sleeping: '자는 중',
    flying: '날아가는 중', fighting: '싸우는 중',
  }
  const parts = []
  if (setting && settingKo[setting]) parts.push(settingKo[setting])
  types.slice(0, 4).forEach((t) => {
    if (KOREAN_NOUN_LABELS[t]) parts.push(KOREAN_NOUN_LABELS[t])
  })
  if (action && actionKo[action]) parts.push(actionKo[action])
  return parts.join(' · ')
}
