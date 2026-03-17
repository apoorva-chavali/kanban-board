import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MessageSquare, Calendar, AlertCircle, Flag } from 'lucide-react';
import { Task, PRIORITY_CONFIG } from '../../types';
import { formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

function DueDateBadge({ date }: { date: string }) {
  const d = new Date(date);
  const overdue = isPast(d) && !isToday(d);
  const dueToday = isToday(d);
  const dueTomorrow = isTomorrow(d);

  const label = dueToday ? 'Today' : dueTomorrow ? 'Tomorrow' : formatDistanceToNow(d, { addSuffix: true });
  const cls = overdue ? styles.dueBad : dueToday ? styles.dueWarn : styles.dueOk;

  return (
    <span className={`${styles.dueBadge} ${cls}`}>
      {overdue && <AlertCircle size={10} />}
      <Calendar size={10} />
      {label}
    </span>
  );
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : undefined,
  };

  const priority = PRIORITY_CONFIG[task.priority];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={styles.card}
      onClick={onClick}
    >
      {/* Priority indicator bar */}
      <div
        className={styles.priorityBar}
        style={{ background: priority.color }}
        title={`Priority: ${priority.label}`}
      />

      <div className={styles.content}>
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

        <p className={styles.title}>{task.title}</p>

        {task.description && (
          <p className={styles.description}>{task.description}</p>
        )}

        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            {/* Assignee avatars */}
            {task.assignees && task.assignees.length > 0 && (
              <div className={styles.avatars}>
                {task.assignees.slice(0, 3).map((m) => (
                  <div
                    key={m.id}
                    className={styles.avatar}
                    style={{ background: m.avatar_color }}
                    title={m.name}
                  >
                    {m.name[0].toUpperCase()}
                  </div>
                ))}
                {task.assignees.length > 3 && (
                  <div className={`${styles.avatar} ${styles.avatarMore}`}>
                    +{task.assignees.length - 3}
                  </div>
                )}
              </div>
            )}

            {/* Priority flag */}
            {task.priority !== 'normal' && (
              <Flag
                size={12}
                style={{ color: priority.color }}
                className={styles.priorityIcon}
              />
            )}
          </div>

          <div className={styles.footerRight}>
            {task.due_date && <DueDateBadge date={task.due_date} />}
            {(task.comments_count ?? 0) > 0 && (
              <span className={styles.commentCount}>
                <MessageSquare size={11} />
                {task.comments_count}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
