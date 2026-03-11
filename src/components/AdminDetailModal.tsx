import { useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './AdminDetailModal.module.css';

export interface DetailField {
  label: string;
  value: string;
}

interface AdminDetailModalProps {
  title: string;
  fields: DetailField[];
  onClose: () => void;
}

export default function AdminDetailModal({ title, fields, onClose }: AdminDetailModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} strokeWidth={2} />
          </button>
        </div>
        <div className={styles.body}>
          {fields.map((field) => (
            <div key={field.label} className={styles.fieldRow}>
              <span className={styles.fieldLabel}>{field.label}</span>
              <span className={styles.fieldValue}>{field.value || '—'}</span>
            </div>
          ))}
        </div>
        <div className={styles.footer}>
          <button className={styles.closeFooterBtn} onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  );
}
