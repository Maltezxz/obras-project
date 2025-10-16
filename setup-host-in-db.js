import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ler variáveis de ambiente do arquivo .env
const envContent = readFileSync(join(__dirname, '.env'), 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Função simples de hash (em produção, use bcrypt)
function simpleHash(password) {
  return Buffer.from(password).toString('base64');
}

async function setupHost() {
  console.log('🚀 Configurando host no banco de dados...\n');

  const hostData = {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    name: 'Fernando Antunes',
    email: 'fernando.antunes@obrasflow.com',
    cnpj: '04.205.151/0001-37',
    role: 'host'
  };

  const password = '123456';

  try {
    // 1. Verificar se o host já existe
    console.log('📋 Verificando se o host já existe...');
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', hostData.email)
      .maybeSingle();

    let userId;

    if (existingUser) {
      console.log('✅ Host já existe:', existingUser.id);
      userId = existingUser.id;

      // Atualizar dados do host se necessário
      const { error: updateError } = await supabase
        .from('users')
        .update({
          name: hostData.name,
          cnpj: hostData.cnpj,
          role: hostData.role
        })
        .eq('id', userId);

      if (updateError) {
        console.error('❌ Erro ao atualizar host:', updateError);
      } else {
        console.log('✅ Dados do host atualizados');
      }
    } else {
      // 2. Criar o host na tabela users
      console.log('📝 Criando host na tabela users...');
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({
          id: hostData.id,
          name: hostData.name,
          email: hostData.email,
          cnpj: hostData.cnpj,
          role: hostData.role
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Erro ao criar host:', insertError);
        process.exit(1);
      }

      console.log('✅ Host criado:', newUser.id);
      userId = newUser.id;
    }

    // 3. Verificar se as credenciais já existem
    console.log('🔐 Verificando credenciais...');
    const { data: existingCreds } = await supabase
      .from('user_credentials')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingCreds) {
      console.log('✅ Credenciais já existem, atualizando...');
      const { error: updateCredError } = await supabase
        .from('user_credentials')
        .update({
          password_hash: simpleHash(password)
        })
        .eq('user_id', userId);

      if (updateCredError) {
        console.error('❌ Erro ao atualizar credenciais:', updateCredError);
      } else {
        console.log('✅ Credenciais atualizadas');
      }
    } else {
      // 4. Criar credenciais
      console.log('🔐 Criando credenciais...');
      const { error: credError } = await supabase
        .from('user_credentials')
        .insert({
          user_id: userId,
          password_hash: simpleHash(password)
        });

      if (credError) {
        console.error('❌ Erro ao criar credenciais:', credError);
        process.exit(1);
      }

      console.log('✅ Credenciais criadas');
    }

    console.log('\n✅ Host configurado com sucesso!');
    console.log('\n📋 Credenciais de acesso:');
    console.log('CNPJ:', hostData.cnpj);
    console.log('Usuário:', hostData.name);
    console.log('Senha:', password);

  } catch (error) {
    console.error('❌ Erro geral:', error);
    process.exit(1);
  }
}

setupHost();
