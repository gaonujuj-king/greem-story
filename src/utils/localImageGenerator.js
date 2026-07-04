import { analyzeStory, analyzeStorySync } from './storyAnalyzer'
import { drawStoryScene } from './storySceneDrawer'
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
  } catch {
    // 로컬 분석 fallback
  }
  const scene = analyzeStorySync(storyText)
  if (hasPhoto) {
    scene.photoReference = true
  }
  return scene
}

async function ensureSaveableBlob(scene, photoSrcs) {
  const hasPhoto = photoSrcs.length > 0
  if (hasPhoto) {
    return generatePhotoBasedStoryImage(photoSrcs, scene)
  }
  return generateCanvasStoryImage(scene, photoSrcs)
}

/** 내보내기·보관함용 — 항상 PNG blob 보장 */
export async function generateExportableImageBlob(storyText, photoSrcs = []) {
  const trimmed = storyText?.trim()
  if (!trimmed) return null

  const hasPhoto = photoSrcs.length > 0
  const scene = await analyzeForGeneration(trimmed, hasPhoto)
  const blob = await ensureSaveableBlob(scene, photoSrcs)
  return { blob, scene }
}

/** 이 기기 안에서만 이야기 분석 + 그림 생성 (외부 API 없음) */
export async function generateLocalStoryImage(storyText, photoSrcs = []) {
  const trimmed = storyText?.trim()
  if (!trimmed) return null

  const hasPhoto = photoSrcs.length > 0
  const scene = await analyzeForGeneration(trimmed, hasPhoto)

  if (hasPhoto) {
    const blob = await generatePhotoBasedStoryImage(photoSrcs, scene)
    return { blob, scene, method: 'photo' }
  }

  const blob = await generateCanvasStoryImage(scene, photoSrcs)
  return { blob, scene, method: 'canvas' }
}

export function blobToObjectUrl(blob) {
  return URL.createObjectURL(blob)
}
