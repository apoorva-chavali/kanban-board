import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Label } from '../types';

export function useLabels(userId: string | null) {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLabels = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('labels')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (!error) setLabels(data ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchLabels(); }, [fetchLabels]);

  const createLabel = async (name: string, color: string) => {
    if (!userId) return;
    const { error } = await supabase.from('labels').insert({ name, color, user_id: userId });
    if (error) throw error;
    await fetchLabels();
  };

  const deleteLabel = async (id: string) => {
    if (!userId) return;
    const { error } = await supabase.from('labels').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
    setLabels((prev) => prev.filter((l) => l.id !== id));
  };

  return { labels, loading, createLabel, deleteLabel };
}
