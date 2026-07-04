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
            <p>사실적인 사진을 생성하는 중...</p>
            <p className="image-loading-hint">자연스러운 사진 스타일 · 아이 친화적 (최대 1분 · 인터넷 필요)</p>
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
            {sceneCaption && (
              <p className="scene-caption">🎯 {sceneCaption}</p>
            )}
          </div>
        ) : (
          <div className="image-placeholder">
            <span className="image-placeholder-icon">🌈</span>
            <p>
              {storyText
                ? '이야기 내용을 분석해서 그림을 그릴게요!'
                : '이야기를 쓰거나 말하면 내용에 맞는 그림이 그려져요!'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
