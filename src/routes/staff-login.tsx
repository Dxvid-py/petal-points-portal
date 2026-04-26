import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

export default function StaffLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      // Verifica rol
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);
      const roles = (rolesData ?? []).map((r) => r.role);
      if (roles.includes("admin")) {
        toast.success("Bienvenido, admin");
        navigate("/admin");
      } else if (roles.includes("asesora")) {
        toast.success("Bienvenida, asesora");
        navigate("/asesora");
      } else {
        toast.error("Esta cuenta no tiene permisos de staff");
        await supabase.auth.signOut();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-foreground px-4 py-12 text-background">
      <Helmet>
        <title>Acceso del equipo — Floristería Deluxe</title>
      </Helmet>

      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gold/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-background/70 hover:text-gold">
          <ArrowLeft className="h-4 w-4" /> Volver al inicio
        </Link>

        <div className="rounded-3xl border border-background/10 bg-background/5 p-8 backdrop-blur-xl">
          <div className="mb-6 flex justify-center">
            <Logo to="/" variant="light" />
          </div>

          <div className="mb-6 flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-gold">
              <ShieldCheck className="h-3 w-3" /> Solo equipo Deluxe
            </span>
            <h1 className="mt-4 font-serif text-3xl font-semibold">Acceso del equipo</h1>
            <p className="mt-2 text-sm text-background/70">
              Para administradores y asesoras de Floristería Deluxe.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-background">Correo</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 border-background/20 bg-background/10 text-background placeholder:text-background/40"
                placeholder="admin@floristeriadeluxe.com"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-background">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 border-background/20 bg-background/10 text-background placeholder:text-background/40"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gold text-gold-foreground hover:bg-gold/90"
              size="lg"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ingresar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-background/60">
            ¿Eres cliente?{" "}
            <Link to="/auth" className="font-medium text-gold hover:underline">
              Ir al login del club
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
