import React, { useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Task, TaskStatus, TaskPriority, Label, TeamMember, BOARD_COLUMNS } from '../../types';
import { BoardColumn } from './BoardColumn';
import { TaskCard } from '../Task/TaskCard';
import styles from './Board.module.css';

interface BoardProps {
  tasks: Task[];
  labels: Label[];
  members: TeamMember[];
  searchQuery: string;
  priorityFilter: TaskPriority | 'all';
  labelFilter: string | 'all';
  assigneeFilter: string | 'all';
  onTaskClick: (task: Task) => void;
  onAddTask: (status: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => Promise<void>;
}

export function Board({
  tasks,
  labels,
  members,
  searchQuery,
  priorityFilter,
  labelFilter,
  assigneeFilter,
  onTaskClick,
  onAddTask,
  onStatusChange,
}: BoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (labelFilter !== 'all' && !t.labels?.some((l) => l.id === labelFilter)) return false;
      if (assigneeFilter !== 'all' && !t.assignees?.some((a) => a.id === assigneeFilter)) return false;
      return true;
    });
  }, [tasks, searchQuery, priorityFilter, labelFilter, assigneeFilter]);

  const tasksByColumn = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      in_review: [],
      done: [],
    };
    filteredTasks.forEach((t) => {
      if (map[t.status]) map[t.status].push(t);
    });
    return map;
  }, [filteredTasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    const targetColumn = BOARD_COLUMNS.find((c) => c.id === overId);
    if (targetColumn) {
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.status !== targetColumn.id) {
        await onStatusChange(taskId, targetColumn.id as TaskStatus);
      }
      return;
    }

    // Dropped on a task — find which column that task is in
    const targetTask = tasks.find((t) => t.id === overId);
    if (targetTask) {
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.status !== targetTask.status) {
        await onStatusChange(taskId, targetTask.status);
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Optimistic UI - update local position for smooth DnD
    const { active, over } = event;
    if (!over) return;
    const taskId = active.id as string;
    const overId = over.id as string;

    const targetColumn = BOARD_COLUMNS.find((c) => c.id === overId);
    if (targetColumn) return; // handled in dragEnd

    // Just let dnd-kit handle the visual position
  };

  const isFiltering = searchQuery || priorityFilter !== 'all' || labelFilter !== 'all' || assigneeFilter !== 'all';

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className={styles.board}>
        {isFiltering && filteredTasks.length === 0 && (
          <div className={styles.noResults}>
            <p>No tasks match your filters</p>
          </div>
        )}
        {BOARD_COLUMNS.map((col) => (
          <BoardColumn
            key={col.id}
            column={col}
            tasks={tasksByColumn[col.id]}
            onTaskClick={onTaskClick}
            onAddTask={onAddTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div style={{ opacity: 0.9, transform: 'rotate(2deg)', pointerEvents: 'none' }}>
            <TaskCard task={activeTask} onClick={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
