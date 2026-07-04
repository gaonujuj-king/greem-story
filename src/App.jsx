import { useState, useCallback, useRef, useEffect, useDeferredValue } from 'react'
import MicrophoneButton from './components/MicrophoneButton'
import StoryPanel from './components/StoryPanel'
import ImagePanel from './components/ImagePanel'
import PhotoUpload from './components/PhotoUpload'
import SavedGallery from './components/SavedGallery'
import InstallGuide from './components/InstallGuide'
import { generateLocalStoryImage, generateExportableImageBlob, blobToObjectUrl } from './utils/localImageGenerator'
import { exportStoryBundle, resolveImageBlob, getExportStatusMessage } from './utils/exportFile'
import {
  saveStoryToGallery,
  loadAllStories,
  deleteStory,
  clearDraft,
  requestPersistentStorage,
} from './utils/storage'
import {
  advanceSpeechSession,
  composeStoryFromSpeechSession,
  getInterimTail,
} from './utils/speechTextMerge'
import './App.css'

function App() {
  const [storyText, setStoryText] = useState('')
  const [interimText, setInterimText] = useState('')
  const [imageUrl, setImageUrl] = useState(null)
  const [generatedImageBlob, setGeneratedImageBlob] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [photos, setPhotos] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')
  const [view, setView] = useState('create')
  const [savedStories, setSavedStories] = useState([])
  const [showGuide, setShowGuide] = useState(false)

  const lastGeneratedTextRef = useRef('')
  const imageUrlRef = useRef(null)
  const storyInputRef = useRef(null)
  const isGeneratingRef = useRef(false)

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

  const clearCurrentImage = useCallback(() => {
    if (imageUrlRef.current) {
      URL.revokeObjectURL(imageUrlRef.current)
      imageUrlRef.current = null
    }
    setImageUrl(null)
    setGeneratedImageBlob(null)
  }, [])

  const handleStoryTextChange = useCallback(
    (newText) => {
      if (isGeneratingRef.current) {
        setStoryText(newText)
        return
      }
      const trimmed = newText.trim()
      if (trimmed !== lastGeneratedTextRef.current) {
        clearCurrentImage()
        lastGeneratedTextRef.current = ''
      }
      setStoryText(newText)
    },
    [clearCurrentImage]
  )

  useEffect(() => {
    if (!isLoaded) return
    if (!storyText.trim()) {
      clearCurrentImage()
      lastGeneratedTextRef.current = ''
    }
  }, [storyText, isLoaded, clearCurrentImage])

  const interimTextRef = useRef('')
  const storyTextRef = useRef(storyText)
  const speechSessionRef = useRef({ baseText: '', cumulative: '' })

  useEffect(() => {
    storyTextRef.current = storyText
  }, [storyText])

  useEffect(() => {
    interimTextRef.current = interimText
  }, [interimText])

  const applySpeechToStory = useCallback(
    (incomingChunk) => {
      const { session, changed } = advanceSpeechSession(speechSessionRef.current, incomingChunk)
      if (!changed) return false

      speechSessionRef.current = session
      const newText = composeStoryFromSpeechSession(session)
      if (newText.trim() !== lastGeneratedTextRef.current) {
        clearCurrentImage()
        lastGeneratedTextRef.current = ''
      }
      setStoryText(newText)
      return true
    },
    [clearCurrentImage]
  )

  const flushInterimToStory = useCallback(() => {
    const interim = interimTextRef.current.trim()
    if (!interim) return

    const tail = getInterimTail(speechSessionRef.current.cumulative, interim)
    const toCommit = tail || interim
    applySpeechToStory(toCommit)
    setInterimText('')
  }, [applySpeechToStory])

  const handleListeningChange = useCallback(
    (listening) => {
      if (listening) {
        speechSessionRef.current = {
          baseText: storyTextRef.current,
          cumulative: '',
        }
        setInterimText('')
      } else {
        flushInterimToStory()
      }
      setIsListening(listening)
    },
    [flushInterimToStory]
  )

  const handleTextUpdate = useCallback(({ final, interim }) => {
    if (final?.trim()) {
      applySpeechToStory(final.trim())
    }
    const tail = getInterimTail(speechSessionRef.current.cumulative, interim ?? '')
    setInterimText(tail)
  }, [applySpeechToStory])

  const imageErrorRetriedRef = useRef(false)

  const getStoryInputText = useCallback(() => {
    const base = storyText
    const live = interimText.trim()
      ? base + (base && !base.endsWith(' ') ? ' ' : '') + interimText.trim()
      : base
    if (live.trim()) return live
    const fromRef = storyInputRef.current?.getValue?.()
    if (fromRef?.trim()) return fromRef
    return base
  }, [storyText, interimText])

  const triggerImageGeneration = useCallback(
    async (text, photoList) => {
      const trimmed = (text ?? '').trim()
      if (!trimmed) {
        setSaveStatus('⚠️ 이야기를 먼저 입력해 주세요')
        setTimeout(() => setSaveStatus(''), 2500)
        return
      }

      if (isGeneratingRef.current) return

      isGeneratingRef.current = true
      setIsGenerating(true)
      const photoSrcs = photoList.map((p) => p.src)
      const hasPhoto = photoSrcs.length > 0
      setSaveStatus(hasPhoto ? '📷 올린 사진으로 장면 만드는 중...' : '📖 이야기를 읽고 사진을 만드는 중... (최대 1분)')
      try {
        const result = await generateLocalStoryImage(trimmed, photoSrcs)

        if (!result?.blob && !result?.directUrl) {
          setSaveStatus('⚠️ 그림을 표시할 수 없어요 — 다시 시도해 주세요')
          setTimeout(() => setSaveStatus(''), 3000)
          return
        }

        if (imageUrlRef.current?.startsWith('blob:')) {
          URL.revokeObjectURL(imageUrlRef.current)
        }
        const url = result.directUrl ?? blobToObjectUrl(result.blob)
        imageUrlRef.current = url
        setImageUrl(url)

        let blob = result.blob ?? null
        if (!blob?.size && url) {
          try {
            blob = await resolveImageBlob({ blob: null, url })
          } catch {
            // ensureSaveableBlob에서 이미 blob 있어야 함
          }
        }
        if (!blob?.size) {
          const fallback = await generateExportableImageBlob(trimmed, photoSrcs)
          blob = fallback?.blob ?? null
        }
        setGeneratedImageBlob(blob)
        lastGeneratedTextRef.current = trimmed
        imageErrorRetriedRef.current = false
        setSaveStatus(result.method === 'photo'
          ? '✅ 사진 기반 장면 완성!'
          : result.method === 'ai'
            ? '✅ 사진 완성!'
            : '✅ 그림 완성! (AI 연결 실패, 그림으로 대체)')
        setTimeout(() => setSaveStatus(''), 2500)
      } catch (err) {
        console.error('그림 생성 실패:', err)
        setSaveStatus('⚠️ 그림 생성 실패 — 다시 시도해 주세요')
        setTimeout(() => setSaveStatus(''), 3000)
      } finally {
        isGeneratingRef.current = false
        setIsGenerating(false)
      }
    },
    []
  )

  const handleAddPhoto = (photo) => {
    setPhotos((prev) => [...prev, photo])
    clearCurrentImage()
    lastGeneratedTextRef.current = ''
  }

  const handleRemovePhoto = (id) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id))
    clearCurrentImage()
    lastGeneratedTextRef.current = ''
  }

  const handleReset = async () => {
    setStoryText('')
    setInterimText('')
    clearCurrentImage()
    lastGeneratedTextRef.current = ''
    setPhotos([])
    setSaveStatus('🔄 새 이야기 시작')
    setTimeout(() => setSaveStatus(''), 2000)
  }

  const deferredStoryText = useDeferredValue(storyText)

  const handleManualGenerate = useCallback(() => {
    const text = getStoryInputText()
    const fullText = (text + interimText).trim()
    if (!fullText) {
      setSaveStatus('⚠️ 이야기를 입력한 뒤 그림 그리기를 눌러 주세요')
      setTimeout(() => setSaveStatus(''), 2500)
      return
    }
    if (text !== storyText) setStoryText(text)
    triggerImageGeneration(fullText, photos)
  }, [getStoryInputText, interimText, storyText, photos, triggerImageGeneration])

  const handleSaveToGallery = async () => {
    const text = getStoryInputText()
    if (!text.trim()) return
    if (text !== storyText) setStoryText(text)

    let blob = generatedImageBlob
    if (!blob?.size && imageUrl) {
      blob = await resolveImageBlob({ blob, url: imageUrl })
    }
    if (!blob?.size) {
      const result = await generateExportableImageBlob(text, photos.map((p) => p.src))
      blob = result?.blob
    }

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

  const handleOpenStory = (story) => {
    setStoryText(story.storyText)
    setPhotos(story.photos)
    if (imageUrlRef.current) {
      URL.revokeObjectURL(imageUrlRef.current)
    }
    const url = story.generatedImageUrl
    imageUrlRef.current = url
    setImageUrl(url)
    setGeneratedImageBlob(story.generatedImageBlob ?? null)
    lastGeneratedTextRef.current = story.storyText
    setView('create')
  }

  const handleDeleteStory = async (id) => {
    await deleteStory(id)
    const stories = await loadAllStories()
    setSavedStories(stories)
  }

  const handleImageError = useCallback(() => {
    const text = getStoryInputText().trim()
    if (!text || imageErrorRetriedRef.current) return
    imageErrorRetriedRef.current = true
    setSaveStatus('⚠️ 그림 로드 실패 — 다시 그리는 중...')
    triggerImageGeneration(text, photos)
  }, [getStoryInputText, photos, triggerImageGeneration])

  const handleExportCurrent = async () => {
    try {
      const text = getStoryInputText().trim()
      if (!text) {
        setSaveStatus('⚠️ 내보낼 이야기가 없어요')
        setTimeout(() => setSaveStatus(''), 2500)
        return
      }

      let blob = generatedImageBlob
      if (!blob?.size && imageUrl) {
        blob = await resolveImageBlob({ blob, url: imageUrl })
        if (blob) setGeneratedImageBlob(blob)
      }

      const photoSrcs = photos.map((p) => p.src)
      const exportResult = await exportStoryBundle({
        imageBlob: blob,
        storyText: text,
        imageUrl,
        regenerateImage: async () => {
          setSaveStatus('🎨 저장할 그림 파일 만드는 중...')
          const result = await generateExportableImageBlob(text, photoSrcs)
          if (result?.blob) setGeneratedImageBlob(result.blob)
          return result?.blob ?? null
        },
      })

      if (exportResult.cancelled) return

      setSaveStatus(getExportStatusMessage(exportResult))
      setTimeout(() => setSaveStatus(''), 4000)
    } catch (err) {
      console.error('내보내기 실패:', err)
      setSaveStatus('⚠️ 내보내기 실패 — 🎨 그림 그리기 후 다시 시도해 주세요')
      setTimeout(() => setSaveStatus(''), 4000)
    }
  }

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
    <div className="app">
      {showGuide && <InstallGuide onClose={() => setShowGuide(false)} />}
      <header className="app-header">
        <h1>✨ 이야기 그림전환 ✨</h1>
        <p className="subtitle">사실적인 AI 사진 · 저장한 것만 보관함에 남아요</p>
        <div className="header-actions">
          <button className="btn-gallery" onClick={() => setView('gallery')}>
            📚 내 보관함 ({savedStories.length})
          </button>
          <button className="btn-help" onClick={() => setShowGuide(true)}>
            📱 설치 방법
          </button>
          {saveStatus && <span className="save-status">{saveStatus}</span>}
        </div>
      </header>

      <main className="app-main">
        <section className="left-column">
          <PhotoUpload
            photos={photos}
            onAddPhoto={handleAddPhoto}
            onRemovePhoto={handleRemovePhoto}
          />
        </section>

        <section className="center-column">
          <StoryPanel
            ref={storyInputRef}
            storyText={storyText}
            interimText={interimText}
            isListening={isListening}
            onTextChange={handleStoryTextChange}
          />
          <div className="controls">
            <MicrophoneButton
              onTextUpdate={handleTextUpdate}
              onListeningChange={handleListeningChange}
            />
            <div className="action-buttons">
              <button
                type="button"
                className="btn-generate"
                onClick={handleManualGenerate}
              >
                🎨 그림 그리기
              </button>
              <button
                type="button"
                className="btn-save"
                onClick={handleSaveToGallery}
                disabled={!storyText.trim() && !interimText.trim() && !isGenerating}
              >
                📚 보관함에 저장
              </button>
              <button className="btn-reset" onClick={handleReset}>
                🔄 처음부터
              </button>
            </div>
          </div>
        </section>

        <section className="right-column">
          <ImagePanel
            imageUrl={imageUrl}
            isGenerating={isGenerating}
            storyText={deferredStoryText}
            canExport={!!imageUrl && !!storyText.trim()}
            onExport={handleExportCurrent}
            onImageError={handleImageError}
          />
        </section>
      </main>

      <footer className="app-footer">
        <p>📷 AI가 이야기에 맞는 사실적인 사진을 생성합니다 · 📚 저장한 이야기만 보관함에 남아요</p>
      </footer>
    </div>
  )
}

export default App
