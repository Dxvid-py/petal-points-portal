import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  UserPlus, Coins, Gift, ArrowRight, Sparkles, Play, ShoppingBag,
  ExternalLink, ChevronLeft, ChevronRight, HelpCircle, Camera,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { AccumulateStepsModal } from "@/components/landing/AccumulateStepsModal";
import { supabase } from "@/lib/supabase";
import { fetchSiteContent, getText, getUrl, type SiteContentMap } from "@/lib/site-content";
import { SITE_KEYS, type Reward, type GalleryItem, type HeroSlide, type Faq } from "@/lib/types";
import { formatPoints } from "@/lib/format";
import { Reveal, StaggerGroup } from "@/components/Reveal";
import { motion, AnimatePresence } from "framer-motion";

const FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: "s1",
    eyebrow: "Programa Deluxe",
    title: "Cada flor, cada punto, una experiencia deluxe.",
    subtitle:
      "Únete al club exclusivo de Floristería Deluxe. Acumula puntos con cada compra y redime flores premium, decoración profesional y bonos especiales.",
    cta_label: "Regístrate gratis",
    cta_url: "/auth?mode=signup",
    image_url: "https://images.unsplash.com/photo-1487070183336-b863922373d4?w=1400&auto=format&fit=crop",
    position: 0,
    active: true,
  },
  {
    id: "s2",
    eyebrow: "Momentos Deluxe",
    title: "Cada arreglo, una historia.",
    subtitle: "Descubre nuestra colección de momentos con parroquias y celebraciones únicas.",
    cta_label: "Ver colección",
    cta_url: "/momentos",
    image_url: "https://images.unsplash.com/photo-1502977249166-824b3a8a4d6d?w=1400&auto=format&fit=crop",
    position: 1,
    active: true,
  },
];

// Blob orgánico como clip-path CSS
const BLOB_PATH =
  "M42,-58C54.4,-49.8,63.4,-36.1,68.2,-21.1C73,-6,73.5,10.4,66.5,22.9C59.6,35.4,45.2,44,30.5,52.4C15.8,60.7,0.9,68.9,-14.4,68.8C-29.6,68.8,-45.2,60.6,-56.3,47.6C-67.4,34.6,-74,16.9,-74.4,-0.2C-74.7,-17.4,-68.7,-34.7,-57.5,-44.4C-46.4,-54,-30,-55.9,-15.2,-59.1C-0.4,-62.3,12.7,-66.7,42,-58Z";

export default function LandingPage() {
  const [stepsOpen, setStepsOpen] = useState(false);
  const [content, setContent] = useState<SiteContentMap>({});
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [slides, setSlides] = useState<HeroSlide[]>(FALLBACK_SLIDES);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchSiteContent(),
      supabase.from("rewards").select("*").eq("active", true).order("points_cost").limit(4),
      supabase.from("gallery_items").select("*").order("created_at", { ascending: false }).limit(6),
      supabase.from("hero_slides").select("*").eq("active", true).order("position"),
      supabase.from("faqs").select("*").eq("active", true).order("position"),
    ]).then(([map, rwRes, gRes, hsRes, fRes]) => {
      setContent(map);
      setRewards((rwRes.data ?? []) as Reward[]);
      setGallery((gRes.data ?? []) as GalleryItem[]);
      if (hsRes.data && hsRes.data.length > 0) setSlides(hsRes.data as HeroSlide[]);
      setFaqs((fRes.data ?? []) as Faq[]);
    });
  }, []);

  const nSlides = slides.length;
  useEffect(() => {
    if (nSlides < 2) return;
    const id = setInterval(() => setCurrentSlide(v => (v + 1) % nSlides), 7000);
    return () => clearInterval(id);
  }, [nSlides]);

  const slide = slides[currentSlide] ?? FALLBACK_SLIDES[0];
  const heroVideoUrl = getUrl(content, SITE_KEYS.heroVideoUrl);
  const atelierName = getText(content, SITE_KEYS.atelierName, "Floristería Deluxe");

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const fidelityPillars = useMemo(() => ([
    { icon: UserPlus, title: "Regístrate", desc: "Crea tu cuenta gratis y hazte miembro del club Deluxe.", cta: "Crear cuenta", type: "register" as const },
    { icon: Coins, title: "Acumula", desc: "Suma puntos en cada compra: tienda, web o WhatsApp.", cta: "Ver pasos", type: "accumulate" as const },
    { icon: Gift, title: "Redime", desc: "Cambia tus puntos por flores, servicios y bonos exclusivos.", cta: "Ver catálogo", type: "redeem" as const },
  ]), []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Helmet>
        <title>Puntos {atelierName} — Club de Fidelización</title>
        <meta name="description" content={`El programa de puntos exclusivo de ${atelierName}. Acumula con cada compra y redime experiencias únicas.`} />
        <meta property="og:title" content={`Puntos ${atelierName}`} />
        <meta property="og:description" content="Acumula puntos con cada compra y redime experiencias deluxe." />
        <meta name="theme-color" content="#F4B6CD" />
      </Helmet>

      <SiteHeader />

      {/* ============ HERO CARRUSEL con blob orgánico ============ */}
      <section className="relative overflow-hidden">
        {/* Manchas orgánicas de fondo (girlboss vibe) */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <motion.div
            className="absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-primary/25 blur-3xl"
            animate={{ scale: [1, 1.15, 1], x: [0, 30, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute right-0 top-40 h-[380px] w-[380px] rounded-full bg-gold/25 blur-3xl"
            animate={{ scale: [1, 1.2, 1], x: [0, -20, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-20 left-1/3 h-[300px] w-[300px] rounded-full bg-blush/70 blur-3xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-0 bg-noise opacity-40" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 md:grid-cols-2 md:gap-14 md:px-6 md:py-24 lg:px-10 lg:py-32">
          <div className="order-2 md:order-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {slide.eyebrow && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/60 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-primary backdrop-blur">
                    <Sparkles className="h-3 w-3" />
                    {slide.eyebrow}
                  </span>
                )}
                <h1 className="mt-5 font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
                  {slide.title.split(",").map((chunk, i, arr) => (
                    <span key={i}>
                      {i === 1 ? <em className="font-serif italic text-shimmer-gold">{chunk.trim()}</em> : chunk.trim()}
                      {i < arr.length - 1 ? <>,<br /></> : null}
                    </span>
                  ))}
                </h1>
                {slide.subtitle && (
                  <p className="mt-5 max-w-md text-base text-muted-foreground md:mt-7 md:text-lg">
                    {slide.subtitle}
                  </p>
                )}
                <div className="mt-8 flex flex-wrap gap-3 md:mt-10">
                  <Button asChild size="lg"
                    className="rounded-full bg-primary px-6 text-primary-foreground transition-all hover:bg-gold hover:text-gold-foreground hover:shadow-gold">
                    <Link to={slide.cta_url ?? "/auth?mode=signup"}>
                      {slide.cta_label ?? "Regístrate gratis"}
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => scrollTo("fidelizacion")}
                    className="rounded-full border-gold/40 px-6 text-foreground hover:bg-gold/10 hover:text-primary">
                    Cómo funciona
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dots + arrows */}
            {nSlides > 1 && (
              <div className="mt-10 flex items-center gap-4">
                <button onClick={() => setCurrentSlide((currentSlide - 1 + nSlides) % nSlides)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-white/70 text-primary transition-all hover:bg-primary hover:text-primary-foreground">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex gap-2">
                  {slides.map((_, i) => (
                    <button key={i} onClick={() => setCurrentSlide(i)}
                      className={`h-2 rounded-full transition-all ${i === currentSlide ? "w-8 bg-primary" : "w-2 bg-primary/30 hover:bg-primary/60"}`}
                      aria-label={`Slide ${i + 1}`} />
                  ))}
                </div>
                <button onClick={() => setCurrentSlide((currentSlide + 1) % nSlides)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 bg-white/70 text-primary transition-all hover:bg-primary hover:text-primary-foreground">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Imagen con blob orgánico */}
          <motion.div
            className="order-1 md:order-2 relative mx-auto w-full max-w-[420px] md:max-w-none"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            <div className="pointer-events-none absolute -inset-8 -z-10">
              <svg viewBox="-100 -100 200 200" className="h-full w-full text-gold/40 animate-spin" style={{ animationDuration: "40s" }}>
                <path d={BLOB_PATH} fill="currentColor" />
              </svg>
            </div>
            <div className="relative aspect-square w-full">
              <svg viewBox="-100 -100 200 200" className="absolute inset-0 h-full w-full">
                <defs>
                  <clipPath id="heroBlob" clipPathUnits="userSpaceOnUse">
                    <path d={BLOB_PATH} />
                  </clipPath>
                </defs>
                <path d={BLOB_PATH} fill="none" stroke="currentColor"
                  className="text-forest" strokeWidth="2" opacity="0.6" />
              </svg>
              <AnimatePresence mode="wait">
                <motion.div key={slide.id + "-img"}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7 }}
                  className="absolute inset-0"
                  style={{ clipPath: 'path("M42,-58C54.4,-49.8,63.4,-36.1,68.2,-21.1C73,-6,73.5,10.4,66.5,22.9C59.6,35.4,45.2,44,30.5,52.4C15.8,60.7,0.9,68.9,-14.4,68.8C-29.6,68.8,-45.2,60.6,-56.3,47.6C-67.4,34.6,-74,16.9,-74.4,-0.2C-74.7,-17.4,-68.7,-34.7,-57.5,-44.4C-46.4,-54,-30,-55.9,-15.2,-59.1C-0.4,-62.3,12.7,-66.7,42,-58Z")' }}
                >
                  {/* Fallback simple: img absoluta centrada dentro del blob */}
                </motion.div>
              </AnimatePresence>
              {/* Renderizamos la imagen con blob-mask por clipPath en SVG */}
              <svg viewBox="-100 -100 200 200" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
                <defs>
                  <clipPath id="blobClip">
                    <path d={BLOB_PATH} />
                  </clipPath>
                </defs>
                <g clipPath="url(#blobClip)">
                  <image
                    href={slide.image_url ?? FALLBACK_SLIDES[0].image_url ?? ""}
                    x="-100" y="-100" width="200" height="200"
                    preserveAspectRatio="xMidYMid slice"
                  />
                </g>
              </svg>
            </div>

            <motion.div
              className="absolute -bottom-4 -left-2 rounded-2xl border border-primary/30 bg-white/95 p-3 shadow-pink backdrop-blur md:-bottom-5 md:-left-5 md:p-4"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="text-[9px] uppercase tracking-widest text-primary md:text-[10px]">Equivalencia</p>
              <p className="mt-0.5 font-serif text-lg font-semibold text-foreground md:text-xl">
                1 pt <span className="text-muted-foreground">=</span> $1.760
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Chips categorías estilo girlboss */}
        <div className="relative mx-auto max-w-7xl px-5 pb-10 md:px-10">
          <div className="scrollbar-hide flex gap-6 overflow-x-auto border-t border-border/50 pt-6 text-xs uppercase tracking-[0.24em] text-muted-foreground">
            {["Cómo funciona", "Acumula", "Redime", "Catálogo", "Momentos", "Preguntas"].map((c, i) => (
              <a key={c} href={i === 3 ? "/catalogo" : i === 4 ? "/momentos" : i === 5 ? "#faqs" : `#${["fidelizacion","fidelizacion","redime"][i] ?? "fidelizacion"}`}
                className="shrink-0 whitespace-nowrap hover:text-primary">{c}</a>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FIDELIZACIÓN ============ */}
      <section id="fidelizacion" className="relative bg-gradient-bone py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-6 lg:px-10">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-medium uppercase tracking-[0.28em] text-gold">Programa de Fidelización</span>
            <h2 className="mt-4 font-serif text-3xl font-semibold leading-tight text-foreground md:text-5xl">
              Disfrutar de <em className="text-shimmer-gold">Puntos Deluxe</em>
              <br />es muy fácil.
            </h2>
          </Reveal>

          <StaggerGroup className="mt-12 grid gap-6 md:mt-16 md:grid-cols-3" stagger={0.15}>
            {fidelityPillars.map((p, i) => (
              <motion.article key={p.title}
                variants={{ hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } }}
                whileHover={{ y: -8 }}
                className="group relative flex flex-col rounded-3xl border border-gold/15 bg-card/60 p-7 backdrop-blur-sm transition-colors hover:border-gold/40 hover:shadow-gold md:p-8">
                <div className="absolute -top-5 left-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-terracotta shadow-glow transition-transform group-hover:scale-110 group-hover:rotate-3">
                  <p.icon className="h-6 w-6 text-primary-foreground" strokeWidth={1.75} />
                </div>
                <span className="ml-auto font-serif text-5xl font-bold leading-none text-shimmer-gold opacity-30">0{i + 1}</span>
                <h3 className="mt-4 font-serif text-2xl font-semibold text-foreground">{p.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                {p.type === "register" && (
                  <Button asChild variant="ghost" className="mt-6 w-fit rounded-full px-0 text-primary hover:bg-transparent">
                    <Link to="/auth?mode=signup">{p.cta} <ArrowRight className="ml-1 h-4 w-4" /></Link>
                  </Button>
                )}
                {p.type === "accumulate" && (
                  <Button variant="ghost" onClick={() => setStepsOpen(true)} className="mt-6 w-fit rounded-full px-0 text-primary hover:bg-transparent">
                    {p.cta} <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
                {p.type === "redeem" && (
                  <Button asChild variant="ghost" className="mt-6 w-fit rounded-full px-0 text-primary hover:bg-transparent">
                    <Link to="/catalogo">{p.cta} <ArrowRight className="ml-1 h-4 w-4" /></Link>
                  </Button>
                )}
              </motion.article>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ============ VIDEO ============ */}
      {heroVideoUrl && (
        <section id="video" className="relative py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-5 md:px-6 lg:px-10">
            <Reveal className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-medium uppercase tracking-[0.28em] text-gold">En Vivo · Deluxe</span>
              <h2 className="mt-4 font-serif text-3xl font-semibold text-foreground md:text-5xl">
                Vive la magia <em className="text-shimmer-gold">Deluxe</em>
              </h2>
            </Reveal>
            <motion.div className="mt-12 flex justify-center md:mt-14"
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }} whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
              <div className="relative">
                <div className="absolute -inset-3 rounded-[2.5rem] bg-gradient-gold opacity-50 blur-xl" />
                <div className="relative aspect-[9/16] w-[280px] overflow-hidden rounded-[2rem] border-2 border-primary/30 bg-foreground shadow-glow md:w-[380px]">
                  <video src={heroVideoUrl} className="absolute inset-0 h-full w-full object-cover" controls playsInline preload="metadata" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ============ CATÁLOGO PREVIEW ============ */}
      <section id="redime" className="relative bg-gradient-bone py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-6 lg:px-10">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-medium uppercase tracking-[0.28em] text-gold">Catálogo de Redención</span>
            <h2 className="mt-4 font-serif text-3xl font-semibold text-foreground md:text-5xl">
              Redime tus puntos en <em className="text-shimmer-gold">experiencias únicas</em>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Convierte tus puntos en flores premium, servicios profesionales o bonos.
            </p>
          </Reveal>

          {rewards.length === 0 ? (
            <Reveal className="mt-12 rounded-3xl border border-dashed border-primary/30 bg-card/60 p-12 text-center">
              <Gift className="mx-auto h-10 w-10 text-primary/40" />
              <p className="mt-4 font-serif text-xl text-foreground">Catálogo en construcción</p>
            </Reveal>
          ) : (
            <StaggerGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 md:mt-16 md:gap-6" stagger={0.1}>
              {rewards.map((r) => (
                <motion.article key={r.id}
                  variants={{ hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } }}
                  whileHover={{ y: -8 }}
                  className="group relative overflow-hidden rounded-3xl border border-primary/15 bg-card transition-colors hover:border-primary/40 hover:shadow-pink">
                  <div className="relative aspect-[4/5] overflow-hidden bg-gradient-bone">
                    {r.image_url ? (
                      <img src={r.image_url} alt={r.title} loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center"><Gift className="h-16 w-16 text-primary/30" /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/30 to-transparent" />
                  </div>
                  <div className="absolute right-3 top-3 rounded-full border border-primary/30 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary backdrop-blur">
                    {formatPoints(r.points_cost)} pts
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    {r.category && <span className="text-[10px] uppercase tracking-[0.2em] text-white/70">{r.category}</span>}
                    <h3 className="mt-1 font-serif text-xl font-semibold text-white">{r.title}</h3>
                    {r.description && <p className="mt-1 line-clamp-2 text-xs text-white/85">{r.description}</p>}
                  </div>
                </motion.article>
              ))}
            </StaggerGroup>
          )}

          <div className="mt-10 flex flex-wrap justify-center gap-3 md:mt-12">
            <Button asChild size="lg" className="rounded-full bg-primary px-7 text-primary-foreground hover:bg-gold hover:text-gold-foreground">
              <Link to="/catalogo">Ver catálogo completo <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ============ MOMENTOS PREVIEW ============ */}
      <section className="relative py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-6 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-medium uppercase tracking-[0.28em] text-gold">Colección</span>
              <h2 className="mt-3 font-serif text-3xl font-semibold text-foreground md:text-5xl">
                Momentos <em className="text-shimmer-gold">Deluxe</em>
              </h2>
            </div>
            <Button asChild variant="outline" className="rounded-full border-primary/40 hover:bg-primary/10">
              <Link to="/momentos"><Camera className="mr-1 h-4 w-4" /> Ver todo</Link>
            </Button>
          </div>
          {gallery.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
              Pronto compartiremos nuestros momentos aquí.
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
              {gallery.slice(0, 6).map((g, i) => (
                <motion.div key={g.id}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.55, delay: i * 0.06 }}
                  className={`group overflow-hidden rounded-3xl border border-primary/15 bg-card ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}>
                  <img src={g.image_url} alt={g.caption ?? "Momento"} loading="lazy"
                    className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${i === 0 ? "h-full min-h-[300px]" : "aspect-square"}`} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============ TIENDA OFICIAL ============ */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-5 md:px-6 lg:px-10">
          <motion.a href="https://floristeriadeluxe.com" target="_blank" rel="noreferrer"
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ scale: 1.015 }}
            className="group relative grid items-center gap-8 overflow-hidden rounded-[2rem] border border-primary/25 bg-gradient-hero p-8 md:grid-cols-[1.2fr_1fr] md:gap-10 md:rounded-[2.5rem] md:p-14">
            <div className="pointer-events-none absolute -top-10 -right-10 h-48 w-48 rounded-full bg-gold/20 blur-3xl transition-all duration-700 group-hover:scale-150" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white/70 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.28em] text-primary backdrop-blur">
                <ShoppingBag className="h-3 w-3" /> Tienda Oficial
              </span>
              <h2 className="mt-5 font-serif text-3xl font-semibold leading-tight text-foreground md:text-5xl">
                Compra en <em className="text-shimmer-gold">floristeriadeluxe.com</em> y suma puntos.
              </h2>
              <p className="mt-4 max-w-lg text-base text-muted-foreground md:text-lg">
                Cada pedido en nuestra tienda online se traduce en puntos Deluxe.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background shadow-glow transition-all group-hover:bg-primary group-hover:text-primary-foreground md:mt-8 md:px-7">
                Ir a la tienda <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
            <motion.div className="relative mx-auto aspect-square w-full max-w-xs md:max-w-sm"
              animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
              <div className="absolute inset-0 rounded-full bg-gradient-gold opacity-40 blur-2xl" />
              <div className="relative flex h-full w-full items-center justify-center p-8 md:p-12">
                <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-primary/40 bg-white shadow-pink">
                  <img src="https://i.ibb.co/yc50fWW4/Captura-de-pantalla-2026-04-24-001156.png"
                    alt="Floristería Deluxe" className="h-full w-full object-cover" loading="lazy" />
                </div>
              </div>
            </motion.div>
          </motion.a>
        </div>
      </section>

      {/* ============ FAQS ============ */}
      {faqs.length > 0 && (
        <section id="faqs" className="relative bg-gradient-bone py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-5 md:px-6 lg:px-10">
            <Reveal className="text-center">
              <span className="text-xs font-medium uppercase tracking-[0.28em] text-gold">FAQ</span>
              <h2 className="mt-3 font-serif text-3xl font-semibold text-foreground md:text-5xl">
                Preguntas <em className="text-shimmer-gold">frecuentes</em>
              </h2>
            </Reveal>
            <div className="mt-10 space-y-3">
              {faqs.map((f) => {
                const open = openFaq === f.id;
                return (
                  <div key={f.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                    <button onClick={() => setOpenFaq(open ? null : f.id)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-secondary/40">
                      <span className="flex items-center gap-3 font-medium text-foreground">
                        <HelpCircle className="h-4 w-4 text-primary" />
                        {f.question}
                      </span>
                      <span className={`text-primary transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
                    </button>
                    <AnimatePresence>
                      {open && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }} className="overflow-hidden">
                          <p className="border-t border-border px-5 py-4 text-sm text-muted-foreground">{f.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============ CTA FINAL ============ */}
      <section className="px-5 pb-20 md:px-6 md:pb-24 lg:px-10">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-primary/20 bg-gradient-hero p-10 text-center md:p-20">
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 -bottom-16 h-72 w-72 rounded-full bg-blush/60 blur-3xl" />
          <Reveal className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white/70 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.28em] text-primary backdrop-blur">
              <Sparkles className="h-3 w-3" /> Únete hoy
            </span>
            <h2 className="mx-auto mt-6 max-w-2xl font-serif text-3xl font-semibold leading-tight text-foreground md:text-5xl">
              Empieza a coleccionar <em className="text-shimmer-gold">momentos deluxe.</em>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
              Regístrate gratis y accede al programa de fidelización más exclusivo de Barranquilla.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} className="mt-8 inline-block">
              <Button asChild size="lg" className="rounded-full bg-primary px-8 text-primary-foreground hover:bg-foreground hover:text-background">
                <Link to="/auth?mode=signup">Crear mi cuenta Deluxe <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </motion.div>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
      <AccumulateStepsModal open={stepsOpen} onOpenChange={setStepsOpen} />
    </div>
  );
}
