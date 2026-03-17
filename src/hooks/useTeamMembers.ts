import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { TeamMember } from '../types';

export function useTeamMembers(userId: string | null) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (!error) setMembers(data ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const createMember = async (name: string, avatar_color: string) => {
    if (!userId) return;
    const { error } = await supabase.from('team_members').insert({ name, avatar_color, user_id: userId });
    if (error) throw error;
    await fetchMembers();
  };

  const deleteMember = async (id: string) => {
    if (!userId) return;
    const { error } = await supabase.from('team_members').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  return { members, loading, createMember, deleteMember };
}
