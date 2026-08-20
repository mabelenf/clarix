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
          <p className="text-sm text-slate-500 mb-10">Last updated: August 2026</p>

          <div className="space-y-8 text-slate-300 leading-relaxed text-sm">
            <section>
              <h2 className="text-lg font-semibold text-white mb-2">1. Who we are</h2>
              <p>
                Clarix (&quot;we&quot;, &quot;our&quot;) provides an AI-powered business process
                analysis tool. This policy explains what personal data we collect when you visit
                this site, submit the contact form, or use the analysis tool, why we collect it,
                and what rights you have over it.
              </p>
              <p className="mt-2">
                Data controller: <span className="text-white">Eleve Company OÜ</span>, operating
                under the name <span className="text-white">Clarix</span>. Registered address:{' '}
                <span className="text-white">Sepapaja tn 6, 15551 Tallinn, Lasnamäe linnaosa, Estonia</span>.
                Contact details are listed in Section 8 below.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">2. What data we collect</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <span className="text-white font-medium">Contact form data:</span> when you
                  click &quot;Start my diagnosis&quot; or &quot;Book a 45-min session&quot; and
                  submit the form, we collect your first name, last name, role, company name, and
                  work email address.
                </li>
                <li>
                  <span className="text-white font-medium">Analysis input:</span> if you use the
                  process analysis tool, the workflow description, answers you provide, and any
                  documents you upload are processed to generate your report. This content is sent
                  to a third-party AI provider (Anthropic) for processing, and may include names
                  or details about employees, clients, or business partners if you choose to
                  include them in your answers. We ask that you avoid sharing personal data about
                  third parties beyond what is necessary for the analysis.
                </li>
                <li>
                  <span className="text-white font-medium">Server logs:</span> our hosting
                  provider (Vercel) automatically records IP addresses and basic request metadata
                  (browser type, page visited, timestamp) as part of standard server operation.
                </li>
                <li>
                  <span className="text-white font-medium">Cookies:</span> see our cookie banner
                  and preferences center, linked in the footer, for details on the cookies used on
                  this site and to manage your consent.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">3. Why we collect it and our legal basis</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <span className="text-white font-medium">Contact form:</span> to respond to your
                  request, schedule a session, or provide access to the diagnosis tool. Legal
                  basis: your consent (given via the checkbox on the form) and, once we&apos;re in
                  contact, steps taken at your request prior to entering into a contract (Art.
                  6(1)(a) and (b) GDPR).
                </li>
                <li>
                  <span className="text-white font-medium">Analysis input:</span> to generate the
                  process report you requested. Legal basis: performance of a contract or steps
                  taken at your request (Art. 6(1)(b) GDPR).
                </li>
                <li>
                  <span className="text-white font-medium">Server logs:</span> to keep the site
                  secure and operating correctly. Legal basis: legitimate interest (Art. 6(1)(f)
                  GDPR).
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">4. How long we keep it</h2>
              <p>
                Contact form submissions are kept for as long as needed to respond to your request
                and, if you become a customer, for the duration of that relationship plus any
                period required by law. Analysis input is retained only as long as needed to
                generate and deliver your report, unless you ask us to keep it longer. You can
                request earlier deletion at any time — see Section 6.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">5. Third parties who process your data</h2>
              <p>We rely on the following processors to operate this site and deliver the service:</p>
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
                  <span className="text-white font-medium">Supabase</span> (database — stores
                  contact form submissions) —{' '}
                  <a
                    href="https://supabase.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Supabase Privacy Policy
                  </a>
                </li>
                <li>
                  <span className="text-white font-medium">Anthropic</span> (AI processing of
                  analysis input) —{' '}
                  <a
                    href="https://www.anthropic.com/legal/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    Anthropic Privacy Policy
                  </a>
                </li>
                <li>
                  <span className="text-white font-medium">TermsFeed</span> (cookie consent
                  management) —{' '}
                  <a
                    href="https://www.termsfeed.com/privacy-policy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    TermsFeed Privacy Policy
                  </a>
                </li>
              </ul>
              <p className="mt-2">
                Some of these providers may process data outside the EU/EEA, including in the
                United States. Where this happens, we rely on the safeguards each provider offers
                (such as Standard Contractual Clauses) to protect your data. We do not sell your
                data or share it with advertisers.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">6. Your rights</h2>
              <p>
                If you are located in the EU/EEA (or another jurisdiction with similar
                protections), you have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Access the personal data we hold about you</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Request deletion of your data (&quot;right to be forgotten&quot;)</li>
                <li>Restrict or object to certain processing</li>
                <li>Receive your data in a portable format</li>
                <li>Withdraw consent at any time, without affecting processing carried out before the withdrawal</li>
                <li>
                  Lodge a complaint with your local data protection authority — see{' '}
                  <a
                    href="https://edpb.europa.eu/about-edpb/about-edpb/members_en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    a list of EU supervisory authorities
                  </a>
                </li>
              </ul>
              <p className="mt-2">
                To exercise any of these rights, contact us using the details in Section 8. We
                will respond within the timeframes required by applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">7. Children&apos;s privacy</h2>
              <p>
                This site and service are intended for business use by adults. We do not knowingly
                collect personal data from children.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">8. Contact</h2>
              <p>
                For privacy-related questions or to exercise your rights, reach out at{' '}
                <span className="text-white">consulting.mariabelenforti@gmail.com</span>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-2">9. Changes to this policy</h2>
              <p>
                We may update this policy as the product evolves. We&apos;ll update the &quot;Last
                updated&quot; date above when we do. Significant changes will be highlighted on
                this page.
              </p>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 px-8 flex items-center justify-between">
        <span className="text-sm font-bold text-white">Clarix</span>
        <div className="flex items-center gap-4">
          <a href="#" id="open_preferences_center" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            Cookie Preferences
          </a>
          <p className="text-xs text-slate-600">© 2026 Eleve Company OÜ. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
