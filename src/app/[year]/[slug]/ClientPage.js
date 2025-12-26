"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toPng } from "html-to-image";
import Image from "next/image";
import { getTotalAwards } from "@/data/awards";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

export default function ClientAwardPage({ year, person }) {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const cardRef = useRef(null);
  const swiperRef = useRef(null);

  const parseJoinedDate = (raw) => {
    if (!raw || typeof raw !== "string") return null;
    const s = raw.trim();
    if (!s) return null;

    const iso = /^\d{4}-\d{2}-\d{2}$/;
    const dmy = /^\d{2}-\d{2}-\d{4}$/;

    if (iso.test(s)) {
      const [yyyy, mm, dd] = s.split("-").map((n) => Number(n));
      const dt = new Date(yyyy, mm - 1, dd);
      return Number.isNaN(dt.getTime()) ? null : dt;
    }

    if (dmy.test(s)) {
      const [dd, mm, yyyy] = s.split("-").map((n) => Number(n));
      const dt = new Date(yyyy, mm - 1, dd);
      return Number.isNaN(dt.getTime()) ? null : dt;
    }

    const fallback = new Date(s);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  };

  const awards = useMemo(() => person?.awards ?? [], [person]);
  const slides = useMemo(() => {
    const statsSlide = { type: "stats" };
    const awardSlides = awards.map((award) => ({ type: "award", award }));
    return [statsSlide, ...awardSlides];
  }, [awards]);

  const activeSlide = slides[index] ?? slides[0];
  const activeAward = activeSlide?.type === "award" ? activeSlide.award : null;

  const updateActiveCardRef = (swiper) => {
    const activeEl = swiper?.slides?.[swiper.activeIndex];
    const card = activeEl?.querySelector?.("[data-award-card]") ?? null;
    if (card) cardRef.current = card;
  };

  const goToNextSlide = () => {
    swiperRef.current?.slideNext?.();
  };

  const stats = useMemo(() => {
    const joinedDateRaw = person?.joinedDate;
    const joined = parseJoinedDate(joinedDateRaw);

    const workHoursPerWeek =
      typeof person?.workHoursPerWeek === "number" ? person.workHoursPerWeek : 45;
    const meetingsPerWeek =
      typeof person?.meetingsPerWeek === "number" ? person.meetingsPerWeek : 8;

    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);
    const safeMsRaw =
      joined && !Number.isNaN(joined.getTime()) ? endOfYear - joined : null;
    const safeMs = safeMsRaw == null ? null : Math.max(0, safeMsRaw);
    const totalHours = safeMs == null ? null : Math.floor(safeMs / (1000 * 60 * 60));
    const totalDays = safeMs == null ? null : Math.floor(safeMs / (1000 * 60 * 60 * 24));
    const years = safeMs == null ? null : Math.floor(totalDays / 365);
    const months = safeMs == null ? null : Math.floor(totalDays / 30.4375);
    const totalWeeks = safeMs == null ? null : safeMs / (1000 * 60 * 60 * 24 * 7);
    const workedHours =
      totalWeeks == null ? null : Math.floor(totalWeeks * workHoursPerWeek);
    const meetingsCount =
      totalWeeks == null ? null : Math.floor(totalWeeks * meetingsPerWeek);

    const awardsCount = getTotalAwards(person?.id);
    const longestTitle = awards.reduce(
      (acc, a) => (a.title.length > acc.length ? a.title : acc),
      ""
    );
    const avgTitleLength = awardsCount
      ? Math.round(awards.reduce((sum, a) => sum + a.title.length, 0) / awardsCount)
      : 0;

    return {
      joined,
      joinedDateRaw,
      years,
      months,
      totalDays,
      totalHours,
      workedHours,
      meetingsCount,
      awardsCount,
      longestTitle,
      avgTitleLength,
    };
  }, [awards, person, year]);

  const formatMmYyyy = (date) => {
    if (!date || Number.isNaN(date.getTime())) return "—";
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = String(date.getFullYear());
    return `${mm}/${yyyy}`;
  };

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
    link.download =
      activeSlide?.type === "stats"
        ? `${person.id}-${year}-stats.png`
        : `${person.id}-${year}-award-${String(index).padStart(1, "0")}.png`;
    link.href = dataUrl;
    link.click();
  };

  const shareImage = async () => {
    if (!cardRef.current) return;

    const title = `${person.name} | ${year} Maxiphy Awards`;
    const text =
      activeSlide?.type === "stats"
        ? `Your Year, Wrapped — ${person.name}`
        : activeAward
          ? `${activeAward.title} – ${activeAward.subtitle}`
          : `${person.name} — ${year} Maxiphy Awards`;
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
      const filename =
        activeSlide?.type === "stats"
          ? `${person.id}-${year}-stats.png`
          : `${person.id}-${year}-award-${String(index).padStart(1, "0")}.png`;
      const file = new File([blob], filename, {
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
      <div className="w-full max-w-screen-sm md:max-w-md flex flex-col h-full space-y-3">
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

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={startSlideshow}
                        className="mt-5 h-11 px-7 rounded-full text-white transition text-sm font-medium"
                        style={{
                          backgroundColor: "#008DC1",
                          boxShadow: "0 0 0 1px rgba(0,141,193,0.55), 0 0 26px rgba(0,141,193,0.28)",
                        }}
                      >
                        START
                      </motion.button>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18, duration: 0.35, ease: "easeOut" }}
                      className="flex items-center justify-center"
                    >
                      <span className="text-xs sm:text-sm text-neutral-500">
                        {String(awards.length).padStart(1, "0")} AWARDS
                      </span>
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
                  speed={900}
                  autoplay={{ delay: 8000, disableOnInteraction: false }}
                  loop
                  onSwiper={(s) => {
                    swiperRef.current = s;
                    updateActiveCardRef(s);
                  }}
                  onSlideChange={(s) => {
                    setIndex(s.realIndex);
                    updateActiveCardRef(s);
                  }}
                  className="award-swiper w-full h-full"
                >
                  {slides.map((slide, i) => (
                    <SwiperSlide
                      key={slide.type === "stats" ? "stats" : slide.award.title}
                      className="flex items-center justify-center h-full p-3 md:p-6"
                    >
                      <motion.div
                        key={`${started}-${slide.type === "stats" ? "stats" : slide.award.title}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        whileHover={{ scale: 1.005 }}
                        className="relative border border-neutral-800 rounded-3xl overflow-hidden bg-black shadow-2xl w-full max-w-[440px] md:max-w-[900px] h-full"
                        style={{ aspectRatio: "3 / 4" }}
                        data-award-card
                      >
                        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/40 via-black to-black" />
                        <div className="relative h-full flex flex-col justify-between p-8 md:p-12">
                          <div className="flex items-center justify-between gap-3 text-[11px] sm:text-sm uppercase tracking-[0.1em] text-neutral-400">
                            <Image src="/logo.svg" alt="Maxiphy logo" width={110} height={28} priority />
                            <span className="text-neutral-200">{year} Office Awards</span>
                          </div>
                          {slide.type === "stats" ? (
                            <div className="space-y-6 md:space-y-8 h-full">
                              <div className="w-full h-2 md:h-3" />
                              <div className="space-y-2">
                                <p className="text-xs text-neutral-400 uppercase tracking-[0.1em]">MAXIPHY {year} Wrapped</p>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight">
                                  {person.name}
                                </h2>
                                <p className="text-sm sm:text-base text-neutral-300">{person.role}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                                <div
                                  className="relative rounded-2xl p-4"
                                  style={{
                                    backgroundColor: "#008DC1",
                                  }}
                                >
                                  <span className="absolute top-3 right-3 text-white/90">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      aria-hidden="true"
                                    >
                                      <path d="M8 21h8" />
                                      <path d="M12 17v4" />
                                      <path d="M7 4h10" />
                                      <path d="M17 4v8a5 5 0 0 1-10 0V4" />
                                      <path d="M5 7h2" />
                                      <path d="M17 7h2" />
                                    </svg>
                                  </span>
                                  <p className="mt-2 text-2xl font-black text-white">{String(stats.awardsCount).padStart(1, "0")}</p>
                                  <p className="text-[11px] uppercase tracking-[0.1em] text-white/90">Awards</p>
                                  <p className="mt-1 text-xs text-white/80"></p>
                                </div>
                                {/* <div className="rounded-2xl border border-neutral-800 bg-black/50 p-4">
                                  <p className="text-[11px] uppercase tracking-[0.1em] text-neutral-500">Role</p>
                                  <p className="mt-2 text-sm font-semibold text-white">{person.role}</p>
                                  <p className="mt-1 text-xs text-neutral-400">team impact category</p>
                                </div> */}
                                <div className="relative rounded-2xl border border-neutral-800 bg-black/50 p-4">
                                  <span className="absolute top-3 right-3 text-neutral-400">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      aria-hidden="true"
                                    >
                                      <path d="M8 2v4" />
                                      <path d="M16 2v4" />
                                      <rect width="18" height="18" x="3" y="4" rx="2" />
                                      <path d="M3 10h18" />
                                    </svg>
                                  </span>
                                  <p className="mt-2 text-2xl font-black text-white">
                                    {stats.joined ? formatMmYyyy(stats.joined) : "—"}
                                  </p>
                                  <p className="text-[11px] uppercase tracking-[0.1em] text-neutral-500">JOINED</p>
                                  <p className="mt-1 text-xs text-neutral-400"></p>
                                </div>
                                <div className="relative rounded-2xl border border-neutral-800 bg-black/50 p-4">
                                  <span className="absolute top-3 right-3 text-neutral-400">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      aria-hidden="true"
                                    >
                                      <circle cx="12" cy="12" r="10" />
                                      <path d="M12 6v6l4 2" />
                                    </svg>
                                  </span>
                                  <p className="mt-2 text-2xl font-black text-white">
                                    {stats.years != null
                                      ? stats.years < 1
                                        ? stats.months != null
                                          ? Math.max(0, stats.months).toLocaleString()
                                          : "—"
                                        : stats.years.toLocaleString()
                                      : "—"}
                                  </p>
                                  <p className="text-[11px] uppercase tracking-[0.1em] text-neutral-500">
                                    {stats.years != null && stats.years < 1 ? "Months" : "Years"}
                                  </p>
                                  <p className="mt-1 text-xs text-neutral-400"></p>
                                </div>
                                <div className="relative rounded-2xl border border-neutral-800 bg-black/50 p-4">
                                  <span className="absolute top-3 right-3 text-neutral-400">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      aria-hidden="true"
                                    >
                                      <path d="M22 8l-6 4 6 4V8Z" />
                                      <rect x="2" y="6" width="14" height="12" rx="2" />
                                    </svg>
                                  </span>
                                  <p className="mt-2 text-2xl font-black text-white">
                                    {stats.meetingsCount != null ? stats.meetingsCount.toLocaleString() : "—"}
                                  </p>
                                  <p className="text-[11px] uppercase tracking-[0.1em] text-neutral-500">Meetings</p>
                                  <p className="mt-1 text-xs text-neutral-400"></p>
                                </div>
                                <div className="relative rounded-2xl border border-neutral-800 bg-black/50 p-4">
                                  <span className="absolute top-3 right-3 text-neutral-400">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      aria-hidden="true"
                                    >
                                      <rect x="3" y="7" width="18" height="13" rx="2" />
                                      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                      <path d="M3 13h18" />
                                    </svg>
                                  </span>
                                  <p className="mt-2 text-2xl font-black text-white">
                                    {stats.workedHours != null ? stats.workedHours.toLocaleString() : "—"}
                                  </p>
                                  <p className="text-[11px] uppercase tracking-[0.1em] text-neutral-500">worked hours</p>
                                  <p className="mt-1 text-xs text-neutral-400"></p>
                                </div>

                                {(person.customStats ?? []).slice(0, 2).map((stat) => (
                                  <div
                                    key={stat.label}
                                    className="relative rounded-2xl border border-neutral-800 bg-black/50 p-4"
                                  >
                                    <span className="absolute top-3 right-3 text-neutral-400">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                      >
                                        <path d="M4 9h16" />
                                        <path d="M4 15h16" />
                                        <path d="M10 3L8 21" />
                                        <path d="M16 3l-2 18" />
                                      </svg>
                                    </span>
                                    <p className="mt-2 text-2xl font-semibold text-white">
                                      {typeof stat.value === "number"
                                        ? stat.value.toLocaleString()
                                        : stat.value ?? "—"}
                                    </p>
                                    <p className="text-[11px] uppercase tracking-[0.1em] text-neutral-500">
                                      {stat.label}
                                    </p>
                                    {stat.description ? (
                                      <p className="mt-1 text-xs text-neutral-400">{stat.description}</p>
                                    ) : null}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-5 md:space-y-7 h-full">
                              <div className="w-full h-2 md:h-3" />
                              <div className="relative w-full aspect-square rounded-3xl border border-neutral-800 bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 overflow-hidden">
                                {slide.award.image ? (
                                  <Image
                                    src={slide.award.image}
                                    alt={slide.award.title}
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
                                  key={slide.award.title}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -8 }}
                                  transition={{ duration: 0.3, ease: "easeOut" }}
                                  className="space-y-5 md:space-y-7 text-left mt-auto"
                                >
                                  <div className="space-y-2">
                                    <p className="text-xs text-neutral-400 uppercase">2025 office Award</p>
                                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-tight">
                                      {slide.award.title}
                                    </h2>
                                    <p className="text-sm sm:text-base md:text-lg text-neutral-300 max-w-2xl">
                                      {slide.award.subtitle}
                                    </p>
                                  </div>
                                </motion.div>
                              </AnimatePresence>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[12px] sm:text-sm text-neutral-500">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-neutral-400">
                                {person.name} · {person.role}
                              </span>
                              <span>
                                {i === 0
                                  ? "WRAPPED"
                                  : `AWARD ${String(i).padStart(1, "0")} OF ${String(awards.length).padStart(1, "0")}`}
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
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={goToNextSlide}
                                aria-label="Next slide"
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
                                  <polyline points="9 18 15 12 9 6" />
                                </svg>
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                <style jsx global>{`
                  .award-swiper .swiper-slide {
                    opacity: 0;
                    transition: opacity 650ms ease;
                  }

                  .award-swiper .swiper-slide-active {
                    opacity: 1;
                  }

                  .award-swiper .swiper-slide-prev,
                  .award-swiper .swiper-slide-next {
                    opacity: 0.25;
                  }
                `}</style>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
