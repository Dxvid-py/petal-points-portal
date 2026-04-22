import { Routes, Route, Link } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import LandingPage from "./routes/index";
import AuthPage from "./routes/auth";
import DashboardLayout from "./routes/dashboard";
import DashboardHome from "./routes/dashboard.index";
import ProfilePage from "./routes/dashboard.perfil";
import RewardsPage from "./routes/dashboard.recompensas";
import PurchasesPage from "./routes/dashboard.compras";
import SupportPage from "./routes/dashboard.soporte";

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-7xl font-bold text-shimmer-gold">404</h1>
        <h2 className="mt-4 font-serif text-xl font-semibold text-foreground">
          Página no encontrada
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          La página que buscas no existe o fue movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-gold hover:text-gold-foreground"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="perfil" element={<ProfilePage />} />
          <Route path="recompensas" element={<RewardsPage />} />
          <Route path="compras" element={<PurchasesPage />} />
          <Route path="soporte" element={<SupportPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" theme="dark" />
    </AuthProvider>
  );
}
