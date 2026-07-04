function getBrowserOk() {
  const ua = navigator.userAgent
  return /Chrome|Edg|CriOS/.test(ua) && !/Firefox/i.test(ua)
}

function getAddressOk() {
  const host = window.location.hostname
  return window.isSecureContext && (host === 'localhost' || host === '127.0.0.1')
}

function permissionLabel(state) {
  if (state === 'granted') return { text: '허용됨', ok: true }
  if (state === 'denied') return { text: '차단됨 — 🔒에서 허용 필요', ok: false }
  return { text: '버튼 누르면 물어봐요', ok: null }
}

export default function SpeechStatusPanel({
  isRecording,
  isSupported,
  micLevel,
  micPermission,
  lastHeard,
  hasTextInStory,
  speechError,
  speechPhase,
  speechHint,
}) {
  const browserOk = getBrowserOk()
  const addressOk = getAddressOk()
  const perm = permissionLabel(micPermission)
  const currentUrl = window.location.href

  let stepMessage = '① 아래 🎤 버튼을 눌러 주세요'
  if (isRecording && speechPhase === 'text-received') {
    stepMessage = '✅ 잘 되고 있어요! 위 입력창에 글자가 쌓입니다'
  } else if (isRecording && speechPhase === 'speech-detected' && !lastHeard) {
    stepMessage = '③ 또박또박 말해 보세요 (예: 「구-름」 두 음절로)'
  } else if (isRecording && micLevel >= 8 && !lastHeard) {
    stepMessage = '② 마이크에 대고 크게 말해 보세요'
  } else if (isRecording && lastHeard) {
    stepMessage = '✅ 잘 되고 있어요! 위 입력창에 글자가 쌓입니다'
  } else if (isRecording) {
    stepMessage = '② 마이크에 대고 크게 말해 보세요'
  } else if (hasTextInStory) {
    stepMessage = '✅ 글 변환 완료! 입력창을 확인해 보세요'
  } else if (speechError || speechHint === 'no-text-yet') {
    stepMessage = '⚠️ 아래 안내를 읽고 다시 시도해 주세요'
  }

  return (
    <div className="speech-status-panel">
      <h3 className="speech-status-title">🎙️ 음성 확인판 (F12 필요 없음)</h3>
      <p className="speech-status-step">{stepMessage}</p>

      <ul className="speech-checklist">
        <li className={browserOk ? 'ok' : 'bad'}>
          {browserOk ? '✅' : '❌'} Chrome 또는 Edge 브라우저
        </li>
        <li className={addressOk ? 'ok' : 'bad'}>
          {addressOk ? '✅' : '❌'} 주소가 localhost 여야 함
          {!addressOk && (
            <span className="speech-check-detail">
              지금: {currentUrl.slice(0, 40)}
              {currentUrl.length > 40 ? '...' : ''}
            </span>
          )}
        </li>
        <li className={isSupported ? 'ok' : 'bad'}>
          {isSupported ? '✅' : '❌'} 음성 인식 지원
        </li>
        <li className={perm.ok === true ? 'ok' : perm.ok === false ? 'bad' : 'wait'}>
          {perm.ok === true ? '✅' : perm.ok === false ? '❌' : '⏳'} 마이크: {perm.text}
        </li>
      </ul>

      {isRecording && (
        <div className="mic-level-box">
          <span className="mic-level-label">마이크 소리</span>
          <div className="mic-level-bar">
            <div className="mic-level-fill" style={{ width: `${micLevel}%` }} />
          </div>
          <span className="mic-level-hint">
            {micLevel >= 8 ? '🔊 소리 들림!' : '...말해 보세요'}
          </span>
        </div>
      )}

      {lastHeard && (
        <p className="speech-last-heard">
          <strong>방금 들은 말:</strong> 「{lastHeard}」
        </p>
      )}

      {isRecording && speechHint === 'no-text-yet' && !lastHeard && (
        <p className="speech-status-tip speech-hint-warn">
          ⚠️ 소리는 들리는데 글 변환이 안 됩니다.<br />
          Wi-Fi가 켜져 있는지, Chrome/Edge인지 확인해 주세요.
        </p>
      )}

      {!addressOk && (
        <p className="speech-status-tip">
          💡 터미널에서 <code>npm run dev</code> 실행 후{' '}
          <strong>http://localhost:5173</strong> 으로 열어 주세요.
        </p>
      )}
    </div>
  )
}
