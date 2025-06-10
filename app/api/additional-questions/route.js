import { NextResponse } from 'next/server'
import { openai } from '@ai-sdk/openai'
import MemoryClient from 'mem0ai'
import { z } from 'zod'
import { generateObject } from 'ai'

const mem0 = new MemoryClient({ apiKey: process.env.MEM0_API_KEY })

export const runtime = 'edge'

export async function POST(req) {
  const body = await req.json()
  const { userId, usedQuestions = [] } = body

  const usedQuestionsText = usedQuestions.length
    ? usedQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')
    : ''

const promtAskQuestions = `You are a search engine query/questions generator. You MUST create EXACTLY 2 questions for the search engine based on the message history.

### Question Generation Guidelines:
- Create exactly 2 questions that are open-ended and encourage further discussion
- Questions must be concise (5-10 words each) but specific and contextually relevant
- Each question must contain specific nouns, entities, or clear context markers
- NEVER use pronouns (he, she, him, his, her, etc.) - always use proper nouns from the context
- Questions must be related to tools available in the system
- Questions should flow naturally from previous conversation
- Generated questions must match the language of the user's original query. Detect the user's language automatically and formulate the questions in that same language. Do not use English unless explicitly requested.

### Tool-Specific Question Types:
- Web search: Focus on factual information, current events, or general knowledge

### Formatting Requirements:
- No bullet points, numbering, or prefixes
- No quotation marks around questions
- Each question must be grammatically complete
- Each question must end with a question mark
- Questions must be diverse and not redundant
- Do not include instructions or meta-commentary in the questions

### Important:
Below is a list of previously used questions. DO NOT repeat them. Your newly generated questions MUST be completely different.

${usedQuestionsText}
`

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