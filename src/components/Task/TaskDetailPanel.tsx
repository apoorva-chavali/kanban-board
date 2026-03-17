import { useState } from 'react';
import { X, Pencil, Trash2, Send, MessageSquare, Activity, Flag, Calendar } from 'lucide-react';
import { Task, Label, TeamMember, PRIORITY_CONFIG, BOARD_COLUMNS } from '../../types';
import { useTaskDetail } from '../../hooks/useTaskDetail';
import { formatDistanceToNow, format, isPast, isToday } from 'date-fns';
import styles from './TaskDetailPanel.module.css';

interface TaskDetailPanelProps {
  task: Task;
  labels: Label[];
  members: TeamMember[];
  userId: string;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

type Tab = 'comments' | 'activity';

function getActivityLabel(action: string, oldVal: string | null, newVal: string | null): string {
  switch (action) {
    case 'created': return `Created in ${BOARD_COLUMNS.find(c => c.id === newVal)?.title ?? newVal}`;
    case 'status_changed': {
      const from = BOARD_COLUMNS.find(c => c.id === oldVal)?.title ?? oldVal;
      const to = BOARD_COLUMNS.find(c => c.id === newVal)?.title ?? newVal;
      return `Moved from ${from} → ${to}`;
    }
    case 'commented': return `Commented: "${newVal}"`;
    default: return action;
  }
}

export function TaskDetailPanel({ task, userId, onEdit, onDelete, onClose }: TaskDetailPanelProps) {  const { comments, activity, loading, addComment, deleteComment } = useTaskDetail(task.id, userId);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('comments');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const priority = PRIORITY_CONFIG[task.priority];
  const column = BOARD_COLUMNS.find(c => c.id === task.status);

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await addComment(commentText.trim());
      setCommentText('');
    } finally {
      setSubmitting(false);
    }
  };

  const dueDateEl = task.due_date ? (() => {
    const d = new Date(task.due_date);
    const overdue = isPast(d) && !isToday(d);
    return (
      <span className={`${styles.dueBadge} ${overdue ? styles.dueBad : styles.dueOk}`}>
        <Calendar size={11} />
        {format(d, 'MMM d, yyyy')}
        {overdue && ' (overdue)'}
      </span>
    );
  })() : null;

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.panel}>
        {/* Header */}
        <div className={styles.panelHeader}>
          <div className={styles.headerMeta}>
            <span className={styles.statusBadge} style={{ color: column?.dotColor }}>
              <span className={styles.statusDot} style={{ background: column?.dotColor }} />
              {column?.title}
            </span>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.iconBtn} onClick={onEdit} title="Edit"><Pencil size={14} /></button>
            {confirmDelete ? (
              <div className={styles.confirmDelete}>
                <span>Delete?</span>
                <button className={styles.confirmYes} onClick={onDelete}>Yes</button>
                <button className={styles.confirmNo} onClick={() => setConfirmDelete(false)}>No</button>
              </div>
            ) : (
              <button className={styles.iconBtn} onClick={() => setConfirmDelete(true)} title="Delete">
                <Trash2 size={14} />
              </button>
            )}
            <button className={styles.iconBtn} onClick={onClose}><X size={15} /></button>
          </div>
        </div>

        {/* Task title & description */}
        <div className={styles.taskInfo}>
          <h2 className={styles.taskTitle}>{task.title}</h2>
          {task.description && <p className={styles.taskDesc}>{task.description}</p>}

          {/* Meta row */}
          <div className={styles.metaRow}>
            <span className={styles.metaItem} style={{ color: priority.color }}>
              <Flag size={12} />
              {priority.label}
            </span>
            {dueDateEl}
          </div>

          {/* Assignees */}
          {task.assignees && task.assignees.length > 0 && (
            <div className={styles.assignees}>
              {task.assignees.map((m) => (
                <div key={m.id} className={styles.assigneeChip}>
                  <div className={styles.assigneeAvatar} style={{ background: m.avatar_color }}>
                    {m.name[0].toUpperCase()}
                  </div>
                  <span>{m.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Labels */}
          {task.labels && task.labels.length > 0 && (
            <div className={styles.labels}>
              {task.labels.map((l) => (
                <span
                  key={l.id}
                  className={styles.labelChip}
                  style={{ background: l.color + '22', color: l.color, borderColor: l.color + '44' }}
                >
                  {l.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'comments' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('comments')}
          >
            <MessageSquare size={13} />
            Comments {comments.length > 0 && <span className={styles.tabBadge}>{comments.length}</span>}
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'activity' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <Activity size={13} />
            Activity {activity.length > 0 && <span className={styles.tabBadge}>{activity.length}</span>}
          </button>
        </div>

        {/* Tab content */}
        <div className={styles.tabContent}>
          {loading ? (
            <div className={styles.loadingState}>Loading...</div>
          ) : activeTab === 'comments' ? (
            <>
              <div className={styles.commentList}>
                {comments.length === 0 ? (
                  <div className={styles.emptyState}>
                    <MessageSquare size={20} />
                    <p>No comments yet</p>
                  </div>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className={styles.comment}>
                      <div className={styles.commentAvatar}>
                        {c.user_id.slice(0, 1).toUpperCase()}
                      </div>
                      <div className={styles.commentBody}>
                        <div className={styles.commentMeta}>
                          <span className={styles.commentAuthor}>You</span>
                          <span className={styles.commentTime}>
                            {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
                          </span>
                          {c.user_id === userId && (
                            <button
                              className={styles.deleteComment}
                              onClick={() => deleteComment(c.id)}
                              title="Delete comment"
                            >
                              <X size={10} />
                            </button>
                          )}
                        </div>
                        <p className={styles.commentText}>{c.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className={styles.commentInput}>
                <textarea
                  className={styles.commentTextarea}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmitComment();
                  }}
                />
                <button
                  className={styles.sendBtn}
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim() || submitting}
                >
                  <Send size={14} />
                </button>
              </div>
            </>
          ) : (
            <div className={styles.activityList}>
              {activity.length === 0 ? (
                <div className={styles.emptyState}>
                  <Activity size={20} />
                  <p>No activity yet</p>
                </div>
              ) : (
                activity.map((a) => (
                  <div key={a.id} className={styles.activityItem}>
                    <div className={styles.activityDot} />
                    <div className={styles.activityContent}>
                      <p className={styles.activityText}>
                        {getActivityLabel(a.action, a.old_value, a.new_value)}
                      </p>
                      <span className={styles.activityTime}>
                        {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
