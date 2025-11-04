import { selectAll, selectOne, insertOne, updateOne, deleteOne, generateId, query } from './database';
import { Obra, Ferramenta, User, Estabelecimento } from '../types';

export async function getObrasByOwnerIds(ownerIds: string[]): Promise<Obra[]> {
  if (ownerIds.length === 0) return [];
  const placeholders = ownerIds.map(() => '?').join(',');
  return selectAll('obras', `owner_id IN (${placeholders})`, ownerIds);
}

export async function getActiveObrasByOwnerIds(ownerIds: string[]): Promise<Obra[]> {
  if (ownerIds.length === 0) return [];
  const placeholders = ownerIds.map(() => '?').join(',');
  return selectAll('obras', `owner_id IN (${placeholders}) AND status = 'ativa'`, ownerIds);
}

export async function getFerramentasByOwnerIds(ownerIds: string[]): Promise<Ferramenta[]> {
  if (ownerIds.length === 0) return [];
  const placeholders = ownerIds.map(() => '?').join(',');
  return selectAll('ferramentas', `owner_id IN (${placeholders})`, ownerIds);
}

export async function getDesaparecidasByOwnerIds(ownerIds: string[]): Promise<Ferramenta[]> {
  if (ownerIds.length === 0) return [];
  const placeholders = ownerIds.map(() => '?').join(',');
  return selectAll('ferramentas', `owner_id IN (${placeholders}) AND status = 'desaparecida'`, ownerIds);
}

export async function getEstabelecimentosByOwnerIds(ownerIds: string[]): Promise<Estabelecimento[]> {
  if (ownerIds.length === 0) return [];
  const placeholders = ownerIds.map(() => '?').join(',');
  return selectAll('estabelecimentos', `owner_id IN (${placeholders})`, ownerIds);
}

export async function getHistoricoByOwnerIds(ownerIds: string[]): Promise<any[]> {
  if (ownerIds.length === 0) return [];

  const placeholders = ownerIds.map(() => '?').join(',');
  const sql = `
    SELECT h.*,
           u.name as user_name,
           f.name as ferramenta_name
    FROM historico h
    LEFT JOIN users u ON h.user_id = u.id
    LEFT JOIN ferramentas f ON h.ferramenta_id = f.id
    WHERE f.owner_id IN (${placeholders})
    ORDER BY h.created_at DESC
  `;

  return query(sql, ownerIds);
}

export async function createObra(data: Partial<Obra>): Promise<Obra> {
  const id = await insertOne('obras', data);
  const newObra = await selectOne('obras', 'id = ?', [id]);
  return newObra!;
}

export async function updateObra(id: string, data: Partial<Obra>): Promise<void> {
  await updateOne('obras', id, data);
}

export async function deleteObra(id: string): Promise<void> {
  await deleteOne('obras', id);
}

export async function createFerramenta(data: Partial<Ferramenta>): Promise<Ferramenta> {
  const id = await insertOne('ferramentas', data);
  const newFerramenta = await selectOne('ferramentas', 'id = ?', [id]);
  return newFerramenta!;
}

export async function updateFerramenta(id: string, data: Partial<Ferramenta>): Promise<void> {
  await updateOne('ferramentas', id, data);
}

export async function deleteFerramenta(id: string): Promise<void> {
  await deleteOne('ferramentas', id);
}

export async function createEstabelecimento(data: any): Promise<any> {
  const id = await insertOne('estabelecimentos', data);
  const newEstab = await selectOne('estabelecimentos', 'id = ?', [id]);
  return newEstab!;
}

export async function updateEstabelecimento(id: string, data: any): Promise<void> {
  await updateOne('estabelecimentos', id, data);
}

export async function deleteEstabelecimento(id: string): Promise<void> {
  await deleteOne('estabelecimentos', id);
}

export async function createHistoricoEntry(data: any): Promise<void> {
  await insertOne('historico', data);
}

export async function createMovimentacao(data: any): Promise<void> {
  await insertOne('movimentacoes', data);
}

export async function getObraImages(obraId: string): Promise<any[]> {
  return selectAll('obra_images', 'obra_id = ?', [obraId]);
}

export async function createObraImage(data: any): Promise<any> {
  const id = await insertOne('obra_images', data);
  return await selectOne('obra_images', 'id = ?', [id]);
}

export async function deleteObraImage(id: string): Promise<void> {
  await deleteOne('obra_images', id);
}

export async function getUserObraPermissions(userId: string): Promise<any[]> {
  return selectAll('user_obra_permissions', 'user_id = ?', [userId]);
}

export async function getUserFerramentaPermissions(userId: string): Promise<any[]> {
  return selectAll('user_ferramenta_permissions', 'user_id = ?', [userId]);
}

export async function setUserObraPermission(userId: string, obraId: string, canView: boolean, canEdit: boolean): Promise<void> {
  const existing = await selectOne('user_obra_permissions', 'user_id = ? AND obra_id = ?', [userId, obraId]);

  if (existing) {
    await updateOne('user_obra_permissions', existing.id, {
      can_view: canView ? 1 : 0,
      can_edit: canEdit ? 1 : 0
    });
  } else {
    await insertOne('user_obra_permissions', {
      user_id: userId,
      obra_id: obraId,
      can_view: canView ? 1 : 0,
      can_edit: canEdit ? 1 : 0
    });
  }
}

export async function setUserFerramentaPermission(userId: string, ferramentaId: string, canView: boolean, canEdit: boolean): Promise<void> {
  const existing = await selectOne('user_ferramenta_permissions', 'user_id = ? AND ferramenta_id = ?', [userId, ferramentaId]);

  if (existing) {
    await updateOne('user_ferramenta_permissions', existing.id, {
      can_view: canView ? 1 : 0,
      can_edit: canEdit ? 1 : 0
    });
  } else {
    await insertOne('user_ferramenta_permissions', {
      user_id: userId,
      ferramenta_id: ferramentaId,
      can_view: canView ? 1 : 0,
      can_edit: canEdit ? 1 : 0
    });
  }
}

export async function deleteUserObraPermissions(userId: string, obraId: string): Promise<void> {
  const existing = await selectOne('user_obra_permissions', 'user_id = ? AND obra_id = ?', [userId, obraId]);
  if (existing) {
    await deleteOne('user_obra_permissions', existing.id);
  }
}

export async function deleteUserFerramentaPermissions(userId: string, ferramentaId: string): Promise<void> {
  const existing = await selectOne('user_ferramenta_permissions', 'user_id = ? AND ferramenta_id = ?', [userId, ferramentaId]);
  if (existing) {
    await deleteOne('user_ferramenta_permissions', existing.id);
  }
}

export { generateId };
