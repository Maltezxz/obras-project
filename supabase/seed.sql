-- Script para inserir dados iniciais
-- Execute este script no SQL Editor do Supabase para criar um usuário host de teste

-- Inserir usuário host de teste
INSERT INTO users (id, name, email, cnpj, role, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000', -- UUID fixo para facilitar testes
  'danilo',
  'danilo@teste.com', -- Email que será usado para autenticação
  '89.263.465/0001-49',
  'host',
  now(),
  now()
);

-- Verificar se o usuário foi inserido
SELECT * FROM users WHERE role = 'host';
