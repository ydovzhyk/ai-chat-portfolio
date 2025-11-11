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

// import { NextResponse } from 'next/server'
// import OpenAI from 'openai'
// import Exa from 'exa-js'
// import MemoryClient from 'mem0ai'
// import { openai } from '@ai-sdk/openai'
// import { z } from 'zod'
// import { generateObject } from 'ai'
// import { promtGeneralSearch } from '../../../utils/data/promtGeneralSearch'
// import { promtFilterMemo } from '../../../utils/data/promtFilterMemo'

// const openaiInstance = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
// const exa = new Exa(process.env.EXA_API_KEY)
// const mem0 = new MemoryClient({ apiKey: process.env.MEM0_API_KEY })
// export const runtime = 'edge'

// const tools = [
//   {
//     type: 'function',
//     function: {
//       name: 'web_search',
//       description: 'Perform a general web search to answer a question.',
//       parameters: {
//         type: 'object',
//         properties: {
//           query: {
//             type: 'string',
//             description: 'The user’s search query.',
//           },
//         },
//         required: ['query'],
//       },
//     },
//   },
//   {
//     type: 'function',
//     function: {
//       name: 'retrieve_url',
//       description: 'Extract full content from a URL using Exa or Firecrawl.',
//       parameters: {
//         type: 'object',
//         properties: {
//           url: {
//             type: 'string',
//             description: 'The full URL to extract content from.',
//           },
//         },
//         required: ['url'],
//       },
//     },
//   },
//   {
//     type: 'function',
//     function: {
//       name: 'summarize_website',
//       description:
//         'Analyze what the website is about, who owns it, and its structure.',
//       parameters: {
//         type: 'object',
//         properties: {
//           url: {
//             type: 'string',
//             description: 'Website URL for summarization.',
//           },
//         },
//         required: ['url'],
//       },
//     },
//   },
// ]

// async function filterMemory(prompt, memoryResults) {
//   const messages = [
//     {
//       role: 'user',
//       content: `USER QUESTION:\n${prompt}`,
//     },
//     {
//       role: 'assistant',
//       content: `MEMORY NOTES:\n${memoryResults}`,
//     },
//   ]

//   const { object } = await generateObject({
//     model: openai('gpt-4o-mini'),
//     temperature: 0,
//     maxTokens: 300,
//     topP: 0.3,
//     topK: 7,
//     messages,
//     system: promtFilterMemo,
//     schema: z.object({
//       relevant: z.string().describe('Only the relevant memory entries.'),
//     }),
//   })

//   return object.relevant
// }
// export async function POST(req) {
//   const body = await req.json()
//   const { prompt, userId } = body
//   const messages = []
//   let memoryResults = ''

//   // 1. Шукаємо памʼять по Mem0
//   try {
//     const memSearch = await mem0.search(prompt, {
//       filters: { AND: [{ user_id: userId }] },
//       limit: 300,
//       api_version: 'v2',
//     })
//     memoryResults =
//       Array.isArray(memSearch) && memSearch.length > 0
//         ? memSearch.map((r, i) => `#${i + 1}: ${r.memory}`).join('\n\n')
//         : 'No relevant memories found in Mem0.'
//     // console.log('💾 Mem0 search results:', memoryResults)
//   } catch (e) {
//     console.error('Mem0 search error:', e.message || e)
//     memoryResults = 'No relevant memories found in Mem0.'
//   }

//   // 2.Створюємо `messages`, передаючи памʼять до GPT
//   messages.push({ role: 'system', content: promtGeneralSearch })

//   if (memoryResults !== 'No relevant memories found in Mem0.') {
//     // Якщо памʼять знайдена, фільтруємо її
//     const filteredMemory = await filterMemory(prompt, memoryResults)
//     messages.push({
//       role: 'assistant',
//       content: `📌 MEMORY:\n${filteredMemory}`,
//     })
//   }

//   messages.push({ role: 'user', content: prompt })

//   console.log('📝 Messages for GPT:', messages)

//   // 3. Перший запит GPT для запуску tool
//   const firstRes = await openaiInstance.chat.completions.create({
//     model: 'gpt-4o-mini',
//     messages,
//     tools,
//     tool_choice: 'auto',
//   })

//   const toolCalls = firstRes.choices[0].message.tool_calls

//   // 4. Якщо tool не викликаний — зберігаємо відповідь і повертаємо
//   if (!toolCalls || toolCalls.length === 0) {
//     const reply = firstRes.choices[0].message.content

//     try {
//       await mem0.add(
//         [
//           { role: 'user', content: prompt },
//           { role: 'assistant', content: reply },
//         ],
//         {
//           user_id: userId,
//           org_id: process.env.MEM0_ORG_ID,
//           project_id: process.env.MEM0_PROJECT_ID,
//           metadata: { question: prompt },
//         }
//       )
//     } catch (e) {
//       console.error('Mem0 save error:', e.message || e)
//     }

//     return NextResponse.json({ reply })
//   }

//   // 5. Додаємо assistant (tool_call) та tool-response до messages
//   messages.push(firstRes.choices[0].message)

//   for (const toolCall of toolCalls) {
//     const fnName = toolCall.function.name
//     const args = JSON.parse(toolCall.function.arguments)
//     let toolResultText = ''

//     // 6. Інструменти:
//     if (fnName === 'web_search') {
//       const tavilyRes = await fetch('https://api.tavily.com/search', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${process.env.TAVILY_API_KEY}`,
//         },
//         body: JSON.stringify({
//           query: args.query,
//           topic: 'general',
//           search_depth: 'advanced',
//           include_answer: true,
//           include_raw_content: true,
//           chunks_per_source: 3,
//           max_results: 5,
//           time_range: null,
//           days: 7,
//         }),
//       })
//       const tavilyData = await tavilyRes.json()
//       toolResultText = JSON.stringify(tavilyData, null, 2)
//       // console.log('🧾 Tavily search results:', toolResultText)
//     }

//     if (fnName === 'retrieve_url') {
//       const firecrawl = await fetch('https://api.firecrawl.dev/v1/crawl', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
//         },
//         body: JSON.stringify({
//           url: args.url,
//           include_text: true,
//           include_html: false,
//           include_headers: false,
//         }),
//       })
//       const firecrawlData = await firecrawl.json()
//       toolResultText = JSON.stringify(firecrawlData, null, 2)
//       // console.log('🔥 Firecrawl results:', toolResultText)
//     }

//     if (fnName === 'summarize_website') {
//       const exaResult = await exa
//         .getContents([args.url], {
//           text: true,
//           summary: true,
//           livecrawl: 'always',
//         })
//         .catch((e) => {
//           console.error('Exa error:', e.message || e)
//           return { results: [] }
//         })
//       const exaResults =
//         exaResult.results?.map((item) => {
//           const typedItem = item
//           return {
//             url: item.url,
//             content: typedItem.text || typedItem.summary || '',
//             title:
//               typedItem.title ||
//               item.url.split('/').pop() ||
//               'Retrieved Content',
//             description:
//               typedItem.summary || `Content retrieved from ${item.url}`,
//             author: typedItem.author || undefined,
//             publishedDate: typedItem.publishedDate || undefined,
//             image: typedItem.image || undefined,
//             favicon: typedItem.favicon || undefined,
//             language: 'en',
//           }
//         }) || []
//       toolResultText = JSON.stringify(exaResults, null, 2)
//       // console.log('📚 Exa results:', toolResultText)
//     }

//     messages.push({
//       role: 'tool',
//       tool_call_id: toolCall.id,
//       content: toolResultText,
//     })
//   }

//   // console.log('📝 Updated messages with tool response:', messages)

//   // 7. Робимо фінальний виклик GPT з відповіддю
//   const finalRes = await openaiInstance.chat.completions.create({
//     model: 'gpt-4o-mini',
//     messages,
//   })

//   const reply = finalRes.choices[0].message.content

//   // 8. Зберігаємо в Mem0
//   try {
//     await mem0.add(
//       [
//         { role: 'user', content: prompt },
//         { role: 'assistant', content: reply },
//       ],
//       {
//         user_id: userId,
//         org_id: process.env.MEM0_ORG_ID,
//         project_id: process.env.MEM0_PROJECT_ID,
//         metadata: { question: prompt },
//       }
//     )
//   } catch (e) {
//     console.error('Mem0 save error:', e.message || e)
//   }

//   // 9. Повертаємо відповідь
//   return NextResponse.json({ reply })
// }
