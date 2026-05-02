-- ============================================================
-- FIX v5 — Adelantos, address, sin asesora, type_check arreglado
-- Pega TODO esto en Supabase → SQL Editor → Run.
-- Es idempotente, puedes ejecutarlo varias veces.
-- ============================================================

-- 1) Columna address en profiles --------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS address text;

-- 2) Arreglar el CHECK de points_transactions.type ---------------
-- El error "violates check constraint points_transactions_type_check"
-- viene de que el tipo "compra" no está permitido. Lo abrimos a los
-- tipos que usa la app.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'points_transactions_type_check'
  ) THEN
    ALTER TABLE public.points_transactions
      DROP CONSTRAINT points_transactions_type_check;
  END IF;
END$$;

ALTER TABLE public.points_transactions
  ADD CONSTRAINT points_transactions_type_check
  CHECK (type IN ('compra','canje','ajuste','bonus','regalo'));

-- 3) Eliminar rol asesora del enum y limpiar referencias --------
DELETE FROM public.user_roles WHERE role = 'asesora';

-- (El enum lo dejamos como está para no romper nada; el frontend ya
--  no lo usa. Si quisieras eliminarlo del enum hay que recrear el
--  tipo, lo cual rompe RLS — preferible solo no usarlo.)

-- 4) Trigger handle_new_user — actualizado con address y nit_id --
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, full_name, display_name, account_type,
    nit_id, phone, address, email, points_balance
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'persona'),
    NULLIF(NEW.raw_user_meta_data->>'nit', ''),
    NULLIF(NEW.raw_user_meta_data->>'phone', ''),
    NULLIF(NEW.raw_user_meta_data->>'address', ''),
    NEW.email,
    0
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'cliente')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user falló para %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5) Tabla advances (Adelantos a empleados) ---------------------
CREATE TABLE IF NOT EXISTS public.advances (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_name text NOT NULL,
  amount       numeric NOT NULL CHECK (amount >= 0),
  advance_date date NOT NULL DEFAULT CURRENT_DATE,
  note         text,
  paid         boolean NOT NULL DEFAULT false,
  paid_at      timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.advances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "advances_admin_all" ON public.advances;
CREATE POLICY "advances_admin_all" ON public.advances
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6) Refrescar schema cache --------------------------------------
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- LISTO. Ahora:
--  - Cargar puntos desde admin funciona (type='compra' permitido)
--  - Registro guarda address
--  - Adelantos disponible (gestionado solo por admin)
--  - Rol asesora eliminado de los usuarios existentes
-- ============================================================
