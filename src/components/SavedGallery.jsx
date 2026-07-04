import { useState } from 'react'
import { exportStoryBundle, resolveImageBlob, getExportStatusMessage } from '../utils/exportFile'
import { generateExportableImageBlob } from '../utils/localImageGenerator'

export default function SavedGallery({ stories, onOpenStory, onDeleteStory, onBack, onShowGuide }) {
  const [exportStatus, setExportStatus] = useState('')

  const handleExport = async (story) => {
    try {
      let imageBlob = story.generatedImageBlob
      if (!imageBlob?.size && story.generatedImageUrl) {
        imageBlob = await resolveImageBlob({
          blob: imageBlob,
          url: story.generatedImageUrl,
          imageSelector: `[data-story-id="${story.id}"] img`,
        })
      }

      if (!imageBlob?.size && story.storyText?.trim()) {
        setExportStatus('🎨 저장할 그림 파일 만드는 중...')
      }

      const photoSrcs = story.photos?.map((p) => p.src) ?? []
      const exportResult = await exportStoryBundle({
        imageBlob,
        storyText: story.storyText,
        createdAt: story.createdAt,
        imageUrl: story.generatedImageUrl,
        regenerateImage: async () => {
          const result = await generateExportableImageBlob(story.storyText, photoSrcs)
          return result?.blob ?? null
        },
      })

      if (exportResult.cancelled) return

      setExportStatus(getExportStatusMessage(exportResult))
      setTimeout(() => setExportStatus(''), 4000)
    } catch (err) {
      console.error('내보내기 실패:', err)
      setExportStatus('⚠️ 내보내기 실패 — 다시 시도해 주세요')
      setTimeout(() => setExportStatus(''), 4000)
    }
  }

  return (
    <div className="gallery-view">
      <div className="gallery-header">
        <button className="btn-back" onClick={onBack}>
          ← 돌아가기
        </button>
        <h2>📚 내 보관함</h2>
        <p className="gallery-subtitle">태블릿에 저장된 이야기와 그림이에요</p>
        <div className="gallery-header-actions">
          <button className="btn-help" onClick={onShowGuide}>
            📱 설치 방법
          </button>
          {exportStatus && <span className="save-status">{exportStatus}</span>}
        </div>
      </div>

      {stories.length === 0 ? (
        <div className="gallery-empty">
          <span>📭</span>
          <p>아직 저장된 이야기가 없어요.</p>
          <p>이야기를 만들고 &quot;보관함에 저장&quot;을 눌러보세요!</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {stories.map((story) => (
            <article key={story.id} className="gallery-card" data-story-id={story.id}>
              <div className="gallery-card-image">
                {story.generatedImageUrl ? (
                  <img src={story.generatedImageUrl} alt="저장된 그림" />
                ) : (
                  <div className="gallery-no-image">🖼️</div>
                )}
              </div>
              <div className="gallery-card-body">
                <p className="gallery-card-text">
                  {story.storyText.slice(0, 60)}
                  {story.storyText.length > 60 ? '...' : ''}
                </p>
                <time className="gallery-card-date">
                  {new Date(story.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </time>
                <div className="gallery-card-actions">
                  <button className="btn-open" onClick={() => onOpenStory(story)}>
                    열기
                  </button>
                  <button className="btn-export" onClick={() => handleExport(story)}>
                    💾 내보내기
                  </button>
                  <button className="btn-delete" onClick={() => onDeleteStory(story.id)}>
                    삭제
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
