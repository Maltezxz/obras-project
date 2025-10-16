import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Erro: Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupNewHost() {
  console.log('🔧 Iniciando configuração do novo host...');

  const hostData = {
    cnpj: '04.205.151/0001-37',
    username: 'Fernando Antunes',
    email: 'fernando.antunes@obrasflow.com',
    password: '123456',
  };

  try {
    console.log('\n1️⃣ Removendo usuários host antigos...');

    // Buscar todos os usuários host existentes
    const { data: oldHosts } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'host');

    if (oldHosts && oldHosts.length > 0) {
      for (const host of oldHosts) {
        // Remover usuário da tabela auth.users
        const { error: authDeleteError } = await supabase.auth.admin.deleteUser(host.id);
        if (authDeleteError) {
          console.warn(`⚠️  Aviso ao remover auth.users: ${authDeleteError.message}`);
        }

        // Remover da tabela users
        const { error: usersDeleteError } = await supabase
          .from('users')
          .delete()
          .eq('id', host.id);

        if (usersDeleteError) {
          console.warn(`⚠️  Aviso ao remover users: ${usersDeleteError.message}`);
        } else {
          console.log(`✅ Host antigo removido: ${host.id}`);
        }
      }
    } else {
      console.log('ℹ️  Nenhum host antigo encontrado');
    }

    console.log('\n2️⃣ Criando novo usuário host no Supabase Auth...');

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: hostData.email,
      password: hostData.password,
      email_confirm: true,
      user_metadata: {
        name: hostData.username,
        cnpj: hostData.cnpj,
      }
    });

    if (authError) {
      throw new Error(`Erro ao criar usuário auth: ${authError.message}`);
    }

    console.log(`✅ Usuário auth criado com ID: ${authUser.user.id}`);

    console.log('\n3️⃣ Criando registro na tabela users...');

    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .insert({
        id: authUser.user.id,
        name: hostData.username,
        email: hostData.email,
        cnpj: hostData.cnpj,
        role: 'host',
      })
      .select()
      .single();

    if (userError) {
      throw new Error(`Erro ao criar registro na tabela users: ${userError.message}`);
    }

    console.log('✅ Registro criado na tabela users');

    console.log('\n🎉 Configuração concluída com sucesso!');
    console.log('\n📋 Credenciais do Host:');
    console.log(`   CNPJ: ${hostData.cnpj}`);
    console.log(`   Usuário: ${hostData.username}`);
    console.log(`   Senha: ${hostData.password}`);
    console.log(`   Email: ${hostData.email}`);
    console.log(`   ID: ${authUser.user.id}`);

  } catch (error) {
    console.error('\n❌ Erro durante a configuração:', error.message);
    process.exit(1);
  }
}

setupNewHost();
