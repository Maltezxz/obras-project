// Script para testar conexão com Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://placeholder.supabase.co';
const supabaseKey = 'placeholder-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Testando conexão com Supabase...');
  
  try {
    // Teste 1: Verificar se consegue conectar
    console.log('1. Testando conexão básica...');
    const { data, error } = await supabase.from('obras').select('count').limit(1);
    
    if (error) {
      console.error('❌ Erro de conexão:', error.message);
      console.log('💡 Possíveis soluções:');
      console.log('   - Verificar se as variáveis de ambiente estão configuradas');
      console.log('   - Verificar se a URL e chave do Supabase estão corretas');
      console.log('   - Verificar se a tabela "obras" existe');
      return;
    }
    
    console.log('✅ Conexão com Supabase funcionando!');
    
    // Teste 2: Verificar estrutura da tabela
    console.log('2. Verificando estrutura da tabela...');
    const { data: tableData, error: tableError } = await supabase
      .from('obras')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Erro ao acessar tabela obras:', tableError.message);
      console.log('💡 A tabela "obras" pode não existir ou não ter permissão de acesso');
      return;
    }
    
    console.log('✅ Tabela "obras" acessível!');
    
    // Teste 3: Verificar permissões de inserção
    console.log('3. Testando permissões de inserção...');
    const testData = {
      title: 'Teste de Conexão',
      description: 'Teste automático',
      endereco: 'Endereço de teste',
      start_date: new Date().toISOString().split('T')[0],
      owner_id: 'test-user-id',
      status: 'ativa'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('obras')
      .insert(testData)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Erro ao inserir dados:', insertError.message);
      console.log('💡 Possíveis soluções:');
      console.log('   - Verificar se o usuário tem permissão para inserir');
      console.log('   - Verificar se a tabela tem as colunas corretas');
      console.log('   - Verificar se o owner_id existe na tabela users');
      return;
    }
    
    console.log('✅ Permissões de inserção funcionando!');
    
    // Limpar dados de teste
    await supabase.from('obras').delete().eq('id', insertData.id);
    console.log('🧹 Dados de teste removidos');
    
    console.log('🎉 Todos os testes passaram! O Supabase está configurado corretamente.');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    console.log('💡 Verifique se o Supabase está configurado corretamente');
  }
}

// Executar teste
testConnection();
