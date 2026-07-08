import { useEffect, useState } from "react";
import { Flower2, Instagram, Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { fetchSiteContent, getText, type SiteContentMap } from "@/lib/site-content";
import { SITE_KEYS } from "@/lib/types";

export function SiteFooter() {
  const [content, setContent] = useState<SiteContentMap>({});

  useEffect(() => { fetchSiteContent().then(setContent); }, []);

  const atelierName = getText(content, SITE_KEYS.atelierName, "Floristería Deluxe");
  const email = getText(content, SITE_KEYS.contactEmail, "contacto.puntosdeluxe@floristeriadeluxe.com");
  const phone = getText(content, SITE_KEYS.contactPhone, "+57 301 1940530");
  const waNumber = (getText(content, SITE_KEYS.whatsappNumber, "573011940530")).replace(/\D/g, "");

  return (
    <footer className="border-t border-border/60 bg-bone">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3 lg:px-10">
        <div>
          <div className="flex items-center gap-2">
            <Flower2 className="h-5 w-5 text-primary" />
            <span className="font-serif text-lg font-semibold text-foreground">
              Puntos <em className="not-italic text-primary">Deluxe</em>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            El programa de fidelización exclusivo de {atelierName}. Acumula con cada compra y redime experiencias únicas.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Navegación</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><a href="/#fidelizacion" className="hover:text-foreground">Cómo funciona</a></li>
            <li><Link to="/catalogo" className="hover:text-foreground">Catálogo completo</Link></li>
            <li><Link to="/momentos" className="hover:text-foreground">Momentos Deluxe</Link></li>
            <li><Link to="/dashboard" className="hover:text-foreground">Mi cuenta</Link></li>
            <li><Link to="/auth?mode=signup" className="hover:text-foreground">Regístrate</Link></li>
            <li><Link to="/legal" className="hover:text-foreground">Tratamiento de datos</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Contáctanos</p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-foreground">
                <Mail className="h-4 w-4" /> {email}
              </a>
            </li>
            <li>
              <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-foreground">
                <Phone className="h-4 w-4" /> WhatsApp {phone}
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/floristeriadeluxe/" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-foreground">
                <Instagram className="h-4 w-4" /> @floristeriadeluxe
              </a>
            </li>
            <li>
              <a href="https://maps.app.goo.gl/KH1nQLmvDwUcQng9A" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-foreground">
                <MapPin className="h-4 w-4" /> Ver ubicación
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 px-6 py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center md:flex-row md:text-left">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Puntos {atelierName} · Todos los derechos reservados
          </p>
          <a href="https://tuuweb.com" target="_blank" rel="noreferrer"
            className="group inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground">
            <span>Desarrollado por</span>
            <img src="https://www.tuuweb.com/assets/logo-CcpPtAvR.png" alt="Tuuweb"
              className="h-5 w-auto opacity-80 transition-opacity group-hover:opacity-100" loading="lazy" />
          </a>
        </div>
      </div>
    </footer>
  );
}
