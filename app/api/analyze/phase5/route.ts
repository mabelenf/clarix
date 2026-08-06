import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `Return ONLY a JSON object. No text outside JSON.
{"gaps":[{"id":"gap-1","name":"6 words max","actionTitle":"verb-first 8 words max","category":"People|Process|Technology|Culture|External","impact":"High|Medium|Low","effort":"High|Medium|Low","cost":"High|Medium|Low","classification":"Quick Win|Strategic|Low Priority|Reconsider","explanation":"10 words max","impactReason":"8 words max","effortReason":"8 words max","costReason":"8 words max"}]}
Max 6 gaps. Quick Win=High/Medium impact+Low effort. Strategic=High impact+Medium/High effort. Skip off-limits items.`

function formatPayload(body: Record<string, unknown>): string {
  const lines: string[] = []
  const p1 = body.phase1 as Record<string, unknown> | undefined
  const p2 = body.phase2 as Record<string, unknown> | undefined
  const p3 = body.phase3 as Record<string, unknown> | undefined
  const p4 = body.phase4 as Record<string, unknown> | undefined

  if (p1?.processArea) lines.push(`Area: ${p1.processArea}`)
  if (p1?.problemDescription) lines.push(`Problem: ${p1.problemDescription}`)
  if (Array.isArray(p1?.goals)) lines.push(`Goals: ${(p1.goals as string[]).join(', ')}`)

  if (p2?.processSteps) lines.push(`Current process: ${p2.processSteps}`)
  if (p2?.bottlenecks) lines.push(`Bottlenecks: ${p2.bottlenecks}`)
  if (p2?.manualSteps) lines.push(`Manual steps: ${p2.manualSteps}`)
  if (p2?.hasRedundancies === 'yes') lines.push(`Redundancies: ${p2.redundanciesDetail || 'Yes'}`)

  if (p3?.successVision) lines.push(`Success vision: ${p3.successVision}`)
  if (p3?.targets) lines.push(`Targets: ${p3.targets}`)

  if (p4?.directionFeedback) lines.push(`Direction feedback: ${p4.directionFeedback}`)

  const constraints = p4?.constraints as string[] | undefined
  if (constraints && constraints.length > 0) {
    lines.push(`Constraints: ${constraints.join(', ')}${p4?.constraintsOther ? ` — ${p4.constraintsOther}` : ''}`)
  }
  if (p4?.offLimits) lines.push(`OFF-LIMITS (do not create gaps for these): ${p4.offLimits}`)

  return lines.join('\n')
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const userMessage = formatPayload(body)
  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const stream = await client.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: 600,
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
        console.error('[phase5] Anthropic API error:', err)
        const message = err instanceof Error ? err.message : 'API call failed.'
        controller.enqueue(encoder.encode('\x00' + JSON.stringify({ error: message })))
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
