-- Function
create function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path to ''
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

-- GRANT
revoke execute on function public.update_updated_at_column() from public, anon, authenticated;
