import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are Clarix, a sharp AI consultant specializing in business process analysis. Be concise and direct — no padding, no preamble, no filler sentences.

Produce exactly three sections:

## TO-BE Vision

3–4 bullet points. Each bullet = one concrete change in present tense. Name who does what differently, what is removed or automated. No prose paragraphs.

## Success Metrics

A markdown table with columns: **Goal | Metric | Current State | Target | Timeframe**. One row per goal or target the user named. Max 5 rows. Short phrases only — no sentences in cells. If no current state was given, write "Not measured". If no target was given, propose a reasonable estimate and mark it "(est.)".

## Gap Analysis

A markdown table with columns: **Category | Gap | Priority**. Categories: Process, People, Technology, Data. Max 6 rows. Priority = High / Medium / Low. One short phrase per gap.

Then add:

**Critical path** — 1 sentence. Name the single highest-leverage change that unblocks everything else.

Rules: No introductory paragraphs. No closing remarks. Total response under 350 words.`

function formatPayload(body: Record<string, unknown>): string {
  const lines: string[] = []
  const p1 = body.phase1 as Record<string, unknown> | undefined
  const p2 = body.phase2 as Record<string, unknown> | undefined
  const p3 = body.phase3 as Record<string, unknown> | undefined

  lines.push('## Phase 1 — Context & Positioning\n')
  if (p1?.processArea) lines.push(`**Area of focus:** ${p1.processArea}`)
  if (p1?.companyDescription) lines.push(`**Organization:** ${p1.companyDescription}`)
  if (p1?.peopleCount) lines.push(`**People involved:** ${p1.peopleCount}`)
  if (p1?.problemDescription) lines.push(`**Presenting problem:** ${p1.problemDescription}`)
  if (p1?.duration) lines.push(`**Duration:** ${p1.duration}`)
  if (Array.isArray(p1?.goals) && (p1.goals as string[]).length > 0)
    lines.push(`**Goals (prioritized):** ${(p1.goals as string[]).join(', ')}`)
  if (p1?.rootCause) lines.push(`**Root cause hypothesis:** ${p1.rootCause}`)

  lines.push('\n## Phase 2 — AS-IS Analysis\n')
  if (p2?.processSteps) lines.push(`**Process steps:** ${p2.processSteps}`)
  if (p2?.rolesInvolved) lines.push(`**Roles involved:** ${p2.rolesInvolved}`)
  if (p2?.manualSteps) lines.push(`**Manual steps:** ${p2.manualSteps}`)
  if (p2?.bottlenecks) lines.push(`**Bottlenecks:** ${p2.bottlenecks}`)
  if (p2?.hasRedundancies === 'yes')
    lines.push(`**Redundant steps:** ${p2.redundanciesDetail || 'Yes (no details provided)'}`)
  else if (p2?.hasRedundancies === 'no')
    lines.push(`**Redundant steps:** None identified`)
  if (p2?.processTrigger) lines.push(`**Process trigger:** ${p2.processTrigger}`)
  if (p2?.processDeliverable) lines.push(`**Expected deliverable:** ${p2.processDeliverable}`)

  const changes: Record<string, { flag: string; detail: string }> = {
    People: { flag: p2?.hasPeopleChanges as string, detail: p2?.peopleChangesDetail as string },
    Process: { flag: p2?.hasProcessChanges as string, detail: p2?.processChangesDetail as string },
    Technology: { flag: p2?.hasTechChanges as string, detail: p2?.techChangesDetail as string },
    'Culture/Leadership': { flag: p2?.hasCulturalChanges as string, detail: p2?.culturalChangesDetail as string },
    External: { flag: p2?.hasExternalChanges as string, detail: p2?.externalChangesDetail as string },
  }
  const activeChanges = Object.entries(changes).filter(([, v]) => v.flag === 'yes')
  if (activeChanges.length > 0) {
    lines.push('\n**Recent changes:**')
    for (const [category, { detail }] of activeChanges) {
      lines.push(`- ${category}: ${detail || 'Yes (no details provided)'}`)
    }
  }

  lines.push('\n## Phase 3 — Outcome Definition\n')
  if (p3?.successVision) lines.push(`**Success vision (6–12 months):** ${p3.successVision}`)
  if (p3?.targets) lines.push(`**Specific targets:** ${p3.targets}`)
  if (p3?.constraints) lines.push(`**Constraints:** ${p3.constraints}`)

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
          max_tokens: 2500,
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
