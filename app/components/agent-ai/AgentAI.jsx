'use client'

import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { CiSearch } from 'react-icons/ci'
import { TfiClose } from 'react-icons/tfi'
import Image from 'next/image'

const Dots = () => {
  return (
    <span className="flex items-center gap-2 text-gray-400">
      <span className="text-sm font-extralight">Searching the web</span>
      <span className="dot">.</span>
      <span className="dot delay-150">.</span>
      <span className="dot delay-300">.</span>

      <style jsx>{`
        .dot {
          animation: blink 1.5s infinite;
        }

        .delay-150 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.4s;
        }

        @keyframes blink {
          0%,
          80%,
          100% {
            opacity: 0;
          }
          40% {
            opacity: 1;
          }
        }

        .perspective {
          perspective: 600px;
        }
      `}</style>
    </span>
  )
}

export default function AgentAI({ className = '' }) {
  const [prompt, setPrompt] = useState('')
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [placeholder, setPlaceholder] = useState('')
  const [showPanel, setShowPanel] = useState(false)
  const [screenHeight, setScreenHeight] = useState(0)

  const examples = [
    'etc. Ask me about ydovzhyk.com',
    'etc. Who is Yuriy Dovzhyk?',
    'etc. Explore projects BlueHouse',
    'etc. Ask about Full Stack work from Kyiv',
    'etc. What is SpeechFlow?',
  ]

  useEffect(() => {
    let storedId = localStorage.getItem('chat_user_id')
    if (!storedId) {
      const randomPart = Math.random().toString(36).substring(2, 8)
      storedId = `${Date.now()}_${randomPart}`
      localStorage.setItem('chat_user_id', storedId)
    }
    setUserId(storedId)
  }, [])

  useEffect(() => {
    const randomExample = examples[Math.floor(Math.random() * examples.length)]
    setPlaceholder(randomExample)
  }, [])

  useEffect(() => {
    const updateHeight = () => setScreenHeight(window.innerHeight)
    updateHeight()

    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  const handleSubmit = async () => {
    if (!prompt.trim() || !userId) return
    setLoading(true)
    setReply('')
    setShowPanel(false)

    try {
      const [responseGeneralSearch, responseSuggestions] = await Promise.all([
        fetch('/api/agent-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, userId }),
        }),
        fetch('/api/agent-ai/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        }),
      ])

      const [dataGeneralSearch, dataSuggestions] = await Promise.all([
        responseGeneralSearch.json(),
        responseSuggestions.json(),
      ])

      setReply(dataGeneralSearch.reply)

      if (Array.isArray(dataSuggestions.questions)) {
        setSuggestions(dataSuggestions.questions)
      }
    } catch (err) {
      console.error('❌ Error in handleSubmit:', err)
      setReply('⚠️ An error occurred.')
    } finally {
      setShowPanel(true)
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <>
      <div
        className={`relative ${className} flex items-center justify-center w-full sm:w-[380px]`}
      >
        <textarea
          value={loading ? '' : prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={loading ? '' : placeholder}
          disabled={loading}
          rows={1}
          className="w-full sm:w-[380px] min-h-[40px] bg-[#221a4a00] rounded-md border border-neutral-700 pt-[9px] pb-2 pl-2 pr-10 text-sm text-white placeholder-gray-400 placeholder:font-extralight focus:outline-none focus:ring-2 focus:ring-pink-500 custom-scroll mb-[-6px]"
        />

        {loading && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-white text-sm mt-[2px]">
            <Dots />
          </div>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          className="absolute right-4 top-1/2 -translate-y-1/2 transition text-gray-400 hover:text-pink-400"
        >
          <div className="relative flex items-center justify-center mt-[5px]">
            <CiSearch size={24} className="text-inherit" />
          </div>
        </button>
      </div>

      {showPanel && (
        <div className="fixed left-1/2 top-[140px] md:w-[70vw] lg:w-[50vw] w-full -translate-x-1/2 z-60 opacity-0 animate-fade-in-up px-6 sm:px-0">
          <div className="w-full bg-[#0D1224] rounded-md border border-neutral-700 shadow-lg">
            <div
              className="w-full flex flex-col gap-6 relative bg-no-repeat bg-[length:100%_100%] bg-bottom p-6"
              style={{ backgroundImage: "url('/blur-23.svg')" }}
            >
              <div className="absolute top-[10px] right-[15px] text-gray-400 hover:text-pink-400 cursor-pointer">
                <TfiClose
                  size={20}
                  onClick={() => {
                    setShowPanel(false)
                    setPrompt('')
                    setReply('')
                    setSuggestions([])
                  }}
                />
              </div>
              <div className="w-full flex flex-row items-center justify-center gap-2 -my-3">
                <Image
                  src="/assistant_01.svg"
                  alt="bot avatar"
                  width={33}
                  height={33}
                  className="rounded-full"
                />
                <h2 className="text-xl font-semibold text-center">
                  QueryCraft
                </h2>
              </div>

              <div
                className="flex-1 overflow-y-auto border border-neutral-700 shadow-lg rounded p-4 custom-scroll text-gray-200 text-sm font-extralight"
                style={{
                  backgroundImage: "url('/section.svg')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  maxHeight: screenHeight * 0.5 + 'px',
                }}
              >
                <ReactMarkdown
                  components={{
                    a: ({ node, ...props }) => (
                      <a
                        {...props}
                        className="text-blue-400 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    ),
                    img: ({ node, ...props }) => (
                      <img
                        {...props}
                        className="max-w-full h-auto rounded my-2"
                        alt="Image"
                      />
                    ),
                  }}
                >
                  {reply}
                </ReactMarkdown>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                {suggestions.map((question, idx) => (
                  <div
                    key={idx}
                    onClick={() => setPrompt(question)}
                    className="cursor-pointer group bg-gradient-to-r from-violet-600 to-pink-500 p-[1px] rounded-full transition-all duration-300 hover:from-pink-500 hover:to-violet-600"
                    style={{ flex: '1 1 300px', maxWidth: '100%' }}
                  >
                    <button className="grid place-items-center gap-1 min-h-[52px] hover:gap-3 px-4 py-2 rounded-full border-none text-xs font-light tracking-wider transition-all duration-200 ease-out md:font-normal bg-[#0d1224] text-white group-hover:bg-transparent group-hover:text-white w-full text-center">
                      <span>{question}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        .custom-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #ec4899, #8b5cf6);
          border-radius: 10px;
        }

        @keyframes fade-in-up {
          from {
            transform: translate(-50%, -20px);
            opacity: 0;
          }
          to {
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out forwards;
        }
      `}</style>
    </>
  )
}

