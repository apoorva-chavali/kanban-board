import { useState, useEffect } from 'react';
import { X, Calendar, Flag, User, Tag } from 'lucide-react';
import { Task, TaskStatus, TaskPriority, Label, TeamMember, PRIORITY_CONFIG, BOARD_COLUMNS } from '../../types';
import styles from './TaskModal.module.css';

interface TaskModalProps {
  task?: Task | null;
  defaultStatus?: TaskStatus;
  labels: Label[];
  members: TeamMember[];
  onSave: (data: {
    title: string;
    description?: string;
    priority: TaskPriority;
    due_date: string | null;
    status: TaskStatus;
    assigneeIds: string[];
    labelIds: string[];
  }) => Promise<void>;
  onClose: () => void;
}

export function TaskModal({ task, defaultStatus = 'todo', labels, members, onSave, onClose }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'normal');
  const [dueDate, setDueDate] = useState(task?.due_date ?? '');
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? defaultStatus);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(task?.assignees?.map((a) => a.id) ?? []);
  const [selectedLabels, setSelectedLabels] = useState<string[]>(task?.labels?.map((l) => l.id) ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        due_date: dueDate || null,
        status,
        assigneeIds: selectedAssignees,
        labelIds: selectedLabels,
      });
      onClose();
    } catch (e: any) {
      setError(e.message ?? 'Failed to save task');
      setSaving(false);
    }
  };

  const toggleAssignee = (id: string) =>
    setSelectedAssignees((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const toggleLabel = (id: string) =>
    setSelectedLabels((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{task ? 'Edit Task' : 'New Task'}</h2>
          <button className={styles.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>

        <div className={styles.body}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Title *</label>
            <input
              autoFocus
              className={styles.input}
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(''); }}
              placeholder="What needs to be done?"
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSubmit(); }}
            />
            {error && <p className={styles.errorText}>{error}</p>}
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Description</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more detail..."
              rows={3}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}><Flag size={12} /> Priority</label>
              <div className={styles.priorityButtons}>
                {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((p) => (
                  <button
                    key={p}
                    className={`${styles.priorityBtn} ${priority === p ? styles.priorityActive : ''}`}
                    style={priority === p ? { borderColor: PRIORITY_CONFIG[p].color, color: PRIORITY_CONFIG[p].color } : {}}
                    onClick={() => setPriority(p)}
                  >
                    {PRIORITY_CONFIG[p].label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.fieldLabel}><Calendar size={12} /> Due Date</label>
              <input
                type="date"
                className={styles.input}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Status</label>
            <div className={styles.statusButtons}>
              {BOARD_COLUMNS.map((col) => (
                <button
                  key={col.id}
                  className={`${styles.statusBtn} ${status === col.id ? styles.statusActive : ''}`}
                  style={status === col.id ? { borderColor: col.dotColor, color: col.dotColor } : {}}
                  onClick={() => setStatus(col.id)}
                >
                  <span className={styles.statusDot} style={{ background: col.dotColor }} />
                  {col.title}
                </button>
              ))}
            </div>
          </div>

          {members.length > 0 && (
            <div className={styles.field}>
              <label className={styles.fieldLabel}><User size={12} /> Assignees</label>
              <div className={styles.memberGrid}>
                {members.map((m) => {
                  const selected = selectedAssignees.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      className={`${styles.memberChip} ${selected ? styles.memberSelected : ''}`}
                      onClick={() => toggleAssignee(m.id)}
                      style={selected ? { borderColor: m.avatar_color } : {}}
                    >
                      <div className={styles.memberAvatar} style={{ background: m.avatar_color }}>
                        {m.name[0].toUpperCase()}
                      </div>
                      <span>{m.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {labels.length > 0 && (
            <div className={styles.field}>
              <label className={styles.fieldLabel}><Tag size={12} /> Labels</label>
              <div className={styles.labelGrid}>
                {labels.map((l) => {
                  const selected = selectedLabels.includes(l.id);
                  return (
                    <button
                      key={l.id}
                      className={`${styles.labelChip} ${selected ? styles.labelSelected : ''}`}
                      style={{ borderColor: selected ? l.color : undefined, color: selected ? l.color : undefined, background: selected ? l.color + '22' : undefined }}
                      onClick={() => toggleLabel(l.id)}
                    >
                      <span className={styles.labelDot} style={{ background: l.color }} />
                      {l.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.saveBtn} onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}
