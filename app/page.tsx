'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Intent = 'diagnosis' | 'session'

const ROLE_OPTIONS = [
  'Owner / Founder',
  'Operations Manager',
  'General Manager',
  'Consultant',
  'Other',
]

export default function Home() {
  const router = useRouter()

  const [modalOpen, setModalOpen] = useState(false)
  const [intent, setIntent] = useState<Intent>('diagnosis')
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [submittedName, setSubmittedName] = useState('')

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    role: '',
    company: '',
    email: '',
    consent: false,
  })

  function openModal(newIntent: Intent) {
    setIntent(newIntent)
    setStep('form')
    setError('')
    setForm({ firstName: '', lastName: '', role: '', company: '', email: '', consent: false })
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          role: form.role,
          company: form.company,
          email: form.email,
          intent,
        }),
      })
      if (!res.ok) throw new Error('Request failed with status ' + res.status)
      setSubmittedName(form.firstName)
      setStep('success')
    } catch (err) {
      console.error('Leads API error:', err)
      setError('Something went wrong on our end — please try again in a moment.')
    } finally {
      setSubmitting(false)
    }
  }

  function handlePrimarySuccessAction() {
    if (intent === 'diagnosis') {
      router.push('/analyze')
    } else {
      closeModal()
    }
  }

  return (
    <div className="font-sans min-h-screen bg-[#0f172a] text-white">
      {/* ---------- NAV ---------- */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#0f172a]/85 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-5xl items-center justify-between px-6 sm:px-8">
          <span className="text-xl font-extrabold tracking-tight">Clarix</span>
          <div className="hidden gap-8 text-sm text-slate-400 sm:flex">
            <a href="#problem" className="hover:text-white transition-colors">The problem</a>
            <a href="#process" className="hover:text-white transition-colors">How it works</a>
            <a href="#output" className="hover:text-white transition-colors">What you get</a>
          </div>
          <button
            onClick={() => openModal('diagnosis')}
            className="rounded-full bg-blue-500 px-5 py-2.5 text-sm font-semibold shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-400"
          >
            Get started
          </button>
        </div>
      </nav>

      {/* ---------- HERO ---------- */}
      <section className="px-6 pt-24 text-center sm:px-8">
        <div className="mx-auto max-w-5xl">
          <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wide text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            AI-powered process analysis
          </span>

          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Analyze your business.
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Get a clear action plan.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
            Clarix guides your team step by step, maps the process, pinpoints where it&apos;s
            stuck, and hands you a presentation-ready action plan — no consultancy required.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
            <button
              onClick={() => openModal('diagnosis')}
              className="rounded-full bg-blue-500 px-8 py-4 text-[15px] font-semibold shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-400"
            >
              Start my diagnosis →
            </button>
            <button
              onClick={() => openModal('session')}
              className="rounded-full border border-white/20 px-8 py-4 text-[15px] font-semibold transition-colors hover:border-white/35 hover:bg-white/5"
            >
              Book a 45-min session
            </button>
          </div>

          {/* Comparison strip */}
          <div className="mx-auto mt-16 grid max-w-4xl grid-cols-1 overflow-hidden rounded-[20px] border border-white/10 bg-[#141f38] text-left sm:grid-cols-[1fr_1px_1fr]">
            <div className="px-9 py-8">
              <div className="mb-3.5 font-mono text-[11px] uppercase tracking-widest text-slate-500">
                Traditional consulting
              </div>
              <div className="mb-1.5 text-3xl font-extrabold">6–12 weeks</div>
              <div className="mb-5 text-[13px] text-slate-400">
                And a budget in the tens of thousands
              </div>
              <ul className="space-y-0">
                {[
                  'Meetings, proposals, timelines',
                  "Depends on someone else's calendar",
                  'Generic report, hard to act on',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex gap-2.5 border-t border-white/10 py-2 text-sm text-slate-400"
                  >
                    <span className="text-rose-400">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="hidden bg-white/10 sm:block" />

            <div className="bg-gradient-to-b from-blue-500/10 to-transparent px-9 py-8">
              <div className="mb-3.5 font-mono text-[11px] uppercase tracking-widest text-cyan-400">
                With Clarix
              </div>
              <div className="mb-1.5 text-3xl font-extrabold">One guided session</div>
              <div className="mb-5 text-[13px] text-slate-400">At a fraction of the cost</div>
              <ul className="space-y-0">
                {[
                  'Start today, at your own pace',
                  'The agent asks the right questions',
                  'Specific, executable action plan',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex gap-2.5 border-t border-white/10 py-2 text-sm text-slate-300"
                  >
                    <span className="text-cyan-400">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- PROBLEM ---------- */}
      <section id="problem" className="border-t border-white/10 px-6 py-24 sm:px-8">
        <div className="mx-auto grid max-w-5xl gap-14 sm:grid-cols-2">
          <div>
            <div className="mb-4 font-mono text-xs uppercase tracking-widest text-blue-400">
              The problem
            </div>
            <h2 className="mb-4 max-w-md text-3xl font-extrabold tracking-tight sm:text-4xl">
              You already feel that something&apos;s not working.
            </h2>
            <p className="max-w-md text-[16.5px] text-slate-400">
              With a 100-person team, the problem doesn&apos;t live in a spreadsheet. It lives in
              these signals your team repeats every week:
            </p>
          </div>
          <div>
            {[
              { icon: '↻', text: 'The same tasks get redone two or three times before they\u2019re right.' },
              { icon: '?', text: 'No one\u2019s quite sure who\u2019s responsible when something breaks.' },
              { icon: '⧗', text: 'Deadlines slip "a little" all the time, and nobody questions it anymore.' },
              { icon: '$', text: 'Hiring a consultancy sounds like months of waiting and a budget you don\u2019t have.' },
            ].map((item, i, arr) => (
              <div
                key={item.text}
                className={`flex gap-4 border-t border-white/10 py-5 ${i === arr.length - 1 ? 'border-b' : ''}`}
              >
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/5 text-[13px] text-slate-400">
                  {item.icon}
                </div>
                <p className="pt-0.5 text-[15.5px] text-slate-300">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- PROCESS ---------- */}
      <section id="process" className="border-t border-white/10 px-6 py-24 sm:px-8">
        <div className="mx-auto grid max-w-5xl gap-14 sm:grid-cols-2">
          <div>
            <div className="mb-4 font-mono text-xs uppercase tracking-widest text-blue-400">
              How it works
            </div>
            <h2 className="mb-4 max-w-md text-3xl font-extrabold tracking-tight sm:text-4xl">
              A senior consultant, turned into a guided flow.
            </h2>
            <p className="max-w-md text-[16.5px] text-slate-400">
              The agent asks one question at a time, and shows you what it&apos;s building at
              every step so you can validate before moving on.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#141f38] p-2">
            {[
              { n: '01', title: 'Context & goal', desc: 'Tell us which process is bothering you and what you want to achieve.', active: true },
              { n: '02', title: 'Where things stand today', desc: 'The agent maps the process and pinpoints where it\u2019s stuck.' },
              { n: '03', title: 'A better way to run it', desc: 'Proposes an improved version, realistic for your team.' },
              { n: '04', title: 'Action plan', desc: 'Turns every gap into steps, owners, and KPIs.' },
            ].map((row, i) => (
              <div
                key={row.n}
                className={`flex gap-4 rounded-xl px-4 py-[18px] ${i > 0 ? 'border-t border-white/10' : ''}`}
              >
                <div className={`w-5 flex-shrink-0 pt-0.5 font-mono text-xs ${row.active ? 'text-cyan-400' : 'text-slate-500'}`}>
                  {row.n}
                </div>
                <div>
                  <div className="mb-1 text-[15px] font-semibold">{row.title}</div>
                  <div className="text-[13.5px] leading-relaxed text-slate-400">{row.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- OUTPUT ---------- */}
      <section id="output" className="border-t border-white/10 px-6 py-24 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 font-mono text-xs uppercase tracking-widest text-blue-400">
            What you walk away with
          </div>
          <h2 className="mb-4 max-w-xl text-3xl font-extrabold tracking-tight sm:text-4xl">
            A document you can bring to the leadership table.
          </h2>
          <p className="max-w-xl text-[16.5px] text-slate-400">
            Not a loose idea. An exportable PDF that answers what&apos;s happening, what to do,
            who does it, and how to measure it.
          </p>

          <div className="mt-12 grid gap-11 sm:grid-cols-[0.9fr_1.1fr] sm:items-center">
            <div className="rounded-2xl border border-white/10 bg-[#141f38] p-7 shadow-[0_30px_80px_-40px_rgba(59,130,246,0.35)]">
              <div className="mb-5 flex items-center justify-between">
                <div className="font-mono text-[11px] uppercase tracking-wide text-slate-500">
                  Action plan · Clarix
                </div>
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  ))}
                </div>
              </div>
              <div className="mb-4 text-[19px] font-bold">Customer service</div>
              {['w-[85%]', 'w-[70%]', 'w-1/2', 'w-2/5'].map((w, i) => (
                <div key={i} className={`mb-2.5 h-2 rounded ${w} bg-white/10`} />
              ))}
              <div className="mt-5 flex flex-wrap gap-2">
                {['Quick win', 'Owner: A. Green', '4 weeks'].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-blue-500/25 bg-blue-500/15 px-3 py-1.5 text-[11px] font-semibold text-blue-400"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            <ul>
              {[
                { b: 'Executive summary', s: 'One page, ready to read before the meeting' },
                { b: 'Current state & root causes', s: 'Visual map of the process today' },
                { b: 'Improvement proposal', s: 'Realistic for your size and resources' },
                { b: 'Prioritized gaps', s: 'What to tackle first, and why' },
                { b: 'Action plan with KPIs', s: 'Owners, timelines, metrics' },
              ].map((item, i, arr) => (
                <li
                  key={item.b}
                  className={`flex items-start gap-3.5 border-t border-white/10 py-3.5 ${i === arr.length - 1 ? 'border-b' : ''}`}
                >
                  <span className="pt-0.5 font-mono text-sm text-cyan-400">✓</span>
                  <div>
                    <b className="block text-[15px] font-bold">{item.b}</b>
                    <small className="text-[13px] text-slate-400">{item.s}</small>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section className="border-t border-white/10 px-6 py-28 text-center sm:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="mx-auto max-w-xl text-4xl font-extrabold tracking-tight sm:text-[42px]">
            Pick the process that&apos;s{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              keeping you up at night.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-sm text-slate-400">
            In one guided session, today, you&apos;ll have the diagnosis and the plan ready to
            present.
          </p>
          <button
            onClick={() => openModal('diagnosis')}
            className="mt-9 rounded-full bg-blue-500 px-8 py-4 text-[15px] font-semibold shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-400"
          >
            Start my free diagnosis →
          </button>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-[13px] text-slate-500 sm:px-8">
        Clarix — AI-powered process analysis for SMEs
      </footer>

      {/* ---------- LEAD FORM MODAL ---------- */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#060a14]/75 p-5 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          <div className="max-h-[90vh] w-full max-w-[440px] overflow-y-auto rounded-[20px] border border-white/20 bg-[#141f38] p-9 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.6)]">
            <div className="mb-2 flex justify-end">
              <button
                onClick={closeModal}
                aria-label="Close"
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            </div>

            {step === 'form' ? (
              <>
                <div className="mb-3.5 font-mono text-[11px] uppercase tracking-widest text-blue-400">
                  {intent === 'session' ? 'Book a 45-min session' : 'Start my diagnosis'}
                </div>
                <h3 className="mb-2 text-[22px] font-bold tracking-tight">
                  {intent === 'session' ? "Let's find a time to talk" : 'Tell us a bit about you'}
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-slate-400">
                  {intent === 'session'
                    ? "Tell us a bit about you and we'll follow up to schedule your session."
                    : "We'll use this to tailor your session — takes under a minute."}
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="mb-4 grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-slate-300">
                        First name
                      </label>
                      <input
                        type="text"
                        required
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        className="w-full rounded-[10px] border border-white/20 bg-white/[0.04] px-3.5 py-3 text-[14.5px] outline-none transition-colors focus:border-blue-400 focus:bg-white/[0.06]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-slate-300">
                        Last name
                      </label>
                      <input
                        type="text"
                        required
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        className="w-full rounded-[10px] border border-white/20 bg-white/[0.04] px-3.5 py-3 text-[14.5px] outline-none transition-colors focus:border-blue-400 focus:bg-white/[0.06]"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="mb-1.5 block text-[13px] font-medium text-slate-300">
                      Your role
                    </label>
                    <select
                      required
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="w-full rounded-[10px] border border-white/20 bg-white/[0.04] px-3.5 py-3 text-[14.5px] outline-none transition-colors focus:border-blue-400 focus:bg-white/[0.06]"
                    >
                      <option value="" disabled>
                        Select your role
                      </option>
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="mb-1.5 block text-[13px] font-medium text-slate-300">
                      Company
                    </label>
                    <input
                      type="text"
                      required
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      className="w-full rounded-[10px] border border-white/20 bg-white/[0.04] px-3.5 py-3 text-[14.5px] outline-none transition-colors focus:border-blue-400 focus:bg-white/[0.06]"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="mb-1.5 block text-[13px] font-medium text-slate-300">
                      Work email
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-[10px] border border-white/20 bg-white/[0.04] px-3.5 py-3 text-[14.5px] outline-none transition-colors focus:border-blue-400 focus:bg-white/[0.06]"
                    />
                  </div>

                  <div className="mb-5">
                    <label className="flex cursor-pointer items-start gap-2.5">
                      <input
                        type="checkbox"
                        required
                        checked={form.consent}
                        onChange={(e) => setForm({ ...form, consent: e.target.checked })}
                        className="mt-0.5 h-4 w-4 flex-shrink-0 accent-blue-500"
                      />
                      <span className="text-[13px] leading-relaxed text-slate-400">
                        I agree to the{' '}
                        <Link href="/privacy" target="_blank" className="text-blue-400 underline">
                          Privacy Policy
                        </Link>{' '}
                        and to be contacted by Clarix about my request.
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-full bg-blue-500 py-4 text-[15px] font-semibold transition-colors hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? 'Submitting…' : 'Continue →'}
                  </button>

                  {error && (
                    <p className="mt-3.5 rounded-[10px] border border-rose-400/30 bg-rose-400/10 px-3.5 py-2.5 text-center text-[13px] text-rose-400">
                      {error}
                    </p>
                  )}
                </form>
              </>
            ) : (
              <div className="py-3 text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 text-2xl text-cyan-400">
                  ✓
                </div>
                <h3 className="mb-2 text-xl font-bold">
                  {intent === 'session'
                    ? `Thanks for reaching out${submittedName ? ', ' + submittedName : ''}.`
                    : `You're all set${submittedName ? ', ' + submittedName : ''}.`}
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-slate-400">
                  {intent === 'session'
                    ? "We appreciate you booking time with us. You'll receive an email shortly with available time slots for your 45-minute session."
                    : 'A complete diagnosis takes about 15–20 minutes. We recommend taking the time to answer thoughtfully — the more detail you share, the better the results for your business.'}
                </p>
                <button
                  onClick={handlePrimarySuccessAction}
                  className="w-full rounded-full bg-blue-500 py-4 text-[15px] font-semibold transition-colors hover:bg-blue-400"
                >
                  {intent === 'session' ? 'Done' : 'Continue to diagnosis →'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
