import { NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import MemoryClient from 'mem0ai'
import { z } from 'zod'
import { generateObject } from 'ai'
import { promtAskQuestions } from '../../../../utils/data/promtAskQuestions'

const mem0 = new MemoryClient({ apiKey: process.env.MEM0_API_KEY })

export const runtime = 'edge'

export async function POST(req) {
  const body = await req.json()
  const { userId } = body

  try {
    const memHistory = await mem0.search('everything', {
      filters: { AND: [{ user_id: userId }] },
      limit: 500,
      api_version: 'v2',
    })

    if (memHistory.length === 0) return NextResponse.json({ questions: [] })

    const groupedMemories = {}

    for (const entry of memHistory) {
      const question = entry.metadata?.question
      if (!question) continue

      if (!groupedMemories[question]) {
        groupedMemories[question] = []
      }
      groupedMemories[question].push(entry.memory)
    }

    const messages = Object.entries(groupedMemories).flatMap(
      ([question, memories]) => {
        const combinedContext = memories.join('\n')
        return [
          { role: 'user', content: question },
          { role: 'assistant', content: combinedContext },
        ]
      }
    )

    const { object } = await generateObject({
      model: openai('gpt-4o-mini'),
      temperature: 0,
      maxTokens: 300,
      topP: 0.3,
      topK: 7,
      system: promtAskQuestions,
      messages,
      schema: z.object({
        questions: z
          .array(z.string())
          .describe('The generated questions based on the message history.'),
      }),
    })

    return NextResponse.json({ questions: object.questions })
  } catch (error) {
    console.error('Error generating suggestions:', error)
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 })
  }
}
