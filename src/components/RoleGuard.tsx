import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth, type AppRole } from "@/contexts/AuthContext";

interface RoleGuardProps {
  allow: AppRole[];
  children: React.ReactNode;
}

export function RoleGuard({ allow, children }: RoleGuardProps) {
  const { user, roles, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  const ok = allow.some((r) => roles.includes(r));
  if (!ok) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <p className="font-serif text-3xl text-foreground">Acceso restringido</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Esta sección está reservada para el equipo de Floristería Deluxe ({allow.join(" o ")}).
        </p>
        <a
          href="/dashboard"
          className="rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground hover:bg-gold"
        >
          Volver a mi atelier
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
