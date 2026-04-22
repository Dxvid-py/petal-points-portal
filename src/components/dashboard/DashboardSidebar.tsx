import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Gift,
  ShoppingBag,
  MessageCircle,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Avatar } from "./Avatar";
import { useAuth } from "@/contexts/AuthContext";

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
};

const navItems: NavItem[] = [
  { to: "/dashboard", label: "Resumen", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/perfil", label: "Mi perfil", icon: User },
  { to: "/dashboard/recompensas", label: "Recompensas", icon: Gift },
  { to: "/dashboard/compras", label: "Mis compras", icon: ShoppingBag },
  { to: "/dashboard/soporte", label: "Soporte", icon: MessageCircle },
];

export function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const displayName = profile?.full_name ?? "Cliente Deluxe";
  const balance = profile?.points_balance ?? 0;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
      <div className="px-6 pt-8 pb-6">
        <Logo to="/dashboard" variant="light" />
      </div>

      <div className="mx-6 mb-6 rounded-2xl border border-sidebar-border bg-sidebar-accent/40 p-4">
        <div className="flex items-center gap-3">
          <Avatar name={displayName} size="md" ring />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{displayName}</p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-gold">✦ Club Deluxe</p>
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between border-t border-sidebar-border/60 pt-3">
          <span className="text-[10px] uppercase tracking-[0.22em] text-sidebar-foreground/50">Balance</span>
          <span className="font-serif text-base font-semibold text-shimmer-gold">
            {balance.toLocaleString("es-CO")} <span className="text-xs font-normal text-sidebar-foreground/60">pts</span>
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3">
        <p className="px-3 pb-2 text-[10px] uppercase tracking-[0.24em] text-sidebar-foreground/40">
          Atelier
        </p>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname === item.to ||
                location.pathname.startsWith(item.to + "/");
            return (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className={[
                    "group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/65 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground",
                  ].join(" ")}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-sidebar-primary" />
                  )}
                  <item.icon className="h-4 w-4" strokeWidth={1.75} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-6 pb-8">
        <div className="mb-4 rounded-2xl border border-dashed border-sidebar-border p-4">
          <p className="font-serif text-sm leading-snug text-sidebar-foreground">
            ¿Necesitas inspiración?
          </p>
          <p className="mt-1 text-xs text-sidebar-foreground/55">
            Reserva una consulta floral con nuestro atelier.
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
