import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/Logo";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function AuthPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initialMode = params.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [loading, setLoading] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [nit, setNit] = useState("");
  const [phone, setPhone] = useState("");
  const [parishCode, setParishCode] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        if (!acceptedTerms) {
          toast.error("Debes aceptar el tratamiento de datos personales");
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
              nit,
              phone,
              parish_code: parishCode || null,
            },
          },
        });
        if (error) throw error;
        toast.success("¡Cuenta creada! Revisa tu correo para confirmar.");
        navigate("/dashboard");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bienvenido de vuelta");
        navigate("/dashboard");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error inesperado";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <Helmet>
        <title>{mode === "signup" ? "Regístrate" : "Ingresar"} — Puntos Deluxe</title>
      </Helmet>

      {/* Decoración */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-gold">
          <ArrowLeft className="h-4 w-4" /> Volver al inicio
        </Link>

        <div className="rounded-3xl border border-border/40 bg-card/60 p-8 backdrop-blur-xl">
          <div className="mb-6 flex justify-center">
            <Logo to="/" />
          </div>

          <h1 className="text-center font-serif text-3xl font-semibold text-foreground">
            {mode === "signup" ? "Únete al Club" : "Bienvenido de vuelta"}
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {mode === "signup"
              ? "Crea tu cuenta y empieza a acumular puntos Deluxe."
              : "Ingresa para ver tus puntos y recompensas."}
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <Label htmlFor="fullName" className="text-foreground">Nombre completo *</Label>
                  <Input
                    id="fullName"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1.5 border-border/50 bg-background/40 text-foreground"
                    placeholder="Angie Restrepo"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="nit" className="text-foreground">NIT / Cédula *</Label>
                    <Input
                      id="nit"
                      required
                      value={nit}
                      onChange={(e) => setNit(e.target.value)}
                      className="mt-1.5 border-border/50 bg-background/40 text-foreground"
                      placeholder="1.045.xxx.xxx"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-foreground">Teléfono</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="mt-1.5 border-border/50 bg-background/40 text-foreground"
                      placeholder="+57 300 000 0000"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="parishCode" className="text-foreground">
                    Código de Parroquia <span className="text-muted-foreground">(opcional)</span>
                  </Label>
                  <Input
                    id="parishCode"
                    value={parishCode}
                    onChange={(e) => setParishCode(e.target.value)}
                    className="mt-1.5 border-border/50 bg-background/40 text-foreground"
                    placeholder="PARR-001"
                  />
                </div>
              </>
            )}
            <div>
              <Label htmlFor="email" className="text-foreground">Correo *</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 border-border/50 bg-background/40 text-foreground"
                placeholder="tu@correo.com"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-foreground">Contraseña *</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 border-border/50 bg-background/40 text-foreground"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            {mode === "signup" && (
              <div className="flex items-start gap-3 rounded-lg border border-border/40 bg-background/30 p-3">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(v) => setAcceptedTerms(!!v)}
                  className="mt-0.5 border-gold/50 data-[state=checked]:bg-primary"
                />
                <label htmlFor="terms" className="text-xs leading-relaxed text-muted-foreground">
                  Acepto el{" "}
                  <a href="#" className="text-gold underline-offset-2 hover:underline">
                    tratamiento de mis datos personales
                  </a>{" "}
                  conforme al marco legal del Programa Puntos Deluxe.
                </label>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-primary text-primary-foreground transition-colors hover:bg-gold hover:text-gold-foreground"
              size="lg"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signup" ? "Crear cuenta" : "Ingresar"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signup" ? (
              <>
                ¿Ya tienes cuenta?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="font-medium text-gold hover:underline"
                >
                  Ingresa
                </button>
              </>
            ) : (
              <>
                ¿Nuevo aquí?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="font-medium text-gold hover:underline"
                >
                  Crea tu cuenta
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
