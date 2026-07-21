-- Allow every contest currently supported by the shared attempts table.
alter table public.attempts
  drop constraint if exists attempts_contest_type_check;

alter table public.attempts
  add constraint attempts_contest_type_check
  check (contest_type in ('AMC', 'AIME', 'BMO', 'NEC', 'LSESU'));
