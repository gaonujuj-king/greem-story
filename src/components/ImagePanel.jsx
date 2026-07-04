import { useMemo } from 'react'
import { analyzeStorySync, getSceneCaption } from '../utils/storyAnalyzer'
import { getShapeHintsForScene } from '../utils/shapeLineDrawer'

export default function ImagePanel({
  imageUrl,
  isGenerating,
  storyText,
  onExport,
  canExport,
  onImageError,
}) {
  const { sceneCaption, shapeHints } = useMemo(() => {
    if (!storyText.trim()) return { sceneCaption: '', shapeHints: [] }
    try {
      const scene = analyzeStorySync(storyText)
      return {
        sceneCaption: scene ? getSceneCaption(scene) : '',
        shapeHints: scene ? getShapeHintsForScene(scene) : [],
      }
    } catch {
      return { sceneCaption: '', shapeHints: [] }
    }
  }, [storyText])

  return (
    <div className="image-panel">
      <div className="panel-header">
        <h2>🎨 그림으로 변신!</h2>
        {canExport && (
          <button className="btn-export-small" onClick={onExport}>
            💾 내보내기
          </button>
        )}
      </div>
      <div className="image-content">
        {isGenerating ? (
          <div className="image-loading">
            <div className="paint-animation">
              <span>⭕</span>
              <span>📏</span>
              <span>🖌️</span>
            </div>
            <p>원·선·도형으로 그림을 그리는 중...</p>
            <p className="image-loading-hint">이 기기 안에서만 · 외부 전송 없음</p>
          </div>
        ) : imageUrl ? (
          <div className="generated-result">
            <div className="generated-image-wrap">
              <img
                key={imageUrl}
                src={imageUrl}
                alt="이야기에서 그린 그림"
                className="generated-image"
                onError={onImageError}
              />
            </div>
            {sceneCaption && <p className="scene-caption">🎯 {sceneCaption}</p>}
            {shapeHints.length > 0 && (
              <div className="shape-hints" aria-label="사용한 도형과 선">
                <p className="shape-hints-title">⭕ 도형 + 📏 선으로 그렸어요</p>
                <ul className="shape-hints-list">
                  {shapeHints.map((hint) => (
                    <li key={hint}>{hint}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="image-placeholder">
            <span className="image-placeholder-icon">🌈</span>
            <p>
              {storyText
                ? '이야기를 읽고 원·선·도형으로 그림을 그릴게요!'
                : '이야기를 쓰고 🎨 그림 그리기를 눌러 보세요!'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
