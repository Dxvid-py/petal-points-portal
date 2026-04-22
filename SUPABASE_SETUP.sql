-- =====================================================================
-- PUNTOS FLORISTERÍA DELUXE — SETUP COMPLETO DE SUPABASE
-- Ejecutar TODO este script una sola vez en SQL Editor del dashboard.
-- Incluye: tablas, enums, RLS, trigger de perfil, lógica de puntos
-- (1 punto = $1.760 COP), bucket storage 'galeria'.
-- =====================================================================

-- 1) ENUMS DE ROLES Y ESTADOS -----------------------------------------
do $$ begin
  create type public.app_role as enum ('admin', 'asesora', 'cliente');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.transaction_type as enum ('earn', 'redeem', 'adjust');
exception when duplicate_object then null; end $$;

-- 2) TABLA PROFILES ---------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  nit text unique,
  phone text,
  email text,
  parish_code text,
  points_balance integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- 3) TABLA USER_ROLES (separada para evitar privilege escalation) ----
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- 4) FUNCIÓN HAS_ROLE (security definer, evita recursión RLS) --------
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- 5) TABLA POINTS_TRANSACTIONS ---------------------------------------
create table if not exists public.points_transactions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  type public.transaction_type not null,
  points integer not null,           -- positivo (earn/adjust+) o negativo (redeem/adjust-)
  purchase_amount_cop integer,       -- monto en COP cuando type='earn'
  description text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.points_transactions enable row level security;

-- 6) TABLA REWARDS ---------------------------------------------------
create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  cost_points integer not null check (cost_points > 0),
  category text,                     -- 'flores' | 'mano_obra' | 'aseo' | 'combustible' | etc
  active boolean not null default true,
  stock integer,                     -- null = ilimitado
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.rewards enable row level security;

-- 7) TABLA GALLERY_ITEMS ---------------------------------------------
create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('image','video')),
  title text,
  url text not null,                 -- url pública (storage o YouTube/Vimeo embed)
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.gallery_items enable row level security;

-- 8) TRIGGER: AL REGISTRARSE UN USER, CREAR PROFILE + ROL CLIENTE ----
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, nit, phone, parish_code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Cliente Deluxe'),
    new.email,
    new.raw_user_meta_data->>'nit',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'parish_code'
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'cliente')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 9) FUNCIÓN: CARGAR PUNTOS POR COMPRA (1 PT = $1.760 COP) -----------
create or replace function public.add_purchase_points(
  _customer_id uuid,
  _purchase_amount_cop integer,
  _override_points integer default null,
  _description text default null
)
returns public.points_transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  _calculated integer;
  _final_points integer;
  _tx public.points_transactions;
begin
  -- Solo admin/asesora pueden cargar puntos
  if not (public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'asesora')) then
    raise exception 'No autorizado para cargar puntos';
  end if;

  if _purchase_amount_cop is null or _purchase_amount_cop <= 0 then
    raise exception 'Monto de compra inválido';
  end if;

  _calculated := floor(_purchase_amount_cop / 1760.0)::integer;
  _final_points := coalesce(_override_points, _calculated);

  insert into public.points_transactions
    (customer_id, type, points, purchase_amount_cop, description, created_by)
  values
    (_customer_id, 'earn', _final_points, _purchase_amount_cop, _description, auth.uid())
  returning * into _tx;

  update public.profiles
  set points_balance = points_balance + _final_points,
      updated_at = now()
  where id = _customer_id;

  return _tx;
end;
$$;

-- 10) FUNCIÓN: REDIMIR RECOMPENSA -----------------------------------
create or replace function public.redeem_reward(
  _reward_id uuid
)
returns public.points_transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  _reward public.rewards;
  _profile public.profiles;
  _tx public.points_transactions;
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesión';
  end if;

  select * into _reward from public.rewards where id = _reward_id and active = true;
  if not found then raise exception 'Recompensa no disponible'; end if;

  select * into _profile from public.profiles where id = auth.uid();
  if _profile.points_balance < _reward.cost_points then
    raise exception 'Puntos insuficientes';
  end if;

  insert into public.points_transactions
    (customer_id, type, points, description, created_by)
  values
    (auth.uid(), 'redeem', -_reward.cost_points,
     'Canje: ' || _reward.title, auth.uid())
  returning * into _tx;

  update public.profiles
  set points_balance = points_balance - _reward.cost_points,
      updated_at = now()
  where id = auth.uid();

  if _reward.stock is not null then
    update public.rewards set stock = stock - 1 where id = _reward_id;
  end if;

  return _tx;
end;
$$;

-- 11) RLS POLICIES ---------------------------------------------------

-- PROFILES
drop policy if exists "Users see own profile" on public.profiles;
create policy "Users see own profile" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'asesora'));

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admin insert profiles" on public.profiles;
create policy "Admin insert profiles" on public.profiles
  for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

-- USER_ROLES
drop policy if exists "Users see own roles" on public.user_roles;
create policy "Users see own roles" on public.user_roles
  for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admin manage roles" on public.user_roles;
create policy "Admin manage roles" on public.user_roles
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- POINTS_TRANSACTIONS
drop policy if exists "See own transactions" on public.points_transactions;
create policy "See own transactions" on public.points_transactions
  for select to authenticated
  using (customer_id = auth.uid() or public.has_role(auth.uid(), 'admin') or public.has_role(auth.uid(), 'asesora'));

-- (las inserciones se hacen vía RPC add_purchase_points / redeem_reward, no INSERT directo)

-- REWARDS
drop policy if exists "Anyone reads active rewards" on public.rewards;
create policy "Anyone reads active rewards" on public.rewards
  for select to anon, authenticated
  using (active = true or public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admin manage rewards" on public.rewards;
create policy "Admin manage rewards" on public.rewards
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- GALLERY_ITEMS
drop policy if exists "Anyone reads active gallery" on public.gallery_items;
create policy "Anyone reads active gallery" on public.gallery_items
  for select to anon, authenticated
  using (active = true or public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admin manage gallery" on public.gallery_items;
create policy "Admin manage gallery" on public.gallery_items
  for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- 12) STORAGE BUCKET 'galeria' (público) -----------------------------
insert into storage.buckets (id, name, public)
values ('galeria', 'galeria', true)
on conflict (id) do nothing;

drop policy if exists "Public read galeria" on storage.objects;
create policy "Public read galeria" on storage.objects
  for select using (bucket_id = 'galeria');

drop policy if exists "Admin write galeria" on storage.objects;
create policy "Admin write galeria" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'galeria' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admin update galeria" on storage.objects;
create policy "Admin update galeria" on storage.objects
  for update to authenticated
  using (bucket_id = 'galeria' and public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admin delete galeria" on storage.objects;
create policy "Admin delete galeria" on storage.objects
  for delete to authenticated
  using (bucket_id = 'galeria' and public.has_role(auth.uid(), 'admin'));

-- 13) DATOS SEMILLA (recompensas iniciales) --------------------------
insert into public.rewards (title, description, cost_points, category, image_url) values
  ('Ramo de Rosas Premium', 'Docena de rosas frescas con presentación deluxe', 1500, 'flores', null),
  ('Bouquet de Temporada', 'Arreglo del día con flores de temporada', 800, 'flores', null),
  ('Servicio de Mano de Obra', '2 horas de decoración profesional', 2500, 'mano_obra', null),
  ('Kit de Aseo Floral', 'Productos para mantener tus flores frescas', 600, 'aseo', null),
  ('Bono de Combustible', 'Bono de $30.000 COP para combustible', 3000, 'combustible', null)
on conflict do nothing;

-- =====================================================================
-- FIN DEL SETUP. Después de ejecutar:
-- 1) Crea tu cuenta admin desde la app y luego corre en SQL Editor:
--    insert into public.user_roles (user_id, role)
--    values ('<TU_USER_ID>', 'admin');
-- 2) Para crear asesoras: regístralas y asígnales rol 'asesora' igual.
-- =====================================================================
