import { GoogleTagManager } from '@next/third-parties/google'
import { Inter } from 'next/font/google'
import 'react-toastify/dist/ReactToastify.css'
import ClientLayout from './ClientLayout'
import Footer from './components/footer'
import './css/card.scss'
import './css/globals.scss'
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Portfolio of Yuriy Dovzhyk - Full Stack Developer',
  description:
    'Portfolio of Yuriy Dovzhyk – Full Stack Developer specializing in React, Next.js, Node.js, and MongoDB. Building scalable web applications and APIs.',
  openGraph: {
    title: 'Yuriy Dovzhyk – Full Stack Developer Portfolio',
    description:
      'Explore projects, skills, and experience in web development with React, Next.js, Node.js, and more.',
    url: 'https://ydovzhyk.com',
    siteName: 'Yuriy Dovzhyk Portfolio',
    images: [
      {
        url: 'https://ydovzhyk.com/og-image.png',
        width: 556,
        height: 591,
        alt: 'Preview of Yuriy Dovzhyk portfolio website',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yuriy Dovzhyk – Full Stack Developer Portfolio',
    description:
      'Explore projects, skills, and experience in web development with React, Next.js, Node.js, and more.',
    images: ['https://ydovzhyk.com/og-image.png'],
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
        <Footer />
      </body>
      <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM} />
    </html>
  )
}
