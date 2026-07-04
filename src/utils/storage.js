const DB_NAME = 'storyPictureLocal'
const DB_VERSION = 1
const DRAFT_ID = 'current'

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('draft')) {
        db.createObjectStore('draft', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('stories')) {
        const store = db.createObjectStore('stories', { keyPath: 'id' })
        store.createIndex('createdAt', 'createdAt')
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function runTransaction(storeName, mode, callback) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, mode)
        const store = tx.objectStore(storeName)
        const request = callback(store)

        if (request instanceof IDBRequest) {
          request.onsuccess = () => resolve(request.result)
          request.onerror = () => reject(request.error)
        } else {
          tx.oncomplete = () => resolve(request)
        }

        tx.onerror = () => reject(tx.error)
      })
  )
}

async function dataUrlToBlob(dataUrl) {
  const response = await fetch(dataUrl)
  return response.blob()
}

async function serializePhotos(photos) {
  return Promise.all(
    photos.map(async (photo) => ({
      id: photo.id,
      blob: photo.blob ?? (await dataUrlToBlob(photo.src)),
      name: photo.name || 'photo',
      noBg: Boolean(photo.noBg),
    }))
  )
}

async function deserializePhotos(photos) {
  return photos.map((photo) => ({
    id: photo.id,
    src: URL.createObjectURL(photo.blob),
    blob: photo.blob,
    name: photo.name,
    noBg: Boolean(photo.noBg),
  }))
}

export async function requestPersistentStorage() {
  if (navigator.storage?.persist) {
    return navigator.storage.persist()
  }
  return false
}

export async function saveDraft({ storyText, photos, generatedImageBlob }) {
  const serializedPhotos = await serializePhotos(photos)

  const draft = {
    id: DRAFT_ID,
    storyText,
    photos: serializedPhotos,
    generatedImageBlob: generatedImageBlob ?? null,
    updatedAt: Date.now(),
  }

  await runTransaction('draft', 'readwrite', (store) => store.put(draft))
  return draft
}

export async function loadDraft() {
  const draft = await runTransaction('draft', 'readonly', (store) => store.get(DRAFT_ID))
  if (!draft) return null

  const photos = await deserializePhotos(draft.photos || [])
  const generatedImageUrl = draft.generatedImageBlob
    ? URL.createObjectURL(draft.generatedImageBlob)
    : null

  return {
    storyText: draft.storyText || '',
    photos,
    generatedImageBlob: draft.generatedImageBlob,
    generatedImageUrl,
    updatedAt: draft.updatedAt,
  }
}

export async function saveStoryToGallery({ storyText, photos, generatedImageBlob }) {
  const id = `story-${Date.now()}`
  const serializedPhotos = await serializePhotos(photos)

  const story = {
    id,
    storyText,
    photos: serializedPhotos,
    generatedImageBlob: generatedImageBlob ?? null,
    createdAt: Date.now(),
  }

  await runTransaction('stories', 'readwrite', (store) => store.put(story))
  return id
}

export async function loadAllStories() {
  const stories = await runTransaction('stories', 'readonly', (store) => store.getAll())

  return Promise.all(
    stories
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(async (story) => ({
        id: story.id,
        storyText: story.storyText,
        photos: await deserializePhotos(story.photos || []),
        generatedImageBlob: story.generatedImageBlob ?? null,
        generatedImageUrl: story.generatedImageBlob
          ? URL.createObjectURL(story.generatedImageBlob)
          : null,
        createdAt: story.createdAt,
      }))
  )
}

export async function deleteStory(id) {
  await runTransaction('stories', 'readwrite', (store) => store.delete(id))
}

export async function clearDraft() {
  await runTransaction('draft', 'readwrite', (store) => store.delete(DRAFT_ID))
}

export async function getStorageEstimate() {
  if (navigator.storage?.estimate) {
    return navigator.storage.estimate()
  }
  return null
}
