import { createFileRoute, Link } from "@tanstack/react-router";
import { Flower2, Heart, Sparkles, Store, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-flowers.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Botanique Luxe — Atelier Floral & Club de Puntos" },
      {
        name: "description",
        content:
          "Floristería premium en Bogotá. Arreglos de autor, decoración de eventos y un club de puntos exclusivo para nuestros clientes.",
      },
      { property: "og:title", content: "Botanique Luxe — Atelier Floral" },
      {
        property: "og:description",
        content: "El atelier de las flores. Únete a nuestro club de puntos.",
      },
      { property: "og:image", content: heroImg },
      { name: "twitter:image", content: heroImg },
    ],
  }),
  component: LandingPage,
});

const services = [
  {
    icon: Heart,
    title: "Decoración de Iglesias",
    description:
      "Ambientes ceremoniales con arreglos de altar, pasillos y bancas. Composiciones a medida para bodas y bautizos.",
  },
  {
    icon: Sparkles,
    title: "Eventos & Banquetes",
    description:
      "Centros de mesa, arcos florales e instalaciones inmersivas para eventos corporativos y celebraciones íntimas.",
  },
  {
    icon: Store,
    title: "Venta en Local",
    description:
      "Visita nuestro atelier y descubre arreglos frescos del día, plantas de interior y obsequios botánicos.",
  },
];

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24 lg:px-10 lg:py-32">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground backdrop-blur">
              <Flower2 className="h-3 w-3 text-primary" />
              Atelier desde 2018
            </span>
            <h1 className="mt-6 font-serif text-5xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-6xl lg:text-7xl">
              Donde cada flor
              <br />
              <em className="font-serif italic text-primary">cuenta una historia.</em>
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              Arreglos de autor, decoración de eventos y un club de puntos creado para
              quienes celebran la belleza efímera de lo natural.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-7">
                <Link to="/dashboard">
                  Ingresar al Club de Puntos
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full border-foreground/15 px-7"
              >
                <Link to="/" hash="servicios">
                  Conocer servicios
                </Link>
              </Button>
            </div>

            <div className="mt-12 flex items-center gap-8 border-t border-border/60 pt-8 text-sm">
              <div>
                <p className="font-serif text-2xl font-semibold text-foreground">+850</p>
                <p className="text-xs text-muted-foreground">Eventos floreados</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-semibold text-foreground">12k</p>
                <p className="text-xs text-muted-foreground">Miembros del club</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-semibold text-foreground">4.9★</p>
                <p className="text-xs text-muted-foreground">Calificación</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-primary-soft/60 blur-2xl" />
            <div className="overflow-hidden rounded-[2rem] shadow-glow">
              <img
                src={heroImg}
                alt="Arreglo floral elegante con peonías y eucalipto"
                width={1920}
                height={1280}
                className="h-[520px] w-full object-cover md:h-[640px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Historia */}
      <section id="historia" className="bg-secondary/40 py-24">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
          <span className="text-xs uppercase tracking-[0.25em] text-primary">
            Nuestra Historia
          </span>
          <h2 className="mt-4 font-serif text-4xl font-semibold text-foreground md:text-5xl">
            Un atelier nacido entre <em className="italic">jardines y rituales</em>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Botanique Luxe nació en 2018 del encuentro entre dos hermanas floristas que
            soñaban con un espacio donde cada arreglo fuera una obra única. Trabajamos
            con productores locales, flores de temporada y técnicas de composición
            europeas para crear piezas que transforman momentos en recuerdos.
          </p>
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-col items-center text-center">
            <span className="text-xs uppercase tracking-[0.25em] text-primary">
              Servicios
            </span>
            <h2 className="mt-4 max-w-2xl font-serif text-4xl font-semibold text-foreground md:text-5xl">
              Composiciones a la medida de tus momentos
            </h2>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {services.map((service) => (
              <article
                key={service.title}
                className="group flex flex-col rounded-3xl border border-border/60 bg-card p-8 shadow-soft transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-card"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-forest transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <service.icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <h3 className="mt-6 font-serif text-2xl font-semibold text-foreground">
                  {service.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24 lg:px-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-sage p-12 text-center text-primary-foreground md:p-20">
          <h2 className="mx-auto max-w-2xl font-serif text-4xl font-semibold md:text-5xl">
            Únete al Club de Puntos
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/85">
            Cada compra te acerca a recompensas únicas: arreglos sorpresa, talleres
            exclusivos y envíos cortesía.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 rounded-full bg-primary-foreground px-8 text-forest hover:bg-primary-foreground/90"
          >
            <Link to="/dashboard">
              Acceder a mi cuenta
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
