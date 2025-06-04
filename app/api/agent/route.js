import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import MemoryClient from 'mem0ai'
import Exa from 'exa-js'
import extractUniqueUrlsFromSources from '../../../utils/hooks/extractUniqueUrlsFromSources'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const TAVILY_API_KEY = process.env.TAVILY_API_KEY
const MEM0_API_KEY = process.env.MEM0_API_KEY
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY

const mem0 = new MemoryClient({ apiKey: MEM0_API_KEY })
const exa = new Exa(process.env.EXA_API_KEY)

export const runtime = 'edge'

export async function POST(req) {
  const body = await req.json()
  const { userId, prompt } = body

  const match = prompt.match(/https?:\/\/[^"\s]+/)
  const exactUrl = match ? match[0] : null

  // ⏱ Паралельні запити до Mem0, Exa, Tavily
  const [memSearch, exaResult, tavilyResult] = await Promise.all([
    mem0
      .search(prompt, {
        filters: { AND: [{ user_id: userId }] },
        api_version: 'v2',
      })
      .catch((e) => {
        console.error('Mem0 search error:', e)
        return []
      }),

    exa
      .getContents([exactUrl], {
        text: true,
        summary: true,
        livecrawl: 'always',
      })
      .catch((e) => {
        console.error('Exa error:', e)
        return { results: [] }
      }),

    fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TAVILY_API_KEY}`,
      },
      body: JSON.stringify({
        query: exactUrl || prompt,
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
      .then((res) => res.json())
      .catch((e) => {
        console.error('Tavily search error:', e)
        return { answer: '', results: [] }
      }),
  ])

  // Continue with processing results
  const memoryResults =
    Array.isArray(memSearch) && memSearch.length > 0
    ? memSearch.map((r) => r.memory).join('\n')
    : 'No relevant memories found in Mem0.'

    const exaResults =
      exaResult.results?.map((item) => {
        const typedItem = item
        return {
          url: item.url,
          content: typedItem.text || typedItem.summary || '',
          title:
            typedItem.title || item.url.split('/').pop() || 'Retrieved Content',
          description:
            typedItem.summary || `Content retrieved from ${item.url}`,
          author: typedItem.author || undefined,
          publishedDate: typedItem.publishedDate || undefined,
          image: typedItem.image || undefined,
          favicon: typedItem.favicon || undefined,
          language: 'en',
        }
      }) || []

  const answer = tavilyResult.answer || ''

  const uniqueUrls = extractUniqueUrlsFromSources(
    tavilyResult,
    exaResult,
    prompt,
    exactUrl,
    memSearch
  )

  // console.log('Unique URLs extracted:', uniqueUrls)

  // 🔥 Firecrawl
  const firecrawlContents = await Promise.all(
    uniqueUrls.map(async (r) => {
      try {
        const res = await fetch('https://api.firecrawl.dev/v1/crawl', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          },
          body: JSON.stringify({
            url: r.url,
            include_text: true,
            include_html: false,
            include_headers: true,
          }),
        })
        const data = await res.json()
        return {
          url: r.url,
          title: r.title,
          text: data.text?.slice(0, 3000) || '[NO TEXT]',
        }
      } catch (e) {
        return {
          url: r.url,
          title: r.title,
          text: '[ERROR FETCHING]',
        }
      }
    })
  )

  const messages = [
    {
      role: 'system',
      content: `You are a professional AI web analyst named Insight Agent.

  Your mission is to analyze all available content from a provided link and generate a comprehensive, natural-language summary. You MUST ALWAYS rely on the extracted content first — from Firecrawl, Exa, and Tavily — before writing anything. If no website content is found, use Tavily's summary and Mem0 notes.

  ### Critical Instructions:
  - NEVER ask questions or explain what you're going to do — go straight to the answer.
  - DO NOT summarize your assumptions — present facts from the data directly.
  - DO NOT repeat similar information across sources. Merge and deduplicate.
  - ALWAYS prioritize Firecrawl and Exa for detailed web content.
  - If Firecrawl returns an error or no text, fall back to Exa and Tavily.

  ### Your Tasks:
  1. Extract and clearly explain:
     - What is the site about?
     - Who owns it?
     - What services, products, or content are provided?
     - What technologies or platforms are mentioned?
     - If a portfolio is present: list key projects and what they demonstrate about the author’s skills.

  2. If code snippets describe projects or roles:
     - Extract the project name, tools used, user role, and description in plain language.

  3. Focus on insights, not lists:
     - No bullet points unless absolutely necessary.
     - Avoid numbered or overly structured formats.
     - Write in fluent English paragraphs, like a journalist or web analyst would.

  4. Mention all relevant findings briefly, but go into detail only for the most important elements.

  5. NEVER say "According to search results" or similar — speak as if you're the expert, not quoting others.

  6. If portfolio or projects are mentioned:
     - Highlight what makes them stand out.
     - Emphasize technologies used, challenges solved, and the author's personal role.

  7. Always write in a tone that is professional, fluent, and confident — as if you're preparing a profile or review of the website for a high-level client.

  Respond in English. Today's date is ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}.
  `,
    },
    {
      role: 'user',
      content: `User request: "${prompt}"

  Here is all available source data. Use it all to form your response:

  🧠 Mem0 Notes:
  ${memoryResults}

  🧾 Tavily Summary:
  ${answer}

  📚 Exa Result (1st Item):
  ${JSON.stringify(exaResults[0], null, 2)}

  📄 Firecrawl Extracted Texts:
  ${firecrawlContents
    .filter((item) => item.text && item.text !== '[NO TEXT]')
    .map(
      (item, index) =>
        `#${index + 1} — ${item.title}\n[Visit](${item.url})\n\n${item.text}`
    )
    .join('\n\n')}
  `,
    },
  ]

  console.log('🔍 Messages for GPT:', messages)

  const gptRes = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    temperature: 0.7,
  })

  const reply = gptRes.choices[0].message.content

  try {
    await mem0.add(
      [
        { role: 'user', content: prompt },
        { role: 'assistant', content: reply },
      ],
      {
        user_id: userId,
        org_id: process.env.MEM0_ORG_ID,
        project_id: process.env.MEM0_PROJECT_ID,
        metadata: { question: prompt },
      }
    )
    console.log('✅ Saved to Mem0 successfully!')
  } catch (e) {
    console.error('Mem0 save error:', e)
  }

  return NextResponse.json({ reply })
}


