-- Apply in the Supabase SQL Editor for bwlcnaruyjazaxyiiumd.
-- Keep existing SELECT policies: admins can still browse the dashboard.
-- Restrictive policies are ANDed with any existing permissive write policies.

begin;

do $$
begin
  if not exists (
    select 1 from public.profiles
    where id = 'b1b2e25b-3c5c-4a2d-be53-a48e1c7eced4'::uuid
      and role = 'admin'
  ) then
    raise exception 'The designated data manager must exist in public.profiles with role admin';
  end if;
end;
$$;

drop policy if exists "Only data manager can insert AMC assignments" on public.amc_assignments;
drop policy if exists "Only data manager can update AMC assignments" on public.amc_assignments;
drop policy if exists "Only data manager can delete AMC assignments" on public.amc_assignments;
drop policy if exists "Only data manager can insert econ assignments" on public.econ_assignments;
drop policy if exists "Only data manager can update econ assignments" on public.econ_assignments;
drop policy if exists "Only data manager can delete econ assignments" on public.econ_assignments;

create policy "Only data manager can insert AMC assignments"
on public.amc_assignments as restrictive for insert to authenticated
with check (auth.uid() = 'b1b2e25b-3c5c-4a2d-be53-a48e1c7eced4'::uuid);

create policy "Only data manager can update AMC assignments"
on public.amc_assignments as restrictive for update to authenticated
using (auth.uid() = 'b1b2e25b-3c5c-4a2d-be53-a48e1c7eced4'::uuid)
with check (auth.uid() = 'b1b2e25b-3c5c-4a2d-be53-a48e1c7eced4'::uuid);

create policy "Only data manager can delete AMC assignments"
on public.amc_assignments as restrictive for delete to authenticated
using (auth.uid() = 'b1b2e25b-3c5c-4a2d-be53-a48e1c7eced4'::uuid);

create policy "Only data manager can insert econ assignments"
on public.econ_assignments as restrictive for insert to authenticated
with check (auth.uid() = 'b1b2e25b-3c5c-4a2d-be53-a48e1c7eced4'::uuid);

create policy "Only data manager can update econ assignments"
on public.econ_assignments as restrictive for update to authenticated
using (auth.uid() = 'b1b2e25b-3c5c-4a2d-be53-a48e1c7eced4'::uuid)
with check (auth.uid() = 'b1b2e25b-3c5c-4a2d-be53-a48e1c7eced4'::uuid);

create policy "Only data manager can delete econ assignments"
on public.econ_assignments as restrictive for delete to authenticated
using (auth.uid() = 'b1b2e25b-3c5c-4a2d-be53-a48e1c7eced4'::uuid);

-- Preserve ordinary users' ability to edit their own profile details, but
-- prevent admins other than the data manager from editing someone else's profile
-- or changing their own role through the API.
create or replace function public.guard_profile_management()
returns trigger language plpgsql security invoker
set search_path = ''
as $$
begin
  if current_user = 'authenticated'
     and auth.uid() is distinct from 'b1b2e25b-3c5c-4a2d-be53-a48e1c7eced4'::uuid
     and (old.id is distinct from auth.uid() or new.role is distinct from old.role) then
    raise exception 'Only the designated data manager can manage profile roles or other profiles'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists guard_profile_management on public.profiles;
create trigger guard_profile_management
before update on public.profiles
for each row execute function public.guard_profile_management();

commit;
