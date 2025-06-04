'use client'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ChatWidget from './components/chat-widget/chatWidget'
import Header from './components/header'
import ScrollToTop from './components/helper/scroll-to-top'
export default function ClientLayout({ children }) {
  return (
    <>
      <ToastContainer />
      <main className="min-h-[calc(100vh-120px)] relative mx-auto pt-20 px-6 sm:px-12 lg:max-w-[70rem] xl:max-w-[76rem] 2xl:max-w-[92rem] text-white">
        <Header />
        {children}
        <ScrollToTop />
        <ChatWidget />
      </main>
    </>
  )
}
