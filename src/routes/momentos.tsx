import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2, Camera, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import type { GalleryItem } from "@/lib/types";
import { motion } from "framer-motion";

export default function MomentosPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("gallery_items").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setItems((data ?? []) as GalleryItem[]); setLoading(false); });
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Helmet>
        <title>Momentos Deluxe — Colección Floristería Deluxe</title>
        <meta name="description" content="Colección de momentos con parroquias, eventos y arreglos florales de Floristería Deluxe." />
      </Helmet>
      <SiteHeader />

      <section className="relative overflow-hidden bg-gradient-hero py-16 md:py-24">
        <div className="pointer-events-none absolute -top-20 -left-20 h-72 w-72 rounded-full bg-blush/60 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-6 text-center lg:px-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white/70 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.28em] text-primary backdrop-blur">
            <Camera className="h-3 w-3" /> Colección
          </span>
          <h1 className="mt-6 font-serif text-4xl font-semibold leading-tight md:text-6xl">
            Momentos <em className="text-shimmer-gold">Deluxe.</em>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
            Un archivo vivo de nuestras parroquias, eventos y arreglos florales. Cada foto, una historia.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-10">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <Camera className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 font-serif text-xl">Colección en construcción</p>
            <p className="mt-2 text-sm text-muted-foreground">Pronto compartiremos aquí nuestros momentos.</p>
          </div>
        ) : (
          <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6 [&>*]:break-inside-avoid">
            {items.map((it, i) => (
              <motion.figure key={it.id}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: (i % 6) * 0.05 }}
                className="group overflow-hidden rounded-3xl border border-primary/15 bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-pink">
                <div className="relative overflow-hidden">
                  <img src={it.image_url} alt={it.caption ?? "Momento Deluxe"} loading="lazy"
                    className="w-full transition-transform duration-700 group-hover:scale-105" />
                </div>
                {it.caption && (
                  <figcaption className="p-5 text-sm text-muted-foreground italic">{it.caption}</figcaption>
                )}
              </motion.figure>
            ))}
          </div>
        )}

        <div className="mt-16 rounded-3xl border border-primary/20 bg-gradient-hero p-10 text-center md:p-14">
          <h2 className="font-serif text-3xl font-semibold md:text-4xl">
            ¿Tu parroquia también quiere hacer parte?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Únete al programa Deluxe y aparece en nuestra colección de momentos.
          </p>
          <Button asChild size="lg" className="mt-6 rounded-full bg-primary px-7 text-primary-foreground hover:bg-gold hover:text-gold-foreground">
            <Link to="/auth?mode=signup">Regístrate <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
