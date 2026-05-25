'use client'

import { useState, useCallback, useRef } from 'react'

const useAudioRecorder = ({ dataCb }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)

  const audioContext = useRef(null)
  const sourceNode = useRef(null)
  const workletNode = useRef(null)
  const audioChunksRef = useRef([])
  const mediaRecorderRef = useRef(null)
  const timerIntervalRef = useRef(null)
  const streamRef = useRef(null)

  const _startTimer = useCallback(() => {
    if (timerIntervalRef.current) return

    timerIntervalRef.current = setInterval(() => {
      setRecordingTime((time) => time + 1)
    }, 1000)
  }, [])

  const _stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
  }, [])

  const float32To16BitPCM = (float32Arr) => {
    const pcm16bit = new Int16Array(float32Arr.length)
    for (let i = 0; i < float32Arr.length; ++i) {
      const s = Math.max(-1, Math.min(1, float32Arr[i]))
      pcm16bit[i] = s < 0 ? s * 0x8000 : s * 0x7fff
    }
    return pcm16bit
  }

  const startRecording = async () => {
    if (mediaRecorderRef.current) return

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream

    audioContext.current = new (
      window.AudioContext || window.webkitAudioContext
    )()

    await audioContext.current.audioWorklet.addModule(
      '/audio-worklet/recorder-processor.js',
    )

    sourceNode.current = audioContext.current.createMediaStreamSource(stream)
    workletNode.current = new AudioWorkletNode(
      audioContext.current,
      'recorder-processor',
    )

    workletNode.current.port.onmessage = (event) => {
      const float32Audio = event.data
      const pcm16Audio = float32To16BitPCM(float32Audio)

      if (dataCb) {
        dataCb(pcm16Audio, audioContext.current.sampleRate)
      }
    }

    sourceNode.current
      .connect(workletNode.current)
      .connect(audioContext.current.destination)

    const recorder = new MediaRecorder(stream)
    mediaRecorderRef.current = recorder
    audioChunksRef.current = []

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data)
      }
    }

    recorder.start()
    setIsRecording(true)
    _startTimer()

    return audioContext.current.sampleRate
  }

  const stopRecording = async () => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current

      if (!recorder) {
        setIsRecording(false)
        setIsPaused(false)
        _stopTimer()
        return resolve(null)
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: 'audio/webm',
        })

        audioChunksRef.current = []

        sourceNode.current?.disconnect()
        workletNode.current?.disconnect()

        streamRef.current?.getTracks?.().forEach((track) => track.stop())
        streamRef.current = null

        if (audioContext.current?.state !== 'closed') {
          await audioContext.current.close().catch(() => {})
        }

        audioContext.current = null
        sourceNode.current = null
        workletNode.current = null
        mediaRecorderRef.current = null

        setRecordingTime(0)
        setIsRecording(false)
        setIsPaused(false)
        _stopTimer()

        resolve(audioBlob)
      }

      if (recorder.state !== 'inactive') {
        recorder.stop()
      } else {
        mediaRecorderRef.current = null
        setIsRecording(false)
        setIsPaused(false)
        _stopTimer()
        resolve(null)
      }
    })
  }

  const togglePauseResume = useCallback(() => {
    const recorder = mediaRecorderRef.current
    if (!recorder) return

    if (isPaused) {
      setIsPaused(false)
      recorder.resume()
      _startTimer()
    } else {
      setIsPaused(true)
      _stopTimer()
      recorder.pause()
    }
  }, [isPaused, _startTimer, _stopTimer])

  return {
    startRecording,
    stopRecording,
    togglePauseResume,
    isRecording,
    audioContext: audioContext.current,
    sourceNode: sourceNode.current,
  }
}

export default useAudioRecorder
