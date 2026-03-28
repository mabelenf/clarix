import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are Clarix, a sharp AI consultant specializing in business process analysis. Be concise and direct — no padding, no preamble.

The user has just completed Phase 1. Respond with exactly two parts:

1. **Situation summary** — 3 bullet points max. Confirm what you understand about their process, the problem, and what they want to achieve. One sentence per bullet.

2. **What comes next** — One short sentence telling them Phase 2 will map the current process in detail.

Rules: No long paragraphs. No pleasantries. Short sentences. Total response under 120 words.`

function formatPhase1(data: Record<string, unknown>): string {
  const lines: string[] = ['The user has completed Phase 1 — Context & Positioning. Here are their responses:\n']

  if (data.processArea)
    lines.push(`**Area of focus:** ${data.processArea}`)

  if (data.companyDescription)
    lines.push(`**Organization description:** ${data.companyDescription}`)

  if (data.peopleCount)
    lines.push(`**People involved in the process:** ${data.peopleCount}`)

  if (data.problemDescription)
    lines.push(`**Problem or situation that brought them here:** ${data.problemDescription}`)

  if (data.duration)
    lines.push(`**How long this has been going on:** ${data.duration}`)

  if (Array.isArray(data.goals) && data.goals.length > 0)
    lines.push(`**Main goals (in priority order):** ${(data.goals as string[]).join(', ')}`)

  if (data.rootCause)
    lines.push(`**Their hypothesis on root cause:** ${data.rootCause}`)

  return lines.join('\n')
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const userMessage = formatPhase1(body)

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = await client.messages.stream({
          model: 'claude-sonnet-4-5',
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userMessage }],
        })

        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred.'
        controller.enqueue(encoder.encode(`\n\n[Error: ${message}]`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  })
}
