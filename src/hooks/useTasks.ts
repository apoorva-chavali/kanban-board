import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Task, TaskStatus, TaskPriority } from '../types';

export function useTasks(userId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          task_assignees(team_members(*)),
          task_labels(labels(*)),
          comments(count)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const mapped = (data ?? []).map((t: any) => ({
        ...t,
        assignees: t.task_assignees?.map((a: any) => a.team_members).filter(Boolean) ?? [],
        labels: t.task_labels?.map((l: any) => l.labels).filter(Boolean) ?? [],
        comments_count: t.comments?.[0]?.count ?? 0,
      }));

      setTasks(mapped);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (data: {
    title: string;
    description?: string;
    priority?: TaskPriority;
    due_date?: string | null;
    status?: TaskStatus;
    assigneeIds?: string[];
    labelIds?: string[];
  }) => {
    if (!userId) return null;

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        title: data.title,
        description: data.description ?? null,
        priority: data.priority ?? 'normal',
        due_date: data.due_date ?? null,
        status: data.status ?? 'todo',
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;

    // Insert assignees
    if (data.assigneeIds?.length) {
      await supabase.from('task_assignees').insert(
        data.assigneeIds.map((mid) => ({ task_id: task.id, member_id: mid, user_id: userId }))
      );
    }

    // Insert labels
    if (data.labelIds?.length) {
      await supabase.from('task_labels').insert(
        data.labelIds.map((lid) => ({ task_id: task.id, label_id: lid, user_id: userId }))
      );
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      task_id: task.id,
      user_id: userId,
      action: 'created',
      old_value: null,
      new_value: data.status ?? 'todo',
    });

    await fetchTasks();
    return task;
  };

  const updateTask = async (
    id: string,
    updates: Partial<{
      title: string;
      description: string;
      priority: TaskPriority;
      due_date: string | null;
      assigneeIds: string[];
      labelIds: string[];
    }>
  ) => {
    if (!userId) return;

    const { assigneeIds, labelIds, ...fields } = updates;

    if (Object.keys(fields).length > 0) {
      const { error } = await supabase.from('tasks').update(fields).eq('id', id).eq('user_id', userId);
      if (error) throw error;
    }

    if (assigneeIds !== undefined) {
      await supabase.from('task_assignees').delete().eq('task_id', id);
      if (assigneeIds.length > 0) {
        await supabase.from('task_assignees').insert(
          assigneeIds.map((mid) => ({ task_id: id, member_id: mid, user_id: userId }))
        );
      }
    }

    if (labelIds !== undefined) {
      await supabase.from('task_labels').delete().eq('task_id', id);
      if (labelIds.length > 0) {
        await supabase.from('task_labels').insert(
          labelIds.map((lid) => ({ task_id: id, label_id: lid, user_id: userId }))
        );
      }
    }

    await fetchTasks();
  };

  const updateTaskStatus = async (id: string, newStatus: TaskStatus) => {
    if (!userId) return;

    const task = tasks.find((t) => t.id === id);
    const oldStatus = task?.status;

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    // Log activity
    await supabase.from('activity_logs').insert({
      task_id: id,
      user_id: userId,
      action: 'status_changed',
      old_value: oldStatus ?? null,
      new_value: newStatus,
    });

    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
  };

  const deleteTask = async (id: string) => {
    if (!userId) return;
    const { error } = await supabase.from('tasks').delete().eq('id', id).eq('user_id', userId);
    if (error) throw error;
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return { tasks, loading, error, createTask, updateTask, updateTaskStatus, deleteTask, refetch: fetchTasks };
}
