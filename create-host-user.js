// Script para criar usuário host no Supabase Auth
// Execute este script no console do navegador ou como script Node.js

import { createClient } from '@supabase/supabase-js';

// Substitua pelas suas credenciais do Supabase
const supabaseUrl = 'SUA_URL_DO_SUPABASE';
const supabaseServiceKey = 'SUA_SERVICE_KEY'; // Use a service key, não a anon key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createHostUser() {
  try {
    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'danilo@teste.com',
      password: '123',
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        name: 'danilo'
      }
    });

    if (authError) {
      console.error('Erro ao criar usuário no Auth:', authError);
      return;
    }

    console.log('Usuário criado no Supabase Auth:', authData.user);

    // Atualizar o ID do usuário na tabela users para corresponder ao ID do Auth
    const { data: updateData, error: updateError } = await supabase
      .from('users')
      .update({ id: authData.user.id })
      .eq('email', 'danilo@teste.com');

    if (updateError) {
      console.error('Erro ao atualizar ID do usuário:', updateError);
      return;
    }

    console.log('ID do usuário atualizado na tabela users');
    console.log('Usuário host criado com sucesso!');

  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Executar a função
createHostUser();
