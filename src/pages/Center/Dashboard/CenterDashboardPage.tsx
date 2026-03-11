import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarCheck, Clock, CheckCircle, XCircle, Building2 } from 'lucide-react';
import { centerService } from '../../../services/center.service';
import type { CenterInfo, CenterSchedule } from '../../../services/center.service';
import styles from './CenterDashboard.module.css';

export default function CenterDashboardPage() {
  const [center, setCenter] = useState<CenterInfo | null>(null);
  const [schedules, setSchedules] = useState<CenterSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const centerData = await centerService.getMyCenter();
      setCenter(centerData);
      const schedulesData = await centerService.getCenterSchedules(centerData.id);
      setSchedules(schedulesData);
    } catch {
      setError('Erro ao carregar dados do centro.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>A carregar...</div>;
  }

  if (error || !center) {
    return <div className={styles.error}>{error || 'Centro não encontrado.'}</div>;
  }

  const today = new Date().toISOString().split('T')[0];
  const todaySchedules = schedules.filter(
    (s) => s.scheduledDate.split('T')[0] === today
  );

  const statusCounts = {
    agendado: schedules.filter((s) => s.estadoAgendamento?.status === 'AGENDADO').length,
    confirmado: schedules.filter((s) => s.estadoAgendamento?.status === 'CONFIRMADO').length,
    concluido: schedules.filter(
      (s) => s.estadoAgendamento?.status === 'CONCLUIDO'
    ).length,
    cancelado: schedules.filter(
      (s) =>
        s.estadoAgendamento?.status === 'CANCELADO' ||
        s.estadoAgendamento?.status === 'REJEITADO'
    ).length,
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  return (
    <div className={styles.container}>
      {/* Center Info Card */}
      <div className={styles.centerCard}>
        <div className={styles.centerIcon}>
          <Building2 size={28} />
        </div>
        <div className={styles.centerInfo}>
          <h2 className={styles.centerName}>{center.name}</h2>
          <p className={styles.centerDetail}>
            {center.address} — {center.provincia}
          </p>
          <p className={styles.centerDetail}>
            Horário: {center.openingTime} - {center.closingTime} | Capacidade: {center.capacidadeAgentos} agentes
          </p>
        </div>
        <div className={styles.centerStatus}>
          <span className={center.active ? styles.active : styles.inactive}>
            {center.active ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <CalendarCheck size={22} className={styles.statIconBlue} />
          <div>
            <span className={styles.statNumber}>{schedules.length}</span>
            <span className={styles.statLabel}>Total Agendamentos</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <Clock size={22} className={styles.statIconOrange} />
          <div>
            <span className={styles.statNumber}>{statusCounts.agendado}</span>
            <span className={styles.statLabel}>Pendentes</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <CheckCircle size={22} className={styles.statIconGreen} />
          <div>
            <span className={styles.statNumber}>{statusCounts.confirmado}</span>
            <span className={styles.statLabel}>Aceites</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <CheckCircle size={22} className={styles.statIconTeal} />
          <div>
            <span className={styles.statNumber}>{statusCounts.concluido}</span>
            <span className={styles.statLabel}>Concluídos</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <XCircle size={22} className={styles.statIconRed} />
          <div>
            <span className={styles.statNumber}>{statusCounts.cancelado}</span>
            <span className={styles.statLabel}>Cancelados/Rejeitados</span>
          </div>
        </div>
      </div>

      {/* Today's Schedules */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Agendamentos de Hoje</h3>
          <button
            className={styles.viewAllBtn}
            onClick={() => navigate('/centro/agendamentos')}
          >
            Ver Todos
          </button>
        </div>

        {todaySchedules.length === 0 ? (
          <p className={styles.emptyState}>Nenhum agendamento para hoje.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Cidadão</th>
                  <th>BI</th>
                  <th>Serviço</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {todaySchedules.slice(0, 5).map((s) => (
                  <tr key={s.id}>
                    <td>
                      {s.user?.cidadao
                        ? `${s.user.cidadao.nome} ${s.user.cidadao.sobrenome}`
                        : s.user?.email || '—'}
                    </td>
                    <td>{s.user?.cidadao?.numeroBIAnterior || '—'}</td>
                    <td>{s.tipoServico?.descricao || '—'}</td>
                    <td>
                      <span className={styles[`status${s.estadoAgendamento?.status}`] || styles.statusDefault}>
                        {s.estadoAgendamento?.descricao || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Actividade Recente</h3>
        {schedules.length === 0 ? (
          <p className={styles.emptyState}>Sem actividade registada.</p>
        ) : (
          <div className={styles.activityList}>
            {schedules.slice(0, 8).map((s) => (
              <div key={s.id} className={styles.activityItem}>
                <div className={styles.activityDot} />
                <div className={styles.activityInfo}>
                  <span className={styles.activityName}>
                    {s.user?.cidadao
                      ? `${s.user.cidadao.nome} ${s.user.cidadao.sobrenome}`
                      : s.user?.email}
                  </span>
                  <span className={styles.activityMeta}>
                    {s.tipoServico?.descricao || 'Serviço'} — {formatDate(s.scheduledDate)}
                  </span>
                </div>
                <span className={styles[`status${s.estadoAgendamento?.status}`] || styles.statusDefault}>
                  {s.estadoAgendamento?.descricao || '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
