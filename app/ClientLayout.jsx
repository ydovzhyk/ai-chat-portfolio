'use client'

import { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ChatWidget from './components/chat-widget/ChatWidget'
import Header from './components/header'
import ScrollToTop from './components/helper/scroll-to-top'
import SnowFlake from './components/snow-flake/'

function isSnowSeason(date = new Date()) {
  const m = date.getMonth() + 1
  const d = date.getDate()
  const inDec = m === 12 && d >= 7
  const inJan = m === 1
  const inFeb = m === 2 && d <= 25
  return inDec || inJan || inFeb
}

const ON_MS = 3 * 60 * 1000 // 3 хв
const OFF_MS = 5 * 60 * 1000 // 5 хв

export default function ClientLayout({ children }) {
  // сезон (07.12–25.02)
  const [snowSeason, setSnowSeason] = useState(false)
  // пульс (3 хв ON / 5 хв OFF)
  const [snowPulse, setSnowPulse] = useState(true)

  // 1) Сезон: оновлюємо зараз + опівночі
  useEffect(() => {
    const update = () => setSnowSeason(isSnowSeason(new Date()))
    update()

    const now = new Date()
    const nextMidnight = new Date(now)
    nextMidnight.setHours(24, 0, 0, 0)
    const msToMidnight = nextMidnight.getTime() - now.getTime()

    let dailyIntervalId = null

    const t = setTimeout(() => {
      update()
      dailyIntervalId = setInterval(update, 24 * 60 * 60 * 1000)
    }, msToMidnight)

    return () => {
      clearTimeout(t)
      if (dailyIntervalId) clearInterval(dailyIntervalId)
    }
  }, [])

  // 2) Пульс: 3 хв ON / 5 хв OFF (працює тільки в сезон)
  useEffect(() => {
    if (!snowSeason) {
      setSnowPulse(false)
      return
    }

    let stopped = false
    let timerId = null

    const schedule = (nextOn) => {
      setSnowPulse(nextOn)
      timerId = setTimeout(
        () => {
          if (stopped) return
          schedule(!nextOn)
        },
        nextOn ? ON_MS : OFF_MS
      )
    }

    // стартуємо з ON
    schedule(true)

    return () => {
      stopped = true
      if (timerId) clearTimeout(timerId)
    }
  }, [snowSeason])

  const snowAllowed = snowSeason && snowPulse

  return (
    <>
      <ToastContainer />

      {/* Snow: season + pulse (3min on / 5min off) */}
      <SnowFlake enabled={snowAllowed} />

      <main className="min-h-[calc(100vh-120px)] relative mx-auto pt-20 px-6 sm:px-12 lg:max-w-[70rem] xl:max-w-[76rem] 2xl:max-w-[92rem] text-white">
        <Header />
        {children}
        <ScrollToTop />
        <ChatWidget />
      </main>
    </>
  )
}
