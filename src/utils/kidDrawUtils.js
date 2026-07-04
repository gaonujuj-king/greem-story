/** 아이 그림판 — 스티커·채우기 등 */

export const KID_COLORS = [
  { id: 'black', hex: '#2d2d2d', name: '검정' },
  { id: 'red', hex: '#ff5252', name: '빨강' },
  { id: 'orange', hex: '#ff9800', name: '주황' },
  { id: 'yellow', hex: '#ffeb3b', name: '노랑' },
  { id: 'green', hex: '#66bb6a', name: '초록' },
  { id: 'blue', hex: '#42a5f5', name: '파랑' },
  { id: 'purple', hex: '#ab47bc', name: '보라' },
  { id: 'pink', hex: '#ff6b9d', name: '분홍' },
  { id: 'brown', hex: '#8d6e63', name: '갈색' },
  { id: 'white', hex: '#ffffff', name: '하양' },
]

export const STAMP_ITEMS = [
  { id: 'star', emoji: '⭐', label: '별' },
  { id: 'heart', emoji: '❤️', label: '하트' },
  { id: 'sun', emoji: '☀️', label: '해' },
  { id: 'flower', emoji: '🌸', label: '꽃' },
  { id: 'smile', emoji: '😊', label: '웃음' },
  { id: 'cloud', emoji: '☁️', label: '구름' },
  { id: 'rabbit', emoji: '🐰', label: '토끼' },
  { id: 'rainbow', emoji: '🌈', label: '무지개' },
]

export function rainbowColor(step) {
  return `hsl(${(step * 47) % 360}, 88%, 52%)`
}

export function drawStamp(ctx, stampId, x, y, size, color = '#ffd54f') {
  ctx.save()
  ctx.translate(x, y)
  const s = size
  switch (stampId) {
    case 'star':
      drawStarShape(ctx, 0, 0, s, color)
      break
    case 'heart':
      drawHeartShape(ctx, 0, 0, s, '#ff5252')
      break
    case 'sun':
      drawSunStamp(ctx, 0, 0, s)
      break
    case 'flower':
      drawFlowerStamp(ctx, 0, 0, s)
      break
    case 'smile':
      drawSmiley(ctx, 0, 0, s)
      break
    case 'cloud':
      drawCloudStamp(ctx, 0, 0, s)
      break
    case 'rabbit':
      drawRabbitStamp(ctx, 0, 0, s)
      break
    case 'rainbow':
      drawRainbowStamp(ctx, 0, 0, s)
      break
    default:
      break
  }
  ctx.restore()
}

function drawStarShape(ctx, x, y, r, fill) {
  ctx.fillStyle = fill
  ctx.strokeStyle = '#f9a825'
  ctx.lineWidth = Math.max(2, r * 0.08)
  ctx.beginPath()
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
    const px = x + Math.cos(angle) * r
    const py = y + Math.sin(angle) * r
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
}

function drawHeartShape(ctx, x, y, r, fill) {
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.moveTo(x, y + r * 0.35)
  ctx.bezierCurveTo(x, y, x - r, y, x - r, y + r * 0.35)
  ctx.bezierCurveTo(x - r, y + r * 0.8, x, y + r * 1.1, x, y + r * 1.35)
  ctx.bezierCurveTo(x, y + r * 1.1, x + r, y + r * 0.8, x + r, y + r * 0.35)
  ctx.bezierCurveTo(x + r, y, x, y, x, y + r * 0.35)
  ctx.fill()
}

function drawSunStamp(ctx, x, y, r) {
  ctx.fillStyle = '#ffd54f'
  ctx.beginPath()
  ctx.arc(x, y, r * 0.45, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#ffb300'
  ctx.lineWidth = Math.max(2, r * 0.1)
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55)
    ctx.lineTo(x + Math.cos(a) * r * 0.85, y + Math.sin(a) * r * 0.85)
    ctx.stroke()
  }
}

function drawFlowerStamp(ctx, x, y, r) {
  const petals = 6
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2
    ctx.fillStyle = '#f48fb1'
    ctx.beginPath()
    ctx.arc(x + Math.cos(a) * r * 0.35, y + Math.sin(a) * r * 0.35, r * 0.28, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = '#ffeb3b'
  ctx.beginPath()
  ctx.arc(x, y, r * 0.22, 0, Math.PI * 2)
  ctx.fill()
}

function drawSmiley(ctx, x, y, r) {
  ctx.fillStyle = '#ffeb3b'
  ctx.strokeStyle = '#f9a825'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(x, y, r * 0.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#333'
  ctx.beginPath()
  ctx.arc(x - r * 0.18, y - r * 0.1, r * 0.07, 0, Math.PI * 2)
  ctx.arc(x + r * 0.18, y - r * 0.1, r * 0.07, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(x, y + r * 0.05, r * 0.22, 0.15, Math.PI - 0.15)
  ctx.stroke()
}

function drawCloudStamp(ctx, x, y, r) {
  ctx.fillStyle = '#fff'
  ctx.strokeStyle = '#90caf9'
  ctx.lineWidth = 2
  ;[
    [0, 0, r * 0.35],
    [-r * 0.35, r * 0.08, r * 0.28],
    [r * 0.32, r * 0.1, r * 0.26],
  ].forEach(([cx, cy, rad]) => {
    ctx.beginPath()
    ctx.arc(x + cx, y + cy, rad, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  })
}

function drawRabbitStamp(ctx, x, y, r) {
  ctx.fillStyle = '#f5f5f5'
  ctx.strokeStyle = '#bbb'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.ellipse(x, y + r * 0.15, r * 0.38, r * 0.32, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()
  ctx.fillRect(x - r * 0.12, y - r * 0.55, r * 0.1, r * 0.45)
  ctx.fillRect(x + r * 0.02, y - r * 0.52, r * 0.08, r * 0.4)
  ctx.fillStyle = '#333'
  ctx.beginPath()
  ctx.arc(x - r * 0.1, y + r * 0.08, r * 0.05, 0, Math.PI * 2)
  ctx.arc(x + r * 0.1, y + r * 0.08, r * 0.05, 0, Math.PI * 2)
  ctx.fill()
}

function drawRainbowStamp(ctx, x, y, r) {
  const bands = ['#ff5252', '#ff9800', '#ffeb3b', '#66bb6a', '#42a5f5', '#ab47bc']
  bands.forEach((c, i) => {
    ctx.strokeStyle = c
    ctx.lineWidth = r * 0.14
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.arc(x, y + r * 0.2, r * (0.85 - i * 0.1), Math.PI, 0)
    ctx.stroke()
  })
}

/** 간단 flood fill (아이용 채우기) */
export function floodFillCanvas(ctx, x, y, fillHex, width, height) {
  const px = Math.floor(x)
  const py = Math.floor(y)
  if (px < 0 || py < 0 || px >= width || py >= height) return false

  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  const startIdx = (py * width + px) * 4

  const target = [data[startIdx], data[startIdx + 1], data[startIdx + 2], data[startIdx + 3]]
  const fill = hexToRgba(fillHex)
  if (colorsMatch(target, fill)) return false

  const stack = [[px, py]]
  const visited = new Uint8Array(width * height)

  while (stack.length > 0) {
    const [cx, cy] = stack.pop()
    const idx = cy * width + cx
    if (cx < 0 || cy < 0 || cx >= width || cy >= height || visited[idx]) continue

    const i = idx * 4
    if (!colorsClose([data[i], data[i + 1], data[i + 2], data[i + 3]], target, 32)) continue

    visited[idx] = 1
    data[i] = fill[0]
    data[i + 1] = fill[1]
    data[i + 2] = fill[2]
    data[i + 3] = 255

    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1])
  }

  ctx.putImageData(imageData, 0, 0)
  return true
}

function hexToRgba(hex) {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255]
}

function colorsMatch(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2]
}

function colorsClose(a, b, tol) {
  return (
    Math.abs(a[0] - b[0]) <= tol &&
    Math.abs(a[1] - b[1]) <= tol &&
    Math.abs(a[2] - b[2]) <= tol
  )
}

export const SHAPE_ITEMS = [
  { id: 'line', icon: '📏', name: '선' },
  { id: 'circle', icon: '⭕', name: '원' },
  { id: 'rect', icon: '⬜', name: '네모' },
  { id: 'triangle', icon: '🔺', name: '세모' },
  { id: 'star', icon: '⭐', name: '별' },
  { id: 'heart', icon: '❤️', name: '하트' },
  { id: 'diamond', icon: '💠', name: '마름모' },
  { id: 'arrow', icon: '➡️', name: '화살' },
  { id: 'cloud', icon: '☁️', name: '구름' },
  { id: 'hexagon', icon: '⬡', name: '육각' },
]

function normalizeBox(start, end) {
  const x1 = Math.min(start.x, end.x)
  const y1 = Math.min(start.y, end.y)
  const x2 = Math.max(start.x, end.x)
  const y2 = Math.max(start.y, end.y)
  const w = x2 - x1 || 16
  const h = y2 - y1 || 16
  return { x1, y1, x2, y2, w, h, cx: (x1 + x2) / 2, cy: (y1 + y2) / 2 }
}

function traceStar(ctx, cx, cy, outerR, innerR, points = 5) {
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR
    const angle = (i * Math.PI) / points - Math.PI / 2
    const px = cx + Math.cos(angle) * r
    const py = cy + Math.sin(angle) * r
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
}

function traceHeart(ctx, cx, cy, size) {
  ctx.beginPath()
  ctx.moveTo(cx, cy + size * 0.35)
  ctx.bezierCurveTo(cx, cy - size * 0.05, cx - size, cy - size * 0.05, cx - size, cy + size * 0.35)
  ctx.bezierCurveTo(cx - size, cy + size * 0.75, cx, cy + size * 1.05, cx, cy + size * 1.3)
  ctx.bezierCurveTo(cx, cy + size * 1.05, cx + size, cy + size * 0.75, cx + size, cy + size * 0.35)
  ctx.bezierCurveTo(cx + size, cy - size * 0.05, cx, cy - size * 0.05, cx, cy + size * 0.35)
  ctx.closePath()
}

function traceHexagon(ctx, cx, cy, rx, ry) {
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2
    const px = cx + Math.cos(angle) * rx
    const py = cy + Math.sin(angle) * ry
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
}

function traceCloud(ctx, cx, cy, w, h) {
  const r = Math.min(w, h) * 0.22
  ctx.beginPath()
  ctx.arc(cx - w * 0.18, cy + h * 0.05, r, 0, Math.PI * 2)
  ctx.arc(cx, cy - h * 0.08, r * 1.15, 0, Math.PI * 2)
  ctx.arc(cx + w * 0.2, cy + h * 0.05, r * 0.95, 0, Math.PI * 2)
  ctx.arc(cx + w * 0.05, cy + h * 0.12, r * 0.85, 0, Math.PI * 2)
}

function traceArrow(ctx, start, end, headLen) {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const angle = Math.atan2(dy, dx)
  const len = Math.max(headLen * 2, Math.hypot(dx, dy))
  const tipX = start.x + Math.cos(angle) * len
  const tipY = start.y + Math.sin(angle) * len
  ctx.beginPath()
  ctx.moveTo(start.x, start.y)
  ctx.lineTo(tipX, tipY)
  ctx.moveTo(tipX, tipY)
  ctx.lineTo(tipX - headLen * Math.cos(angle - Math.PI / 6), tipY - headLen * Math.sin(angle - Math.PI / 6))
  ctx.moveTo(tipX, tipY)
  ctx.lineTo(tipX - headLen * Math.cos(angle + Math.PI / 6), tipY - headLen * Math.sin(angle + Math.PI / 6))
}

/** 드래그로 그리는 도형 (아이 그림판) */
export function drawKidDragShape(ctx, start, end, tool, stroke, { filled = true, lineWidth = 4 } = {}) {
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = lineWidth
  ctx.strokeStyle = stroke
  ctx.fillStyle = stroke

  const box = normalizeBox(start, end)

  if (tool === 'line') {
    ctx.beginPath()
    ctx.moveTo(start.x, start.y)
    ctx.lineTo(end.x, end.y)
    ctx.stroke()
    return
  }

  if (tool === 'arrow') {
    traceArrow(ctx, start, end, Math.max(12, lineWidth * 3))
    ctx.stroke()
    return
  }

  ctx.beginPath()

  switch (tool) {
    case 'circle':
      ctx.ellipse(box.cx, box.cy, box.w / 2, box.h / 2, 0, 0, Math.PI * 2)
      break
    case 'rect':
      ctx.rect(box.x1, box.y1, box.w, box.h)
      break
    case 'triangle':
      ctx.moveTo(box.cx, box.y1)
      ctx.lineTo(box.x2, box.y2)
      ctx.lineTo(box.x1, box.y2)
      ctx.closePath()
      break
    case 'diamond':
      ctx.moveTo(box.cx, box.y1)
      ctx.lineTo(box.x2, box.cy)
      ctx.lineTo(box.cx, box.y2)
      ctx.lineTo(box.x1, box.cy)
      ctx.closePath()
      break
    case 'star':
      traceStar(ctx, box.cx, box.cy, Math.min(box.w, box.h) * 0.48, Math.min(box.w, box.h) * 0.22)
      break
    case 'heart':
      traceHeart(ctx, box.cx, box.cy - box.h * 0.05, Math.min(box.w, box.h) * 0.38)
      break
    case 'cloud':
      traceCloud(ctx, box.cx, box.cy, box.w, box.h)
      break
    case 'hexagon':
      traceHexagon(ctx, box.cx, box.cy, box.w / 2, box.h / 2)
      break
    default:
      ctx.rect(box.x1, box.y1, box.w, box.h)
      break
  }

  if (tool === 'cloud') {
    if (filled) {
      ctx.save()
      ctx.globalAlpha = 0.55
      ctx.fill()
      ctx.restore()
    }
    ctx.stroke()
    return
  }

  if (filled) {
    ctx.save()
    ctx.globalAlpha = 0.55
    ctx.fill()
    ctx.restore()
  }
  ctx.stroke()
}

export const TOOL_HINTS = {
  pen: '✏️ 손가락으로 쓱쓱 그려요!',
  rainbow: '🌈 무지개색으로 마법처럼 그려요!',
  eraser: '🧽 지우개로 지워요!',
  fill: '🪣 빈 곳을 눌러 색을 채워요!',
  line: '📏 드래그해서 선을 그어요!',
  circle: '⭕ 드래그해서 원을 그려요!',
  rect: '⬜ 드래그해서 네모를 그려요!',
  triangle: '🔺 드래그해서 세모를 그려요!',
  star: '⭐ 드래그해서 별을 그려요!',
  heart: '❤️ 드래그해서 하트를 그려요!',
  diamond: '💠 드래그해서 마름모를 그려요!',
  arrow: '➡️ 드래그해서 화살표를 그려요!',
  cloud: '☁️ 드래그해서 구름을 그려요!',
  hexagon: '⬡ 드래그해서 육각형을 그려요!',
  stamp: '⭐ 도장을 눌러 붙여요!',
  photo: '📷 사진을 옮기고 ↺↻ 버튼으로 돌려요!',
  move: '✋ 그림을 드래그해서 옮기고, ➖ ➕ 로 크기를 바꿔요!',
  resize: '🔍 바꿀 그림을 누른 뒤, ➖ ➕ 로 크기를 조절해요!',
}
