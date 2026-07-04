import { useState, useCallback, useRef, useEffect } from 'react'
import StoryPanel from './components/StoryPanel'
import KidDrawCanvas from './components/KidDrawCanvas'
import PhotoUpload from './components/PhotoUpload'
import SavedGallery from './components/SavedGallery'
import InstallGuide from './components/InstallGuide'
import { blobToObjectUrl } from './utils/localImageGenerator'
import { exportStoryBundle, resolveImageBlob, getExportStatusMessage } from './utils/exportFile'
import {
  saveStoryToGallery,
  loadAllStories,
  deleteStory,
  clearDraft,
  requestPersistentStorage,
} from './utils/storage'
import './App.css'

function App() {
  const [storyText, setStoryText] = useState('')
  const [photos, setPhotos] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')
  const [view, setView] = useState('create')
  const [savedStories, setSavedStories] = useState([])
  const [showGuide, setShowGuide] = useState(false)
  const [hasDrawing, setHasDrawing] = useState(false)
  const [restoreCanvasBlob, setRestoreCanvasBlob] = useState(null)

  const storyInputRef = useRef(null)
  const drawCanvasRef = useRef(null)

  useEffect(() => {
    async function init() {
      try {
        await requestPersistentStorage()
        await clearDraft()
        const stories = await loadAllStories()
        setSavedStories(stories)
      } catch (err) {
        console.warn('초기화 일부 실패:', err)
      } finally {
        setIsLoaded(true)
      }
    }

    init()
  }, [])

  const handleStoryTextChange = useCallback((newText) => {
    setStoryText(newText)
  }, [])

  const getStoryInputText = useCallback(() => {
    if (storyText.trim()) return storyText
    const fromRef = storyInputRef.current?.getValue?.()
    if (fromRef?.trim()) return fromRef
    return storyText
  }, [storyText])

  const getDrawingBlob = useCallback(async () => {
    return (await drawCanvasRef.current?.getBlob?.()) ?? null
  }, [])

  const handleAddPhoto = (photo) => {
    setPhotos((prev) => [...prev, photo])
    queueMicrotask(() => {
      drawCanvasRef.current?.embedPhoto?.(photo.src, { noBg: photo.noBg })
    })
  }

  const handlePutPhotoOnCanvas = (photo) => {
    drawCanvasRef.current?.embedPhoto?.(photo.src, { noBg: photo.noBg })
  }

  const handleUpdatePhoto = (id, patch) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  const handleRemovePhoto = (id) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id))
  }

  const handleReset = async () => {
    setStoryText('')
    setPhotos([])
    setHasDrawing(false)
    setRestoreCanvasBlob(null)
    await drawCanvasRef.current?.clear?.()
    setSaveStatus('🔄 새 이야기 시작')
    setTimeout(() => setSaveStatus(''), 2000)
  }

  const handleSaveToGallery = async () => {
    const text = getStoryInputText().trim()
    const blob = await getDrawingBlob()

    if (!text && !blob?.size) {
      setSaveStatus('⚠️ 이야기를 쓰거나 그림을 그려 주세요')
      setTimeout(() => setSaveStatus(''), 2500)
      return
    }

    if (text !== storyText) setStoryText(text)

    await saveStoryToGallery({
      storyText: text,
      photos,
      generatedImageBlob: blob,
    })

    const stories = await loadAllStories()
    setSavedStories(stories)
    setSaveStatus('📚 보관함에 저장됨!')
    setTimeout(() => setSaveStatus(''), 2500)
  }

  const handleOpenStory = async (story) => {
    setStoryText(story.storyText ?? '')
    setPhotos(story.photos ?? [])
    setHasDrawing(!!story.generatedImageBlob?.size || !!story.generatedImageUrl)
    if (story.generatedImageBlob?.size) {
      setRestoreCanvasBlob(story.generatedImageBlob)
    } else if (story.generatedImageUrl) {
      try {
        const blob = await resolveImageBlob({ blob: null, url: story.generatedImageUrl })
        setRestoreCanvasBlob(blob)
      } catch {
        setRestoreCanvasBlob(null)
      }
    } else {
      setRestoreCanvasBlob(null)
    }
    setView('create')
  }

  const handleDeleteStory = async (id) => {
    await deleteStory(id)
    const stories = await loadAllStories()
    setSavedStories(stories)
  }

  const handleExportCurrent = async () => {
    try {
      const text = getStoryInputText().trim()
      const blob = await getDrawingBlob()

      if (!text && !blob?.size) {
        setSaveStatus('⚠️ 내보낼 이야기나 그림이 없어요')
        setTimeout(() => setSaveStatus(''), 2500)
        return
      }

      const exportResult = await exportStoryBundle({
        imageBlob: blob,
        storyText: text,
        imageUrl: blob ? blobToObjectUrl(blob) : null,
        regenerateImage: getDrawingBlob,
      })

      if (exportResult.cancelled) return

      setSaveStatus(getExportStatusMessage(exportResult))
      setTimeout(() => setSaveStatus(''), 4000)
    } catch (err) {
      console.error('내보내기 실패:', err)
      setSaveStatus('⚠️ 내보내기 실패 — 다시 시도해 주세요')
      setTimeout(() => setSaveStatus(''), 4000)
    }
  }

  const canSave = storyText.trim() || hasDrawing

  if (!isLoaded) {
    return (
      <div className="app loading-screen">
        <p>📖 불러오는 중...</p>
      </div>
    )
  }

  if (view === 'gallery') {
    return (
      <div className="app">
        <SavedGallery
          stories={savedStories}
          onOpenStory={handleOpenStory}
          onDeleteStory={handleDeleteStory}
          onBack={() => setView('create')}
          onShowGuide={() => setShowGuide(true)}
        />
        {showGuide && <InstallGuide onClose={() => setShowGuide(false)} />}
      </div>
    )
  }

  return (
    <div className="app app-create-layout">
      {showGuide && <InstallGuide onClose={() => setShowGuide(false)} />}
      <header className="app-header app-header-compact">
        <h1>✨ 이야기 그림전환 ✨</h1>
        <div className="header-actions">
          <button className="btn-gallery" onClick={() => setView('gallery')}>
            📚 내 보관함 ({savedStories.length})
          </button>
          <button className="btn-help" onClick={() => setShowGuide(true)}>
            📱 설치·개인정보
          </button>
          {saveStatus && <span className="save-status">{saveStatus}</span>}
        </div>
      </header>

      <main className="app-main app-main-create">
        <section className="input-stack">
          <StoryPanel
            ref={storyInputRef}
            storyText={storyText}
            onTextChange={handleStoryTextChange}
          />
          <PhotoUpload
            photos={photos}
            onAddPhoto={handleAddPhoto}
            onRemovePhoto={handleRemovePhoto}
            onPhotoToCanvas={handlePutPhotoOnCanvas}
            onUpdatePhoto={handleUpdatePhoto}
          />
          <div className="controls controls-inline">
            <div className="action-buttons action-buttons-main">
              <button
                type="button"
                className="btn-save"
                onClick={handleSaveToGallery}
                disabled={!canSave}
              >
                📚 보관함에 저장
              </button>
              <button
                type="button"
                className="btn-export-inline"
                onClick={handleExportCurrent}
                disabled={!canSave}
              >
                💾 내보내기
              </button>
              <button className="btn-reset" onClick={handleReset}>
                🔄 처음부터
              </button>
            </div>
          </div>
        </section>

        <section className="draw-column">
          <KidDrawCanvas
            ref={drawCanvasRef}
            photos={photos}
            storyText={storyText}
            restoreBlob={restoreCanvasBlob}
            onRestored={() => setRestoreCanvasBlob(null)}
            onDrawingChange={setHasDrawing}
          />
        </section>
      </main>

      <footer className="app-footer app-footer-compact">
        <p>🖍️ 직접 그린 그림 · 🔒 이 기기에만 저장</p>
      </footer>
    </div>
  )
}

export default App
