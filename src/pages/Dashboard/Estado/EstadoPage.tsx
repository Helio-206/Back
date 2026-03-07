import { useEffect, useState } from 'react';
import { scheduleService } from '../../../services/schedule.service';
import type { Schedule } from '../../../services/schedule.service';
import styles from './Estado.module.css';

export default function EstadoPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const data = await scheduleService.getMySchedules();
      setSchedules(data);
    } catch (err) {
      console.error('Failed to load schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Tem a certeza que deseja cancelar este agendamento?')) return;

    try {
      await scheduleService.cancelSchedule(id);
      await loadSchedules();
    } catch (err) {
      console.error('Failed to cancel schedule:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'AGENDADO':
        return styles.statusAgendado;
      case 'CONFIRMADO':
        return styles.statusConfirmado;
      case 'CANCELADO':
      case 'REJEITADO':
        return styles.statusCancelado;
      case 'EM_PROCESSAMENTO':
      case 'BIOMETRIA_RECOLHIDA':
        return styles.statusProcessando;
      default:
        return styles.statusDefault;
    }
  };

  const isCancellable = (status?: string) => {
    return status === 'AGENDADO' || status === 'CONFIRMADO';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>Estado</div>

      <div className={styles.body}>
        <h2 className={styles.sectionTitle}>Estado dos Agendamentos</h2>

        {loading ? (
          <div className={styles.loadingState}>A carregar...</div>
        ) : schedules.length === 0 ? (
          <div className={styles.emptyState}>Nenhum agendamento encontrado</div>
        ) : (
          <div className={styles.scheduleList}>
            {schedules.map((schedule) => (
              <div key={schedule.id} className={styles.scheduleCard}>
                <div className={styles.scheduleInfo}>
                  <span className={styles.scheduleType}>
                    {schedule.tipoServico?.descricao || 'Serviço Geral'}
                  </span>
                  <span className={styles.scheduleDetail}>
                    <strong>Data:</strong> {formatDate(schedule.scheduledDate)}
                  </span>
                  <span className={styles.scheduleDetail}>
                    <strong>Local:</strong> {schedule.center?.name || '—'}
                    {schedule.center?.province && ` — ${schedule.center.province}`}
                  </span>
                </div>

                <div className={styles.scheduleActions}>
                  <span
                    className={`${styles.statusBadge} ${getStatusBadgeClass(
                      schedule.estadoAgendamento?.status
                    )}`}
                  >
                    {schedule.estadoAgendamento?.descricao ||
                      schedule.estadoAgendamento?.status ||
                      '—'}
                  </span>

                  {isCancellable(schedule.estadoAgendamento?.status) && (
                    <button
                      className={styles.cancelBtn}
                      onClick={() => handleCancel(schedule.id)}
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
