import { db } from '../../../lib/firebaseAdmin'

export async function POST(req) {
  try {
    const { userId, url } = await req.json()

    if (!userId || !url) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400,
      })
    }

    const docRef = db.collection('urls').doc(userId)
    const doc = await docRef.get()

    if (!doc.exists) {
      return new Response(JSON.stringify({ error: 'Document not found' }), {
        status: 404,
      })
    }

    const currentUrls = doc.data().urls || []

    const updatedUrls = currentUrls.filter((entry) => entry.url !== url)

    await docRef.update({ urls: updatedUrls })

    return new Response(JSON.stringify({ success: true }))
  } catch (err) {
    console.error('Error in /api/delete-url:', err)
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
    })
  }
}