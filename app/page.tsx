import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <span className="text-xl font-bold tracking-tight text-white">Clarix</span>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-10">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-slate-300 text-xs font-medium px-4 py-1.5 rounded-full mb-8 tracking-wide uppercase">
          AI-Powered Process Analysis
        </div>

        <h1 className="font-bold tracking-tight">
          <span className="block text-5xl sm:text-6xl lg:text-7xl leading-tight text-white">
            Analyze your business.
          </span>
          <span className="block text-5xl sm:text-6xl lg:text-7xl leading-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            Get a clear action plan.
          </span>
        </h1>

        <p className="mt-5 text-lg text-slate-400 max-w-xl leading-relaxed">
          Describe your workflow, upload your docs, and let Clarix&apos;s AI agent surface inefficiencies and generate a presentation-ready improvement plan.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <Link href="/analyze" className="bg-blue-500 hover:bg-blue-400 text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors shadow-lg shadow-blue-500/20">
            Start New Analysis
          </Link>
          <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
            See how it works →
          </a>
        </div>
      </main>

      {/* Feature strip */}
      <section className="border-t border-white/10 py-16 px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
          {[
            {
              title: "Instant Diagnosis",
              desc: "The AI agent maps your process and pinpoints bottlenecks in minutes, not weeks.",
            },
            {
              title: "Actionable Output",
              desc: "Get prioritized recommendations formatted for exec decks and team briefings.",
            },
            {
              title: "Any Process",
              desc: "From onboarding to supply chain — Clarix handles any workflow you throw at it.",
            },
          ].map((f) => (
            <div key={f.title} className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
              </div>
              <h3 className="font-semibold text-white">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
 <footer className="border-t border-white/10 py-6 px-8 flex items-center justify-between">
  <span className="text-sm font-bold text-white">Clarix</span>
  <div className="flex items-center gap-4">
   <Link href="/privacy" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
      Privacy Policy
    </Link>
    <a href="#" id="open_preferences_center" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
      Cookie Preferences
    </a>
    <p className="text-xs text-slate-600">© 2026 Clarix. All rights reserved.</p>
  </div>
      </footer>
    </div>
  );
}
