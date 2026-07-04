const ALPHA_THRESHOLD = 12
const MOVE_START_THRESHOLD = 8
const MOVE_SCALE_MIN = 0.2
const MOVE_SCALE_MAX = 3

function imageDataToCanvas(imageData) {
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height
  canvas.getContext('2d').putImageData(imageData, 0, 0)
  return canvas
}

function floodConnectedRegion(data, width, height, px, py) {
  const startIdx = py * width + px
  if (data[startIdx * 4 + 3] < ALPHA_THRESHOLD) return null

  const visited = new Uint8Array(width * height)
  const stack = [[px, py]]
  let minX = px
  let maxX = px
  let minY = py
  let maxY = py
  let count = 0

  while (stack.length > 0) {
    const [cx, cy] = stack.pop()
    const idx = cy * width + cx
    if (cx < 0 || cy < 0 || cx >= width || cy >= height || visited[idx]) continue
    if (data[idx * 4 + 3] < ALPHA_THRESHOLD) continue

    visited[idx] = 1
    count += 1
    if (cx < minX) minX = cx
    if (cx > maxX) maxX = cx
    if (cy < minY) minY = cy
    if (cy > maxY) maxY = cy

    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1])
  }

  if (count === 0) return null

  const pad = 2
  minX = Math.max(0, minX - pad)
  minY = Math.max(0, minY - pad)
  maxX = Math.min(width - 1, maxX + pad)
  maxY = Math.min(height - 1, maxY + pad)

  const cropW = maxX - minX + 1
  const cropH = maxY - minY + 1
  const crop = new ImageData(cropW, cropH)

  for (let cy = minY; cy <= maxY; cy++) {
    for (let cx = minX; cx <= maxX; cx++) {
      const srcIdx = cy * width + cx
      const dstIdx = (cy - minY) * cropW + (cx - minX)
      const si = srcIdx * 4
      const di = dstIdx * 4

      if (visited[srcIdx]) {
        crop.data[di] = data[si]
        crop.data[di + 1] = data[si + 1]
        crop.data[di + 2] = data[si + 2]
        crop.data[di + 3] = data[si + 3]
      }
    }
  }

  return {
    visited,
    width,
    height,
    crop,
    cropCanvas: imageDataToCanvas(crop),
    minX,
    minY,
    cropW,
    cropH,
    grabPx: px - minX,
    grabPy: py - minY,
  }
}

/** 터치 지점과 연결된 그림 영역 분석 (캔버스는 변경하지 않음) */
export function analyzeConnectedRegion(ctx, px, py, width, height) {
  if (px < 0 || py < 0 || px >= width || py >= height) return null
  const imageData = ctx.getImageData(0, 0, width, height)
  return floodConnectedRegion(imageData.data, width, height, px, py)
}

function eraseVisitedPixels(ctx, visited, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  for (let i = 0; i < visited.length; i++) {
    if (visited[i]) data[i * 4 + 3] = 0
  }
  ctx.putImageData(imageData, 0, 0)
}

/** 캔버스 ctx는 dpr 변환이 적용된 상태 → 논리 좌표로 그린다 */
export function drawFloatingCrop(ctx, cropCanvas, analysis, x, y, dpr, scale = 1, alpha = 0.88) {
  const w = (analysis.cropW / dpr) * scale
  const h = (analysis.cropH / dpr) * scale
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.drawImage(cropCanvas, x, y, w, h)
  ctx.restore()
}

export function renderMovePreview(ctx, fullSnapshot, analysis, x, y, dpr, scale = 1) {
  ctx.putImageData(fullSnapshot, 0, 0)
  eraseVisitedPixels(ctx, analysis.visited, analysis.width, analysis.height)
  drawFloatingCrop(ctx, analysis.cropCanvas, analysis, x, y, dpr, scale, 0.88)
}

export function commitMovedRegion(ctx, fullSnapshot, analysis, x, y, dpr, scale = 1) {
  ctx.putImageData(fullSnapshot, 0, 0)
  eraseVisitedPixels(ctx, analysis.visited, analysis.width, analysis.height)
  drawFloatingCrop(ctx, analysis.cropCanvas, analysis, x, y, dpr, scale, 1)
}

export function moveDragDistance(start, end) {
  return Math.hypot(end.x - start.x, end.y - start.y)
}

export function clampMoveScale(scale) {
  return Math.min(MOVE_SCALE_MAX, Math.max(MOVE_SCALE_MIN, scale))
}

export function getRegionCenter(analysis, dpr) {
  const lw = analysis.cropW / dpr
  const lh = analysis.cropH / dpr
  return {
    x: analysis.minX / dpr + lw / 2,
    y: analysis.minY / dpr + lh / 2,
  }
}

/** 선택 영역을 가운데 기준으로 scale 배율만큼 키우거나 줄인다 */
export function scaleRegionAtCenter(ctx, fullSnapshot, analysis, centerX, centerY, dpr, scale) {
  const lw = analysis.cropW / dpr
  const lh = analysis.cropH / dpr
  const w = lw * scale
  const h = lh * scale
  const x = centerX - w / 2
  const y = centerY - h / 2
  commitMovedRegion(ctx, fullSnapshot, analysis, x, y, dpr, scale)
  return { x, y, w, h }
}

export const RESIZE_STEPS = [
  { id: 'xs', label: '아주 작게', factor: 0.7 },
  { id: 's', label: '작게', factor: 0.85 },
  { id: 'l', label: '크게', factor: 1.15 },
  { id: 'xl', label: '아주 크게', factor: 1.3 },
]

export { MOVE_START_THRESHOLD, MOVE_SCALE_MIN, MOVE_SCALE_MAX }

export function hitTestSticker(stickers, x, y) {
  for (let i = stickers.length - 1; i >= 0; i--) {
    const s = stickers[i]
    if (x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) return s.id
  }
  return null
}
