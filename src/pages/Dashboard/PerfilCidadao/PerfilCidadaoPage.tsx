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
    } catch {
      setSchedules([]);
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
          {cidadao?.numeroBIAnterior && (
            <span className={styles.biStatus}>BI Anterior</span>
          )}
          <div className={styles.cardContent}>
            {/* Left: BI + Citizen info */}
            <div className={styles.cardLeft}>
              <div className={styles.biRow}>
                <p className={styles.biLabel}>Nº Bilhete de Identidade</p>
                <p className={styles.biNumber}>{cidadao?.numeroBIAnterior || '—'}</p>
              </div>

              <p className={styles.citizenLabel}>Cidadão</p>
              <p className={styles.citizenName}>{nomeCompleto || '—'}</p>

              <div className={styles.dateInfo}>
                <span className={styles.dateLabel}>Data de Nascimento</span>
                <span className={styles.dateValue}>
                  {cidadao?.dataNascimento ? formatDate(cidadao.dataNascimento) : '—'}
                </span>
              </div>
            </div>

            {/* Vertical divider */}
            <div className={styles.cardDivider} />

            {/* Right: extra info */}
            <div className={styles.cardRight}>
              <div className={styles.validityRow}>
                <span className={styles.validityLabel}>Sexo:</span>
                <span className={styles.validityValue}>{cidadao?.sexo || '—'}</span>
              </div>
              <div className={styles.validityRow}>
                <span className={styles.validityLabel}>Província:</span>
                <span className={styles.validityValue}>{cidadao?.provinciaResidencia || '—'}</span>
              </div>
              {cidadao?.bairroResidencia && (
                <div className={styles.validityRow}>
                  <span className={styles.validityLabel}>Bairro:</span>
                  <span className={styles.validityValue}>{cidadao.bairroResidencia}</span>
                </div>
              )}
            </div>
          </div>

          <p className={styles.director}>DIRETOR NACIONAL DE IDENTIFICAÇÃO</p>
        </div>

        {/* Atividades */}
        <div className={styles.activitiesSection}>
          <h2 className={styles.sectionTitle}>Atividades do Cidadão</h2>

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
