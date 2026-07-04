/** 공백·조사 제거 없이 비교용 정규화 */
function norm(s) {
  return (s ?? '').replace(/\s+/g, '')
}

function joinText(base, addition) {
  const a = (base ?? '').trimEnd()
  const b = (addition ?? '').trim()
  if (!b) return a
  if (!a) return b
  const spacer = a.endsWith(' ') || b.startsWith(' ') ? '' : ' '
  return a + spacer + b
}

/** 마지막 어절(공백 기준) */
function lastSegment(text) {
  const parts = (text ?? '').trim().split(/\s+/).filter(Boolean)
  return parts[parts.length - 1] ?? ''
}

/** 태블릿에서 같은 구절이 연속으로 붙는 패턴인지 */
function isLikelyDuplicateAddition(cumulative, addition) {
  const add = (addition ?? '').trim()
  if (!add) return true

  const cum = (cumulative ?? '').trim()
  if (!cum) return false

  if (add === cum || norm(add) === norm(cum)) return true

  const last = lastSegment(cum)
  if (add === last || norm(add) === norm(last)) return true

  // "토끼가" + "토끼가 토끼가" 처럼 앞부분만 겹치고 나머지가 반복인 경우
  if (add.startsWith(cum)) {
    const tail = add.slice(cum.length).trimStart()
    if (!tail) return true
    if (tail === last || norm(tail) === norm(last) || tail === cum) return true
  }

  return false
}

/**
 * 두 음성 조각을 겹침 구간 기준으로 이어 붙임 (태블릿 누적 interim 대응)
 */
export function mergeSpeechChunks(previous, incoming) {
  const prev = (previous ?? '').trim()
  const next = (incoming ?? '').trim()
  if (!next) return prev
  if (!prev) return next
  if (next === prev || norm(next) === norm(prev)) return prev
  if (prev.endsWith(next) || norm(prev).endsWith(norm(next))) return prev
  if (isLikelyDuplicateAddition(prev, next)) return prev

  if (next.startsWith(prev)) {
    const tail = next.slice(prev.length).trimStart()
    if (!tail || isLikelyDuplicateAddition(prev, tail)) return prev
    return joinText(prev, tail)
  }

  if (prev.startsWith(next)) return prev

  const maxOverlap = Math.min(prev.length, next.length)
  for (let size = maxOverlap; size >= 1; size--) {
    if (prev.slice(-size) === next.slice(0, size)) {
      const merged = prev + next.slice(size)
      if (merged === prev || isLikelyDuplicateAddition(prev, next.slice(size))) return prev
      return merged
    }
  }

  return joinText(prev, next)
}

/**
 * 이번 녹음 세션의 누적 음성 텍스트 갱신 (중복·누적 final 방지)
 */
export function advanceSpeechSession(session, incomingChunk) {
  const chunk = (incomingChunk ?? '').trim()
  if (!chunk) return { session, changed: false }

  const cumulative = session.cumulative ?? ''
  const merged = mergeSpeechChunks(cumulative, chunk)
  if (merged === cumulative) return { session, changed: false }

  return {
    session: { ...session, cumulative: merged },
    changed: true,
  }
}

/** storyText = baseText + cumulative 로 조합 */
export function composeStoryFromSpeechSession(session) {
  const base = session.baseText ?? ''
  const cumulative = session.cumulative ?? ''
  if (!cumulative) return base
  return joinText(base, cumulative)
}

/** 화면에 보여줄 interim (이미 확정된 cumulative 제외) */
export function getInterimTail(cumulative, interim) {
  const cum = (cumulative ?? '').trim()
  const inter = (interim ?? '').trim()
  if (!inter) return ''
  if (!cum) return inter
  if (inter.startsWith(cum)) {
    const tail = inter.slice(cum.length).trimStart()
    if (!tail || isLikelyDuplicateAddition(cum, tail)) return ''
    return tail
  }
  if (cum.startsWith(inter)) return ''
  if (norm(cum).endsWith(norm(inter))) return ''
  if (isLikelyDuplicateAddition(cum, inter)) return ''
  return inter
}
