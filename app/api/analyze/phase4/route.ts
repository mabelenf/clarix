import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── Text analysis prompts (unchanged logic) ───────────────────────────────────

const SYSTEM_PROMPT = `You are Clarix, a sharp AI consultant specializing in business process analysis. Be concise and direct — no padding, no preamble, no filler sentences.

Produce exactly two sections:

## TO-BE Process

Numbered steps only. Max 8 steps. Format: \`N. [Role] → [Action]\`. Show what the improved process looks like end-to-end. Flag automated steps with "(automated)". Respect any hard constraints and off-limits items the user specified — do not suggest changes to things marked as off-limits.

## Implementation Timeline

Three sub-sections. Each has a header and a bullet list of max 3 items. One short phrase per bullet — no sentences.

### Quick Wins — Month 1–2
Bullets: changes that can be done immediately with minimal disruption.

### Core Changes — Month 2–4
Bullets: the main structural improvements that require planning.

### Optimization — Month 4–6
Bullets: refinements, automation, and measurement once the core is stable.

Rules: No introductory paragraphs. No closing remarks. Total response under 300 words. Respect every constraint mentioned by the user.`

const SIMPLIFY_PROMPT = `You are Clarix, a sharp AI consultant. The user found the previous TO-BE plan too ambitious. Produce a simpler, more conservative version.

Apply the same two-section structure (## TO-BE Process and ## Implementation Timeline with three sub-sections), but:
- Reduce scope: focus on the 3–5 most impactful changes only, not a full overhaul
- Extend timelines: shift more work to Month 4–6 or beyond
- Prefer process fixes over technology changes
- Prefer changes that require no new budget unless budget was not listed as a constraint
- Keep the same constraints and off-limits items

Same formatting rules: numbered steps, bullet lists, max 300 words, no filler.`

// ── TO-BE diagram data prompt ─────────────────────────────────────────────────

const TOBE_DIAGRAM_PROMPT = `You are Clarix. Based on the business process improvement context, generate TO-BE flowchart data.

Return ONLY a valid JSON object. No preamble, no markdown fences.

Schema:
{
  "toBeFlowchart": {
    "steps": [
      {
        "label": "string (the action, max 48 chars)",
        "role": "string (who does it, max 22 chars)",
        "isNew": boolean,
        "isImproved": boolean,
        "isAutomated": boolean
      }
    ]
  }
}

Rules:
- steps: 4–8 steps covering the complete improved process end-to-end.
- isNew: true only for steps that do not exist in the current AS-IS process.
- isImproved: true for steps that exist in AS-IS but are significantly streamlined or changed.
- isAutomated: true for steps performed by a system with minimal human effort.
- A step can have multiple flags true simultaneously.
- Respect all hard off-limits items from the input — do not change those steps.`

// ── SVG utilities ─────────────────────────────────────────────────────────────

function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function trunc(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

// ── TO-BE Flowchart SVG ───────────────────────────────────────────────────────

type ToBEStep = {
  label: string
  role?: string
  isNew: boolean
  isImproved: boolean
  isAutomated: boolean
}

function buildToBeFlowchartSvg(steps: ToBEStep[]): string {
  const W = 720
  const STEP_W = 520
  const STEP_H = 62
  const GAP = 44
  const STRIDE = STEP_H + GAP
  const PAD_X = (W - STEP_W) / 2
  const PAD_Y = 26
  const CX = W / 2
  const H = PAD_Y * 2 + steps.length * STEP_H + Math.max(0, steps.length - 1) * GAP

  const parts: string[] = []
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%">`)
  parts.push(`<rect width="${W}" height="${H}" fill="#0f172a" rx="12"/>`)

  steps.forEach((step, i) => {
    const y = PAD_Y + i * STRIDE
    const highlighted = step.isNew || step.isImproved
    const fill   = highlighted ? '#052e16' : '#1e293b'
    const stroke = highlighted ? '#22c55e' : '#334155'
    const sw     = highlighted ? '2'       : '1.5'
    const textColor = highlighted ? '#bbf7d0' : '#f1f5f9'

    parts.push(`<rect x="${PAD_X}" y="${y}" width="${STEP_W}" height="${STEP_H}" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`)

    if (step.role) {
      parts.push(`<text x="${CX}" y="${y + 17}" text-anchor="middle" fill="#64748b" font-size="9" font-family="system-ui,sans-serif" font-weight="700" letter-spacing="0.08em">${esc(trunc(step.role.toUpperCase(), 28))}</text>`)
      parts.push(`<text x="${CX}" y="${y + 40}" text-anchor="middle" fill="${textColor}" font-size="13" font-family="system-ui,sans-serif" font-weight="500">${esc(trunc(step.label, 58))}</text>`)
    } else {
      parts.push(`<text x="${CX}" y="${y + 36}" text-anchor="middle" fill="${textColor}" font-size="13" font-family="system-ui,sans-serif" font-weight="500">${esc(trunc(step.label, 58))}</text>`)
    }

    // Left badge: "new" or "improved"
    if (step.isNew) {
      parts.push(`<rect x="${PAD_X + 8}" y="${y + 10}" width="36" height="16" rx="4" fill="#052e16" stroke="#22c55e" stroke-width="1"/>`)
      parts.push(`<text x="${PAD_X + 26}" y="${y + 22}" text-anchor="middle" fill="#4ade80" font-size="9" font-family="system-ui,sans-serif" font-weight="600">new</text>`)
    } else if (step.isImproved) {
      parts.push(`<rect x="${PAD_X + 8}" y="${y + 10}" width="60" height="16" rx="4" fill="#052e16" stroke="#22c55e" stroke-width="1"/>`)
      parts.push(`<text x="${PAD_X + 38}" y="${y + 22}" text-anchor="middle" fill="#4ade80" font-size="9" font-family="system-ui,sans-serif" font-weight="600">improved</text>`)
    }

    // Right badge: "automated"
    if (step.isAutomated) {
      parts.push(`<rect x="${PAD_X + STEP_W - 72}" y="${y + 10}" width="64" height="16" rx="4" fill="#052e16" stroke="#22c55e" stroke-width="1"/>`)
      parts.push(`<text x="${PAD_X + STEP_W - 40}" y="${y + 22}" text-anchor="middle" fill="#4ade80" font-size="9" font-family="system-ui,sans-serif" font-weight="600">automated</text>`)
    }

    if (i < steps.length - 1) {
      const ay = y + STEP_H
      parts.push(`<line x1="${CX}" y1="${ay}" x2="${CX}" y2="${ay + GAP - 14}" stroke="#334155" stroke-width="1.5"/>`)
      parts.push(`<polygon points="${CX - 7},${ay + GAP - 14} ${CX + 7},${ay + GAP - 14} ${CX},${ay + GAP - 4}" fill="#334155"/>`)
    }
  })

  parts.push('</svg>')
  return parts.join('')
}

// ── Payload formatter ─────────────────────────────────────────────────────────

function formatPayload(body: Record<string, unknown>): string {
  const lines: string[] = []
  const p1 = body.phase1 as Record<string, unknown> | undefined
  const p2 = body.phase2 as Record<string, unknown> | undefined
  const p3 = body.phase3 as Record<string, unknown> | undefined
  const p4 = body.phase4 as Record<string, unknown> | undefined

  lines.push('## Phase 1 — Context\n')
  if (p1?.processArea) lines.push(`**Area:** ${p1.processArea}`)
  if (p1?.companyDescription) lines.push(`**Organization:** ${p1.companyDescription}`)
  if (p1?.peopleCount) lines.push(`**People involved:** ${p1.peopleCount}`)
  if (p1?.problemDescription) lines.push(`**Problem:** ${p1.problemDescription}`)
  if (Array.isArray(p1?.goals) && (p1.goals as string[]).length > 0)
    lines.push(`**Goals:** ${(p1.goals as string[]).join(', ')}`)
  if (p1?.rootCause) lines.push(`**Root cause hypothesis:** ${p1.rootCause}`)

  lines.push('\n## Phase 2 — AS-IS\n')
  if (p2?.processSteps) lines.push(`**Steps:** ${p2.processSteps}`)
  if (p2?.bottlenecks) lines.push(`**Bottlenecks:** ${p2.bottlenecks}`)
  if (p2?.manualSteps) lines.push(`**Manual steps:** ${p2.manualSteps}`)
  if (p2?.hasRedundancies === 'yes') lines.push(`**Redundancies:** ${p2.redundanciesDetail || 'Yes'}`)
  if (p2?.processDeliverable) lines.push(`**Deliverable:** ${p2.processDeliverable}`)

  lines.push('\n## Phase 3 — Outcome\n')
  if (p3?.successVision) lines.push(`**Success vision:** ${p3.successVision}`)
  if (p3?.targets) lines.push(`**Targets:** ${p3.targets}`)
  if (p3?.constraints) lines.push(`**Constraints from Phase 3:** ${p3.constraints}`)

  lines.push('\n## Phase 4 — TO-BE Inputs\n')
  if (p4?.directionFeedback) lines.push(`**Direction feedback:** ${p4.directionFeedback}`)

  const selectedConstraints = p4?.constraints as string[] | undefined
  if (selectedConstraints && selectedConstraints.length > 0) {
    const constraintLabels: Record<string, string> = {
      budget: 'Budget limitations',
      technology: 'Technology restrictions',
      regulatory: 'Regulatory requirements',
      capacity: 'Team capacity',
      management: 'Management resistance',
      other: 'Other',
    }
    const labels = selectedConstraints.map(c => constraintLabels[c] ?? c)
    lines.push(`**Organizational constraints:** ${labels.join(', ')}`)
    if (p4?.constraintsOther) lines.push(`**Other constraint detail:** ${p4.constraintsOther}`)
  }

  if (p4?.offLimits) lines.push(`**HARD OFF-LIMITS — do not suggest changes to these:** ${p4.offLimits}`)

  return lines.join('\n')
}

function extractJSON(text: string): unknown {
  const trimmed = text.trim()
  try { return JSON.parse(trimmed) } catch { /* continue */ }
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fence) { try { return JSON.parse(fence[1].trim()) } catch { /* continue */ } }
  const brace = trimmed.match(/\{[\s\S]*\}/)
  if (brace) { try { return JSON.parse(brace[0]) } catch { /* continue */ } }
  throw new Error('Could not parse diagram JSON')
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const simplify = body.simplify === true
  const userMessage = formatPayload(body)

  try {
    const [textMessage, diagramMessage] = await Promise.all([
      client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        system: simplify ? SIMPLIFY_PROMPT : SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
      client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        system: TOBE_DIAGRAM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
    ])

    const markdown = textMessage.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('')

    const diagramRaw = diagramMessage.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('')

    let toBeFlowchartSvg = ''
    try {
      const diagramData = extractJSON(diagramRaw) as {
        toBeFlowchart?: { steps?: ToBEStep[] }
      }
      if (diagramData.toBeFlowchart?.steps && Array.isArray(diagramData.toBeFlowchart.steps)) {
        toBeFlowchartSvg = buildToBeFlowchartSvg(diagramData.toBeFlowchart.steps.slice(0, 8))
      }
    } catch {
      // Diagram is best-effort — don't fail the whole response
    }

    return Response.json({ markdown, toBeFlowchartSvg })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An error occurred.'
    return Response.json({ error: message }, { status: 500 })
  }
}
