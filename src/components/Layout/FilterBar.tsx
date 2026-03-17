import React from 'react';
import { TaskPriority, Label, TeamMember } from '../../types';
import styles from './FilterBar.module.css';

interface FilterBarProps {
  priorityFilter: TaskPriority | 'all';
  labelFilter: string | 'all';
  assigneeFilter: string | 'all';
  labels: Label[];
  members: TeamMember[];
  onPriorityChange: (p: TaskPriority | 'all') => void;
  onLabelChange: (l: string | 'all') => void;
  onAssigneeChange: (a: string | 'all') => void;
}

export function FilterBar({
  priorityFilter, labelFilter, assigneeFilter,
  labels, members,
  onPriorityChange, onLabelChange, onAssigneeChange,
}: FilterBarProps) {
  const hasFilters = priorityFilter !== 'all' || labelFilter !== 'all' || assigneeFilter !== 'all';

  return (
    <div className={styles.bar}>
      <div className={styles.filters}>
        <span className={styles.label}>Filter</span>

        <select
          className={styles.select}
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value as TaskPriority | 'all')}
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>

        {members.length > 0 && (
          <select
            className={styles.select}
            value={assigneeFilter}
            onChange={(e) => onAssigneeChange(e.target.value)}
          >
            <option value="all">All Assignees</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        )}

        {labels.length > 0 && (
          <select
            className={styles.select}
            value={labelFilter}
            onChange={(e) => onLabelChange(e.target.value)}
          >
            <option value="all">All Labels</option>
            {labels.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        )}

        {hasFilters && (
          <button
            className={styles.clearBtn}
            onClick={() => {
              onPriorityChange('all');
              onLabelChange('all');
              onAssigneeChange('all');
            }}
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
