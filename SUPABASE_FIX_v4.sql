-- ============================================================
-- FIX v4 — Corrige errores de columnas faltantes y signup
-- Ejecuta TODO este bloque en Supabase SQL Editor.
-- Es idempotente: puedes ejecutarlo varias veces sin romper nada.
-- ============================================================

-- 1) Asegurar columnas en profiles --------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS avatar_url   text,
  ADD COLUMN IF NOT EXISTS phone        text,
  ADD COLUMN IF NOT EXISTS account_type text NOT NULL DEFAULT 'persona',
  ADD COLUMN IF NOT EXISTS nit_id       text,
  ADD COLUMN IF NOT EXISTS email        text,
  ADD COLUMN IF NOT EXISTS parroquia_code text,
  ADD COLUMN IF NOT EXISTS points_balance integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS full_name    text;

-- Constraint de account_type (si no existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_account_type_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_account_type_check
      CHECK (account_type IN ('parroquia','persona'));
  END IF;
END$$;

-- Nombre único global para login por nombre
CREATE UNIQUE INDEX IF NOT EXISTS profiles_display_name_unique
  ON public.profiles (lower(display_name))
  WHERE display_name IS NOT NULL;

-- 2) Forzar a PostgREST a refrescar el schema cache ---------------
NOTIFY pgrst, 'reload schema';

-- 3) Tabla site_content (si no existe) ----------------------------
CREATE TABLE IF NOT EXISTS public.site_content (
  key text PRIMARY KEY,
  value_text text,
  value_url  text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_content_public_read" ON public.site_content;
CREATE POLICY "site_content_public_read" ON public.site_content
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "site_content_admin_write" ON public.site_content;
CREATE POLICY "site_content_admin_write" ON public.site_content
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4) Trigger handle_new_user — robusto ----------------------------
-- Esto es lo que estaba causando "Database error saving new user"
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, full_name, display_name, account_type,
    nit_id, phone, email, points_balance
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'persona'),
    NULLIF(NEW.raw_user_meta_data->>'nit_id', ''),
    NULLIF(NEW.raw_user_meta_data->>'phone', ''),
    NEW.email,
    0
  )
  ON CONFLICT (id) DO NOTHING;

  -- Asignar rol cliente por defecto
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'cliente')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Nunca tirar el signup por un fallo aquí
  RAISE WARNING 'handle_new_user falló para %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5) RPC lookup_email_by_name — para login por nombre + PIN -------
CREATE OR REPLACE FUNCTION public.lookup_email_by_name(_name text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email
  FROM public.profiles
  WHERE lower(display_name) = lower(trim(_name))
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.lookup_email_by_name(text) TO anon, authenticated;

-- 6) Buckets de Storage -------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars',      'avatars',      true),
  ('hero-media',   'hero-media',   true),
  ('rewards-images','rewards-images', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Políticas storage: lectura pública + escritura usuario propio
DO $$
BEGIN
  -- avatars
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='avatars_public_read') THEN
    CREATE POLICY "avatars_public_read" ON storage.objects
      FOR SELECT USING (bucket_id = 'avatars');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='avatars_user_write') THEN
    CREATE POLICY "avatars_user_write" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id='avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='avatars_user_delete') THEN
    CREATE POLICY "avatars_user_delete" ON storage.objects
      FOR DELETE USING (bucket_id='avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='avatars_user_update') THEN
    CREATE POLICY "avatars_user_update" ON storage.objects
      FOR UPDATE USING (bucket_id='avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;

  -- hero-media (solo admin escribe)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='hero_public_read') THEN
    CREATE POLICY "hero_public_read" ON storage.objects
      FOR SELECT USING (bucket_id = 'hero-media');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='hero_admin_write') THEN
    CREATE POLICY "hero_admin_write" ON storage.objects
      FOR ALL USING (bucket_id='hero-media' AND public.has_role(auth.uid(),'admin'))
      WITH CHECK (bucket_id='hero-media' AND public.has_role(auth.uid(),'admin'));
  END IF;

  -- rewards-images (admin escribe)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='rewards_public_read') THEN
    CREATE POLICY "rewards_public_read" ON storage.objects
      FOR SELECT USING (bucket_id = 'rewards-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='rewards_admin_write') THEN
    CREATE POLICY "rewards_admin_write" ON storage.objects
      FOR ALL USING (bucket_id='rewards-images' AND public.has_role(auth.uid(),'admin'))
      WITH CHECK (bucket_id='rewards-images' AND public.has_role(auth.uid(),'admin'));
  END IF;
END$$;

-- 7) Refrescar schema cache final
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- LISTO. Ahora:
--  - El perfil podrá guardar phone/display_name/avatar_url
--  - El registro creará el profile sin "Database error..."
--  - Login por nombre funcionará vía lookup_email_by_name
-- ============================================================
