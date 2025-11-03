import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const imageCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_DURATION = 10 * 60 * 1000;

const loadQueue: Array<() => Promise<void>> = [];
let isProcessingQueue = false;

async function processQueue() {
  if (isProcessingQueue || loadQueue.length === 0) return;

  isProcessingQueue = true;
  const task = loadQueue.shift();

  if (task) {
    await task();
    setTimeout(() => {
      isProcessingQueue = false;
      processQueue();
    }, 50);
  } else {
    isProcessingQueue = false;
  }
}

export function useFerramentaImage(ferramentaId: string, priority = false) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadImage() {
      const cached = imageCache.get(ferramentaId);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        if (isMounted) {
          setImageUrl(cached.url);
          setLoading(false);
        }
        return;
      }

      const task = async () => {
        try {
          const { data, error } = await supabase
            .from('ferramentas')
            .select('image_url')
            .eq('id', ferramentaId)
            .maybeSingle();

          if (error) throw error;

          if (isMounted && data?.image_url) {
            imageCache.set(ferramentaId, {
              url: data.image_url,
              timestamp: Date.now()
            });
            setImageUrl(data.image_url);
          }
        } catch (error) {
          console.error('Erro ao carregar imagem:', error);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };

      if (priority) {
        await task();
      } else {
        loadQueue.push(task);
        processQueue();
      }
    }

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [ferramentaId, priority]);

  return { imageUrl, loading };
}
