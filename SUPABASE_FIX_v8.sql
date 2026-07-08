-- =====================================================================
-- PUNTOS DELUXE — v8: hero slides, FAQs, contacto atelier, catálogo público
-- Ejecuta este script en SQL Editor de Supabase. Es idempotente.
-- =====================================================================

-- 1) HERO SLIDES ------------------------------------------------------
create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  eyebrow text,
  title text not null,
  subtitle text,
  cta_label text,
  cta_url text,
  image_url text,
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

grant select on public.hero_slides to anon, authenticated;
grant all on public.hero_slides to service_role;
alter table public.hero_slides enable row level security;

drop policy if exists "hero_slides read all" on public.hero_slides;
create policy "hero_slides read all" on public.hero_slides for select using (true);

drop policy if exists "hero_slides admin write" on public.hero_slides;
create policy "hero_slides admin write" on public.hero_slides for all
  to authenticated using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 2) FAQS -------------------------------------------------------------
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

grant select on public.faqs to anon, authenticated;
grant all on public.faqs to service_role;
alter table public.faqs enable row level security;

drop policy if exists "faqs read all" on public.faqs;
create policy "faqs read all" on public.faqs for select using (true);

drop policy if exists "faqs admin write" on public.faqs;
create policy "faqs admin write" on public.faqs for all
  to authenticated using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 3) SITE_CONTENT: asegurar acceso anon (catálogo público lee estos textos)
grant select on public.site_content to anon;
grant select on public.rewards to anon;
grant select on public.gallery_items to anon;

-- 4) Seeds iniciales opcionales --------------------------------------
insert into public.site_content (key, value_text)
values
  ('atelier_name', 'Floristería Deluxe'),
  ('contact_email', 'contacto.puntosdeluxe@floristeriadeluxe.com'),
  ('contact_phone', '+57 301 1940530'),
  ('whatsapp_number', '573011940530')
on conflict (key) do nothing;

insert into public.hero_slides (eyebrow, title, subtitle, cta_label, cta_url, image_url, position)
values (
  'Programa Deluxe',
  'Cada flor, cada punto, una experiencia deluxe.',
  'Únete al club exclusivo de Floristería Deluxe. Acumula puntos con cada compra y redime flores premium, decoración profesional y bonos especiales.',
  'Regístrate gratis',
  '/auth?mode=signup',
  'https://images.unsplash.com/photo-1487070183336-b863922373d4?w=1400&auto=format&fit=crop',
  0
) on conflict do nothing;
