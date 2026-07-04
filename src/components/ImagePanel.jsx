import { useMemo } from 'react'
import { analyzeStorySync, getSceneCaption } from '../utils/storyAnalyzer'

export default function ImagePanel({
  imageUrl,
  isGenerating,
  storyText,
  onExport,
  canExport,
  onImageError,
}) {
  const sceneCaption = useMemo(() => {
    if (!storyText.trim()) return ''
    try {
      const scene = analyzeStorySync(storyText)
      return scene ? getSceneCaption(scene) : ''
    } catch {
      return ''
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
              <span>🖌️</span>
              <span>🎨</span>
              <span>✨</span>
            </div>
            <p>이 기기에서 그림을 그리는 중...</p>
            <p className="image-loading-hint">인터넷 없이도 동작 · 데이터는 밖으로 나가지 않아요</p>
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
          </div>
        ) : (
          <div className="image-placeholder">
            <span className="image-placeholder-icon">🌈</span>
            <p>
              {storyText
                ? '이야기 내용을 읽고 이 기기에서 그림을 그릴게요!'
                : '이야기를 쓰고 🎨 그림 그리기를 눌러 보세요!'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
