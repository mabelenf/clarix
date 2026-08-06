import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ── Text analysis prompt (same as before) ────────────────────────────────────

const TEXT_PROMPT = `You are Clarix, a sharp AI consultant specializing in business process analysis. Be concise and direct — no padding, no preamble, no filler sentences.

Produce exactly two sections:

## AS-IS Process Flowchart

Numbered steps only. Format: \`N. [Role] → [Action] (manual/automated)\`. Max 8 steps. Flag decision points inline with "(decision)". No prose.

## Cause & Effect Analysis

Use a markdown table with columns: **Category | Factor | Impact**. Max 8 rows total across all categories. Categories: People, Process, Technology, Management, External. Only include categories with real evidence from the data. One short phrase per cell — no sentences.

Then add:

**Summary** — 2 sentences max. Name the single biggest dysfunction and its most likely root cause. Plain language, no jargon.

Rules: No introductory paragraphs. No closing remarks. Total response under 300 words.`

// ── Diagram data prompt ───────────────────────────────────────────────────────

const DIAGRAM_PROMPT = `You are Clarix. Based on the business process data, return ONLY a valid JSON object for diagram generation. No preamble, no markdown fences.

Schema:
{
  "flowchart": {
    "steps": [
      {
        "label": "string (the action, max 50 chars)",
        "role": "string (who does it, max 22 chars)",
        "isBottleneck": boolean,
        "isManual": boolean
      }
    ]
  },
  "ishikawa": {
    "problem": "string (the core problem, max 30 chars)",
    "People": ["short cause phrase", ...],
    "Process": ["short cause phrase", ...],
    "Technology": ["short cause phrase", ...],
    "Culture": ["short cause phrase", ...],
    "External": ["short cause phrase", ...]
  }
}

Rules:
- flowchart.steps: 4–8 steps only. Mirror the user's actual process steps.
- isBottleneck: true only for steps the user explicitly described as slow, stuck, or error-prone.
- isManual: true for steps the user described as manual.
- Each cause array: max 3 items, each max 5 words. Use only evidence from the input — do not invent.
- If a category has no evidence, use an empty array [].
- problem: a short noun phrase (e.g. "Slow approval cycle").`

// ── SVG generation ────────────────────────────────────────────────────────────

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

type FlowStep = {
  label: string
  role?: string
  isBottleneck: boolean
  isManual: boolean
}

function buildFlowchartSvg(steps: FlowStep[]): string {
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
    const fill = step.isBottleneck ? '#431407' : '#1e293b'
    const stroke = step.isBottleneck ? '#f97316' : '#334155'
    const sw = step.isBottleneck ? '2' : '1.5'
    const textColor = step.isBottleneck ? '#fed7aa' : '#f1f5f9'

    parts.push(`<rect x="${PAD_X}" y="${y}" width="${STEP_W}" height="${STEP_H}" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`)

    if (step.role) {
      parts.push(`<text x="${CX}" y="${y + 17}" text-anchor="middle" fill="#64748b" font-size="9" font-family="system-ui,sans-serif" font-weight="700" letter-spacing="0.08em">${esc(trunc(step.role.toUpperCase(), 28))}</text>`)
      parts.push(`<text x="${CX}" y="${y + 40}" text-anchor="middle" fill="${textColor}" font-size="13" font-family="system-ui,sans-serif" font-weight="500">${esc(trunc(step.label, 60))}</text>`)
    } else {
      parts.push(`<text x="${CX}" y="${y + 36}" text-anchor="middle" fill="${textColor}" font-size="13" font-family="system-ui,sans-serif" font-weight="500">${esc(trunc(step.label, 60))}</text>`)
    }

    if (step.isManual) {
      parts.push(`<rect x="${PAD_X + STEP_W - 62}" y="${y + 10}" width="52" height="16" rx="4" fill="#0c2044" stroke="#3b82f6" stroke-width="1"/>`)
      parts.push(`<text x="${PAD_X + STEP_W - 36}" y="${y + 22}" text-anchor="middle" fill="#93c5fd" font-size="9" font-family="system-ui,sans-serif">manual</text>`)
    }

    if (step.isBottleneck) {
      parts.push(`<rect x="${PAD_X + 8}" y="${y + 10}" width="60" height="16" rx="4" fill="#431407" stroke="#f97316" stroke-width="1"/>`)
      parts.push(`<text x="${PAD_X + 38}" y="${y + 22}" text-anchor="middle" fill="#fb923c" font-size="9" font-family="system-ui,sans-serif">bottleneck</text>`)
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

type IshikawaData = {
  problem: string
  People?: string[]
  Process?: string[]
  Technology?: string[]
  Culture?: string[]
  External?: string[]
}

function buildIshikawaSvg(data: IshikawaData): string {
  const W = 1200
  const H = 600
  const SPINE_Y = 300
  const SPINE_X1 = 200
  const SPINE_X2 = 1020

  const COLORS: Record<string, string> = {
    People: '#3b82f6',
    Process: '#22c55e',
    Technology: '#a855f7',
    Culture: '#f59e0b',
    External: '#ef4444',
  }

  // 3 branches above, 2 below. spineX = where the bone meets the spine.
  // Positioned so the leftmost bone (People) ends at x=155, well within canvas.
  const BRANCHES: { cat: string; spineX: number; above: boolean }[] = [
    { cat: 'People',     spineX: 285, above: true  },
    { cat: 'Process',    spineX: 440, above: false },
    { cat: 'Technology', spineX: 595, above: true  },
    { cat: 'Culture',    spineX: 730, above: false },
    { cat: 'External',   spineX: 875, above: true  },
  ]
  // Bone arm: −130 in x, ±155 in y
  const BONE_DX = -130
  const BONE_DY = 155

  // Rib direction: perpendicular to the bone, pointing outward from the spine.
  // Above bone vector ≈ (−130, −155) → outward perp = (+0.766, −0.643) × 40px ≈ (+31, −26)
  // Below bone vector ≈ (−130, +155) → outward perp = (+0.766, +0.643) × 40px ≈ (+31, +26)
  // Using text-anchor="start" so all text extends rightward — never clips left edge.
  const RIB_DX = 31
  const RIB_DY_ABOVE = -26
  const RIB_DY_BELOW = 26

  const parts: string[] = []
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="100%">`)
  parts.push(`<rect width="${W}" height="${H}" fill="#0f172a" rx="12"/>`)

  // Spine
  parts.push(`<line x1="${SPINE_X1}" y1="${SPINE_Y}" x2="${SPINE_X2}" y2="${SPINE_Y}" stroke="#475569" stroke-width="2.5"/>`)
  parts.push(`<polygon points="${SPINE_X2},${SPINE_Y - 7} ${SPINE_X2 + 14},${SPINE_Y} ${SPINE_X2},${SPINE_Y + 7}" fill="#475569"/>`)

  // Problem box — fits within x=1038–1192, well inside W=1200
  const PB_W = 154, PB_H = 66
  const PB_X = SPINE_X2 + 18
  const PB_Y = SPINE_Y - PB_H / 2
  parts.push(`<rect x="${PB_X}" y="${PB_Y}" width="${PB_W}" height="${PB_H}" rx="8" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>`)
  const prob = data.problem || 'Main Problem'
  const probWords = prob.split(' ')
  const probMid = Math.ceil(probWords.length / 2)
  const pl1 = probWords.slice(0, probMid).join(' ')
  const pl2 = probWords.slice(probMid).join(' ')
  const pcx = PB_X + PB_W / 2
  if (pl2) {
    parts.push(`<text x="${pcx}" y="${PB_Y + 24}" text-anchor="middle" fill="#f1f5f9" font-size="11" font-family="system-ui,sans-serif" font-weight="600">${esc(pl1)}</text>`)
    parts.push(`<text x="${pcx}" y="${PB_Y + 44}" text-anchor="middle" fill="#f1f5f9" font-size="11" font-family="system-ui,sans-serif" font-weight="600">${esc(pl2)}</text>`)
  } else {
    parts.push(`<text x="${pcx}" y="${PB_Y + 37}" text-anchor="middle" fill="#f1f5f9" font-size="11" font-family="system-ui,sans-serif" font-weight="600">${esc(pl1)}</text>`)
  }

  BRANCHES.forEach(({ cat, spineX, above }) => {
    const color = COLORS[cat]
    const causes = ((data[cat as keyof IshikawaData] as string[] | undefined) ?? []).slice(0, 3)
    const endX = spineX + BONE_DX
    const endY = above ? SPINE_Y - BONE_DY : SPINE_Y + BONE_DY
    const ribDy = above ? RIB_DY_ABOVE : RIB_DY_BELOW

    // Bone
    parts.push(`<line x1="${spineX}" y1="${SPINE_Y}" x2="${endX}" y2="${endY}" stroke="${color}" stroke-width="2"/>`)

    // Category label — centred on bone tip, clear of causes
    const labelY = above ? endY - 14 : endY + 20
    parts.push(`<text x="${endX}" y="${labelY}" text-anchor="middle" fill="${color}" font-size="12" font-family="system-ui,sans-serif" font-weight="700">${esc(cat)}</text>`)

    // Cause ribs — extend outward (perpendicular to bone) so text always goes right
    const N = causes.length
    causes.forEach((cause, ci) => {
      const t = N === 1 ? 0.5 : 0.2 + 0.6 * ci / Math.max(N - 1, 1)
      const px = Math.round(spineX + t * (endX - spineX))
      const py = Math.round(SPINE_Y + t * (endY - SPINE_Y))
      const rx = px + RIB_DX
      const ry = py + ribDy
      parts.push(`<line x1="${px}" y1="${py}" x2="${rx}" y2="${ry}" stroke="${color}" stroke-width="1.2" opacity="0.6"/>`)
      parts.push(`<text x="${rx + 4}" y="${ry + 4}" text-anchor="start" fill="#cbd5e1" font-size="11" font-family="system-ui,sans-serif">${esc(cause)}</text>`)
    })
  })

  parts.push('</svg>')
  return parts.join('')
}

// ── Payload formatter ─────────────────────────────────────────────────────────

function formatPayload(body: Record<string, unknown>): string {
  const lines: string[] = []
  const p1 = body.phase1 as Record<string, unknown> | undefined
  const p2 = body.phase2 as Record<string, unknown> | undefined

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
  if (p2?.processDeliverable) lines.push(`**Expected deliverable:** ${p2.processDeliverable}`)

  lines.push('\n### Recent Changes\n')
  const changes: Record<string, { flag: string; detail: string }> = {
    People: { flag: p2?.hasPeopleChanges as string, detail: p2?.peopleChangesDetail as string },
    Process: { flag: p2?.hasProcessChanges as string, detail: p2?.processChangesDetail as string },
    Technology: { flag: p2?.hasTechChanges as string, detail: p2?.techChangesDetail as string },
    'Culture/Leadership': { flag: p2?.hasCulturalChanges as string, detail: p2?.culturalChangesDetail as string },
    External: { flag: p2?.hasExternalChanges as string, detail: p2?.externalChangesDetail as string },
  }
  for (const [category, { flag, detail }] of Object.entries(changes)) {
    if (flag === 'yes') lines.push(`**${category} changes:** ${detail || 'Yes (no details provided)'}`)
    else if (flag === 'no') lines.push(`**${category} changes:** None`)
  }

  const docs = p2?.supportingDocuments as Array<{ name: string }> | undefined
  if (docs && docs.length > 0)
    lines.push(`\n**Supporting documents provided:** ${docs.map(d => d.name).join(', ')}`)

  return lines.join('\n')
}

function extractJSON(text: string): unknown {
  const trimmed = text.trim()
  try { return JSON.parse(trimmed) } catch { /* continue */ }
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fence) { try { return JSON.parse(fence[1].trim()) } catch { /* continue */ } }
  const brace = trimmed.match(/\{[\s\S]*\}/)
  if (brace) { try { return JSON.parse(brace[0]) } catch { /* continue */ } }
  throw new Error('Could not parse diagram JSON from model response')
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const userMessage = formatPayload(body)

  try {
    // Run text analysis and diagram data extraction in parallel
    const [textMessage, diagramMessage] = await Promise.all([
      client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 3000,
        system: TEXT_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      }),
      client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1200,
        system: DIAGRAM_PROMPT,
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

    let flowchartSvg = ''
    let ishikawaSvg = ''

    try {
      const diagramData = extractJSON(diagramRaw) as {
        flowchart?: { steps?: FlowStep[] }
        ishikawa?: IshikawaData
      }
      if (diagramData.flowchart?.steps && Array.isArray(diagramData.flowchart.steps)) {
        flowchartSvg = buildFlowchartSvg(diagramData.flowchart.steps.slice(0, 8))
      }
      if (diagramData.ishikawa) {
        ishikawaSvg = buildIshikawaSvg(diagramData.ishikawa)
      }
    } catch {
      // Diagrams are best-effort — don't fail the whole response
    }

    return Response.json({ markdown, flowchartSvg, ishikawaSvg })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An error occurred.'
    return Response.json({ error: message }, { status: 500 })
  }
}
