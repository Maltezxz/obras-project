-- Script para criar usuário host no Supabase Auth
-- Execute este script manualmente no painel do Supabase ou via API

-- Nota: A criação de usuário no auth.users deve ser feita via Supabase Auth API
-- Este arquivo serve como documentação das credenciais

-- Credenciais do Host:
-- Email: fernando.antunes@obrasflow.com
-- Senha: 123456
-- CNPJ: 04.205.151/0001-37
-- Nome: Fernando Antunes

-- Para criar o usuário via Supabase Dashboard:
-- 1. Acesse Authentication > Users
-- 2. Clique em "Add User"
-- 3. Preencha:
--    - Email: fernando.antunes@obrasflow.com
--    - Password: 123456
--    - Auto Confirm User: Sim
-- 4. Após criar, copie o ID do usuário
-- 5. Execute o UPDATE abaixo substituindo o ID

-- Atualizar a tabela users com o ID do auth.users
-- IMPORTANTE: Substitua 'AUTH_USER_ID_AQUI' pelo ID real gerado pelo Supabase Auth

UPDATE users
SET id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' -- Substitua pelo ID real
WHERE email = 'fernando.antunes@obrasflow.com';
