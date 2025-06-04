import { db } from '../../../lib/firebaseAdmin'

export async function POST(req) {
  try {
    const { userId } = await req.json()

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), {
        status: 400,
      })
    }

    const doc = await db.collection('urls').doc(userId).get()

    if (!doc.exists) {
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const data = doc.data()
    const userUrls = Array.isArray(data.urls) ? data.urls : []

    return new Response(JSON.stringify(userUrls), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in /api/urls:', error.message)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}