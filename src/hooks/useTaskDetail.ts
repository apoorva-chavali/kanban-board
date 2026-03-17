import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Comment, ActivityLog } from '../types';

export function useTaskDetail(taskId: string | null, userId: string | null) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!taskId || !userId) return;
    setLoading(true);

    const [commentsRes, activityRes] = await Promise.all([
      supabase
        .from('comments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true }),
      supabase
        .from('activity_logs')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false }),
    ]);

    if (!commentsRes.error) setComments(commentsRes.data ?? []);
    if (!activityRes.error) setActivity(activityRes.data ?? []);
    setLoading(false);
  }, [taskId, userId]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const addComment = async (content: string) => {
    if (!taskId || !userId) return;
    const { error } = await supabase.from('comments').insert({ task_id: taskId, content, user_id: userId });
    if (error) throw error;

    await supabase.from('activity_logs').insert({
      task_id: taskId,
      user_id: userId,
      action: 'commented',
      old_value: null,
      new_value: content.slice(0, 100),
    });

    await fetchDetail();
  };

  const deleteComment = async (commentId: string) => {
    if (!userId) return;
    const { error } = await supabase.from('comments').delete().eq('id', commentId).eq('user_id', userId);
    if (error) throw error;
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  return { comments, activity, loading, addComment, deleteComment };
}
