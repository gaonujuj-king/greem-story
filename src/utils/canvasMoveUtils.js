const ALPHA_THRESHOLD = 12

function imageDataToCanvas(imageData) {
  const canvas = document.createElement('canvas')
  canvas.width = imageData.width
  canvas.height = imageData.height
  canvas.getContext('2d').putImageData(imageData, 0, 0)
  return canvas
}

/** 터치 지점과 연결된 그림 영역을 잘라 캔버스에서 제거 */
export function extractConnectedRegion(ctx, px, py, width, height) {
  if (px < 0 || py < 0 || px >= width || py >= height) return null

  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
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
        data[si + 3] = 0
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)

  return {
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

export function drawFloatingCrop(ctx, cropCanvas, x, y, dpr, alpha = 0.88) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.drawImage(cropCanvas, x * dpr, y * dpr, cropCanvas.width, cropCanvas.height)
  ctx.restore()
}

export function commitFloatingCrop(ctx, cropCanvas, x, y, dpr) {
  ctx.drawImage(cropCanvas, x * dpr, y * dpr, cropCanvas.width, cropCanvas.height)
}

export function hitTestSticker(stickers, x, y) {
  for (let i = stickers.length - 1; i >= 0; i--) {
    const s = stickers[i]
    if (x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) return s.id
  }
  return null
}
