/** 한국어 조사·어미 (긴 것부터) */
const PARTICLE_SUFFIXES = [
  '에서는', '으로부터', '라고도', '처럼', '한테서', '한테', '에게서', '에게', '에서', '까지', '부터', '마다',
  '이라', '라고', '이랑', '하고', '과', '와', '의', '에', '도', '만', '로', '으로',
  '을', '를', '이', '가', '은', '는', '요', '죠', '야', '아', '네', '데', '랑', '께', '한',
]

const PLURAL_SUFFIXES = ['들', '님']

const HONORIFIC_SUFFIXES = ['씨', '님']

/**
 * 명사 뒤에 붙은 조사·복수·존칭 어미를 순차적으로 제거
 */
export function stripKoreanParticles(word) {
  if (!word || word.length < 2) return word
  let result = word
  let changed = true
  let safety = 0

  while (changed && result.length >= 2 && safety < 6) {
    changed = false
    safety += 1

    for (const suf of PLURAL_SUFFIXES) {
      if (result.endsWith(suf) && result.length > suf.length + 1) {
        result = result.slice(0, -suf.length)
        changed = true
        break
      }
    }
    if (changed) continue

    for (const suf of PARTICLE_SUFFIXES) {
      if (result.endsWith(suf) && result.length > suf.length + 1) {
        result = result.slice(0, -suf.length)
        changed = true
        break
      }
    }
  }

  return result
}

export function normalizeKoreanToken(word) {
  return word.replace(/\s+/g, '').trim()
}

/**
 * 이야기 문장을 명사 후보 토큰으로 분리
 */
export function tokenizeKoreanNounCandidates(text) {
  return text
    .replace(/[^\uAC00-\uD7A3a-zA-Z0-9\s,.!?…~·\-]/g, ' ')
    .split(/[\s,.!?…~·]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && /[\uAC00-\uD7A3]/.test(t))
}

/**
 * 토큰에서 조사를 뗀 여러 형태 후보 생성 (원형 → 조사 제거 → 복수 제거)
 */
export function expandNounCandidates(token) {
  const normalized = normalizeKoreanToken(token)
  if (!normalized) return []

  const candidates = new Set([normalized])
  const stripped = stripKoreanParticles(normalized)
  if (stripped) candidates.add(stripped)

  if (normalized.endsWith('들') && normalized.length > 2) {
    candidates.add(normalized.slice(0, -1))
    candidates.add(stripKoreanParticles(normalized.slice(0, -1)))
  }

  for (const suf of HONORIFIC_SUFFIXES) {
    if (normalized.endsWith(suf) && normalized.length > suf.length + 1) {
      candidates.add(normalized.slice(0, -suf.length))
    }
  }

  return [...candidates].filter((c) => c.length >= 2)
}
