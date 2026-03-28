import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `Return ONLY a JSON object. No text outside JSON.
{"actions":[{"gapId":"gap-1","gapName":"string","actionTitle":"verb-first 8 words max","category":"People|Process|Technology|Culture|External","classification":"Quick Win|Strategic|Low Priority|Reconsider","problemStatement":"1 sentence","recommendation":"1 sentence","responsibleRole":"job title","steps":["phrase","phrase","phrase"],"timeline":"Week 1–2 or Month N","expectedBenefit":"1 sentence","kpi":"one metric"}],"changeManagement":{"keyStakeholders":["role"],"resistanceItems":[{"stakeholder":"string","concern":"short phrase","response":"short phrase"}],"communicationPlan":["phrase","phrase","phrase"]}}
Rules: one action per gap, Quick Wins first. steps: max 3 items. keyStakeholders: 3–4 roles. resistanceItems: 2–3. communicationPlan: exactly 3. Use context from input.`

// ── Gantt chart SVG ───────────────────────────────────────────────────────────

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

// Map a timeline string like "Week 1–2", "Month 2–3", "Month 4–6" to
// a [startCol, endCol] pair (0-indexed, inclusive) across 6 columns:
//   0 = Wk 1–2  |  1 = Wk 3–4  |  2 = Mo 2  |  3 = Mo 3  |  4 = Mo 4  |  5 = Mo 5–6
function parseTimeline(raw: string): [number, number] {
  const t = raw.toLowerCase().replace(/[–—]/g, '-')
  const nums = (t.match(/\d+/g) ?? []).map(Number)
  if (nums.length === 0) return [0, 0]
  const lo = Math.min(...nums)
  const hi = Math.max(...nums)

  if (t.includes('week') || t.includes('wk')) {
    return [lo <= 2 ? 0 : 1, hi <= 2 ? 0 : 1]
  }

  const monthToCol = (m: number): number => {
    if (m <= 1) return 1   // end of month 1 → col 1 (Wk 3-4)
    if (m === 2) return 2
    if (m === 3) return 3
    if (m === 4) return 4
    return 5               // month 5-6
  }

  const startCol = lo <= 1 ? 0 : monthToCol(lo)
  const endCol   = monthToCol(hi)
  return [startCol, Math.max(startCol, endCol)]
}

type GanttRow = {
  gapName: string
  timeline: string
  classification: string
}

function buildGanttSvg(actions: GanttRow[]): string {
  // Only Quick Wins and Strategic; max 10 rows
  const rows = actions
    .filter(a => a.classification === 'Quick Win' || a.classification === 'Strategic')
    .filter(a => typeof a.gapName === 'string' && typeof a.timeline === 'string')
    .slice(0, 10)
  if (rows.length === 0) return ''

  const PAD_L     = 20
  const PAD_R     = 20
  const PAD_Y     = 16
  const LABEL_W   = 210
  const COL_COUNT = 6
  const CHART_W   = 630
  const COL_W     = CHART_W / COL_COUNT   // 105
  const HEADER_H  = 44
  const ROW_H     = 40
  const BAR_H     = 24
  const BAR_INSET = 3
  const TOTAL_W   = PAD_L + LABEL_W + CHART_W + PAD_R
  const H         = PAD_Y + HEADER_H + rows.length * ROW_H + PAD_Y
  const CHART_X   = PAD_L + LABEL_W

  const COLS = ['Wk 1–2', 'Wk 3–4', 'Mo 2', 'Mo 3', 'Mo 4', 'Mo 5–6']

  const parts: string[] = []
  parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TOTAL_W} ${H}" width="100%">`)
  parts.push(`<rect width="${TOTAL_W}" height="${H}" fill="#0f172a" rx="12"/>`)

  // Header band
  parts.push(`<rect x="${PAD_L}" y="${PAD_Y}" width="${LABEL_W + CHART_W}" height="${HEADER_H}" rx="6" fill="#0c1f3a"/>`)

  // Column header labels
  COLS.forEach((col, ci) => {
    const cx = CHART_X + ci * COL_W + COL_W / 2
    parts.push(`<text x="${cx}" y="${PAD_Y + 27}" text-anchor="middle" fill="#94a3b8" font-size="11" font-family="system-ui,sans-serif" font-weight="600">${esc(col)}</text>`)
  })

  // Vertical column dividers (span header + body)
  for (let ci = 1; ci < COL_COUNT; ci++) {
    const x = CHART_X + ci * COL_W
    parts.push(`<line x1="${x}" y1="${PAD_Y}" x2="${x}" y2="${H - PAD_Y}" stroke="#1e293b" stroke-width="1"/>`)
  }

  // Outer border
  parts.push(`<rect x="${PAD_L}" y="${PAD_Y}" width="${LABEL_W + CHART_W}" height="${H - PAD_Y * 2}" rx="6" fill="none" stroke="#1e293b" stroke-width="1"/>`)

  // Rows
  rows.forEach((row, ri) => {
    const rowY   = PAD_Y + HEADER_H + ri * ROW_H
    const isQW   = row.classification === 'Quick Win'
    const rowMid = rowY + ROW_H / 2

    // Alternating background
    if (ri % 2 === 1) {
      parts.push(`<rect x="${PAD_L}" y="${rowY}" width="${LABEL_W + CHART_W}" height="${ROW_H}" fill="#ffffff" fill-opacity="0.02"/>`)
    }

    // Row separator
    parts.push(`<line x1="${PAD_L}" y1="${rowY + ROW_H}" x2="${PAD_L + LABEL_W + CHART_W}" y2="${rowY + ROW_H}" stroke="#1e293b" stroke-width="1"/>`)

    // Label
    const labelColor = isQW ? '#86efac' : '#93c5fd'
    parts.push(`<text x="${PAD_L + 10}" y="${rowMid + 4}" text-anchor="start" fill="${labelColor}" font-size="11" font-family="system-ui,sans-serif" font-weight="500">${esc(trunc(row.gapName, 28))}</text>`)

    // Bar
    const [sc, ec] = parseTimeline(row.timeline)
    const barX  = CHART_X + sc * COL_W + BAR_INSET
    const barW  = Math.max((ec - sc + 1) * COL_W - BAR_INSET * 2, COL_W * 0.55)
    const barY  = rowMid - BAR_H / 2
    const fill  = isQW ? '#166534' : '#1d4ed8'
    const stroke = isQW ? '#22c55e' : '#3b82f6'
    parts.push(`<rect x="${barX}" y="${barY}" width="${barW}" height="${BAR_H}" rx="5" fill="${fill}" fill-opacity="0.85" stroke="${stroke}" stroke-width="1"/>`)

    // Timeline label inside bar
    const barCX = barX + barW / 2
    parts.push(`<text x="${barCX}" y="${barY + BAR_H / 2 + 4}" text-anchor="middle" fill="white" font-size="9.5" font-family="system-ui,sans-serif" font-weight="600" opacity="0.9">${esc(row.timeline)}</text>`)
  })

  parts.push('</svg>')
  return parts.join('')
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

function formatPayload(body: Record<string, unknown>): string {
  const lines: string[] = []
  const p1 = body.phase1 as Record<string, unknown> | undefined
  const p2 = body.phase2 as Record<string, unknown> | undefined
  const p3 = body.phase3 as Record<string, unknown> | undefined
  const p4 = body.phase4 as Record<string, unknown> | undefined
  const gaps = body.gaps as Array<Record<string, unknown>> | undefined

  if (p1?.processArea) lines.push(`Area: ${p1.processArea}`)
  if (p1?.problemDescription) lines.push(`Problem: ${p1.problemDescription}`)
  if (Array.isArray(p1?.goals)) lines.push(`Goals: ${(p1.goals as string[]).join(', ')}`)

  if (p2?.processSteps) lines.push(`Current process: ${p2.processSteps}`)
  if (p2?.bottlenecks) lines.push(`Bottlenecks: ${p2.bottlenecks}`)

  if (p3?.successVision) lines.push(`Success vision: ${p3.successVision}`)
  if (p3?.targets) lines.push(`Targets: ${p3.targets}`)

  if (p4?.directionFeedback) lines.push(`Direction feedback: ${p4.directionFeedback}`)
  const constraints = p4?.constraints as string[] | undefined
  if (constraints && constraints.length > 0) {
    lines.push(`Constraints: ${constraints.join(', ')}${p4?.constraintsOther ? ` — ${p4.constraintsOther}` : ''}`)
  }
  if (p4?.offLimits) lines.push(`OFF-LIMITS: ${p4.offLimits}`)

  if (gaps && gaps.length > 0) {
    lines.push('\nGaps to address:')
    for (const g of gaps) {
      lines.push(`- [${g.id}] ${g.name} | Category: ${g.category} | Impact: ${g.impact} | Effort: ${g.effort} | Cost: ${g.cost} | Classification: ${g.classification}`)
    }
  }

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

  let raw = ''
  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    raw = message.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('')
  } catch (err) {
    console.error('[phase6] Anthropic API error:', err)
    const message = err instanceof Error ? err.message : 'API call failed.'
    return Response.json({ error: message }, { status: 500 })
  }

  let parsed: { actions: unknown[]; changeManagement: unknown }
  try {
    parsed = extractJSON(raw) as { actions: unknown[]; changeManagement: unknown }
    if (!parsed?.actions || !Array.isArray(parsed.actions)) {
      throw new Error('Response missing actions array')
    }
  } catch (err) {
    console.error('[phase6] JSON parse error:', err)
    console.error('[phase6] Raw response (first 500 chars):', raw.slice(0, 500))
    const message = err instanceof Error ? err.message : 'Failed to parse model response.'
    return Response.json({ error: message }, { status: 500 })
  }

  // Gantt is best-effort — never let it crash the action plan response
  let ganttSvg = ''
  try {
    ganttSvg = buildGanttSvg(parsed.actions as GanttRow[])
  } catch (err) {
    console.error('[phase6] Gantt generation error:', err)
  }

  return Response.json({ ...parsed, ganttSvg })
}
