'use client'

import { useChat } from 'ai/react'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CiSearch } from 'react-icons/ci'
import { TfiClose } from 'react-icons/tfi'
import ReactMarkdown from 'react-markdown'
import { toast } from 'sonner'

const Dots = () => (
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
    `}</style>
  </span>
)

export default function AgentAI({ className = '' }) {
  const [userId, setUserId] = useState('')
  const [placeholder, setPlaceholder] = useState('')
  const [showPanel, setShowPanel] = useState(false)
  const [manuallyClosed, setManuallyClosed] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [isStreamingFinished, setIsStreamingFinished] = useState(false)
  const [screenHeight, setScreenHeight] = useState(0)
  const [panelTop, setPanelTop] = useState(0)
  const [panelLeft, setPanelLeft] = useState(0)
  const [panelWidth, setPanelWidth] = useState(0)
  const [chatKey, setChatKey] = useState(0)

  const replyRef = useRef(null)
  const textareaRef = useRef(null)
  const inputWrapperRef = useRef(null)

  const examples = [
    'etc. Ask me about ydovzhyk.com',
    'etc. View the site asdental.org',
    'etc. What is ydovzhyk GitHub?',
  ]

  const helperBadgeText =
    'Use my AI agent to search the web for my projects, GitHub, live websites, and portfolio links.'

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
    let index = 0
    const interval = setInterval(() => {
      setPlaceholder(examples[index])
      index = (index + 1) % examples.length
    }, 15000)

    setPlaceholder(examples[0])

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const updateHeight = () => setScreenHeight(window.innerHeight)
    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  useEffect(() => {
    if (replyRef.current) {
      replyRef.current.scrollTop = replyRef.current.scrollHeight
    }
  }, [])

  const autoResize = () => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = el.scrollHeight + 'px'
    }
  }

  const updatePanelPosition = () => {
    if (!inputWrapperRef.current) return

    const rect = inputWrapperRef.current.getBoundingClientRect()

    setPanelLeft(rect.left)
    setPanelTop(rect.bottom + 18)
    setPanelWidth(rect.width)
  }

  const fetchSuggestions = async () => {
    try {
      const usedQuestions = JSON.parse(
        sessionStorage.getItem('usedQuestions') || '[]',
      )

      const res = await fetch('/api/additional-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, usedQuestions }),
      })

      const data = await res.json()

      if (Array.isArray(data.questions)) {
        setSuggestions(data.questions)
      }
    } catch (err) {
      console.error('❌ Error fetching suggestions:', err)
    }
  }

  const chatOptions = useMemo(
    () => ({
      api: '/api/agent-ai-stream',
      body: {
        user_id: userId,
      },
      maxSteps: 5,
      experimental_throttle: 100,
      onFinish: async (message, { finishReason }) => {
        if (
          message.content &&
          (finishReason === 'stop' || finishReason === 'length')
        ) {
          setIsStreamingFinished(true)
        }
      },
      onError: (error) => {
        console.error('Chat error:', error.cause, error.message)
        toast.error('An error occurred.', {
          description: `Oops! An error occurred while processing your request. ${error.message}`,
        })
      },
    }),
    [userId],
  )

  const {
    messages,
    setMessages,
    handleInputChange,
    handleSubmit,
    isLoading,
    input,
    setInput,
  } = useChat({
    ...chatOptions,
    key: `chat-${chatKey}`,
  })

  const replyMessage = useMemo(() => {
    const lastAssistantMessage = [...messages]
      .reverse()
      .find((m) => m.role === 'assistant')

    return lastAssistantMessage?.content || ''
  }, [messages])

  useEffect(() => {
    const lastAssistantMessage = messages[messages.length - 1]

    if (
      lastAssistantMessage?.role === 'assistant' &&
      lastAssistantMessage?.content?.trim() &&
      !manuallyClosed
    ) {
      setShowPanel(true)
    }
  }, [messages, manuallyClosed])

  useEffect(() => {
    if (showPanel) {
      fetchSuggestions()
      updatePanelPosition()
    }
  }, [showPanel])

  useEffect(() => {
    autoResize()
    updatePanelPosition()

    window.addEventListener('resize', updatePanelPosition)
    window.addEventListener('scroll', updatePanelPosition, true)

    return () => {
      window.removeEventListener('resize', updatePanelPosition)
      window.removeEventListener('scroll', updatePanelPosition, true)
    }
  }, [input])

  useEffect(() => {
    if (showPanel) {
      updatePanelPosition()
    }
  }, [showPanel, suggestions, replyMessage, screenHeight])

  const saveUsedQuestion = (question) => {
    const used = JSON.parse(sessionStorage.getItem('usedQuestions') || '[]')
    if (!used.includes(question)) {
      used.push(question)
      sessionStorage.setItem('usedQuestions', JSON.stringify(used))
    }
  }

  const submitQuestion = () => {
    if (!input.trim()) return

    setShowPanel(false)
    setManuallyClosed(false)
    setIsStreamingFinished(false)

    handleSubmit({
      messages: [{ role: 'user', content: input }],
      options: {
        body: {
          user_id: userId,
        },
      },
    })

    saveUsedQuestion(input)
    setMessages([])
    setChatKey((prev) => prev + 1)
  }

  return (
    <div className="w-full flex items-center justify-center relative">
      <div
        ref={inputWrapperRef}
        className={`relative ${className} w-full max-w-[780px] overflow-hidden rounded-2xl border border-violet-500/30 bg-[#0D1224]/80 backdrop-blur-xl shadow-[0_0_35px_rgba(168,85,247,0.16)] transition focus-within:border-pink-500/40 focus-within:shadow-[0_0_40px_rgba(236,72,153,0.16)]`}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-violet-500/10 via-pink-500/10 to-cyan-400/10 opacity-70" />
        <div className="pointer-events-none absolute -left-16 top-0 h-full w-20 rotate-12 bg-white/10 blur-xl animate-agent-shine" />

        <div className="relative flex flex-col md:flex-row md:items-stretch">
          <div className="relative flex items-center gap-3 border-b border-white/10 px-4 py-4 md:w-[60%] md:border-b-0 md:border-r md:py-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-violet-400/30 bg-gradient-to-br from-violet-500/20 to-pink-500/20 shadow-[0_0_18px_rgba(236,72,153,0.25)]">
              <Image
                src="/assistant_01.svg"
                alt="AI Assistant"
                width={26}
                height={26}
                className="rounded-full"
              />

              <span className="absolute inset-0 rounded-full bg-pink-500/20 animate-agent-pulse pointer-events-none" />
            </div>

            <p className="text-sm font-extralight leading-relaxed text-gray-200">
              {helperBadgeText}
            </p>
          </div>

          <div className="relative flex min-h-[58px] flex-1 items-center md:w-[40%]">
            <textarea
              ref={textareaRef}
              value={isLoading ? '' : input}
              onChange={(e) => {
                handleInputChange(e)
                autoResize()
                updatePanelPosition()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  submitQuestion()
                }
              }}
              placeholder={isLoading ? '' : placeholder}
              disabled={isLoading}
              rows={1}
              className="w-full min-h-[48px] resize-none bg-transparent pt-[14px] pb-3 pl-4 pr-12 text-sm text-white placeholder-gray-400 placeholder:font-extralight focus:outline-none custom-scroll"
            />

            {isLoading && (
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-white text-sm mt-[2px]">
                <Dots />
              </div>
            )}

            <button
              type="button"
              aria-label="Search with AI assistant"
              title="Search with AI assistant"
              onClick={submitQuestion}
              className="absolute right-4 top-1/2 -translate-y-1/2 transition text-gray-400 hover:text-pink-400"
            >
              <div className="relative flex items-center justify-center mt-[5px]">
                <CiSearch size={24} className="text-inherit" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {showPanel && (
        <div
          className="fixed z-60 opacity-0 animate-fade-in-up"
          style={{
            top: panelTop,
            left: panelLeft,
            width: panelWidth,
          }}
        >
          <div className="relative w-full overflow-hidden rounded-2xl border border-violet-500/30 bg-[#0D1224] shadow-[0_0_35px_rgba(168,85,247,0.16)]">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-violet-500/10 via-pink-500/10 to-cyan-400/10 opacity-70" />
            <div className="pointer-events-none absolute -left-16 top-0 h-full w-20 rotate-12 bg-white/10 blur-xl animate-agent-shine" />

            <div
              className="relative w-full flex flex-col bg-no-repeat bg-[length:100%_100%] bg-bottom px-3 py-6 md:px-6"
              style={{ backgroundImage: "url('/blur-23.svg')" }}
            >
              <button
                type="button"
                aria-label="Close QueryCraft"
                onClick={() => {
                  setManuallyClosed(true)
                  setShowPanel(false)
                }}
                className="absolute top-[10px] right-[15px] flex h-7 w-7 items-center justify-center rounded-full border border-violet-400/30 bg-white/5 text-gray-400 backdrop-blur-md transition-all duration-300 hover:border-pink-400 hover:text-pink-400"
              >
                <TfiClose size={11} />
              </button>

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
                ref={replyRef}
                className="mt-6 -mb-6 flex-1 overflow-y-auto rounded-xl border border-neutral-700 bg-[#0D1224] p-4 custom-scroll text-gray-200 text-sm font-extralight"
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
                  {replyMessage}
                </ReactMarkdown>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full mt-5">
                {suggestions.map((question, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (!isStreamingFinished) return

                      setInput(question)

                      setTimeout(() => {
                        updatePanelPosition()
                      }, 10)

                      setShowPanel(false)
                    }}
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
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out forwards;
        }

        @keyframes agent-pulse {
          0% {
            transform: scale(1);
            opacity: 0.45;
          }
          70% {
            transform: scale(1.55);
            opacity: 0;
          }
          100% {
            transform: scale(1.55);
            opacity: 0;
          }
        }

        .animate-agent-pulse {
          animation: agent-pulse 2.4s ease-out infinite;
        }

        @keyframes agent-shine {
          0% {
            transform: translateX(-120px) rotate(12deg);
            opacity: 0;
          }
          35% {
            opacity: 0.45;
          }
          100% {
            transform: translateX(900px) rotate(12deg);
            opacity: 0;
          }
        }

        .animate-agent-shine {
          animation: agent-shine 5.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}