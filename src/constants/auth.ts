import { User } from '../types';

// Credenciais de login visual (bypass de Supabase)
export const HOST_FAKE = {
  cnpj: '04.205.151/0001-37',
  username: 'Fernando Antunes',
  password: '123456',
};

// Host principal protegido (não pode ser removido)
export const PROTECTED_HOST = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'Fernando Antunes',
  email: 'fernando@praticaengenharia.com.br',
};

// Funcionários cadastrados pelo host (simulação local)
export const EMPLOYEES_FAKE: User[] = [
  {
    id: 'emp-001',
    name: 'João Silva',
    email: 'joao@empresa.com',
    role: 'funcionario',
    host_id: 'host-fake-id',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'emp-002',
    name: 'Maria Santos',
    email: 'maria@empresa.com',
    role: 'funcionario',
    host_id: 'host-fake-id',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];
