/*
  # Adicionar campo Tipo em Ferramentas

  1. Alterações
    - Adiciona coluna `tipo` (text, nullable) na tabela `ferramentas`
    - Este campo permitirá categorizar equipamentos por tipo
  
  2. Notas
    - Campo opcional para não quebrar dados existentes
    - Utiliza `IF NOT EXISTS` para segurança
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ferramentas' AND column_name = 'tipo'
  ) THEN
    ALTER TABLE ferramentas ADD COLUMN tipo text;
  END IF;
END $$;
