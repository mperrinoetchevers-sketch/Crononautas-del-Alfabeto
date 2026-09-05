-- =========================================================
-- CRONONAUTAS DEL ALFABETO - SUPABASE INITIAL MIGRATION
-- =========================================================

-- 1. Tabla de Perfiles de Jugadores
create table if not exists public.player_profiles (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  avatar text not null default 'rex',
  age int default 8,
  created_at timestamp with time zone default now()
);

-- Habilitar RLS en player_profiles
alter table public.player_profiles enable row level security;

-- Política de seguridad: Permitir lectura e inserción/actualización para jugadores anónimos o autenticados
create policy "Allow all actions on player_profiles"
  on public.player_profiles
  for all
  using (true)
  with check (true);

-- 2. Tabla de Progreso del Juego
create table if not exists public.game_progress (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null references public.player_profiles(id) on delete cascade unique,
  unlocked_eras text[] default array['prehistory'],
  stars_total int default 0,
  time_machine_parts text[] default array[]::text[],
  completed_levels text[] default array[]::text[],
  updated_at timestamp with time zone default now()
);

-- Habilitar RLS en game_progress
alter table public.game_progress enable row level security;

-- Política de seguridad para game_progress
create policy "Allow all actions on game_progress"
  on public.game_progress
  for all
  using (true)
  with check (true);
