import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { Label, LABEL_COLORS } from '../../types';
import styles from './LabelsModal.module.css';

interface LabelsModalProps {
  labels: Label[];
  onAdd: (name: string, color: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

export function LabelsModal({ labels, onAdd, onDelete, onClose }: LabelsModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(LABEL_COLORS[4]);
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
          <h2 className={styles.title}>Labels</h2>
          <button className={styles.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>

        <div className={styles.body}>
          <div className={styles.addSection}>
            <p className={styles.sectionLabel}>Create Label</p>
            <div className={styles.colorPicker}>
              {LABEL_COLORS.map((c) => (
                <button
                  key={c}
                  className={`${styles.colorDot} ${color === c ? styles.colorSelected : ''}`}
                  style={{ background: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
            <div className={styles.addRow}>
              <div className={styles.preview} style={{ background: color }} />
              <input
                className={styles.input}
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                placeholder="Label name (e.g. Bug, Feature)"
                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
              />
              <button className={styles.addBtn} onClick={handleAdd} disabled={adding}>
                <Plus size={15} />
              </button>
            </div>
            {error && <p className={styles.error}>{error}</p>}
          </div>

          <div className={styles.list}>
            {labels.length === 0 ? (
              <p className={styles.empty}>No labels yet</p>
            ) : (
              labels.map((l) => (
                <div key={l.id} className={styles.labelRow}>
                  <span
                    className={styles.labelChip}
                    style={{ background: l.color + '22', color: l.color, borderColor: l.color + '55' }}
                  >
                    {l.name}
                  </span>
                  <button className={styles.deleteBtn} onClick={() => onDelete(l.id)}>
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
