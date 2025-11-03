import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

async function checkGutemberg() {
  console.log('\n🔍 VERIFICANDO DADOS DO GUTEMBERG NO SUPABASE\n');
  console.log('=' .repeat(60));

  // 1. Buscar usuário Gutemberg
  const { data: gutemberg, error: userError } = await supabase
    .from('users')
    .select('*')
    .ilike('name', '%gutemberg%')
    .maybeSingle();

  if (userError || !gutemberg) {
    console.error('❌ Usuário Gutemberg não encontrado!');
    console.error(userError);
    return;
  }

  console.log('\n✅ USUÁRIO ENCONTRADO:');
  console.log('   ID:', gutemberg.id);
  console.log('   Nome:', gutemberg.name);
  console.log('   CNPJ:', gutemberg.cnpj);
  console.log('   Role:', gutemberg.role);
  console.log('   Host ID:', gutemberg.host_id);

  // 2. Buscar TODOS os hosts do mesmo CNPJ
  const { data: hosts } = await supabase
    .from('users')
    .select('id, name')
    .eq('role', 'host')
    .eq('cnpj', gutemberg.cnpj);

  const hostIds = hosts?.map(h => h.id) || [];
  console.log('\n📊 HOSTS DO MESMO CNPJ:', hostIds.length);
  hosts?.forEach(h => console.log(`   - ${h.name} (${h.id})`));

  // 3. Buscar OBRAS
  const { data: obras } = await supabase
    .from('obras')
    .select('*')
    .in('owner_id', hostIds);

  console.log('\n🏗️ OBRAS NO BANCO:', obras?.length || 0);
  obras?.forEach(o => console.log(`   - ${o.title} (${o.status}) - Owner: ${o.owner_id}`));

  // 4. Buscar FERRAMENTAS
  const { data: ferramentas } = await supabase
    .from('ferramentas')
    .select('*')
    .in('owner_id', hostIds);

  console.log('\n🔧 EQUIPAMENTOS NO BANCO:', ferramentas?.length || 0);
  ferramentas?.forEach(f => console.log(`   - ${f.name} (${f.status}) - Owner: ${f.owner_id}`));

  console.log('\n' + '='.repeat(60));
  console.log('\n📋 RESUMO:');
  console.log(`   Usuário: ${gutemberg.name}`);
  console.log(`   CNPJ: ${gutemberg.cnpj}`);
  console.log(`   Hosts encontrados: ${hostIds.length}`);
  console.log(`   Obras totais: ${obras?.length || 0}`);
  console.log(`   Equipamentos totais: ${ferramentas?.length || 0}`);
  console.log('\n');
}

checkGutemberg().catch(console.error);
