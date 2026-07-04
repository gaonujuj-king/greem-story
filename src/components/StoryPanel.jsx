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
          placeholder="⌨️ 이야기를 써 보세요! (오른쪽 도화지에 그림도 그릴 수 있어요)"
          rows={3}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          enterKeyHint="done"
          aria-label="이야기 입력"
        />
        <p className="typing-hint">🔒 글과 그림은 이 기기에만 저장돼요</p>
      </div>
    </div>
  )
})

export default StoryPanel
