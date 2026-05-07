import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Logo } from "@/components/Logo";
import { isUsingFallbackSupabaseConfig, supabase } from "@/lib/supabase";
import { ArrowLeft, Loader2, Church, User } from "lucide-react";

type AccountType = "parroquia" | "persona";

export default function AuthPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initialMode = params.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [loading, setLoading] = useState(false);

  // SIGN IN (solo nombre + PIN)
  const [loginName, setLoginName] = useState("");
  const [loginPin, setLoginPin] = useState("");

  // SIGN UP
  const [accountType, setAccountType] = useState<AccountType>("parroquia");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [nit, setNit] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const checkConfig = () => {
    if (isUsingFallbackSupabaseConfig && window.location.hostname !== "localhost") {
      toast.error("La app todavía no está conectada a Supabase.");
      return false;
    }
    return true;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkConfig()) return;
    if (!loginName.trim() || !loginPin.trim()) {
      toast.error("Ingresa el nombre y el PIN");
      return;
    }
    setLoading(true);
    try {
      const { data: foundEmail, error: rpcErr } = await supabase.rpc("lookup_email_by_name", {
        _name: loginName.trim(),
      });
      if (rpcErr) throw rpcErr;
      if (!foundEmail) {
        toast.error("No encontramos esa cuenta. Verifica el nombre exacto.");
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: foundEmail as string,
        password: loginPin.trim(),
      });
      if (error) {
        toast.error("PIN incorrecto. Inténtalo de nuevo.");
        setLoading(false);
        return;
      }
      toast.success(`Hola, ${loginName.trim()}`);
      navigate("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkConfig()) return;
    if (!acceptedTerms) {
      toast.error("Debes aceptar el tratamiento de datos personales");
      return;
    }
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      toast.error("El PIN debe ser exactamente 6 dígitos numéricos");
      return;
    }
    if (pin !== pinConfirm) {
      toast.error("Los PIN no coinciden");
      return;
    }
    if (!address.trim()) {
      toast.error("La dirección es obligatoria");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: pin,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: displayName.trim(),
            display_name: displayName.trim(),
            account_type: accountType,
            nit: nit.trim() || null,
            phone: phone.trim() || null,
            address: address.trim() || null,
          },
        },
      });
      if (error) {
        if (error.message.toLowerCase().includes("duplicate") || error.message.includes("23505")) {
          toast.error("Ese nombre ya está registrado. Usa una variación distinta.");
        } else {
          toast.error(error.message);
        }
        setLoading(false);
        return;
      }
      toast.success("¡Cuenta creada! Bienvenido al Club Deluxe.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <Helmet>
        <title>{mode === "signup" ? "Regístrate" : "Ingresar"} — Puntos Deluxe</title>
      </Helmet>

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

          <div className="mb-6 grid grid-cols-2 rounded-full border border-border/40 bg-background/40 p-1">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                mode === "signin" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                mode === "signup" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Registrarme
            </button>
          </div>

          {mode === "signin" ? (
            <>
              <h1 className="text-center font-serif text-3xl font-semibold text-foreground">
                Bienvenido de vuelta
              </h1>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Ingresa con el nombre de tu cuenta y tu PIN.
              </p>
              <form onSubmit={handleSignIn} className="mt-7 space-y-4">
                <div>
                  <Label htmlFor="loginName" className="text-foreground">Nombre de la cuenta</Label>
                  <Input
                    id="loginName"
                    required
                    autoFocus
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    className="mt-1.5 border-border/50 bg-background/40 text-foreground"
                    placeholder="Parroquia San José"
                  />
                </div>
                <div>
                  <Label htmlFor="loginPin" className="text-foreground">PIN</Label>
                  <Input
                    id="loginPin"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    minLength={6}
                    maxLength={6}
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="mt-1.5 border-border/50 bg-background/40 text-center font-serif text-2xl tracking-[0.5em] text-foreground"
                    placeholder="• • • • • •"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-primary text-primary-foreground hover:bg-gold hover:text-gold-foreground"
                  size="lg"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ingresar"}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  ¿Eres del equipo?{" "}
                  <Link to="/staff-login" className="font-medium text-gold hover:underline">
                    Iniciar sesión como staff
                  </Link>
                </p>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-center font-serif text-3xl font-semibold text-foreground">
                Únete al Club
              </h1>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Crea tu cuenta y empieza a acumular puntos Deluxe.
              </p>

              <form onSubmit={handleSignUp} className="mt-7 space-y-4">
                <div>
                  <Label className="text-foreground">Tipo de cuenta</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAccountType("parroquia")}
                      className={`flex flex-col items-center gap-1 rounded-2xl border p-3 text-xs transition-all ${
                        accountType === "parroquia"
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border/40 bg-background/30 text-muted-foreground hover:border-border"
                      }`}
                    >
                      <Church className="h-5 w-5" />
                      <span className="font-medium">Parroquia</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType("persona")}
                      className={`flex flex-col items-center gap-1 rounded-2xl border p-3 text-xs transition-all ${
                        accountType === "persona"
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border/40 bg-background/30 text-muted-foreground hover:border-border"
                      }`}
                    >
                      <User className="h-5 w-5" />
                      <span className="font-medium">Persona común</span>
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="displayName" className="text-foreground">
                    {accountType === "parroquia" ? "Nombre de la parroquia" : "Tu nombre"} *
                  </Label>
                  <Input
                    id="displayName"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="mt-1.5 border-border/50 bg-background/40 text-foreground"
                    placeholder={accountType === "parroquia" ? "Parroquia San José" : "Angie Restrepo"}
                  />
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Este será el nombre con el que inicies sesión. Debe ser único.
                  </p>
                </div>

                <div>
                  <Label htmlFor="email" className="text-foreground">Correo *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5 border-border/50 bg-background/40 text-foreground"
                    placeholder="contacto@correo.com"
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="text-foreground">Dirección *</Label>
                  <Input
                    id="address"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="mt-1.5 border-border/50 bg-background/40 text-foreground"
                    placeholder="Cra 10 # 20-30, Barrio Centro, Cali"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="nit" className="text-foreground">NIT / Cédula</Label>
                    <Input
                      id="nit"
                      value={nit}
                      onChange={(e) => setNit(e.target.value)}
                      className="mt-1.5 border-border/50 bg-background/40 text-foreground"
                      placeholder="900.xxx.xxx"
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

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="pin" className="text-foreground">PIN (6 dígitos) *</Label>
                    <Input
                      id="pin"
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      minLength={6}
                      maxLength={6}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="mt-1.5 border-background/40 bg-background/40 text-center tracking-[0.4em] text-foreground"
                      placeholder="••••••"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pinConfirm" className="text-foreground">Confirmar PIN *</Label>
                    <Input
                      id="pinConfirm"
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      required
                      minLength={6}
                      maxLength={6}
                      value={pinConfirm}
                      onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="mt-1.5 border-border/50 bg-background/40 text-center tracking-[0.4em] text-foreground"
                      placeholder="••••••"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-border/40 bg-background/30 p-3">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(v) => setAcceptedTerms(!!v)}
                    className="mt-0.5 border-gold/50 data-[state=checked]:bg-primary"
                  />
                  <label htmlFor="terms" className="text-xs leading-relaxed text-muted-foreground">
                    Acepto el{" "}
                    <Link to="/legal" target="_blank" className="font-medium text-gold underline hover:text-primary">
                      tratamiento de datos personales
                    </Link>{" "}
                    conforme al marco del Programa Puntos Deluxe (Ley 1581 de 2012).
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-primary text-primary-foreground hover:bg-gold hover:text-gold-foreground"
                  size="lg"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear cuenta"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
