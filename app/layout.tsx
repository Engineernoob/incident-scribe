import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Incident Scribe",
    template: "%s • Incident Scribe",
  },
  description:
    "Deterministic incident documentation generator: status updates, postmortems, and action items from logs and timelines.",
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "Incident Scribe",
    description:
      "Generate deterministic incident docs (status updates, postmortems, action items) from logs and timelines.",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary",
    title: "Incident Scribe",
    description:
      "Generate deterministic incident docs (status updates, postmortems, action items) from logs and timelines.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <div className="relative">
          {/* subtle background */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_20%_0%,rgba(255,255,255,0.06),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_80%_10%,rgba(255,255,255,0.05),transparent_60%)]" />
            <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-size-[48px_48px]" />
          </div>

          {/* app shell */}
          <header className="relative border-b border-zinc-800/70 bg-zinc-950/70 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <div className="flex items-baseline gap-3">
                <span className="text-lg font-semibold tracking-tight">
                  Incident Scribe
                </span>
                <span className="text-xs text-zinc-400">
                  deterministic incident docs
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <span className="hidden sm:inline">
                  Status • Postmortem • Actions
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950 px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Local
                </span>
              </div>
            </div>
          </header>

          <main className="relative mx-auto max-w-6xl px-6 py-8">
            {children}
          </main>

          <footer className="relative border-t border-zinc-800/70">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-xs text-zinc-500">
              <span>Incident Scribe • Built for repeatable incident docs</span>
              <span className="hidden sm:inline">
                Redaction • Parsing • Templates • Tests
              </span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
