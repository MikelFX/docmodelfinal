import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

const TIMEOUT_MS = 30_000

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 })

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Chybí OPENROUTER_API_KEY' }, { status: 500 })

  const { content, emailType, recipient, tone, language } = await req.json()
  if (!content) return NextResponse.json({ error: 'Chybí obsah dokumentu.' }, { status: 400 })

  const toneDesc = tone === 'friendly' ? 'přátelský, přímý a lidský' : 'formální, profesionální a zdvořilý'
  const langInstruction = language === 'en' ? 'Write the email in English.' : language === 'de' ? 'Schreibe die E-Mail auf Deutsch.' : 'Napiš email v češtině.'

  const typePrompts: Record<string, string> = {
    followup: 'Follow-up email po meetingu nebo schůzce — shrň klíčové závěry, domluvy a next steps.',
    response: 'Odpověď na stížnost nebo reklamaci — empatická, konstruktivní, nabídni řešení.',
    proposal: 'Obchodní nabídka nebo návrh spolupráce — přesvědčivá, jasné benefity, výzva k akci.',
    reminder: 'Připomínka deadline nebo nesplněného úkolu — zdvořilá, ale jasná a konkrétní.',
    request: 'Žádost o informace, podklady nebo spolupráci — stručná, zdůvodni proč a co přesně potřebuješ.',
  }

  const typeDesc = typePrompts[emailType] ?? 'Profesionální email na základě dokumentu.'
  const recipientLine = recipient ? `Příjemce / adresát: ${recipient}` : ''

  const userMessage = `Napiš email na základě tohoto dokumentu.

Typ emailu: ${typeDesc}
Tón: ${toneDesc}
${recipientLine}
${langInstruction}

Formát výstupu (dodržuj přesně):
Předmět: [předmět emailu]

[tělo emailu — oslovení, obsah, závěr, podpis "S pozdravem, [Jméno]"]

DOKUMENT:
${content.slice(0, 3500)}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://docthink.vercel.app',
        'X-Title': 'DocThink',
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
        max_tokens: 1200,
        messages: [
          { role: 'system', content: 'Jsi expert na psaní profesionálních emailů. Píšeš přesvědčivé, jasné emaily přizpůsobené kontextu. Nikdy nepíšeš <think> bloky — jen hotový email.' },
          { role: 'user', content: userMessage },
        ],
      }),
      signal: controller.signal,
    })

    clearTimeout(timer)
    const data = await response.json()
    if (!response.ok) return NextResponse.json({ error: data.error?.message ?? 'Chyba AI' }, { status: 502 })

    let result: string = data.choices?.[0]?.message?.content ?? ''
    result = result.replace(/<think>[\s\S]*?<\/think>/g, '').replace(/<think>[\s\S]*/g, '').trim()
    if (!result) return NextResponse.json({ error: 'AI vrátilo prázdnou odpověď.' }, { status: 502 })

    return NextResponse.json({ result })
  } catch (err: any) {
    clearTimeout(timer)
    if (err.name === 'AbortError') return NextResponse.json({ error: 'Časový limit vypršel. Zkus znovu.' }, { status: 504 })
    return NextResponse.json({ error: 'Chyba serveru.' }, { status: 502 })
  }
}
