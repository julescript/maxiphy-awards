import Link from "next/link";
import Image from "next/image";
import { awardsByYear, years } from "@/data/awards";

export default function Home() {
  return (
    <main className="min-h-dvh bg-black text-white px-6 py-12 sm:py-16">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/40 via-black to-black" />
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-neutral-800/20 blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto space-y-10 sm:space-y-14">
        <header className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image src="/logo.svg" alt="Maxiphy logo" width={120} height={30} priority />
              <span className="text-[11px] sm:text-sm uppercase tracking-[0.1em] text-neutral-400">
                Office Awards
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-semibold">Awards by Year</h1>
            <p className="text-neutral-400 max-w-2xl">
              Browse each year and open a teammate’s page to view or export their awards card.
            </p>
          </div>
        </header>

        <div className="space-y-8 sm:space-y-10">
          {years.map((year) => (
            <section key={year} className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase tracking-[0.1em] text-neutral-500">
                    Year
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-semibold">{year}</h2>
                </div>
                <span className="text-xs text-neutral-500">
                  {String(awardsByYear[year].length).padStart(1, "0")} recipients
                </span>
              </div>

              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                {awardsByYear[year].map((person) => (
                  <Link
                    key={person.slug}
                    href={`/${year}/${person.slug}`}
                    className="group relative border border-neutral-800 rounded-2xl overflow-hidden bg-black/60 hover:border-white transition"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/40 via-black to-black" />
                    <div className="relative p-5 sm:p-6 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-lg sm:text-xl font-semibold leading-tight">
                          {person.name}
                        </div>
                        <div className="text-sm text-neutral-400">{person.role}</div>
                        <div className="pt-3">
                          <span className="inline-flex items-center rounded-full border border-neutral-800 bg-black/40 px-3 py-1 text-[11px] uppercase tracking-[0.1em] text-neutral-400 group-hover:border-white/70 group-hover:text-white transition">
                            Open Awards
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-end gap-2">
                        <span className="text-xs text-neutral-500 group-hover:text-neutral-200 transition">
                          View
                        </span>
                        <span className="h-9 w-9 rounded-full border border-neutral-800 bg-black/50 text-white flex items-center justify-center group-hover:border-white transition">
                          →
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
