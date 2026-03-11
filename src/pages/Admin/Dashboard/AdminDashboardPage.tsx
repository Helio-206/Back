import { useState, useEffect, useMemo } from 'react';
import type { FormEvent } from 'react';
import { adminService } from '../../../services/admin.service';
import type { AdminSchedule } from '../../../services/admin.service';
import AdminDetailModal from '../../../components/AdminDetailModal';
import type { DetailField } from '../../../components/AdminDetailModal';
import styles from './AdminDashboard.module.css';

function parseDateStr(dateStr: string): Date | null {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [d, m, y] = dateStr.split('/');
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export default function AdminDashboardPage() {
  const [schedules, setSchedules] = useState<AdminSchedule[]>([]);
  const [filtered, setFiltered] = useState<AdminSchedule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState<AdminSchedule | null>(null);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllSchedules();
      setSchedules(data);
      setFiltered(data);
    } catch {
      setSchedules([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- KPIs ---------- */
  const kpis = useMemo(() => {
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startWeek = new Date(startToday);
    startWeek.setDate(startWeek.getDate() - startWeek.getDay());
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let today = 0, week = 0, month = 0, concluded = 0;
    const centerCounts: Record<string, number> = {};
    const serviceCounts: Record<string, number> = {};

    for (const s of schedules) {
      const d = parseDateStr(s.data);
      if (d) {
        if (d >= startToday) today++;
        if (d >= startWeek) week++;
        if (d >= startMonth) month++;
      }
      if (s.estado && ['RETIRADO', 'Retirado'].includes(s.estado)) concluded++;
      if (s.local) centerCounts[s.local] = (centerCounts[s.local] || 0) + 1;
      if (s.tipologia) serviceCounts[s.tipologia] = (serviceCounts[s.tipologia] || 0) + 1;
    }

    const topCenters = Object.entries(centerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    const topServices = Object.entries(serviceCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    const completionRate = schedules.length > 0
      ? Math.round((concluded / schedules.length) * 100)
      : 0;

    return { today, week, month, total: schedules.length, completionRate, topCenters, topServices };
  }, [schedules]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setFiltered(schedules);
      return;
    }
    const term = searchTerm.toLowerCase();
    const results = schedules.filter(
      (s) =>
        s.cidadao.toLowerCase().includes(term) ||
        s.identificacao.toLowerCase().includes(term)
    );
    setFiltered(results);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setFiltered(schedules);
  };

  const formatDate = (dateStr: string) => {
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('pt-AO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const scheduleDetailFields = (s: AdminSchedule): DetailField[] => [
    { label: 'ID', value: s.id },
    { label: 'Data', value: formatDate(s.data) },
    { label: 'Nº Identificação', value: s.identificacao },
    { label: 'Cidadão', value: s.cidadao },
    { label: 'Tipologia', value: s.tipologia },
    { label: 'Local', value: s.local },
    { label: 'Estado', value: s.estado || '—' },
  ];

  return (
    <div className={styles.page}>
      <h2 className={styles.pageTitle}>A minha Área</h2>

      {/* KPI Cards */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Hoje</span>
          <span className={styles.kpiValue}>{kpis.today}</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Esta Semana</span>
          <span className={styles.kpiValue}>{kpis.week}</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Este Mês</span>
          <span className={styles.kpiValue}>{kpis.month}</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Total</span>
          <span className={styles.kpiValue}>{kpis.total}</span>
        </div>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Taxa Conclusão</span>
          <span className={styles.kpiValue}>{kpis.completionRate}%</span>
        </div>
      </div>

      {/* Top Centers & Services */}
      <div className={styles.topRow}>
        <div className={styles.topCard}>
          <h4 className={styles.topCardTitle}>Centros Mais Utilizados</h4>
          {kpis.topCenters.length === 0 ? (
            <p className={styles.topEmpty}>Sem dados</p>
          ) : (
            <ul className={styles.topList}>
              {kpis.topCenters.map(([name, count]) => (
                <li key={name} className={styles.topItem}>
                  <span>{name}</span>
                  <span className={styles.topCount}>{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={styles.topCard}>
          <h4 className={styles.topCardTitle}>Serviços Mais Solicitados</h4>
          {kpis.topServices.length === 0 ? (
            <p className={styles.topEmpty}>Sem dados</p>
          ) : (
            <ul className={styles.topList}>
              {kpis.topServices.map(([name, count]) => (
                <li key={name} className={styles.topItem}>
                  <span>{name}</span>
                  <span className={styles.topCount}>{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <form onSubmit={handleSearch} className={styles.searchRow}>
        <div className={styles.searchWrapper}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Pesquisar cidadão ou agendamento (Nome, Nº Identificação)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button type="button" className={styles.clearBtn} onClick={handleClearSearch}>
              ×
            </button>
          )}
        </div>
        <button type="submit" className={styles.searchBtn}>
          Pesquisar
        </button>
      </form>

      <div className={styles.outerCard}>
        <div className={styles.statsHeader}>
          <p className={styles.statsLabel}>Agendamento</p>
          <p className={styles.statsCount}>{schedules.length}</p>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Identificação</th>
                <th>Cidadão</th>
                <th>Tipologia</th>
                <th>Local</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className={styles.emptyCell}>A carregar...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyCell}>Nenhum agendamento encontrado.</td>
                </tr>
              ) : (
                filtered.map((schedule) => (
                  <tr key={schedule.id}>
                    <td>{formatDate(schedule.data)}</td>
                    <td className={styles.monoCell}>{schedule.identificacao}</td>
                    <td>{schedule.cidadao}</td>
                    <td>{schedule.tipologia}</td>
                    <td>{schedule.local}</td>
                    <td>
                      <button
                        className={styles.detailsBtn}
                        onClick={() => setSelectedSchedule(schedule)}
                      >
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.tableFooter} />
      </div>

      {selectedSchedule && (
        <AdminDetailModal
          title="Detalhes do Agendamento"
          fields={scheduleDetailFields(selectedSchedule)}
          onClose={() => setSelectedSchedule(null)}
        />
      )}
    </div>
  );
}
