/*
  # Création de la table des invités

  1. Nouvelles Tables
    - `guests`
      - `id` (uuid, clé primaire)
      - `first_name` (text, prénom de l'invité)
      - `last_name` (text, nom de l'invité)
      - `status` (text, statut de l'invitation: 'no-response', 'accepted', 'declined')
      - `table_number` (integer, numéro de table optionnel)
      - `user_id` (uuid, référence vers l'utilisateur qui a créé l'invité)
      - `created_at` (timestamptz, date de création)
      - `updated_at` (timestamptz, date de dernière modification)

  2. Sécurité
    - Activer RLS sur la table `guests`
    - Ajouter des politiques pour que les utilisateurs ne voient que leurs propres invités
*/

CREATE TABLE IF NOT EXISTS guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  status text NOT NULL DEFAULT 'no-response' CHECK (status IN ('no-response', 'accepted', 'declined')),
  table_number integer,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs ne voient que leurs propres invités
CREATE POLICY "Users can view own guests"
  ON guests
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent créer leurs propres invités
CREATE POLICY "Users can create own guests"
  ON guests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent modifier leurs propres invités
CREATE POLICY "Users can update own guests"
  ON guests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politique pour que les utilisateurs puissent supprimer leurs propres invités
CREATE POLICY "Users can delete own guests"
  ON guests
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_guests_updated_at
  BEFORE UPDATE ON guests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();