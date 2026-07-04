import { NOUN_CATEGORIES, isFoodEntity } from './koreanNounDictionary'

function createSeededRandom(seed) {
  let value = 0
  for (let i = 0; i < seed.length; i++) {
    value = (value * 31 + seed.charCodeAt(i)) >>> 0
  }
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 0x100000000
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
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

function drawSky(ctx, weather, width, height) {
  const skyHeight = height * 0.62
  const gradient = ctx.createLinearGradient(0, 0, 0, skyHeight)

  if (weather === 'night') {
    gradient.addColorStop(0, '#1a1a4e')
    gradient.addColorStop(1, '#3d2b6e')
  } else if (weather === 'sunset') {
    gradient.addColorStop(0, '#ff9a76')
    gradient.addColorStop(0.5, '#ffd1a9')
    gradient.addColorStop(1, '#fff0d4')
  } else if (weather === 'rain') {
    gradient.addColorStop(0, '#7a8ea3')
    gradient.addColorStop(1, '#b8c9d9')
  } else if (weather === 'snow') {
    gradient.addColorStop(0, '#c8d8e8')
    gradient.addColorStop(1, '#e8f0f8')
  } else if (weather === 'cloudy') {
    gradient.addColorStop(0, '#7eb0d4')
    gradient.addColorStop(1, '#b8d4ea')
  } else {
    gradient.addColorStop(0, '#6ec6ff')
    gradient.addColorStop(1, '#b8e4ff')
  }

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, skyHeight)
}

function drawGround(ctx, setting, weather, width, height) {
  const groundY = height * 0.62
  const groundH = height - groundY

  if (setting === 'sea') {
    const seaGrad = ctx.createLinearGradient(0, groundY, 0, height)
    seaGrad.addColorStop(0, '#4db8e8')
    seaGrad.addColorStop(1, '#1a7ab5')
    ctx.fillStyle = seaGrad
    ctx.fillRect(0, groundY, width, groundH)

    ctx.fillStyle = '#f5d78e'
    ctx.beginPath()
    ctx.moveTo(0, groundY)
    ctx.lineTo(width, groundY)
    ctx.lineTo(width, groundY + 40)
    ctx.quadraticCurveTo(width * 0.5, groundY + 20, 0, groundY + 35)
    ctx.closePath()
    ctx.fill()
    return
  }

  let groundColor = '#7ec850'
  if (weather === 'snow') groundColor = '#eef5ff'
  if (setting === 'city') groundColor = '#b0b0b0'
  if (setting === 'house' || setting === 'school') groundColor = '#8fd068'

  ctx.fillStyle = groundColor
  ctx.fillRect(0, groundY, width, groundH)

  ctx.fillStyle = weather === 'snow' ? '#dde8f5' : '#6ab840'
  ctx.beginPath()
  ctx.moveTo(0, groundY + 8)
  for (let x = 0; x <= width; x += 40) {
    ctx.lineTo(x, groundY + 8 + Math.sin(x * 0.05) * 6)
  }
  ctx.lineTo(width, height)
  ctx.lineTo(0, height)
  ctx.closePath()
  ctx.fill()
}

function drawSun(ctx, x, y, size) {
  ctx.save()
  ctx.fillStyle = '#ffd93d'
  ctx.beginPath()
  ctx.arc(x, y, size, 0, Math.PI * 2)
  ctx.fill()

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

function drawMoon(ctx, x, y, size) {
  ctx.save()
  ctx.fillStyle = '#fff8dc'
  ctx.beginPath()
  ctx.arc(x, y, size, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#1a1a4e'
  ctx.beginPath()
  ctx.arc(x + size * 0.35, y - size * 0.1, size * 0.82, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawStars(ctx, width, height, rand) {
  ctx.fillStyle = '#fffacd'
  for (let i = 0; i < 30; i++) {
    const x = rand() * width
    const y = rand() * height * 0.45
    const s = 2 + rand() * 3
    ctx.beginPath()
    ctx.arc(x, y, s, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawCloud(ctx, x, y, scale) {
  ctx.save()
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  const r = 22 * scale
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.arc(x + r * 0.9, y - r * 0.3, r * 0.8, 0, Math.PI * 2)
  ctx.arc(x + r * 1.7, y, r * 0.85, 0, Math.PI * 2)
  ctx.arc(x + r * 0.85, y + r * 0.2, r * 0.7, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawRain(ctx, width, height) {
  ctx.strokeStyle = 'rgba(120,160,200,0.5)'
  ctx.lineWidth = 2
  for (let i = 0; i < 60; i++) {
    const x = (i * 37) % width
    const y = (i * 23) % (height * 0.65)
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x - 4, y + 14)
    ctx.stroke()
  }
}

function drawSnow(ctx, width, height, rand) {
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  for (let i = 0; i < 40; i++) {
    const x = rand() * width
    const y = rand() * height * 0.65
    ctx.beginPath()
    ctx.arc(x, y, 2 + rand() * 3, 0, Math.PI * 2)
    ctx.fill()
  }
}

function drawTree(ctx, x, y, size) {
  ctx.save()
  ctx.fillStyle = '#8B5E3C'
  ctx.fillRect(x - size * 0.12, y, size * 0.24, size * 0.55)

  ctx.fillStyle = '#3da845'
  ctx.beginPath()
  ctx.arc(x, y - size * 0.1, size * 0.45, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x - size * 0.28, y + size * 0.05, size * 0.32, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + size * 0.28, y + size * 0.05, size * 0.32, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawLeaf(ctx, x, y, size) {
  ctx.save()
  ctx.fillStyle = '#43a047'
  ctx.strokeStyle = '#2e7d32'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x - size * 0.05, y + size * 0.15)
  ctx.quadraticCurveTo(x - size * 0.45, y - size * 0.1, x, y - size * 0.45)
  ctx.quadraticCurveTo(x + size * 0.45, y - size * 0.1, x + size * 0.05, y + size * 0.15)
  ctx.quadraticCurveTo(x, y + size * 0.05, x - size * 0.05, y + size * 0.15)
  ctx.fill()
  ctx.stroke()
  ctx.strokeStyle = '#1b5e20'
  ctx.beginPath()
  ctx.moveTo(x, y + size * 0.1)
  ctx.lineTo(x, y - size * 0.4)
  ctx.stroke()
  ctx.restore()
}

function drawFlower(ctx, x, y, size) {
  ctx.save()
  ctx.strokeStyle = '#3da845'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x, y - size * 0.5)
  ctx.stroke()

  const colors = ['#ff6b9d', '#ffd166', '#b388ff', '#ff8fab']
  const petColor = colors[Math.floor(x) % colors.length]
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2
    ctx.fillStyle = petColor
    ctx.beginPath()
    ctx.ellipse(
      x + Math.cos(angle) * size * 0.18,
      y - size * 0.5 + Math.sin(angle) * size * 0.18,
      size * 0.14,
      size * 0.1,
      angle,
      0,
      Math.PI * 2
    )
    ctx.fill()
  }
  ctx.fillStyle = '#ffd93d'
  ctx.beginPath()
  ctx.arc(x, y - size * 0.5, size * 0.1, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawHouse(ctx, x, y, size) {
  ctx.save()
  ctx.fillStyle = '#ffe8cc'
  ctx.fillRect(x - size * 0.4, y - size * 0.35, size * 0.8, size * 0.55)

  ctx.fillStyle = '#e85d5d'
  ctx.beginPath()
  ctx.moveTo(x - size * 0.48, y - size * 0.35)
  ctx.lineTo(x, y - size * 0.7)
  ctx.lineTo(x + size * 0.48, y - size * 0.35)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#6bcbff'
  ctx.fillRect(x - size * 0.15, y - size * 0.15, size * 0.2, size * 0.2)
  ctx.fillStyle = '#8B5E3C'
  ctx.fillRect(x + size * 0.05, y, size * 0.18, size * 0.2)
  ctx.restore()
}

function drawCat(ctx, x, y, size) {
  ctx.save()
  ctx.fillStyle = '#ffaa55'
  ctx.beginPath()
  ctx.ellipse(x, y, size * 0.45, size * 0.35, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.arc(x + size * 0.35, y - size * 0.25, size * 0.28, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#ffaa55'
  ctx.beginPath()
  ctx.moveTo(x + size * 0.2, y - size * 0.45)
  ctx.lineTo(x + size * 0.15, y - size * 0.65)
  ctx.lineTo(x + size * 0.35, y - size * 0.48)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(x + size * 0.45, y - size * 0.45)
  ctx.lineTo(x + size * 0.55, y - size * 0.65)
  ctx.lineTo(x + size * 0.55, y - size * 0.45)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = '#ffaa55'
  ctx.lineWidth = size * 0.1
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x - size * 0.3, y)
  ctx.quadraticCurveTo(x - size * 0.7, y - size * 0.2, x - size * 0.65, y + size * 0.15)
  ctx.stroke()

  ctx.fillStyle = '#333'
  ctx.beginPath()
  ctx.arc(x + size * 0.28, y - size * 0.28, size * 0.05, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + size * 0.42, y - size * 0.28, size * 0.05, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawDog(ctx, x, y, size) {
  ctx.save()
  ctx.fillStyle = '#c68642'
  ctx.beginPath()
  ctx.ellipse(x, y, size * 0.5, size * 0.32, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.arc(x + size * 0.38, y - size * 0.22, size * 0.3, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#a06830'
  ctx.beginPath()
  ctx.ellipse(x + size * 0.15, y - size * 0.35, size * 0.12, size * 0.22, -0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(x + size * 0.45, y - size * 0.35, size * 0.12, size * 0.22, 0.3, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#333'
  ctx.beginPath()
  ctx.arc(x + size * 0.32, y - size * 0.25, size * 0.05, 0, Math.PI * 2)
  ctx.arc(x + size * 0.46, y - size * 0.25, size * 0.05, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#ff8888'
  ctx.beginPath()
  ctx.ellipse(x + size * 0.55, y - size * 0.12, size * 0.08, size * 0.06, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawBird(ctx, x, y, size) {
  ctx.save()
  ctx.fillStyle = '#6bcbff'
  ctx.beginPath()
  ctx.ellipse(x, y, size * 0.35, size * 0.25, -0.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + size * 0.2, y - size * 0.15, size * 0.18, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#ffd166'
  ctx.beginPath()
  ctx.moveTo(x + size * 0.32, y - size * 0.12)
  ctx.lineTo(x + size * 0.48, y - size * 0.08)
  ctx.lineTo(x + size * 0.32, y - size * 0.04)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#333'
  ctx.beginPath()
  ctx.arc(x + size * 0.26, y - size * 0.18, size * 0.04, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawRabbit(ctx, x, y, size) {
  ctx.save()
  ctx.fillStyle = '#f0f0f0'
  ctx.beginPath()
  ctx.ellipse(x, y, size * 0.38, size * 0.32, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + size * 0.28, y - size * 0.18, size * 0.22, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillRect(x + size * 0.12, y - size * 0.65, size * 0.12, size * 0.4)
  ctx.fillRect(x + size * 0.3, y - size * 0.6, size * 0.1, size * 0.35)
  ctx.fillStyle = '#ffb8b8'
  ctx.beginPath()
  ctx.ellipse(x + size * 0.18, y - size * 0.55, size * 0.06, size * 0.12, 0, 0, Math.PI * 2)
  ctx.ellipse(x + size * 0.34, y - size * 0.52, size * 0.05, size * 0.1, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#333'
  ctx.beginPath()
  ctx.arc(x + size * 0.24, y - size * 0.2, size * 0.04, 0, Math.PI * 2)
  ctx.arc(x + size * 0.34, y - size * 0.2, size * 0.04, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawButterfly(ctx, x, y, size) {
  ctx.save()
  ctx.fillStyle = '#b388ff'
  ctx.beginPath()
  ctx.ellipse(x - size * 0.22, y, size * 0.22, size * 0.18, -0.3, 0, Math.PI * 2)
  ctx.ellipse(x + size * 0.22, y, size * 0.22, size * 0.18, 0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#d4b5ff'
  ctx.beginPath()
  ctx.ellipse(x - size * 0.18, y + size * 0.15, size * 0.15, size * 0.12, -0.2, 0, Math.PI * 2)
  ctx.ellipse(x + size * 0.18, y + size * 0.15, size * 0.15, size * 0.12, 0.2, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#4a3728'
  ctx.fillRect(x - size * 0.03, y - size * 0.2, size * 0.06, size * 0.4)
  ctx.restore()
}

function drawUnderwaterBackground(ctx, width, height) {
  const grad = ctx.createLinearGradient(0, 0, 0, height)
  grad.addColorStop(0, '#5ec8e8')
  grad.addColorStop(0.4, '#2a9fd4')
  grad.addColorStop(1, '#0d5a80')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = 'rgba(255,255,255,0.15)'
  for (let i = 0; i < 8; i++) {
    const x = (width * 0.15) + (i * width * 0.1)
    ctx.beginPath()
    ctx.ellipse(x, 0, 30, height * 0.9, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  for (let i = 0; i < 20; i++) {
    const bx = (i * 47) % width
    const by = (i * 31) % height
    ctx.beginPath()
    ctx.arc(bx, by, 2 + (i % 3), 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.fillStyle = '#2d8a54'
  for (let i = 0; i < 4; i++) {
    const sx = width * (0.1 + i * 0.25)
    ctx.beginPath()
    ctx.moveTo(sx, height)
    ctx.quadraticCurveTo(sx - 10, height * 0.7, sx + 5, height * 0.55)
    ctx.quadraticCurveTo(sx + 15, height * 0.75, sx + 8, height)
    ctx.fill()
  }
}

function drawShark(ctx, x, y, size, mouthOpen = true) {
  ctx.save()
  ctx.fillStyle = '#6a7d8f'
  ctx.beginPath()
  ctx.ellipse(x, y, size * 0.55, size * 0.22, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(x + size * 0.45, y - size * 0.05)
  ctx.lineTo(x + size * 0.75, y - size * 0.2)
  ctx.lineTo(x + size * 0.72, y + size * 0.05)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#ff8888'
  if (mouthOpen) {
    ctx.beginPath()
    ctx.moveTo(x + size * 0.35, y + size * 0.05)
    ctx.lineTo(x + size * 0.55, y + size * 0.25)
    ctx.lineTo(x + size * 0.65, y + size * 0.02)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#fff'
    for (let i = 0; i < 4; i++) {
      ctx.beginPath()
      ctx.moveTo(x + size * (0.38 + i * 0.05), y + size * 0.08)
      ctx.lineTo(x + size * (0.4 + i * 0.05), y + size * 0.18)
      ctx.lineTo(x + size * (0.42 + i * 0.05), y + size * 0.08)
      ctx.fill()
    }
  }

  ctx.fillStyle = '#333'
  ctx.beginPath()
  ctx.arc(x + size * 0.5, y - size * 0.06, size * 0.04, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#5a6a7a'
  ctx.beginPath()
  ctx.moveTo(x - size * 0.1, y - size * 0.15)
  ctx.lineTo(x - size * 0.05, y - size * 0.35)
  ctx.lineTo(x + size * 0.05, y - size * 0.15)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
}

function drawBabyFish(ctx, x, y, size) {
  ctx.save()
  ctx.fillStyle = '#ffaa55'
  ctx.beginPath()
  ctx.ellipse(x, y, size * 0.35, size * 0.2, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(x - size * 0.32, y)
  ctx.lineTo(x - size * 0.5, y - size * 0.15)
  ctx.lineTo(x - size * 0.5, y + size * 0.15)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(x + size * 0.12, y - size * 0.04, size * 0.08, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#333'
  ctx.beginPath()
  ctx.arc(x + size * 0.14, y - size * 0.04, size * 0.04, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawSharkEatingFishScene(ctx, scene, width, height) {
  drawUnderwaterBackground(ctx, width, height)
  drawShark(ctx, width * 0.38, height * 0.45, 160, false)
  drawBabyFish(ctx, width * 0.62, height * 0.52, 70)

  ctx.save()
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
  ctx.font = '28px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('🫧', width * 0.55, height * 0.42)
  ctx.restore()
}

function drawFish(ctx, x, y, size) {
  ctx.save()
  ctx.fillStyle = '#ff8fab'
  ctx.beginPath()
  ctx.ellipse(x, y, size * 0.4, size * 0.25, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(x - size * 0.38, y)
  ctx.lineTo(x - size * 0.58, y - size * 0.2)
  ctx.lineTo(x - size * 0.58, y + size * 0.2)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(x + size * 0.15, y - size * 0.06, size * 0.1, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#333'
  ctx.beginPath()
  ctx.arc(x + size * 0.18, y - size * 0.06, size * 0.05, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawChild(ctx, x, y, size) {
  ctx.save()
  ctx.fillStyle = '#ffd1a9'
  ctx.beginPath()
  ctx.arc(x, y - size * 0.55, size * 0.18, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#6bcbff'
  ctx.fillRect(x - size * 0.2, y - size * 0.38, size * 0.4, size * 0.35)
  ctx.fillStyle = '#4a7fc8'
  ctx.fillRect(x - size * 0.18, y - size * 0.05, size * 0.14, size * 0.35)
  ctx.fillRect(x + size * 0.04, y - size * 0.05, size * 0.14, size * 0.35)
  ctx.fillStyle = '#333'
  ctx.beginPath()
  ctx.arc(x - size * 0.06, y - size * 0.58, size * 0.03, 0, Math.PI * 2)
  ctx.arc(x + size * 0.06, y - size * 0.58, size * 0.03, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(x, y - size * 0.5, size * 0.06, 0.1, Math.PI - 0.1)
  ctx.stroke()
  ctx.restore()
}

function drawCar(ctx, x, y, size) {
  ctx.save()
  ctx.fillStyle = '#ff6b9d'
  ctx.beginPath()
  ctx.roundRect(x - size * 0.45, y - size * 0.15, size * 0.9, size * 0.3, 8)
  ctx.fill()
  ctx.fillStyle = '#ff8fab'
  ctx.beginPath()
  ctx.roundRect(x - size * 0.2, y - size * 0.35, size * 0.45, size * 0.22, 6)
  ctx.fill()
  ctx.fillStyle = '#b8e4ff'
  ctx.fillRect(x - size * 0.12, y - size * 0.32, size * 0.18, size * 0.15)
  ctx.fillStyle = '#333'
  ctx.beginPath()
  ctx.arc(x - size * 0.22, y + size * 0.15, size * 0.12, 0, Math.PI * 2)
  ctx.arc(x + size * 0.22, y + size * 0.15, size * 0.12, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#ccc'
  ctx.beginPath()
  ctx.arc(x - size * 0.22, y + size * 0.15, size * 0.06, 0, Math.PI * 2)
  ctx.arc(x + size * 0.22, y + size * 0.15, size * 0.06, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawBall(ctx, x, y, size) {
  ctx.save()
  const grad = ctx.createRadialGradient(x - size * 0.15, y - size * 0.15, 0, x, y, size * 0.4)
  grad.addColorStop(0, '#ff8fab')
  grad.addColorStop(1, '#e8457a')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.arc(x, y, size * 0.35, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawWhale(ctx, x, y, size) {
  ctx.save()
  ctx.fillStyle = '#4a90d9'
  ctx.beginPath()
  ctx.ellipse(x, y, size * 0.55, size * 0.28, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(x - size * 0.52, y)
  ctx.quadraticCurveTo(x - size * 0.75, y - size * 0.15, x - size * 0.68, y + size * 0.05)
  ctx.quadraticCurveTo(x - size * 0.75, y + size * 0.15, x - size * 0.52, y)
  ctx.fill()
  ctx.fillStyle = '#6bcbff'
  ctx.beginPath()
  ctx.ellipse(x + size * 0.1, y - size * 0.08, size * 0.12, size * 0.06, -0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(x + size * 0.35, y - size * 0.08, size * 0.06, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#333'
  ctx.beginPath()
  ctx.arc(x + size * 0.37, y - size * 0.08, size * 0.03, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#4db8e8'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(x + size * 0.45, y)
  ctx.quadraticCurveTo(x + size * 0.6, y - size * 0.2, x + size * 0.55, y - size * 0.35)
  ctx.stroke()
  ctx.restore()
}

function drawAnt(ctx, x, y, size, facing = 1) {
  ctx.save()
  ctx.scale(facing, 1)
  const bodyColor = '#2d2d2d'
  const legColor = '#1a1a1a'

  ctx.fillStyle = bodyColor
  ctx.beginPath()
  ctx.ellipse(x, y, size * 0.22, size * 0.18, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(x + size * 0.18, y - size * 0.02, size * 0.14, size * 0.12, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(x + size * 0.32, y - size * 0.04, size * 0.1, size * 0.09, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = legColor
  ctx.lineWidth = Math.max(1.5, size * 0.04)
  ctx.lineCap = 'round'
  ;[
    [x - size * 0.05, y, x - size * 0.18, y + size * 0.15],
    [x + size * 0.05, y, x - size * 0.02, y + size * 0.18],
    [x + size * 0.15, y, x + size * 0.1, y + size * 0.16],
    [x + size * 0.25, y - size * 0.02, x + size * 0.22, y + size * 0.14],
    [x + size * 0.32, y - size * 0.04, x + size * 0.35, y + size * 0.12],
    [x + size * 0.38, y - size * 0.04, x + size * 0.42, y + size * 0.1],
  ].forEach(([x1, y1, x2, y2]) => {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  })

  ctx.strokeStyle = bodyColor
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x + size * 0.38, y - size * 0.1)
  ctx.quadraticCurveTo(x + size * 0.48, y - size * 0.22, x + size * 0.42, y - size * 0.28)
  ctx.moveTo(x + size * 0.4, y - size * 0.08)
  ctx.quadraticCurveTo(x + size * 0.52, y - size * 0.15, x + size * 0.48, y - size * 0.2)
  ctx.stroke()

  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(x + size * 0.36, y - size * 0.06, size * 0.025, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawAntsInLine(ctx, count, width, height, startX, startY, spacing) {
  for (let i = 0; i < count; i++) {
    const x = startX + i * spacing
    const y = startY + Math.sin(i * 0.4) * 6
    drawAnt(ctx, x, y, 55, 1)

    if (i === 0) {
      ctx.save()
      ctx.fillStyle = '#6ab840'
      ctx.beginPath()
      ctx.ellipse(x + 30, y - 18, 14, 8, -0.3, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }
}

function drawPicnicBlanket(ctx, width, height) {
  const bx = width * 0.55
  const by = height * 0.68
  const bw = width * 0.38
  const bh = height * 0.14

  ctx.save()
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.roundRect(bx, by, bw, bh, 8)
  ctx.fill()

  ctx.fillStyle = '#ff6b6b'
  const cellW = bw / 6
  const cellH = bh / 4
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 6; col++) {
      if ((row + col) % 2 === 0) {
        ctx.fillRect(bx + col * cellW, by + row * cellH, cellW, cellH)
      }
    }
  }

  ctx.fillStyle = '#c68642'
  ctx.beginPath()
  ctx.moveTo(bx + bw * 0.75, by - 5)
  ctx.lineTo(bx + bw * 0.85, by - 50)
  ctx.lineTo(bx + bw * 0.95, by - 50)
  ctx.lineTo(bx + bw * 0.88, by - 5)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#8B5E3C'
  ctx.lineWidth = 3
  ctx.stroke()

  ctx.fillStyle = '#ffd166'
  ctx.beginPath()
  ctx.arc(bx + bw * 0.6, by + 10, 12, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#ff8fab'
  ctx.beginPath()
  ctx.arc(bx + bw * 0.7, by + 18, 10, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function drawAntsLinePicnicScene(ctx, scene, width, height) {
  drawSky(ctx, scene.weather ?? 'sunny', width, height)
  drawGround(ctx, 'park', scene.weather ?? 'sunny', width, height)

  drawTree(ctx, width * 0.12, height * 0.55, 90)
  drawTree(ctx, width * 0.88, height * 0.52, 100)
  drawSun(ctx, width * 0.82, height * 0.12, 40)
  drawCloud(ctx, width * 0.25, height * 0.14, 0.8)

  drawPicnicBlanket(ctx, width, height)

  const count = scene.count ?? 8
  drawAntsInLine(ctx, count, width, height, width * 0.08, height * 0.58, width * 0.055)
}

function drawDinosaur(ctx, x, y, size) {
  ctx.save()
  ctx.fillStyle = '#6ab840'
  ctx.beginPath()
  ctx.ellipse(x, y, size * 0.45, size * 0.3, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(x + size * 0.35, y - size * 0.22, size * 0.25, 0, Math.PI * 2)
  ctx.fill()
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(x - size * 0.25 + i * size * 0.18, y + size * 0.15, size * 0.08, size * 0.22)
  }
  ctx.fillStyle = '#ff6b9d'
  ctx.beginPath()
  ctx.moveTo(x + size * 0.1, y - size * 0.35)
  for (let i = 0; i < 5; i++) {
    ctx.lineTo(x + size * 0.05 + i * size * 0.06, y - size * (0.45 + (i % 2) * 0.06))
  }
  ctx.lineTo(x + size * 0.35, y - size * 0.35)
  ctx.fill()
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(x + size * 0.42, y - size * 0.25, size * 0.07, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#333'
  ctx.beginPath()
  ctx.arc(x + size * 0.44, y - size * 0.25, size * 0.035, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawRainbow(ctx, x, y, size) {
  ctx.save()
  const colors = ['#ff6b6b', '#ffd166', '#ffe066', '#6ab840', '#6bcbff', '#b388ff']
  colors.forEach((color, i) => {
    ctx.strokeStyle = color
    ctx.lineWidth = size * 0.08
    ctx.beginPath()
    ctx.arc(x, y + size * 0.3, size * 0.5 - i * size * 0.07, Math.PI, 0)
    ctx.stroke()
  })
  ctx.restore()
}

function drawSnowman(ctx, x, y, size) {
  ctx.save()
  ctx.fillStyle = '#fff'
  ;[0.28, 0.18, 0.12].forEach((r, i) => {
    ctx.beginPath()
    ctx.arc(x, y - size * (0.1 + i * 0.22), size * r, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.fillStyle = '#333'
  ctx.beginPath()
  ctx.arc(x - size * 0.05, y - size * 0.48, size * 0.025, 0, Math.PI * 2)
  ctx.arc(x + size * 0.05, y - size * 0.48, size * 0.025, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#ff8fab'
  ctx.beginPath()
  ctx.moveTo(x, y - size * 0.42)
  ctx.lineTo(x + size * 0.12, y - size * 0.4)
  ctx.lineTo(x, y - size * 0.38)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#333'
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.arc(x, y - size * (0.18 + i * 0.08), size * 0.02, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function drawCake(ctx, x, y, size) {
  ctx.save()
  ctx.fillStyle = '#ffe8cc'
  ctx.fillRect(x - size * 0.3, y - size * 0.15, size * 0.6, size * 0.25)
  ctx.fillStyle = '#ff8fab'
  ctx.fillRect(x - size * 0.3, y - size * 0.22, size * 0.6, size * 0.1)
  ctx.fillStyle = '#ffd166'
  ctx.beginPath()
  ctx.moveTo(x - size * 0.05, y - size * 0.22)
  ctx.lineTo(x, y - size * 0.42)
  ctx.lineTo(x + size * 0.05, y - size * 0.22)
  ctx.fill()
  ctx.fillStyle = '#ff6b6b'
  ctx.beginPath()
  ctx.arc(x, y - size * 0.44, size * 0.05, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawBread(ctx, x, y, size) {
  ctx.save()
  ctx.fillStyle = '#d4a574'
  ctx.strokeStyle = '#8d6e63'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.roundRect(x - size * 0.32, y - size * 0.18, size * 0.64, size * 0.36, 14)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#a1887f'
  ctx.beginPath()
  ctx.moveTo(x - size * 0.28, y - size * 0.14)
  ctx.quadraticCurveTo(x, y - size * 0.28, x + size * 0.28, y - size * 0.14)
  ctx.stroke()
  ctx.fillStyle = '#5d4037'
  ctx.font = `bold ${Math.max(12, size * 0.1)}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('빵', x, y + size * 0.06)
  ctx.restore()
}

function drawWatermelon(ctx, x, y, size) {
  ctx.save()
  ctx.fillStyle = '#2e7d32'
  ctx.beginPath()
  ctx.arc(x, y, size * 0.38, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#1b5e20'
  ctx.lineWidth = 2
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath()
    ctx.moveTo(x - size * 0.35, y + i * size * 0.12)
    ctx.lineTo(x + size * 0.35, y + i * size * 0.12)
    ctx.stroke()
  }
  ctx.fillStyle = '#ff5252'
  ctx.beginPath()
  ctx.arc(x + size * 0.08, y, size * 0.28, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#222'
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2
    ctx.beginPath()
    ctx.arc(
      x + size * 0.08 + Math.cos(angle) * size * 0.12,
      y + Math.sin(angle) * size * 0.12,
      size * 0.025,
      0,
      Math.PI * 2
    )
    ctx.fill()
  }
  ctx.restore()
}

function drawCottonCandy(ctx, x, y, size) {
  ctx.save()
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = size * 0.04
  ctx.beginPath()
  ctx.moveTo(x, y + size * 0.35)
  ctx.lineTo(x, y + size * 0.05)
  ctx.stroke()
  const colors = ['#ffb3d9', '#ffcce6', '#ff99cc']
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = colors[i % colors.length]
    ctx.globalAlpha = 0.85
    ctx.beginPath()
    ctx.arc(
      x + (i - 2) * size * 0.08,
      y - size * (0.05 + (i % 3) * 0.08),
      size * (0.18 - (i % 2) * 0.03),
      0,
      Math.PI * 2
    )
    ctx.fill()
  }
  ctx.globalAlpha = 1
  ctx.restore()
}

function drawTurtle(ctx, x, y, size) {
  ctx.save()
  ctx.fillStyle = '#558B2F'
  ctx.beginPath()
  ctx.ellipse(x, y, size * 0.42, size * 0.32, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#33691E'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(x, y, size * 0.28, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = '#689F38'
  ctx.beginPath()
  ctx.ellipse(x + size * 0.38, y + size * 0.05, size * 0.14, size * 0.1, 0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#1B5E20'
  ctx.beginPath()
  ctx.arc(x + size * 0.48, y + size * 0.02, size * 0.04, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawSpider(ctx, x, y, size) {
  ctx.save()
  ctx.translate(x, y)
  ctx.fillStyle = '#2d2d2d'
  ctx.beginPath()
  ctx.arc(0, 0, size * 0.18, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#555'
  ctx.lineWidth = 2
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(Math.cos(angle) * size * 0.45, Math.sin(angle) * size * 0.45)
    ctx.stroke()
  }
  ctx.strokeStyle = 'rgba(200,200,200,0.6)'
  ctx.lineWidth = 1
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath()
    ctx.moveTo(-size * 0.5, i * size * 0.12)
    ctx.lineTo(size * 0.5, i * size * 0.12)
    ctx.stroke()
  }
  ctx.restore()
}

const FRUIT_COLORS = {
  apple: '#e53935', banana: '#fdd835', orange: '#fb8c00', grape: '#8e24aa',
  strawberry: '#e91e63', peach: '#ffab91', cherry: '#c62828', pear: '#aed581',
  pineapple: '#ffc107', melon: '#81c784', tangerine: '#ff9800', lemon: '#ffeb3b',
  blueberry: '#3949ab', chestnut: '#795548',
}

function drawColoredCircle(ctx, x, y, size, color, withStem = false) {
  ctx.save()
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(x, y, size * 0.32, 0, Math.PI * 2)
  ctx.fill()
  if (withStem) {
    ctx.strokeStyle = '#558B2F'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(x, y - size * 0.32)
    ctx.lineTo(x + size * 0.08, y - size * 0.5)
    ctx.stroke()
  }
  ctx.restore()
}

function drawGenericObject(ctx, x, y, size, color = '#90caf9') {
  ctx.save()
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.roundRect(x - size * 0.28, y - size * 0.22, size * 0.56, size * 0.44, 8)
  ctx.fill()
  ctx.restore()
}

function drawToothpaste(ctx, x, y, size) {
  ctx.save()
  // 튜브 본체
  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = '#1565c0'
  ctx.lineWidth = Math.max(3, size * 0.025)
  ctx.beginPath()
  ctx.roundRect(x - size * 0.14, y - size * 0.34, size * 0.28, size * 0.58, 10)
  ctx.fill()
  ctx.stroke()
  // 컬러 라벨
  ctx.fillStyle = '#42a5f5'
  ctx.fillRect(x - size * 0.11, y - size * 0.22, size * 0.22, size * 0.32)
  // 글자
  ctx.fillStyle = '#fff'
  ctx.font = `bold ${Math.max(14, size * 0.11)}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('치약', x, y - size * 0.06)
  // 뚜껑
  ctx.fillStyle = '#1565c0'
  ctx.beginPath()
  ctx.roundRect(x - size * 0.1, y - size * 0.42, size * 0.2, size * 0.1, 4)
  ctx.fill()
  // 튜브 입구
  ctx.fillStyle = '#e3f2fd'
  ctx.beginPath()
  ctx.moveTo(x - size * 0.05, y + size * 0.22)
  ctx.lineTo(x, y + size * 0.34)
  ctx.lineTo(x + size * 0.05, y + size * 0.22)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#1565c0'
  ctx.stroke()
  ctx.restore()
}

function drawToothbrush(ctx, x, y, size) {
  ctx.save()
  ctx.strokeStyle = '#42a5f5'
  ctx.lineWidth = Math.max(3, size * 0.04)
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x - size * 0.15, y + size * 0.2)
  ctx.lineTo(x + size * 0.1, y - size * 0.25)
  ctx.stroke()
  ctx.fillStyle = '#fff'
  ctx.strokeStyle = '#90caf9'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(x + size * 0.04, y - size * 0.32, size * 0.12, size * 0.14, 3)
  ctx.fill()
  ctx.stroke()
  ctx.restore()
}

function drawTrain(ctx, x, y, size) {
  ctx.save()
  ctx.fillStyle = '#ef5350'
  ctx.fillRect(x - size * 0.35, y - size * 0.15, size * 0.7, size * 0.3)
  ctx.fillStyle = '#333'
  ctx.beginPath()
  ctx.arc(x - size * 0.2, y + size * 0.18, size * 0.1, 0, Math.PI * 2)
  ctx.arc(x + size * 0.2, y + size * 0.18, size * 0.1, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawAirplane(ctx, x, y, size) {
  ctx.save()
  ctx.fillStyle = '#42a5f5'
  ctx.beginPath()
  ctx.ellipse(x, y, size * 0.35, size * 0.1, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(x, y - size * 0.25)
  ctx.lineTo(x + size * 0.05, y)
  ctx.lineTo(x, y + size * 0.08)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawBicycle(ctx, x, y, size) {
  ctx.save()
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(x - size * 0.18, y + size * 0.1, size * 0.14, 0, Math.PI * 2)
  ctx.arc(x + size * 0.18, y + size * 0.1, size * 0.14, 0, Math.PI * 2)
  ctx.moveTo(x - size * 0.18, y + size * 0.1)
  ctx.lineTo(x, y - size * 0.05)
  ctx.lineTo(x + size * 0.18, y + size * 0.1)
  ctx.stroke()
  ctx.restore()
}

function drawPiano(ctx, x, y, size) {
  ctx.save()
  ctx.fillStyle = '#1a1a1a'
  ctx.beginPath()
  ctx.roundRect(x - size * 0.42, y - size * 0.1, size * 0.84, size * 0.38, 6)
  ctx.fill()
  ctx.fillStyle = '#fff'
  for (let i = 0; i < 8; i++) {
    ctx.fillRect(x - size * 0.36 + i * size * 0.08, y - size * 0.08, size * 0.045, size * 0.24)
  }
  ctx.fillStyle = '#111'
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(x - size * 0.33 + i * size * 0.08 + size * 0.055, y - size * 0.08, size * 0.028, size * 0.15)
  }
  ctx.fillStyle = '#333'
  ctx.fillRect(x - size * 0.42, y + size * 0.18, size * 0.84, size * 0.1)
  ctx.restore()
}

function drawGuitar(ctx, x, y, size) {
  ctx.save()
  ctx.fillStyle = '#d4a574'
  ctx.beginPath()
  ctx.ellipse(x, y + size * 0.05, size * 0.22, size * 0.28, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillRect(x - size * 0.04, y - size * 0.35, size * 0.08, size * 0.35)
  ctx.fillStyle = '#333'
  ctx.fillRect(x - size * 0.06, y - size * 0.38, size * 0.12, size * 0.08)
  ctx.restore()
}

function drawDrum(ctx, x, y, size) {
  ctx.save()
  ctx.fillStyle = '#c62828'
  ctx.beginPath()
  ctx.ellipse(x, y, size * 0.28, size * 0.12, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#8d6e63'
  ctx.fillRect(x - size * 0.28, y, size * 0.56, size * 0.22)
  ctx.beginPath()
  ctx.ellipse(x, y + size * 0.22, size * 0.28, size * 0.12, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawShoe(ctx, x, y, size) {
  ctx.save()
  ctx.fillStyle = '#ff7043'
  ctx.beginPath()
  ctx.ellipse(x, y + size * 0.05, size * 0.3, size * 0.14, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillRect(x - size * 0.12, y - size * 0.12, size * 0.18, size * 0.16)
  ctx.restore()
}

function drawDollToy(ctx, x, y, size) {
  drawChild(ctx, x, y, size * 0.9)
}

const ENTITY_DRAWERS = {
  cat: drawCat,
  dog: drawDog,
  bird: drawBird,
  rabbit: drawRabbit,
  bear: drawDog,
  fish: drawFish,
  whale: drawWhale,
  shark: drawShark,
  baby_fish: drawBabyFish,
  ant: drawAnt,
  butterfly: drawButterfly,
  flower: drawFlower,
  tree: drawTree,
  toothbrush: drawToothbrush,
  toothpaste: drawToothpaste,
  soap: (ctx, x, y, s) => drawGenericObject(ctx, x, y, s, '#e1f5fe'),
  house: drawHouse,
  car: drawCar,
  ball: drawBall,
  child: drawChild,
  family: drawChild,
  book: drawFlower,
  dinosaur: drawDinosaur,
  princess: drawChild,
  robot: drawCar,
  cake: drawCake,
  watermelon: drawWatermelon,
  cotton_candy: drawCottonCandy,
  rainbow: drawRainbow,
  dragon: drawDinosaur,
  elephant: drawDog,
  lion: drawCat,
  penguin: drawBird,
  snowman: drawSnowman,
  turtle: drawTurtle,
  caterpillar: drawAnt,
  snail: drawAnt,
  tiger: drawCat,
  fox: drawDog,
  frog: drawAnt,
  duck: drawBird,
  bee: drawButterfly,
  spider: drawSpider,
  worm: drawAnt,
  octopus: drawFish,
  crab: drawFish,
  dragonfly: drawButterfly,
  ladybug: drawButterfly,
  monkey: drawDog,
  giraffe: drawDog,
  sheep: drawDog,
  goat: drawDog,
  deer: drawDog,
  chicken: drawBird,
  bus: drawCar,
  train: drawTrain,
  airplane: drawAirplane,
  bicycle: drawBicycle,
  boat: drawFish,
  rocket: drawCar,
  mushroom: drawGenericObject,
  cactus: drawTree,
  bamboo: drawTree,
  grass: drawFlower,
  leaf: drawLeaf,
  sunflower: drawFlower,
  rose: drawFlower,
  tulip: drawFlower,
  seed: drawGenericObject,
  apple: (ctx, x, y, s) => drawColoredCircle(ctx, x, y, s, FRUIT_COLORS.apple, true),
  banana: (ctx, x, y, s) => drawColoredCircle(ctx, x, y, s, FRUIT_COLORS.banana, false),
  orange: (ctx, x, y, s) => drawColoredCircle(ctx, x, y, s, FRUIT_COLORS.orange, true),
  grape: (ctx, x, y, s) => drawColoredCircle(ctx, x, y, s, FRUIT_COLORS.grape, true),
  strawberry: (ctx, x, y, s) => drawColoredCircle(ctx, x, y, s, FRUIT_COLORS.strawberry, true),
  peach: (ctx, x, y, s) => drawColoredCircle(ctx, x, y, s, FRUIT_COLORS.peach, true),
  cherry: (ctx, x, y, s) => drawColoredCircle(ctx, x, y, s, FRUIT_COLORS.cherry, true),
  pear: (ctx, x, y, s) => drawColoredCircle(ctx, x, y, s, FRUIT_COLORS.pear, true),
  pineapple: (ctx, x, y, s) => drawColoredCircle(ctx, x, y, s, FRUIT_COLORS.pineapple, true),
  melon: (ctx, x, y, s) => drawColoredCircle(ctx, x, y, s, FRUIT_COLORS.melon, true),
  tangerine: (ctx, x, y, s) => drawColoredCircle(ctx, x, y, s, FRUIT_COLORS.tangerine, true),
  lemon: (ctx, x, y, s) => drawColoredCircle(ctx, x, y, s, FRUIT_COLORS.lemon, true),
  blueberry: (ctx, x, y, s) => drawColoredCircle(ctx, x, y, s, FRUIT_COLORS.blueberry, true),
  chestnut: (ctx, x, y, s) => drawColoredCircle(ctx, x, y, s, FRUIT_COLORS.chestnut, false),
  carrot: (ctx, x, y, s) => drawColoredCircle(ctx, x, y, s, '#ff7043', true),
  tomato: (ctx, x, y, s) => drawColoredCircle(ctx, x, y, s, '#e53935', true),
  corn: (ctx, x, y, s) => drawColoredCircle(ctx, x, y, s, '#ffeb3b', false),
  pumpkin: (ctx, x, y, s) => drawColoredCircle(ctx, x, y, s, '#ff9800', true),
  potato: (ctx, x, y, s) => drawColoredCircle(ctx, x, y, s, '#a1887f', false),
  cabbage: (ctx, x, y, s) => drawColoredCircle(ctx, x, y, s, '#81c784', false),
  cucumber: (ctx, x, y, s) => drawColoredCircle(ctx, x, y, s, '#66bb6a', true),
  broccoli: (ctx, x, y, s) => drawColoredCircle(ctx, x, y, s, '#388e3c', false),
  onion: (ctx, x, y, s) => drawColoredCircle(ctx, x, y, s, '#ffe0b2', false),
  cookie: drawCake,
  bread: drawBread,
  candy: drawCottonCandy,
  chocolate: drawGenericObject,
  ice_cream: drawCake,
  pizza: drawGenericObject,
  hamburger: drawGenericObject,
  ramen: drawGenericObject,
  rice: drawGenericObject,
  soup: drawGenericObject,
  milk: drawGenericObject,
  juice: drawGenericObject,
  toy: drawDollToy,
  doll: drawDollToy,
  block: (ctx, x, y, s) => drawGenericObject(ctx, x, y, s, '#ffca28'),
  umbrella: drawGenericObject,
  bag: drawGenericObject,
  pencil: drawGenericObject,
  crayon: drawGenericObject,
  eraser: drawGenericObject,
  scissors: drawGenericObject,
  cup: drawGenericObject,
  bowl: drawGenericObject,
  spoon: drawGenericObject,
  chair: drawGenericObject,
  table: drawGenericObject,
  bed: drawGenericObject,
  clock: drawGenericObject,
  phone: drawGenericObject,
  camera: drawGenericObject,
  gift: drawGenericObject,
  box: drawGenericObject,
  key: drawGenericObject,
  lamp: drawGenericObject,
  slide: drawSlide,
  swing: drawGenericObject,
  rock: drawGenericObject,
  jellyfish: drawFish,
  starfish: drawFish,
  seahorse: drawFish,
  shrimp: drawFish,
  seal: drawFish,
  mouse: drawRabbit,
  hamster: drawRabbit,
  squirrel: drawRabbit,
  wolf: drawDog,
  raccoon: drawDog,
  leopard: drawCat,
  koala: drawDog,
  kangaroo: drawDog,
  camel: drawDog,
  donkey: drawDog,
  goose: drawBird,
  turkey: drawBird,
  owl: drawBird,
  eagle: drawBird,
  swan: drawBird,
  flamingo: drawBird,
  snake: drawAnt,
  lizard: drawAnt,
  crocodile: drawFish,
  beetle: drawButterfly,
  grasshopper: drawButterfly,
  mosquito: drawButterfly,
  bat: drawBird,
  hippo: drawDog,
  zebra: drawDog,
  piano: drawPiano,
  guitar: drawGuitar,
  violin: drawGuitar,
  cello: drawGuitar,
  drum: drawDrum,
  flute: drawGenericObject,
  trumpet: drawGenericObject,
  harp: drawGuitar,
  xylophone: drawGenericObject,
  harmonica: drawGenericObject,
  accordion: drawGenericObject,
  ukulele: drawGuitar,
  microphone: drawGenericObject,
  instrument: drawPiano,
  necklace: drawGenericObject,
  ring: drawGenericObject,
  bracelet: drawGenericObject,
  watch: drawGenericObject,
  glasses: drawGenericObject,
  hairpin: drawGenericObject,
  crown: drawGenericObject,
  belt: drawGenericObject,
  wallet: drawGenericObject,
  accessory: drawGenericObject,
  clothes: drawGenericObject,
  dress: drawGenericObject,
  shirt: drawGenericObject,
  pants: drawGenericObject,
  skirt: drawGenericObject,
  coat: drawGenericObject,
  socks: drawGenericObject,
  gloves: drawGenericObject,
  scarf: drawGenericObject,
  pajamas: drawGenericObject,
  uniform: drawGenericObject,
  apron: drawGenericObject,
  hat: drawGenericObject,
  shoe: drawShoe,
  rain_boots: drawShoe,
  teddy_bear: drawDollToy,
  action_figure: drawDollToy,
  puzzle: (ctx, x, y, s) => drawGenericObject(ctx, x, y, s, '#ffca28'),
  yo_yo: drawBall,
  spinning_top: drawBall,
  toy_car: drawCar,
  toy_train: drawTrain,
  stuffed_animal: drawDollToy,
  balloon: drawBall,
  sandbox_toy: drawGenericObject,
}

function getEntityDrawer(type) {
  if (ENTITY_DRAWERS[type]) return ENTITY_DRAWERS[type]
  const category = NOUN_CATEGORIES[type]
  if (category === 'toy') return drawDollToy
  if (category === 'instrument') return drawPiano
  if (category === 'accessory') return (ctx, x, y, s) => drawGenericObject(ctx, x, y, s, '#ffd54f')
  if (category === 'clothing') return (ctx, x, y, s) => drawGenericObject(ctx, x, y, s, '#7986cb')
  if (category === 'fruit') return (ctx, x, y, s) => drawColoredCircle(ctx, x, y, s, '#ef5350', true)
  if (category === 'vegetable') return (ctx, x, y, s) => drawColoredCircle(ctx, x, y, s, '#66bb6a', true)
  if (category === 'food') return (ctx, x, y, s) => drawGenericObject(ctx, x, y, s, '#ffb74d')
  if (category === 'plant') return drawFlower
  if (category === 'vehicle') return drawCar
  if (category === 'object') return (ctx, x, y, s) => drawGenericObject(ctx, x, y, s, '#bdbdbd')
  if (category === 'animal') return drawDog
  if (category === 'nature') return (ctx, x, y, s) => drawGenericObject(ctx, x, y, s, '#81d4fa')
  if (category === 'place') return (ctx, x, y, s) => drawGenericObject(ctx, x, y, s, '#a5d6a7')
  return (ctx, x, y, s) => drawGenericObject(ctx, x, y, s)
}

function getMainEntityPosition(entity, setting, width, height) {
  if (entity === 'spider') {
    return { x: width * 0.72, y: height * 0.28, size: 120 }
  }
  if (['toothpaste', 'toothbrush', 'soap'].includes(entity)) {
    return { x: width * 0.5, y: height * 0.56, size: 220 }
  }
  const isSeaCreature = ['whale', 'fish'].includes(entity) || setting === 'sea'
  return {
    x: width * 0.5,
    y: height * (isSeaCreature ? 0.52 : 0.62),
    size: isSeaCreature ? 180 : 150,
  }
}

function drawBathroomHygieneScene(ctx, scene, width, height) {
  ctx.fillStyle = '#eceff1'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#b0bec5'
  ctx.fillRect(width * 0.18, height * 0.1, width * 0.64, height * 0.32)
  ctx.strokeStyle = '#78909c'
  ctx.lineWidth = 4
  ctx.strokeRect(width * 0.18, height * 0.1, width * 0.64, height * 0.32)

  ctx.fillStyle = '#cfd8dc'
  ctx.fillRect(0, height * 0.46, width, height * 0.54)
  ctx.strokeStyle = '#90a4ae'
  ctx.beginPath()
  ctx.moveTo(0, height * 0.46)
  ctx.lineTo(width, height * 0.46)
  ctx.stroke()

  const types = scene.characters?.map((c) => c.type) ?? scene.entities ?? []
  const hasToothpaste = types.includes('toothpaste')
  const hasToothbrush = types.includes('toothbrush')
  const hasSoap = types.includes('soap')

  if (hasToothbrush && hasToothpaste) {
    drawToothbrush(ctx, width * 0.32, height * 0.6, 170)
    drawToothpaste(ctx, width * 0.68, height * 0.58, 200)
  } else if (hasToothpaste) {
    drawToothpaste(ctx, width * 0.5, height * 0.58, 240)
  } else if (hasToothbrush) {
    drawToothbrush(ctx, width * 0.5, height * 0.58, 200)
  }
  if (hasSoap) {
    drawGenericObject(ctx, width * 0.78, height * 0.62, 100, '#e1f5fe')
    ctx.fillStyle = '#455a64'
    ctx.font = 'bold 18px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('비누', width * 0.78, height * 0.62 + 6)
  }

  ctx.fillStyle = '#546e7a'
  ctx.font = 'bold 26px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('욕실', width * 0.5, height * 0.93)
}

function getSecondaryPositions(count, width, height) {
  const groundY = height * 0.76
  return Array.from({ length: count }, (_, i) => ({
    x: width * (0.22 + i * (0.56 / Math.max(count - 1, 1))),
    y: groundY,
    size: 75,
  }))
}

async function drawPhotosInScene(ctx, photoSrcs, scene, width, height) {
  if (photoSrcs.length === 0) return

  const images = await Promise.all(photoSrcs.slice(0, 3).map(loadImage))
  const groundY = height * 0.58
  const layouts = {
    1: [{ x: width * 0.5, y: groundY + 30, w: 280, h: 220 }],
    2: [
      { x: width * 0.32, y: groundY + 20, w: 200, h: 170 },
      { x: width * 0.68, y: groundY + 20, w: 200, h: 170 },
    ],
    3: [
      { x: width * 0.25, y: groundY + 10, w: 160, h: 140 },
      { x: width * 0.5, y: groundY + 20, w: 180, h: 150 },
      { x: width * 0.75, y: groundY + 10, w: 160, h: 140 },
    ],
  }

  const layout = layouts[Math.min(images.length, 3)] ?? layouts[1]

  images.forEach((img, i) => {
    const slot = layout[i]
    const sx = slot.x - slot.w / 2
    const sy = slot.y - slot.h / 2

    ctx.save()
    ctx.shadowColor = 'rgba(0,0,0,0.2)'
    ctx.shadowBlur = 16
    ctx.shadowOffsetY = 6

    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.roundRect(sx - 8, sy - 8, slot.w + 16, slot.h + 24, 12)
    ctx.fill()

    ctx.shadowColor = 'transparent'
    ctx.beginPath()
    ctx.roundRect(sx, sy, slot.w, slot.h, 10)
    ctx.clip()

    const scale = Math.max(slot.w / img.width, slot.h / img.height)
    const dw = img.width * scale
    const dh = img.height * scale
    ctx.drawImage(img, sx + (slot.w - dw) / 2, sy + (slot.h - dh) / 2, dw, dh)
    ctx.restore()

    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.roundRect(sx, sy, slot.w, slot.h, 10)
    ctx.stroke()
  })
}

function drawEntityFacing(ctx, type, x, y, size, facingRight) {
  const drawer = getEntityDrawer(type)
  if (!drawer) return
  ctx.save()
  if (!facingRight) {
    ctx.translate(x, 0)
    ctx.scale(-1, 1)
    ctx.translate(-x, 0)
  }
  drawer(ctx, x, y, size)
  ctx.restore()
}

function drawFightEffects(ctx, x1, x2, y, intensity) {
  const midX = (x1 + x2) / 2
  ctx.save()

  ctx.strokeStyle = 'rgba(255, 200, 100, 0.5)'
  ctx.lineWidth = 3
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4
    ctx.beginPath()
    ctx.moveTo(midX, y - 10)
    ctx.lineTo(midX + Math.cos(angle) * 22, y - 10 + Math.sin(angle) * 22)
    ctx.stroke()
  }

  ctx.fillStyle = 'rgba(255, 220, 100, 0.9)'
  ctx.font = 'bold 32px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(intensity === 'verbal' ? '💬' : '✨', midX, y - 24)

  ctx.restore()
}

function drawExpressionOverlay(ctx, action, x, y, size) {
  if (!action || !['smiling', 'laughing', 'crying', 'surprised', 'angry', 'scared', 'singing'].includes(action)) {
    return
  }

  ctx.save()
  const fx = x
  const fy = y - size * 0.18
  const mouthR = size * 0.1
  const eyeOffset = size * 0.08

  ctx.lineWidth = Math.max(2, size * 0.025)
  ctx.strokeStyle = '#444'
  ctx.fillStyle = '#444'

  ctx.beginPath()
  ctx.arc(fx - eyeOffset, fy - mouthR * 0.5, size * 0.025, 0, Math.PI * 2)
  ctx.arc(fx + eyeOffset, fy - mouthR * 0.5, size * 0.025, 0, Math.PI * 2)
  ctx.fill()

  if (action === 'smiling') {
    ctx.beginPath()
    ctx.arc(fx, fy + mouthR * 0.2, mouthR, 0.15 * Math.PI, 0.85 * Math.PI)
    ctx.stroke()
  } else if (action === 'laughing' || action === 'singing') {
    ctx.fillStyle = '#e85d7a'
    ctx.beginPath()
    ctx.ellipse(fx, fy + mouthR * 0.3, mouthR * 0.55, mouthR * 0.45, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#444'
    ctx.stroke()
  } else if (action === 'crying') {
    ctx.fillStyle = '#7ecbff'
    ctx.beginPath()
    ctx.ellipse(fx - eyeOffset, fy + mouthR * 0.2, size * 0.02, size * 0.04, 0, 0, Math.PI * 2)
    ctx.ellipse(fx + eyeOffset, fy + mouthR * 0.2, size * 0.02, size * 0.04, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(fx, fy + mouthR * 0.5, mouthR * 0.7, 1.1 * Math.PI, 1.9 * Math.PI)
    ctx.stroke()
  } else if (action === 'surprised' || action === 'scared') {
    ctx.beginPath()
    ctx.arc(fx, fy + mouthR * 0.4, mouthR * 0.35, 0, Math.PI * 2)
    ctx.stroke()
  } else if (action === 'angry') {
    ctx.beginPath()
    ctx.moveTo(fx - mouthR, fy + mouthR * 0.8)
    ctx.lineTo(fx + mouthR, fy + mouthR * 0.8)
    ctx.stroke()
  }

  ctx.restore()
}

function drawCharactersFightingScene(ctx, scene, width, height) {
  const intensity = scene.conflictIntensity ?? 'physical'
  const chars = scene.characters?.slice(0, 2) ?? []
  const left = chars.find((c) => c.role === 'fighter') ?? chars[0] ?? { type: 'child' }
  const right = chars.find((c) => c.role === 'opponent') ?? chars[1] ?? { type: 'child' }

  if (scene.underwater || scene.setting === 'sea') {
    drawUnderwaterBackground(ctx, width, height)
  } else {
    drawSky(ctx, scene.weather ?? 'sunny', width, height)
    drawGround(ctx, scene.setting, scene.weather ?? 'sunny', width, height)
    drawBackgroundSetting(ctx, scene.setting, width, height)
    if (scene.weather === 'sunny' || !scene.weather) {
      drawSun(ctx, width * 0.82, height * 0.12, 40)
      drawCloud(ctx, width * 0.2, height * 0.15, 0.9)
    }
  }

  const leftX = width * 0.28
  const rightX = width * 0.72
  const groundY = scene.underwater ? height * 0.55 : height * 0.62
  const size = 140

  drawEntityFacing(ctx, left.type, leftX, groundY, size, true)
  drawEntityFacing(ctx, right.type, rightX, groundY, size, false)
  drawFightEffects(ctx, leftX, rightX, groundY - size * 0.3, intensity)

  if (scene.fightOutcome === 'someone_won') {
    ctx.fillStyle = 'rgba(255, 215, 0, 0.9)'
    ctx.font = 'bold 28px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('⭐', leftX, groundY - size * 0.7)
  }
}

function drawBackgroundSetting(ctx, setting, width, height) {
  if (setting === 'picnic') {
    drawPicnicBlanket(ctx, width, height)
    drawTree(ctx, width * 0.1, height * 0.55, 85)
    drawTree(ctx, width * 0.9, height * 0.52, 95)
  }
  if (setting === 'forest') {
    drawTree(ctx, width * 0.12, height * 0.58, 100)
    drawTree(ctx, width * 0.88, height * 0.55, 120)
  }
  if (setting === 'garden') {
    for (let i = 0; i < 5; i++) {
      drawFlower(ctx, width * (0.1 + i * 0.18), height * 0.68, 55)
    }
  }
  if (setting === 'house' || setting === 'school') {
    drawHouse(ctx, width * 0.78, height * 0.52, 130)
  }
  if (setting === 'city') {
    ctx.fillStyle = '#888'
    ctx.fillRect(width * 0.05, height * 0.35, 60, height * 0.27)
    ctx.fillRect(width * 0.18, height * 0.28, 50, height * 0.34)
    ctx.fillRect(width * 0.82, height * 0.32, 55, height * 0.3)
    ctx.fillStyle = '#b8e4ff'
    ;[0.07, 0.2, 0.84].forEach((fx) => {
      for (let row = 0; row < 3; row++) {
        ctx.fillRect(width * fx, height * (0.38 + row * 0.07), 14, 12)
      }
    })
  }
}

function drawSlide(ctx, x, y, size) {
  ctx.save()

  const platformW = size * 0.55
  const platformH = size * 0.1
  const platformX = x - size * 0.28
  const platformY = y - size * 0.42

  // 지지대
  ctx.fillStyle = '#616161'
  ctx.fillRect(x - size * 0.3, platformY + platformH, size * 0.08, size * 0.55)
  ctx.fillRect(x + size * 0.18, y + size * 0.05, size * 0.08, size * 0.38)

  // 미끄럼판 (밝은 주황·노랑)
  ctx.fillStyle = '#ff9800'
  ctx.beginPath()
  ctx.moveTo(platformX, platformY + platformH * 0.5)
  ctx.lineTo(x + size * 0.52, y + size * 0.42)
  ctx.lineTo(x + size * 0.38, y + size * 0.52)
  ctx.lineTo(platformX, platformY + platformH * 2.2)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#e65100'
  ctx.lineWidth = 4
  ctx.stroke()

  // 옆면 하이라이트
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.beginPath()
  ctx.moveTo(platformX + size * 0.04, platformY + platformH)
  ctx.lineTo(x + size * 0.38, y + size * 0.38)
  ctx.lineTo(x + size * 0.32, y + size * 0.44)
  ctx.lineTo(platformX + size * 0.04, platformY + platformH * 1.8)
  ctx.closePath()
  ctx.fill()

  // 꼭대기 발판
  ctx.fillStyle = '#ffeb3b'
  ctx.fillRect(platformX, platformY, platformW, platformH)
  ctx.strokeStyle = '#f57f17'
  ctx.lineWidth = 3
  ctx.strokeRect(platformX, platformY, platformW, platformH)

  // 사다리
  ctx.strokeStyle = '#424242'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.moveTo(platformX - size * 0.06, y + size * 0.48)
  ctx.lineTo(platformX - size * 0.06, platformY)
  ctx.moveTo(platformX + size * 0.02, y + size * 0.48)
  ctx.lineTo(platformX + size * 0.02, platformY)
  ctx.stroke()
  ctx.lineWidth = 3
  for (let i = 0; i < 5; i++) {
    const ly = platformY + platformH + i * size * 0.09
    ctx.beginPath()
    ctx.moveTo(platformX - size * 0.06, ly)
    ctx.lineTo(platformX + size * 0.02, ly)
    ctx.stroke()
  }

  // 난간
  ctx.strokeStyle = '#1565c0'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(platformX, platformY)
  ctx.lineTo(x + size * 0.48, y + size * 0.08)
  ctx.stroke()

  // 라벨
  ctx.fillStyle = '#d84315'
  ctx.font = `bold ${Math.max(14, size * 0.09)}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('미끄럼틀', x + size * 0.12, y + size * 0.62)

  ctx.restore()
}

function drawAnimalsOnPlaygroundScene(ctx, scene, width, height) {
  drawSky(ctx, scene.weather ?? 'sunny', width, height)
  drawGround(ctx, 'park', scene.weather ?? 'sunny', width, height)
  drawSun(ctx, width * 0.82, height * 0.12, 42)
  drawTree(ctx, width * 0.08, height * 0.56, 80)
  drawTree(ctx, width * 0.92, height * 0.54, 90)

  const slideX = width * 0.52
  const slideY = height * 0.5
  const slideSize = Math.min(width, height) * 0.42

  // 미끄럼틀을 먼저 크게 그림
  drawSlide(ctx, slideX, slideY, slideSize)

  const players = scene.characters?.filter((c) => c.role === 'player') ?? []
  const playerPositions = {
    shark: { x: slideX - slideSize * 0.05, y: slideY - slideSize * 0.38, size: 95 },
    whale: { x: slideX + slideSize * 0.22, y: slideY + slideSize * 0.18, size: 110 },
    default: [
      { x: slideX - slideSize * 0.08, y: slideY - slideSize * 0.35, size: 100 },
      { x: slideX + slideSize * 0.2, y: slideY + slideSize * 0.15, size: 110 },
    ],
  }

  players.slice(0, 3).forEach((char, i) => {
    const pos = playerPositions[char.type] ?? playerPositions.default[i] ?? playerPositions.default[0]
    const drawer = getEntityDrawer(char.type)
    drawer(ctx, pos.x, pos.y, pos.size)
  })
}

function drawAnimalEatingFoodScene(ctx, scene, width, height) {
  const eater = scene.characters?.find((c) => c.role === 'eater' || c.role === 'predator') ?? scene.characters?.[0]
  const food = scene.characters?.find((c) => c.role === 'food') ?? scene.characters?.find((c) => isFoodEntity(c.type))
  if (!eater || !food) return false

  drawSky(ctx, scene.weather ?? 'sunny', width, height)
  drawGround(ctx, scene.setting ?? 'park', scene.weather ?? 'sunny', width, height)
  drawSun(ctx, width * 0.82, height * 0.12, 40)

  const eaterDrawer = getEntityDrawer(eater.type)
  const foodDrawer = getEntityDrawer(food.type)
  const eaterSize = eater.type === 'ant' ? 90 : 130
  const foodSize = 100

  eaterDrawer(ctx, width * 0.38, height * 0.62, eaterSize)
  foodDrawer(ctx, width * 0.62, height * 0.58, foodSize)
  return true
}

export async function drawStoryScene(ctx, scene, photoSrcs, width, height) {
  ensureCanvasCompat(ctx)
  const antChar = scene.characters?.find((c) => c.type === 'ant')
  const antCount = antChar?.count ?? scene.count ?? 8
  const hasAnt = antChar || scene.entities?.includes('ant')

  if (
    scene.scenarioId === 'animal_eating_food' ||
    (scene.action === 'eating' && scene.characters?.some((c) => c.role === 'food'))
  ) {
    if (drawAnimalEatingFoodScene(ctx, scene, width, height)) {
      if (photoSrcs.length > 0) await drawPhotosInScene(ctx, photoSrcs, scene, width, height)
      ctx.strokeStyle = '#ff6b9d'
      ctx.lineWidth = 6
      ctx.strokeRect(12, 12, width - 24, height - 24)
      return
    }
  }

  if (scene.scenarioId === 'animals_on_playground' || scene.characters?.some((c) => c.role === 'playground')) {
    drawAnimalsOnPlaygroundScene(ctx, scene, width, height)
    if (photoSrcs.length > 0) await drawPhotosInScene(ctx, photoSrcs, scene, width, height)
    ctx.strokeStyle = '#ff6b9d'
    ctx.lineWidth = 6
    ctx.strokeRect(12, 12, width - 24, height - 24)
    return
  }

  const hygieneTypes = new Set(['toothpaste', 'toothbrush'])
  const sceneTypes = scene.characters?.map((c) => c.type) ?? scene.entities ?? []
  if (
    scene.scenarioId === 'bathroom_hygiene' ||
    sceneTypes.some((t) => hygieneTypes.has(t))
  ) {
    drawBathroomHygieneScene(ctx, scene, width, height)
    if (photoSrcs.length > 0) await drawPhotosInScene(ctx, photoSrcs, scene, width, height)
    ctx.strokeStyle = '#ff6b9d'
    ctx.lineWidth = 6
    ctx.strokeRect(12, 12, width - 24, height - 24)
    return
  }

  const hasSlide =
    scene.entities?.includes('slide') ||
    scene.characters?.some((c) => c.type === 'slide')
  if (hasSlide) {
    drawAnimalsOnPlaygroundScene(ctx, scene, width, height)
    if (photoSrcs.length > 0) await drawPhotosInScene(ctx, photoSrcs, scene, width, height)
    ctx.strokeStyle = '#ff6b9d'
    ctx.lineWidth = 6
    ctx.strokeRect(12, 12, width - 24, height - 24)
    return
  }

  if (scene.scenarioId === 'shark_eating_fish') {
    drawSharkEatingFishScene(ctx, scene, width, height)
    if (photoSrcs.length > 0) await drawPhotosInScene(ctx, photoSrcs, scene, width, height)
    ctx.strokeStyle = '#ff6b9d'
    ctx.lineWidth = 6
    ctx.strokeRect(12, 12, width - 24, height - 24)
    return
  }

  if (
    scene.scenarioId === 'characters_fighting' ||
    (scene.action === 'fighting' && (scene.characters?.length >= 2 || scene.entities?.length >= 2))
  ) {
    drawCharactersFightingScene(ctx, scene, width, height)
    if (photoSrcs.length > 0) await drawPhotosInScene(ctx, photoSrcs, scene, width, height)
    ctx.strokeStyle = '#ff6b9d'
    ctx.lineWidth = 6
    ctx.strokeRect(12, 12, width - 24, height - 24)
    return
  }

  if (
    scene.scenarioId === 'ants_line' ||
    (hasAnt && scene.formation === 'line' && scene.scenarioId !== 'ants_line_picnic')
  ) {
    drawSky(ctx, scene.weather ?? 'sunny', width, height)
    drawGround(ctx, scene.setting ?? 'park', scene.weather ?? 'sunny', width, height)
    drawTree(ctx, width * 0.12, height * 0.55, 90)
    drawTree(ctx, width * 0.88, height * 0.52, 100)
    drawSun(ctx, width * 0.82, height * 0.12, 40)
    drawAntsInLine(ctx, antCount, width, height, width * 0.08, height * 0.58, width * 0.055)
    if (photoSrcs.length > 0) await drawPhotosInScene(ctx, photoSrcs, scene, width, height)
    ctx.strokeStyle = '#ff6b9d'
    ctx.lineWidth = 6
    ctx.strokeRect(12, 12, width - 24, height - 24)
    return
  }

  if (
    (scene.scenarioId === 'ants_group' || scene.scenarioId === 'ants_picnic') &&
    !scene.characters?.some((c) => c.type !== 'ant')
  ) {
    drawSky(ctx, scene.weather ?? 'sunny', width, height)
    drawGround(ctx, scene.setting ?? 'park', scene.weather ?? 'sunny', width, height)
    drawSun(ctx, width * 0.82, height * 0.12, 40)
    for (let i = 0; i < antCount; i++) {
      const x = width * (0.15 + (i % 5) * 0.14)
      const y = height * (0.55 + Math.floor(i / 5) * 0.08)
      drawAnt(ctx, x, y, 50, i % 2 === 0 ? 1 : -1)
    }
    if (photoSrcs.length > 0) await drawPhotosInScene(ctx, photoSrcs, scene, width, height)
    ctx.strokeStyle = '#ff6b9d'
    ctx.lineWidth = 6
    ctx.strokeRect(12, 12, width - 24, height - 24)
    return
  }

  if (scene.scenarioId === 'ants_picnic') {
    drawSky(ctx, scene.weather ?? 'sunny', width, height)
    drawGround(ctx, 'park', scene.weather ?? 'sunny', width, height)
    drawPicnicBlanket(ctx, width, height)
    for (let i = 0; i < antCount; i++) {
      const x = width * (0.12 + (i % 4) * 0.12)
      const y = height * (0.58 + Math.floor(i / 4) * 0.06)
      drawAnt(ctx, x, y, 48, 1)
    }
    if (photoSrcs.length > 0) await drawPhotosInScene(ctx, photoSrcs, scene, width, height)
    ctx.strokeStyle = '#ff6b9d'
    ctx.lineWidth = 6
    ctx.strokeRect(12, 12, width - 24, height - 24)
    return
  }

  if (
    scene.scenarioId === 'ants_line_picnic' ||
    (hasAnt && scene.formation === 'line' && scene.setting === 'picnic')
  ) {
    drawAntsLinePicnicScene(ctx, { ...scene, count: antCount }, width, height)
    if (photoSrcs.length > 0) await drawPhotosInScene(ctx, photoSrcs, scene, width, height)
    ctx.strokeStyle = '#ff6b9d'
    ctx.lineWidth = 6
    ctx.strokeRect(12, 12, width - 24, height - 24)
    return
  }

  const rand = createSeededRandom(scene.seed)

  if (scene.underwater || (scene.setting === 'sea' && scene.entities?.some((e) => ['shark', 'fish', 'baby_fish', 'whale'].includes(e)))) {
    drawUnderwaterBackground(ctx, width, height)
  } else {
    drawSky(ctx, scene.weather, width, height)
    drawGround(ctx, scene.setting, scene.weather, width, height)
    drawBackgroundSetting(ctx, scene.setting, width, height)
  }

  if (scene.weather === 'sunny' || scene.weather === 'sunset') {
    drawSun(ctx, width * 0.82, height * 0.12, scene.weather === 'sunset' ? 35 : 42)
  }
  if (scene.weather === 'night') {
    drawMoon(ctx, width * 0.78, height * 0.13, 30)
    drawStars(ctx, width, height, rand)
  }
  if (scene.weather === 'rain') {
    drawCloud(ctx, width * 0.3, height * 0.12, 1.2)
    drawCloud(ctx, width * 0.65, height * 0.08, 1)
    drawRain(ctx, width, height)
  }
  if (scene.weather === 'snow') {
    drawCloud(ctx, width * 0.4, height * 0.1, 1.1)
    drawSnow(ctx, width, height, rand)
  }
  if (scene.weather === 'cloudy' || scene.entities?.includes('cloud') || scene.scenarioId === 'cloud_sky') {
    drawCloud(ctx, width * 0.18, height * 0.18, 1.6)
    drawCloud(ctx, width * 0.48, height * 0.1, 1.9)
    drawCloud(ctx, width * 0.72, height * 0.2, 1.4)
    drawCloud(ctx, width * 0.35, height * 0.32, 1.2)
  } else if (scene.weather === 'sunny') {
    drawCloud(ctx, width * 0.2, height * 0.15, 0.9)
    drawCloud(ctx, width * 0.55, height * 0.1, 0.7)
  }

  if (scene.entities?.includes('rainbow')) {
    drawRainbow(ctx, width * 0.5, height * 0.18, 120)
  }

  const hasPhotos = photoSrcs.length > 0

  const antOnly = hasAnt && !scene.characters?.some((c) => c.type !== 'ant')

  if (antOnly && scene.formation === 'line') {
    drawAntsInLine(ctx, antCount, width, height, width * 0.1, height * 0.58, width * 0.06)
  } else if (antOnly) {
    for (let i = 0; i < antCount; i++) {
      const x = width * (0.2 + (i % 3) * 0.25)
      const y = height * (0.55 + Math.floor(i / 3) * 0.1)
      drawAnt(ctx, x, y, 50, i % 2 === 0 ? 1 : -1)
    }
  } else if (scene.characters?.length > 0) {
    const sceneAction = scene.action
    scene.characters.slice(0, 4).forEach((char, i) => {
      const drawer = getEntityDrawer(char.type)
      if (!drawer) return
      if (char.type === 'ant' && scene.formation === 'line') return

      const expressAction = char.action || sceneAction

      if (char.role === 'eater' && char.action === 'eating') {
        const size = char.type === 'ant' ? 90 : 130
        drawer(ctx, width * 0.38, height * 0.58, size)
        drawExpressionOverlay(ctx, expressAction, width * 0.38, height * 0.58, size)
        return
      }
      if (char.role === 'food') {
        drawer(ctx, width * 0.62, height * 0.55, 100)
        return
      }

      if (char.role === 'predator' && char.action === 'eating') {
        const size = char.type === 'shark' ? 160 : 130
        drawer(ctx, width * 0.38, height * 0.45, size, false)
        drawExpressionOverlay(ctx, expressAction, width * 0.38, height * 0.45, size)
        return
      }
      if (char.role === 'prey' && !isFoodEntity(char.type)) {
        const drawFn = char.type === 'baby_fish' ? drawBabyFish : drawer
        const size = char.type === 'baby_fish' ? 70 : 90
        drawFn(ctx, width * 0.62, height * 0.52, size)
        drawExpressionOverlay(ctx, expressAction, width * 0.62, height * 0.52, size)
        return
      }

      if (char.role === 'fighter' || char.role === 'opponent') {
        const isLeft = char.role === 'fighter'
        const cx = isLeft ? width * 0.28 : width * 0.72
        const cy = height * 0.62
        drawEntityFacing(ctx, char.type, cx, cy, 120, isLeft)
        drawExpressionOverlay(ctx, expressAction, cx, cy, 120)
        return
      }

      const isMain = i === 0
      const pos = isMain
        ? getMainEntityPosition(char.type, scene.setting, width, height)
        : getSecondaryPositions(scene.characters.length - 1, width, height)[i - 1] ??
          { x: width * 0.5, y: height * 0.7, size: 80 }
      const drawSize = isMain ? pos.size : pos.size * 0.7
      drawer(ctx, pos.x, pos.y, drawSize)
      drawExpressionOverlay(ctx, expressAction, pos.x, pos.y, drawSize)
    })
  } else {
    const entitiesToDraw = hasPhotos
      ? scene.entities.filter((e) => !['tree', 'house'].includes(e)).slice(0, 3)
      : scene.entities.slice(0, 4)

    if (entitiesToDraw.length > 0) {
      const mainEntity = entitiesToDraw[0]
      const mainPos = getMainEntityPosition(mainEntity, scene.setting, width, height)
      const mainDrawer = getEntityDrawer(mainEntity)
      if (mainDrawer) {
        mainDrawer(ctx, mainPos.x, mainPos.y, mainPos.size)
      }

      const secondary = entitiesToDraw.slice(1)
      const secondaryPositions = getSecondaryPositions(secondary.length, width, height)
      secondary.forEach((entity, i) => {
        const drawer = getEntityDrawer(entity)
        if (drawer && secondaryPositions[i]) {
          drawer(ctx, secondaryPositions[i].x, secondaryPositions[i].y, secondaryPositions[i].size)
        }
      })
    }
  }

  if (hasPhotos) {
    await drawPhotosInScene(ctx, photoSrcs, scene, width, height)
  }

  ctx.strokeStyle = '#ff6b9d'
  ctx.lineWidth = 6
  ctx.strokeRect(12, 12, width - 24, height - 24)
}
