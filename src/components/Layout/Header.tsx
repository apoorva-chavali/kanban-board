import React, { useState } from 'react';
import { Search, Users, Tag, Plus, LayoutGrid } from 'lucide-react';
import { Task } from '../../types';
import styles from './Header.module.css';

interface HeaderProps {
  tasks: Task[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNewTask: () => void;
  onOpenTeam: () => void;
  onOpenLabels: () => void;
}

export function Header({ tasks, searchQuery, onSearchChange, onNewTask, onOpenTeam, onOpenLabels }: HeaderProps) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const overdue = tasks.filter((t) => {
    if (!t.due_date || t.status === 'done') return false;
    return new Date(t.due_date) < new Date();
  }).length;

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.logo}>
          <LayoutGrid size={18} />
          <span>Flow</span>
        </div>
        <div className={styles.stats}>
          <span className={styles.stat}>
            <span className={styles.statNum}>{total}</span> tasks
          </span>
          <span className={styles.divider} />
          <span className={styles.stat}>
            <span className={styles.statNum} style={{ color: '#10b981' }}>{done}</span> done
          </span>
          {overdue > 0 && (
            <>
              <span className={styles.divider} />
              <span className={styles.stat}>
                <span className={styles.statNum} style={{ color: '#ef4444' }}>{overdue}</span> overdue
              </span>
            </>
          )}
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.search}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button className={styles.clearSearch} onClick={() => onSearchChange('')}>×</button>
          )}
        </div>
        <button className={styles.iconBtn} onClick={onOpenTeam} title="Team">
          <Users size={15} />
        </button>
        <button className={styles.iconBtn} onClick={onOpenLabels} title="Labels">
          <Tag size={15} />
        </button>
        <button className={styles.newTaskBtn} onClick={onNewTask}>
          <Plus size={15} />
          New Task
        </button>
      </div>
    </header>
  );
}
