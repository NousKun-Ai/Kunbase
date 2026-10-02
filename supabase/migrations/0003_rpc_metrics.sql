-- Create a secure function to increment copies_count
create or replace function increment_copies(skill_id uuid)
returns void as $$
begin
  update public.skills
  set copies_count = copies_count + 1
  where id = skill_id;
end;
$$ language plpgsql security definer;

-- Create a secure function to toggle stars_count
create or replace function toggle_star(skill_id uuid, currently_starred boolean)
returns void as $$
begin
  if currently_starred then
    update public.skills
    set stars_count = greatest(0, stars_count - 1)
    where id = skill_id;
  else
    update public.skills
    set stars_count = stars_count + 1
    where id = skill_id;
  end if;
end;
$$ language plpgsql security definer;
