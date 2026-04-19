import { createFileRoute } from "@tanstack/react-router";
import { ChevronRight, Flower } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { PointsBalanceCard } from "@/components/dashboard/PointsBalanceCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { RewardCard } from "@/components/dashboard/RewardCard";
import { SiteFooter } from "@/components/SiteFooter";
import rewardDiscount from "@/assets/reward-discount.jpg";
import rewardShipping from "@/assets/reward-shipping.jpg";
import rewardSurprise from "@/assets/reward-surprise.jpg";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Mi Dashboard — Botanique Luxe" },
      {
        name: "description",
        content:
          "Consulta tus puntos, recompensas disponibles y actividad reciente del Club Botanique Luxe.",
      },
      { property: "og:title", content: "Mi Dashboard — Botanique Luxe" },
      {
        property: "og:description",
        content: "Tu programa de lealtad floral.",
      },
    ],
  }),
  component: DashboardPage,
});

const rewards = [
  {
    image: rewardDiscount,
    title: "15% Descuento en Ramo",
    description:
      'Aplica para cualquier arreglo de la colección "Primavera Eterna".',
    points: 400,
  },
  {
    image: rewardShipping,
    title: "Envío Nacional Gratis",
    description: "Válido para un envío programado en cualquier punto del país.",
    points: 600,
  },
  {
    image: rewardSurprise,
    title: "Ramo Sorpresa",
    description: "Un arreglo único diseñado por nuestros floristas expertos.",
    points: 1000,
  },
];

function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-6 py-10 md:px-10 md:py-12">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-3">
            {/* Top row: greeting + points pill */}
            <div className="lg:col-span-2">
              <h1 className="font-serif text-4xl font-semibold leading-tight text-foreground md:text-5xl">
                Hola, Ana. Bienvenida de nuevo{" "}
                <span className="inline-block">🌸</span>
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Miembro del Atelier desde Enero 2023
              </p>
            </div>

            <div className="flex items-start justify-end lg:justify-end">
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-3 text-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/30 text-gold-foreground">
                  <Flower className="h-3.5 w-3.5" />
                </span>
                <span>
                  <span className="font-semibold text-foreground">1,250 Puntos</span>{" "}
                  <span className="text-muted-foreground">Acumulados</span>
                </span>
              </span>
            </div>

            {/* Main: balance card */}
            <div className="lg:col-span-2">
              <PointsBalanceCard
                points={1250}
                tier="Nivel Oro"
                pointsToNext={250}
                progress={83}
              />
            </div>

            {/* Side: activity + nudge */}
            <div className="space-y-6">
              <ActivityFeed />
              <button className="group flex w-full items-center justify-between gap-3 rounded-3xl bg-blush px-5 py-4 text-left text-blush-foreground transition-colors hover:bg-blush/80">
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blush-foreground/10">
                    <Flower className="h-4 w-4" />
                  </span>
                  <span className="text-sm leading-snug">
                    <span className="font-semibold">¡Casi llegas!</span> Estás a solo 20
                    puntos de un ramo gratis 🌷
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* Rewards grid */}
            <div className="lg:col-span-3">
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <h2 className="font-serif text-3xl font-semibold text-foreground md:text-4xl">
                    Canjea tus puntos
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Elige tu próxima experiencia botánica
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rewards.map((r) => (
                  <RewardCard
                    key={r.title}
                    image={r.image}
                    title={r.title}
                    description={r.description}
                    points={r.points}
                    affordable={r.points <= 1250}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>

        <SiteFooter />
      </div>
    </div>
  );
}
