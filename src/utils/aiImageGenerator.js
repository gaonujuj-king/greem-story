import { buildRealisticImagePrompt } from './realisticPromptBuilder'
import { finalizeImagePrompt } from './childFriendlyPrompt'
import { isLocalOnlyApp } from '../config/privacy'

function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  }
  return hash
}

function buildPrompt(scene, originalText) {
  if (scene.imagePrompt?.trim() && !/[\u3131-\uD79D]/.test(scene.imagePrompt)) {
    return finalizeImagePrompt(scene.imagePrompt, scene)
  }
  return buildRealisticImagePrompt(scene, originalText)
}

export function buildImageUrl(scene, originalText, model = 'flux') {
  const prompt = buildPrompt(scene, originalText)
  const encoded = encodeURIComponent(prompt)
  const seed = hashString(originalText) % 999999
  return (
    `https://image.pollinations.ai/prompt/${encoded}` +
    `?width=768&height=768&nologo=true&enhance=false&model=${model}&seed=${seed}`
  )
}

async function tryFetchBlob(url) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 45000)
  try {
    const response = await fetch(url, { signal: controller.signal, mode: 'cors' })
    if (!response.ok) return null
    const blob = await response.blob()
    if (!blob.type.startsWith('image/')) return null
    return blob
  } catch {
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}

function tryLoadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const timeoutId = setTimeout(() => reject(new Error('timeout')), 45000)
    img.onload = () => {
      clearTimeout(timeoutId)
      resolve(true)
    }
    img.onerror = () => {
      clearTimeout(timeoutId)
      reject(new Error('load failed'))
    }
    img.src = url
  })
}

async function imageUrlToBlob(url) {
  const img = await new Promise((resolve, reject) => {
    const el = new Image()
    el.crossOrigin = 'anonymous'
    el.onload = () => resolve(el)
    el.onerror = reject
    el.src = url
  })

  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth || 768
  canvas.height = img.naturalHeight || 768
  canvas.getContext('2d').drawImage(img, 0, 0)
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject()), 'image/jpeg', 0.92)
  })
}

export async function generateAIStoryImage(scene, originalText) {
  if (isLocalOnlyApp()) {
    throw new Error('로컬 전용 모드에서는 외부 AI 그림을 사용하지 않습니다')
  }

  const models = ['flux', 'turbo']

  for (const model of models) {
    const url = buildImageUrl(scene, originalText, model)
    console.log(`[AI 그림] 시도 (${model}):`, url.slice(0, 120), '...')

    const blob = await tryFetchBlob(url)
    if (blob) {
      console.log('[AI 그림] fetch 성공')
      return { blob, url, useDirectUrl: false }
    }

    try {
      await tryLoadImage(url)
      console.log('[AI 그림] img 로드 성공 — URL 직접 사용')
      let loadedBlob = null
      try {
        loadedBlob = await imageUrlToBlob(url)
      } catch {
        // CORS로 blob 변환 실패 — URL만 사용
      }
      return { blob: loadedBlob, url, useDirectUrl: true }
    } catch (err) {
      console.warn(`[AI 그림] ${model} img 로드 실패:`, err)
    }
  }

  throw new Error('AI 그림 생성 실패')
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function drawImageContain(ctx, img, destW, destH) {
  const scale = Math.min(destW / img.width, destH / img.height)
  const dw = img.width * scale
  const dh = img.height * scale
  const dx = (destW - dw) / 2
  const dy = (destH - dh) / 2
  ctx.fillStyle = '#e8f4fc'
  ctx.fillRect(0, 0, destW, destH)
  ctx.drawImage(img, dx, dy, dw, dh)
}

export async function compositePhotosOntoImage(imageBlob, photoSrcs) {
  if (photoSrcs.length === 0) return imageBlob

  const canvas = document.createElement('canvas')
  canvas.width = 768
  canvas.height = 768
  const ctx = canvas.getContext('2d')

  const baseImg = await loadImageFromBlob(imageBlob)
  drawImageContain(ctx, baseImg, 768, 768)

  const photos = await Promise.all(photoSrcs.slice(0, 2).map(loadImage))
  photos.forEach((img, i) => {
    const x = 580 + i * 80
    const y = 580
    const size = 130
    ctx.save()
    ctx.beginPath()
    ctx.arc(x, y, size / 2 - 4, 0, Math.PI * 2)
    ctx.clip()
    const scale = Math.max(size / img.width, size / img.height)
    ctx.drawImage(img, x - (img.width * scale) / 2, y - (img.height * scale) / 2, img.width * scale, img.height * scale)
    ctx.restore()
  })

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png', 0.92)
  })
}

function loadImageFromBlob(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = reject
    img.src = url
  })
}
