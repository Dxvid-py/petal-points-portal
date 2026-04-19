import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface PointsBalanceCardProps {
  points: number;
  tier: string;
  pointsToNext: number;
  progress: number;
}

export function PointsBalanceCard({
  points,
  tier,
  pointsToNext,
  progress,
}: PointsBalanceCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-sage p-8 text-primary-foreground shadow-glow md:p-10">
      {/* Decorative leaf */}
      <svg
        className="pointer-events-none absolute -right-10 -bottom-10 h-64 w-64 text-primary-foreground/10"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <path d="M50 10 C 70 30, 80 60, 50 90 C 20 60, 30 30, 50 10 Z" />
        <path d="M50 10 L50 90" stroke="currentColor" strokeWidth="0.5" fill="none" />
      </svg>

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70">
            Tu balance actual
          </p>
          <h2 className="mt-3 font-serif text-5xl font-semibold md:text-6xl">
            {points.toLocaleString()}{" "}
            <span className="text-3xl font-normal opacity-80 md:text-4xl">puntos</span>
          </h2>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-4 py-1.5 text-xs font-medium backdrop-blur-sm">
          <Sparkles className="h-3 w-3" />
          {tier}
        </span>
      </div>

      <div className="relative mt-8">
        <div className="flex items-end justify-between text-sm">
          <p className="text-primary-foreground/85">
            Te faltan <span className="font-semibold">{pointsToNext} puntos</span> para tu
            próxima recompensa
          </p>
          <span className="font-serif text-2xl font-semibold">{progress}%</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-primary-foreground/15">
          <div
            className="h-full rounded-full bg-primary-foreground transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="relative mt-8 flex flex-wrap gap-3">
        <Button
          variant="secondary"
          className="rounded-full bg-primary-foreground px-6 text-forest hover:bg-primary-foreground/90"
        >
          Ver mis beneficios
        </Button>
        <Button
          variant="outline"
          className="rounded-full border-primary-foreground/40 bg-transparent px-6 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
        >
          Cómo ganar más
        </Button>
      </div>
    </div>
  );
}
