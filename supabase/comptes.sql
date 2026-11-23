-- ==========================================
-- Alpha Strike : comptes joueurs (pseudo + mot de passe), sans e-mail
-- À exécuter une fois dans Supabase → SQL Editor → New query → Run
-- ==========================================
-- • Les mots de passe sont chiffrés (bcrypt) : personne ne peut les lire, même toi.
-- • 5 mauvais mots de passe → compte bloqué 10 minutes (contre les essais au hasard).
-- • Les tables ne sont accessibles QUE par les fonctions ci-dessous (aucune lecture directe).

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.players (
    id            uuid primary key default gen_random_uuid(),
    name          text not null,
    name_key      text not null unique,          -- pseudo en minuscules (PAUL = paul)
    pass_hash     text not null,
    progress      jsonb not null default '{}'::jsonb,
    failed_logins int not null default 0,
    locked_until  timestamptz,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

create table if not exists public.player_sessions (
    token     uuid primary key default gen_random_uuid(),
    player_id uuid not null references public.players(id) on delete cascade,
    last_used timestamptz not null default now()
);

alter table public.players enable row level security;
alter table public.player_sessions enable row level security;
revoke all on public.players, public.player_sessions from anon, authenticated;

-- Création d'un compte (la progression déjà faite sur l'appareil est gardée)
create or replace function public.account_create(p_name text, p_password text, p_progress jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare
    v_name  text := upper(btrim(coalesce(p_name, '')));
    v_id    uuid;
    v_token uuid;
begin
    if v_name !~ '^[A-Z0-9ÀÂÄÇÉÈÊËÎÏÔÖÙÛÜ _.-]{2,10}$' then
        return jsonb_build_object('error', 'Pseudo : de 2 à 10 lettres ou chiffres');
    end if;
    if length(coalesce(p_password, '')) < 4 or length(p_password) > 72 then
        return jsonb_build_object('error', 'Mot de passe : 4 caractères minimum');
    end if;
    if p_progress is null or jsonb_typeof(p_progress) <> 'object' or length(p_progress::text) > 300000 then
        p_progress := '{}'::jsonb;
    end if;
    if exists (select 1 from players where name_key = lower(v_name)) then
        return jsonb_build_object('error', 'Ce pseudo est déjà pris');
    end if;
    insert into players (name, name_key, pass_hash, progress)
        values (v_name, lower(v_name), crypt(p_password, gen_salt('bf', 8)), p_progress)
        returning id into v_id;
    insert into player_sessions (player_id) values (v_id) returning token into v_token;
    return jsonb_build_object('token', v_token, 'name', v_name, 'progress', p_progress);
exception when unique_violation then
    return jsonb_build_object('error', 'Ce pseudo est déjà pris');
end $$;

-- Connexion
create or replace function public.account_login(p_name text, p_password text)
returns jsonb language plpgsql security definer set search_path = public, extensions as $$
declare
    p       players;
    v_token uuid;
begin
    select * into p from players where name_key = lower(btrim(coalesce(p_name, ''))) for update;
    if not found then
        return jsonb_build_object('error', 'Pseudo ou mot de passe incorrect');
    end if;
    if p.locked_until is not null and p.locked_until > now() then
        return jsonb_build_object('error', 'Trop d''essais : réessaie dans '
            || ceil(extract(epoch from p.locked_until - now()) / 60)::int || ' min');
    end if;
    if p.pass_hash <> crypt(coalesce(p_password, ''), p.pass_hash) then
        update players set
            failed_logins = case when failed_logins + 1 >= 5 then 0 else failed_logins + 1 end,
            locked_until  = case when failed_logins + 1 >= 5 then now() + interval '10 minutes' else locked_until end
        where id = p.id;
        return jsonb_build_object('error', 'Pseudo ou mot de passe incorrect');
    end if;
    update players set failed_logins = 0, locked_until = null where id = p.id;
    delete from player_sessions where player_id = p.id and last_used < now() - interval '180 days';
    insert into player_sessions (player_id) values (p.id) returning token into v_token;
    return jsonb_build_object('token', v_token, 'name', p.name, 'progress', p.progress);
end $$;

-- Lecture de la progression
create or replace function public.account_load(p_token uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
    v_pid uuid;
    p     players;
begin
    update player_sessions set last_used = now() where token = p_token returning player_id into v_pid;
    if v_pid is null then
        return jsonb_build_object('expired', true);
    end if;
    select * into p from players where id = v_pid;
    return jsonb_build_object('name', p.name, 'progress', p.progress);
end $$;

-- Sauvegarde de la progression
create or replace function public.account_save(p_token uuid, p_progress jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
    v_pid uuid;
begin
    if p_progress is null or jsonb_typeof(p_progress) <> 'object' or length(p_progress::text) > 300000 then
        return jsonb_build_object('error', 'Sauvegarde trop grosse');
    end if;
    update player_sessions set last_used = now() where token = p_token returning player_id into v_pid;
    if v_pid is null then
        return jsonb_build_object('expired', true);
    end if;
    update players set progress = p_progress, updated_at = now() where id = v_pid;
    return jsonb_build_object('ok', true);
end $$;

-- Déconnexion
create or replace function public.account_logout(p_token uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
begin
    delete from player_sessions where token = p_token;
    return jsonb_build_object('ok', true);
end $$;

revoke all on function public.account_create(text, text, jsonb), public.account_login(text, text),
    public.account_load(uuid), public.account_save(uuid, jsonb), public.account_logout(uuid) from public;
grant execute on function public.account_create(text, text, jsonb), public.account_login(text, text),
    public.account_load(uuid), public.account_save(uuid, jsonb), public.account_logout(uuid) to anon, authenticated;

-- ==========================================
-- 🔑 MOT DE PASSE OUBLIÉ (à faire toi-même, ici, dans le SQL Editor)
-- Remplace PAUL et nouveau-mot-de-passe, puis exécute seulement ces lignes :
-- update public.players
--    set pass_hash = extensions.crypt('nouveau-mot-de-passe', extensions.gen_salt('bf', 8)),
--        failed_logins = 0, locked_until = null
--  where name_key = lower('PAUL');
-- ==========================================
