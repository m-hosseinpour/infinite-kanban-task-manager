/*
  # Create user boards table

  1. New Tables
    - `user_boards`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `board_data` (jsonb, stores the kanban board data)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_boards` table
    - Add policy for users to manage their own boards
*/

CREATE TABLE IF NOT EXISTS user_boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  board_data jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own boards"
  ON user_boards
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS user_boards_user_id_idx ON user_boards(user_id);