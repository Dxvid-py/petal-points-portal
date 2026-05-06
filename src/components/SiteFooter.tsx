import { Flower2, Instagram, Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export function SiteFooter() {
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
            El programa de fidelización exclusivo de Floristería Deluxe.
            Acumula con cada compra y redime experiencias únicas.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Navegación
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><a href="#fidelizacion" className="hover:text-foreground">Cómo Funciona</a></li>
            <li><a href="#redime" className="hover:text-foreground">Catálogo de Redención</a></li>
            <li><Link to="/dashboard" className="hover:text-foreground">Mi Cuenta</Link></li>
            <li><Link to="/auth?mode=signup" className="hover:text-foreground">Regístrate</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            Contáctanos
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="mailto:contacto.puntosdeluxe@floristeriadeluxe.com" className="flex items-center gap-2 hover:text-foreground">
                <Mail className="h-4 w-4" /> contacto.puntosdeluxe@floristeriadeluxe.com
              </a>
            </li>
            <li>
              <a href="https://wa.me/573011940530" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-foreground">
                <Phone className="h-4 w-4" /> WhatsApp +57 301 1940530
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com/floristeriadeluxe/" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-foreground">
                <Instagram className="h-4 w-4" /> @floristeriadeluxe
              </a>
            </li>
            <li>
              <a href="https://maps.app.goo.gl/KH1nQLmvDwUcQng9A" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-foreground">
                <MapPin className="h-4 w-4" /> Ver ubicación en Google Maps
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 px-6 py-5 text-center">
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Puntos Floristería Deluxe · Todos los derechos reservados
        </p>
      </div>
    </footer>
  );
}
