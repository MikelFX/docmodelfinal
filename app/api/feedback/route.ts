import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email service unavailable.' }, { status: 503 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : ''
  const email = typeof body.email === 'string' ? body.email.trim().slice(0, 200) : ''
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 5000) : ''

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
  }

  try {
    await resend.emails.send({
      from: 'DocThink Feedback <feedback@docthink.app>',
      to: 'info@docthink.app',
      replyTo: email,
      subject: `Feedback od ${name}`,
      text: `Od: ${name} <${email}>\n\n${message}`,
      html: `<p><strong>Od:</strong> ${name} &lt;${email}&gt;</p><p><strong>Zpráva:</strong></p><p style="white-space:pre-wrap">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to send. Try again later.' }, { status: 502 })
  }
}
