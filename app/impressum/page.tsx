import Link from 'next/link'

export default function Impressum() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <Link href="/" className="text-xl font-bold tracking-tight text-white">
          Clarix
        </Link>
      </nav>

      {/* Content */}
      <main className="flex-1 px-6 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Impressum</h1>
          <p className="text-sm text-slate-500 mb-10">Legal notice pursuant to § 5 TMG / § 5 DDG</p>

          <div className="space-y-8 text-slate-300 leading-relaxed text-sm">
            <section>
              <h2 className="text-lg font-semibold text-white mb-2">Company</h2>
              <p>
                Eleve Company OÜ
                <br />
                Sepapaja tn 6, 15551 Tallinn
                <br />
                Lasnamäe linnaosa, Estonia
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">Represented by</h2>
              <p>Maria Belén Forti</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">Contact</h2>
              <p>
                Email: <span className="text-white">eleve.eu@outlook.com</span>
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">Responsible for content</h2>
              <p>
                Pursuant to § 18 (2) MStV (Medienstaatsvertrag): Maria Belén Forti, address as
                above.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">Dispute resolution</h2>
              <p>
                The European Commission provides a platform for online dispute resolution (OS):{' '}
                <a
                  href="https://ec.europa.eu/consumers/odr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  ec.europa.eu/consumers/odr
                </a>
                . We are not obligated and generally not willing to participate in dispute
                resolution proceedings before a consumer arbitration board.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 px-8 flex items-center justify-between">
        <span className="text-sm font-bold text-white">Clarix</span>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            Terms of Use
          </Link>
          <a href="#" id="open_preferences_center" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            Cookie Preferences
          </a>
          <p className="text-xs text-slate-600">© 2026 Eleve Company OÜ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
