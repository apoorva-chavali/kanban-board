import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Task, BoardColumn as BoardColumnType } from '../../types';
import { TaskCard } from '../Task/TaskCard';
import styles from './BoardColumn.module.css';

interface BoardColumnProps {
  column: BoardColumnType;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (status: string) => void;
}

export function BoardColumn({ column, tasks, onTaskClick, onAddTask }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div className={`${styles.column} ${isOver ? styles.over : ''}`}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.dot} style={{ background: column.dotColor }} />
          <span className={styles.title}>{column.title}</span>
          <span className={styles.count}>{tasks.length}</span>
        </div>
        <button
          className={styles.addBtn}
          onClick={() => onAddTask(column.id)}
          title={`Add task to ${column.title}`}
        >
          <Plus size={14} />
        </button>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className={styles.taskList}>
          {tasks.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyDot} />
              <span>No tasks here</span>
              <button className={styles.emptyAdd} onClick={() => onAddTask(column.id)}>
                Add a task
              </button>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
