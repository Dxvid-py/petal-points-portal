-- ============================================================
-- FIX v6 — Canjes con estado, RLS para canjear, eliminar cuentas,
--           ajuste de puntos por admin, balance auto-actualizado.
-- Pega TODO en Supabase → SQL Editor → Run. Es idempotente.
-- ============================================================

-- 0) Asegurar columnas básicas en profiles --------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text;

-- 1) Permitir CHECK con todos los tipos usados ---------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'points_transactions_type_check') THEN
    ALTER TABLE public.points_transactions DROP CONSTRAINT points_transactions_type_check;
  END IF;
END$$;

ALTER TABLE public.points_transactions
  ADD CONSTRAINT points_transactions_type_check
  CHECK (type IN ('compra','canje','ajuste','bonus','regalo'));

-- 2) RLS de points_transactions ------------------------------
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pt_select_own_or_admin" ON public.points_transactions;
CREATE POLICY "pt_select_own_or_admin" ON public.points_transactions
  FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Cliente puede insertar SOLO canjes negativos sobre sí mismo
DROP POLICY IF EXISTS "pt_insert_self_canje" ON public.points_transactions;
CREATE POLICY "pt_insert_self_canje" ON public.points_transactions
  FOR INSERT TO authenticated
  WITH CHECK (
    profile_id = auth.uid()
    AND type = 'canje'
    AND amount < 0
  );

-- Admin puede insertar / actualizar / eliminar cualquier cosa
DROP POLICY IF EXISTS "pt_admin_all" ON public.points_transactions;
CREATE POLICY "pt_admin_all" ON public.points_transactions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3) Trigger: actualizar profiles.points_balance automáticamente
CREATE OR REPLACE FUNCTION public.apply_points_transaction()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles
      SET points_balance = COALESCE(points_balance,0) + NEW.amount
      WHERE id = NEW.profile_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles
      SET points_balance = COALESCE(points_balance,0) - OLD.amount
      WHERE id = OLD.profile_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_apply_pt ON public.points_transactions;
CREATE TRIGGER trg_apply_pt
  AFTER INSERT OR DELETE ON public.points_transactions
  FOR EACH ROW EXECUTE FUNCTION public.apply_points_transaction();

-- 4) Tabla REDEMPTIONS (canjes con estado y entrega) ---------
CREATE TABLE IF NOT EXISTS public.redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_id  uuid REFERENCES public.rewards(id) ON DELETE SET NULL,
  reward_title text NOT NULL,
  points_cost int NOT NULL,
  status text NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('pendiente','en_proceso','listo','entregado','cancelado')),
  estimated_delivery date,
  notes text,
  transaction_id uuid REFERENCES public.points_transactions(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "red_select_own_or_admin" ON public.redemptions;
CREATE POLICY "red_select_own_or_admin" ON public.redemptions
  FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "red_insert_self" ON public.redemptions;
CREATE POLICY "red_insert_self" ON public.redemptions
  FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "red_update_admin" ON public.redemptions;
CREATE POLICY "red_update_admin" ON public.redemptions
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "red_delete_admin" ON public.redemptions;
CREATE POLICY "red_delete_admin" ON public.redemptions
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 5) RPC: admin elimina usuario completo ---------------------
CREATE OR REPLACE FUNCTION public.admin_delete_user(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Solo admins pueden eliminar cuentas';
  END IF;
  DELETE FROM auth.users WHERE id = _user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_user(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;

-- 6) RPC: admin asigna/quita rol (sin necesidad de policies adicionales)
CREATE OR REPLACE FUNCTION public.admin_set_role(_user_id uuid, _role app_role, _grant boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Solo admins pueden cambiar roles';
  END IF;
  IF _grant THEN
    INSERT INTO public.user_roles(user_id, role) VALUES (_user_id, _role)
    ON CONFLICT DO NOTHING;
  ELSE
    DELETE FROM public.user_roles WHERE user_id = _user_id AND role = _role;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_role(uuid, app_role, boolean) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_role(uuid, app_role, boolean) TO authenticated;

-- 7) Refrescar schema cache ----------------------------------
NOTIFY pgrst, 'reload schema';
