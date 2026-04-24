import { Link } from "react-router-dom";

const LOGO_URL = "https://i.ibb.co/yc50fWW4/Captura-de-pantalla-2026-04-24-001156.png";

interface LogoProps {
  to?: string;
  variant?: "default" | "light";
}

export function Logo({ to = "/", variant = "default" }: LogoProps) {
  return (
    <Link to={to} className="group flex items-center gap-3" aria-label="Puntos Deluxe — Inicio">
      <span
        className={[
          "flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 bg-white shadow-soft transition-transform group-hover:rotate-6",
          variant === "light" ? "border-primary/30" : "border-primary/40",
        ].join(" ")}
      >
        <img
          src={LOGO_URL}
          alt="Logo Puntos Deluxe"
          className="h-full w-full object-cover"
          loading="eager"
        />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-serif text-[1.05rem] font-semibold tracking-tight text-foreground">
          Puntos <em className="not-italic font-bold text-shimmer-gold">Deluxe</em>
        </span>
        <span className="mt-1 text-[9px] uppercase tracking-[0.32em] text-primary">
          Floristería · Barranquilla
        </span>
      </span>
    </Link>
  );
}
