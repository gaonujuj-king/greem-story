import { useRef, useImperativeHandle, forwardRef, useCallback } from 'react'

const StoryPanel = forwardRef(function StoryPanel({ storyText, onTextChange }, ref) {
  const textareaRef = useRef(null)

  useImperativeHandle(
    ref,
    () => ({
      getValue() {
        return textareaRef.current?.value ?? storyText
      },
      setValue(text) {
        onTextChange(text)
      },
    }),
    [storyText, onTextChange]
  )

  const syncValue = useCallback(
    (e) => {
      onTextChange(e.target.value)
    },
    [onTextChange]
  )

  return (
    <div className="story-panel">
      <div className="panel-header">
        <h2>📝 내 이야기</h2>
      </div>
      <div className="story-content story-content-editable">
        <textarea
          ref={textareaRef}
          className="story-textarea"
          value={storyText}
          onChange={syncValue}
          onInput={syncValue}
          placeholder="⌨️ 여기를 눌러 키보드로 이야기를 써 보세요! (외부로 전송되지 않아요)"
          rows={8}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          enterKeyHint="done"
          aria-label="이야기 입력"
        />
        <p className="typing-hint">🔒 입력한 글은 이 기기에서만 분석·저장됩니다</p>
      </div>
    </div>
  )
})

export default StoryPanel
