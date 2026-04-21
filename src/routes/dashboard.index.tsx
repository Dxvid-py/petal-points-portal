import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  Flower2,
  ShoppingBag,
  Gift,
  Award,
  Sparkles,
  Calendar,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import rewardWorkshop from "@/assets/reward-workshop.jpg";
import rewardGiftcard from "@/assets/reward-giftcard.jpg";
import rewardDiscount from "@/assets/reward-discount.jpg";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({
    meta: [
      { title: "Mi Atelier — Botanique Luxe" },
      {
        name: "description",
        content:
          "Tu balance, recompensas y movimientos del Club Botanique Luxe.",
      },
    ],
  }),
  component: DashboardHome,
});

const activity = [
  {
    icon: ShoppingBag,
    title: "Ramo silvestre",
    meta: "Tienda · Hace 2 días",
    delta: "+150",
    positive: true,
  },
  {
    icon: Gift,
    title: "Canje envío gratis",
    meta: "Recompensa · 12 Oct",
    delta: "−500",
    positive: false,
  },
  {
    icon: Award,
    title: "Bono aniversario",
    meta: "Promo · 01 Oct",
    delta: "+100",
    positive: true,
  },
  {
    icon: ShoppingBag,
    title: "Centro de mesa otoñal",
    meta: "Tienda · 24 Sep",
    delta: "+220",
    positive: true,
  },
];

const featured = [
  {
    image: rewardDiscount,
    title: "15% en tu próximo ramo",
    points: 400,
    badge: "Popular",
  },
  {
    image: rewardWorkshop,
    title: "Taller botánico privado",
    points: 1200,
    badge: "Edición limitada",
  },
  {
    image: rewardGiftcard,
    title: "Tarjeta regalo con sello",
    points: 800,
    badge: "Nuevo",
  },
];

function DashboardHome() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Mi atelier"
        title={
          <>
            Hola, <em className="italic">Ana</em>.<br />
            Tus flores te esperan.
          </>
        }
        description="Llevas 1.250 puntos acumulados — estás a 250 de tu próxima recompensa de Nivel Oro."
      />

      {/* Hero balance — editorial split card */}
      <section className="grid gap-6 lg:grid-cols-5">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-ink p-8 text-primary-foreground shadow-ink lg:col-span-3 md:p-10">
          {/* Decorative botanical illustration */}
          <svg
            className="pointer-events-none absolute -right-8 -top-8 h-72 w-72 text-primary-foreground/[0.06]"
            viewBox="0 0 200 200"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          >
            <circle cx="100" cy="100" r="80" />
            <circle cx="100" cy="100" r="60" />
            <circle cx="100" cy="100" r="40" />
            <path d="M100 20 Q120 60 100 100 Q80 60 100 20Z" fill="currentColor" />
            <path d="M180 100 Q140 120 100 100 Q140 80 180 100Z" fill="currentColor" />
            <path d="M100 180 Q120 140 100 100 Q80 140 100 180Z" fill="currentColor" />
            <path d="M20 100 Q60 120 100 100 Q60 80 20 100Z" fill="currentColor" />
          </svg>

          <div className="relative">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-gold">
                <Sparkles className="h-3 w-3" />
                Nivel Oro
              </span>
              <span className="text-[10px] uppercase tracking-[0.22em] text-primary-foreground/50">
                · Vigente hasta Dic 2024
              </span>
            </div>

            <h2 className="mt-8 font-serif text-7xl font-light leading-none tracking-tight md:text-8xl">
              1.250
              <span className="ml-3 align-top font-serif text-base italic font-normal text-primary-foreground/60">
                puntos
              </span>
            </h2>

            <div className="mt-10 max-w-md">
              <div className="flex items-end justify-between text-xs uppercase tracking-[0.22em]">
                <span className="text-primary-foreground/60">Progreso a Platino</span>
                <span className="font-serif text-base normal-case tracking-normal text-gold">
                  83%
                </span>
              </div>
              <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-primary-foreground/10">
                <div
                  className="h-full rounded-full bg-gradient-terracotta"
                  style={{ width: "83%" }}
                />
              </div>
              <p className="mt-3 text-sm text-primary-foreground/70">
                Te faltan <span className="text-primary-foreground">250 puntos</span>{" "}
                para desbloquear un ramo cortesía.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button
                asChild
                className="rounded-full bg-terracotta px-6 text-terracotta-foreground hover:bg-terracotta/90"
              >
                <Link to="/dashboard/recompensas">
                  Canjear puntos
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-primary-foreground/25 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link to="/dashboard/perfil">Cómo ganar más</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick stats column */}
        <div className="grid gap-4 lg:col-span-2">
          <article className="flex items-start justify-between rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Compras del año
              </p>
              <p className="mt-3 font-serif text-4xl font-semibold text-foreground">
                14
              </p>
              <p className="mt-1 text-xs text-muted-foreground">+3 este trimestre</p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-forest">
              <ShoppingBag className="h-4 w-4" strokeWidth={1.75} />
            </span>
          </article>
          <article className="flex items-start justify-between rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Recompensas canjeadas
              </p>
              <p className="mt-3 font-serif text-4xl font-semibold text-foreground">
                7
              </p>
              <p className="mt-1 text-xs text-muted-foreground">2 disponibles ahora</p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blush text-blush-foreground">
              <Gift className="h-4 w-4" strokeWidth={1.75} />
            </span>
          </article>
          <article className="flex items-start justify-between rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Próximo evento
              </p>
              <p className="mt-3 font-serif text-2xl font-semibold leading-tight text-foreground">
                Taller de peonías
              </p>
              <p className="mt-1 text-xs text-muted-foreground">28 Oct · 6:00pm</p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/30 text-gold-foreground">
              <Calendar className="h-4 w-4" strokeWidth={1.75} />
            </span>
          </article>
        </div>
      </section>

      {/* Featured rewards — editorial row */}
      <section>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-terracotta">
              Selección del atelier
            </p>
            <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Recompensas <em className="italic">para ti</em>
            </h2>
          </div>
          <Link
            to="/dashboard/recompensas"
            className="hidden items-center gap-1 text-sm text-foreground underline-offset-4 hover:underline md:inline-flex"
          >
            Ver todas <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((r) => (
            <article
              key={r.title}
              className="group overflow-hidden rounded-3xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-card"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                <img
                  src={r.image}
                  alt={r.title}
                  loading="lazy"
                  width={800}
                  height={1000}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full bg-background/85 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-foreground backdrop-blur">
                  {r.badge}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-serif text-lg font-semibold leading-tight text-foreground">
                  {r.title}
                </h3>
                <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3">
                  <span className="text-sm text-muted-foreground">
                    <span className="font-serif text-base font-semibold text-foreground">
                      {r.points.toLocaleString()}
                    </span>{" "}
                    pts
                  </span>
                  <Link
                    to="/dashboard/recompensas"
                    className="inline-flex items-center gap-1 text-xs font-medium text-terracotta underline-offset-4 hover:underline"
                  >
                    Canjear <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Activity feed */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft lg:col-span-2">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-terracotta">
                Movimiento
              </p>
              <h3 className="mt-1 font-serif text-2xl font-semibold text-foreground">
                Actividad reciente
              </h3>
            </div>
            <Link
              to="/dashboard/compras"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Historial completo →
            </Link>
          </div>
          <ul className="mt-6 divide-y divide-border/60">
            {activity.map((a) => (
              <li key={a.title} className="flex items-center gap-4 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
                  <a.icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.meta}</p>
                </div>
                <span
                  className={`font-serif text-base font-semibold ${a.positive ? "text-forest" : "text-terracotta"}`}
                >
                  {a.delta}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          to="/dashboard/recompensas"
          className="group flex flex-col justify-between overflow-hidden rounded-3xl bg-gradient-terracotta p-7 text-terracotta-foreground shadow-soft"
        >
          <Flower2 className="h-8 w-8 opacity-80" strokeWidth={1.5} />
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-terracotta-foreground/70">
              Casi llegas
            </p>
            <p className="mt-3 font-serif text-3xl font-semibold leading-tight">
              250 puntos
            </p>
            <p className="mt-1 text-sm text-terracotta-foreground/85">
              te separan de un ramo cortesía hecho a mano por el atelier.
            </p>
            <p className="mt-6 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 group-hover:underline">
              Ver cómo lograrlo <ArrowUpRight className="h-3.5 w-3.5" />
            </p>
          </div>
        </Link>
      </section>
    </div>
  );
}
