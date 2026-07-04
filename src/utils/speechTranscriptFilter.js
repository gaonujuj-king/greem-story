const DROP_EXACT = new Set([
  '으음', '음', '음음', '어', '아', '흠', '응', '으', 'um', 'uh', 'hmm', 'mhm',
])

const DROP_PATTERN = /^(?:으?)+음+$|^(?:어|아|흠|응|으)+$/

const WORD_CORRECTIONS = {
  구믐: '구름',
  구둠: '구름',
  구맘: '구름',
  우름: '구름',
  그름: '구름',
  구름: '구름',
  거북: '거북',
  거북이: '거북이',
  애벌레: '애벌레',
  개미: '개미',
  검미: '거미',
  커미: '거미',
  거미이: '거미',
  거미를: '거미',
  거미가: '거미',
  거미는: '거미',
  거미줄: '거미줄',
  잠자리: '잠자리',
  무당벌레: '무당벌레',
  문어: '문어',
  기린: '기린',
  얼룩말: '얼룩말',
}

const INLINE_CORRECTIONS = [
  [/검미/g, '거미'],
  [/커미/g, '거미'],
  [/거미이/g, '거미'],
]

export function normalizeSpeechText(text) {
  return (text ?? '').replace(/\s+/g, ' ').trim()
}

export function isNoiseTranscript(text) {
  const t = normalizeSpeechText(text)
  if (!t) return true
  if (t.length === 1 && /[음어아흠응]/.test(t)) return true
  if (DROP_EXACT.has(t)) return true
  if (DROP_PATTERN.test(t)) return true
  return false
}

export function correctSpeechWord(text) {
  let t = normalizeSpeechText(text)
  if (!t) return ''
  if (WORD_CORRECTIONS[t]) return WORD_CORRECTIONS[t]
  for (const [pattern, replacement] of INLINE_CORRECTIONS) {
    t = t.replace(pattern, replacement)
  }
  return t
}

export function pickBestAlternative(resultItem) {
  if (!resultItem?.length) return ''

  const candidates = []
  for (let j = 0; j < resultItem.length; j++) {
    const alt = resultItem[j]
    const raw = normalizeSpeechText(alt?.transcript)
    if (!raw) continue
    const confidence = typeof alt.confidence === 'number' ? alt.confidence : Math.max(0.2, 1 - j * 0.12)
    candidates.push({ raw, confidence, index: j })
  }

  if (candidates.length === 0) return ''

  const scored = candidates.map((c) => {
    const corrected = correctSpeechWord(c.raw)
    let score = c.confidence
    if (isNoiseTranscript(c.raw)) score -= 0.8
    if (corrected && corrected !== c.raw) score += 0.15
    if (/[가-힣]{2,}/.test(corrected)) score += 0.05
    return { ...c, corrected, score }
  })

  scored.sort((a, b) => b.score - a.score)

  let best = scored[0]?.corrected ?? scored[0]?.raw ?? ''
  best = correctSpeechWord(best)
  if (isNoiseTranscript(best)) return ''
  return best
}

export function processSpeechTranscripts(final, interim) {
  const cleanedFinal = isNoiseTranscript(final) ? '' : correctSpeechWord(final)
  const cleanedInterim = isNoiseTranscript(interim) ? '' : correctSpeechWord(interim)

  return {
    final: cleanedFinal,
    interim: cleanedInterim,
  }
}
