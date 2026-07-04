function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    if (typeof src === 'string' && !src.startsWith('data:') && !src.startsWith('blob:')) {
      img.crossOrigin = 'anonymous'
    }
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('사진을 불러올 수 없습니다'))
    img.src = src
  })
}

function ensureCanvasCompat(ctx) {
  if (!ctx.roundRect) {
    ctx.roundRect = function roundRectPolyfill(x, y, w, h, r) {
      const radius = Math.min(r, w / 2, h / 2)
      ctx.beginPath()
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + w - radius, y)
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
      ctx.lineTo(x + w, y + h - radius)
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
      ctx.lineTo(x + radius, y + h)
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
      ctx.lineTo(x, y + radius)
      ctx.quadraticCurveTo(x, y, x + radius, y)
      ctx.closePath()
    }
  }
}

function drawBackground(ctx, setting, width, height) {
  const skyHeight = height * 0.55
  const gradient = ctx.createLinearGradient(0, 0, 0, skyHeight)
  gradient.addColorStop(0, '#87CEEB')
  gradient.addColorStop(1, '#E0F4FF')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, skyHeight)

  const groundY = height * 0.52
  const groundGrad = ctx.createLinearGradient(0, groundY, 0, height)
  if (setting === 'sea') {
    groundGrad.addColorStop(0, '#4FC3F7')
    groundGrad.addColorStop(1, '#0288D1')
  } else if (setting === 'forest') {
    groundGrad.addColorStop(0, '#7CB342')
    groundGrad.addColorStop(1, '#558B2F')
  } else {
    groundGrad.addColorStop(0, '#A5D6A7')
    groundGrad.addColorStop(1, '#66BB6A')
  }
  ctx.fillStyle = groundGrad
  ctx.fillRect(0, groundY, width, height - groundY)
}

function getImageSize(img) {
  return {
    w: img.naturalWidth || img.width || 1,
    h: img.naturalHeight || img.height || 1,
  }
}

function tryEstimateContentBounds(img) {
  const { w: imgW, h: imgH } = getImageSize(img)
  const sampleW = Math.min(imgW, 200)
  const sampleH = Math.min(imgH, 200)
  const canvas = document.createElement('canvas')
  canvas.width = sampleW
  canvas.height = sampleH
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null

  ctx.drawImage(img, 0, 0, sampleW, sampleH)
  let data
  try {
    data = ctx.getImageData(0, 0, sampleW, sampleH).data
  } catch {
    return null
  }

  const edgeSamples = []
  for (let x = 0; x < sampleW; x += 4) {
    edgeSamples.push((0 * sampleW + x) * 4)
    edgeSamples.push(((sampleH - 1) * sampleW + x) * 4)
  }
  for (let y = 0; y < sampleH; y += 4) {
    edgeSamples.push((y * sampleW + 0) * 4)
    edgeSamples.push((y * sampleW + sampleW - 1) * 4)
  }

  let bgR = 0
  let bgG = 0
  let bgB = 0
  edgeSamples.forEach((i) => {
    bgR += data[i]
    bgG += data[i + 1]
    bgB += data[i + 2]
  })
  bgR /= edgeSamples.length
  bgG /= edgeSamples.length
  bgB /= edgeSamples.length

  let minX = sampleW
  let minY = sampleH
  let maxX = 0
  let maxY = 0
  let found = false
  const threshold = 24

  for (let y = 0; y < sampleH; y += 2) {
    for (let x = 0; x < sampleW; x += 2) {
      const i = (y * sampleW + x) * 4
      const diff =
        Math.abs(data[i] - bgR) +
        Math.abs(data[i + 1] - bgG) +
        Math.abs(data[i + 2] - bgB)
      if (diff > threshold) {
        found = true
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }

  if (!found || maxX - minX < 4 || maxY - minY < 4) return null

  const pad = 0.15
  const bx = (minX / sampleW) * imgW
  const by = (minY / sampleH) * imgH
  const bw = ((maxX - minX) / sampleW) * imgW
  const bh = ((maxY - minY) / sampleH) * imgH

  return {
    x: Math.max(0, bx - bw * pad),
    y: Math.max(0, by - bh * pad),
    w: Math.min(imgW, bw * (1 + pad * 2)),
    h: Math.min(imgH, bh * (1 + pad * 2)),
  }
}

function getCropRegion(img) {
  const { w: imgW, h: imgH } = getImageSize(img)
  const detected = tryEstimateContentBounds(img)
  if (
    detected &&
    detected.w >= imgW * 0.06 &&
    detected.h >= imgH * 0.06 &&
    detected.w <= imgW * 0.98 &&
    detected.h <= imgH * 0.98
  ) {
    return detected
  }
  return { x: 0, y: 0, w: imgW, h: imgH }
}

function getSubjectLayout(width, height) {
  return {
    cx: width * 0.5,
    cy: height * 0.48,
    maxW: width * 0.88,
    maxH: height * 0.78,
    groundY: height * 0.82,
  }
}

function drawPhotoSubject(ctx, img, cx, cy, maxW, maxH, rotation = 0, alpha = 1) {
  const { w: imgW, h: imgH } = getImageSize(img)
  if (imgW < 2 || imgH < 2) return

  const crop = getCropRegion(img)
  const scale = Math.max(maxW / crop.w, maxH / crop.h)
  const dw = crop.w * scale
  const dh = crop.h * scale

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(cx, cy)
  ctx.rotate(rotation)

  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  ctx.beginPath()
  ctx.roundRect(-dw / 2 - 10, -dh / 2 - 10, dw + 20, dh + 20, 16)
  ctx.fill()

  ctx.strokeStyle = 'rgba(255,255,255,0.9)'
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.roundRect(-dw / 2 - 4, -dh / 2 - 4, dw + 8, dh + 8, 12)
  ctx.stroke()

  ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, -dw / 2, -dh / 2, dw, dh)
  ctx.restore()
}

function drawSubjectShadow(ctx, cx, groundY, subjectWidth) {
  ctx.fillStyle = 'rgba(0,0,0,0.16)'
  ctx.beginPath()
  ctx.ellipse(cx, groundY, subjectWidth * 0.34, 18, 0, 0, Math.PI * 2)
  ctx.fill()
}

function drawSparkles(ctx, cx, cy, count = 5) {
  const colors = ['#FFD54F', '#FF8A80', '#81D4FA', '#CE93D8', '#A5D6A7']
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    const r = 100 + (i % 2) * 35
    const x = cx + Math.cos(angle) * r
    const y = cy + Math.sin(angle) * r * 0.55 - 50
    ctx.fillStyle = colors[i % colors.length]
    ctx.font = 'bold 24px sans-serif'
    ctx.fillText('✦', x, y)
  }
}

function drawMusicNotes(ctx, cx, topY) {
  const notes = ['♪', '♫', '♪', '♬']
  ctx.textAlign = 'center'
  notes.forEach((note, i) => {
    ctx.fillStyle = `rgba(255, 107, 157, ${0.8 + i * 0.05})`
    ctx.font = `${30 + i * 4}px serif`
    ctx.fillText(note, cx - 95 + i * 58, topY + Math.sin(i * 1.2) * 8)
  })
  ctx.textAlign = 'left'
}

function drawDancingScene(ctx, img, setting, width, height) {
  drawBackground(ctx, setting, width, height)
  const { cx, cy, maxW, maxH, groundY } = getSubjectLayout(width, height)

  drawSubjectShadow(ctx, cx, groundY, maxW)
  drawPhotoSubject(ctx, img, cx - 36, cy + 12, maxW * 0.9, maxH * 0.9, -0.22, 0.35)
  drawPhotoSubject(ctx, img, cx + 36, cy + 12, maxW * 0.9, maxH * 0.9, 0.22, 0.35)
  drawPhotoSubject(ctx, img, cx, cy, maxW, maxH, -0.08, 1)
  drawMusicNotes(ctx, cx, cy - maxH * 0.52)
  drawSparkles(ctx, cx, cy - 20, 6)
}

function drawWalkingScene(ctx, img, setting, width, height) {
  drawBackground(ctx, setting, width, height)
  const { cx, cy, maxW, maxH, groundY } = getSubjectLayout(width, height)
  drawSubjectShadow(ctx, cx, groundY, maxW)
  drawPhotoSubject(ctx, img, cx, cy, maxW, maxH, 0.03, 1)
}

function drawPlayingScene(ctx, img, setting, width, height) {
  drawBackground(ctx, setting, width, height)
  const { cx, cy, maxW, maxH, groundY } = getSubjectLayout(width, height)
  drawSubjectShadow(ctx, cx, groundY, maxW)
  drawPhotoSubject(ctx, img, cx - 20, cy + 8, maxW * 0.92, maxH * 0.92, -0.06, 0.4)
  drawPhotoSubject(ctx, img, cx + 20, cy - 8, maxW, maxH, 0.06, 1)
  drawSparkles(ctx, cx, cy - 20, 4)
}

function drawRunningScene(ctx, img, setting, width, height) {
  drawBackground(ctx, setting, width, height)
  const { cx, cy, maxW, maxH, groundY } = getSubjectLayout(width, height)
  drawSubjectShadow(ctx, cx - 28, groundY, maxW)
  drawPhotoSubject(ctx, img, cx, cy, maxW, maxH, 0.1, 1)
}

function drawSleepingScene(ctx, img, setting, width, height) {
  drawBackground(ctx, setting, width, height)
  const { cx, cy, maxW, maxH, groundY } = getSubjectLayout(width, height)
  drawSubjectShadow(ctx, cx, groundY, maxW)
  drawPhotoSubject(ctx, img, cx, cy + 12, maxW, maxH * 0.92, 0, 1)
  ctx.fillStyle = 'rgba(100, 149, 237, 0.9)'
  ctx.font = 'bold 34px sans-serif'
  ctx.fillText('z z z', cx + maxW * 0.2, cy - maxH * 0.3)
}

function drawDefaultScene(ctx, img, setting, width, height) {
  drawBackground(ctx, setting, width, height)
  const { cx, cy, maxW, maxH, groundY } = getSubjectLayout(width, height)
  drawSubjectShadow(ctx, cx, groundY, maxW)
  drawPhotoSubject(ctx, img, cx, cy, maxW, maxH, 0, 1)
}

function drawExtraPhotos(ctx, images, width, height) {
  if (images.length <= 1) return
  const extras = images.slice(1, 3)
  extras.forEach((img, i) => {
    const x = width * (0.16 + i * 0.68)
    const y = height * 0.9
    const size = 64
    ctx.save()
    ctx.beginPath()
    ctx.arc(x, y, size / 2, 0, Math.PI * 2)
    ctx.clip()
    const { w, h } = getImageSize(img)
    const scale = Math.max(size / w, size / h)
    ctx.drawImage(img, x - (w * scale) / 2, y - (h * scale) / 2, w * scale, h * scale)
    ctx.restore()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(x, y, size / 2, 0, Math.PI * 2)
    ctx.stroke()
  })
}

function drawActionScene(ctx, img, extraImages, scene, width, height) {
  const action = scene?.action ?? 'walking'
  const setting = scene?.setting ?? 'park'

  switch (action) {
    case 'dancing':
      drawDancingScene(ctx, img, setting, width, height)
      break
    case 'running':
      drawRunningScene(ctx, img, setting, width, height)
      break
    case 'playing':
      drawPlayingScene(ctx, img, setting, width, height)
      break
    case 'sleeping':
      drawSleepingScene(ctx, img, setting, width, height)
      break
    case 'walking':
      drawWalkingScene(ctx, img, setting, width, height)
      break
    default:
      drawDefaultScene(ctx, img, setting, width, height)
  }

  drawExtraPhotos(ctx, [img, ...extraImages], width, height)
}

export async function generatePhotoBasedStoryImage(photoSrcs, scene) {
  if (!photoSrcs?.length) throw new Error('기본 사진이 필요합니다')

  const images = await Promise.all(photoSrcs.slice(0, 3).map(loadImage))
  const main = images[0]
  const { w, h } = getImageSize(main)
  if (w < 2 || h < 2) {
    throw new Error('사진 크기를 읽을 수 없습니다')
  }

  const canvas = document.createElement('canvas')
  canvas.width = 768
  canvas.height = 768
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('캔버스를 만들 수 없습니다')
  ensureCanvasCompat(ctx)

  drawActionScene(ctx, main, images.slice(1), scene, canvas.width, canvas.height)

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('사진 장면 변환 실패'))),
      'image/jpeg',
      0.92
    )
  })
}
