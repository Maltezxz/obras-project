import { supabase } from '../lib/supabase';
import { Obra } from '../types';

export interface UserPermission {
  id: string;
  user_id: string;
  obra_id: string;
  host_id: string;
}

export async function getFilteredObras(
  userId: string,
  userRole: string,
  hostId: string | null,
  allObras: Obra[]
): Promise<Obra[]> {
  if (userRole === 'host') {
    console.log('👑 Usuário é HOST, retornando todas as obras:', allObras.length);
    return allObras;
  }

  try {
    console.log('🔍 Buscando permissões para usuário:', userId);
    const { data: permissions, error } = await supabase
      .from('user_obra_permissions')
      .select('obra_id')
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Erro ao carregar permissões:', error);
      return [];
    }

    console.log('📋 Permissões encontradas:', permissions);

    if (!permissions || permissions.length === 0) {
      console.log('🚫 Nenhuma permissão encontrada, usuário sem acesso a obras');
      return [];
    }

    const allowedObraIds = new Set(permissions.map(p => p.obra_id));
    const filteredObras = allObras.filter(obra => allowedObraIds.has(obra.id));

    console.log('✅ Obras filtradas:', {
      total: allObras.length,
      permitidas: filteredObras.length,
      ids_permitidos: Array.from(allowedObraIds)
    });

    return filteredObras;
  } catch (error) {
    console.error('❌ Erro ao filtrar obras:', error);
    return [];
  }
}

export async function getUserPermissions(userId: string): Promise<Set<string>> {
  try {
    const { data, error } = await supabase
      .from('user_obra_permissions')
      .select('obra_id')
      .eq('user_id', userId);

    if (error || !data) {
      return new Set();
    }

    return new Set(data.map(p => p.obra_id));
  } catch (error) {
    console.error('Erro ao obter permissões:', error);
    return new Set();
  }
}

export async function hasObraPermission(userId: string, userRole: string, obraId: string): Promise<boolean> {
  if (userRole === 'host') {
    return true;
  }

  try {
    const { data, error } = await supabase
      .from('user_obra_permissions')
      .select('id')
      .eq('user_id', userId)
      .eq('obra_id', obraId)
      .maybeSingle();

    if (error) {
      console.error('Erro ao verificar permissão:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Erro ao verificar permissão:', error);
    return false;
  }
}
