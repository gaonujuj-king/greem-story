import { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react'

function appendInterim(base, interim) {
  if (!interim) return base
  const spacer = base && !base.endsWith(' ') && !interim.startsWith(' ') ? ' ' : ''
  return base + spacer + interim
}

const StoryPanel = forwardRef(function StoryPanel(
  { storyText, interimText, isListening, onTextChange },
  ref
) {
  const textareaRef = useRef(null)

  const displayValue = isListening ? appendInterim(storyText, interimText) : storyText

  useImperativeHandle(ref, () => ({
    getValue() {
      return isListening ? appendInterim(storyText, interimText) : (textareaRef.current?.value ?? storyText)
    },
    setValue(text) {
      if (textareaRef.current) {
        textareaRef.current.value = text
      }
    },
  }), [isListening, storyText, interimText])

  useEffect(() => {
    const el = textareaRef.current
    if (!el || !isListening) return
    el.scrollTop = el.scrollHeight
  }, [displayValue, isListening])

  const handleChange = useCallback(
    (e) => {
      if (isListening) return
      onTextChange(e.target.value)
    },
    [isListening, onTextChange]
  )

  return (
    <div className="story-panel">
      <div className="panel-header">
        <h2>📝 내 이야기</h2>
        {isListening && <span className="live-badge">● LIVE</span>}
      </div>
      <div className={`story-content ${isListening ? 'story-content-listening' : 'story-content-editable'}`}>
        <textarea
          ref={textareaRef}
          className="story-textarea"
          value={displayValue}
          onChange={handleChange}
          onInput={handleChange}
          readOnly={isListening}
          placeholder={
            isListening
              ? '말씀하시면 여기에 글자가 쌓여요...'
              : '⌨️ 여기를 눌러 키보드로 직접 쓰거나, 아래 🎤 버튼으로 말해 보세요!'
          }
          rows={8}
          spellCheck={false}
          autoComplete="off"
          aria-label="이야기 입력"
          aria-readonly={isListening}
          aria-live={isListening ? 'polite' : undefined}
        />
        {isListening ? (
          <p className="interim-preview interim-listening-hint">
            🎙️ 녹음 중 — 말한 내용이 위 입력창에 실시간으로 쌓입니다
          </p>
        ) : (
          <p className="typing-hint">
            ⌨️ 지금은 키보드로 자유롭게 입력할 수 있어요
          </p>
        )}
      </div>
    </div>
  )
})

export default StoryPanel
