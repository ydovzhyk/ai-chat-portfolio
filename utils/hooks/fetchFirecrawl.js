async function fetchFirecrawl(url) {
  try {
    const res = await fetch('https://api.firecrawl.dev/v2/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
      }),
    })

    const data = await res.json()
    return data?.data?.markdown || data?.markdown || ''
  } catch (e) {
    console.error('❌ Firecrawl error:', e)
    return ''
  }
}
