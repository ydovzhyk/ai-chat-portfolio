async function fetchFirecrawl(url) {
  try {
    const res = await fetch('https://api.firecrawl.dev/v1/crawl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
      },
      body: JSON.stringify({
        url,
        include_html: false,
        include_text: true,
        include_headers: true,
      }),
    })

    const data = await res.json()
    return data.text || ''
  } catch (e) {
    console.error('❌ Firecrawl error:', e)
    return ''
  }
}
