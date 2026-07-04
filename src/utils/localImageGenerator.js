import { analyzeStory, analyzeStorySync } from './storyAnalyzer'
import { drawStoryScene } from './storySceneDrawer'
import { generateAIStoryImage } from './aiImageGenerator'
import { generatePhotoBasedStoryImage } from './photoStoryRenderer'

async function generateCanvasStoryImage(scene, photoSrcs) {
  const canvas = document.createElement('canvas')
  canvas.width = 768
  canvas.height = 768
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('캔버스를 만들 수 없습니다')

  await drawStoryScene(ctx, scene ?? {}, photoSrcs, canvas.width, canvas.height)

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('캔버스 그림 변환 실패'))),
      'image/png',
      0.92
    )
  })
  return blob
}

async function analyzeForGeneration(storyText, hasPhoto = false) {
  try {
    const scene = await analyzeStory(storyText)
    if (scene) return scene
  } catch (err) {
    console.warn('[그림 생성] 분석 실패, 동기 분석 사용:', err)
  }
  const scene = analyzeStorySync(storyText)
  if (hasPhoto) {
    scene.photoReference = true
  }
  return scene
}

async function ensureSaveableBlob(scene, photoSrcs, aiResult = null) {
  if (aiResult?.blob?.size > 0) return aiResult.blob

  const hasPhoto = photoSrcs.length > 0
  if (hasPhoto) {
    return generatePhotoBasedStoryImage(photoSrcs, scene)
  }

  return generateCanvasStoryImage(scene, photoSrcs)
}

/** 내보내기·보관함용 — 항상 PNG blob 보장 (AI URL 재시도 없음) */
export async function generateExportableImageBlob(storyText, photoSrcs = []) {
  const trimmed = storyText?.trim()
  if (!trimmed) return null

  const hasPhoto = photoSrcs.length > 0
  const scene = await analyzeForGeneration(trimmed, hasPhoto)
  const blob = await ensureSaveableBlob(scene, photoSrcs, null)
  return { blob, scene }
}

export async function generateLocalStoryImage(storyText, photoSrcs = [], options = {}) {
  const { forceCanvas = false } = options
  const trimmed = storyText?.trim()
  if (!trimmed) return null

  const hasPhoto = photoSrcs.length > 0
  const scene = await analyzeForGeneration(trimmed, hasPhoto)

  if (hasPhoto) {
    console.log('[그림 생성] 업로드 사진 기반 장면:', trimmed, scene.action)
    const blob = await generatePhotoBasedStoryImage(photoSrcs, scene)
    return { blob, scene, method: 'photo' }
  }

  if (forceCanvas || !navigator.onLine) {
    const blob = await generateCanvasStoryImage(scene, photoSrcs)
    return { blob, scene, method: 'canvas' }
  }

  if (navigator.onLine) {
    try {
      console.log('[그림 생성] AI 사진 생성 시도:', trimmed)
      const aiResult = await generateAIStoryImage(scene, trimmed)

      if (aiResult.blob || aiResult.url) {
        const blob = await ensureSaveableBlob(scene, photoSrcs, aiResult)
        console.log('[그림 생성] AI 사진 성공', aiResult.blob ? '(blob)' : '(화면=AI, 저장=캔버스)')
        return {
          blob,
          scene,
          method: aiResult.blob?.size > 0 ? 'ai' : 'canvas',
          directUrl: aiResult.url && !aiResult.blob?.size ? aiResult.url : null,
        }
      }
    } catch (err) {
      console.warn('[그림 생성] AI 실패, 캔버스로 대체:', err)
    }
  }

  console.log('[그림 생성] 캔버스 fallback:', trimmed)
  const blob = await generateCanvasStoryImage(scene, photoSrcs)
  return { blob, scene, method: 'canvas' }
}

export function blobToObjectUrl(blob) {
  return URL.createObjectURL(blob)
}
