-- =========================================================
-- CRONONAUTAS DEL ALFABETO - AI LEARNING ANALYTICS SCHEMA
-- =========================================================

-- Tabla de Métricas de Aprendizaje Fonológico e IA
create table if not exists public.player_learning_metrics (
  id uuid primary key default gen_random_uuid(),
  profile_id text not null references public.player_profiles(id) on delete cascade unique,
  phoneme_stats jsonb default '{}'::jsonb,
  reading_speed_wpm int default 40,
  accuracy_rate int default 90,
  total_words_practiced int default 0,
  discovered_vocabulary jsonb default '[]'::jsonb,
  recent_errors jsonb default '[]'::jsonb,
  last_ai_analysis jsonb default null,
  updated_at timestamp with time zone default now()
);

-- Habilitar RLS en player_learning_metrics
alter table public.player_learning_metrics enable row level security;

-- Política de seguridad para permitir lectura e inserción/actualización
create policy "Allow all actions on player_learning_metrics"
  on public.player_learning_metrics
  for all
  using (true)
  with check (true);
