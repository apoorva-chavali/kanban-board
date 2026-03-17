import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { TeamMember, LABEL_COLORS } from '../../types';
import styles from './TeamModal.module.css';

interface TeamModalProps {
  members: TeamMember[];
  onAdd: (name: string, color: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

export function TeamModal({ members, onAdd, onDelete, onClose }: TeamModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(LABEL_COLORS[0]);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    if (!name.trim()) { setError('Name is required'); return; }
    setAdding(true);
    try {
      await onAdd(name.trim(), color);
      setName('');
      setError('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Team Members</h2>
          <button className={styles.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>

        <div className={styles.body}>
          <div className={styles.addSection}>
            <p className={styles.sectionLabel}>Add Member</p>
            <div className={styles.addRow}>
              <div className={styles.colorPicker}>
                {LABEL_COLORS.slice(0, 8).map((c) => (
                  <button
                    key={c}
                    className={`${styles.colorDot} ${color === c ? styles.colorSelected : ''}`}
                    style={{ background: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
              <input
                className={styles.input}
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                placeholder="Member name"
                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
              />
              <button className={styles.addBtn} onClick={handleAdd} disabled={adding}>
                <Plus size={15} />
              </button>
            </div>
            {error && <p className={styles.error}>{error}</p>}
          </div>

          <div className={styles.list}>
            {members.length === 0 ? (
              <p className={styles.empty}>No team members yet</p>
            ) : (
              members.map((m) => (
                <div key={m.id} className={styles.memberRow}>
                  <div className={styles.memberAvatar} style={{ background: m.avatar_color }}>
                    {m.name[0].toUpperCase()}
                  </div>
                  <span className={styles.memberName}>{m.name}</span>
                  <button className={styles.deleteBtn} onClick={() => onDelete(m.id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
