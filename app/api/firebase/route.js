import { NextResponse } from 'next/server'
import { db } from '../../../lib/firebaseAdmin'
import { openai } from '../../../lib/openai'
import { promptContent } from '../../../utils/data/promtContent'
import { saveUrlsFromGptReply } from '../../../utils/hooks/saveUrlsFromGptReply'

export async function POST(req) {
  try {
    const body = await req.json()
    const { userId, message, key } = body

    if (!userId || !message || !key) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const chatRef = db.collection('chatHistory').doc(userId)
    const doc = await chatRef.get()
    const existingMessages = doc.exists ? doc.data().messages || [] : []

    if (!existingMessages.some((m) => m.key === key)) {
      existingMessages.push({ role: 'user', content: message, key })
    }

    const lastMessages = existingMessages
      .slice(-20)
      .map(({ role, content }) => ({ role, content }))

    const systemPrompt = {
      role: 'system',
      content: promptContent,
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [systemPrompt, ...lastMessages],
      temperature: 0.7,
      stream: true,
    })

    let assistantReply = ''

    for await (const chunk of completion) {
      const delta = chunk.choices?.[0]?.delta?.content
      if (delta) assistantReply += delta
    }

    await saveUrlsFromGptReply(assistantReply, userId)

    existingMessages.push({
      role: 'assistant',
      content: assistantReply,
      key,
    })

    await chatRef.set({ messages: existingMessages }, { merge: true })

    return NextResponse.json({ reply: assistantReply })
  } catch (error) {
    console.error('Error in /api/firebase:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    )
  }
}