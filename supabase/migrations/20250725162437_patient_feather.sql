/*
  # Add user roles system

  1. New Tables
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `role` (text, either 'super-user' or 'guest')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `users` table
    - Add policies for users to read their own data
    - Update existing policies to check user roles

  3. Changes
    - Add role-based access control
    - Super-users can manage everything
    - Guests can only view data
*/

-- Create users table to store user roles
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'guest' CHECK (role IN ('super-user', 'guest')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role FROM users WHERE id = user_id;
$$;

-- Function to check if user is super-user
CREATE OR REPLACE FUNCTION is_super_user(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role = 'super-user' FROM users WHERE id = user_id;
$$;

-- Update guests policies to allow guests to view data from super-users
DROP POLICY IF EXISTS "Users can view own guests" ON guests;
DROP POLICY IF EXISTS "Users can create own guests" ON guests;
DROP POLICY IF EXISTS "Users can update own guests" ON guests;
DROP POLICY IF EXISTS "Users can delete own guests" ON guests;

CREATE POLICY "Super-users can manage own guests"
  ON guests
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid() AND is_super_user(auth.uid()))
  WITH CHECK (user_id = auth.uid() AND is_super_user(auth.uid()));

CREATE POLICY "Guests can view guests from super-users"
  ON guests
  FOR SELECT
  TO authenticated
  USING (is_super_user(user_id));

-- Update tables policies
DROP POLICY IF EXISTS "Users can view own tables" ON tables;
DROP POLICY IF EXISTS "Users can create own tables" ON tables;
DROP POLICY IF EXISTS "Users can update own tables" ON tables;
DROP POLICY IF EXISTS "Users can delete own tables" ON tables;

CREATE POLICY "Super-users can manage own tables"
  ON tables
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid() AND is_super_user(auth.uid()))
  WITH CHECK (user_id = auth.uid() AND is_super_user(auth.uid()));

CREATE POLICY "Guests can view tables from super-users"
  ON tables
  FOR SELECT
  TO authenticated
  USING (is_super_user(user_id));

-- Function to automatically create user record on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'guest');
  RETURN NEW;
END;
$$;

-- Trigger to create user record on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create updated_at trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();