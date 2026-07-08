import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const NAV = [
  { to: "/#fidelizacion", label: "Cómo funciona", hash: true },
  { to: "/catalogo", label: "Catálogo" },
  { to: "/momentos", label: "Momentos" },
  { to: "/dashboard", label: "Mi cuenta" },
];

export function SiteHeader() {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-20 md:px-6 lg:px-10">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((n) => (
            n.hash ? (
              <a key={n.to} href={n.to} className="text-sm text-muted-foreground transition-colors hover:text-primary">{n.label}</a>
            ) : (
              <Link key={n.to} to={n.to} className="text-sm text-muted-foreground transition-colors hover:text-primary">{n.label}</Link>
            )
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Button asChild className="rounded-full bg-primary px-4 text-sm hover:bg-gold hover:text-gold-foreground">
              <Link to="/dashboard">{profile?.points_balance ?? 0} pts</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden rounded-full text-foreground hover:text-primary md:inline-flex">
                <Link to="/auth">Ingresar</Link>
              </Button>
              <Button asChild className="rounded-full bg-primary px-4 text-sm text-primary-foreground hover:bg-gold hover:text-gold-foreground">
                <Link to="/auth?mode=signup">Regístrate</Link>
              </Button>
            </>
          )}
          <button onClick={() => setOpen(v => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground md:hidden"
            aria-label="Menú">
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="border-t border-border/60 bg-background md:hidden">
          <ul className="flex flex-col px-4 py-3">
            {NAV.map((n) => (
              <li key={n.to} className="border-b border-border/40 last:border-b-0">
                {n.hash ? (
                  <a href={n.to} className="block py-3 text-sm text-foreground">{n.label}</a>
                ) : (
                  <Link to={n.to} className="block py-3 text-sm text-foreground">{n.label}</Link>
                )}
              </li>
            ))}
            {!user && (
              <li className="pt-3">
                <Link to="/auth" className="block py-2 text-sm text-primary">Iniciar sesión</Link>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
