import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Gift,
  Image as ImageIcon,
  History,
  ShieldCheck,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Avatar } from "@/components/dashboard/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { RoleGuard } from "@/components/RoleGuard";

const adminNav = [
  { to: "/admin", label: "Resumen", icon: LayoutDashboard, exact: true },
  { to: "/admin/clientes", label: "Clientes", icon: Users },
  { to: "/admin/recompensas", label: "Recompensas", icon: Gift },
  { to: "/admin/galeria", label: "Galería", icon: ImageIcon },
  { to: "/admin/transacciones", label: "Transacciones", icon: History },
  { to: "/admin/roles", label: "Roles del equipo", icon: ShieldCheck },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const displayName = profile?.full_name ?? "Admin";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <RoleGuard allow={["admin"]}>
      <div className="flex min-h-screen flex-col bg-background lg:flex-row">
        {/* Sidebar */}
        <aside className="hidden w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
          <div className="px-6 pt-8 pb-6">
            <Logo to="/admin" variant="light" />
          </div>

          <div className="mx-6 mb-6 rounded-2xl border border-sidebar-border bg-sidebar-accent/40 p-4">
            <div className="flex items-center gap-3">
              <Avatar name={displayName} size="md" ring />
              <div className="min-w-0 leading-tight">
                <p className="truncate text-sm font-medium text-sidebar-foreground">
                  {displayName}
                </p>
                <p className="text-[10px] uppercase tracking-[0.22em] text-gold">
                  ✦ Administrador
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3">
            <p className="px-3 pb-2 text-[10px] uppercase tracking-[0.24em] text-sidebar-foreground/40">
              Gestión
            </p>
            <ul className="space-y-0.5">
              {adminNav.map((item) => {
                const isActive = item.exact
                  ? location.pathname === item.to
                  : location.pathname === item.to ||
                    location.pathname.startsWith(item.to + "/");
                return (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className={`group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/65 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                      }`}
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

          <div className="px-6 pb-8 space-y-2">
            <Link
              to="/dashboard"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Vista cliente
            </Link>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </aside>

        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-5 py-3 backdrop-blur lg:hidden">
          <Logo to="/admin" />
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
            >
              Cliente
            </Link>
            <button
              onClick={handleSignOut}
              className="rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground"
            >
              Salir
            </button>
          </div>
        </header>

        <main className="flex min-w-0 flex-1 flex-col">
          {/* Mobile nav scrollable */}
          <nav className="border-b border-border bg-card lg:hidden">
            <ul className="flex gap-1 overflow-x-auto px-4 py-2">
              {adminNav.map((item) => {
                const isActive = item.exact
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs ${
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="flex-1 px-5 py-8 md:px-10 md:py-12">
            <div className="mx-auto w-full max-w-6xl">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}
