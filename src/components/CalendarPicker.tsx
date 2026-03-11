import { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './CalendarPicker.module.css';

interface CalendarPickerProps {
  value: string;             // ISO date string YYYY-MM-DD or ''
  onChange: (date: string) => void;
  placeholder?: string;
  required?: boolean;
  minDate?: string;          // ISO YYYY-MM-DD
}

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

function toISO(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function formatDisplay(iso: string) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export default function CalendarPicker({
  value,
  onChange,
  placeholder = 'Selecione a data',
  required = false,
  minDate,
}: CalendarPickerProps) {
  const today = new Date();
  const todayISO = toISO(today.getFullYear(), today.getMonth(), today.getDate());

  // Determine initial view month from value or today
  const initDate = value ? new Date(value + 'T00:00:00') : today;
  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());
  const [open, setOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const selectDay = useCallback((iso: string) => {
    onChange(iso);
    setOpen(false);
  }, [onChange]);

  // Build day cells for current view month
  const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: { day: number; iso: string; current: boolean; disabled: boolean }[] = [];

  // Previous month trailing days
  const prevDays = new Date(viewYear, viewMonth, 0).getDate();
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevDays - i;
    const m = viewMonth === 0 ? 11 : viewMonth - 1;
    const y = viewMonth === 0 ? viewYear - 1 : viewYear;
    cells.push({ day: d, iso: toISO(y, m, d), current: false, disabled: true });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = toISO(viewYear, viewMonth, d);
    const disabled = minDate ? iso < minDate : iso < todayISO;
    cells.push({ day: d, iso, current: true, disabled });
  }

  // Fill remaining cells to complete last row
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      cells.push({ day: d, iso: toISO(y, m, d), current: false, disabled: true });
    }
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      {/* Hidden input for form validation */}
      <input
        type="hidden"
        value={value}
        required={required}
      />

      <button
        type="button"
        className={`${styles.inputBtn} ${open ? styles.inputBtnOpen : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        {value ? (
          <span>{formatDisplay(value)}</span>
        ) : (
          <span className={styles.placeholder}>{placeholder}</span>
        )}
        <Calendar size={16} className={styles.calendarIcon} />
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.calHeader}>
            <button type="button" className={styles.navBtn} onClick={prevMonth}>
              <ChevronLeft size={18} />
            </button>
            <span className={styles.monthLabel}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button type="button" className={styles.navBtn} onClick={nextMonth}>
              <ChevronRight size={18} />
            </button>
          </div>

          <div className={styles.weekRow}>
            {WEEK_DAYS.map(wd => (
              <span key={wd} className={styles.weekDay}>{wd}</span>
            ))}
          </div>

          <div className={styles.daysGrid}>
            {cells.map((cell, i) => {
              const isToday = cell.iso === todayISO && cell.current;
              const isSelected = cell.iso === value && cell.current;
              const cls = [
                styles.dayCell,
                !cell.current && styles.dayCellOther,
                isToday && styles.dayCellToday,
                isSelected && styles.dayCellSelected,
                cell.disabled && cell.current && styles.dayCellDisabled,
              ].filter(Boolean).join(' ');

              return (
                <button
                  key={i}
                  type="button"
                  className={cls}
                  onClick={() => {
                    if (cell.current && !cell.disabled) {
                      selectDay(cell.iso);
                    }
                  }}
                  disabled={cell.disabled || !cell.current}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {value && (
            <div className={styles.clearRow}>
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => { onChange(''); setOpen(false); }}
              >
                Limpar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
