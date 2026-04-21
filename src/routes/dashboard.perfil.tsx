import { Helmet } from "react-helmet-async";
import { Mail, Phone, MapPin, Calendar, Bell, Shield, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Avatar } from "@/components/dashboard/Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const tiers = [
  { name: "Pétalo", points: 0, color: "bg-secondary" },
  { name: "Jardín", points: 500, color: "bg-blush" },
  { name: "Oro", points: 1000, color: "bg-gold/40", current: true },
  { name: "Platino", points: 2500, color: "bg-primary-soft" },
];

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-10">
      <Helmet>
        <title>Mi Perfil — Botanique Luxe</title>
        <meta name="description" content="Datos personales, preferencias y nivel del Club Botanique Luxe." />
      </Helmet>
      <PageHeader
        eyebrow="Mi perfil"
        title={
          <>
            Tus datos, <em className="italic">tu estilo.</em>
          </>
        }
        description="Mantén tu información actualizada para recibir las mejores experiencias florales."
        showAvatar={false}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-1">
          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
            <div className="bg-gradient-ink h-28" />
            <div className="-mt-12 flex flex-col items-center px-6 pb-6 text-center">
              <Avatar name="Angie Restrepo" size="xl" ring />
              <h2 className="mt-4 font-serif text-2xl font-semibold text-foreground">Angie Restrepo</h2>
              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-gold-foreground">
                ✦ Nivel Oro · 1.250 pts
              </p>
              <p className="mt-3 max-w-[24ch] text-xs text-muted-foreground">
                "Las flores son la sonrisa de la tierra."
              </p>

              <div className="mt-6 grid w-full grid-cols-3 gap-2 border-t border-border pt-4 text-center">
                <div>
                  <p className="font-serif text-xl font-semibold text-foreground">14</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Compras</p>
                </div>
                <div className="border-x border-border">
                  <p className="font-serif text-xl font-semibold text-foreground">7</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Canjes</p>
                </div>
                <div>
                  <p className="font-serif text-xl font-semibold text-foreground">22m</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Antigüedad</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-soft">
            <p className="text-[10px] uppercase tracking-[0.24em] text-terracotta">Niveles del club</p>
            <h3 className="mt-1 font-serif text-xl font-semibold text-foreground">Tu camino</h3>
            <ol className="mt-5 space-y-4">
              {tiers.map((t) => (
                <li key={t.name} className="flex items-center gap-3">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${t.color} font-serif text-sm font-semibold text-foreground`}
                  >
                    {t.current ? <Sparkles className="h-4 w-4" /> : t.name[0]}
                  </span>
                  <div className="flex-1">
                    <p
                      className={`text-sm ${t.current ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                    >
                      Nivel {t.name}
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {t.points.toLocaleString()} pts
                    </p>
                  </div>
                  {t.current && (
                    <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] text-gold-foreground">
                      Actual
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="space-y-6 lg:col-span-2">
          <form className="space-y-6 rounded-3xl border border-border bg-card p-7 shadow-soft">
            <div>
              <h3 className="font-serif text-2xl font-semibold text-foreground">Información personal</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Estos datos son privados y solo se usan para personalizar tu experiencia.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input id="firstName" defaultValue="Angie María" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellidos</Label>
                <Input id="lastName" defaultValue="Restrepo Vélez" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="mr-1.5 inline h-3 w-3" />
                  Correo
                </Label>
                <Input id="email" type="email" defaultValue="angie.restrepo@correo.co" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="mr-1.5 inline h-3 w-3" />
                  Teléfono
                </Label>
                <Input id="phone" defaultValue="+57 310 555 0188" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthday">
                  <Calendar className="mr-1.5 inline h-3 w-3" />
                  Cumpleaños
                </Label>
                <Input id="birthday" type="date" defaultValue="1992-04-18" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">
                  <MapPin className="mr-1.5 inline h-3 w-3" />
                  Ciudad
                </Label>
                <Input id="address" defaultValue="Barranquilla, Colombia" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border pt-5">
              <Button variant="ghost" type="button">
                Cancelar
              </Button>
              <Button type="submit" className="rounded-full bg-ink px-6 text-ink-foreground hover:bg-ink/90">
                Guardar cambios
              </Button>
            </div>
          </form>

          <div className="rounded-3xl border border-border bg-card p-7 shadow-soft">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blush text-blush-foreground">
                <Bell className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <div>
                <h3 className="font-serif text-2xl font-semibold text-foreground">Preferencias</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Decide cómo y cuándo quieres saber de nosotros.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {[
                { label: "Novedades del atelier", desc: "Lanzamientos de colecciones y flores de temporada.", on: true },
                { label: "Recompensas por vencer", desc: "Avísame 7 días antes de que expire una recompensa.", on: true },
                { label: "Invitaciones a talleres", desc: "Acceso anticipado a nuestros talleres botánicos.", on: false },
                { label: "Recordatorio de cumpleaños", desc: "Quiero un detalle floral en mi día especial.", on: true },
              ].map((p) => (
                <div
                  key={p.label}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-secondary/60 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.label}</p>
                    <p className="text-xs text-muted-foreground">{p.desc}</p>
                  </div>
                  <Switch defaultChecked={p.on} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-3xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-forest">
                <Shield className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <div>
                <p className="font-serif text-base font-semibold text-foreground">Seguridad de la cuenta</p>
                <p className="text-xs text-muted-foreground">Última sesión: hoy · Barranquilla</p>
              </div>
            </div>
            <Button variant="outline" className="rounded-full">
              Cambiar contraseña
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
