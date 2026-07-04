export default function PhotoUpload({ photos, onAddPhoto, onRemovePhoto }) {
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
            <div key={photo.id} className="photo-item">
              <img src={photo.src} alt={photo.name || '업로드한 사진'} />
              <button
                className="photo-remove"
                onClick={() => onRemovePhoto(photo.id)}
                aria-label="사진 삭제"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      <p className="photo-guide-text">
        올린 사진을 바탕으로 이야기를 쓰면, 사진 속 주인공이 그 장면을 연출해요
      </p>

      <label className="photo-add-btn photo-add-btn-block">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={handleFileChange}
          hidden
        />
        <span>+ 사진 추가</span>
      </label>
    </div>
  )
}
