import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useTasks } from './hooks/useTasks';
import { useTeamMembers } from './hooks/useTeamMembers';
import { useLabels } from './hooks/useLabels';
import { Board } from './components/Board/Board';
import { Header } from './components/Layout/Header';
import { FilterBar } from './components/Layout/FilterBar';
import { TaskModal } from './components/Task/TaskModal';
import { TaskDetailPanel } from './components/Task/TaskDetailPanel';
import { TeamModal } from './components/UI/TeamModal';
import { LabelsModal } from './components/UI/LabelsModal';
import { Task, TaskStatus, TaskPriority } from './types';
import './styles/globals.css';

type Modal = 'none' | 'create' | 'edit' | 'team' | 'labels';

export default function App() {
  const { loading: authLoading, userId } = useAuth();
  const { tasks, loading: tasksLoading, error, createTask, updateTask, updateTaskStatus, deleteTask } = useTasks(userId);
  const { members, createMember, deleteMember } = useTeamMembers(userId);
  const { labels, createLabel, deleteLabel } = useLabels(userId);

  const [activeModal, setActiveModal] = useState<Modal>('none');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('todo');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [labelFilter, setLabelFilter] = useState<string | 'all'>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string | 'all'>('all');

  const handleAddTask = (status: string) => {
    setDefaultStatus(status as TaskStatus);
    setEditingTask(null);
    setActiveModal('create');
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleEditTask = () => {
    if (!selectedTask) return;
    setEditingTask(selectedTask);
    setSelectedTask(null);
    setActiveModal('edit');
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    await deleteTask(selectedTask.id);
    setSelectedTask(null);
  };

  const handleSaveTask = async (data: Parameters<typeof createTask>[0]) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await createTask(data);
    }
    setActiveModal('none');
    setEditingTask(null);
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--text-tertiary)', fontSize: '14px' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '2px solid var(--border-strong)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          Setting up your workspace...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Header
        tasks={tasks}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNewTask={() => { setEditingTask(null); setDefaultStatus('todo'); setActiveModal('create'); }}
        onOpenTeam={() => setActiveModal('team')}
        onOpenLabels={() => setActiveModal('labels')}
      />

      <FilterBar
        priorityFilter={priorityFilter}
        labelFilter={labelFilter}
        assigneeFilter={assigneeFilter}
        labels={labels}
        members={members}
        onPriorityChange={setPriorityFilter}
        onLabelChange={setLabelFilter}
        onAssigneeChange={setAssigneeFilter}
      />

      {error && (
        <div style={{ padding: '12px 24px', background: 'rgba(239,68,68,0.1)', borderBottom: '1px solid rgba(239,68,68,0.2)', fontSize: '13px', color: '#ef4444' }}>
          {error}
        </div>
      )}

      {tasksLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 110px)', color: 'var(--text-tertiary)', fontSize: '14px', gap: '10px' }}>
          <div style={{ width: '20px', height: '20px', border: '2px solid var(--border-strong)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          Loading board...
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <Board
          tasks={tasks}
          labels={labels}
          members={members}
          searchQuery={searchQuery}
          priorityFilter={priorityFilter}
          labelFilter={labelFilter}
          assigneeFilter={assigneeFilter}
          onTaskClick={handleTaskClick}
          onAddTask={handleAddTask}
          onStatusChange={updateTaskStatus}
        />
      )}

      {/* Task create/edit modal */}
      {(activeModal === 'create' || activeModal === 'edit') && (
        <TaskModal
          task={editingTask}
          defaultStatus={defaultStatus}
          labels={labels}
          members={members}
          onSave={handleSaveTask}
          onClose={() => { setActiveModal('none'); setEditingTask(null); }}
        />
      )}

      {/* Task detail side panel */}
      {selectedTask && userId && (
        <TaskDetailPanel
          task={selectedTask}
          labels={labels}
          members={members}
          userId={userId}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {/* Team modal */}
      {activeModal === 'team' && (
        <TeamModal
          members={members}
          onAdd={createMember}
          onDelete={deleteMember}
          onClose={() => setActiveModal('none')}
        />
      )}

      {/* Labels modal */}
      {activeModal === 'labels' && (
        <LabelsModal
          labels={labels}
          onAdd={createLabel}
          onDelete={deleteLabel}
          onClose={() => setActiveModal('none')}
        />
      )}
    </div>
  );
}
