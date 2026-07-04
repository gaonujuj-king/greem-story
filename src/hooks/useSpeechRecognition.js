import { useState, useCallback, useRef, useEffect } from 'react'
import {
  pickBestAlternative,
  processSpeechTranscripts,
} from '../utils/speechTranscriptFilter'

function getSpeechRecognitionClass() {
  return window.SpeechRecognition || window.webkitSpeechRecognition
}

function stopLevelDecay(refs) {
  if (refs.levelLoopRef.current) {
    cancelAnimationFrame(refs.levelLoopRef.current)
    refs.levelLoopRef.current = null
  }
}

function startLevelDecay(refs, setMicLevel) {
  stopLevelDecay(refs)
  const tick = () => {
    setMicLevel((prev) => Math.max(0, prev - 2))
    refs.levelLoopRef.current = requestAnimationFrame(tick)
  }
  tick()
}

function bumpMicLevel(setMicLevel, amount) {
  setMicLevel((prev) => Math.min(100, Math.max(prev, amount)))
}

function collectTranscripts(event) {
  let interim = ''
  let final = ''

  for (let i = event.resultIndex; i < event.results.length; i++) {
    const result = event.results[i]
    const transcript = pickBestAlternative(result)
    if (!transcript) continue

    if (result.isFinal) {
      final += transcript
    } else {
      interim += transcript
    }
  }

  if (!final && !interim && event.results.length > 0) {
    for (let i = 0; i < event.results.length; i++) {
      const result = event.results[i]
      const transcript = pickBestAlternative(result)
      if (!transcript) continue
      if (result.isFinal) {
        final += transcript
      } else {
        interim += transcript
      }
    }
  }

  return processSpeechTranscripts(final, interim)
}

export function useSpeechRecognition({ onResult, onError }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const [micLevel, setMicLevel] = useState(0)
  const [micPermission, setMicPermission] = useState('unknown')
  const [speechPhase, setSpeechPhase] = useState('idle')
  const [speechHint, setSpeechHint] = useState(null)

  const recognitionRef = useRef(null)
  const shouldListenRef = useRef(false)
  const isStartingRef = useRef(false)
  const hasReceivedResultRef = useRef(false)
  const noSpeechCountRef = useRef(0)
  const noTextTimerRef = useRef(null)
  const lastGoodInterimRef = useRef('')
  const onResultRef = useRef(onResult)
  const onErrorRef = useRef(onError)
  const micPermissionRef = useRef('unknown')
  const levelLoopRef = useRef(null)
  const levelRefs = useRef({ levelLoopRef })

  useEffect(() => {
    onResultRef.current = onResult
    onErrorRef.current = onError
  }, [onResult, onError])

  useEffect(() => {
    if (!navigator.permissions?.query) return
    navigator.permissions
      .query({ name: 'microphone' })
      .then((status) => {
        micPermissionRef.current = status.state
        setMicPermission(status.state)
        status.onchange = () => {
          micPermissionRef.current = status.state
          setMicPermission(status.state)
        }
      })
      .catch(() => {})
  }, [])

  const clearNoTextTimer = useCallback(() => {
    if (noTextTimerRef.current) {
      window.clearTimeout(noTextTimerRef.current)
      noTextTimerRef.current = null
    }
  }, [])

  const resetListeningUi = useCallback(() => {
    stopLevelDecay(levelRefs.current)
    clearNoTextTimer()
    setMicLevel(0)
    setSpeechPhase('idle')
    setSpeechHint(null)
    hasReceivedResultRef.current = false
    noSpeechCountRef.current = 0
    lastGoodInterimRef.current = ''
  }, [clearNoTextTimer])

  const stopListening = useCallback(() => {
    shouldListenRef.current = false
    isStartingRef.current = false
    setIsRecording(false)
    resetListeningUi()

    try {
      recognitionRef.current?.stop()
    } catch {
      try {
        recognitionRef.current?.abort()
      } catch {
        // ignore
      }
    }
  }, [resetListeningUi])

  const handleFatalError = useCallback(
    (code) => {
      shouldListenRef.current = false
      isStartingRef.current = false
      setIsRecording(false)
      resetListeningUi()
      onErrorRef.current?.(code)
    },
    [resetListeningUi]
  )

  const ensureMicPermission = useCallback(async () => {
    if (micPermissionRef.current === 'granted') return true
    if (!navigator.mediaDevices?.getUserMedia) return true

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
      micPermissionRef.current = 'granted'
      setMicPermission('granted')
      await new Promise((resolve) => window.setTimeout(resolve, 300))
      return true
    } catch {
      micPermissionRef.current = 'denied'
      setMicPermission('denied')
      handleFatalError('not-allowed')
      return false
    }
  }, [handleFatalError])

  const scheduleNoTextHint = useCallback(() => {
    clearNoTextTimer()
    noTextTimerRef.current = window.setTimeout(() => {
      if (!shouldListenRef.current || hasReceivedResultRef.current) return
      setSpeechHint('no-text-yet')
    }, 6000)
  }, [clearNoTextTimer])

  const bindRecognition = useCallback(
    (recognition) => {
      recognition.onstart = () => {
        isStartingRef.current = false
        setIsRecording(true)
        setSpeechPhase('listening')
        startLevelDecay(levelRefs.current, setMicLevel)
        scheduleNoTextHint()
      }

      recognition.onaudiostart = () => {
        bumpMicLevel(setMicLevel, 25)
        setSpeechPhase('listening')
      }

      recognition.onsoundstart = () => {
        bumpMicLevel(setMicLevel, 55)
        setSpeechPhase('sound-detected')
        scheduleNoTextHint()
      }

      recognition.onspeechstart = () => {
        bumpMicLevel(setMicLevel, 75)
        setSpeechPhase('speech-detected')
      }

      recognition.onresult = (event) => {
        const { final, interim } = collectTranscripts(event)

        const displayInterim = interim || (final ? '' : lastGoodInterimRef.current)
        if (interim) lastGoodInterimRef.current = interim
        if (final) lastGoodInterimRef.current = ''

        if (!final && !displayInterim) return

        hasReceivedResultRef.current = true
        setSpeechHint(null)
        clearNoTextTimer()
        bumpMicLevel(setMicLevel, 95)
        setSpeechPhase('text-received')
        onResultRef.current?.({ final, interim: displayInterim })
      }

      recognition.onerror = (event) => {
        const code = event.error

        if (code === 'aborted') return

        if (code === 'no-speech') {
          noSpeechCountRef.current += 1
          if (noSpeechCountRef.current >= 4 && !hasReceivedResultRef.current) {
            setSpeechHint('speak-louder')
          }
          return
        }

        if (code === 'not-allowed' || code === 'service-not-allowed') {
          micPermissionRef.current = 'denied'
          setMicPermission('denied')
          handleFatalError('not-allowed')
        } else if (code === 'audio-capture') {
          handleFatalError('audio-capture')
        } else if (code === 'language-not-supported') {
          handleFatalError('language-not-supported')
        } else if (code === 'network') {
          handleFatalError('network')
        } else {
          handleFatalError(code)
        }
      }

      recognition.onend = () => {
        if (!shouldListenRef.current) {
          setIsRecording(false)
          resetListeningUi()
          return
        }

        window.setTimeout(() => {
          if (!shouldListenRef.current || !recognitionRef.current) {
            setIsRecording(false)
            resetListeningUi()
            return
          }

          try {
            recognitionRef.current.start()
          } catch {
            if (shouldListenRef.current) {
              handleFatalError('start-failed')
            }
          }
        }, 300)
      }
    },
    [clearNoTextTimer, handleFatalError, resetListeningUi, scheduleNoTextHint]
  )

  const createRecognition = useCallback(() => {
    const SpeechRecognition = getSpeechRecognitionClass()
    if (!SpeechRecognition) return null

    const recognition = new SpeechRecognition()
    recognition.lang = 'ko-KR'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 5
    bindRecognition(recognition)
    return recognition
  }, [bindRecognition])

  const startListening = useCallback(async () => {
    if (!window.isSecureContext) {
      handleFatalError('insecure-context')
      return false
    }

    if (!getSpeechRecognitionClass()) {
      setIsSupported(false)
      handleFatalError('unsupported')
      return false
    }

    if (isStartingRef.current || shouldListenRef.current) {
      return true
    }

    isStartingRef.current = true
    shouldListenRef.current = true
    hasReceivedResultRef.current = false
    noSpeechCountRef.current = 0
    lastGoodInterimRef.current = ''
    setSpeechHint(null)

    const micOk = await ensureMicPermission()
    if (!micOk) return false

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch {
        // ignore
      }
    }

    const recognition = createRecognition()
    if (!recognition) {
      handleFatalError('unsupported')
      return false
    }

    recognitionRef.current = recognition

    await new Promise((resolve) => window.setTimeout(resolve, 250))

    try {
      recognition.start()
      return true
    } catch {
      await new Promise((resolve) => window.setTimeout(resolve, 400))
      try {
        recognition.start()
        return true
      } catch {
        handleFatalError('start-failed')
        return false
      }
    }
  }, [createRecognition, ensureMicPermission, handleFatalError])

  const toggleListening = useCallback(async () => {
    if (shouldListenRef.current || isRecording) {
      stopListening()
      return
    }
    await startListening()
  }, [isRecording, startListening, stopListening])

  useEffect(() => {
    if (!getSpeechRecognitionClass()) {
      setIsSupported(false)
    }

    return () => {
      shouldListenRef.current = false
      try {
        recognitionRef.current?.abort()
      } catch {
        // ignore
      }
      resetListeningUi()
    }
  }, [resetListeningUi])

  return {
    isListening: isRecording,
    isRecording,
    isSupported,
    isMicActive: isRecording,
    micLevel,
    micPermission,
    speechPhase,
    speechHint,
    toggleListening,
    stopListening,
    startListening,
  }
}
