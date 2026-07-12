-- Run once in the same Supabase project used by the competition platforms.
-- This adds the Econ Club role and assignment table without changing existing AMC assignments.

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('student', 'mathclubmembers', 'econclubmembers', 'admin'));

create table if not exists public.econ_assignments (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  target_role text not null default 'econclubmembers',
  contest_type text not null check (contest_type in ('NEC', 'LSESU')),
  title text not null,
  instructions text,
  problem_ids text[] not null check (cardinality(problem_ids) > 0),
  due_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.econ_assignments enable row level security;

drop policy if exists "Econ club members can read their assignments" on public.econ_assignments;
create policy "Econ club members can read their assignments"
on public.econ_assignments for select
to authenticated
using (
  target_role = (
    select role from public.profiles where id = auth.uid()
  )
);

drop policy if exists "Admins can manage econ assignments" on public.econ_assignments;
create policy "Admins can manage econ assignments"
on public.econ_assignments for all
to authenticated
using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
)
with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create index if not exists econ_assignments_target_contest_created_at_idx
  on public.econ_assignments (target_role, contest_type, created_at desc);

-- Promote a registered member as needed:
-- update public.profiles set role = 'econclubmembers' where email = 'student@example.com';
