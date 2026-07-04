import { useState } from 'react'
import { removePhotoBackground } from '../utils/photoEditor'

export default function PhotoUpload({ photos, onAddPhoto, onRemovePhoto, onPhotoToCanvas, onUpdatePhoto }) {
  const [busyId, setBusyId] = useState(null)
  const [progress, setProgress] = useState(0)

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        onAddPhoto({
          id: Date.now() + Math.random(),
          src: ev.target.result,
          name: file.name,
        })
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const handleRemoveBackground = async (photo) => {
    if (busyId) return
    setBusyId(photo.id)
    setProgress(0)
    try {
      const result = await removePhotoBackground(photo.src, setProgress)
      onUpdatePhoto?.(photo.id, result)
    } catch (err) {
      console.warn('배경 제거 실패:', err)
      window.alert('배경을 지우지 못했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setBusyId(null)
      setProgress(0)
    }
  }

  return (
    <div className="photo-section">
      <div className="photo-header">
        <h2>📷 기본 사진</h2>
      </div>

      <div className="photo-grid">
        {photos.length === 0 ? (
          <div className="photo-empty">
            <span className="photo-empty-icon">🖼️</span>
            <p>먼저 사진을 올려 주세요!</p>
          </div>
        ) : (
          photos.map((photo) => (
            <div key={photo.id} className={`photo-item ${photo.noBg ? 'no-bg' : ''}`}>
              <img src={photo.src} alt={photo.name || '업로드한 사진'} />
              {busyId === photo.id && (
                <div className="photo-busy">
                  <span>✂️ 배경 지우는 중…</span>
                  <span>{progress}%</span>
                </div>
              )}
              <div className="photo-item-actions">
                <button
                  type="button"
                  className="photo-action-btn canvas"
                  onClick={() => onPhotoToCanvas?.(photo)}
                  disabled={Boolean(busyId)}
                >
                  🖍️ 그림판
                </button>
                {!photo.noBg && (
                  <button
                    type="button"
                    className="photo-action-btn cutout"
                    onClick={() => handleRemoveBackground(photo)}
                    disabled={Boolean(busyId)}
                  >
                    ✂️ 배경 지우기
                  </button>
                )}
              </div>
              {photo.noBg && <span className="photo-no-bg-badge">배경 없음</span>}
              <button
                className="photo-remove"
                onClick={() => onRemovePhoto(photo.id)}
                aria-label="사진 삭제"
                disabled={Boolean(busyId)}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      <p className="photo-guide-text">
        갤러리에서 사진을 고르거나 카메라로 찍을 수 있어요 · 그림판에 넣은 뒤 📷 탭에서 편집
      </p>

      <div className="photo-add-row">
        <label className="photo-add-btn photo-add-btn-gallery">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/*"
            multiple
            onChange={handleFileChange}
            hidden
            disabled={Boolean(busyId)}
          />
          <span>🖼️ 갤러리에서 선택</span>
        </label>
        <label className="photo-add-btn photo-add-btn-camera">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            hidden
            disabled={Boolean(busyId)}
          />
          <span>📷 카메라로 찍기</span>
        </label>
      </div>
    </div>
  )
}
