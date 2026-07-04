import {

  useRef,

  useState,

  useCallback,

  useEffect,

  useImperativeHandle,

  forwardRef,

  useMemo,

} from 'react'

import {

  KID_COLORS,

  STAMP_ITEMS,

  SHAPE_ITEMS,

  TOOL_HINTS,

  drawStamp,

  drawKidDragShape,

  floodFillCanvas,

  rainbowColor,

} from '../utils/kidDrawUtils'

import {

  extractConnectedRegion,

  drawFloatingCrop,

  commitFloatingCrop,

} from '../utils/canvasMoveUtils'

import {

  PHOTO_SIZE_OPTIONS,

  computeStickerPlacement,

  resizeStickerAtCenter,

  clampStickerPosition,

  compositeFullScene,

  rotateSticker,

} from '../utils/photoEditor'



const BRUSH_SIZES = [

  { id: 'm', label: '보통', size: 16, dot: 14 },

  { id: 'l', label: '굵게', size: 28, dot: 20 },

  { id: 'xl', label: '아주 굵게', size: 42, dot: 28 },

]



const DRAW_TOOLS = [

  { id: 'pen', icon: '✏️', name: '펜' },

  { id: 'rainbow', icon: '🌈', name: '무지개' },

  { id: 'fill', icon: '🪣', name: '채우기' },

  { id: 'eraser', icon: '🧽', name: '지우개' },

]



const SHAPE_TOOLS = SHAPE_ITEMS



function loadImage(src) {

  return new Promise((resolve, reject) => {

    const img = new Image()

    img.onload = () => resolve(img)

    img.onerror = reject

    img.src = src

  })

}



function drawImageCover(ctx, img, w, h) {

  const scale = Math.max(w / img.width, h / img.height)

  const dw = img.width * scale

  const dh = img.height * scale

  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)

}



const KidDrawCanvas = forwardRef(function KidDrawCanvas(

  { photos = [], storyText = '', restoreBlob = null, onRestored, onDrawingChange },

  ref

) {

  const baseCanvasRef = useRef(null)

  const canvasRef = useRef(null)

  const containerRef = useRef(null)
  const stageRef = useRef(null)
  const panelRef = useRef(null)

  const toolsRef = useRef(null)

  const dprRef = useRef(1)

  const rainbowStepRef = useRef(0)



  const [tab, setTab] = useState('draw')

  const [drawTool, setDrawTool] = useState('pen')

  const [shapeTool, setShapeTool] = useState('circle')

  const [stampId, setStampId] = useState(STAMP_ITEMS[0].id)

  const [color, setColor] = useState(KID_COLORS[1].hex)

  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1].size)

  const [hasDrawing, setHasDrawing] = useState(false)

  const [canvasWidth, setCanvasWidth] = useState(560)
  const [canvasHeight, setCanvasHeight] = useState(320)

  const [showClearAsk, setShowClearAsk] = useState(false)

  const [toast, setToast] = useState('')

  const [photoSize, setPhotoSize] = useState('m')

  const [photoStickers, setPhotoStickers] = useState([])

  const [selectedStickerId, setSelectedStickerId] = useState(null)



  const drawingRef = useRef(false)

  const startRef = useRef({ x: 0, y: 0 })

  const snapshotRef = useRef(null)

  const historyRef = useRef([])

  const historyIndexRef = useRef(-1)

  const bgPhotoRef = useRef(null)

  const canvasReadyRef = useRef(false)

  const pendingEmbedRef = useRef(null)

  const embedOffsetRef = useRef(0)

  const dragStickerRef = useRef(null)
  const moveDragRef = useRef(null)
  const canvasSizeRef = useRef({ w: 0, h: 0 })



  const activeTool = tab === 'draw' ? drawTool : tab === 'shape' ? shapeTool : tab === 'photo' ? 'photo' : tab === 'move' ? 'move' : 'stamp'



  const hint = useMemo(() => {

    if (tab === 'stamp') return TOOL_HINTS.stamp

    if (tab === 'photo') return TOOL_HINTS.photo

    if (tab === 'move') return TOOL_HINTS.move

    return TOOL_HINTS[activeTool] ?? TOOL_HINTS.pen

  }, [tab, activeTool])



  const showToast = useCallback((msg) => {

    setToast(msg)

    window.setTimeout(() => setToast(''), 1800)

  }, [])



  const getCtx = useCallback(() => canvasRef.current?.getContext('2d', { willReadFrequently: true }), [])

  const getBaseCtx = useCallback(
    () => baseCanvasRef.current?.getContext('2d', { willReadFrequently: true }),
    []
  )



  const notifyChange = useCallback(

    (drawn) => {

      setHasDrawing(drawn)

      onDrawingChange?.(drawn)

    },

    [onDrawingChange]

  )



  const markDirty = useCallback(() => {

    notifyChange(true)

  }, [notifyChange])



  const pushHistory = useCallback(() => {

    const canvas = canvasRef.current

    const ctx = getCtx()

    if (!canvas || !ctx) return

    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height)

    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1)

    historyRef.current.push(snap)

    if (historyRef.current.length > 30) historyRef.current.shift()

    historyIndexRef.current = historyRef.current.length - 1

  }, [getCtx])



  const fillPaperBackground = useCallback((ctx, w, h) => {

    ctx.fillStyle = '#fffef8'

    ctx.fillRect(0, 0, w, h)

    ctx.strokeStyle = '#ffe0ec'

    ctx.lineWidth = 3

    ctx.setLineDash([10, 10])

    ctx.strokeRect(12, 12, w - 24, h - 24)

    ctx.setLineDash([])

  }, [])



  const redrawBase = useCallback(async () => {

    const ctx = getBaseCtx()

    if (!ctx) return

    fillPaperBackground(ctx, canvasWidth, canvasHeight)

    if (bgPhotoRef.current) {

      try {

        const img = await loadImage(bgPhotoRef.current)

        ctx.save()

        ctx.globalAlpha = 0.3

        drawImageCover(ctx, img, canvasWidth, canvasHeight)

        ctx.restore()

      } catch {

        // ignore

      }

    }

  }, [getBaseCtx, fillPaperBackground, canvasWidth, canvasHeight])

  const setupCanvasSurface = useCallback(async () => {
    const drawCanvas = canvasRef.current
    const drawCtx = getCtx()
    if (!drawCanvas || !drawCtx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    dprRef.current = dpr

    for (const canvas of [baseCanvasRef.current, drawCanvas]) {
      if (!canvas) continue
      canvas.width = canvasWidth * dpr
      canvas.height = canvasHeight * dpr
      canvas.style.width = `${canvasWidth}px`
      canvas.style.height = `${canvasHeight}px`
      canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    await redrawBase()
    drawCtx.clearRect(0, 0, canvasWidth, canvasHeight)
    historyRef.current = []
    pushHistory()
    historyIndexRef.current = 0
    notifyChange(false)
    canvasReadyRef.current = true
    canvasSizeRef.current = { w: canvasWidth, h: canvasHeight }
  }, [getCtx, redrawBase, pushHistory, notifyChange, canvasWidth, canvasHeight])

  const applyCanvasDimensions = useCallback(async () => {
    const drawCanvas = canvasRef.current
    const baseCanvas = baseCanvasRef.current
    const drawCtx = getCtx()
    if (!drawCanvas || !baseCanvas || !drawCtx) return

    const prev = canvasSizeRef.current
    const sizeChanged = prev.w !== canvasWidth || prev.h !== canvasHeight
    if (!sizeChanged && canvasReadyRef.current) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    dprRef.current = dpr

    const hadDrawing = historyIndexRef.current > 0
    let snapshot = null
    if (sizeChanged && hadDrawing && drawCanvas.width > 0 && prev.w > 0) {
      snapshot = drawCanvas.toDataURL('image/png')
    }

    for (const canvas of [baseCanvas, drawCanvas]) {
      canvas.width = canvasWidth * dpr
      canvas.height = canvasHeight * dpr
      canvas.style.width = `${canvasWidth}px`
      canvas.style.height = `${canvasHeight}px`
      canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    await redrawBase()

    if (snapshot) {
      try {
        const img = await loadImage(snapshot)
        drawCtx.drawImage(img, 0, 0, canvasWidth, canvasHeight)
        historyRef.current = []
        historyRef.current.push(drawCtx.getImageData(0, 0, drawCanvas.width, drawCanvas.height))
        historyIndexRef.current = 0
        notifyChange(true)
      } catch {
        drawCtx.clearRect(0, 0, canvasWidth, canvasHeight)
        historyRef.current = []
        pushHistory()
        historyIndexRef.current = 0
        notifyChange(false)
      }
    } else if (!canvasReadyRef.current || sizeChanged) {
      drawCtx.clearRect(0, 0, canvasWidth, canvasHeight)
      historyRef.current = []
      pushHistory()
      historyIndexRef.current = 0
      notifyChange(false)
    }

    canvasReadyRef.current = true
    canvasSizeRef.current = { w: canvasWidth, h: canvasHeight }
  }, [getCtx, redrawBase, pushHistory, notifyChange, canvasWidth, canvasHeight])

  const measureCanvas = useCallback(() => {
    const wrap = containerRef.current
    const panel = panelRef.current
    const tools = toolsRef.current
    if (!wrap || !panel) return

    const topBar = panel.querySelector('.kid-draw-top-bar')
    const topH = topBar?.offsetHeight ?? 0
    const toolsH = tools?.offsetHeight ?? 0
    const panelH = panel.clientHeight
    const availH = panelH - topH - toolsH - 6
    const availW = wrap.clientWidth

    const w = Math.floor(availW || 0)
    const h = Math.floor(Math.max(availH, wrap.clientHeight || 0))
    if (w < 120 || h < 80) return

    const cw = Math.max(240, w)
    const ch = Math.max(140, h)
    setCanvasWidth((prev) => (prev === cw ? prev : cw))
    setCanvasHeight((prev) => (prev === ch ? prev : ch))
  }, [])

  useEffect(() => {
    const wrap = containerRef.current
    const stage = stageRef.current
    const panel = panelRef.current
    if (!wrap) return

    const runMeasure = () => {
      measureCanvas()
      window.requestAnimationFrame(measureCanvas)
    }

    runMeasure()
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(runMeasure) : null
    observer?.observe(wrap)
    if (stage) observer?.observe(stage)
    if (panel) observer?.observe(panel)
    if (toolsRef.current) observer?.observe(toolsRef.current)

    window.addEventListener('orientationchange', runMeasure)
    window.addEventListener('resize', runMeasure)

    return () => {
      observer?.disconnect()
      window.removeEventListener('orientationchange', runMeasure)
      window.removeEventListener('resize', runMeasure)
    }
  }, [measureCanvas])

  useEffect(() => {
    measureCanvas()
    const t = window.requestAnimationFrame(measureCanvas)
    return () => window.cancelAnimationFrame(t)
  }, [selectedStickerId, photos.length, photoStickers.length, measureCanvas])

  useEffect(() => {
    if (!baseCanvasRef.current || !canvasRef.current) return
    applyCanvasDimensions()
  }, [canvasWidth, canvasHeight, applyCanvasDimensions])



  const getPoint = useCallback((e) => {

    const canvas = canvasRef.current

    const rect = canvas.getBoundingClientRect()

    return {

      x: e.clientX - rect.left,

      y: e.clientY - rect.top,

    }

  }, [])



  const pickStroke = useCallback(() => {

    if (drawTool === 'eraser') return { stroke: '#000', eraser: true }

    if (drawTool === 'rainbow') {

      rainbowStepRef.current += 1

      return { stroke: rainbowColor(rainbowStepRef.current), eraser: false }

    }

    return { stroke: color, eraser: false }

  }, [drawTool, color])



  const drawFreeSegment = useCallback(

    (from, to, stroke, eraser) => {

      const ctx = getCtx()

      if (!ctx) return

      ctx.lineCap = 'round'

      ctx.lineJoin = 'round'

      ctx.lineWidth = eraser ? brushSize * 2.2 : brushSize

      ctx.strokeStyle = stroke

      ctx.globalCompositeOperation = eraser ? 'destination-out' : 'source-over'

      ctx.beginPath()

      ctx.moveTo(from.x, from.y)

      ctx.lineTo(to.x, to.y)

      ctx.stroke()

      ctx.globalCompositeOperation = 'source-over'

    },

    [getCtx, brushSize]

  )



  const drawShapeFinal = useCallback(

    (start, end, tool, stroke) => {

      const ctx = getCtx()

      if (!ctx) return

      drawKidDragShape(ctx, start, end, tool, stroke, {

        filled: true,

        lineWidth: Math.max(3, brushSize * 0.35),

      })

    },

    [getCtx, brushSize]

  )



  const drawShapePreview = useCallback(

    (start, end, tool, stroke) => {

      const ctx = getCtx()

      if (!ctx || !snapshotRef.current) return

      ctx.putImageData(snapshotRef.current, 0, 0)

      drawShapeFinal(start, end, tool, stroke)

    },

    [getCtx, drawShapeFinal]

  )



  const placeStamp = useCallback(

    (pt) => {

      const ctx = getCtx()

      if (!ctx) return

      const stampSize = Math.max(52, brushSize * 2.4)

      drawStamp(ctx, stampId, pt.x, pt.y, stampSize, color)

      pushHistory()

      notifyChange(true)

      showToast(`${STAMP_ITEMS.find((s) => s.id === stampId)?.emoji ?? '⭐'} 붙였어요!`)

    },

    [getCtx, stampId, brushSize, color, pushHistory, notifyChange, showToast]

  )



  const doFill = useCallback(

    (pt) => {

      const ctx = getCtx()

      const canvas = canvasRef.current

      if (!ctx || !canvas) return

      const dpr = dprRef.current

      const ok = floodFillCanvas(

        ctx,

        pt.x * dpr,

        pt.y * dpr,

        color,

        canvas.width,

        canvas.height

      )

      if (ok) {

        pushHistory()

        notifyChange(true)

        showToast('🪣 색을 채웠어요!')

      }

    },

    [getCtx, color, pushHistory, notifyChange, showToast]

  )

  const handleMovePointerDown = useCallback(

    (e) => {

      if (tab !== 'move') return

      if (e.pointerType === 'touch' && e.isPrimary === false) return

      e.preventDefault()

      canvasRef.current?.setPointerCapture(e.pointerId)

      const pt = getPoint(e)

      const ctx = getCtx()

      const canvas = canvasRef.current

      if (!ctx || !canvas) return

      const dpr = dprRef.current

      const px = Math.floor(pt.x * dpr)

      const py = Math.floor(pt.y * dpr)

      const region = extractConnectedRegion(ctx, px, py, canvas.width, canvas.height)

      if (!region) {

        showToast('👆 옮길 그림을 눌러주세요!')

        return

      }

      moveDragRef.current = {

        pointerId: e.pointerId,

        cropCanvas: region.cropCanvas,

        grabOffsetX: region.grabPx / dpr,

        grabOffsetY: region.grabPy / dpr,

        x: pt.x - region.grabPx / dpr,

        y: pt.y - region.grabPy / dpr,

        baseSnapshot: ctx.getImageData(0, 0, canvas.width, canvas.height),

      }

    },

    [tab, getPoint, getCtx, showToast]

  )

  const handleMovePointerMove = useCallback(

    (e) => {

      const drag = moveDragRef.current

      if (!drag || tab !== 'move') return

      e.preventDefault()

      const pt = getPoint(e)

      const ctx = getCtx()

      if (!ctx) return

      drag.x = pt.x - drag.grabOffsetX

      drag.y = pt.y - drag.grabOffsetY

      ctx.putImageData(drag.baseSnapshot, 0, 0)

      drawFloatingCrop(ctx, drag.cropCanvas, drag.x, drag.y, dprRef.current)

    },

    [tab, getPoint, getCtx]

  )

  const finishMoveDrag = useCallback(

    (showMovedToast = true) => {

      const drag = moveDragRef.current

      if (!drag) return

      const ctx = getCtx()

      if (ctx) {

        ctx.putImageData(drag.baseSnapshot, 0, 0)

        commitFloatingCrop(ctx, drag.cropCanvas, drag.x, drag.y, dprRef.current)

        pushHistory()

        notifyChange(true)

      }

      moveDragRef.current = null

      if (showMovedToast) showToast('👆 옮겼어요!')

    },

    [getCtx, pushHistory, notifyChange, showToast]

  )

  const handleMovePointerUp = useCallback(

    (e) => {

      if (!moveDragRef.current) return

      e.preventDefault()

      finishMoveDrag()

    },

    [finishMoveDrag]

  )

  useEffect(() => {
    if (tab !== 'move' && moveDragRef.current) {
      finishMoveDrag(false)
    }
  }, [tab, finishMoveDrag])



  const handlePointerDown = useCallback(

    (e) => {

      if (tab === 'move' || tab === 'photo') return

      if (e.pointerType === 'touch' && e.isPrimary === false) return

      e.preventDefault()

      canvasRef.current?.setPointerCapture(e.pointerId)

      const pt = getPoint(e)

      startRef.current = pt

      const ctx = getCtx()

      const canvas = canvasRef.current

      if (!ctx || !canvas) return



      if (tab === 'stamp') {

        placeStamp(pt)

        return

      }



      if (tab === 'draw' && drawTool === 'fill') {

        doFill(pt)

        return

      }



      drawingRef.current = true

      snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height)



      if (tab === 'draw' && (drawTool === 'pen' || drawTool === 'rainbow' || drawTool === 'eraser')) {

        const { stroke, eraser } = pickStroke()

        drawFreeSegment(pt, pt, stroke, eraser)

      }

    },

    [getPoint, getCtx, tab, drawTool, placeStamp, doFill, pickStroke, drawFreeSegment]

  )



  const handlePointerMove = useCallback(

    (e) => {

      if (!drawingRef.current) return

      e.preventDefault()

      const pt = getPoint(e)



      if (tab === 'draw' && (drawTool === 'pen' || drawTool === 'rainbow' || drawTool === 'eraser')) {

        const { stroke, eraser } = pickStroke()

        drawFreeSegment(startRef.current, pt, stroke, eraser)

        startRef.current = pt

      } else if (tab === 'shape') {

        drawShapePreview(startRef.current, pt, shapeTool, color)

      }

    },

    [getPoint, tab, drawTool, shapeTool, color, pickStroke, drawFreeSegment, drawShapePreview]

  )



  const handlePointerUp = useCallback(

    (e) => {

      if (!drawingRef.current) return

      e.preventDefault()

      drawingRef.current = false

      if (tab === 'shape') {

        const pt = getPoint(e)

        drawShapePreview(startRef.current, pt, shapeTool, color)

      }

      pushHistory()

      notifyChange(true)

      snapshotRef.current = null

    },

    [getPoint, tab, shapeTool, color, drawShapePreview, pushHistory, notifyChange]

  )



  const handleUndo = useCallback(() => {

    if (historyIndexRef.current <= 0) {

      showToast('↩️ 더 이상 취소할 수 없어요')

      return

    }

    historyIndexRef.current -= 1

    const ctx = getCtx()

    const snap = historyRef.current[historyIndexRef.current]

    if (ctx && snap) {

      ctx.putImageData(snap, 0, 0)

      notifyChange(historyIndexRef.current > 0 || photoStickers.length > 0)

      showToast('↩️ 한 번 취소!')

    }

  }, [getCtx, notifyChange, showToast, photoStickers.length])



  const resetSurface = useCallback(async () => {

    bgPhotoRef.current = null

    embedOffsetRef.current = 0

    pendingEmbedRef.current = null

    dragStickerRef.current = null

    moveDragRef.current = null

    setPhotoStickers([])

    setSelectedStickerId(null)

    await setupCanvasSurface()

  }, [setupCanvasSurface])



  const handleClearConfirm = useCallback(async () => {

    setShowClearAsk(false)

    await resetSurface()

    showToast('🗑️ 새 도화지!')

  }, [resetSurface, showToast])



  const addPhotoSticker = useCallback(

    async (src, options = {}) => {

      if (!src) return false

      const sizeId = options.size ?? photoSize

      const noBg = Boolean(options.noBg)

      if (!canvasReadyRef.current) {

        pendingEmbedRef.current = { src, size: sizeId, noBg }

        return false

      }



      try {

        const img = await loadImage(src)

        const placement = computeStickerPlacement(

          img.naturalWidth,

          img.naturalHeight,

          canvasWidth,

          canvasHeight,

          sizeId,

          embedOffsetRef.current

        )

        embedOffsetRef.current += 1



        const sticker = {

          id: `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,

          src,

          noBg,

          sizeId,

          naturalW: img.naturalWidth,

          naturalH: img.naturalHeight,

          rotation: 0,

          ...placement,

        }



        setPhotoStickers((prev) => [...prev, sticker])

        setSelectedStickerId(sticker.id)

        setTab('photo')

        markDirty()

        showToast('📷 사진을 넣었어요! 「📷 사진」탭에서 옮겨요')

        return true

      } catch {

        showToast('⚠️ 사진을 넣지 못했어요')

        return false

      }

    },

    [photoSize, canvasWidth, canvasHeight, markDirty, showToast]

  )



  useEffect(() => {

    if (!canvasReadyRef.current || !pendingEmbedRef.current) return

    const pending = pendingEmbedRef.current

    pendingEmbedRef.current = null

    addPhotoSticker(pending.src, pending)

  }, [canvasWidth, canvasHeight, addPhotoSticker])



  const applyPhotoSize = useCallback(

    (sizeId) => {

      setPhotoSize(sizeId)

      if ((tab === 'photo' || tab === 'move') && selectedStickerId) {

        setPhotoStickers((prev) =>

          prev.map((s) =>

            s.id === selectedStickerId ? clampStickerPosition(resizeStickerAtCenter(s, canvasWidth, canvasHeight, sizeId), canvasWidth, canvasHeight) : s

          )

        )

        markDirty()

        showToast('📐 사진 크기를 바꿨어요!')

      }

    },

    [tab, selectedStickerId, canvasWidth, canvasHeight, markDirty, showToast]

  )



  const rotateSelectedSticker = useCallback(

    (deltaDeg) => {

      if (!selectedStickerId) {

        showToast('📷 먼저 사진을 선택해요')

        return

      }

      setPhotoStickers((prev) =>

        prev.map((s) => (s.id === selectedStickerId ? rotateSticker(s, deltaDeg) : s))

      )

      markDirty()

      showToast('🔄 사진을 돌렸어요!')

    },

    [selectedStickerId, markDirty, showToast]

  )



  const removeSelectedSticker = useCallback(() => {

    if (!selectedStickerId) {

      showToast('📷 먼저 사진을 선택해요')

      return

    }

    setPhotoStickers((prev) => prev.filter((s) => s.id !== selectedStickerId))

    setSelectedStickerId(null)

    markDirty()

    showToast('🗑️ 사진을 뺐어요')

  }, [selectedStickerId, markDirty, showToast])



  const handleStickerPointerDown = useCallback(

    (e, stickerId) => {

      if (tab !== 'photo' && tab !== 'move') return

      e.preventDefault()

      e.stopPropagation()

      const sticker = photoStickers.find((s) => s.id === stickerId)

      if (!sticker) return

      e.currentTarget.setPointerCapture(e.pointerId)

      const pt = getPoint(e)

      dragStickerRef.current = {

        id: stickerId,

        offsetX: pt.x - sticker.x,

        offsetY: pt.y - sticker.y,

      }

      setSelectedStickerId(stickerId)

    },

    [tab, photoStickers, getPoint]

  )



  const handleStickerPointerMove = useCallback(

    (e) => {

      const drag = dragStickerRef.current

      if (!drag || (tab !== 'photo' && tab !== 'move')) return

      e.preventDefault()

      const pt = getPoint(e)

      setPhotoStickers((prev) =>

        prev.map((s) => {

          if (s.id !== drag.id) return s

          return clampStickerPosition(

            {

              ...s,

              x: pt.x - drag.offsetX,

              y: pt.y - drag.offsetY,

            },

            canvasWidth,
            canvasHeight

          )

        })

      )

    },

    [tab, getPoint, canvasWidth, canvasHeight]

  )



  const handleStickerPointerUp = useCallback(

    (e) => {

      const drag = dragStickerRef.current

      if (!drag) return

      e.preventDefault()

      dragStickerRef.current = null

      markDirty()

      showToast('👆 사진을 옮겼어요!')

    },

    [markDirty, showToast]

  )



  const applyPhotoBackground = useCallback(async () => {

    if (photos.length === 0) return

    bgPhotoRef.current = photos[0].src

    await redrawBase()

    markDirty()

    showToast('📷 사진을 연하게 배경에 깔았어요!')

  }, [photos, redrawBase, markDirty, showToast])



  useEffect(() => {

    if (!restoreBlob?.size) return

    let cancelled = false

    ;(async () => {

      const ctx = getCtx()

      if (!ctx || cancelled) return

      try {

        const url = URL.createObjectURL(restoreBlob)

        const img = await loadImage(url)

        URL.revokeObjectURL(url)

        setPhotoStickers([])

        setSelectedStickerId(null)

        await redrawBase()

        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight)

        pushHistory()

        notifyChange(true)

        onRestored?.()

      } catch {

        if (!cancelled) await setupCanvasSurface()

        onRestored?.()

      }

    })()

    return () => {

      cancelled = true

    }

  }, [restoreBlob, getCtx, canvasWidth, canvasHeight, redrawBase, pushHistory, notifyChange, setupCanvasSurface, onRestored])



  useImperativeHandle(

    ref,

    () => ({

      async getBlob() {

        const baseCanvas = baseCanvasRef.current

        const drawCanvas = canvasRef.current

        if (!drawCanvas) return null

        const dpr = dprRef.current

        const composite = await compositeFullScene(
          baseCanvas,
          drawCanvas,
          photoStickers,
          canvasWidth,
          canvasHeight,
          dpr
        )

        return new Promise((resolve) => composite.toBlob((b) => resolve(b), 'image/png', 0.92))

      },

      async loadFromBlob(blob) {

        if (!blob?.size) {

          await resetSurface()

          return

        }

        const ctx = getCtx()

        if (!ctx) return

        try {

          const url = URL.createObjectURL(blob)

          const img = await loadImage(url)

          URL.revokeObjectURL(url)

          setPhotoStickers([])

          setSelectedStickerId(null)

          await redrawBase()

          ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight)

          pushHistory()

          notifyChange(true)

        } catch {

          await resetSurface()

        }

      },

      async clear() {

        await resetSurface()

      },

      embedPhoto(src, options = {}) {

        return addPhotoSticker(src, options)

      },

    }),

    [

      getCtx,

      canvasWidth,

      canvasHeight,

      resetSurface,

      pushHistory,

      notifyChange,

      addPhotoSticker,

      photoStickers,

    ]

  )



  const selectDrawTool = (id) => {

    setDrawTool(id)

    setTab('draw')

  }



  const selectedSticker = photoStickers.find((s) => s.id === selectedStickerId)



  return (

    <div className="kid-draw-panel" ref={panelRef}>

      <div className="kid-draw-top-bar">
        <h2 className="kid-draw-title">🖍️ 내 그림</h2>
        <div className="draw-tabs draw-tabs-inline" role="tablist">
          {[
            { id: 'draw', icon: '🖍️', label: '그리기' },
            { id: 'photo', icon: '📷', label: '사진' },
            { id: 'stamp', icon: '⭐', label: '스티커' },
            { id: 'shape', icon: '🔷', label: '도형' },
            { id: 'move', icon: '✋', label: '옮기기' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={`draw-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              <span className="draw-tab-icon">{t.icon}</span>
              <span className="draw-tab-label">{t.label}</span>
            </button>
          ))}
        </div>
        <div
          className="color-preview"
          style={{
            background:
              drawTool === 'rainbow'
                ? 'linear-gradient(90deg,red,orange,yellow,green,blue,purple)'
                : color,
          }}
          title="지금 색"
        />
      </div>

      <p className="kid-draw-hint-sr" role="status">
        {hint}
      </p>

      <div className="kid-draw-canvas-wrap" ref={containerRef}>

        <div
          className="kid-draw-stage"
          ref={stageRef}
          style={{ width: canvasWidth, height: canvasHeight }}
        >

          <canvas ref={baseCanvasRef} className="kid-draw-base-canvas" aria-hidden="true" />

          <div

            className={`photo-sticker-layer ${tab === 'photo' || tab === 'move' ? 'active' : ''}`}

            onPointerMove={handleStickerPointerMove}

            onPointerUp={handleStickerPointerUp}

            onPointerLeave={handleStickerPointerUp}

            onPointerCancel={handleStickerPointerUp}

          >

            {photoStickers.map((sticker) => (

              <button

                key={sticker.id}

                type="button"

                className={`photo-sticker ${selectedStickerId === sticker.id ? 'selected' : ''} ${sticker.noBg ? 'no-bg' : ''}`}

                style={{

                  left: sticker.x,

                  top: sticker.y,

                  width: sticker.w,

                  height: sticker.h,

                  transform: `rotate(${sticker.rotation || 0}deg)`,

                }}

                onPointerDown={(e) => handleStickerPointerDown(e, sticker.id)}

                aria-label="그림판 사진"

              >

                <img src={sticker.src} alt="" draggable={false} />

              </button>

            ))}

          </div>

          <canvas

            ref={canvasRef}

            className={`kid-draw-canvas draw-layer ${tab === 'photo' ? 'photo-mode' : ''} ${tab === 'move' ? 'move-mode' : ''}`}

            onPointerDown={(e) => (tab === 'move' ? handleMovePointerDown(e) : handlePointerDown(e))}

            onPointerMove={(e) => (tab === 'move' ? handleMovePointerMove(e) : handlePointerMove(e))}

            onPointerUp={(e) => (tab === 'move' ? handleMovePointerUp(e) : handlePointerUp(e))}

            onPointerLeave={(e) => (tab === 'move' ? handleMovePointerUp(e) : handlePointerUp(e))}

            onPointerCancel={(e) => (tab === 'move' ? handleMovePointerUp(e) : handlePointerUp(e))}

            aria-label="그림 그리기 도화지"

          />

        </div>

        {toast && <div className="kid-draw-toast">{toast}</div>}

      </div>



      <div className="kid-draw-tools" ref={toolsRef}>

      {tab === 'photo' && (

        <div className="photo-tab-tools">

          <p className="photo-tab-tip">

            {selectedSticker ? '👆 선택한 사진을 드래그해서 옮겨요' : '📷 사진을 눌러 선택해요'}

          </p>

          {selectedSticker && (

            <>

              <div className="photo-rotate-row">

                <button type="button" className="photo-rotate-btn" onClick={() => rotateSelectedSticker(-15)}>

                  ↺ 왼쪽

                </button>

                <button type="button" className="photo-rotate-btn" onClick={() => rotateSelectedSticker(15)}>

                  ↻ 오른쪽

                </button>

                <button type="button" className="photo-rotate-btn quarter" onClick={() => rotateSelectedSticker(-90)}>

                  ↺ 90°

                </button>

                <button type="button" className="photo-rotate-btn quarter" onClick={() => rotateSelectedSticker(90)}>

                  ↻ 90°

                </button>

              </div>

              <button type="button" className="photo-remove-sticker-btn" onClick={removeSelectedSticker}>

                🗑️ 선택한 사진 빼기

              </button>

            </>

          )}

        </div>

      )}



      {tab === 'move' && (

        <div className="photo-tab-tools move-tab-tools">

          <p className="photo-tab-tip">

            👆 그림·도형·선·스티커를 눌러 드래그해서 옮겨요! 사진도 눌러 옮길 수 있어요

          </p>

          {selectedSticker && (

            <div className="photo-rotate-row">

              <button type="button" className="photo-rotate-btn" onClick={() => rotateSelectedSticker(-15)}>

                ↺ 왼쪽

              </button>

              <button type="button" className="photo-rotate-btn" onClick={() => rotateSelectedSticker(15)}>

                ↻ 오른쪽

              </button>

              <button type="button" className="photo-remove-sticker-btn" onClick={removeSelectedSticker}>

                🗑️ 선택한 사진 빼기

              </button>

            </div>

          )}

        </div>

      )}



      {tab !== 'move' && (

      <div className="draw-palette">

        {KID_COLORS.map((c) => (

          <button

            key={c.id}

            type="button"

            className={`draw-color-btn kid ${color === c.hex ? 'active' : ''}`}

            style={{

              background: c.hex,

              borderColor: c.hex === '#ffffff' ? '#ccc' : c.hex,

            }}

            onClick={() => {

              setColor(c.hex)

              if (tab === 'stamp') setTab('draw')

              setDrawTool('pen')

              showToast(`${c.name}색!`)

            }}

            aria-label={c.name}

            title={c.name}

          />

        ))}

      </div>

      )}



      {tab === 'draw' && (

        <div className="draw-tool-row">

          {DRAW_TOOLS.map((t) => (

            <button

              key={t.id}

              type="button"

              className={`draw-big-btn ${drawTool === t.id ? 'active' : ''}`}

              onClick={() => selectDrawTool(t.id)}

            >

              <span className="draw-big-icon">{t.icon}</span>

              <span className="draw-big-label">{t.name}</span>

            </button>

          ))}

        </div>

      )}



      {tab === 'stamp' && (

        <div className="draw-tool-row stamp-row">

          {STAMP_ITEMS.map((s) => (

            <button

              key={s.id}

              type="button"

              className={`draw-big-btn stamp ${stampId === s.id ? 'active' : ''}`}

              onClick={() => setStampId(s.id)}

            >

              <span className="draw-big-icon">{s.emoji}</span>

              <span className="draw-big-label">{s.label}</span>

            </button>

          ))}

        </div>

      )}



      {tab === 'shape' && (

        <div className="draw-tool-row stamp-row shape-row">

          {SHAPE_TOOLS.map((t) => (

            <button

              key={t.id}

              type="button"

              className={`draw-big-btn ${shapeTool === t.id ? 'active' : ''}`}

              onClick={() => setShapeTool(t.id)}

            >

              <span className="draw-big-icon">{t.icon}</span>

              <span className="draw-big-label">{t.name}</span>

            </button>

          ))}

        </div>

      )}



      {tab !== 'move' && (

      <div className="draw-brush-row">

        <span className="draw-brush-title">굵기</span>

        {BRUSH_SIZES.map((b) => (

          <button

            key={b.id}

            type="button"

            className={`draw-brush-btn ${brushSize === b.size ? 'active' : ''}`}

            onClick={() => setBrushSize(b.size)}

          >

            <span className="brush-dot" style={{ width: b.dot, height: b.dot }} />

            {b.label}

          </button>

        ))}

      </div>

      )}



      {(photos.length > 0 || photoStickers.length > 0) && tab !== 'move' && (

        <div className="photo-size-row">

          <span className="photo-size-label">

            {tab === 'photo' && selectedSticker ? '선택 사진 크기' : '새 사진 크기'}

          </span>

          {PHOTO_SIZE_OPTIONS.map((opt) => (

            <button

              key={opt.id}

              type="button"

              className={`photo-size-btn ${(selectedSticker?.sizeId ?? photoSize) === opt.id ? 'active' : ''}`}

              onClick={() => applyPhotoSize(opt.id)}

            >

              {opt.label}

            </button>

          ))}

        </div>

      )}



      <div className="draw-action-row">

        <button type="button" className="draw-action-btn undo" onClick={handleUndo}>

          ↩️<span>취소</span>

        </button>

        <button type="button" className="draw-action-btn clear" onClick={() => setShowClearAsk(true)}>

          🗑️<span>전체 지우기</span>

        </button>

        {photos.length > 0 && (

          <>

            <button

              type="button"

              className="draw-action-btn photo"

              onClick={() =>

                addPhotoSticker(photos[photos.length - 1].src, {

                  noBg: photos[photos.length - 1].noBg,

                })

              }

            >

              📷<span>사진 넣기</span>

            </button>

            <button type="button" className="draw-action-btn photo-bg" onClick={applyPhotoBackground}>

              🖼️<span>연한 배경</span>

            </button>

          </>

        )}

      </div>

      </div>



      {showClearAsk && (

        <div className="kid-draw-modal" role="dialog" aria-modal="true">

          <div className="kid-draw-modal-box">

            <p>🗑️ 그림을 모두 지울까요?</p>

            <div className="kid-draw-modal-actions">

              <button type="button" className="modal-btn cancel" onClick={() => setShowClearAsk(false)}>

                아니요

              </button>

              <button type="button" className="modal-btn ok" onClick={handleClearConfirm}>

                네, 지울게요

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  )

})



export default KidDrawCanvas


