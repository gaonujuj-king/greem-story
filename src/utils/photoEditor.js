function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

let removeBackgroundFn = null

async function getRemoveBackground() {
  if (!removeBackgroundFn) {
    const mod = await import('@imgly/background-removal')
    removeBackgroundFn = mod.removeBackground
  }
  return removeBackgroundFn
}

export async function removePhotoBackground(src, onProgress) {
  const removeBackground = await getRemoveBackground()
  const blob = await removeBackground(src, {
    model: 'isnet',
    output: {
      format: 'image/png',
      quality: 0.92,
    },
    progress: (_stage, current, total) => {
      if (total > 0) onProgress?.(Math.round((current / total) * 100))
    },
  })
  const dataUrl = await blobToDataUrl(blob)
  return { src: dataUrl, noBg: true }
}

export const PHOTO_SIZE_OPTIONS = [
  { id: 's', label: '작게', scale: 0.28 },
  { id: 'm', label: '보통', scale: 0.55 },
  { id: 'l', label: '크게', scale: 0.88 },
]

export function photoSizeScale(sizeId) {
  return PHOTO_SIZE_OPTIONS.find((o) => o.id === sizeId)?.scale ?? PHOTO_SIZE_OPTIONS[1].scale
}

export function stickerBoxSize(canvasSize, sizeId) {
  const margin = 28
  const area = canvasSize - margin * 2
  return area * photoSizeScale(sizeId)
}

export function computeStickerDimensions(naturalW, naturalH, canvasSize, sizeId) {
  const boxSize = stickerBoxSize(canvasSize, sizeId)
  const scale = Math.min(boxSize / naturalW, boxSize / naturalH)
  return {
    w: naturalW * scale,
    h: naturalH * scale,
    boxSize,
  }
}

export function computeStickerPlacement(naturalW, naturalH, canvasSize, sizeId, staggerIndex = 0) {
  const margin = 28
  const area = canvasSize - margin * 2
  const { w, h, boxSize } = computeStickerDimensions(naturalW, naturalH, canvasSize, sizeId)
  const stagger = staggerIndex % 4
  const shiftX = [0, 18, -18, 12][stagger]
  const shiftY = [0, 12, 18, -12][stagger]
  const boxX = margin + shiftX + (area - boxSize) / 2
  const boxY = margin + shiftY + (area - boxSize) / 2
  return {
    x: boxX + (boxSize - w) / 2,
    y: boxY + (boxSize - h) / 2,
    w,
    h,
  }
}

export function resizeStickerAtCenter(sticker, canvasSize, sizeId) {
  const { w, h } = computeStickerDimensions(sticker.naturalW, sticker.naturalH, canvasSize, sizeId)
  const cx = sticker.x + sticker.w / 2
  const cy = sticker.y + sticker.h / 2
  return {
    ...sticker,
    sizeId,
    w,
    h,
    x: cx - w / 2,
    y: cy - h / 2,
  }
}

export function clampStickerPosition(sticker, canvasSize) {
  const pad = 8
  const maxX = Math.max(pad, canvasSize - sticker.w - pad)
  const maxY = Math.max(pad, canvasSize - sticker.h - pad)
  return {
    ...sticker,
    x: Math.min(Math.max(pad, sticker.x), maxX),
    y: Math.min(Math.max(pad, sticker.y), maxY),
  }
}

export function rotateSticker(sticker, deltaDeg) {
  return {
    ...sticker,
    rotation: (sticker.rotation || 0) + deltaDeg,
  }
}

export function drawStickerOnContext(ctx, img, sticker, dpr) {
  const x = sticker.x * dpr
  const y = sticker.y * dpr
  const w = sticker.w * dpr
  const h = sticker.h * dpr
  const cx = x + w / 2
  const cy = y + h / 2
  const rotation = ((sticker.rotation || 0) * Math.PI) / 180

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rotation)
  if (!sticker.noBg) {
    ctx.strokeStyle = '#ff9ec4'
    ctx.lineWidth = 4 * dpr
    ctx.strokeRect(-w / 2 - 3 * dpr, -h / 2 - 3 * dpr, w + 6 * dpr, h + 6 * dpr)
  }
  ctx.drawImage(img, -w / 2, -h / 2, w, h)
  ctx.restore()
}

export async function compositeFullScene(baseCanvas, drawCanvas, stickers, canvasSize, dpr) {
  const out = document.createElement('canvas')
  out.width = canvasSize * dpr
  out.height = canvasSize * dpr
  const ctx = out.getContext('2d')
  if (baseCanvas) ctx.drawImage(baseCanvas, 0, 0)

  for (const sticker of stickers) {
    const img = await new Promise((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = reject
      el.src = sticker.src
    })
    drawStickerOnContext(ctx, img, sticker, dpr)
  }

  if (drawCanvas) ctx.drawImage(drawCanvas, 0, 0)
  return out
}

export async function compositeCanvasWithStickers(canvas, stickers, canvasSize, dpr) {
  return compositeFullScene(null, canvas, stickers, canvasSize, dpr)
}
