export default function extractUniqueUrlsFromSources(
  tavilyResult,
  exaResult,
  prompt,
  exactUrl,
  memSearch
) {
  const allUrls = new Set()

  // console.log('tavilyResult', tavilyResult)
  // console.log('exaResult', exaResult)
  // console.log('prompt', prompt)
  // console.log('exactUrl', exactUrl)
  // console.log('memSearch', memSearch)


  function extractUrlsFromText(text) {
    const urlRegex = /https?:\/\/[^\s"']+/g
    return [...new Set(text.match(urlRegex) || [])]
  }

  // Prompt
  if (prompt) {
    extractUrlsFromText(prompt).forEach((url) => allUrls.add(url))
  }

  // exactUrl
  if (exactUrl) allUrls.add(exactUrl)

  // Tavily
  tavilyResult?.results?.forEach((r) => {
    const fields = [r.content, r.raw_content, r.title, r.url]
    fields.forEach((field) => {
      if (typeof field === 'string') {
        extractUrlsFromText(field).forEach((url) => allUrls.add(url))
      }
    })
  })

  // Exa — включно з image та favicon!
  exaResult?.results?.forEach((r) => {
    const fields = [
      r.text,
      r.summary,
      r.title,
      r.url,
      r.image, // 👈 додано
      r.favicon, // 👈 додано
    ]
    fields.forEach((field) => {
      if (typeof field === 'string') {
        extractUrlsFromText(field).forEach((url) => allUrls.add(url))
      }
    })
  })

  // Mem0
  memSearch?.forEach((r) => {
    extractUrlsFromText(r.memory).forEach((url) => allUrls.add(url))
  })

  return Array.from(allUrls).map((url) => ({ url, title: url }))
}
