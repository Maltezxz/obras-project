import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Cache de imagens em memória
const imageCache = new Map<string, string>();

export function useFerramentaImage(ferramentaId: string) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadImage() {
      // Verificar cache primeiro
      if (imageCache.has(ferramentaId)) {
        if (isMounted) {
          setImageUrl(imageCache.get(ferramentaId) || null);
          setLoading(false);
        }
        return;
      }

      try {
        // Buscar apenas o image_url desta ferramenta específica
        const { data, error } = await supabase
          .from('ferramentas')
          .select('image_url')
          .eq('id', ferramentaId)
          .single();

        if (error) throw error;

        if (isMounted && data?.image_url) {
          // Salvar no cache
          imageCache.set(ferramentaId, data.image_url);
          setImageUrl(data.image_url);
        }
      } catch (error) {
        console.error('Erro ao carregar imagem:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [ferramentaId]);

  return { imageUrl, loading };
}
