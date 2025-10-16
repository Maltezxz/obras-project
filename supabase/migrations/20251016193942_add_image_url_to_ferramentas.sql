/*
  # Add image URL field to ferramentas table

  1. Changes
    - Add `image_url` column to `ferramentas` table to store tool/equipment images
    - Column is nullable (optional) and stores text URLs
    - No RLS changes needed as ferramentas table already has proper RLS policies

  2. Notes
    - Images will be stored as base64 data URLs or external URLs
    - Existing ferramentas records will have NULL image_url by default
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ferramentas' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE ferramentas ADD COLUMN image_url text;
  END IF;
END $$;
