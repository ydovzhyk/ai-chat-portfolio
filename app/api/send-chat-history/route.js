import { NextResponse } from 'next/server'
import { db } from '../../../lib/firebaseAdmin'
import axios from 'axios'

export async function POST(req) {
  try {
    const { userId } = await req.json()
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const doc = await db.collection('chatHistory').doc(userId).get()
    const messages = doc.exists ? doc.data()?.messages || [] : []

    if (!messages.length) {
      return NextResponse.json({ error: 'No messages' }, { status: 200 })
    }

    const formatted = messages
      .map(
        (m) =>
          `${m.role === 'user' ? '🧑 User' : '🤖 Assistant'}:\n${m.content}`
      )
      .join('\n\n')

    const telegramMessage = `📨 Chat with user [${userId}]:\n\n${formatted}`

    const MAX_LENGTH = 4000
    const chunks =
      telegramMessage.match(new RegExp(`.{1,${MAX_LENGTH}}`, 'gs')) || []

    for (const chunk of chunks) {
      const res = await axios.post(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: chunk,
        }
      )

      if (!res.data.ok) {
        throw new Error('Failed to send a chunk')
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const telegramError =
      err.response?.data || err.message || 'Unknown Telegram error'
    console.error('Telegram Error (detailed):', telegramError)

    return NextResponse.json(
      { error: 'Failed to send chat history', details: telegramError },
      { status: 500 }
    )
  }
}
