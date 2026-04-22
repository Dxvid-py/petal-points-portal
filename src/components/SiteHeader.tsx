import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export function SiteHeader() {
  const { user, profile } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Logo />
        <nav className="hidden items-center gap-10 md:flex">
          <a
            href="#fidelizacion"
            className="text-sm text-muted-foreground transition-colors hover:text-gold"
          >
            Cómo Funciona
          </a>
          <a
            href="#redime"
            className="text-sm text-muted-foreground transition-colors hover:text-gold"
          >
            Redime
          </a>
          <a
            href="#galeria"
            className="text-sm text-muted-foreground transition-colors hover:text-gold"
          >
            Galería
          </a>
          <Link
            to="/dashboard"
            className="text-sm text-muted-foreground transition-colors hover:text-gold"
          >
            Mi Cuenta
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <Button asChild className="rounded-full bg-primary px-5 hover:bg-gold hover:text-gold-foreground">
              <Link to="/dashboard">{profile?.points_balance ?? 0} pts</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" className="hidden rounded-full text-foreground hover:text-gold sm:inline-flex">
                <Link to="/auth">Ingresar</Link>
              </Button>
              <Button
                asChild
                className="rounded-full bg-primary px-5 text-primary-foreground transition-colors hover:bg-gold hover:text-gold-foreground"
              >
                <Link to="/auth?mode=signup">Regístrate</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
