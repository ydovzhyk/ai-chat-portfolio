'use client'

import { useEffect, useState } from 'react'

const DEFAULT_BTN_CLS =
  'fixed bottom-8 right-6 z-60 flex items-center rounded-full bg-gradient-to-r from-pink-500 to-violet-600 p-4'
const SCROLL_THRESHOLD = 150

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false)

  const toggleVisibility = () => {
    if (typeof window !== 'undefined' && window.scrollY > SCROLL_THRESHOLD) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    window.addEventListener('scroll', toggleVisibility)
    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }

  return (
    <button
      className={`${DEFAULT_BTN_CLS} ${isVisible ? 'block' : 'hidden'} group`}
      onClick={scrollToTop}
    >
      <div className={`triangle ${isVisible ? 'animate-blink' : ''}`}></div>
      <span className="transition-all duration-200 group-hover:font-bold">
        YD
      </span>
    </button>
  )
}

export default ScrollToTop;
