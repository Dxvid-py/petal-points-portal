import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2, Upload, Save, Video, Trash2, Plus, GripVertical, Image as ImageIcon } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { fetchSiteContent, type SiteContentMap } from "@/lib/site-content";
import { SITE_KEYS, type HeroSlide, type Faq } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function AdminContenidoPage() {
  const { user } = useAuth();
  const [content, setContent] = useState<SiteContentMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef<HTMLInputElement>(null);

  // Textos generales
  const [atelierName, setAtelierName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroCta, setHeroCta] = useState("");

  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);

  const load = async () => {
    setLoading(true);
    const [map, hs, fq] = await Promise.all([
      fetchSiteContent(),
      supabase.from("hero_slides").select("*").order("position"),
      supabase.from("faqs").select("*").order("position"),
    ]);
    setContent(map);
    setAtelierName(map[SITE_KEYS.atelierName]?.text ?? "");
    setContactEmail(map[SITE_KEYS.contactEmail]?.text ?? "");
    setContactPhone(map[SITE_KEYS.contactPhone]?.text ?? "");
    setWhatsappNumber(map[SITE_KEYS.whatsappNumber]?.text ?? "");
    setHeroTitle(map[SITE_KEYS.heroTitle]?.text ?? "");
    setHeroSubtitle(map[SITE_KEYS.heroSubtitle]?.text ?? "");
    setHeroCta(map[SITE_KEYS.heroCta]?.text ?? "");
    setSlides((hs.data ?? []) as HeroSlide[]);
    setFaqs((fq.data ?? []) as Faq[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const upsertText = (key: string, value: string) =>
    supabase.from("site_content").upsert(
      { key, value_text: value, updated_by: user?.id ?? null, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
  const upsertUrl = (key: string, value: string | null) =>
    supabase.from("site_content").upsert(
      { key, value_url: value, updated_by: user?.id ?? null, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );

  const handleSaveTexts = async () => {
    setSaving(true);
    const results = await Promise.all([
      upsertText(SITE_KEYS.atelierName, atelierName),
      upsertText(SITE_KEYS.contactEmail, contactEmail),
      upsertText(SITE_KEYS.contactPhone, contactPhone),
      upsertText(SITE_KEYS.whatsappNumber, whatsappNumber.replace(/\D/g, "")),
      upsertText(SITE_KEYS.heroTitle, heroTitle),
      upsertText(SITE_KEYS.heroSubtitle, heroSubtitle),
      upsertText(SITE_KEYS.heroCta, heroCta),
    ]);
    setSaving(false);
    const err = results.find(r => r.error)?.error;
    if (err) return toast.error(err.message);
    toast.success("Textos actualizados");
    load();
  };

  // ---- Video hero (idéntico) ----
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 50 * 1024 * 1024) return toast.error("Máx 50MB");
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `hero-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("hero-media").upload(fileName, file, { upsert: false, contentType: file.type });
    if (upErr) { setUploading(false); toast.error(upErr.message); return; }
    const { data: pub } = supabase.storage.from("hero-media").getPublicUrl(fileName);
    await upsertUrl(SITE_KEYS.heroVideoUrl, pub.publicUrl);
    setUploading(false);
    if (videoRef.current) videoRef.current.value = "";
    toast.success("Video actualizado"); load();
  };
  const handleVideoRemove = async () => {
    if (!confirm("¿Quitar el video del hero?")) return;
    await upsertUrl(SITE_KEYS.heroVideoUrl, null);
    toast.success("Video eliminado"); load();
  };
  const currentVideoUrl = content[SITE_KEYS.heroVideoUrl]?.url;

  // ---- Hero slides ----
  const addSlide = async () => {
    const { error } = await supabase.from("hero_slides").insert({
      title: "Nuevo slide", subtitle: null, cta_label: "Regístrate", cta_url: "/auth?mode=signup",
      image_url: null, position: slides.length, active: true,
    });
    if (error) return toast.error(error.message);
    load();
  };
  const updateSlide = async (id: string, patch: Partial<HeroSlide>) => {
    const { error } = await supabase.from("hero_slides").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
  };
  const deleteSlide = async (id: string) => {
    if (!confirm("¿Eliminar este slide?")) return;
    await supabase.from("hero_slides").delete().eq("id", id);
    load();
  };
  const uploadSlideImage = async (id: string, file: File) => {
    if (file.size > 8 * 1024 * 1024) return toast.error("Máx 8MB");
    const ext = file.name.split(".").pop();
    const fileName = `slide-${id}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("hero-media").upload(fileName, file, { upsert: false, contentType: file.type });
    if (error) return toast.error(error.message);
    const { data: pub } = supabase.storage.from("hero-media").getPublicUrl(fileName);
    await updateSlide(id, { image_url: pub.publicUrl });
    load();
  };

  // ---- FAQs ----
  const addFaq = async () => {
    const { error } = await supabase.from("faqs").insert({
      question: "Nueva pregunta", answer: "Respuesta...", position: faqs.length, active: true,
    });
    if (error) return toast.error(error.message);
    load();
  };
  const updateFaq = async (id: string, patch: Partial<Faq>) => {
    const { error } = await supabase.from("faqs").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
  };
  const deleteFaq = async (id: string) => {
    if (!confirm("¿Eliminar esta pregunta?")) return;
    await supabase.from("faqs").delete().eq("id", id); load();
  };

  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex flex-col gap-10">
      <Helmet><title>Contenido — Admin Deluxe</title></Helmet>
      <PageHeader
        eyebrow="Contenido"
        title={<>La página principal, <em className="italic">a tu manera.</em></>}
        description="Edita textos, contactos, slides del carrusel y preguntas frecuentes."
        showAvatar={false}
      />

      {/* ==== Marca / contactos ==== */}
      <section className="space-y-5 rounded-3xl border border-border bg-card p-7 shadow-soft">
        <h3 className="font-serif text-2xl font-semibold">Marca y contactos</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Nombre del atelier</Label>
            <Input value={atelierName} onChange={(e) => setAtelierName(e.target.value)} className="mt-1.5" placeholder="Floristería Deluxe" />
          </div>
          <div>
            <Label>Correo de contacto</Label>
            <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>Teléfono visible</Label>
            <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="mt-1.5" placeholder="+57 301 1940530" />
          </div>
          <div>
            <Label>Número WhatsApp (solo dígitos, incluye país)</Label>
            <Input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className="mt-1.5" placeholder="573011940530" />
            <p className="mt-1 text-xs text-muted-foreground">A este número te llegan los avisos de redenciones vía wa.me.</p>
          </div>
        </div>
      </section>

      {/* ==== Textos hero (legacy) ==== */}
      <section className="space-y-4 rounded-3xl border border-border bg-card p-7 shadow-soft">
        <h3 className="font-serif text-2xl font-semibold">Textos generales del hero (fallback)</h3>
        <p className="text-xs text-muted-foreground">Se usan si no configuras slides del carrusel abajo.</p>
        <div className="grid gap-3">
          <div>
            <Label>Título</Label>
            <Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label>Subtítulo</Label>
            <Textarea value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} rows={3} className="mt-1.5" />
          </div>
          <div>
            <Label>Texto del CTA principal</Label>
            <Input value={heroCta} onChange={(e) => setHeroCta(e.target.value)} className="mt-1.5" />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSaveTexts} disabled={saving} className="rounded-full bg-primary text-primary-foreground hover:bg-gold hover:text-gold-foreground">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4" /> Guardar textos</>}
          </Button>
        </div>
      </section>

      {/* ==== Carrusel principal (hero_slides) ==== */}
      <section className="space-y-5 rounded-3xl border border-border bg-card p-7 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-2xl font-semibold">Carrusel principal</h3>
            <p className="mt-1 text-sm text-muted-foreground">Cada slide rota automáticamente cada 7 segundos.</p>
          </div>
          <Button onClick={addSlide} className="rounded-full bg-terracotta text-terracotta-foreground hover:bg-terracotta/90">
            <Plus className="h-4 w-4" /> Agregar slide
          </Button>
        </div>

        {slides.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Sin slides. Usa "Agregar slide" o se mostrarán los slides por defecto.
          </div>
        ) : (
          <div className="space-y-4">
            {slides.map((s, idx) => (
              <div key={s.id} className="rounded-2xl border border-border bg-background p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                    <GripVertical className="h-3.5 w-3.5" /> Slide {idx + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-xs">
                      <input type="checkbox" checked={s.active}
                        onChange={(e) => { updateSlide(s.id, { active: e.target.checked }); setSlides(p => p.map(x => x.id === s.id ? { ...x, active: e.target.checked } : x)); }} />
                      Visible
                    </label>
                    <Button size="sm" variant="ghost" onClick={() => deleteSlide(s.id)} className="rounded-full text-terracotta hover:bg-terracotta/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-[220px_1fr]">
                  <div>
                    {s.image_url ? (
                      <div className="relative aspect-square overflow-hidden rounded-xl border border-border">
                        <img src={s.image_url} alt="" className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-border text-muted-foreground">
                        <ImageIcon className="h-8 w-8" />
                      </div>
                    )}
                    <label className="mt-2 block cursor-pointer">
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadSlideImage(s.id, f); }} />
                      <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-medium">
                        <Upload className="h-3 w-3" /> Cambiar imagen
                      </span>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <Input placeholder="Eyebrow (opcional)" defaultValue={s.eyebrow ?? ""} onBlur={(e) => updateSlide(s.id, { eyebrow: e.target.value })} />
                    <Input placeholder="Título" defaultValue={s.title} onBlur={(e) => updateSlide(s.id, { title: e.target.value })} />
                    <Textarea placeholder="Subtítulo" rows={2} defaultValue={s.subtitle ?? ""} onBlur={(e) => updateSlide(s.id, { subtitle: e.target.value })} />
                    <div className="grid gap-2 md:grid-cols-2">
                      <Input placeholder="Texto botón" defaultValue={s.cta_label ?? ""} onBlur={(e) => updateSlide(s.id, { cta_label: e.target.value })} />
                      <Input placeholder="URL botón (ej: /auth?mode=signup)" defaultValue={s.cta_url ?? ""} onBlur={(e) => updateSlide(s.id, { cta_url: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ==== FAQs ==== */}
      <section className="space-y-5 rounded-3xl border border-border bg-card p-7 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-2xl font-semibold">Preguntas frecuentes</h3>
            <p className="mt-1 text-sm text-muted-foreground">Se muestran en la home debajo de "Momentos".</p>
          </div>
          <Button onClick={addFaq} className="rounded-full bg-terracotta text-terracotta-foreground hover:bg-terracotta/90">
            <Plus className="h-4 w-4" /> Agregar pregunta
          </Button>
        </div>
        {faqs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Sin preguntas. Agrega la primera.
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((f, idx) => (
              <div key={f.id} className="rounded-2xl border border-border bg-background p-4">
                <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
                  <span>Pregunta {idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5">
                      <input type="checkbox" checked={f.active}
                        onChange={(e) => { updateFaq(f.id, { active: e.target.checked }); setFaqs(p => p.map(x => x.id === f.id ? { ...x, active: e.target.checked } : x)); }} />
                      Visible
                    </label>
                    <Button size="sm" variant="ghost" onClick={() => deleteFaq(f.id)} className="rounded-full text-terracotta hover:bg-terracotta/10">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Input placeholder="Pregunta" defaultValue={f.question} onBlur={(e) => updateFaq(f.id, { question: e.target.value })} />
                  <Textarea placeholder="Respuesta" rows={2} defaultValue={f.answer} onBlur={(e) => updateFaq(f.id, { answer: e.target.value })} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ==== Video hero ==== */}
      <section className="space-y-5 rounded-3xl border border-border bg-card p-7 shadow-soft">
        <div>
          <h3 className="font-serif text-2xl font-semibold">Video del hero</h3>
          <p className="mt-1 text-sm text-muted-foreground">Reel vertical que aparece en la sección "Vive la magia Deluxe".</p>
        </div>
        {currentVideoUrl ? (
          <div className="space-y-4">
            <div className="relative aspect-[9/16] max-w-xs overflow-hidden rounded-2xl border border-border bg-foreground">
              <video src={currentVideoUrl} controls className="h-full w-full object-cover" playsInline />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => videoRef.current?.click()} disabled={uploading} variant="outline" className="rounded-full">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="h-4 w-4" /> Reemplazar</>}
              </Button>
              <Button onClick={handleVideoRemove} variant="ghost" className="rounded-full text-terracotta hover:bg-terracotta/10">
                <Trash2 className="h-4 w-4" /> Quitar video
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-secondary/30 p-10 text-center">
            <Video className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-serif text-lg text-foreground">Aún sin video</p>
            <Button onClick={() => videoRef.current?.click()} disabled={uploading}
              className="mt-5 rounded-full bg-primary text-primary-foreground hover:bg-gold hover:text-gold-foreground">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="h-4 w-4" /> Subir video</>}
            </Button>
          </div>
        )}
        <input ref={videoRef} type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleVideoUpload} className="hidden" />
      </section>
    </div>
  );
}
