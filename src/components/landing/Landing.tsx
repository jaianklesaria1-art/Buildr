"use client";

import { useState } from "react";
import { motion } from "motion/react";
import ThemeToggle from "./ThemeToggle";
import TypingWord from "./TypingWord";

const ZONES = [
  {
    key: "jobs",
    label: "Job Seeker",
    gradient: "from-blue-500 to-indigo-600",
    blurb: "Find roles at pre-seed to Series A startups — matched by skills, not keywords.",
    points: ["Skills-first matching, not resume keyword scanning", "Early access before public job boards", "Swipe through roles, apply in one tap"],
  },
  {
    key: "cofounder",
    label: "Cofounder",
    gradient: "from-fuchsia-500 to-purple-600",
    blurb: "Find a technical or business cofounder who matches your stage and risk appetite.",
    points: ["Soft NDA before idea details are shared", "See risk tolerance and stage up front", "Video intros instead of static bios"],
  },
  {
    key: "freelancer",
    label: "Freelancer",
    gradient: "from-amber-500 to-orange-600",
    blurb: "Find gigs, set your own rate, keep full independence.",
    points: ["You set your rate — no bidding wars", "Zero platform lock-in", "No hidden fees taken off your pay"],
  },
];

const STEPS = [
  { title: "Pick your zone", desc: "Job seeker, cofounder, freelancer — or all three. One account, no duplicate profiles." },
  { title: "Build one real profile", desc: "Skills, rate or equity expectations, a short video intro. Takes minutes, not hours." },
  { title: "Swipe through matches", desc: "A filtered deck built from your profile — not a public feed everyone scrolls the same way." },
  { title: "Match, then talk", desc: "Chat only opens once both sides say yes. Cofounder matches get a soft NDA first." },
];

const COMPARISON = [
  { feature: "Discovery", them: "Endless public feed, same for everyone", us: "A private deck filtered to your profile" },
  { feature: "Idea protection", them: "None — post publicly or not at all", us: "Soft NDA gate before cofounder details" },
  { feature: "Freelance fees", them: "Platform cut on every payment", us: "You set the rate, no fee skimmed" },
  { feature: "Your data", them: "Sold or shared with third parties", us: "Used only for matching — never sold" },
];

const FAQ = [
  {
    q: "Is buildr. free?",
    a: "Yes. Creating a profile, swiping, matching, and messaging are free while we build out the product. Any future paid tier will be optional, not a paywall on core features.",
  },
  {
    q: "How does matching actually work?",
    a: "Right now it's skills, rate/budget, stage, and location filters — not a black-box AI. You see a deck built from your profile, and every swipe teaches us what to show you next.",
  },
  {
    q: "Is this like Tinder or Bumble, but for work?",
    a: "Pretty much. Swipe right to apply or express interest, left to pass. A match only opens a chat when both sides say yes — no cold DMs.",
  },
  {
    q: "What happens to my data?",
    a: "It's used to match you and to improve the product — never sold to third parties. You'll always see a plain-language notice before submitting sensitive details like your resume or equity terms.",
  },
  {
    q: "Can I be in more than one zone?",
    a: "Yes — one account can be a job seeker, a cofounder-seeker, and a freelancer at the same time. Switch between them from one dashboard.",
  },
];

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export default function Landing() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white text-neutral-900 dark:bg-[#0a0a0f] dark:text-white">
      {/* Ambient background */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[120px] dark:bg-indigo-500/20" />
        <div className="absolute top-1/3 -right-40 h-[400px] w-[400px] rounded-full bg-fuchsia-500/10 blur-[100px] dark:bg-fuchsia-500/15" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-transparent bg-white/70 backdrop-blur-lg dark:bg-[#0a0a0f]/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="text-xl font-bold tracking-tight">
            buildr.
          </a>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <a href="#zones" className="text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white">
              Zones
            </a>
            <a href="#how" className="text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white">
              How it works
            </a>
            <a href="#faq" className="text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white">
              FAQ
            </a>
            <a href="/login" className="text-neutral-600 transition-colors hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white">
              Sign in
            </a>
            <a
              href="/signup"
              className="rounded-full bg-neutral-900 px-4 py-2 text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              Get started
            </a>
            <ThemeToggle />
          </nav>
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-white/10"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mobileOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="flex flex-col gap-1 border-t border-neutral-100 px-6 py-4 text-sm font-medium dark:border-white/10 md:hidden">
            <a href="#zones" className="rounded-lg px-3 py-2 hover:bg-neutral-100 dark:hover:bg-white/10">Zones</a>
            <a href="#how" className="rounded-lg px-3 py-2 hover:bg-neutral-100 dark:hover:bg-white/10">How it works</a>
            <a href="#faq" className="rounded-lg px-3 py-2 hover:bg-neutral-100 dark:hover:bg-white/10">FAQ</a>
            <a href="/login" className="rounded-lg px-3 py-2 hover:bg-neutral-100 dark:hover:bg-white/10">Sign in</a>
            <a href="/signup" className="mt-1 rounded-lg bg-neutral-900 px-3 py-2 text-center text-white dark:bg-white dark:text-neutral-900">Get started</a>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="mx-auto flex max-w-4xl flex-col items-center px-6 pt-20 pb-16 text-center sm:pt-28">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-neutral-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
          </span>
          Now in early access
        </div>
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
          Find your next
        </h1>
        <h2 className="mt-1 min-h-[1.2em] bg-gradient-to-r from-blue-500 via-fuchsia-500 to-amber-500 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl md:text-7xl">
          <TypingWord words={["job", "cofounder", "freelance gig"]} />
        </h2>
        <p className="mt-6 max-w-xl text-lg text-neutral-600 dark:text-neutral-400">
          One app, three zones. Swipe through people and opportunities matched
          to your profile — not a public feed everyone scrolls the same way.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="/signup"
            className="rounded-full bg-neutral-900 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-neutral-900/10 transition-transform hover:scale-[1.03] dark:bg-white dark:text-neutral-900"
          >
            Join for free
          </a>
          <a
            href="#how"
            className="rounded-full border border-neutral-300 px-8 py-3.5 text-base font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-white/15 dark:text-neutral-200 dark:hover:bg-white/5"
          >
            See how it works
          </a>
        </div>
      </section>

      {/* Zone cards */}
      <Section>
        <div id="zones" className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Three zones. One account.</h2>
            <p className="mx-auto mt-3 max-w-2xl text-neutral-600 dark:text-neutral-400">
              Pick the ones that matter to you — switch between them anytime.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {ZONES.map((zone) => (
              <div
                key={zone.key}
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-transform hover:-translate-y-1 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <div className={`h-2 bg-gradient-to-r ${zone.gradient}`} />
                <div className="p-6">
                  <h3 className="text-xl font-semibold">{zone.label}</h3>
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">{zone.blurb}</p>
                  <ul className="mt-4 space-y-2">
                    {zone.points.map((point) => (
                      <li key={point} className="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                        <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Comparison */}
      <Section>
        <div className="mx-auto max-w-4xl px-6 py-16">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Not another feed to scroll</h2>
            <p className="mx-auto mt-3 max-w-xl text-neutral-600 dark:text-neutral-400">
              Job boards, cofounder forums, and freelance marketplaces all work the same way. buildr. doesn&apos;t.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-white/10">
            <div className="grid grid-cols-3 divide-x divide-neutral-200 text-sm dark:divide-white/10">
              <div className="bg-neutral-50 p-4 font-semibold dark:bg-white/[0.02]" />
              <div className="bg-neutral-50 p-4 text-center font-semibold text-neutral-500 dark:bg-white/[0.02] dark:text-neutral-400">
                Typical platforms
              </div>
              <div className="bg-indigo-50 p-4 text-center font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                buildr.
              </div>
            </div>
            {COMPARISON.map((row) => (
              <div key={row.feature} className="grid grid-cols-3 divide-x divide-neutral-100 border-t border-neutral-100 text-sm dark:divide-white/5 dark:border-white/5">
                <div className="p-4 font-medium">{row.feature}</div>
                <div className="p-4 text-center text-neutral-500 dark:text-neutral-400">{row.them}</div>
                <div className="p-4 text-center font-medium text-indigo-700 dark:text-indigo-300">{row.us}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* How it works */}
      <Section>
        <div id="how" className="mx-auto max-w-3xl px-6 py-16">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
          </div>
          <div className="flex flex-col gap-4">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex items-start gap-4 rounded-2xl border border-neutral-200 p-5 dark:border-white/10"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white dark:bg-white dark:text-neutral-900">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Swipe visual */}
      <Section>
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Swipe, don&apos;t search</h2>
              <p className="mt-4 text-neutral-600 dark:text-neutral-400">
                Every card in your deck is already filtered by your skills, rate,
                or stage. Drag right to apply or express interest, left to pass.
                No search bar, no keyword guessing.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" /> Jobs filtered by your skills
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-fuchsia-500" /> Cofounders filtered by stage & risk tolerance
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> Gigs filtered by budget & skills
                </li>
              </ul>
            </div>
            <div className="relative mx-auto h-[420px] w-[280px]">
              <div className="absolute inset-0 rounded-[2rem] border-[10px] border-neutral-900 bg-neutral-900 shadow-2xl dark:border-neutral-700">
                <div className="relative h-full w-full overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-fuchsia-500 to-purple-600">
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-6 pt-16 text-left text-white">
                    <p className="text-xs font-medium uppercase tracking-wide text-white/80">Pre-seed</p>
                    <h3 className="text-lg font-bold">Alex Rivera</h3>
                    <p className="text-sm text-white/90">Fintech · Risk: Medium</p>
                  </div>
                  <span className="absolute top-6 right-6 rotate-12 rounded-lg border-[3px] border-green-400 bg-white/90 px-3 py-1 text-lg font-extrabold uppercase text-green-500">
                    Like
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Pricing */}
      <Section>
        <div className="mx-auto max-w-md px-6 py-16">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Free to join</h2>
            <p className="mx-auto mt-3 max-w-xl text-neutral-600 dark:text-neutral-400">
              Core features are free while we build. No credit card required.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 p-8 dark:border-white/10">
            <p className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">Free</p>
            <p className="mt-1 text-4xl font-bold">$0</p>
            <ul className="mt-6 space-y-3 text-sm">
              {["Unlimited swiping in every zone", "Full profile across all three zones", "Match-gated messaging", "Soft NDA for cofounder chats"].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="/signup"
              className="mt-8 block rounded-xl bg-neutral-900 py-3 text-center text-sm font-semibold text-white dark:bg-white dark:text-neutral-900"
            >
              Join for free
            </a>
            <p className="mt-3 text-center text-xs text-neutral-400">More plans as we grow — no surprise paywalls.</p>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section>
        <div id="faq" className="mx-auto max-w-3xl px-6 py-16">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Frequently asked questions</h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-neutral-200 bg-white p-5 open:bg-neutral-50 dark:border-white/10 dark:bg-white/[0.02] dark:open:bg-white/[0.04]"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                  {item.q}
                  <svg
                    className="h-5 w-5 shrink-0 text-neutral-400 transition-transform group-open:rotate-45"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </summary>
                <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </Section>

      {/* Final CTA */}
      <Section>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <div className="rounded-3xl border border-neutral-200 bg-gradient-to-br from-blue-50 via-fuchsia-50 to-amber-50 p-12 dark:border-white/10 dark:from-blue-500/10 dark:via-fuchsia-500/10 dark:to-amber-500/10">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to stop scrolling?</h2>
            <p className="mx-auto mt-3 max-w-md text-neutral-600 dark:text-neutral-400">
              Build one profile, pick your zones, start swiping.
            </p>
            <a
              href="/signup"
              className="mt-8 inline-block rounded-full bg-neutral-900 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-transform hover:scale-[1.03] dark:bg-white dark:text-neutral-900"
            >
              Create your free account
            </a>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t border-neutral-100 dark:border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-neutral-500 sm:flex-row dark:text-neutral-400">
          <span className="font-semibold text-neutral-700 dark:text-neutral-200">buildr.</span>
          <nav className="flex flex-wrap items-center justify-center gap-6">
            <a href="/signup" className="hover:text-neutral-900 dark:hover:text-white">Get started</a>
            <a href="/login" className="hover:text-neutral-900 dark:hover:text-white">Sign in</a>
            <a href="#faq" className="hover:text-neutral-900 dark:hover:text-white">FAQ</a>
          </nav>
          <span>© {new Date().getFullYear()} buildr.</span>
        </div>
      </footer>
    </div>
  );
}
