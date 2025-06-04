import { randomUUID } from 'crypto'
import fs from 'fs'
import { unlink, writeFile } from 'fs/promises'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import os from 'os'
import path from 'path'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req) {
  try {
    const formData = await req.formData()
    const file = formData.get('audio')

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Invalid file' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${randomUUID()}.webm`
    const tmpDir = os.tmpdir()
    const filepath = path.join(tmpDir, filename)

    await writeFile(filepath, buffer)

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filepath),
      model: 'whisper-1',
      response_format: 'verbose_json',
    })

    const transcript = transcription.text || ''
    const detectedLang = transcription.language

    await unlink(filepath)

    if (detectedLang === 'russian') {
      const translation = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a translator. Always translate only from Russian to Ukrainian. Do not explain anything, just translate.',
          },
          {
            role: 'user',
            content: transcript,
          },
        ],
      })

      const translated = translation.choices[0]?.message?.content?.trim() || ''
      return NextResponse.json({ text: translated })
    }

    return NextResponse.json({ text: transcript })
  } catch (e) {
    console.error('[Transcription Error]', e)
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
}