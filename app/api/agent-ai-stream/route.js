import {
  convertToCoreMessages,
  generateObject,
  streamText,
  tool,
  smoothStream,
} from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import Exa from 'exa-js'
import FirecrawlApp from '@mendable/firecrawl-js'
import MemoryClient from 'mem0ai'
import { promtGeneralSearch } from '../../../utils/data/promtGeneralSearch'
import { promtFilterMemo } from '../../../utils/data/promtFilterMemo'

export const runtime = 'edge'

const exa = new Exa(process.env.EXA_API_KEY)
const mem0 = new MemoryClient({ apiKey: process.env.MEM0_API_KEY })
const firecrawlApp = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY,
})

async function filterMemory(prompt, memoryResults) {
  const messages = [
    {
      role: 'user',
      content: `USER QUESTION:\n${prompt}`,
    },
    {
      role: 'assistant',
      content: `MEMORY NOTES:\n${memoryResults}`,
    },
  ]

  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    temperature: 0,
    maxTokens: 300,
    topP: 0.3,
    topK: 7,
    messages,
    system: promtFilterMemo,
    schema: z.object({
      relevant: z.string().describe('Only the relevant memory entries.'),
    }),
  })

  return object.relevant
}

export async function POST(req) {
  const { messages, user_id } = await req.json()
  const prompt = messages
    ?.slice()
    .reverse()
    .find((msg) => msg.role === 'user')?.content

  const finalMessages = [
    { role: 'system', content: promtGeneralSearch },
    { role: 'user', content: prompt },
  ]

  // Пошук памʼяті Mem0
  let memoryResults = ''
  try {
    const memSearch = await mem0.search(prompt, {
      filters: { AND: [{ user_id }] },
      limit: 300,
      api_version: 'v2',
    })

    memoryResults =
      Array.isArray(memSearch) && memSearch.length > 0
        ? memSearch.map((r, i) => `#${i + 1}: ${r.memory}`).join('\n\n')
        : 'No relevant memories found in Mem0.'
  } catch (e) {
    console.error('Mem0 search error:', e.message || e)
    memoryResults = 'No relevant memories found in Mem0.'
  }

  // Додаємо релевантну памʼять, якщо є
  if (memoryResults !== 'No relevant memories found in Mem0.') {
    const filteredMemory = await filterMemory(prompt, memoryResults)
    finalMessages.push({
      role: 'assistant',
      content: `📌 MEMORY:\n${filteredMemory}`,
    })
  }

  // Генерація з тулзами
  const result = await streamText({
    model: openai('gpt-4o'),
    messages: convertToCoreMessages(finalMessages),
    temperature: 0.4,
    toolChoice: 'auto',
    maxSteps: 5,
    tools: [
      tool({
        name: 'web_search',
        description: 'Perform a general web search to answer a question.',
        parameters: z.object({
          query: z.string(),
        }),
        execute: async ({ query }) => {
          try {
            const res = await fetch('https://api.tavily.com/search', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
              },
              body: JSON.stringify({
                query,
                topic: 'general',
                search_depth: 'advanced',
                include_answer: true,
                include_raw_content: true,
                chunks_per_source: 3,
                max_results: 5,
                time_range: null,
                days: 7,
              }),
            })

            const data = await res.json()

            const result = {
              answer: data.answer,
              sources: data.results.map((r) => ({
                title: r.title,
                url: r.url,
                content: r.content?.slice(0, 1000),
              })),
            }

            // console.log(
            //   '✅ Tavily simplified result:',
            //   JSON.stringify(result, null, 2)
            // )
            return result
          } catch (e) {
            console.error('❌ Tavily tool error:', e.message || e)
            return `Error performing web search: ${e.message || e}`
          }
        },
      }),
      tool({
        name: 'retrieve_url',
        description: 'Extract full content from a URL using Firecrawl SDK.',
        parameters: z.object({
          url: z.string().describe('The full URL to extract content from.'),
        }),
        execute: async ({ url }) => {
          try {
            const result = await firecrawlApp.scrapeUrl(url, {
              formats: ['markdown'],
            })

            if (!result.success) {
              throw new Error(`Failed to scrape: ${result.error}`)
            }

            // console.log('🔥 Firecrawl SDK result:', JSON.stringify(result, null, 2))
            return JSON.stringify(result, null, 2)
          } catch (e) {
            console.error('❌ Firecrawl SDK error:', e.message || e)
            return `Error scraping content: ${e.message || e}`
          }
        },
      }),
      tool({
        name: 'summarize_website',
        description: 'Summarize the website content via Exa.',
        parameters: z.object({
          url: z.string(),
        }),
        execute: async ({ url }) => {
          try {
            const res = await exa
              .getContents([url], {
                text: true,
                summary: true,
                livecrawl: 'always',
              })
              .catch(() => ({ results: [] }))

            // console.log('📚 Exa results:', JSON.stringify(res.results, null, 2))

            return JSON.stringify(res.results, null, 2)
          } catch (e) {
            console.error('❌ Exa tool error:', e.message || e)
            return `Error summarizing website: ${e.message || e}`
          }
        },
      }),
    ],
    experimental_transform: smoothStream({
      chunking: 'word',
      delayInMs: 15,
    }),
  })

  // Стрім відправляється у відповідь
  const streamResponse = result.toDataStreamResponse()

  // Паралельно збираємо весь текст у fullReply
  let fullReply = ''

  async function collectReply() {
    try {
      for await (const delta of result.textStream) {
        fullReply += delta
      }
      await mem0.add(
        [
          { role: 'user', content: prompt },
          { role: 'assistant', content: fullReply },
        ],
        {
          user_id,
          org_id: process.env.MEM0_ORG_ID,
          project_id: process.env.MEM0_PROJECT_ID,
          metadata: { question: prompt },
          async_mode: false,
          version: 'v2',
        }
      )
    } catch (e) {
      console.error('Mem0 save error:', e.message || e)
    }
  }

  collectReply()

  return streamResponse
}