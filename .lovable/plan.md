# Plan de mejoras Puntos Deluxe

Trabajo grande y con varias piezas independientes. Lo divido en 6 bloques. Confírmame y arranco.

## 1. Contenido editable desde Admin (nuevo)
Ampliar `site_content` y la pantalla `admin.contenido.tsx` para editar:
- **Nombre del atelier** (usado en header/footer/emails)
- **Correo de contacto** (con botón "cambiar correo")
- **Teléfono / WhatsApp** (mismo campo servirá para notificaciones)
- **Preguntas frecuentes** (lista dinámica: pregunta + respuesta, agregar/quitar/reordenar)
- **Slides del carrusel principal** (imagen + eyebrow + título + subtítulo + CTA, agregar/quitar/reordenar)

Nueva tabla `faqs` y `hero_slides` con RLS (lectura pública, escritura admin) + grants.

## 2. Fecha de redención — selector Mes / Día / Año separados
El input actual de fecha estimada da error. Reemplazar por 3 `<Select>` (Mes, Día, Año) que compongan la fecha ISO al guardar. Aplica en `admin.canjes.tsx` (y donde se edite `estimated_delivery`).

## 3. Notificación WhatsApp al redimir
Cuando un cliente redime en `dashboard.recompensas.tsx`:
- Edge function `notify-redemption` (Lovable Cloud) que arma el mensaje y hace `POST` a la **API de WhatsApp** — necesito que elijas proveedor:
  - **Opción A:** wa.me link (abre WhatsApp del cliente con mensaje pre-llenado hacia tu número — cero costo, sin API).
  - **Opción B:** WhatsApp Cloud API oficial de Meta (requiere token + phone_number_id como secret; llega solo al admin, automático).
  - **Opción C:** Twilio / CallMeBot (más simple, pero de pago o con limitaciones).
- Mensaje: "🌸 Nueva redención: {cliente} canjeó {recompensa} ({puntos} pts). Contacto: {teléfono}".

**Necesito que me digas cuál opción prefieres.**

## 4. Redenciones manuales desde Admin (cliente presencial)
Nueva página `admin.redimir.tsx`:
- Buscar cliente por nombre / email / teléfono.
- Ver puntos disponibles.
- Elegir recompensa del catálogo (o "recompensa libre" con título + puntos manuales).
- Botón "Registrar canje" → descuenta puntos + crea `redemption` con estado `entregado` + dispara la misma notificación WhatsApp.

## 5. Catálogo y Momentos Deluxe públicos
Actualmente `/dashboard/recompensas` y la galería requieren login. Cambios:
- Nueva ruta pública `/catalogo` que muestra todas las recompensas activas (sin botón "Canjear" — en su lugar CTA "Inicia sesión para canjear").
- Nueva ruta pública `/momentos` con la colección de fotos con parroquias (o embebido en el landing).
- Ajustar RLS de `rewards` y `gallery` para lectura anónima (`GRANT SELECT ... TO anon`).

## 6. Rediseño creativo del landing (inspiración: girlboss)
Estilo referencia: manchas orgánicas de color (rosa/coral/verde), tipografía serif elegante con cursivas, foto recortada en forma orgánica (blob) con borde de acento.

Cambios en `src/routes/index.tsx`:
- **Hero rediseñado** como carrusel con:
  - Fondo con manchas orgánicas animadas (blush + gold + forest suaves).
  - Título editorial serif con palabra en cursiva:
    > *Cada flor, cada punto, una experiencia deluxe.*
  - Subtítulo: "Únete al club exclusivo de Floristería Deluxe. Acumula puntos con cada compra y redime flores premium, decoración profesional y bonos especiales."
  - Imagen lateral con recorte SVG orgánico (blob) + borde acento.
  - Flechas y dots del carrusel — datos vienen de tabla `hero_slides` (punto 1).
- **Chips de categorías** bajo el hero (estilo "HOW TO · TRENDS · WELLNESS").
- **Cards con más carácter**: bordes orgánicos, hover con desplazamiento, tipografía más grande.
- **Responsive móvil rehecho**: menú hamburguesa mejor, hero apila imagen encima con blob más pequeño, tipografía escalada, padding reducido, cards a full-width con snap horizontal en secciones tipo carrusel.

Mantengo la paleta actual (blush, gold, forest, terracotta, ink) — solo la orquesto con más audacia.

---

## Preguntas antes de arrancar
1. **WhatsApp:** ¿opción A (link wa.me), B (API Meta oficial) o C (Twilio)?
2. **Momentos Deluxe:** ¿lo dejo como sección del landing, o página aparte `/momentos`?
3. ¿Arranco todo de una, o priorizas 2-3 bloques primero? (Sugiero orden: 6 rediseño → 1 admin contenido → 2 fecha → 4 admin redimir → 3 WhatsApp → 5 público.)
