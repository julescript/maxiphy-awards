"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toPng } from "html-to-image";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

export default function ClientAwardPage({ year, person }) {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const cardRef = useRef(null);
  const swiperRef = useRef(null);

  const awards = useMemo(() => person?.awards ?? [], [person]);
  const current = awards[index] ?? awards[0];

  const startSlideshow = () => {
    setStarted(true);
    setIndex(0);

    requestAnimationFrame(() => {
      const swiper = swiperRef.current;
      if (!swiper) return;
      swiper.slideToLoop?.(0, 0);
      swiper.autoplay?.start?.();
    });
  };

  const downloadImage = async () => {
    if (!cardRef.current) return;
    const dataUrl = await toPng(cardRef.current, {
      cacheBust: true,
      pixelRatio: 2,
      style: { transform: "scale(1)" },
    });
    const link = document.createElement("a");
    link.download = `${person.slug}-${year}-award.png`;
    link.href = dataUrl;
    link.click();
  };

  const shareImage = async () => {
    if (!cardRef.current) return;

    const title = `${person.name} | ${year} Maxiphy Awards`;
    const text = `${current.title} – ${current.subtitle}`;
    const url = typeof window !== "undefined" ? window.location.href : undefined;

    if (!navigator.share) {
      await downloadImage();
      return;
    }

    const dataUrl = await toPng(cardRef.current, {
      cacheBust: true,
      pixelRatio: 2,
    });

    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `${person.slug}-${year}-award.png`, {
        type: "image/png",
      });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title,
          text,
        });
        return;
      }

      await navigator.share({ title, text, url });
    } catch {
      await downloadImage();
    }
  };

  return (
    <main className="h-dvh bg-black text-white flex flex-col items-center overflow-hidden">
      <div className="w-full max-w-screen-sm md:max-w-5xl flex flex-col h-full space-y-3">
        <section className="flex-1 w-full flex flex-col gap-3 overflow-hidden min-h-0">
          <AnimatePresence mode="wait" initial={false}>
            {!started ? (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="w-full h-full flex-1 min-h-0 flex items-center justify-center p-3 md:p-6"
              >
                <motion.div
                  initial={{ scale: 0.98 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="relative border border-neutral-800 rounded-3xl overflow-hidden bg-black shadow-2xl w-full max-w-[440px] md:max-w-[900px] h-full"
                  style={{ aspectRatio: "3 / 4" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/40 via-black to-black" />
                  <div className="relative h-full flex flex-col justify-between p-8 md:p-12">
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05, duration: 0.35, ease: "easeOut" }}
                      className="flex items-center justify-between gap-3 text-[11px] sm:text-sm uppercase tracking-[0.1em] text-neutral-400"
                    >
                      <Image src="/logo.svg" alt="Maxiphy logo" width={110} height={28} priority />
                      <span className="text-neutral-200">{year} Office Awards</span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12, duration: 0.35, ease: "easeOut" }}
                      className="flex-1 flex flex-col items-center justify-center text-center gap-1"
                    >
                      <div className="w-64 aspect-square overflow-hidden relative mb-4">
                        <Image
                          src="/award-image.png"
                          alt="Award"
                          fill
                          sizes="400px"
                          className="object-cover object-center scale-[1.01]"
                          style={{
                            objectFit: "cover",
                            objectPosition: "center",
                            transform: "scale(1.00)",
                          }}
                        />
                        <motion.svg
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0"
                          viewBox="0 0 100 100"
                          preserveAspectRatio="xMidYMid slice"
                        >
                          <defs>
                            <filter id="shineGlow" x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur stdDeviation="1.2" result="blur" />
                              <feColorMatrix
                                in="blur"
                                type="matrix"
                                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.9 0"
                                result="glow"
                              />
                              <feMerge>
                                <feMergeNode in="glow" />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                            <linearGradient id="shineGradient" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="white" stopOpacity="0" />
                              <stop offset="40%" stopColor="white" stopOpacity="0" />
                              <stop offset="50%" stopColor="white" stopOpacity="0.95" />
                              <stop offset="60%" stopColor="white" stopOpacity="0" />
                              <stop offset="100%" stopColor="white" stopOpacity="0" />
                            </linearGradient>

                            <mask
                              id="awardMask"
                              maskUnits="userSpaceOnUse"
                              maskContentUnits="userSpaceOnUse"
                              x="0"
                              y="0"
                              width="100"
                              height="100"
                            >
                              <image
                                href="/award-image.png"
                                xlinkHref="/award-image.png"
                                x="0"
                                y="0"
                                width="100"
                                height="100"
                                preserveAspectRatio="xMidYMid slice"
                              />
                            </mask>
                          </defs>

                          <g mask="url(#awardMask)" style={{ mixBlendMode: "screen" }}>
                            <motion.rect
                              x={-120}
                              y={0}
                              width={170}
                              height={100}
                              fill="url(#shineGradient)"
                              filter="url(#shineGlow)"
                              initial={{ x: -120, opacity: 0 }}
                              animate={{ x: 120, opacity: [0, 1, 0] }}
                              transition={{
                                duration: 1.6,
                                ease: "easeInOut",
                                repeat: Infinity,
                                repeatDelay: 1.0,
                              }}
                            />
                          </g>
                        </motion.svg>
                      </div>
                      <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">
                        {person.name}
                      </h1>
                      <p className="text-neutral-400 text-sm sm:text-base">{person.role}</p>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18, duration: 0.35, ease: "easeOut" }}
                      className="flex items-center justify-between"
                    >
                      <span className="text-xs sm:text-sm text-neutral-500">
                        {String(awards.length).padStart(1, "0")} AWARDS
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={startSlideshow}
                        className="h-11 px-5 rounded-full border border-neutral-800 text-white hover:border-white transition text-sm font-medium"
                      >
                        Start
                      </motion.button>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="swiper"
                initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="w-full h-full flex-1 min-h-0 flex"
              >
                <Swiper
                  modules={[Autoplay]}
                  autoplay={{ delay: 5000, disableOnInteraction: false }}
                  loop
                  onSwiper={(s) => {
                    swiperRef.current = s;
                  }}
                  onSlideChange={(s) => setIndex(s.realIndex)}
                  className="w-full h-full"
                >
                  {awards.map((award, i) => (
                    <SwiperSlide
                      key={award.title}
                      className="flex items-center justify-center h-full p-3 md:p-6"
                    >
                      <motion.div
                        key={`${started}-${award.title}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        whileHover={{ scale: 1.005 }}
                        className="relative border border-neutral-800 rounded-3xl overflow-hidden bg-black shadow-2xl w-full max-w-[440px] md:max-w-[900px] h-full"
                        style={{ aspectRatio: "3 / 4" }}
                        ref={i === index ? cardRef : null}
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/40 via-black to-black" />
                        <div className="relative h-full flex flex-col justify-between p-8 md:p-12">
                          <div className="flex items-center justify-between gap-3 text-[11px] sm:text-sm uppercase tracking-[0.1em] text-neutral-400">
                            <Image src="/logo.svg" alt="Maxiphy logo" width={110} height={28} priority />
                            <span className="text-neutral-200">{year} Office Awards</span>
                          </div>
                          <div className="space-y-5 md:space-y-7 h-full">
                            <div className="w-full h-2 md:h-3" />
                            <div className="relative w-full aspect-square rounded-3xl border border-neutral-800 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 overflow-hidden">
                              {award.image ? (
                                <Image
                                  src={award.image}
                                  alt={award.title}
                                  fill
                                  sizes="(max-width: 768px) 100vw, 900px"
                                  className="object-cover object-center scale-[1.03]"
                                  style={{
                                    objectFit: "cover",
                                    objectPosition: "center",
                                    transform: "scale(1.03)",
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-neutral-500 text-xs uppercase tracking-[0.1em]">
                                    Award Image
                                  </span>
                                </div>
                              )}
                            </div>
                            <AnimatePresence mode="wait" initial={false}>
                              <motion.div
                                key={award.title}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="space-y-5 md:space-y-7 text-left mt-auto"
                              >
                                <div className="space-y-2">
                                  <p className="text-xs text-neutral-400 uppercase">2025 office Award</p>
                                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight">
                                    {award.title}
                                  </h2>
                                  <p className="text-sm sm:text-base md:text-lg text-neutral-300 max-w-2xl">
                                    {award.subtitle}
                                  </p>
                                </div>
                              </motion.div>
                            </AnimatePresence>
                          </div>

                          <div className="flex items-center justify-between text-[12px] sm:text-sm text-neutral-500">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-neutral-400">
                                {person.name} · {person.role}
                              </span>
                              <span>
                                AWARD {String(index + 1).padStart(1, "0")} OF {" "}
                                {String(awards.length).padStart(1, "0")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {/* <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={shareImage}
                                aria-label="Share award card"
                                className="h-10 w-10 rounded-full border border-neutral-800 text-white flex items-center justify-center text-base hover:border-white transition"
                              >
                                ⤴︎
                              </motion.button> */}
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={downloadImage}
                                aria-label="Download award card"
                                className="h-10 w-10 rounded-full border border-neutral-800 text-white flex items-center justify-center text-base hover:border-white transition"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                >
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="7 10 12 15 17 10" />
                                  <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
