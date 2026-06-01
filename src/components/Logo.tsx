import { Link } from "react-router-dom";

const LOGO_URL = "https://i.ibb.co/yc50fWW4/Captura-de-pantalla-2026-04-24-001156.png";

interface LogoProps {
  to?: string;
  variant?: "default" | "light";
}

export function Logo({ to = "/", variant = "default" }: LogoProps) {
  return (
    <Link to={to} className="group flex items-center gap-3" aria-label="Puntos Deluxe — Inicio">
      <span className="relative flex h-14 w-14 items-center justify-center transition-transform group-hover:rotate-6">
        {/* Marco floral */}
        <svg
          viewBox="0 0 64 64"
          className="pointer-events-none absolute inset-0 h-full w-full text-primary"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="petalGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.55" />
            </radialGradient>
          </defs>
          {Array.from({ length: 8 }).map((_, i) => (
            <ellipse
              key={i}
              cx="32"
              cy="6"
              rx="3.6"
              ry="6"
              fill="url(#petalGrad)"
              transform={`rotate(${i * 45} 32 32)`}
            />
          ))}
          {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((deg) => (
            <ellipse
              key={deg}
              cx="32"
              cy="9"
              rx="1.6"
              ry="3.2"
              fill="currentColor"
              opacity="0.55"
              transform={`rotate(${deg} 32 32)`}
              className="text-forest"
            />
          ))}
          <circle cx="32" cy="32" r="3" fill="currentColor" opacity="0.25" />
        </svg>
        {/* Foto cuadrada */}
        <span
          className={[
            "relative z-10 flex h-9 w-9 items-center justify-center overflow-hidden rounded-[6px] border bg-white shadow-soft",
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
