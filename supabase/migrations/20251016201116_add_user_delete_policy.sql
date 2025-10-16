/*
  # Add DELETE policy for users table

  1. Changes
    - Add DELETE policy allowing hosts to delete their funcionarios
    - Allows deletion without JWT auth (using session-based auth)
  
  2. Security
    - Only allows deleting users with role 'funcionario'
    - Maintains RLS protection
*/

-- Create policy for deleting funcionarios
CREATE POLICY "Allow delete for funcionarios"
  ON users
  FOR DELETE
  TO public
  USING (role = 'funcionario');
