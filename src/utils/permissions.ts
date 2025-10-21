import { supabase } from '../lib/supabase';
import { Obra } from '../types';

export interface UserPermission {
  id: string;
  user_id: string;
  obra_id: string;
  host_id: string;
}

export interface FerramentaPermission {
  id: string;
  user_id: string;
  ferramenta_id: string;
  host_id: string;
}

export interface Ferramenta {
  id: string;
  name: string;
  tipo?: string;
  modelo?: string;
  serial?: string;
  status: string;
  current_type?: string;
  current_id?: string;
  owner_id: string;
  [key: string]: any;
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

export async function getFilteredFerramentas(
  userId: string,
  userRole: string,
  hostId: string | null,
  allFerramentas: Ferramenta[]
): Promise<Ferramenta[]> {
  if (userRole === 'host') {
    console.log('👑 Usuário é HOST, retornando todas as ferramentas:', allFerramentas.length);
    return allFerramentas;
  }

  try {
    console.log('🔍 Buscando permissões de ferramentas para usuário:', userId);
    const { data: permissions, error } = await supabase
      .from('user_ferramenta_permissions')
      .select('ferramenta_id')
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Erro ao carregar permissões de ferramentas:', error);
      return [];
    }

    console.log('📋 Permissões de ferramentas encontradas:', permissions);

    if (!permissions || permissions.length === 0) {
      console.log('🚫 Nenhuma permissão de ferramenta encontrada, usuário sem acesso');
      return [];
    }

    const allowedFerramentaIds = new Set(permissions.map(p => p.ferramenta_id));
    const filteredFerramentas = allFerramentas.filter(ferramenta => allowedFerramentaIds.has(ferramenta.id));

    console.log('✅ Ferramentas filtradas:', {
      total: allFerramentas.length,
      permitidas: filteredFerramentas.length,
      ids_permitidos: Array.from(allowedFerramentaIds)
    });

    return filteredFerramentas;
  } catch (error) {
    console.error('❌ Erro ao filtrar ferramentas:', error);
    return [];
  }
}

export async function getFerramentaPermissions(userId: string): Promise<Set<string>> {
  try {
    const { data, error } = await supabase
      .from('user_ferramenta_permissions')
      .select('ferramenta_id')
      .eq('user_id', userId);

    if (error || !data) {
      return new Set();
    }

    return new Set(data.map(p => p.ferramenta_id));
  } catch (error) {
    console.error('Erro ao obter permissões de ferramentas:', error);
    return new Set();
  }
}

export async function hasFerramentaPermission(userId: string, userRole: string, ferramentaId: string): Promise<boolean> {
  if (userRole === 'host') {
    return true;
  }

  try {
    const { data, error } = await supabase
      .from('user_ferramenta_permissions')
      .select('id')
      .eq('user_id', userId)
      .eq('ferramenta_id', ferramentaId)
      .maybeSingle();

    if (error) {
      console.error('Erro ao verificar permissão de ferramenta:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Erro ao verificar permissão de ferramenta:', error);
    return false;
  }
}
