-- Table
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,24}$'),
  avatar_path text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  deleted_at timestamp with time zone
);

-- Index
create index users_created_at_idx on public.users (created_at desc);

-- Function
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  insert into public.users (id, username)
  values (new.id, 'user_' || substr(replace(new.id::text, '-', ''), 1, 8));
  return new;
end;
$function$;

-- Trigger
create trigger users_update_updated_at before update on public.users for each row execute function public.update_updated_at_column();

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- RLS
alter table public.users enable row level security;

-- RLS for anon
create policy "Anon cannot select users" on public.users
  for select to anon
  using (false);

create policy "Anon cannot insert users" on public.users
  for insert to anon
  with check (false);

create policy "Anon cannot update users" on public.users
  for update to anon
  using (false);

create policy "Anon cannot delete users" on public.users
  for delete to anon
  using (false);

-- RLS for authenticated
create policy "Authenticated can select own users" on public.users
  for select to authenticated
  using ((select auth.uid()) = id and deleted_at is null);

create policy "Authenticated cannot insert users" on public.users
  for insert to authenticated
  with check (false);

create policy "Authenticated can update own users" on public.users
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Authenticated cannot delete users" on public.users
  for delete to authenticated
  using (false);

-- GRANT
revoke all on table public.users from anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
grant select, update on table public.users to authenticated;
grant all on table public.users to service_role;
