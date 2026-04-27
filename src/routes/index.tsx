import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  UserPlus,
  Coins,
  Gift,
  ArrowRight,
  Sparkles,
  Play,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { AccumulateStepsModal } from "@/components/landing/AccumulateStepsModal";
import { supabase } from "@/lib/supabase";
import { fetchSiteContent, getText, getUrl, type SiteContentMap } from "@/lib/site-content";
import { SITE_KEYS, type Reward, type GalleryItem } from "@/lib/types";
import { formatPoints } from "@/lib/format";
import { Reveal, StaggerGroup } from "@/components/Reveal";
import { motion } from "framer-motion";

const fidelityPillars = [
  {
    icon: UserPlus,
    title: "Regístrate",
    desc: "Crea tu cuenta gratis y empieza a hacer parte del club exclusivo de Floristería Deluxe.",
    cta: "Crear cuenta",
    type: "register" as const,
  },
  {
    icon: Coins,
    title: "Acumula",
    desc: "Acumula puntos cada vez que realices una compra en nuestra tienda, punto físico, sitio web o a través de WhatsApp.",
    cta: "Ver pasos",
    type: "accumulate" as const,
  },
  {
    icon: Gift,
    title: "Redime",
    desc: "Puedes redimir tus puntos en cualquiera de los servicios o productos que tenemos exclusivamente para ti.",
    cta: "Ver catálogo",
    type: "redeem" as const,
  },
];

// Catálogo de redención y galería se cargan desde la BD (rewards / gallery_items)

export default function LandingPage() {
  const [stepsOpen, setStepsOpen] = useState(false);
  const [content, setContent] = useState<SiteContentMap>({});
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  useEffect(() => {
    Promise.all([
      fetchSiteContent(),
      supabase.from("rewards").select("*").eq("active", true).order("points_cost").limit(4),
      supabase.from("gallery_items").select("*").order("created_at", { ascending: false }).limit(8),
    ]).then(([map, rwRes, gRes]) => {
      setContent(map);
      setRewards((rwRes.data ?? []) as Reward[]);
      setGallery((gRes.data ?? []) as GalleryItem[]);
    });
  }, []);

  const heroVideoUrl = getUrl(content, SITE_KEYS.heroVideoUrl);
  const heroTitle = getText(content, SITE_KEYS.heroTitle, "Floristería Deluxe");
  const heroSubtitle = getText(
    content,
    SITE_KEYS.heroSubtitle,
    "Únete al club exclusivo de Floristería Deluxe. Acumula puntos con cada compra y redime experiencias únicas.",
  );
  const heroCta = getText(content, SITE_KEYS.heroCta, "Regístrate gratis");

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Helmet>
        <title>Puntos Floristería Deluxe — Club de Fidelización</title>
        <meta
          name="description"
          content="El programa de puntos exclusivo de Floristería Deluxe. Acumula con cada compra y redime flores, servicios, aseo y bonos de combustible."
        />
        <meta property="og:title" content="Puntos Floristería Deluxe" />
        <meta
          property="og:description"
          content="Acumula puntos con cada compra y redime experiencias deluxe."
        />
        <meta name="theme-color" content="#F4B6CD" />
      </Helmet>

      <SiteHeader />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-32 top-10 h-[500px] w-[500px] rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -right-32 bottom-10 h-[500px] w-[500px] rounded-full bg-gold/10 blur-3xl" />
          <div className="absolute inset-0 bg-noise opacity-40" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28 lg:px-10 lg:py-36">
          <Reveal inView={false} y={32}>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.24em] text-gold backdrop-blur">
              <Sparkles className="h-3 w-3" />
              Programa Deluxe
            </span>
            <h1 className="mt-6 font-serif text-5xl font-semibold leading-[1.02] tracking-tight text-foreground md:text-6xl lg:text-7xl">
              Cada flor,
              <br />
              <em className="font-serif italic text-shimmer-gold">cada punto,</em>
              <br />
              una experiencia <span className="text-primary">deluxe.</span>
            </h1>
            <p className="mt-7 max-w-md text-lg text-muted-foreground">
              Únete al club exclusivo de Floristería Deluxe. Acumula puntos con cada compra y
              redime flores premium, decoración profesional y bonos especiales.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-primary px-7 text-primary-foreground transition-all hover:bg-gold hover:text-gold-foreground hover:shadow-gold"
              >
                <Link to="/auth?mode=signup">
                  Regístrate gratis
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollTo("fidelizacion")}
                className="rounded-full border-gold/40 px-7 text-foreground hover:bg-gold/10 hover:text-gold"
              >
                Cómo funciona
              </Button>
            </div>

            <div className="mt-14 flex items-center gap-10 border-t border-border/40 pt-8 text-sm">
              <div>
                <p className="font-serif text-3xl font-semibold text-shimmer-gold">+850</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">Eventos</p>
              </div>
              <div>
                <p className="font-serif text-3xl font-semibold text-shimmer-gold">12k</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">Miembros</p>
              </div>
              <div>
                <p className="font-serif text-3xl font-semibold text-shimmer-gold">4.9★</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">Rating</p>
              </div>
            </div>
          </Reveal>

          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          >
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-primary/20 blur-3xl" />
            <div className="overflow-hidden rounded-[2rem] border border-primary/20 shadow-glow">
              <img
                src="https://images.unsplash.com/photo-1487070183336-b863922373d4?w=1200&auto=format&fit=crop"
                alt="Arreglo floral premium con rosas"
                className="h-[520px] w-full object-cover md:h-[640px]"
              />
            </div>
            <motion.div
              className="absolute -bottom-5 -left-5 rounded-2xl border border-primary/30 bg-white/90 p-4 shadow-pink backdrop-blur"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="text-[10px] uppercase tracking-widest text-primary">Equivalencia</p>
              <p className="mt-1 font-serif text-xl font-semibold text-foreground">
                1 pt <span className="text-muted-foreground">=</span> $1.760
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SECCIÓN FIDELIZACIÓN — 3 columnas */}
      <section id="fidelizacion" className="relative bg-gradient-bone py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-medium uppercase tracking-[0.28em] text-gold">
              Programa de Fidelización
            </span>
            <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight text-foreground md:text-5xl">
              Disfrutar de <em className="text-shimmer-gold">Puntos Deluxe</em>
              <br />
              es muy fácil.
            </h2>
          </Reveal>

          <StaggerGroup className="mt-16 grid gap-6 md:grid-cols-3" stagger={0.15}>
            {fidelityPillars.map((p, i) => (
              <motion.article
                key={p.title}
                variants={{
                  hidden: { opacity: 0, y: 32 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                }}
                whileHover={{ y: -8 }}
                className="group relative flex flex-col rounded-3xl border border-gold/15 bg-card/60 p-8 backdrop-blur-sm transition-colors hover:border-gold/40 hover:shadow-gold"
              >
                <div className="absolute -top-5 left-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-terracotta shadow-glow transition-transform group-hover:scale-110 group-hover:rotate-3">
                  <p.icon className="h-6 w-6 text-primary-foreground" strokeWidth={1.75} />
                </div>
                <span className="ml-auto font-serif text-5xl font-bold leading-none text-shimmer-gold opacity-30">
                  0{i + 1}
                </span>
                <h3 className="mt-4 font-serif text-2xl font-semibold text-foreground">
                  {p.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {p.desc}
                </p>
                {p.type === "register" && (
                  <Button
                    asChild
                    variant="ghost"
                    className="mt-6 w-fit rounded-full px-0 text-gold hover:bg-transparent hover:text-primary"
                  >
                    <Link to="/auth?mode=signup">
                      {p.cta} <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                )}
                {p.type === "accumulate" && (
                  <Button
                    variant="ghost"
                    onClick={() => setStepsOpen(true)}
                    className="mt-6 w-fit rounded-full px-0 text-gold hover:bg-transparent hover:text-primary"
                  >
                    {p.cta} <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
                {p.type === "redeem" && (
                  <Button
                    variant="ghost"
                    onClick={() => scrollTo("redime")}
                    className="mt-6 w-fit rounded-full px-0 text-gold hover:bg-transparent hover:text-primary"
                  >
                    {p.cta} <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
              </motion.article>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* VIDEO ESTILO REEL */}
      <section id="video" className="relative py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-medium uppercase tracking-[0.28em] text-gold">
              En Vivo · Deluxe
            </span>
            <h2 className="mt-4 font-serif text-4xl font-semibold text-foreground md:text-5xl">
              Vive la magia <em className="text-shimmer-gold">Deluxe</em>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Descubre nuestros últimos arreglos y momentos especiales en formato Reel.
            </p>
          </Reveal>

          <motion.div
            className="mt-14 flex justify-center"
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative">
              <div className="absolute -inset-3 rounded-[2.5rem] bg-gradient-gold opacity-50 blur-xl" />
              <div className="relative aspect-[9/16] w-[320px] overflow-hidden rounded-[2rem] border-2 border-primary/30 bg-foreground shadow-glow md:w-[380px]">
                {heroVideoUrl ? (
                  <video
                    src={heroVideoUrl}
                    className="absolute inset-0 h-full w-full object-cover"
                    controls
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-primary/20 to-gold/20 text-center text-primary-foreground">
                    <Play className="h-10 w-10 text-white/60" />
                    <p className="px-6 text-xs text-white/60">
                      Pronto: video Reel del atelier Deluxe.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CATÁLOGO REDIME */}
      <section id="redime" className="relative bg-gradient-bone py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-medium uppercase tracking-[0.28em] text-gold">
              Catálogo de Redención
            </span>
            <h2 className="mt-4 font-serif text-4xl font-semibold text-foreground md:text-5xl">
              Redime tus puntos en <em className="text-shimmer-gold">experiencias únicas</em>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Convierte tus puntos en flores premium, servicios profesionales o bonos.
            </p>
          </Reveal>

          {rewards.length === 0 ? (
            <Reveal className="mt-16 rounded-3xl border border-dashed border-primary/30 bg-card/60 p-12 text-center">
              <Gift className="mx-auto h-10 w-10 text-primary/40" />
              <p className="mt-4 font-serif text-xl text-foreground">Catálogo en construcción</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Pronto encontrarás aquí todas las recompensas que puedes canjear.
              </p>
            </Reveal>
          ) : (
            <StaggerGroup className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
              {rewards.map((r) => (
                <motion.article
                  key={r.id}
                  variants={{
                    hidden: { opacity: 0, y: 28 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
                  }}
                  whileHover={{ y: -8 }}
                  className="group relative overflow-hidden rounded-3xl border border-primary/15 bg-card transition-colors hover:border-primary/40 hover:shadow-pink"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-gradient-bone">
                    {r.image_url ? (
                      <img
                        src={r.image_url}
                        alt={r.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Gift className="h-16 w-16 text-primary/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/30 to-transparent" />
                  </div>
                  <div className="absolute right-3 top-3 rounded-full border border-primary/30 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary backdrop-blur">
                    {formatPoints(r.points_cost)} pts
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    {r.category && (
                      <span className="text-[10px] uppercase tracking-[0.2em] text-white/70">
                        {r.category}
                      </span>
                    )}
                    <h3 className="mt-1 font-serif text-xl font-semibold text-white">
                      {r.title}
                    </h3>
                    {r.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-white/85">{r.description}</p>
                    )}
                  </div>
                </motion.article>
              ))}
            </StaggerGroup>
          )}

          <div className="mt-12 text-center">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-primary px-8 text-primary-foreground hover:bg-gold hover:text-gold-foreground"
            >
              <Link to="/dashboard/recompensas">
                Ver catálogo completo <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section id="galeria" className="px-6 pb-24 lg:px-10">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-primary/20 bg-gradient-hero p-12 text-center md:p-20">
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 -bottom-16 h-72 w-72 rounded-full bg-blush/60 blur-3xl" />

          <Reveal className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white/70 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.28em] text-primary backdrop-blur">
              <Sparkles className="h-3 w-3" />
              Únete hoy
            </span>
            <h2 className="mx-auto mt-6 max-w-2xl font-serif text-4xl font-semibold leading-tight text-foreground md:text-5xl">
              Empieza a coleccionar <em className="text-shimmer-gold">momentos deluxe.</em>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              Regístrate gratis y obtén acceso inmediato al programa de fidelización más exclusivo de Barranquilla.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="mt-9 inline-block"
            >
              <Button
                asChild
                size="lg"
                className="rounded-full bg-primary px-8 text-primary-foreground hover:bg-foreground hover:text-background"
              >
                <Link to="/auth?mode=signup">
                  Crear mi cuenta Deluxe
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
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
