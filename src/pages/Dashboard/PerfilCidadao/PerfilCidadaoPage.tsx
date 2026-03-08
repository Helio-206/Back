import { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { scheduleService } from '../../../services/schedule.service';
import type { Schedule } from '../../../services/schedule.service';
import styles from './PerfilCidadao.module.css';

/* Demo activity data shown when backend is unavailable */
const DEMO_ACTIVITIES = [
  {
    id: 'demo-1',
    scheduledDate: '2026-03-06',
    tipoServico: { id: 't1', descricao: 'Renovação' },
    estadoAgendamento: { id: 'e1', descricao: 'Agendado', status: 'AGENDADO' },
    center: { id: 'c1', name: 'Posto Central', province: 'Luanda' },
    createdAt: '2026-03-06',
  },
];

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
      setSchedules(data.length > 0 ? data : DEMO_ACTIVITIES as Schedule[]);
    } catch {
      setSchedules(DEMO_ACTIVITIES as Schedule[]);
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
    const parts = dateStr.split('T')[0].split('-');
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
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
          <span className={styles.biStatus}>Caducado</span>
          <div className={styles.cardContent}>
            {/* Left: BI + Citizen info */}
            <div className={styles.cardLeft}>
              <div className={styles.biRow}>
                <p className={styles.biLabel}>Nº Bilhete de Identidade</p>
                <p className={styles.biNumber}>{cidadao?.bi || '009593845LA0444'}</p>
              </div>

              <p className={styles.citizenLabel}>Cidadão</p>
              <p className={styles.citizenName}>{nomeCompleto || 'Nataniel Hélio Matondo'}</p>

              <div className={styles.dateInfo}>
                <span className={styles.dateLabel}>Data de Nascimento</span>
                <span className={styles.dateValue}>
                  {cidadao?.dataNascimento ? formatDate(cidadao.dataNascimento) : '16-04-2007'}
                </span>
              </div>
            </div>

            {/* Vertical divider */}
            <div className={styles.cardDivider} />

            {/* Right: emission and validity */}
            <div className={styles.cardRight}>
              <div className={styles.validityRow}>
                <span className={styles.validityLabel}>Emitido em:</span>
                <span className={styles.validityValue}>25/11/2020</span>
              </div>
              <div className={styles.validityRow}>
                <span className={styles.validityLabel}>Válido até:</span>
                <span className={styles.validityValue}>25/11/2025</span>
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
                    <td>Atualização dos dados</td>
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
