import Image from "next/image";

export default function NotFound() {
  return (
    <main className="min-h-dvh bg-black text-white flex flex-col items-center justify-center overflow-hidden px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/40 via-black to-black" />
      <div className="relative w-full max-w-md">
        <div className="border border-neutral-800 rounded-3xl overflow-hidden bg-black/60 shadow-2xl">
          <div className="p-8">
            <div className="flex items-center justify-between gap-3 text-[11px] sm:text-sm uppercase tracking-[0.1em] text-neutral-400">
              <Image src="/logo.svg" alt="Maxiphy logo" width={110} height={28} priority />
              <span className="text-neutral-200">Page not found</span>
            </div>

            <div className="mt-10 space-y-3">
              <p className="text-xs text-neutral-400 uppercase tracking-[0.1em]">Error 404</p>
              <h1 className="text-3xl font-semibold leading-tight">This page doesn’t exist</h1>
              <p className="text-neutral-300 text-sm">
                The link might be wrong, or the page may have been moved.
              </p>
            </div>
          </div>

          {/* <div className="px-8 pb-7"> */}
            {/* <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-800 to-transparent" /> */}
            {/* <p className="mt-5 text-xs text-neutral-500">
              Tip: go back and pick a year, then select a recipient.
            </p> */}
          {/* </div> */}
        </div>
      </div>
    </main>
  );
}
