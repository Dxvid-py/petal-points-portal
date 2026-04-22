import { Link } from "react-router-dom";

interface LogoProps {
  to?: string;
  variant?: "default" | "light";
}

export function Logo({ to = "/", variant = "default" }: LogoProps) {
  const isLight = variant === "light";
  return (
    <Link to={to} className="group flex items-center gap-3">
      <span
        className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-transform group-hover:rotate-6 ${
          isLight
            ? "border-gold/40 bg-black text-gold"
            : "border-gold/40 bg-black text-gold"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        >
          <path d="M12 2.5c2.8 3.2 4.5 6.4 4.5 9.5a4.5 4.5 0 0 1-9 0c0-3.1 1.7-6.3 4.5-9.5z" />
          <path d="M12 13v8.5" />
          <path d="M8.5 18.5c2 1.2 5 1.2 7 0" />
        </svg>
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
