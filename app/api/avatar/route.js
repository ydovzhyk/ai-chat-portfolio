export async function GET() {
  try {
    const timestamp = Date.now()
    const avatarUrl = `https://robohash.org/${timestamp}.png?set=set3&size=100x100`
    return Response.json({ url: avatarUrl })
  } catch (error) {
    console.error('Error generating avatar URL:', error)
    return new Response('Error generating avatar', { status: 500 })
  }
}
