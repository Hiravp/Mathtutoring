-- All-in-One Math Help — Supabase schema
-- Project ID: bbfltvlfjggimrwtuvfr
-- Safe to re-run: uses IF NOT EXISTS / DROP IF EXISTS where needed.
-- Apply this in the Supabase SQL editor. Do not bypass RLS from client code.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('teacher', 'student')),
  full_name text,
  email text
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  class_code text not null unique,
  created_at timestamptz not null default now(),
  constraint class_code_length check (char_length(class_code) = 6)
);

create table if not exists public.enrollments (
  class_id uuid not null references public.classes(id) on delete cascade,
  student_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (class_id, student_id)
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  topic text not null,
  content jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.users(id) on delete cascade,
  answers jsonb not null,
  ai_feedback text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_subjects (
  student_id uuid not null references public.users(id) on delete cascade,
  subject_id text not null,
  created_at timestamptz not null default now(),
  primary key (student_id, subject_id)
);

-- Optional subject tag for teacher-led classes (set when creating a class).
alter table public.classes
  add column if not exists subject_id text;

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists idx_classes_teacher_id
  on public.classes(teacher_id);

create index if not exists idx_enrollments_student_id
  on public.enrollments(student_id);

create index if not exists idx_assignments_class_id
  on public.assignments(class_id);

create index if not exists idx_submissions_student_id
  on public.submissions(student_id);

create index if not exists idx_submissions_assignment_id
  on public.submissions(assignment_id);

create index if not exists idx_student_subjects_student_id
  on public.student_subjects(student_id);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_teacher_of_class(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.classes c
    where c.id = p_class_id
      and c.teacher_id = auth.uid()
  );
$$;

create or replace function public.is_enrolled_in_class(p_class_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.enrollments e
    where e.class_id = p_class_id
      and e.student_id = auth.uid()
  );
$$;

-- Secure join by class code (avoids exposing all classes via a broad SELECT policy).
create or replace function public.join_class_by_code(p_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_class_id uuid;
  v_role text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select u.role into v_role
  from public.users u
  where u.id = auth.uid();

  if v_role is distinct from 'student' then
    raise exception 'Only students can join classes';
  end if;

  select c.id into v_class_id
  from public.classes c
  where c.class_code = upper(trim(p_code));

  if v_class_id is null then
    raise exception 'Invalid class code';
  end if;

  insert into public.enrollments (class_id, student_id)
  values (v_class_id, auth.uid())
  on conflict (class_id, student_id) do nothing;

  return v_class_id;
end;
$$;

revoke all on function public.join_class_by_code(text) from public;
grant execute on function public.join_class_by_code(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Signup profile trigger
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_full_name text;
begin
  v_role := coalesce(new.raw_user_meta_data->>'role', '');
  v_full_name := nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), '');

  if v_role not in ('teacher', 'student') then
    raise exception 'Invalid role. Role must be teacher or student.';
  end if;

  insert into public.users (id, role, full_name, email)
  values (new.id, v_role, v_full_name, new.email);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.users enable row level security;
alter table public.classes enable row level security;
alter table public.enrollments enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.student_subjects enable row level security;

-- Users: read/update own profile only
drop policy if exists "users_select_own" on public.users;
create policy "users_select_own"
  on public.users
  for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own"
  on public.users
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Student subject preferences (self-selected practice areas)
drop policy if exists "student_subjects_select_own" on public.student_subjects;
create policy "student_subjects_select_own"
  on public.student_subjects
  for select
  to authenticated
  using (student_id = auth.uid());

drop policy if exists "student_subjects_insert_own" on public.student_subjects;
create policy "student_subjects_insert_own"
  on public.student_subjects
  for insert
  to authenticated
  with check (student_id = auth.uid());

drop policy if exists "student_subjects_delete_own" on public.student_subjects;
create policy "student_subjects_delete_own"
  on public.student_subjects
  for delete
  to authenticated
  using (student_id = auth.uid());

-- Classes
drop policy if exists "classes_teacher_insert" on public.classes;
create policy "classes_teacher_insert"
  on public.classes
  for insert
  to authenticated
  with check (teacher_id = auth.uid());

drop policy if exists "classes_teacher_select" on public.classes;
create policy "classes_teacher_select"
  on public.classes
  for select
  to authenticated
  using (teacher_id = auth.uid());

drop policy if exists "classes_teacher_update" on public.classes;
create policy "classes_teacher_update"
  on public.classes
  for update
  to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());

drop policy if exists "classes_teacher_delete" on public.classes;
create policy "classes_teacher_delete"
  on public.classes
  for delete
  to authenticated
  using (teacher_id = auth.uid());

drop policy if exists "classes_student_select_enrolled" on public.classes;
create policy "classes_student_select_enrolled"
  on public.classes
  for select
  to authenticated
  using (public.is_enrolled_in_class(id));

-- Enrollments
drop policy if exists "enrollments_student_insert_own" on public.enrollments;
create policy "enrollments_student_insert_own"
  on public.enrollments
  for insert
  to authenticated
  with check (student_id = auth.uid());

drop policy if exists "enrollments_student_select_own" on public.enrollments;
create policy "enrollments_student_select_own"
  on public.enrollments
  for select
  to authenticated
  using (student_id = auth.uid());

drop policy if exists "enrollments_teacher_select_own_classes" on public.enrollments;
create policy "enrollments_teacher_select_own_classes"
  on public.enrollments
  for select
  to authenticated
  using (public.is_teacher_of_class(class_id));

-- Assignments
drop policy if exists "assignments_teacher_insert" on public.assignments;
create policy "assignments_teacher_insert"
  on public.assignments
  for insert
  to authenticated
  with check (public.is_teacher_of_class(class_id));

drop policy if exists "assignments_teacher_select" on public.assignments;
create policy "assignments_teacher_select"
  on public.assignments
  for select
  to authenticated
  using (public.is_teacher_of_class(class_id));

drop policy if exists "assignments_teacher_update" on public.assignments;
create policy "assignments_teacher_update"
  on public.assignments
  for update
  to authenticated
  using (public.is_teacher_of_class(class_id))
  with check (public.is_teacher_of_class(class_id));

drop policy if exists "assignments_teacher_delete" on public.assignments;
create policy "assignments_teacher_delete"
  on public.assignments
  for delete
  to authenticated
  using (public.is_teacher_of_class(class_id));

drop policy if exists "assignments_student_select_enrolled" on public.assignments;
create policy "assignments_student_select_enrolled"
  on public.assignments
  for select
  to authenticated
  using (public.is_enrolled_in_class(class_id));

-- Submissions
drop policy if exists "submissions_student_insert_own" on public.submissions;
create policy "submissions_student_insert_own"
  on public.submissions
  for insert
  to authenticated
  with check (
    student_id = auth.uid()
    and exists (
      select 1
      from public.assignments a
      where a.id = assignment_id
        and public.is_enrolled_in_class(a.class_id)
    )
  );

drop policy if exists "submissions_student_select_own" on public.submissions;
create policy "submissions_student_select_own"
  on public.submissions
  for select
  to authenticated
  using (student_id = auth.uid());

drop policy if exists "submissions_student_update_own" on public.submissions;
create policy "submissions_student_update_own"
  on public.submissions
  for update
  to authenticated
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

drop policy if exists "submissions_teacher_select_own_classes" on public.submissions;
create policy "submissions_teacher_select_own_classes"
  on public.submissions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.assignments a
      where a.id = assignment_id
        and public.is_teacher_of_class(a.class_id)
    )
  );
