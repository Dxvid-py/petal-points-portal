import { Routes, Route, Link } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import LandingPage from "./routes/index";
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
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path="perfil" element={<ProfilePage />} />
          <Route path="recompensas" element={<RewardsPage />} />
          <Route path="compras" element={<PurchasesPage />} />
          <Route path="soporte" element={<SupportPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" />
    </>
  );
}
