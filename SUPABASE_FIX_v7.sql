-- ============================================================
-- FIX v7 — Corrige DUPLICACIÓN de puntos.
-- Causa: existían múltiples triggers/funciones actualizando
-- profiles.points_balance al insertar en points_transactions.
-- Solución: dejar UN solo trigger y recalcular balances desde
-- la suma real de transacciones.
-- Pega TODO en Supabase → SQL Editor → Run. Es idempotente.
-- ============================================================

-- 1) Eliminar TODOS los triggers existentes sobre points_transactions
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT tgname FROM pg_trigger
    WHERE tgrelid = 'public.points_transactions'::regclass
      AND NOT tgisinternal
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.points_transactions', r.tgname);
  END LOOP;
END$$;

-- 2) Funciones obsoletas que también tocaban points_balance
DROP FUNCTION IF EXISTS public.add_points(uuid, integer, integer, text) CASCADE;
DROP FUNCTION IF EXISTS public.redeem_reward(uuid) CASCADE;

-- 3) Función única y limpia que aplica el delta al balance
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

-- 4) UN único trigger
CREATE TRIGGER trg_apply_pt
  AFTER INSERT OR DELETE ON public.points_transactions
  FOR EACH ROW EXECUTE FUNCTION public.apply_points_transaction();

-- 5) RECALCULAR el balance real de cada perfil desde sus tx
UPDATE public.profiles p
   SET points_balance = COALESCE(s.total, 0)
  FROM (
    SELECT profile_id, SUM(amount)::int AS total
      FROM public.points_transactions
     GROUP BY profile_id
  ) s
 WHERE s.profile_id = p.id;

-- Perfiles sin transacciones → 0
UPDATE public.profiles
   SET points_balance = 0
 WHERE id NOT IN (SELECT DISTINCT profile_id FROM public.points_transactions);

NOTIFY pgrst, 'reload schema';

-- ============================================================
-- LISTO: ya no se duplican los puntos al cargar/canjear, y los
-- balances actuales quedaron sincronizados con la realidad.
-- ============================================================
