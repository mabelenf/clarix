import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are Clarix, a business process analyst. Analyze the data provided and identify the most important gaps between the current state (AS-IS) and the desired future state (TO-BE).

Return ONLY a valid JSON object — no preamble, no explanation, no markdown code fences. The output must be parseable by JSON.parse().

Schema:
{
  "gaps": [
    {
      "id": "gap-1",
      "name": "string (max 6 words — describes the problem, e.g. 'No standard approval workflow')",
      "actionTitle": "string (max 8 words — starts with a verb, e.g. 'Implement standard approval workflow')",
      "category": "People" | "Process" | "Technology" | "Culture" | "External",
      "impact": "High" | "Medium" | "Low",
      "effort": "High" | "Medium" | "Low",
      "cost": "High" | "Medium" | "Low",
      "classification": "Quick Win" | "Strategic" | "Low Priority" | "Reconsider",
      "explanation": "string (max 20 words — what this gap means in plain language)",
      "impactReason": "string (max 20 words — why impact is rated High/Medium/Low)",
      "effortReason": "string (max 20 words — why effort is rated High/Medium/Low)",
      "costReason": "string (max 20 words — why cost is rated High/Medium/Low)"
    }
  ]
}

Classification rules (apply strictly):
- Quick Win: High or Medium impact AND Low effort
- Strategic: High impact AND Medium or High effort
- Low Priority: Low impact, any effort
- Reconsider: Low or Medium impact AND High effort

Guidelines:
- Return 5–8 gaps. Never more than 8.
- Focus on the gaps most relevant to the user's stated goals.
- Gap names must be specific and descriptive — not "process issue" but "No standard approval workflow".
- Consider constraints and off-limits items: do not create gaps for things the user marked as off-limits.
- Distribute across categories where the data supports it — avoid listing all gaps under one category.
- Impact = how much fixing this gap contributes to the user's goals.
- Effort = how hard it is to close the gap (time, complexity, change management).
- Cost = financial cost to close the gap.`

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

function extractJSON(text: string): unknown {
  const trimmed = text.trim()
  try {
    return JSON.parse(trimmed)
  } catch {
    const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (fence) return JSON.parse(fence[1].trim())
    const brace = trimmed.match(/\{[\s\S]*\}/)
    if (brace) return JSON.parse(brace[0])
    throw new Error('Could not parse JSON from model response')
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const userMessage = formatPayload(body)

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const raw = message.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('')

    const parsed = extractJSON(raw) as { gaps: unknown[] }

    if (!parsed?.gaps || !Array.isArray(parsed.gaps)) {
      return Response.json({ error: 'Unexpected response format from model.' }, { status: 500 })
    }

    return Response.json(parsed)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An error occurred.'
    return Response.json({ error: message }, { status: 500 })
  }
}
