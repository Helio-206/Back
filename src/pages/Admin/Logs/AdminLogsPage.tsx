import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../../../services/admin.service';
import type { ActivityLog, ActivityLogStats } from '../../../services/admin.service';
import { Activity, Filter, RefreshCw, Clock, TrendingUp, Database } from 'lucide-react';
import styles from './AdminLogs.module.css';

const ACTION_LABELS: Record<string, string> = {
  STATUS_CONFIRMADO: 'Aceite',
  STATUS_CANCELADO: 'Cancelamento',
  STATUS_REJEITADO: 'Rejeição',
  STATUS_CONCLUIDO: 'Conclusão',
  STATUS_EM_PROCESSAMENTO: 'Em Processamento',
  STATUS_PRONTO_RETIRADA: 'Pronto Retirada',
  CREATE_CENTER: 'Criação de Centro',
  UPDATE_CENTER: 'Atualização de Centro',
  CREATE_USER: 'Criação de Utilizador',
};

const ENTITY_LABELS: Record<string, string> = {
  Schedule: 'Agendamento',
  Center: 'Centro',
  User: 'Utilizador',
};

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityLogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  const [limit, setLimit] = useState(50);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { limit };
      if (filterAction) params.action = filterAction;
      if (filterEntity) params.entity = filterEntity;

      const [logsData, statsData] = await Promise.all([
        adminService.getActivityLogs(params),
        adminService.getActivityLogStats(),
      ]);
      setLogs(logsData);
      setStats(statsData);
    } catch (err) {
      console.error('Erro ao carregar logs:', err);
    } finally {
      setLoading(false);
    }
  }, [filterAction, filterEntity, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-AO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUserName = (log: ActivityLog) => {
    if (log.user?.cidadao) {
      return `${log.user.cidadao.nome} ${log.user.cidadao.sobrenome}`;
    }
    return log.user?.email || 'Sistema';
  };

  const getActionLabel = (action: string) => ACTION_LABELS[action] || action;
  const getEntityLabel = (entity: string) => ENTITY_LABELS[entity] || entity;

  const getActionBadgeClass = (action: string) => {
    if (action.includes('CONFIRMADO') || action.includes('CONCLUIDO')) return styles.badgeSuccess;
    if (action.includes('CANCELADO') || action.includes('REJEITADO')) return styles.badgeDanger;
    if (action.includes('CREATE')) return styles.badgeInfo;
    return styles.badgeDefault;
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          <Activity size={22} /> Logs de Actividade
        </h1>
        <button className={styles.refreshBtn} onClick={fetchData} disabled={loading}>
          <RefreshCw size={16} className={loading ? styles.spinning : ''} />
          Atualizar
        </button>
      </div>

      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <Clock size={20} />
            <div>
              <span className={styles.statValue}>{stats.totalToday}</span>
              <span className={styles.statLabel}>Hoje</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <TrendingUp size={20} />
            <div>
              <span className={styles.statValue}>{stats.totalWeek}</span>
              <span className={styles.statLabel}>Esta Semana</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <Database size={20} />
            <div>
              <span className={styles.statValue}>{stats.totalAll}</span>
              <span className={styles.statLabel}>Total</span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.filtersBar}>
        <Filter size={16} />
        <select
          className={styles.filterSelect}
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
        >
          <option value="">Todas as Acções</option>
          <option value="STATUS_CONFIRMADO">Aceite</option>
          <option value="STATUS_CANCELADO">Cancelamento</option>
          <option value="STATUS_REJEITADO">Rejeição</option>
          <option value="STATUS_CONCLUIDO">Conclusão</option>
          <option value="STATUS_EM_PROCESSAMENTO">Em Processamento</option>
          <option value="CREATE_CENTER">Criação de Centro</option>
          <option value="CREATE_USER">Criação de Utilizador</option>
        </select>
        <select
          className={styles.filterSelect}
          value={filterEntity}
          onChange={(e) => setFilterEntity(e.target.value)}
        >
          <option value="">Todas as Entidades</option>
          <option value="Schedule">Agendamento</option>
          <option value="Center">Centro</option>
          <option value="User">Utilizador</option>
        </select>
        <select
          className={styles.filterSelect}
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
        >
          <option value={25}>25 registos</option>
          <option value={50}>50 registos</option>
          <option value={100}>100 registos</option>
          <option value={200}>200 registos</option>
        </select>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loadingState}>A carregar logs...</div>
        ) : logs.length === 0 ? (
          <div className={styles.emptyState}>Nenhum log de actividade encontrado.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data / Hora</th>
                <th>Utilizador</th>
                <th>Função</th>
                <th>Acção</th>
                <th>Entidade</th>
                <th>Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className={styles.dateCell}>{formatDate(log.createdAt)}</td>
                  <td>{getUserName(log)}</td>
                  <td>
                    <span className={styles.roleBadge}>{log.user?.role || '—'}</span>
                  </td>
                  <td>
                    <span className={`${styles.actionBadge} ${getActionBadgeClass(log.action)}`}>
                      {getActionLabel(log.action)}
                    </span>
                  </td>
                  <td>{getEntityLabel(log.entity)}</td>
                  <td className={styles.detailsCell}>{log.details || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
