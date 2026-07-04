import {
  fillCircle,
  strokeCircle,
  fillEllipse,
  strokeEllipse,
  fillRect,
  drawLine,
  drawFilledRoundRect,
  drawFace,
  drawLimbs,
} from './shapeLineDrawer'

export function drawShapeRabbit(ctx, x, y, size) {
  ctx.save()
  const outline = '#bbb'
  const lw = Math.max(2, size * 0.025)

  fillEllipse(ctx, x, y, size * 0.38, size * 0.32, '#f5f5f5')
  strokeEllipse(ctx, x, y, size * 0.38, size * 0.32, outline, lw)

  fillCircle(ctx, x + size * 0.28, y - size * 0.18, size * 0.22, '#f5f5f5')
  strokeCircle(ctx, x + size * 0.28, y - size * 0.18, size * 0.22, outline, lw)

  fillRect(ctx, x + size * 0.12, y - size * 0.65, size * 0.12, size * 0.4, '#f0f0f0')
  strokeRect(ctx, x + size * 0.12, y - size * 0.65, size * 0.12, size * 0.4, outline, lw)
  fillRect(ctx, x + size * 0.3, y - size * 0.6, size * 0.1, size * 0.35, '#f0f0f0')
  strokeRect(ctx, x + size * 0.3, y - size * 0.6, size * 0.1, size * 0.35, outline, lw)

  fillEllipse(ctx, x + size * 0.18, y - size * 0.55, size * 0.06, size * 0.12, '#ffb8b8')
  fillEllipse(ctx, x + size * 0.34, y - size * 0.52, size * 0.05, size * 0.1, '#ffb8b8')

  drawFace(ctx, x + size * 0.28, y - size * 0.18, size)
  drawLimbs(ctx, x + size * 0.1, y + size * 0.12, size, '#888', 0.1)
  ctx.restore()
}

function strokeRect(ctx, x, y, w, h, stroke, lineWidth) {
  ctx.strokeStyle = stroke
  ctx.lineWidth = lineWidth
  ctx.strokeRect(x, y, w, h)
}

export function drawShapeChild(ctx, x, y, size) {
  ctx.save()
  const outline = '#c8956a'
  const lw = Math.max(2, size * 0.02)

  fillCircle(ctx, x, y - size * 0.55, size * 0.18, '#ffd1a9')
  strokeCircle(ctx, x, y - size * 0.55, size * 0.18, outline, lw)

  fillRect(ctx, x - size * 0.2, y - size * 0.38, size * 0.4, size * 0.35, '#6bcbff')
  strokeRect(ctx, x - size * 0.2, y - size * 0.38, size * 0.4, size * 0.35, '#3d8fd4', lw)

  fillRect(ctx, x - size * 0.18, y - size * 0.05, size * 0.14, size * 0.35, '#4a7fc8')
  strokeRect(ctx, x - size * 0.18, y - size * 0.05, size * 0.14, size * 0.35, '#2d5a9e', lw)
  fillRect(ctx, x + size * 0.04, y - size * 0.05, size * 0.14, size * 0.35, '#4a7fc8')
  strokeRect(ctx, x + size * 0.04, y - size * 0.05, size * 0.14, size * 0.35, '#2d5a9e', lw)

  drawLine(ctx, x - size * 0.18, y + size * 0.3, x - size * 0.22, y + size * 0.42, '#333', lw)
  drawLine(ctx, x + size * 0.18, y + size * 0.3, x + size * 0.22, y + size * 0.42, '#333', lw)

  drawFace(ctx, x, y - size * 0.55, size)
  ctx.restore()
}

export function drawShapeTree(ctx, x, y, size) {
  ctx.save()
  const lw = Math.max(2, size * 0.02)
  fillRect(ctx, x - size * 0.12, y, size * 0.24, size * 0.55, '#8B5E3C')
  strokeRect(ctx, x - size * 0.12, y, size * 0.24, size * 0.55, '#5d4037', lw)

  const foliage = [
    [x, y - size * 0.1, size * 0.45],
    [x - size * 0.28, y + size * 0.05, size * 0.32],
    [x + size * 0.28, y + size * 0.05, size * 0.32],
  ]
  foliage.forEach(([fx, fy, r]) => {
    fillCircle(ctx, fx, fy, r, '#3da845')
    strokeCircle(ctx, fx, fy, r, '#2e7d32', lw)
  })
  ctx.restore()
}

export function drawShapeColoredCircle(ctx, x, y, size, color, withStem = false) {
  ctx.save()
  const lw = Math.max(2, size * 0.04)
  fillCircle(ctx, x, y, size * 0.32, color)
  strokeCircle(ctx, x, y, size * 0.32, '#33333388', lw)
  if (withStem) {
    drawLine(ctx, x, y - size * 0.32, x + size * 0.08, y - size * 0.5, '#558B2F', 3)
  }
  ctx.restore()
}

export function drawShapeGeneric(ctx, x, y, size, color = '#90caf9') {
  ctx.save()
  const lw = Math.max(2, size * 0.03)
  drawFilledRoundRect(
    ctx,
    x - size * 0.28,
    y - size * 0.22,
    size * 0.56,
    size * 0.44,
    8,
    color,
    '#33333355',
    lw
  )
  drawLine(ctx, x - size * 0.15, y - size * 0.05, x + size * 0.15, y + size * 0.05, '#33333344', lw)
  ctx.restore()
}

export function drawShapeSun(ctx, x, y, size) {
  ctx.save()
  fillCircle(ctx, x, y, size, '#ffd93d')
  strokeCircle(ctx, x, y, size, '#ffb800', 2)
  ctx.strokeStyle = '#ffb800'
  ctx.lineWidth = 3
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(x + Math.cos(angle) * (size + 8), y + Math.sin(angle) * (size + 8))
    ctx.lineTo(x + Math.cos(angle) * (size + 22), y + Math.sin(angle) * (size + 22))
    ctx.stroke()
  }
  ctx.restore()
}
