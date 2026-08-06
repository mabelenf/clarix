'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

type FormData = {
  processArea: string
  companyDescription: string
  peopleCount: string
  problemDescription: string
  duration: string
  goals: string[]
  rootCause: string
}

type YesNo = 'yes' | 'no' | ''

type Phase2Data = {
  processSteps: string
  rolesInvolved: string
  manualSteps: string
  bottlenecks: string
  hasRedundancies: YesNo
  redundanciesDetail: string
  processDeliverable: string
  hasPeopleChanges: YesNo
  peopleChangesDetail: string
  hasProcessChanges: YesNo
  processChangesDetail: string
  hasTechChanges: YesNo
  techChangesDetail: string
  hasCulturalChanges: YesNo
  culturalChangesDetail: string
  hasExternalChanges: YesNo
  externalChangesDetail: string
  supportingDocuments: File[]
}

type Phase3Data = {
  successVision: string
  targets: string
  constraints: string
}

type Phase4Data = {
  directionFeedback: string
  constraints: string[]
  constraintsOther: string
  offLimits: string
}

type GapRating = 'High' | 'Medium' | 'Low'
type GapCategory = 'People' | 'Process' | 'Technology' | 'Culture' | 'External'
type GapClassification = 'Quick Win' | 'Strategic' | 'Low Priority' | 'Reconsider'

type Gap = {
  id: string
  name: string
  category: GapCategory
  impact: GapRating
  effort: GapRating
  cost: GapRating
  classification: GapClassification
  actionTitle: string
  explanation: string
  impactReason: string
  effortReason: string
  costReason: string
}

type ActionStep = string

type ActionCard = {
  gapId: string
  gapName: string
  actionTitle: string
  category: GapCategory
  classification: GapClassification
  problemStatement: string
  recommendation: string
  responsibleRole: string
  steps: ActionStep[]
  timeline: string
  expectedBenefit: string
  kpi: string
}

type ResistanceItem = {
  stakeholder: string
  concern: string
  response: string
}

type ChangeManagement = {
  keyStakeholders: string[]
  resistanceItems: ResistanceItem[]
  communicationPlan: string[]
}

type ActionPlan = {
  actions: ActionCard[]
  changeManagement: ChangeManagement
  ganttSvg?: string
}

type AppView =
  | 'phase1-wizard'
  | 'phase1-response'
  | 'phase2-wizard'
  | 'phase2-response'
  | 'phase3-wizard'
  | 'phase3-response'
  | 'phase4-wizard'
  | 'phase4-response'
  | 'phase5'
  | 'phase6'

const INITIAL_DATA: FormData = {
  processArea: '',
  companyDescription: '',
  peopleCount: '',
  problemDescription: '',
  duration: '',
  goals: [],
  rootCause: '',
}

const INITIAL_PHASE2_DATA: Phase2Data = {
  processSteps: '',
  rolesInvolved: '',
  manualSteps: '',
  bottlenecks: '',
  hasRedundancies: '',
  redundanciesDetail: '',
  processDeliverable: '',
  hasPeopleChanges: '',
  peopleChangesDetail: '',
  hasProcessChanges: '',
  processChangesDetail: '',
  hasTechChanges: '',
  techChangesDetail: '',
  hasCulturalChanges: '',
  culturalChangesDetail: '',
  hasExternalChanges: '',
  externalChangesDetail: '',
  supportingDocuments: [],
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const PROCESS_AREAS = [
  {
    id: 'customer-service',
    label: 'Customer Service',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-4 4v-4z" />
      </svg>
    ),
  },
  {
    id: 'sales',
    label: 'Sales',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  {
    id: 'logistics',
    label: 'Logistics',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    id: 'operations',
    label: 'Operations',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
      </svg>
    ),
  },
  {
    id: 'hr',
    label: 'HR',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'finance',
    label: 'Finance',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    id: 'technology',
    label: 'Technology',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
  },
  {
    id: 'other',
    label: 'Other',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
      </svg>
    ),
  },
]

const DURATIONS = [
  { id: 'less-1-month', label: 'Less than 1 month' },
  { id: '1-3-months', label: '1–3 months' },
  { id: '3-6-months', label: '3–6 months' },
  { id: '6-12-months', label: '6–12 months' },
  { id: 'more-1-year', label: 'More than a year' },
]

const GOAL_OPTIONS = [
  'Increase revenue',
  'Reduce rework and errors',
  'Improve process efficiency',
  'Reduce costs',
  'Increase customer satisfaction',
  'Improve employee productivity',
  'Identify bottlenecks and redundancies',
  'Align process with organizational objectives',
  'Prepare for a system or technology change',
  'Support an organizational restructure or merger',
  'Other',
]

const INITIAL_PHASE3_DATA: Phase3Data = {
  successVision: '',
  targets: '',
  constraints: '',
}

const INITIAL_PHASE4_DATA: Phase4Data = {
  directionFeedback: '',
  constraints: [],
  constraintsOther: '',
  offLimits: '',
}

const CONSTRAINT_OPTIONS = [
  { id: 'budget', label: 'Budget limitations' },
  { id: 'technology', label: 'Technology restrictions' },
  { id: 'regulatory', label: 'Regulatory requirements' },
  { id: 'capacity', label: 'Team capacity' },
  { id: 'management', label: 'Management resistance' },
  { id: 'other', label: 'Other' },
]

const PHASE1_TOTAL_STEPS = 7
const PHASE2_TOTAL_STEPS = 12
const PHASE3_TOTAL_STEPS = 2
const PHASE4_TOTAL_STEPS = 3

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AnalyzePage() {
  const [view, setView] = useState<AppView>('phase1-wizard')

  // Phase 1
  const [phase1Step, setPhase1Step] = useState(1)
  const [formData, setFormData] = useState<FormData>(INITIAL_DATA)
  const [phase1Response, setPhase1Response] = useState('')
  const [phase1Streaming, setPhase1Streaming] = useState(false)

  // Phase 2
  const [phase2Step, setPhase2Step] = useState(1)
  const [phase2Data, setPhase2Data] = useState<Phase2Data>(INITIAL_PHASE2_DATA)
  const [phase2Response, setPhase2Response] = useState('')
  const [phase2Diagrams, setPhase2Diagrams] = useState<{ flowchartSvg: string; ishikawaSvg: string } | null>(null)
  const [phase2Streaming, setPhase2Streaming] = useState(false)
  const [checkpointChoice, setCheckpointChoice] = useState<string | null>(null)

  // Phase 3
  const [phase3Step, setPhase3Step] = useState(1)
  const [phase3Data, setPhase3Data] = useState<Phase3Data>(INITIAL_PHASE3_DATA)
  const [phase3Response, setPhase3Response] = useState('')
  const [phase3Streaming, setPhase3Streaming] = useState(false)

  // Phase 4
  const [phase4Step, setPhase4Step] = useState(1)
  const [phase4Data, setPhase4Data] = useState<Phase4Data>(INITIAL_PHASE4_DATA)
  const [phase4Response, setPhase4Response] = useState('')
  const [phase4Diagrams, setPhase4Diagrams] = useState<{ toBeFlowchartSvg: string } | null>(null)
  const [phase4Streaming, setPhase4Streaming] = useState(false)
  const [phase4Checkpoint, setPhase4Checkpoint] = useState<string | null>(null)

  // Phase 5
  const [phase5Gaps, setPhase5Gaps] = useState<Gap[]>([])
  const [phase5Status, setPhase5Status] = useState<'loading' | 'done' | 'error'>('loading')

  // Phase 6
  const [phase6Plan, setPhase6Plan] = useState<ActionPlan | null>(null)
  const [phase6Status, setPhase6Status] = useState<'loading' | 'done' | 'error'>('loading')

  const [error, setError] = useState<string | null>(null)
  const draggedIdx = useRef<number | null>(null)
  const dragOverIdx = useRef<number | null>(null)

  // ── Phase 1 ──

  const phase1CanContinue = (): boolean => {
    switch (phase1Step) {
      case 1: return !!formData.processArea
      case 2: return formData.companyDescription.trim().length > 0
      case 3: return formData.peopleCount !== ''
      case 4: return formData.problemDescription.trim().length > 0
      case 5: return !!formData.duration
      case 6: return formData.goals.length > 0
      case 7: return formData.rootCause.trim().length > 0
      default: return false
    }
  }

  const handlePhase1Submit = useCallback(async (data: FormData) => {
    setView('phase1-response')
    setPhase1Response('')
    setError(null)
    setPhase1Streaming(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok || !res.body) {
        setError('Something went wrong. Please try again.')
        setPhase1Streaming(false)
        return
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setPhase1Response(prev => prev + decoder.decode(value, { stream: true }))
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setPhase1Streaming(false)
    }
  }, [])

  const handlePhase1Continue = () => {
    if (phase1Step < PHASE1_TOTAL_STEPS) {
      setPhase1Step(phase1Step + 1)
    } else {
      handlePhase1Submit(formData)
    }
  }

  // ── Phase 2 ──

  const phase2CanContinue = (): boolean => {
    switch (phase2Step) {
      case 1: return phase2Data.processSteps.trim().length > 0
      case 2: return phase2Data.rolesInvolved.trim().length > 0
      case 3: return phase2Data.manualSteps.trim().length > 0
      case 4: return phase2Data.bottlenecks.trim().length > 0
      case 5: return phase2Data.hasRedundancies !== ''
      case 6: return phase2Data.processDeliverable.trim().length > 0
      case 7: return phase2Data.hasPeopleChanges !== ''
      case 8: return phase2Data.hasProcessChanges !== ''
      case 9: return phase2Data.hasTechChanges !== ''
      case 10: return phase2Data.hasCulturalChanges !== ''
      case 11: return phase2Data.hasExternalChanges !== ''
      case 12: return true
      default: return false
    }
  }

  const handlePhase2Submit = useCallback(async (p1: FormData, p2: Phase2Data) => {
    setView('phase2-response')
    setPhase2Response('')
    setPhase2Diagrams(null)
    setCheckpointChoice(null)
    setError(null)
    setPhase2Streaming(true)
    try {
      const payload = {
        phase1: p1,
        phase2: {
          ...p2,
          supportingDocuments: p2.supportingDocuments.map(f => ({
            name: f.name,
            size: f.size,
            type: f.type,
          })),
        },
      }
      const res = await fetch('/api/analyze/phase2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        setError('Something went wrong. Please try again.')
        return
      }
      const data = await res.json() as { markdown?: string; flowchartSvg?: string; ishikawaSvg?: string; error?: string }
      if (data.error) {
        setError(data.error)
        return
      }
      setPhase2Response(data.markdown ?? '')
      if (data.flowchartSvg || data.ishikawaSvg) {
        setPhase2Diagrams({ flowchartSvg: data.flowchartSvg ?? '', ishikawaSvg: data.ishikawaSvg ?? '' })
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setPhase2Streaming(false)
    }
  }, [])

  const handlePhase2Continue = () => {
    if (phase2Step < PHASE2_TOTAL_STEPS) {
      setPhase2Step(phase2Step + 1)
    } else {
      handlePhase2Submit(formData, phase2Data)
    }
  }

  // ── Phase 3 ──

  const phase3CanContinue = (): boolean => {
    switch (phase3Step) {
      case 1: return phase3Data.successVision.trim().length > 0
      case 2: return phase3Data.targets.trim().length > 0
      default: return false
    }
  }

  const handlePhase3Submit = useCallback(async (p1: FormData, p2: Phase2Data, p3: Phase3Data) => {
    setView('phase3-response')
    setPhase3Response('')
    setError(null)
    setPhase3Streaming(true)
    try {
      const payload = {
        phase1: p1,
        phase2: {
          ...p2,
          supportingDocuments: p2.supportingDocuments.map(f => ({
            name: f.name,
            size: f.size,
            type: f.type,
          })),
        },
        phase3: p3,
      }
      const res = await fetch('/api/analyze/phase3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok || !res.body) {
        setError('Something went wrong. Please try again.')
        setPhase3Streaming(false)
        return
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setPhase3Response(prev => prev + decoder.decode(value, { stream: true }))
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setPhase3Streaming(false)
    }
  }, [])

  const handlePhase3Continue = () => {
    if (phase3Step < PHASE3_TOTAL_STEPS) {
      setPhase3Step(phase3Step + 1)
    } else {
      handlePhase3Submit(formData, phase2Data, phase3Data)
    }
  }

  // ── Phase 4 ──

  const phase4CanContinue = (): boolean => {
    switch (phase4Step) {
      case 1: return phase4Data.directionFeedback.trim().length > 0
      case 2: return true
      case 3: return true
      default: return false
    }
  }

  const handlePhase4Submit = useCallback(async (
    p1: FormData,
    p2: Phase2Data,
    p3: Phase3Data,
    p4: Phase4Data,
    simplify = false,
  ) => {
    setView('phase4-response')
    setPhase4Response('')
    setPhase4Diagrams(null)
    setPhase4Checkpoint(null)
    setError(null)
    setPhase4Streaming(true)
    try {
      const payload = {
        phase1: p1,
        phase2: {
          ...p2,
          supportingDocuments: p2.supportingDocuments.map(f => ({
            name: f.name,
            size: f.size,
            type: f.type,
          })),
        },
        phase3: p3,
        phase4: p4,
        simplify,
      }
      const res = await fetch('/api/analyze/phase4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        setError('Something went wrong. Please try again.')
        return
      }
      const data = await res.json() as { markdown?: string; toBeFlowchartSvg?: string; error?: string }
      if (data.error) {
        setError(data.error)
        return
      }
      setPhase4Response(data.markdown ?? '')
      if (data.toBeFlowchartSvg) {
        setPhase4Diagrams({ toBeFlowchartSvg: data.toBeFlowchartSvg })
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setPhase4Streaming(false)
    }
  }, [])

  const handlePhase4Continue = () => {
    if (phase4Step < PHASE4_TOTAL_STEPS) {
      setPhase4Step(phase4Step + 1)
    } else {
      handlePhase4Submit(formData, phase2Data, phase3Data, phase4Data)
    }
  }

  // ── Phase 5 ──

  const handlePhase5Fetch = useCallback(async (
    p1: FormData,
    p2: Phase2Data,
    p3: Phase3Data,
    p4: Phase4Data,
  ) => {
    setView('phase5')
    setPhase5Gaps([])
    setPhase5Status('loading')
    setError(null)

    const payload = {
      phase1: p1,
      phase2: {
        ...p2,
        supportingDocuments: p2.supportingDocuments.map(f => ({
          name: f.name,
          size: f.size,
          type: f.type,
        })),
      },
      phase3: p3,
      phase4: p4,
    }
function stripMarkdownFence(raw: string): string {
      return raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()
    }
    async function fetchGaps(url: string): Promise<Gap[]> {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok || !res.body) throw new Error('Request failed')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let text = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value, { stream: true })
      }
      if (text.includes('\x00')) {
        const sentinel = JSON.parse(stripMarkdownFence(text.split('\x00')[1])) as { error?: string }
        if (sentinel.error) throw new Error(sentinel.error)
      }
      const data = JSON.parse(stripMarkdownFence(text)) as { gaps: Gap[] }
      return data.gaps ?? []
    }

    try {
      const [quickGaps, strategicGaps] = await Promise.all([
        fetchGaps('/api/analyze/phase5/quick'),
        fetchGaps('/api/analyze/phase5/strategic'),
      ])
      setPhase5Gaps([...quickGaps, ...strategicGaps])
      setPhase5Status('done')
  } catch (err) {
         console.error('[phase5] gap analysis failed:', err)
         setPhase5Status('error')
         setError('Something went wrong. Please try again.')
       }
     }, [])

  const handlePhase6Fetch = useCallback(async (
    p1: FormData,
    p2: Phase2Data,
    p3: Phase3Data,
    p4: Phase4Data,
    gaps: Gap[],
  ) => {
    setView('phase6')
    setPhase6Plan(null)
    setPhase6Status('loading')
    setError(null)
    try {
      const payload = {
        phase1: p1,
        phase2: {
          ...p2,
          supportingDocuments: p2.supportingDocuments.map(f => ({
            name: f.name,
            size: f.size,
            type: f.type,
          })),
        },
        phase3: p3,
        phase4: p4,
        gaps,
      }
      const res = await fetch('/api/analyze/phase6', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok || !res.body) {
        setPhase6Status('error')
        setError('Something went wrong. Please try again.')
        return
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let text = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        text += decoder.decode(value, { stream: true })
      }
      const parts = text.split('\x00')
      const sentinel = JSON.parse(stripMarkdownFence(parts[1] ?? '{}')) as { ganttSvg?: string; error?: string }
      if (sentinel.error) {
        setPhase6Status('error')
        setError(sentinel.error)
        return
      }
      const data = JSON.parse(stripMarkdownFence(parts[0])) as ActionPlan
      setPhase6Plan({ ...data, ganttSvg: sentinel.ganttSvg ?? '' })
      setPhase6Status('done')
    } catch {
      setPhase6Status('error')
      setError('Something went wrong. Please try again.')
    }
  }, [])

  // ── Goal drag ──

  const handleDragStart = (idx: number) => { draggedIdx.current = idx }
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    dragOverIdx.current = idx
  }
  const handleDrop = () => {
    if (draggedIdx.current === null || dragOverIdx.current === null) return
    const next = [...formData.goals]
    const [item] = next.splice(draggedIdx.current, 1)
    next.splice(dragOverIdx.current, 0, item)
    setFormData(prev => ({ ...prev, goals: next }))
    draggedIdx.current = null
    dragOverIdx.current = null
  }

  const toggleGoal = (goal: string) => {
    setFormData(prev => {
      if (prev.goals.includes(goal)) return { ...prev, goals: prev.goals.filter(g => g !== goal) }
      if (prev.goals.length >= 3) return prev
      return { ...prev, goals: [...prev.goals, goal] }
    })
  }

  // ── View routing ──

  if (view === 'phase1-response') {
    return (
      <Phase1ResponseScreen
        text={phase1Response}
        isStreaming={phase1Streaming}
        error={error}
        onContinue={() => setView('phase2-wizard')}
      />
    )
  }

  if (view === 'phase2-wizard') {
    return (
      <Phase2Wizard
        step={phase2Step}
        data={phase2Data}
        onChange={setPhase2Data}
        onContinue={handlePhase2Continue}
        onBack={() => {
          if (phase2Step > 1) setPhase2Step(phase2Step - 1)
          else setView('phase1-response')
        }}
        canContinue={phase2CanContinue()}
      />
    )
  }

  if (view === 'phase2-response') {
    return (
      <Phase2ResponseScreen
        text={phase2Response}
        diagrams={phase2Diagrams}
        isStreaming={phase2Streaming}
        error={error}
        checkpointChoice={checkpointChoice}
        onCheckpoint={choice => {
          setCheckpointChoice(choice)
          if (choice === 'accurate') {
            setView('phase3-wizard')
          } else {
            setPhase2Step(1)
            setPhase2Response('')
            setView('phase2-wizard')
          }
        }}
      />
    )
  }

  if (view === 'phase3-wizard') {
    return (
      <Phase3Wizard
        step={phase3Step}
        data={phase3Data}
        goals={formData.goals}
        onChange={setPhase3Data}
        onContinue={handlePhase3Continue}
        onBack={() => {
          if (phase3Step > 1) setPhase3Step(phase3Step - 1)
          else setView('phase2-response')
        }}
        canContinue={phase3CanContinue()}
      />
    )
  }

  if (view === 'phase3-response') {
    return (
      <Phase3ResponseScreen
        text={phase3Response}
        isStreaming={phase3Streaming}
        error={error}
        onContinue={() => setView('phase4-wizard')}
      />
    )
  }

  if (view === 'phase4-wizard') {
    return (
      <Phase4Wizard
        step={phase4Step}
        data={phase4Data}
        phase1={formData}
        phase3Response={phase3Response}
        onChange={setPhase4Data}
        onContinue={handlePhase4Continue}
        onBack={() => {
          if (phase4Step > 1) setPhase4Step(phase4Step - 1)
          else setView('phase3-response')
        }}
        canContinue={phase4CanContinue()}
      />
    )
  }

  if (view === 'phase4-response') {
    return (
      <Phase4ResponseScreen
        text={phase4Response}
        diagrams={phase4Diagrams}
        isStreaming={phase4Streaming}
        error={error}
        checkpoint={phase4Checkpoint}
        onCheckpoint={choice => {
          if (choice === 'forward') {
            handlePhase5Fetch(formData, phase2Data, phase3Data, phase4Data)
          } else if (choice === 'adjust') {
            setPhase4Step(1)
            setPhase4Response('')
            setPhase4Diagrams(null)
            setView('phase4-wizard')
          } else if (choice === 'simplify') {
            setPhase4Checkpoint('simplify')
            handlePhase4Submit(formData, phase2Data, phase3Data, phase4Data, true)
          }
        }}
      />
    )
  }

  if (view === 'phase5') {
    return (
      <Phase5Screen
        status={phase5Status}
        gaps={phase5Gaps}
        error={error}
        onGapsChange={setPhase5Gaps}
        onForward={() => handlePhase6Fetch(formData, phase2Data, phase3Data, phase4Data, phase5Gaps)}
      />
    )
  }

  if (view === 'phase6') {
    return (
      <Phase6Screen
        status={phase6Status}
        plan={phase6Plan}
        error={error}
      />
    )
  }

  // Phase 1 wizard
  const progressPct = ((phase1Step - 1) / (PHASE1_TOTAL_STEPS - 1)) * 100

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10 shrink-0">
        <Link href="/" className="text-xl font-bold tracking-tight text-white hover:opacity-80 transition-opacity">
          Clarix
        </Link>
        <span className="text-sm text-slate-500">
          Step {phase1Step} of {PHASE1_TOTAL_STEPS}
        </span>
      </header>

      <div className="shrink-0 px-8 pt-8 pb-2 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
            Phase 1 of 6 — Context &amp; Positioning
          </span>
          <span className="text-xs text-slate-500">{phase1Step}/{PHASE1_TOTAL_STEPS}</span>
        </div>
        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          {Array.from({ length: PHASE1_TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i + 1 < phase1Step ? 'bg-blue-400' : i + 1 === phase1Step ? 'bg-cyan-400 scale-125' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-2xl">
          {phase1Step === 1 && (
            <StepProcessArea
              value={formData.processArea}
              onChange={val => setFormData(prev => ({ ...prev, processArea: val }))}
            />
          )}
          {phase1Step === 2 && (
            <StepTextArea
              question="What does your company or team do?"
              placeholder="Briefly describe your organization, what you sell or deliver, and who you serve…"
              value={formData.companyDescription}
              onChange={val => setFormData(prev => ({ ...prev, companyDescription: val }))}
              rows={5}
            />
          )}
          {phase1Step === 3 && (
            <StepNumberInput
              question="How many people are involved in this process?"
              value={formData.peopleCount}
              onChange={val => setFormData(prev => ({ ...prev, peopleCount: val }))}
            />
          )}
          {phase1Step === 4 && (
            <StepTextArea
              question="In your own words — what problem or situation brought you here today?"
              placeholder="Describe the situation as you see it. Don't worry about being precise — just explain what's going on…"
              value={formData.problemDescription}
              onChange={val => setFormData(prev => ({ ...prev, problemDescription: val }))}
              rows={6}
            />
          )}
          {phase1Step === 5 && (
            <StepDuration
              value={formData.duration}
              onChange={val => setFormData(prev => ({ ...prev, duration: val }))}
            />
          )}
          {phase1Step === 6 && (
            <StepGoals
              selected={formData.goals}
              onToggle={toggleGoal}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          )}
          {phase1Step === 7 && (
            <StepTextArea
              question="If you had to guess — why do you think this is happening?"
              placeholder="Your intuition matters. Share your hypothesis, even if you're not certain…"
              value={formData.rootCause}
              onChange={val => setFormData(prev => ({ ...prev, rootCause: val }))}
              rows={6}
            />
          )}

          <div className="mt-10 flex items-center justify-between">
            <button
              onClick={() => { if (phase1Step > 1) setPhase1Step(phase1Step - 1) }}
              disabled={phase1Step === 1}
              className="text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-0 disabled:pointer-events-none"
            >
              ← Back
            </button>
            <button
              onClick={handlePhase1Continue}
              disabled={!phase1CanContinue()}
              className="bg-blue-500 hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors shadow-lg shadow-blue-500/20"
            >
              {phase1Step === PHASE1_TOTAL_STEPS ? 'Submit' : 'Continue'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

// ─── Phase 2 Wizard ───────────────────────────────────────────────────────────

function Phase2Wizard({
  step,
  data,
  onChange,
  onContinue,
  onBack,
  canContinue,
}: {
  step: number
  data: Phase2Data
  onChange: (d: Phase2Data) => void
  onContinue: () => void
  onBack: () => void
  canContinue: boolean
}) {
  const progressPct = ((step - 1) / (PHASE2_TOTAL_STEPS - 1)) * 100
  const isChangesSection = step >= 7 && step <= 11

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10 shrink-0">
        <Link href="/" className="text-xl font-bold tracking-tight text-white hover:opacity-80 transition-opacity">
          Clarix
        </Link>
        <span className="text-sm text-slate-500">Step {step} of {PHASE2_TOTAL_STEPS}</span>
      </header>

      <div className="shrink-0 px-8 pt-8 pb-2 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
            Phase 2 of 6 — AS-IS Analysis
          </span>
          <span className="text-xs text-slate-500">{step}/{PHASE2_TOTAL_STEPS}</span>
        </div>
        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          {Array.from({ length: PHASE2_TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i + 1 < step ? 'bg-blue-400' : i + 1 === step ? 'bg-cyan-400 scale-125' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-2xl">
          {isChangesSection && (
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-slate-400 text-xs font-medium px-3 py-1.5 rounded-full uppercase tracking-widest mb-7">
              What changed recently?
            </div>
          )}

          {step === 1 && (
            <StepTextArea
              question="Walk me through the process step by step — what happens first, then what, and so on?"
              placeholder="Start with what triggers the process, then describe each step in sequence…"
              value={data.processSteps}
              onChange={val => onChange({ ...data, processSteps: val })}
              rows={8}
            />
          )}
          {step === 2 && (
            <StepTextAreaWithNote
              question="Who is involved in each step?"
              note="(roles, not names)"
              placeholder="e.g. Sales Manager assigns the task, Operations team reviews it, Finance approves…"
              value={data.rolesInvolved}
              onChange={val => onChange({ ...data, rolesInvolved: val })}
              rows={6}
            />
          )}
          {step === 3 && (
            <StepTextArea
              question="Are any of these steps manual? Which ones?"
              placeholder="Describe which steps require manual effort, data entry, or human judgment…"
              value={data.manualSteps}
              onChange={val => onChange({ ...data, manualSteps: val })}
              rows={6}
            />
          )}
          {step === 4 && (
            <StepTextArea
              question="Where does the process most commonly slow down or get stuck?"
              placeholder="Think about where things pile up, where approvals take too long, or where errors typically appear…"
              value={data.bottlenecks}
              onChange={val => onChange({ ...data, bottlenecks: val })}
              rows={6}
            />
          )}
          {step === 5 && (
            <StepYesNoWithDetail
              question="Are there steps that get repeated or done more than once unnecessarily?"
              detailLabel="Which ones?"
              detailPlaceholder="Describe the steps that are repeated unnecessarily…"
              yesNo={data.hasRedundancies}
              detail={data.redundanciesDetail}
              onYesNo={val => onChange({ ...data, hasRedundancies: val })}
              onDetail={val => onChange({ ...data, redundanciesDetail: val })}
            />
          )}
          {step === 6 && (
            <StepTextArea
              question="What should be delivered at the end of this process?"
              placeholder="Describe the expected output or outcome — a report, a product, an approval, a delivery…"
              value={data.processDeliverable}
              onChange={val => onChange({ ...data, processDeliverable: val })}
              rows={5}
            />
          )}
          {step === 7 && (
            <StepYesNoWithDetail
              question="Have there been any recent people changes?"
              detailLabel="Tell me more"
              detailPlaceholder="e.g. New hires, departures, role changes, team restructuring…"
              yesNo={data.hasPeopleChanges}
              detail={data.peopleChangesDetail}
              onYesNo={val => onChange({ ...data, hasPeopleChanges: val })}
              onDetail={val => onChange({ ...data, peopleChangesDetail: val })}
            />
          )}
          {step === 8 && (
            <StepYesNoWithDetail
              question="Have there been any recent process changes?"
              detailLabel="Tell me more"
              detailPlaceholder="e.g. New procedures, removed steps, policy updates, compliance requirements…"
              yesNo={data.hasProcessChanges}
              detail={data.processChangesDetail}
              onYesNo={val => onChange({ ...data, hasProcessChanges: val })}
              onDetail={val => onChange({ ...data, processChangesDetail: val })}
            />
          )}
          {step === 9 && (
            <StepYesNoWithDetail
              question="Have there been any recent technology changes?"
              detailLabel="Tell me more"
              detailPlaceholder="e.g. New software, system migrations, tool replacements, IT changes…"
              yesNo={data.hasTechChanges}
              detail={data.techChangesDetail}
              onYesNo={val => onChange({ ...data, hasTechChanges: val })}
              onDetail={val => onChange({ ...data, techChangesDetail: val })}
            />
          )}
          {step === 10 && (
            <StepYesNoWithDetail
              question="Have there been any cultural or leadership changes?"
              detailLabel="Tell me more"
              detailPlaceholder="e.g. New leadership, culture shifts, change in priorities, management style…"
              yesNo={data.hasCulturalChanges}
              detail={data.culturalChangesDetail}
              onYesNo={val => onChange({ ...data, hasCulturalChanges: val })}
              onDetail={val => onChange({ ...data, culturalChangesDetail: val })}
            />
          )}
          {step === 11 && (
            <StepYesNoWithDetail
              question="Have there been any external changes?"
              detailLabel="Tell me more"
              detailPlaceholder="e.g. Market shifts, regulatory changes, supplier issues, competitive pressures…"
              yesNo={data.hasExternalChanges}
              detail={data.externalChangesDetail}
              onYesNo={val => onChange({ ...data, hasExternalChanges: val })}
              onDetail={val => onChange({ ...data, externalChangesDetail: val })}
            />
          )}
          {step === 12 && (
            <StepFileUpload
              files={data.supportingDocuments}
              onChange={files => onChange({ ...data, supportingDocuments: files })}
            />
          )}

          <div className="mt-10 flex items-center justify-between">
            <button
              onClick={onBack}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              ← Back
            </button>
            {step === 13 ? (
              <div className="flex items-center gap-4">
                <button
                  onClick={onContinue}
                  className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Skip for now
                </button>
                <button
                  onClick={onContinue}
                  disabled={!canContinue}
                  className="bg-blue-500 hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors shadow-lg shadow-blue-500/20"
                >
                  Submit
                </button>
              </div>
            ) : (
              <button
                onClick={onContinue}
                disabled={!canContinue}
                className="bg-blue-500 hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors shadow-lg shadow-blue-500/20"
              >
                {step === PHASE2_TOTAL_STEPS - 1 ? 'Continue' : 'Continue'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

// ─── Phase 1 Response Screen ──────────────────────────────────────────────────

function Phase1ResponseScreen({
  text,
  isStreaming,
  error,
  onContinue,
}: {
  text: string
  isStreaming: boolean
  error: string | null
  onContinue: () => void
}) {
  const loading = isStreaming && text.length === 0

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10 shrink-0">
        <Link href="/" className="text-xl font-bold tracking-tight text-white hover:opacity-80 transition-opacity">
          Clarix
        </Link>
        <div className="flex items-center gap-3">
          {isStreaming && (
            <span className="flex items-center gap-1.5 text-xs text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Analyzing…
            </span>
          )}
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
            Phase 1 Complete
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 py-12">
        <div className="w-full max-w-2xl">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-6 py-24">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
                <div className="absolute inset-0 rounded-full border-t-2 border-blue-400 animate-spin" />
              </div>
              <p className="text-slate-400 text-sm">Clarix is analyzing your information…</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-5 text-red-400 text-sm">
              {error}
            </div>
          )}

          {!loading && !error && text.length > 0 && (
            <>
              <div className="mb-8 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                </div>
                <span className="text-sm font-semibold text-blue-400 uppercase tracking-widest">Clarix</span>
              </div>

              <div className="prose-clarix">
                <MarkdownRenderer text={text} />
                {isStreaming && (
                  <span className="inline-block w-0.5 h-4 bg-blue-400 animate-pulse ml-0.5 align-middle" />
                )}
              </div>

              {!isStreaming && (
                <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-between">
                  <p className="text-xs text-slate-600 uppercase tracking-widest">Phase 1 of 6 complete</p>
                  <button
                    onClick={onContinue}
                    className="bg-blue-500 hover:bg-blue-400 text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors shadow-lg shadow-blue-500/20"
                  >
                    Continue to Phase 2 →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

// ─── Phase 2 Response Screen ──────────────────────────────────────────────────

function Phase2ResponseScreen({
  text,
  diagrams,
  isStreaming,
  error,
  checkpointChoice,
  onCheckpoint,
}: {
  text: string
  diagrams: { flowchartSvg: string; ishikawaSvg: string } | null
  isStreaming: boolean
  error: string | null
  checkpointChoice: string | null
  onCheckpoint: (choice: string) => void
}) {
  const loading = isStreaming && text.length === 0

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10 shrink-0">
        <Link href="/" className="text-xl font-bold tracking-tight text-white hover:opacity-80 transition-opacity">
          Clarix
        </Link>
        <div className="flex items-center gap-3">
          {isStreaming && (
            <span className="flex items-center gap-1.5 text-xs text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Analyzing…
            </span>
          )}
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
            Phase 2 — AS-IS Analysis
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 py-12">
        <div className="w-full max-w-2xl">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-6 py-24">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
                <div className="absolute inset-0 rounded-full border-t-2 border-blue-400 animate-spin" />
              </div>
              <p className="text-slate-400 text-sm">Clarix is building your AS-IS analysis…</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-5 text-red-400 text-sm">
              {error}
            </div>
          )}

          {!loading && !error && text.length > 0 && (
            <>
              <div className="mb-8 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                </div>
                <span className="text-sm font-semibold text-blue-400 uppercase tracking-widest">Clarix</span>
              </div>

              <div className="prose-clarix">
                <MarkdownRenderer text={text} />
              </div>

              {!isStreaming && diagrams && (diagrams.flowchartSvg || diagrams.ishikawaSvg) && (
                <div className="mt-10 space-y-8">
                  {diagrams.flowchartSvg && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">AS-IS Process Flowchart</p>
                      <div
                        className="rounded-xl overflow-hidden border border-white/10"
                        dangerouslySetInnerHTML={{ __html: diagrams.flowchartSvg }}
                      />
                    </div>
                  )}
                  {diagrams.ishikawaSvg && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Cause &amp; Effect (Ishikawa) Diagram</p>
                      <div
                        className="rounded-xl overflow-hidden border border-white/10"
                        dangerouslySetInnerHTML={{ __html: diagrams.ishikawaSvg }}
                      />
                    </div>
                  )}
                </div>
              )}

              {!isStreaming && (
                <div className="mt-12 pt-8 border-t border-white/10">
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Checkpoint 1</p>
                  <p className="text-sm text-slate-400 mb-6">Does this analysis accurately reflect your situation?</p>

                  {checkpointChoice === 'accurate' ? (
                    <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-400">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Confirmed. Moving to Phase 3…
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <CheckpointButton
                        onClick={() => onCheckpoint('accurate')}
                        icon={
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        }
                        label="Yes, this is accurate"
                        accent
                      />
                      <CheckpointButton
                        onClick={() => onCheckpoint('adjust')}
                        icon={
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                          </svg>
                        }
                        label="I want to adjust something"
                      />
                      <CheckpointButton
                        onClick={() => onCheckpoint('more-info')}
                        icon={
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                        }
                        label="I need to add more information"
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

function CheckpointButton({
  onClick,
  icon,
  label,
  accent = false,
}: {
  onClick: () => void
  icon: React.ReactNode
  label: string
  accent?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border text-sm font-medium text-left transition-all duration-150 ${
        accent
          ? 'bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20 hover:border-blue-400'
          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
      }`}
    >
      <span className={accent ? 'text-blue-400' : 'text-slate-500'}>{icon}</span>
      {label}
    </button>
  )
}

// ─── Markdown Renderer ────────────────────────────────────────────────────────

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>
    }
    return part
  })
}

// Returns true for markdown table separator rows like |---|:---|---:|
function isTableSeparator(line: string): boolean {
  const cells = line.trim().split('|').slice(1, -1)
  return cells.length > 0 && cells.every(c => /^[\s:\-]+$/.test(c))
}

function parseTableRow(row: string): string[] {
  return row.trim().split('|').slice(1, -1).map(c => c.trim())
}

function MarkdownTable({ lines }: { lines: string[] }) {
  const dataLines = lines.filter(l => !isTableSeparator(l))
  if (dataLines.length < 2) return null
  const headers = parseTableRow(dataLines[0])
  const rows = dataLines.slice(1).map(parseTableRow)

  return (
    <div className="my-5 rounded-xl overflow-hidden border border-white/15">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-white/10 border-b border-white/15">
              {headers.map((h, j) => (
                <th key={j} className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wide whitespace-nowrap">
                  {renderInline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((cells, j) => (
              <tr
                key={j}
                className={`border-b border-white/[0.06] last:border-b-0 ${j % 2 === 1 ? 'bg-white/[0.03]' : ''}`}
              >
                {cells.map((cell, k) => (
                  <td key={k} className="px-4 py-2.5 text-slate-300 align-top">
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MarkdownRenderer({ text }: { text: string }) {
  const lines = text.split('\n')
  const nodes: React.ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    // ── Table block ──
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableStart = i
      const tableLines: string[] = []
      while (i < lines.length) {
        const t = lines[i].trim()
        if (t.startsWith('|') && t.endsWith('|')) {
          tableLines.push(lines[i])
          i++
        } else {
          break
        }
      }
      nodes.push(<MarkdownTable key={tableStart} lines={tableLines} />)
      continue
    }

    if (line.startsWith('### ')) {
      nodes.push(
        <h3 key={i} className="text-base font-semibold text-white mt-6 mb-2">
          {renderInline(line.slice(4))}
        </h3>
      )
    } else if (line.startsWith('## ')) {
      nodes.push(
        <h2 key={i} className="text-lg font-bold text-white mt-8 mb-3">
          {renderInline(line.slice(3))}
        </h2>
      )
    } else if (line.startsWith('# ')) {
      nodes.push(
        <h1 key={i} className="text-xl font-bold text-white mt-8 mb-3">
          {renderInline(line.slice(2))}
        </h1>
      )
    } else if (/^[-*] /.test(line)) {
      nodes.push(
        <div key={i} className="flex gap-3 text-slate-300 text-sm leading-relaxed my-1">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
          <span>{renderInline(line.slice(2))}</span>
        </div>
      )
    } else if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\.\s/)![1]
      nodes.push(
        <div key={i} className="flex gap-3 text-slate-300 text-sm leading-relaxed my-1">
          <span className="shrink-0 font-semibold text-blue-400 w-5 text-right">{num}.</span>
          <span>{renderInline(line.replace(/^\d+\.\s/, ''))}</span>
        </div>
      )
    } else if (line.trim() === '') {
      nodes.push(<div key={i} className="h-2" />)
    } else {
      nodes.push(
        <p key={i} className="text-slate-300 text-sm leading-relaxed">
          {renderInline(line)}
        </p>
      )
    }
    i++
  }

  return <div className="space-y-0.5">{nodes}</div>
}

// ─── Step Components ──────────────────────────────────────────────────────────

function StepProcessArea({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  return (
    <div>
      <StepQuestion>Which specific area or process do you want to analyze?</StepQuestion>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
        {PROCESS_AREAS.map(area => {
          const selected = value === area.id
          return (
            <button
              key={area.id}
              onClick={() => onChange(area.id)}
              className={`flex flex-col items-center gap-3 p-5 rounded-xl border transition-all duration-150 text-center ${
                selected
                  ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <span className={selected ? 'text-blue-400' : 'text-slate-400'}>{area.icon}</span>
              <span className="text-sm font-medium leading-tight">{area.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StepDuration({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  return (
    <div>
      <StepQuestion>How long has this been going on?</StepQuestion>
      <div className="flex flex-col gap-3 mt-8">
        {DURATIONS.map(d => {
          const selected = value === d.id
          return (
            <button
              key={d.id}
              onClick={() => onChange(d.id)}
              className={`flex items-center gap-4 px-5 py-4 rounded-xl border text-left transition-all duration-150 ${
                selected
                  ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 shrink-0 transition-colors ${
                  selected ? 'border-blue-400 bg-blue-400' : 'border-white/30'
                }`}
              />
              <span className="text-sm font-medium">{d.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StepGoals({
  selected,
  onToggle,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  selected: string[]
  onToggle: (goal: string) => void
  onDragStart: (idx: number) => void
  onDragOver: (e: React.DragEvent, idx: number) => void
  onDrop: () => void
}) {
  return (
    <div>
      <StepQuestion>What are your main goals for this analysis?</StepQuestion>
      <p className="mt-2 text-sm text-slate-500">Select up to 3. Drag to rank by priority.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6">
        {GOAL_OPTIONS.map(goal => {
          const isSelected = selected.includes(goal)
          const rank = selected.indexOf(goal)
          const maxed = selected.length >= 3 && !isSelected
          return (
            <button
              key={goal}
              onClick={() => onToggle(goal)}
              disabled={maxed}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all duration-150 ${
                isSelected
                  ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                  : maxed
                  ? 'bg-white/3 border-white/5 text-slate-600 cursor-not-allowed'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center text-xs font-bold transition-colors ${
                  isSelected ? 'border-blue-400 bg-blue-400 text-white' : 'border-white/20'
                }`}
              >
                {isSelected ? rank + 1 : ''}
              </div>
              <span className="text-sm font-medium leading-tight">{goal}</span>
            </button>
          )
        })}
      </div>
      {selected.length > 0 && (
        <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Priority order — drag to reorder</p>
          <div className="flex flex-col gap-2">
            {selected.map((goal, idx) => (
              <div
                key={goal}
                draggable
                onDragStart={() => onDragStart(idx)}
                onDragOver={e => onDragOver(e, idx)}
                onDrop={onDrop}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-500/10 border border-blue-500/30 cursor-grab active:cursor-grabbing"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4 text-slate-500 shrink-0">
                  <line x1="8" y1="6" x2="16" y2="6" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                  <line x1="8" y1="18" x2="16" y2="18" />
                </svg>
                <span className="text-xs font-bold text-blue-400 w-4 shrink-0">{idx + 1}</span>
                <span className="text-sm text-blue-300">{goal}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StepTextArea({
  question,
  placeholder,
  value,
  onChange,
  rows = 5,
}: {
  question: string
  placeholder: string
  value: string
  onChange: (val: string) => void
  rows?: number
}) {
  return (
    <div>
      <StepQuestion>{question}</StepQuestion>
      <textarea
        className="mt-8 w-full bg-white/5 border border-white/15 rounded-xl px-5 py-4 text-white placeholder-slate-600 text-sm leading-relaxed resize-none focus:outline-none focus:border-blue-500/60 transition-colors"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        autoFocus
      />
    </div>
  )
}

function StepTextAreaWithNote({
  question,
  note,
  placeholder,
  value,
  onChange,
  rows = 5,
}: {
  question: string
  note: string
  placeholder: string
  value: string
  onChange: (val: string) => void
  rows?: number
}) {
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold leading-snug tracking-tight text-white">
        {question}{' '}
        <span className="text-xl font-normal text-slate-500">{note}</span>
      </h2>
      <textarea
        className="mt-8 w-full bg-white/5 border border-white/15 rounded-xl px-5 py-4 text-white placeholder-slate-600 text-sm leading-relaxed resize-none focus:outline-none focus:border-blue-500/60 transition-colors"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        autoFocus
      />
    </div>
  )
}

function StepYesNoWithDetail({
  question,
  detailLabel,
  detailPlaceholder,
  yesNo,
  detail,
  onYesNo,
  onDetail,
}: {
  question: string
  detailLabel: string
  detailPlaceholder: string
  yesNo: YesNo
  detail: string
  onYesNo: (val: YesNo) => void
  onDetail: (val: string) => void
}) {
  return (
    <div>
      <StepQuestion>{question}</StepQuestion>
      <div className="flex gap-3 mt-8">
        {(['yes', 'no'] as const).map(option => (
          <button
            key={option}
            onClick={() => onYesNo(option)}
            className={`flex-1 py-4 rounded-xl border text-sm font-semibold transition-all duration-150 ${
              yesNo === option
                ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            {option === 'yes' ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
      {yesNo === 'yes' && (
        <div className="mt-6">
          <p className="text-sm text-slate-400 mb-3">{detailLabel}</p>
          <textarea
            className="w-full bg-white/5 border border-white/15 rounded-xl px-5 py-4 text-white placeholder-slate-600 text-sm leading-relaxed resize-none focus:outline-none focus:border-blue-500/60 transition-colors"
            placeholder={detailPlaceholder}
            value={detail}
            onChange={e => onDetail(e.target.value)}
            rows={4}
            autoFocus
          />
        </div>
      )}
    </div>
  )
}

function StepFileUpload({
  files,
  onChange,
}: {
  files: File[]
  onChange: (files: File[]) => void
}) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const ACCEPTED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ]

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return
    const valid = Array.from(incoming).filter(f => ACCEPTED_TYPES.includes(f.type))
    onChange([...files, ...valid])
  }

  return (
    <div>
      <StepQuestion>Do you have any supporting documents?</StepQuestion>
      <p className="mt-2 text-sm text-slate-500">Accepted: PDF, Word, Excel</p>

      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => {
          e.preventDefault()
          setIsDragging(false)
          addFiles(e.dataTransfer.files)
        }}
        onClick={() => inputRef.current?.click()}
        className={`mt-8 border-2 border-dashed rounded-xl px-8 py-14 flex flex-col items-center gap-4 cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-500/10'
            : 'border-white/15 hover:border-white/25 bg-white/3'
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 text-slate-500">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <div className="text-center">
          <p className="text-sm text-slate-300 font-medium">Drag and drop files here</p>
          <p className="text-xs text-slate-500 mt-1">or click to browse</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx"
          className="hidden"
          onChange={e => addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 min-w-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-blue-400 shrink-0">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span className="text-sm text-slate-300 truncate">{file.name}</span>
                <span className="text-xs text-slate-600 shrink-0">{(file.size / 1024).toFixed(0)} KB</span>
              </div>
              <button
                onClick={e => {
                  e.stopPropagation()
                  onChange(files.filter((_, i) => i !== idx))
                }}
                className="text-slate-500 hover:text-red-400 transition-colors ml-4 shrink-0"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StepNumberInput({
  question,
  value,
  onChange,
}: {
  question: string
  value: string
  onChange: (val: string) => void
}) {
  return (
    <div>
      <StepQuestion>{question}</StepQuestion>
      <div className="mt-8 flex items-center gap-4">
        <input
          type="number"
          min={1}
          className="w-40 bg-white/5 border border-white/15 rounded-xl px-5 py-4 text-white text-2xl font-semibold text-center placeholder-slate-600 focus:outline-none focus:border-blue-500/60 transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          placeholder="0"
          value={value}
          onChange={e => onChange(e.target.value)}
          autoFocus
        />
        <span className="text-slate-500 text-sm">people</span>
      </div>
    </div>
  )
}

function StepQuestion({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl sm:text-3xl font-bold leading-snug tracking-tight text-white">
      {children}
    </h2>
  )
}

// ─── Phase 3 Wizard ───────────────────────────────────────────────────────────

const MEDAL_ICONS = ['🥇', '🥈', '🥉'] as const

function GoalReminder({ goals }: { goals: string[] }) {
  if (goals.length === 0) return null
  return (
    <div className="mb-8 rounded-xl bg-white/5 border border-white/10 px-5 py-4">
      <div className="flex flex-col gap-2 mb-3">
        {goals.map((goal, i) => (
          <div key={goal} className="flex items-center gap-2.5 text-sm">
            <span className="text-base leading-none">{MEDAL_ICONS[i]}</span>
            <span className="text-slate-300 font-medium">{goal}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 border-t border-white/10 pt-3">
        Let&apos;s define what success looks like specifically for your process.
      </p>
    </div>
  )
}

function Phase3Wizard({
  step,
  data,
  goals,
  onChange,
  onContinue,
  onBack,
  canContinue,
}: {
  step: number
  data: Phase3Data
  goals: string[]
  onChange: (d: Phase3Data) => void
  onContinue: () => void
  onBack: () => void
  canContinue: boolean
}) {
  const progressPct = ((step - 1) / (PHASE3_TOTAL_STEPS - 1)) * 100

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10 shrink-0">
        <Link href="/" className="text-xl font-bold tracking-tight text-white hover:opacity-80 transition-opacity">
          Clarix
        </Link>
        <span className="text-sm text-slate-500">Step {step} of {PHASE3_TOTAL_STEPS}</span>
      </header>

      <div className="shrink-0 px-8 pt-8 pb-2 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
            Phase 3 of 6 — Outcome
          </span>
          <span className="text-xs text-slate-500">{step}/{PHASE3_TOTAL_STEPS}</span>
        </div>
        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          {Array.from({ length: PHASE3_TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i + 1 < step ? 'bg-blue-400' : i + 1 === step ? 'bg-cyan-400 scale-125' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-2xl">
          <GoalReminder goals={goals} />

          {step === 1 && (
            <StepTextArea
              question="What would success look like in 6 to 12 months? What would be different from today?"
              placeholder="Paint a picture of the ideal future state — what would you see, hear, or measure that would tell you this worked?"
              value={data.successVision}
              onChange={val => onChange({ ...data, successVision: val })}
              rows={7}
            />
          )}
          {step === 2 && (
            <StepTextArea
              question="Are there specific numbers or targets you are trying to hit?"
              placeholder="e.g. Reduce onboarding time from 14 to 7 days, cut errors by 50%, process 200 requests per week…"
              value={data.targets}
              onChange={val => onChange({ ...data, targets: val })}
              rows={6}
            />
          )}
          <div className="mt-10 flex items-center justify-between">
            <button
              onClick={onBack}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={onContinue}
              disabled={!canContinue}
              className="bg-blue-500 hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors shadow-lg shadow-blue-500/20"
            >
              {step === PHASE3_TOTAL_STEPS ? 'Submit' : 'Continue'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

// ─── Phase 3 Response Screen ──────────────────────────────────────────────────

function Phase3ResponseScreen({
  text,
  isStreaming,
  error,
  onContinue,
}: {
  text: string
  isStreaming: boolean
  error: string | null
  onContinue: () => void
}) {
  const loading = isStreaming && text.length === 0

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10 shrink-0">
        <Link href="/" className="text-xl font-bold tracking-tight text-white hover:opacity-80 transition-opacity">
          Clarix
        </Link>
        <div className="flex items-center gap-3">
          {isStreaming && (
            <span className="flex items-center gap-1.5 text-xs text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Analyzing…
            </span>
          )}
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
            Phase 3 — Outcome
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 py-12">
        <div className="w-full max-w-2xl">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-6 py-24">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
                <div className="absolute inset-0 rounded-full border-t-2 border-blue-400 animate-spin" />
              </div>
              <p className="text-slate-400 text-sm">Clarix is defining your success framework…</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-5 text-red-400 text-sm">
              {error}
            </div>
          )}

          {!loading && !error && text.length > 0 && (
            <>
              <div className="mb-8 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                </div>
                <span className="text-sm font-semibold text-blue-400 uppercase tracking-widest">Clarix</span>
              </div>

              <div className="prose-clarix">
                <MarkdownRenderer text={text} />
                {isStreaming && (
                  <span className="inline-block w-0.5 h-4 bg-blue-400 animate-pulse ml-0.5 align-middle" />
                )}
              </div>

              {!isStreaming && (
                <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-between">
                  <p className="text-xs text-slate-600 uppercase tracking-widest">Phase 3 of 6 complete</p>
                  <button
                    onClick={onContinue}
                    className="bg-blue-500 hover:bg-blue-400 text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors shadow-lg shadow-blue-500/20"
                  >
                    Continue to Phase 4 →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

// ─── Phase 4 Wizard ───────────────────────────────────────────────────────────

function Phase4SummaryCard({ phase1 }: { phase1: FormData }) {
  const areaLabel = PROCESS_AREAS.find(a => a.id === phase1.processArea)?.label ?? phase1.processArea
  const preview = phase1.problemDescription.length > 120
    ? phase1.problemDescription.slice(0, 117) + '…'
    : phase1.problemDescription

  return (
    <div className="mb-8 rounded-xl bg-white/5 border border-white/10 px-5 py-4 space-y-2.5">
      <div className="flex items-start gap-2.5 text-sm">
        <span className="text-slate-500 text-xs uppercase tracking-wider w-14 shrink-0 pt-0.5">Area</span>
        <span className="text-slate-300 font-medium">{areaLabel}</span>
      </div>
      {preview && (
        <div className="flex items-start gap-2.5 text-sm">
          <span className="text-slate-500 text-xs uppercase tracking-wider w-14 shrink-0 pt-0.5">Problem</span>
          <span className="text-slate-400 leading-relaxed">{preview}</span>
        </div>
      )}
      {phase1.goals.length > 0 && (
        <div className="flex items-start gap-2.5 text-sm">
          <span className="text-slate-500 text-xs uppercase tracking-wider w-14 shrink-0 pt-0.5">Goals</span>
          <span className="text-slate-400">{phase1.goals.join(' · ')}</span>
        </div>
      )}
    </div>
  )
}

function Phase4Wizard({
  step,
  data,
  phase1,
  onChange,
  onContinue,
  onBack,
  canContinue,
}: {
  step: number
  data: Phase4Data
  phase1: FormData
  phase3Response: string
  onChange: (d: Phase4Data) => void
  onContinue: () => void
  onBack: () => void
  canContinue: boolean
}) {
  const progressPct = ((step - 1) / (PHASE4_TOTAL_STEPS - 1)) * 100

  const toggleConstraint = (id: string) => {
    const next = data.constraints.includes(id)
      ? data.constraints.filter(c => c !== id)
      : [...data.constraints, id]
    onChange({ ...data, constraints: next })
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10 shrink-0">
        <Link href="/" className="text-xl font-bold tracking-tight text-white hover:opacity-80 transition-opacity">
          Clarix
        </Link>
        <span className="text-sm text-slate-500">Step {step} of {PHASE4_TOTAL_STEPS}</span>
      </header>

      <div className="shrink-0 px-8 pt-8 pb-2 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
            Phase 4 of 6 — TO-BE
          </span>
          <span className="text-xs text-slate-500">{step}/{PHASE4_TOTAL_STEPS}</span>
        </div>
        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          {Array.from({ length: PHASE4_TOTAL_STEPS }, (_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i + 1 < step ? 'bg-blue-400' : i + 1 === step ? 'bg-cyan-400 scale-125' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-2xl">

          {step === 1 && (
            <>
              <Phase4SummaryCard phase1={phase1} />
              <StepTextArea
                question="Does this proposed improvement direction feel realistic and aligned with your organization?"
                placeholder="Share your honest reaction — what fits, what doesn't, what might be harder than it looks…"
                value={data.directionFeedback}
                onChange={val => onChange({ ...data, directionFeedback: val })}
                rows={6}
              />
            </>
          )}

          {step === 2 && (
            <div>
              <StepQuestion>Are there any constraints I should know about?</StepQuestion>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8">
                {CONSTRAINT_OPTIONS.map(opt => {
                  const selected = data.constraints.includes(opt.id)
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleConstraint(opt.id)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left text-sm font-medium transition-all duration-150 ${
                        selected
                          ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
                        selected ? 'border-blue-400 bg-blue-400' : 'border-white/30'
                      }`}>
                        {selected && (
                          <svg viewBox="0 0 12 12" fill="none" className="w-2.5 h-2.5">
                            <polyline points="2 6 5 9 10 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      {opt.label}
                    </button>
                  )
                })}
              </div>
              {data.constraints.includes('other') && (
                <div className="mt-5">
                  <p className="text-sm text-slate-400 mb-3">Describe the constraint</p>
                  <textarea
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-5 py-4 text-white placeholder-slate-600 text-sm leading-relaxed resize-none focus:outline-none focus:border-blue-500/60 transition-colors"
                    placeholder="Describe any other constraints…"
                    value={data.constraintsOther}
                    onChange={e => onChange({ ...data, constraintsOther: e.target.value })}
                    rows={3}
                    autoFocus
                  />
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <StepTextArea
              question="Is there anything completely off the table — something that cannot change?"
              placeholder="e.g. We cannot change our current ERP system, we cannot add headcount…"
              value={data.offLimits}
              onChange={val => onChange({ ...data, offLimits: val })}
              rows={6}
            />
          )}

          <div className="mt-10 flex items-center justify-between">
            <button
              onClick={onBack}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={onContinue}
              disabled={!canContinue}
              className="bg-blue-500 hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors shadow-lg shadow-blue-500/20"
            >
              {step === PHASE4_TOTAL_STEPS ? 'Submit' : 'Continue'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

// ─── Phase 4 Response Screen ──────────────────────────────────────────────────

function Phase4ResponseScreen({
  text,
  diagrams,
  isStreaming,
  error,
  checkpoint,
  onCheckpoint,
}: {
  text: string
  diagrams: { toBeFlowchartSvg: string } | null
  isStreaming: boolean
  error: string | null
  checkpoint: string | null
  onCheckpoint: (choice: string) => void
}) {
  const loading = isStreaming && text.length === 0

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10 shrink-0">
        <Link href="/" className="text-xl font-bold tracking-tight text-white hover:opacity-80 transition-opacity">
          Clarix
        </Link>
        <div className="flex items-center gap-3">
          {isStreaming && (
            <span className="flex items-center gap-1.5 text-xs text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              {checkpoint === 'simplify' ? 'Simplifying…' : 'Analyzing…'}
            </span>
          )}
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
            Phase 4 — TO-BE
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 py-12">
        <div className="w-full max-w-2xl">
          {loading && (
            <div className="flex flex-col items-center justify-center gap-6 py-24">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
                <div className="absolute inset-0 rounded-full border-t-2 border-blue-400 animate-spin" />
              </div>
              <p className="text-slate-400 text-sm">
                {checkpoint === 'simplify'
                  ? 'Simplifying the improvement plan…'
                  : 'Clarix is building your TO-BE plan…'}
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-5 text-red-400 text-sm">
              {error}
            </div>
          )}

          {!loading && !error && text.length > 0 && (
            <>
              <div className="mb-8 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                </div>
                <span className="text-sm font-semibold text-blue-400 uppercase tracking-widest">Clarix</span>
              </div>

              <div className="prose-clarix">
                <MarkdownRenderer text={text} />
              </div>

              {!isStreaming && diagrams?.toBeFlowchartSvg && (
                <div className="mt-10">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Improved Process — TO-BE</p>
                  <div
                    className="rounded-xl overflow-hidden border border-white/10"
                    dangerouslySetInnerHTML={{ __html: diagrams.toBeFlowchartSvg }}
                  />
                </div>
              )}

              {!isStreaming && (
                <div className="mt-12 pt-8 border-t border-white/10">
                  <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Checkpoint 2</p>
                  <p className="text-sm text-slate-400 mb-6">How does this TO-BE plan look?</p>

                  {checkpoint === 'forward' ? (
                    <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-400">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Moving to Phase 5…
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <CheckpointButton
                        onClick={() => onCheckpoint('forward')}
                        icon={
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        }
                        label="Yes, let's move forward"
                        accent
                      />
                      <CheckpointButton
                        onClick={() => onCheckpoint('adjust')}
                        icon={
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                            <path d="M3 3v5h5" />
                          </svg>
                        }
                        label="I want to adjust something"
                      />
                      <CheckpointButton
                        onClick={() => onCheckpoint('simplify')}
                        icon={
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        }
                        label="This is too ambitious — simplify it"
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

// ─── Phase 5 Screen ───────────────────────────────────────────────────────────

const QUADRANT_META: Record<GapClassification, {
  label: string
  sub: string
  border: string
  headerBg: string
  headerText: string
  cardBorder: string
  cardBg: string
  dotColor: string
  moveBg: string
  moveText: string
}> = {
  'Quick Win': {
    label: 'Quick Wins',
    sub: 'High impact · Low effort',
    border: 'border-green-500/25',
    headerBg: 'bg-green-500/10',
    headerText: 'text-green-400',
    cardBorder: 'border-green-500/20',
    cardBg: 'bg-green-500/[0.04]',
    dotColor: 'bg-green-400',
    moveBg: 'bg-green-500/20 border-green-500/40',
    moveText: 'text-green-300',
  },
  'Strategic': {
    label: 'Strategic',
    sub: 'High impact · High effort',
    border: 'border-blue-500/25',
    headerBg: 'bg-blue-500/10',
    headerText: 'text-blue-400',
    cardBorder: 'border-blue-500/20',
    cardBg: 'bg-blue-500/[0.04]',
    dotColor: 'bg-blue-400',
    moveBg: 'bg-blue-500/20 border-blue-500/40',
    moveText: 'text-blue-300',
  },
  'Low Priority': {
    label: 'Low Priority',
    sub: 'Low impact · Low effort',
    border: 'border-white/10',
    headerBg: 'bg-white/5',
    headerText: 'text-slate-400',
    cardBorder: 'border-white/10',
    cardBg: 'bg-white/[0.03]',
    dotColor: 'bg-slate-500',
    moveBg: 'bg-white/10 border-white/20',
    moveText: 'text-slate-300',
  },
  'Reconsider': {
    label: 'Reconsider',
    sub: 'Low impact · High effort',
    border: 'border-red-500/25',
    headerBg: 'bg-red-500/10',
    headerText: 'text-red-400',
    cardBorder: 'border-red-500/20',
    cardBg: 'bg-red-500/[0.04]',
    dotColor: 'bg-red-400',
    moveBg: 'bg-red-500/20 border-red-500/40',
    moveText: 'text-red-300',
  },
}

const RATING_META: Record<GapRating, { bg: string; text: string; border: string }> = {
  High:   { bg: 'bg-amber-500/15',  text: 'text-amber-400',  border: 'border-amber-500/25' },
  Medium: { bg: 'bg-slate-500/20',  text: 'text-slate-300',  border: 'border-slate-500/25' },
  Low:    { bg: 'bg-green-500/15',  text: 'text-green-400',  border: 'border-green-500/25' },
}

const GAP_CATEGORIES: GapCategory[] = ['People', 'Process', 'Technology', 'Culture', 'External']
const GAP_CLASSIFICATIONS: GapClassification[] = ['Quick Win', 'Strategic', 'Low Priority', 'Reconsider']
const GAP_RATINGS: GapRating[] = ['High', 'Medium', 'Low']

function RatingBadge({ label, value }: { label: string; value: GapRating }) {
  const meta = RATING_META[value]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-semibold ${meta.bg} ${meta.text} ${meta.border}`}>
      <span className="opacity-60">{label}</span>
      {value}
    </span>
  )
}

function CategoryBadge({ category }: { category: GapCategory }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/8 border border-white/12 text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
      {category}
    </span>
  )
}

function GapCard({
  gap,
  reprioritizeMode,
  onMove,
}: {
  gap: Gap
  reprioritizeMode: boolean
  onMove: (id: string, classification: GapClassification) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const meta = QUADRANT_META[gap.classification]
  const hasDetail = gap.explanation || gap.impactReason || gap.effortReason || gap.costReason
  return (
    <div className={`rounded-lg border transition-all ${meta.cardBorder} ${meta.cardBg}`}>
      <div className="p-3 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-white leading-snug block">{gap.actionTitle || gap.name}</span>
            {gap.actionTitle && gap.name && (
              <span className="text-[11px] text-slate-500 leading-snug block mt-0.5"><span className="text-slate-600">Problem: </span>{gap.name}</span>
            )}
          </div>
          <CategoryBadge category={gap.category} />
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <RatingBadge label="Impact" value={gap.impact} />
            <RatingBadge label="Effort" value={gap.effort} />
            <RatingBadge label="Cost" value={gap.cost} />
          </div>
          {hasDetail && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="shrink-0 w-5 h-5 flex items-center justify-center rounded text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          )}
        </div>
      </div>
      {expanded && hasDetail && (
        <div className="px-3 pb-3 pt-0 border-t border-white/[0.06] space-y-2 mt-0">
          {gap.explanation && (
            <p className="text-xs text-slate-300 pt-2">{gap.explanation}</p>
          )}
          <div className="space-y-1 pt-1">
            {gap.impactReason && (
              <p className="text-[11px] text-slate-400"><span className="text-slate-500">Impact: </span>{gap.impactReason}</p>
            )}
            {gap.effortReason && (
              <p className="text-[11px] text-slate-400"><span className="text-slate-500">Effort: </span>{gap.effortReason}</p>
            )}
            {gap.costReason && (
              <p className="text-[11px] text-slate-400"><span className="text-slate-500">Cost: </span>{gap.costReason}</p>
            )}
          </div>
        </div>
      )}
      {reprioritizeMode && (
        <div className="px-3 pb-3 pt-0 border-t border-white/8 mt-0">
          <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1.5 pt-2">Move to</p>
          <div className="flex flex-wrap gap-1.5">
            {GAP_CLASSIFICATIONS.filter(c => c !== gap.classification).map(c => {
              const m = QUADRANT_META[c]
              return (
                <button
                  key={c}
                  onClick={() => onMove(gap.id, c)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-semibold transition-colors ${m.moveBg} ${m.moveText}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${m.dotColor}`} />
                  {c}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function GapQuadrant({
  classification,
  gaps,
  reprioritizeMode,
  onMove,
}: {
  classification: GapClassification
  gaps: Gap[]
  reprioritizeMode: boolean
  onMove: (id: string, c: GapClassification) => void
}) {
  const meta = QUADRANT_META[classification]
  return (
    <div className={`rounded-xl border-2 ${meta.border} flex flex-col`}>
      <div className={`${meta.headerBg} px-4 py-3 rounded-t-[10px] border-b ${meta.border}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${meta.dotColor}`} />
          <span className={`text-xs font-bold uppercase tracking-widest ${meta.headerText}`}>{meta.label}</span>
        </div>
        <p className="text-[10px] text-slate-600 mt-0.5">{meta.sub}</p>
      </div>
      <div className="p-3 flex flex-col gap-2 flex-1">
        {gaps.length === 0 ? (
          <p className="text-xs text-slate-700 text-center py-4">No gaps here</p>
        ) : (
          gaps.map(g => (
            <GapCard key={g.id} gap={g} reprioritizeMode={reprioritizeMode} onMove={onMove} />
          ))
        )}
      </div>
    </div>
  )
}

type AddGapFormState = {
  name: string
  category: GapCategory
  impact: GapRating
  effort: GapRating
  cost: GapRating
  classification: GapClassification
}

const EMPTY_ADD_FORM: AddGapFormState = {
  name: '',
  category: 'Process',
  impact: 'Medium',
  effort: 'Medium',
  cost: 'Medium',
  classification: 'Low Priority',
}

function RatingPicker({ label, value, onChange }: { label: string; value: GapRating; onChange: (v: GapRating) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500 w-14">{label}</span>
      <div className="flex gap-1">
        {GAP_RATINGS.map(r => {
          const meta = RATING_META[r]
          const active = value === r
          return (
            <button
              key={r}
              onClick={() => onChange(r)}
              className={`px-3 py-1 rounded-md text-xs font-semibold border transition-all ${
                active
                  ? `${meta.bg} ${meta.text} ${meta.border}`
                  : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
              }`}
            >
              {r}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Phase5Screen({
  status,
  gaps,
  error,
  onGapsChange,
  onForward,
}: {
  status: 'loading' | 'done' | 'error'
  gaps: Gap[]
  error: string | null
  onGapsChange: (gaps: Gap[]) => void
  onForward: () => void
}) {
  const [reprioritizeMode, setReprioritizeMode] = useState(false)
  const [addGapMode, setAddGapMode] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [addForm, setAddForm] = useState<AddGapFormState>(EMPTY_ADD_FORM)

  const quadrantGaps = (c: GapClassification) => gaps.filter(g => g.classification === c)

  const handleMove = (id: string, classification: GapClassification) => {
    onGapsChange(gaps.map(g => g.id === id ? { ...g, classification } : g))
  }

  const handleAddGap = () => {
    if (!addForm.name.trim()) return
    onGapsChange([...gaps, { id: `gap-custom-${Date.now()}`, ...addForm, actionTitle: '', explanation: '', impactReason: '', effortReason: '', costReason: '' }])
    setAddForm(EMPTY_ADD_FORM)
    setAddGapMode(false)
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10 shrink-0">
        <Link href="/" className="text-xl font-bold tracking-tight text-white hover:opacity-80 transition-opacity">
          Clarix
        </Link>
        <div className="flex items-center gap-3">
          {status === 'loading' && (
            <span className="flex items-center gap-1.5 text-xs text-blue-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Analyzing…
            </span>
          )}
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
            Phase 5 — Gap Analysis
          </span>
        </div>
      </header>

      <div className="shrink-0 px-8 pt-8 pb-2 max-w-5xl mx-auto w-full">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">
            Phase 5 of 6 — Gap Analysis
          </span>
        </div>
        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full w-full transition-all duration-700" />
        </div>
      </div>

      <main className="flex-1 px-6 py-10">
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center gap-6 py-32">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
              <div className="absolute inset-0 rounded-full border-t-2 border-blue-400 animate-spin" />
            </div>
            <p className="text-slate-400 text-sm">Clarix is identifying the gaps…</p>
          </div>
        )}

        {status === 'error' && (
          <div className="max-w-xl mx-auto rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-5 text-red-400 text-sm">
            {error ?? 'Something went wrong. Please try again.'}
          </div>
        )}

        {status === 'done' && (
          <div className="max-w-5xl mx-auto">

            {/* Axis labels */}
            <div className="flex items-center justify-between text-[10px] text-slate-600 uppercase tracking-widest mb-2 px-1">
              <span>← Low effort</span>
              <span>High effort →</span>
            </div>

            {/* 2×2 Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(['Quick Win', 'Strategic', 'Low Priority', 'Reconsider'] as GapClassification[]).map(c => (
                <GapQuadrant
                  key={c}
                  classification={c}
                  gaps={quadrantGaps(c)}
                  reprioritizeMode={reprioritizeMode}
                  onMove={handleMove}
                />
              ))}
            </div>

            {/* Reprioritize done bar */}
            {reprioritizeMode && (
              <div className="mt-6 flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs text-slate-400">Click any gap to move it to a different quadrant.</p>
                <button
                  onClick={() => setReprioritizeMode(false)}
                  className="bg-blue-500 hover:bg-blue-400 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
                >
                  Done reprioritizing
                </button>
              </div>
            )}

            {/* Add gap form */}
            {addGapMode && (
              <div className="mt-6 rounded-xl border border-white/15 bg-white/5 p-5">
                <h3 className="text-sm font-semibold text-white mb-5">Add a missing gap</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Gap name — short and specific (e.g. No standard handoff process)"
                    value={addForm.name}
                    onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-blue-500/60 transition-colors"
                    autoFocus
                  />

                  {/* Category row */}
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Category</p>
                    <div className="flex flex-wrap gap-2">
                      {GAP_CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setAddForm({ ...addForm, category: cat })}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                            addForm.category === cat
                              ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                              : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Ratings */}
                  <div className="space-y-2">
                    <RatingPicker label="Impact" value={addForm.impact} onChange={v => setAddForm({ ...addForm, impact: v })} />
                    <RatingPicker label="Effort" value={addForm.effort} onChange={v => setAddForm({ ...addForm, effort: v })} />
                    <RatingPicker label="Cost" value={addForm.cost} onChange={v => setAddForm({ ...addForm, cost: v })} />
                  </div>

                  {/* Classification */}
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Quadrant</p>
                    <div className="flex flex-wrap gap-2">
                      {GAP_CLASSIFICATIONS.map(cls => {
                        const m = QUADRANT_META[cls]
                        const active = addForm.classification === cls
                        return (
                          <button
                            key={cls}
                            onClick={() => setAddForm({ ...addForm, classification: cls })}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                              active ? `${m.moveBg} ${m.moveText}` : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${m.dotColor}`} />
                            {cls}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-1">
                    <button
                      onClick={() => { setAddGapMode(false); setAddForm(EMPTY_ADD_FORM) }}
                      className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddGap}
                      disabled={!addForm.name.trim()}
                      className="bg-blue-500 hover:bg-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
                    >
                      Add gap
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Checkpoint 3 */}
            {!reprioritizeMode && !addGapMode && (
              <div className="mt-10 pt-8 border-t border-white/10">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Checkpoint 3</p>
                <p className="text-sm text-slate-400 mb-6">Does this gap analysis look complete and correctly prioritized?</p>

                {confirmed ? (
                  <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 shrink-0">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Building the action plan…
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <CheckpointButton
                      onClick={() => { setConfirmed(true); onForward() }}
                      icon={
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      }
                      label="Yes, build the action plan"
                      accent
                    />
                    <CheckpointButton
                      onClick={() => setReprioritizeMode(true)}
                      icon={
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                          <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                      }
                      label="Reprioritize something"
                    />
                    <CheckpointButton
                      onClick={() => setAddGapMode(true)}
                      icon={
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      }
                      label="There is a gap I don't see here"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

// ─── Phase 6 Components ────────────────────────────────────────────────────────

const CLASSIFICATION_STYLE: Record<GapClassification, { bg: string; border: string; badge: string }> = {
  'Quick Win':    { bg: 'bg-emerald-950/40', border: 'border-emerald-700/40', badge: 'bg-emerald-700/30 text-emerald-300' },
  'Strategic':   { bg: 'bg-blue-950/40',    border: 'border-blue-700/40',    badge: 'bg-blue-700/30 text-blue-300' },
  'Low Priority':{ bg: 'bg-white/[0.03]',   border: 'border-white/10',       badge: 'bg-white/10 text-slate-400' },
  'Reconsider':  { bg: 'bg-amber-950/30',   border: 'border-amber-700/30',   badge: 'bg-amber-700/20 text-amber-400' },
}

function ActionCardComponent({ card }: { card: ActionCard }) {
  const style = CLASSIFICATION_STYLE[card.classification]
  return (
    <div className={`rounded-xl border p-6 ${style.bg} ${style.border}`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${style.badge} mr-2`}>
            {card.classification}
          </span>
          <span className="text-xs text-slate-500">{card.category}</span>
        </div>
        <span className="text-xs text-slate-500 whitespace-nowrap">{card.timeline}</span>
      </div>
      <h3 className="text-base font-semibold text-white mb-1">{card.actionTitle || card.gapName}</h3>
      {card.problemStatement && (
        <p className="text-sm text-slate-400 mb-4"><span className="text-slate-500 font-medium">Problem: </span>{card.problemStatement}</p>
      )}

      <div className="mb-4">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Recommendation</p>
        <p className="text-sm text-slate-200">{card.recommendation}</p>
      </div>

      <div className="mb-4">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Action Steps</p>
        <ol className="space-y-1">
          {card.steps.map((step, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-300">
              <span className="text-slate-500 shrink-0">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Responsible</p>
          <p className="text-sm text-slate-200">{card.responsibleRole}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-0.5">KPI</p>
          <p className="text-sm text-slate-200">{card.kpi}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-slate-500 mb-0.5">Expected Benefit</p>
          <p className="text-sm text-slate-200">{card.expectedBenefit}</p>
        </div>
      </div>
    </div>
  )
}

function ChangeManagementSection({ cm }: { cm: ChangeManagement }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 space-y-6">
      <h2 className="text-lg font-semibold text-white">Change Management</h2>

      {cm.keyStakeholders.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Key Stakeholders</p>
          <div className="flex flex-wrap gap-2">
            {cm.keyStakeholders.map((s, i) => (
              <span key={i} className="text-sm bg-white/[0.06] text-slate-300 px-3 py-1 rounded-full">{s}</span>
            ))}
          </div>
        </div>
      )}

      {cm.resistanceItems.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Resistance &amp; Response</p>
          <div className="space-y-3">
            {cm.resistanceItems.map((item, i) => (
              <div key={i} className="rounded-lg bg-white/[0.04] border border-white/5 p-4">
                <p className="text-sm font-medium text-slate-200 mb-1">{item.stakeholder}</p>
                <p className="text-sm text-slate-400 mb-2"><span className="text-slate-500">Concern: </span>{item.concern}</p>
                <p className="text-sm text-slate-300"><span className="text-slate-500">Response: </span>{item.response}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {cm.communicationPlan.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Communication Plan</p>
          <ul className="space-y-2">
            {cm.communicationPlan.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-slate-300">
                <span className="text-slate-500 mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function Phase6Screen({
  status,
  plan,
  error,
}: {
  status: 'loading' | 'done' | 'error'
  plan: ActionPlan | null
  error: string | null
}) {
  const quickWins = plan?.actions.filter(a => a.classification === 'Quick Win') ?? []
  const strategic = plan?.actions.filter(a => a.classification === 'Strategic') ?? []
  const others = plan?.actions.filter(a => a.classification !== 'Quick Win' && a.classification !== 'Strategic') ?? []

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10 shrink-0">
        <Link href="/" className="text-xl font-bold tracking-tight text-white hover:opacity-80 transition-opacity">
          Clarix
        </Link>
        <span className="text-sm text-slate-500">Phase 6 of 6 — Action Plan</span>
      </header>

      <div className="w-full h-1 bg-white/5">
        <div className="h-1 bg-indigo-500 transition-all duration-500" style={{ width: '100%' }} />
      </div>

      <main className="flex-1 px-6 py-10 max-w-3xl mx-auto w-full">
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Clarix is building your action plan…</p>
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-xl border border-red-700/40 bg-red-950/30 p-6 text-center">
            <p className="text-red-400 text-sm">{error ?? 'Something went wrong. Please try again.'}</p>
          </div>
        )}

        {status === 'done' && plan && (
          <div className="space-y-10">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Action Plan</h1>
              <p className="text-slate-400 text-sm">Prioritized actions to close your identified gaps.</p>
            </div>

            {plan.ganttSvg && (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Implementation Timeline</p>
                <div
                  className="rounded-xl overflow-hidden border border-white/10"
                  dangerouslySetInnerHTML={{ __html: plan.ganttSvg }}
                />
              </div>
            )}

            {quickWins.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-sm font-semibold text-emerald-400 uppercase tracking-widest">Quick Wins</h2>
                {quickWins.map(card => <ActionCardComponent key={card.gapId} card={card} />)}
              </section>
            )}

            {strategic.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-sm font-semibold text-blue-400 uppercase tracking-widest">Strategic Initiatives</h2>
                {strategic.map(card => <ActionCardComponent key={card.gapId} card={card} />)}
              </section>
            )}

            {others.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Other Actions</h2>
                {others.map(card => <ActionCardComponent key={card.gapId} card={card} />)}
              </section>
            )}

            {plan.changeManagement && (
              <ChangeManagementSection cm={plan.changeManagement} />
            )}

            <div className="pt-4 flex justify-center">
              <button
                onClick={() => window.print()}
                className="generate-report-btn px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors text-base"
              >
                Generate Final Report
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
