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

export default function ClientLayout({ children }) {
  const [snowEnabled, setSnowEnabled] = useState(false)

  useEffect(() => {
    const update = () => setSnowEnabled(isSnowSeason(new Date()))
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

  return (
    <>
      <ToastContainer />
      <SnowFlake enabled={snowEnabled} />
      <main className="min-h-[calc(100vh-120px)] relative mx-auto pt-20 px-6 sm:px-12 lg:max-w-[70rem] xl:max-w-[76rem] 2xl:max-w-[92rem] text-white">
        <Header />
        {children}
        <ScrollToTop />
        <ChatWidget />
      </main>
    </>
  )
}
