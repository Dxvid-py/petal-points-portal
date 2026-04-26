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

const redemptionCards = [
  {
    icon: Flower2,
    title: "Flores Premium",
    desc: "Ramos y arreglos de autor con flores de temporada.",
    img: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&auto=format&fit=crop",
    badge: "Desde 800 pts",
  },
  {
    icon: HardHat,
    title: "Mano de Obra",
    desc: "Decoración profesional para tus eventos y celebraciones.",
    img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop",
    badge: "Desde 2.500 pts",
  },
  {
    icon: SprayCan,
    title: "Útiles de Aseo",
    desc: "Productos para mantener tus arreglos siempre frescos.",
    img: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=800&auto=format&fit=crop",
    badge: "Desde 600 pts",
  },
  {
    icon: Fuel,
    title: "Bono de Combustible",
    desc: "Canjea tus puntos por bonos de combustible Terpel.",
    img: "https://images.unsplash.com/photo-1545262810-77515befe149?w=800&auto=format&fit=crop",
    badge: "Desde 3.000 pts",
  },
];

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
          <div className="animate-fade-up">
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
          </div>

          <div className="relative animate-scale-in">
            <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-primary/20 blur-3xl" />
            <div className="overflow-hidden rounded-[2rem] border border-primary/20 shadow-glow">
              <img
                src="https://images.unsplash.com/photo-1487070183336-b863922373d4?w=1200&auto=format&fit=crop"
                alt="Arreglo floral premium con rosas"
                className="h-[520px] w-full object-cover md:h-[640px]"
              />
            </div>
            {/* Floating pink badge */}
            <div className="absolute -bottom-5 -left-5 animate-float rounded-2xl border border-primary/30 bg-white/90 p-4 shadow-pink backdrop-blur">
              <p className="text-[10px] uppercase tracking-widest text-primary">Equivalencia</p>
              <p className="mt-1 font-serif text-xl font-semibold text-foreground">
                1 pt <span className="text-muted-foreground">=</span> $1.760
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN FIDELIZACIÓN — 3 columnas */}
      <section id="fidelizacion" className="relative bg-gradient-bone py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-medium uppercase tracking-[0.28em] text-gold">
              Programa de Fidelización
            </span>
            <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight text-foreground md:text-5xl">
              Disfrutar de <em className="text-shimmer-gold">Puntos Deluxe</em>
              <br />
              es muy fácil.
            </h2>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {fidelityPillars.map((p, i) => (
              <article
                key={p.title}
                className="group relative flex flex-col rounded-3xl border border-gold/15 bg-card/60 p-8 backdrop-blur-sm transition-all hover:-translate-y-2 hover:border-gold/40 hover:shadow-gold animate-fade-up"
                style={{ animationDelay: `${i * 120}ms` }}
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
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* VIDEO ESTILO REEL */}
      <section id="video" className="relative py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-medium uppercase tracking-[0.28em] text-gold">
              En Vivo · Deluxe
            </span>
            <h2 className="mt-4 font-serif text-4xl font-semibold text-foreground md:text-5xl">
              Vive la magia <em className="text-shimmer-gold">Deluxe</em>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Descubre nuestros últimos arreglos y momentos especiales en formato Reel.
            </p>
          </div>

          <div className="mt-14 flex justify-center">
            <div className="relative">
              {/* Marco rosa */}
              <div className="absolute -inset-3 rounded-[2.5rem] bg-gradient-gold opacity-50 blur-xl" />
              <div className="relative aspect-[9/16] w-[320px] overflow-hidden rounded-[2rem] border-2 border-primary/30 bg-white shadow-glow md:w-[380px]">
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=0&mute=1&controls=1&rel=0"
                  title="Floristería Deluxe Reel"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                {/* Decorative play overlay (visual only) */}
                <div className="pointer-events-none absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-white/80 backdrop-blur">
                  <Play className="h-4 w-4 text-primary" fill="currentColor" />
                </div>
              </div>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Próximamente podrás administrar este video desde el panel de admin.
          </p>
        </div>
      </section>

      {/* CATÁLOGO REDIME */}
      <section id="redime" className="relative bg-gradient-bone py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-medium uppercase tracking-[0.28em] text-gold">
              Catálogo de Redención
            </span>
            <h2 className="mt-4 font-serif text-4xl font-semibold text-foreground md:text-5xl">
              Redime tus puntos en <em className="text-shimmer-gold">experiencias únicas</em>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Convierte tus puntos en flores premium, servicios profesionales o bonos.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {redemptionCards.map((card, i) => (
              <article
                key={card.title}
                className="group relative overflow-hidden rounded-3xl border border-primary/15 bg-card transition-all hover:-translate-y-2 hover:border-primary/40 hover:shadow-pink animate-fade-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={card.img}
                    alt={card.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/30 to-transparent" />
                </div>
                <div className="absolute right-3 top-3 rounded-full border border-primary/30 bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary backdrop-blur">
                  {card.badge}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl border border-white/40 bg-white/15 text-white backdrop-blur">
                    <card.icon className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-white">
                    {card.title}
                  </h3>
                  <p className="mt-1 text-xs text-white/85">{card.desc}</p>
                </div>
              </article>
            ))}
          </div>

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

          <div className="relative">
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
            <Button
              asChild
              size="lg"
              className="mt-9 rounded-full bg-primary px-8 text-primary-foreground hover:bg-foreground hover:text-background"
            >
              <Link to="/auth?mode=signup">
                Crear mi cuenta Deluxe
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />

      <AccumulateStepsModal open={stepsOpen} onOpenChange={setStepsOpen} />
    </div>
  );
}
