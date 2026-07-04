function sanitizeFilename(text) {
  return text
    .slice(0, 30)
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '_')
    .trim() || '이야기'
}

function formatDateForFilename(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}`
}

export function makeStoryFilename(storyText, extension, createdAt) {
  const name = sanitizeFilename(storyText)
  const date = formatDateForFilename(createdAt ? new Date(createdAt) : new Date())
  return `${name}_${date}.${extension}`
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function shareOrDownloadBlob(blob, filename, title) {
  const file = new File([blob], filename, { type: blob.type || 'application/octet-stream' })

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: title || filename })
      return 'shared'
    } catch (err) {
      if (err.name === 'AbortError') return 'cancelled'
    }
  }

  downloadBlob(blob, filename)
  return 'downloaded'
}

function isValidImageBlob(blob) {
  return blob && blob.size > 0
}

function loadImageToBlob(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth || 768
        canvas.height = img.naturalHeight || 768
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('canvas unavailable'))
          return
        }
        ctx.drawImage(img, 0, 0)
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('canvas toBlob failed'))),
          'image/png',
          0.92
        )
      } catch (err) {
        reject(err)
      }
    }
    img.onerror = () => reject(new Error('image load failed'))
    img.src = url
  })
}

export async function blobFromUrl(url) {
  if (!url) throw new Error('no url')

  if (url.startsWith('blob:') || url.startsWith('data:')) {
    const response = await fetch(url)
    const blob = await response.blob()
    if (isValidImageBlob(blob)) return blob
  }

  try {
    const response = await fetch(url, { mode: 'cors' })
    if (response.ok) {
      const blob = await response.blob()
      if (isValidImageBlob(blob)) return blob
    }
  } catch {
    // CORS 등 — canvas 시도
  }

  return loadImageToBlob(url)
}

export async function resolveImageBlob({ blob, url, imageSelector = '.generated-image' }) {
  if (isValidImageBlob(blob)) return blob
  if (!url) return null

  try {
    const resolved = await blobFromUrl(url)
    if (isValidImageBlob(resolved)) return resolved
  } catch (err) {
    console.warn('[내보내기] URL에서 그림 변환 실패:', err)
  }

  const imgEl = document.querySelector(imageSelector)
  if (imgEl?.complete && imgEl.naturalWidth > 0) {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = imgEl.naturalWidth
      canvas.height = imgEl.naturalHeight
      canvas.getContext('2d')?.drawImage(imgEl, 0, 0)
      const fromDom = await new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/png', 0.92)
      })
      if (isValidImageBlob(fromDom)) return fromDom
    } catch (err) {
      console.warn('[내보내기] 화면 그림 캡처 실패:', err)
    }
  }

  return null
}

export async function exportStoryImage(imageBlob, storyText, createdAt) {
  if (!isValidImageBlob(imageBlob)) return null

  const filename = makeStoryFilename(storyText, 'png', createdAt)
  return shareOrDownloadBlob(imageBlob, filename, '이야기 그림')
}

export async function exportStoryText(storyText, createdAt) {
  const filename = makeStoryFilename(storyText, 'txt', createdAt)
  const blob = new Blob([storyText], { type: 'text/plain;charset=utf-8' })
  return shareOrDownloadBlob(blob, filename, '이야기 글')
}

export async function exportStoryBundle({ imageBlob, storyText, createdAt, imageUrl, regenerateImage }) {
  let resolvedBlob = imageBlob
  if (!isValidImageBlob(resolvedBlob) && imageUrl) {
    resolvedBlob = await resolveImageBlob({ blob: imageBlob, url: imageUrl })
  }
  if (!isValidImageBlob(resolvedBlob) && typeof regenerateImage === 'function') {
    try {
      resolvedBlob = await regenerateImage()
    } catch (err) {
      console.warn('[내보내기] 그림 재생성 실패:', err)
    }
  }

  const imageResult = isValidImageBlob(resolvedBlob)
    ? await exportStoryImage(resolvedBlob, storyText, createdAt)
    : null

  const textResult = storyText?.trim()
    ? await exportStoryText(storyText, createdAt)
    : null

  return {
    imageResult,
    textResult,
    imageExported: !!imageResult && imageResult !== 'cancelled',
    textExported: !!textResult && textResult !== 'cancelled',
    cancelled: imageResult === 'cancelled' || textResult === 'cancelled',
    resolvedImageBlob: isValidImageBlob(resolvedBlob) ? resolvedBlob : null,
  }
}

export function getExportStatusMessage(result) {
  if (result.cancelled) return null
  if (result.imageExported && result.textExported) {
    return '✅ 그림(png)·글(txt)을 다운로드 폴더에 저장했어요!'
  }
  if (result.imageExported) {
    return '✅ 그림(png)을 다운로드 폴더에 저장했어요!'
  }
  if (result.textExported) {
    return '⚠️ 글(txt)만 저장됐어요. 🎨 그림 그리기 후 다시 내보내기를 눌러 주세요.'
  }
  return '⚠️ 내보내기 실패 — 그림을 먼저 만든 뒤 다시 시도해 주세요.'
}
