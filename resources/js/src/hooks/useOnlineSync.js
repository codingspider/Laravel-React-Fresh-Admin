import { useEffect } from 'react';
import { db } from '../db';
import api from '../axios';

export default function useOnlineSync() {
  useEffect(() => {
    const flushQueue = async () => {
      const queued = await db.queue.toArray();
      for (const item of queued) {
        try {
          await api({ method: item.method, url: item.url, data: item.payload });
        } catch (e) {
          console.error('Sync failed', e);
        }
      }
    };

    window.addEventListener('online', flushQueue);
    return () => window.removeEventListener('online', flushQueue);
  }, []);
}