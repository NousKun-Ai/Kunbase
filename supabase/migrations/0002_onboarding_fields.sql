-- Add onboarding fields to profiles table
alter table public.profiles
  add column if not exists role text,
  add column if not exists use_case text,
  add column if not exists referral_source text,
  add column if not exists onboarded boolean not null default false;
