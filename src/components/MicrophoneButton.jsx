import { useCallback, useEffect, useState } from 'react'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'

const ERROR_MESSAGES = {
  'not-allowed':
    '마이크가 차단되어 있어요. 주소창 왼쪽 🔒 를 누르고 → 마이크 → 「허용」 → 페이지 새로고침(F5)',
  'audio-capture':
    '마이크를 찾을 수 없어요. 이어폰·마이크 연결과 다른 앱(줌 등) 종료를 확인해 주세요.',
  'language-not-supported':
    '한국어 음성 패키지가 필요해요. Chrome 설정 → 언어 → 한국어 → 「음성 입력」 설치',
  network:
    '인터넷(Wi-Fi) 연결이 필요해요. Chrome 음성 변환은 인터넷이 꼭 필요합니다. Wi-Fi 켜고 🔄 다시 시도해 주세요.',
  'no-text-yet':
    '소리는 들리지만 글 변환이 안 됩니다. Wi-Fi 연결·Chrome 브라우저·크게 또박또박 말하기를 확인해 주세요.',
  'start-failed':
    '녹음을 시작하지 못했어요. Chrome 또는 Edge에서 다시 시도해 주세요.',
  unsupported:
    'Chrome 또는 Edge 브라우저를 사용해 주세요.',
  'insecure-context':
    '마이크는 HTTPS 주소에서만 사용할 수 있어요.',
}

export default function MicrophoneButton({
  onTextUpdate,
  onListeningChange,
  disabled,
}) {
  const [speechError, setSpeechError] = useState(null)
  const [lastHeard, setLastHeard] = useState('')

  const handleResult = useCallback(({ final, interim }) => {
    const heard = (final || interim || '').trim()
    if (heard) setLastHeard(heard)
    onTextUpdate({ final, interim })
  }, [onTextUpdate])

  const handleError = useCallback((error) => {
    setSpeechError(ERROR_MESSAGES[error] ?? `오류 (${error}) — Chrome·마이크 허용을 확인해 주세요.`)
  }, [])

  const {
    isRecording,
    isSupported,
    speechHint,
    toggleListening,
    startListening,
  } = useSpeechRecognition({
    onResult: handleResult,
    onError: handleError,
  })

  useEffect(() => {
    onListeningChange?.(isRecording)
  }, [isRecording, onListeningChange])

  useEffect(() => {
    if (speechHint === 'no-text-yet') {
      setSpeechError(ERROR_MESSAGES['no-text-yet'])
    } else if (speechHint === 'speak-louder' && !lastHeard) {
      setSpeechError('조금 더 크고 또박또박 말해 주세요.')
    }
  }, [speechHint, lastHeard])

  const handleClick = useCallback(() => {
    if (!isRecording) setLastHeard('')
    setSpeechError(null)
    toggleListening()
  }, [isRecording, toggleListening])

  const handleRetry = useCallback(() => {
    setSpeechError(null)
    startListening()
  }, [startListening])

  if (!isSupported) {
    return (
      <div className="mic-unsupported">
        <p>Chrome 또는 Edge 브라우저를 사용해 주세요.</p>
      </div>
    )
  }

  return (
    <div className="mic-wrapper">
      <button
        type="button"
        className={`mic-button ${isRecording ? 'listening' : ''}`}
        onClick={handleClick}
        disabled={disabled}
        aria-pressed={isRecording}
        aria-label={isRecording ? '녹음 중지' : '녹음 시작'}
      >
        <span className="mic-icon">{isRecording ? '⏹️' : '🎤'}</span>
        <span className="mic-label">
          {isRecording ? '듣고 있어요... (눌러서 중지)' : '이야기해요!'}
        </span>
        {isRecording && (
          <span className="mic-pulse" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </span>
        )}
      </button>

      {speechError && (
        <div className="speech-error-box">
          <p className="speech-error">{speechError}</p>
          <button type="button" className="speech-retry-btn" onClick={handleRetry}>
            🔄 다시 시도
          </button>
        </div>
      )}
    </div>
  )
}
