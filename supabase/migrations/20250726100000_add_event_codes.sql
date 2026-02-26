/*
  # Add event codes and secure RLS (Updated with Code Review feedback)

  1. Changes to `users` table:
    - Make `email` nullable to support anonymous users.
    - Add `event_code` (text, 6 chars, unique for super-users).
    - Add `linked_event_id` (uuid, references users(id)).

  2. Functions:
    - `generate_event_code()`: Generates a random 6-character alphanumeric code.
    - `join_event_by_code(code text)`: Links a guest to a super-user's event.
    - `regenerate_my_event_code()`: Generates a new unique code for a super-user.

  3. RLS Updates:
    - Update `guests` and `tables` policies to strictly partition data based on `user_id` (owner) or `linked_event_id` (access).
*/

-- Make email nullable for anonymous users
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Add columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS event_code text UNIQUE,
ADD COLUMN IF NOT EXISTS linked_event_id uuid REFERENCES users(id);

-- Ensure handle_new_user supports null email
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'guest')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Function to generate a random 6-character code
CREATE OR REPLACE FUNCTION generate_event_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Function to join an event by code
CREATE OR REPLACE FUNCTION join_event_by_code(code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Find the super-user with this code
  SELECT id INTO target_user_id
  FROM users
  WHERE event_code = upper(code) AND role = 'super-user';

  IF target_user_id IS NULL THEN
    RETURN false;
  END IF;

  -- Ensure the current user has a record in public.users
  INSERT INTO public.users (id, role)
  VALUES (auth.uid(), 'guest')
  ON CONFLICT (id) DO NOTHING;

  -- Link the current guest to this super-user
  UPDATE users
  SET linked_event_id = target_user_id
  WHERE id = auth.uid();

  RETURN FOUND;
END;
$$;

-- Function for super-users to regenerate their own code
CREATE OR REPLACE FUNCTION regenerate_my_event_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_code text;
BEGIN
  -- Generate a unique code
  LOOP
    new_code := generate_event_code();
    BEGIN
      UPDATE users SET event_code = new_code WHERE id = auth.uid() AND role = 'super-user';
      IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found or not a super-user';
      END IF;
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      -- Try again if code already exists
    END;
  END LOOP;

  RETURN new_code;
END;
$$;

-- Function to check if user is super-user (re-defined for robustness)
CREATE OR REPLACE FUNCTION is_super_user(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE((SELECT role = 'super-user' FROM users WHERE id = user_id), false);
$$;

-- Update RLS for guests
DROP POLICY IF EXISTS "Super-users can manage own guests" ON guests;
DROP POLICY IF EXISTS "Guests can view guests from super-users" ON guests;
DROP POLICY IF EXISTS "Guests can view linked event guests" ON guests;

CREATE POLICY "Super-users can manage own guests"
  ON guests
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid() AND is_super_user(auth.uid()))
  WITH CHECK (user_id = auth.uid() AND is_super_user(auth.uid()));

CREATE POLICY "Guests can view linked event guests"
  ON guests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.linked_event_id = guests.user_id
    )
  );

-- Update RLS for tables
DROP POLICY IF EXISTS "Super-users can manage own tables" ON tables;
DROP POLICY IF EXISTS "Guests can view tables from super-users" ON tables;
DROP POLICY IF EXISTS "Guests can view linked event tables" ON tables;

CREATE POLICY "Super-users can manage own tables"
  ON tables
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid() AND is_super_user(auth.uid()))
  WITH CHECK (user_id = auth.uid() AND is_super_user(auth.uid()));

CREATE POLICY "Guests can view linked event tables"
  ON tables
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.linked_event_id = tables.user_id
    )
  );
