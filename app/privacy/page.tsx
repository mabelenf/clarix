import Link from 'next/link'

export default function Privacy() {
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
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-sm text-slate-500 mb-10">Last updated: July 2026</p>

          <div className="space-y-8 text-slate-300 leading-relaxed text-sm">
            <section>
              <h2 className="text-lg font-semibold text-white mb-2">1. Who we are</h2>
              <p>
                Clarix (&quot;we&quot;, &quot;our&quot;) provides an AI-powered process analysis tool.
                This page explains what data is collected when you visit this site or use the
                analysis tool, and how it is handled.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">2. What data we collect</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <span className="text-white font-medium">Server logs:</span> our hosting
                  provider (Vercel) automatically records IP addresses and basic request
                  metadata (browser type, page visited, timestamp) as part of standard server
                  operation.
                </li>
                <li>
                  <span className="text-white font-medium">Analysis input:</span> if you use the
                  &quot;Start New Analysis&quot; tool, the workflow description and any documents
                  you upload are processed in order to generate your report. This content is sent
                  to a third-party AI provider (Anthropic) for processing.
                </li>
                <li>
                  <span className="text-white font-medium">No account data:</span> this site does
                  not currently require sign-up, so we do not collect names, emails, or passwords.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">3. How we use this data</h2>
              <p>
                Data submitted to the analysis tool is used solely to generate your process report.
                Server logs are used only for security, debugging, and understanding basic site
                traffic. We do not sell or share your data with advertisers.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">4. Third-party processors</h2>
              <p>We rely on the following third-party services to operate this site:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>
                  <span className="text-white font-medium">Vercel</span> (hosting) —{' '}
                  <a
                    href="https://vercel.com/legal/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Vercel Privacy Policy
                  </a>
                </li>
                <li>
                  <span className="text-white font-medium">Anthropic</span> (AI processing) —{' '}
                  <a
                    href="https://www.anthropic.com/legal/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Anthropic Privacy Policy
                  </a>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">5. Your rights</h2>
              <p>
                If you are located in the EU/EEA, you have the right to access, correct, or
                request deletion of your personal data under the GDPR. Since this site does not
                store analysis submissions long-term beyond what is needed to generate your
                report, most requests can be resolved simply by not submitting further data.
                For any questions or requests, contact us at the email below.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">6. Contact</h2>
              <p>
                For privacy-related questions, reach out at{' '}
                <span className="text-white">[your-email@example.com]</span>.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 px-8 flex items-center justify-between">
        <span className="text-sm font-bold text-white">Clarix</span>
        <p className="text-xs text-slate-600">© 2026 Clarix. All rights reserved.</p>
      </footer>
    </div>
  );
}
