/** 도형(채우기) + 선(윤곽·다리·잎맥) 그리기 공통 유틸 */

export function fillCircle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
}

export function strokeCircle(ctx, x, y, r, stroke, lineWidth) {
  ctx.strokeStyle = stroke
  ctx.lineWidth = lineWidth
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.stroke()
}

export function fillEllipse(ctx, x, y, rx, ry, fill, rotation = 0) {
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2)
  ctx.fill()
}

export function strokeEllipse(ctx, x, y, rx, ry, stroke, lineWidth, rotation = 0) {
  ctx.strokeStyle = stroke
  ctx.lineWidth = lineWidth
  ctx.beginPath()
  ctx.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2)
  ctx.stroke()
}

export function fillRect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill
  ctx.fillRect(x, y, w, h)
}

export function strokeRect(ctx, x, y, w, h, stroke, lineWidth) {
  ctx.strokeStyle = stroke
  ctx.lineWidth = lineWidth
  ctx.strokeRect(x, y, w, h)
}

export function drawLine(ctx, x1, y1, x2, y2, stroke, lineWidth, cap = 'round') {
  ctx.strokeStyle = stroke
  ctx.lineWidth = lineWidth
  ctx.lineCap = cap
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

export function drawFilledRoundRect(ctx, x, y, w, h, r, fill, stroke, lineWidth) {
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fill()
  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = lineWidth ?? 2
    ctx.stroke()
  }
}

export function drawFace(ctx, x, y, size, { mouth = 'smile' } = {}) {
  const dot = Math.max(2, size * 0.035)
  fillCircle(ctx, x - size * 0.06, y - size * 0.02, dot, '#333')
  fillCircle(ctx, x + size * 0.06, y - size * 0.02, dot, '#333')
  ctx.strokeStyle = '#333'
  ctx.lineWidth = Math.max(1.5, size * 0.025)
  ctx.lineCap = 'round'
  ctx.beginPath()
  if (mouth === 'smile') {
    ctx.arc(x, y + size * 0.04, size * 0.07, 0.15, Math.PI - 0.15)
  } else {
    ctx.moveTo(x - size * 0.05, y + size * 0.06)
    ctx.lineTo(x + size * 0.05, y + size * 0.06)
  }
  ctx.stroke()
}

export function drawLimbs(ctx, cx, cy, size, stroke, legSpread = 0.14) {
  const lw = Math.max(2, size * 0.05)
  drawLine(ctx, cx, cy, cx - size * legSpread, cy + size * 0.28, stroke, lw)
  drawLine(ctx, cx, cy, cx + size * legSpread, cy + size * 0.28, stroke, lw)
  drawLine(ctx, cx, cy - size * 0.05, cx - size * 0.18, cy + size * 0.08, stroke, lw)
  drawLine(ctx, cx, cy - size * 0.05, cx + size * 0.18, cy + size * 0.08, stroke, lw)
}

export function drawSceneFrame(ctx, width, height) {
  ctx.strokeStyle = '#ff6b9d'
  ctx.lineWidth = 6
  ctx.strokeRect(12, 12, width - 24, height - 24)

  ctx.fillStyle = 'rgba(255,255,255,0.92)'
  ctx.strokeStyle = '#ffb3c6'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(18, height - 42, 168, 28, 10)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#666'
  ctx.font = 'bold 13px sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  ctx.fillText('⭕ 도형 + 📏 선', 28, height - 28)
}

const TYPE_SHAPE_HINTS = {
  rabbit: ['원(머리)', '긴 사각형(귀)', '타원(몸)', '선(다리)'],
  cat: ['타원(몸)', '삼각형(귀)', '곡선(꼬리)'],
  dog: ['타원(몸)', '원(머리)', '선(귀)'],
  bird: ['타원(날개)', '삼각형(부리)'],
  ant: ['타원 3개(몸)', '선 6개(다리)', '곡선(더듬이)'],
  child: ['원(얼굴)', '사각형(옷·다리)', '선(입)'],
  tree: ['사각형(줄기)', '원 3개(잎)', '선(윤곽)'],
  flower: ['선(줄기)', '원(꽃잎)'],
  leaf: ['곡선(잎)', '선(잎맥)'],
  sun: ['원(해)', '직선(햇살)'],
  cloud: ['원 여러 개', '곡선'],
  house: ['사각형', '삼각형(지붕)'],
  fish: ['타원(몸)', '삼각형(꼬리)'],
  toothpaste: ['둥근 사각형', '선(튜브)'],
  toothbrush: ['선(손잡이)', '사각형(모)'],
  bread: ['타원', '선(결)'],
  default: ['원·사각형·선'],
}

const SETTING_HINTS = {
  picnic: '사각형(돗자리)',
  park: '원(나무)',
  sea: '곡선(파도)',
  forest: '선+원(나무)',
  house: '사각형(집)',
  school: '사각형(건물)',
}

export function getShapeHintForType(type) {
  return TYPE_SHAPE_HINTS[type] ?? TYPE_SHAPE_HINTS.default
}

export function getShapeHintsForScene(scene) {
  if (!scene) return []

  const hints = new Set()
  hints.add('원·사각형·선으로 그림')

  const types = scene.characters?.map((c) => c.type) ?? scene.entities ?? []
  for (const type of types.slice(0, 3)) {
    const parts = getShapeHintForType(type)
    parts.forEach((p) => hints.add(p))
  }

  if (scene.setting && SETTING_HINTS[scene.setting]) {
    hints.add(SETTING_HINTS[scene.setting])
  }

  if (scene.weather === 'rain') hints.add('선(비)')
  if (scene.weather === 'snow') hints.add('원(눈)')
  if (scene.weather === 'sunny') hints.add('원+선(해)')

  return Array.from(hints).slice(0, 6)
}
