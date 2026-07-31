-- Profiles: one row per auth.users, public read, owner-only write
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  name text not null default '',
  avatar_url text,
  bio text,
  github_username text,
  links jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are publicly readable"
  on public.profiles for select
  using (true);

create policy "users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row when a new auth user signs up (via GitHub OAuth)
create or replace function public.handle_new_user()
returns trigger as $$
declare
  base_username text;
  final_username text;
  suffix int := 0;
begin
  base_username := coalesce(
    new.raw_user_meta_data ->> 'user_name',
    new.raw_user_meta_data ->> 'preferred_username',
    split_part(new.email, '@', 1),
    'user'
  );
  final_username := base_username;

  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, name, avatar_url, github_username)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data ->> 'full_name', base_username),
    new.raw_user_meta_data ->> 'avatar_url',
    new.raw_user_meta_data ->> 'user_name'
  );

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Skills / prompts
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  slug text not null,
  description text not null default '',
  category text not null,
  tags text[] not null default '{}',
  type text not null default 'skill' check (type in ('skill', 'prompt')),
  content text not null default '',
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  stars_count int not null default 0,
  views_count int not null default 0,
  copies_count int not null default 0,
  created_at timestamptz not null default now(),
  unique (owner_id, slug)
);

alter table public.skills enable row level security;

create policy "public skills are readable by anyone, private skills by owner only"
  on public.skills for select
  using (visibility = 'public' or owner_id = auth.uid());

create policy "owners can insert their own skills"
  on public.skills for insert
  with check (owner_id = auth.uid());

create policy "owners can update their own skills"
  on public.skills for update
  using (owner_id = auth.uid());

create policy "owners can delete their own skills"
  on public.skills for delete
  using (owner_id = auth.uid());
