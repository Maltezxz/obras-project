import { Ferramenta } from '../types';

interface CacheEntry {
  data: Ferramenta[];
  timestamp: number;
  ownerId: string;
}

const CACHE_KEY = 'ferramentas_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const ferramentasCache = {
  get: (ownerId: string): Ferramenta[] | null => {
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const entry: CacheEntry = JSON.parse(cached);

      if (entry.ownerId !== ownerId) return null;

      if (Date.now() - entry.timestamp > CACHE_DURATION) {
        sessionStorage.removeItem(CACHE_KEY);
        return null;
      }

      return entry.data;
    } catch {
      return null;
    }
  },

  set: (ownerId: string, data: Ferramenta[]): void => {
    try {
      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
        ownerId
      };
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(entry));
    } catch (error) {
      console.warn('Cache storage error:', error);
    }
  },

  clear: (): void => {
    sessionStorage.removeItem(CACHE_KEY);
  }
};
