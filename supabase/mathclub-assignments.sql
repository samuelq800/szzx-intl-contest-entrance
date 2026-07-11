-- Run once in the Supabase SQL Editor for bwlcnaruyjazaxyiiumd.
-- The static sites only use the publishable key; these RLS policies enforce access.

alter table public.profiles
  add column if not exists role text not null default 'student';

create table if not exists public.amc_assignments (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  target_role text not null default 'mathclubmembers',
  title text not null,
  instructions text,
  problem_ids text[] not null check (cardinality(problem_ids) > 0),
  due_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.amc_assignments enable row level security;

drop policy if exists "Math club members can read their assignments" on public.amc_assignments;
create policy "Math club members can read their assignments"
on public.amc_assignments for select
to authenticated
using (
  target_role = (
    select role from public.profiles where id = auth.uid()
  )
);

drop policy if exists "Admins can manage AMC assignments" on public.amc_assignments;
create policy "Admins can manage AMC assignments"
on public.amc_assignments for all
to authenticated
using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
)
with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Needed only if this policy does not already exist in your project.
-- It lets an admin assign the mathclubmembers role from the entrance dashboard.
drop policy if exists "Admins can update roles" on public.profiles;
create policy "Admins can update roles"
on public.profiles for update
to authenticated
using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
)
with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create index if not exists amc_assignments_target_role_created_at_idx
  on public.amc_assignments (target_role, created_at desc);

-- Promote a member after they have registered. Replace the email first.
-- update public.profiles set role = 'mathclubmembers' where email = 'student@example.com';
