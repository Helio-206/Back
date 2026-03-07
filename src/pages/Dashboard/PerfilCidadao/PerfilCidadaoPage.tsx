import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { scheduleService } from '../../../services/schedule.service';
import type { Schedule } from '../../../services/schedule.service';
import styles from './PerfilCidadao.module.css';

export default function PerfilCidadaoPage() {
  const { user } = useAuth();
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

  const cidadao = user?.cidadao;
  const nomeCompleto = cidadao ? `${cidadao.nome} ${cidadao.sobrenome}` : user?.email || '';

  const getStatusClass = (status?: string) => {
    switch (status) {
      case 'AGENDADO':
        return styles.statusAgendado;
      case 'CANCELADO':
        return styles.statusCancelado;
      case 'CONFIRMADO':
        return styles.statusConfirmado;
      default:
        return '';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        Perfil Cidadão
      </div>

      <div className={styles.body}>
        {/* Dados do Cidadão */}
        <h2 className={styles.sectionTitle}>Dados do Cidadão</h2>

        <div className={styles.citizenCard}>
          <div className={styles.cardRow}>
            <div className={styles.cardLeft}>
              <p className={styles.biLabel}>Nº Bilhete de Identidade</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
                <span className={styles.biNumber}>{cidadao?.bi || '—'}</span>
                <span className={styles.biStatus}>Caducado</span>
              </div>

              <p className={styles.citizenLabel}>Cidadão</p>
              <p className={styles.citizenName}>{nomeCompleto}</p>

              <div className={styles.dateRow}>
                <span className={styles.dateLabel}>Data de Nascimento</span>
              </div>
              <div className={styles.dateRow}>
                <span className={styles.dateValue}>
                  {cidadao?.dataNascimento
                    ? formatDate(cidadao.dataNascimento)
                    : '—'}
                </span>
              </div>
            </div>

            <div className={styles.cardRight}>
              <div className={styles.dateRow}>
                <span className={styles.dateLabel}>Emitido em:</span>
                <span className={styles.dateValue}>—</span>
              </div>
              <div className={styles.dateRow}>
                <span className={styles.dateLabel}>Válido até:</span>
                <span className={styles.dateValue}>—</span>
              </div>
            </div>
          </div>

          <p className={styles.director}>DIRETOR NACIONAL DE IDENTIFICAÇÃO</p>
        </div>

        {/* Atividades */}
        <div className={styles.activitiesSection}>
          <h2 className={styles.sectionTitle}>Atividades da Cidadção</h2>

          {loading ? (
            <div className={styles.emptyState}>A carregar...</div>
          ) : schedules.length === 0 ? (
            <div className={styles.emptyState}>Nenhuma atividade registada</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => (
                  <tr key={schedule.id}>
                    <td>{formatDate(schedule.scheduledDate)}</td>
                    <td>{schedule.tipoServico?.descricao || '—'}</td>
                    <td>{schedule.tipoServico?.descricao || '—'}</td>
                    <td className={getStatusClass(schedule.estadoAgendamento?.status)}>
                      {schedule.estadoAgendamento?.descricao || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
