import { redirect } from "next/navigation";
import Image from "next/image";

export default function Home() {
  if (process.env.NODE_ENV !== "development") {
    redirect("https://card.maxiphy.com");
  }

  return (
    <main className="min-h-dvh bg-black text-white flex items-center justify-center px-6">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/40 via-black to-black" />
        <div className="absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-neutral-800/20 blur-3xl" />
      </div>

      <div className="relative">
        <Image src="/logo.svg" alt="Maxiphy logo" width={180} height={46} priority />
      </div>
    </main>
  );
}
