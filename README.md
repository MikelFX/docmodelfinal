# DocMind — AI analyzátor dokumentů

## Rychlý start

### 1. Nainstaluj závislosti
```bash
npm install
```

### 2. Nastav API klíč
Zkopíruj `.env.local.example` jako `.env.local`:
```bash
cp .env.local.example .env.local
```
Pak otevři `.env.local` a vlož svůj Anthropic API klíč:
```
ANTHROPIC_API_KEY=sk-ant-...
```
Klíč získáš na: https://console.anthropic.com/

### 3. Spusť lokálně
```bash
npm run dev
```
Otevři http://localhost:3000

---

## Deploy na Vercel

1. Pushni kód na GitHub
2. Jdi na vercel.com → Import project → vyber repo
3. V nastavení projektu na Vercelu přidej Environment Variable:
   - `ANTHROPIC_API_KEY` = tvůj klíč
4. Deploy!

---

## Struktura projektu

```
docmind/
├── app/
│   ├── api/analyze/route.ts   ← server, volá Anthropic API
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── Analyzer.tsx           ← hlavní UI komponenta
│   └── Analyzer.module.css
├── .env.local                 ← API klíč (NIKDY na GitHub!)
└── .env.local.example
```

## Další kroky
- [ ] Stripe platby pro kredity
- [ ] PDF parsing (pdfjs-dist)
- [ ] Autentizace (Clerk nebo NextAuth)
- [ ] Databáze pro historii dokumentů
