// @flow strict
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useState } from 'react'
import logo from '../../public/logo.png'
import ActiveSectionObserver from './helper/ActiveSectionObserver'
// import AgentAI from './agent-ai/AgentAI'
function Header() {
  const [activeSection, setActiveSection] = useState('')

  const handleScroll = useCallback((id) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return

    const element = document.getElementById(id)
    if (element) {
      const yOffset = id === 'about' ? -90 : 'projects' ? -90 : -20
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset

      window.scrollTo({
        top: y,
        behavior: 'smooth',
      })
    }
  }, [])

  return (
    <header className="fixed top-0 left-0 w-full z-[100] backdrop-blur-md bg-opacity-50">
      <ActiveSectionObserver setActiveSection={setActiveSection} />
      <div className="mx-auto lg:max-w-[70rem] xl:max-w-[76rem] 2xl:max-w-[92rem] px-6 sm:px-12">
        <nav className="background-transparent">
          <div className="flex items-center justify-between py-5">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="text-[#16f2b3] text-3xl font-bold">
                <Image
                  src={logo}
                  width={130}
                  alt="logo photo"
                  className="rounded-lg transition-all duration-1000 grayscale hover:grayscale-0 hover:scale-110 cursor-pointer"
                />
              </Link>
            </div>
            {/* <AgentAI className="hidden custom-lg:block" /> */}
            <ul
              className="mt-4 flex h-screen max-h-0 w-full flex-col items-start text-sm opacity-0 md:mt-0 md:h-auto md:max-h-screen md:w-auto md:flex-row md:space-x-1 md:border-0 md:opacity-100 gap-11"
              id="navbar-default"
            >
              {[
                { id: 'about', label: 'ABOUT' },
                { id: 'experience', label: 'EXPERIENCE' },
                { id: 'skills', label: 'SKILLS' },
                { id: 'projects', label: 'PROJECTS' },
                { id: 'education', label: 'EDUCATION' },
              ].map(({ id, label }) => (
                <li key={id} className="relative flex flex-col items-center">
                  <button
                    onClick={() => handleScroll(id)}
                    className="relative block py-2 no-underline outline-none hover:no-underline h-full"
                  >
                    <div
                      className={`text-sm transition-colors duration-300 ${
                        activeSection === id ? 'text-pink-600' : 'text-white'
                      }`}
                    >
                      {label}
                    </div>

                    {/* Полоска під активним пунктом */}
                    {activeSection === id && (
                      <span className="absolute bottom-0 left-0 w-full h-[2px] bg-white rounded-full transition-all duration-300"></span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header
