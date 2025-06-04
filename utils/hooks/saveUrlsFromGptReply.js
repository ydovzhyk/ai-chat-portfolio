import { URL } from 'url'
import { db } from '../../lib/firebaseAdmin'
import { projectsData } from '../data/projects-data'

export async function saveUrlsFromGptReply(gptText, userId) {
  const urlRegex = /(https?:\/\/[^\s)]+)/g
  const matches = gptText.match(urlRegex) || []

  const excludedDomains = [
    'github.com',
    'linkedin.com',
    'youtube.com',
    'facebook.com',
    'ydovzhyk.com',
  ]

  const filteredUrls = matches.filter((url) => {
    try {
      const parsed = new URL(url)
      const hostname = parsed.hostname.replace(/^www\./, '')

      return !excludedDomains.includes(hostname)
    } catch {
      return false
    }
  })

  const newUrls = filteredUrls.map((url) => {

    const matchedProject = projectsData.find((project) => {
      try {
        const inputUrl = new URL(url)
        const demoUrl = new URL(project.demo)

        return (
          inputUrl.hostname === demoUrl.hostname &&
          inputUrl.pathname.replace(/\/$/, '') ===
            demoUrl.pathname.replace(/\/$/, '')
        )
      } catch {
        return false
      }
    })

    return {
      url,
      shotName: matchedProject?.shotName || null,
      addedAt: new Date().toISOString(),
    }
  })

  const userDocRef = db.collection('urls').doc(userId)
  const doc = await userDocRef.get()

  const existingUrls =
    doc.exists && Array.isArray(doc.data()?.urls) ? doc.data().urls : []

  const updatedUrls = [...existingUrls]

  for (const newUrl of newUrls) {
    const alreadyExists = existingUrls.some((u) => u.url === newUrl.url)
    if (!alreadyExists) {
      updatedUrls.push(newUrl)
    }
  }

  await userDocRef.set({ urls: updatedUrls }, { merge: true })

  return {
    success: true,
    found: matches.length,
    saved: updatedUrls.length - existingUrls.length,
    updated: true,
  }
}

