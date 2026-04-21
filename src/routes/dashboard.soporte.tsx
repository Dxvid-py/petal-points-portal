import { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  MessageCircle,
  Phone,
  Mail,
  Clock,
  ChevronDown,
  Send,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const channels = [
  { icon: MessageCircle, label: "Chat con el atelier", desc: "Respondemos en menos de 5 minutos", detail: "Lun a Sáb · 9am – 7pm", accent: "bg-gradient-ink text-primary-foreground" },
  { icon: Phone, label: "Línea directa", desc: "+57 (1) 555 0188", detail: "Atención 24/7 para urgencias", accent: "bg-gradient-terracotta text-terracotta-foreground" },
  { icon: Mail, label: "Correo concierge", desc: "atelier@botaniqueluxe.co", detail: "Respuesta en 24h hábiles", accent: "bg-blush text-blush-foreground" },
];

const faqs = [
  { q: "¿Cómo gano puntos en el club?", a: "Por cada $1.000 COP de compra recibes 1 punto. Además, ganas bonos por aniversario, cumpleaños, referidos y compras en colecciones especiales." },
  { q: "¿Los puntos vencen?", a: "Tus puntos tienen una vigencia de 18 meses desde la última compra activa. Te avisaremos por correo 30 días antes de cualquier expiración." },
  { q: "¿Cómo subo de nivel?", a: "Los niveles se alcanzan al acumular puntos: Pétalo (0), Jardín (500), Oro (1.000) y Platino (2.500). Tu nivel se renueva cada 12 meses." },
  { q: "¿Puedo regalar mis puntos?", a: "Sí. Desde tu perfil puedes transferir hasta el 30% de tu balance a otra cuenta del club, una vez cada trimestre." },
  { q: "¿Cómo canjeo una recompensa?", a: "Entra a la sección Recompensas, elige tu favorita y haz clic en Canjear. Recibirás un correo con tu código y las instrucciones de uso." },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [form, setForm] = useState({ subject: "", topic: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject || !form.topic || !form.message) {
      toast.error("Completa todos los campos antes de enviar.");
      return;
    }
    toast.success("Mensaje enviado al atelier", {
      description: "Te responderemos en menos de 24 horas a tu correo registrado.",
    });
    setForm({ subject: "", topic: "", message: "" });
  };

  return (
    <div className="flex flex-col gap-10">
      <Helmet>
        <title>Soporte — Botanique Luxe</title>
        <meta name="description" content="Atención personalizada del Club Botanique Luxe. Habla con el atelier." />
      </Helmet>
      <PageHeader
        eyebrow="Soporte"
        title={
          <>
            ¿En qué podemos <em className="italic">acompañarte?</em>
          </>
        }
        description="Nuestro equipo concierge está listo para ayudarte con tu cuenta, pedidos y experiencias."
      />

      <section className="grid gap-4 md:grid-cols-3">
        {channels.map((c) => (
          <article
            key={c.label}
            className={`flex flex-col justify-between gap-6 rounded-3xl p-7 shadow-soft ${c.accent}`}
          >
            <c.icon className="h-7 w-7 opacity-80" strokeWidth={1.5} />
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] opacity-70">{c.detail}</p>
              <p className="mt-2 font-serif text-2xl font-semibold leading-tight">{c.label}</p>
              <p className="mt-1 text-sm opacity-85">{c.desc}</p>
            </div>
          </article>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-7 shadow-soft">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-terracotta/15 text-terracotta">
                <Send className="h-4 w-4" strokeWidth={1.75} />
              </span>
              <div>
                <h3 className="font-serif text-2xl font-semibold text-foreground">Escríbenos</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Cuéntanos en detalle y te conectamos con el especialista correcto.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="subject">Asunto</Label>
                <Input
                  id="subject"
                  maxLength={120}
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Ej. Consulta sobre mi último pedido"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic">Tema</Label>
                <Select value={form.topic} onValueChange={(v) => setForm({ ...form, topic: v })}>
                  <SelectTrigger id="topic">
                    <SelectValue placeholder="Selecciona un tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pedido">Estado de mi pedido</SelectItem>
                    <SelectItem value="puntos">Puntos y recompensas</SelectItem>
                    <SelectItem value="cuenta">Mi cuenta o perfil</SelectItem>
                    <SelectItem value="evento">Cotización para un evento</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Mensaje</Label>
                <Textarea
                  id="message"
                  rows={6}
                  maxLength={1000}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Cuéntanos cómo podemos ayudarte…"
                />
                <p className="text-right text-[10px] text-muted-foreground">{form.message.length}/1000</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
              <p className="text-xs text-muted-foreground">
                <Clock className="mr-1 inline h-3 w-3" />
                Tiempo de respuesta promedio: 4 horas
              </p>
              <Button type="submit" className="rounded-full bg-ink px-6 text-ink-foreground hover:bg-ink/90">
                Enviar mensaje
                <Send className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </form>
        </section>

        <section className="lg:col-span-2">
          <div className="rounded-3xl border border-border bg-card p-7 shadow-soft">
            <p className="text-[10px] uppercase tracking-[0.24em] text-terracotta">Respuestas rápidas</p>
            <h3 className="mt-1 font-serif text-2xl font-semibold text-foreground">Preguntas frecuentes</h3>

            <ul className="mt-6 space-y-1">
              {faqs.map((f, i) => {
                const isOpen = openFaq === i;
                return (
                  <li key={f.q} className="border-b border-border/60 last:border-0">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-3 py-4 text-left"
                    >
                      <span className="text-sm font-medium text-foreground">{f.q}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isOpen && <p className="pb-4 text-sm leading-relaxed text-muted-foreground">{f.a}</p>}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-6 flex items-start gap-4 rounded-3xl bg-gradient-terracotta p-6 text-terracotta-foreground shadow-soft">
            <Sparkles className="h-6 w-6 shrink-0 opacity-90" strokeWidth={1.5} />
            <div>
              <p className="font-serif text-lg font-semibold">Atención prioritaria Oro</p>
              <p className="mt-1 text-sm text-terracotta-foreground/85">
                Como miembro Oro, tus consultas se atienden con prioridad y un asesor dedicado.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
