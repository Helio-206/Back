import { useState, useEffect, useMemo } from 'react';
import type { FormEvent } from 'react';
import { adminService } from '../../../services/admin.service';
import type { AdminSchedule } from '../../../services/admin.service';
import AdminDetailModal from '../../../components/AdminDetailModal';
import type { DetailField } from '../../../components/AdminDetailModal';
import styles from './Estatistica.module.css';

const PERIODOS = ['7 Dias', '15 Dias', '30 Dias', '90 Dias'];

function parseDateStr(dateStr: string): Date | null {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [d, m, y] = dateStr.split('/');
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export default function EstatisticaPage() {
  const [view, setView] = useState<'listagem' | 'grafico'>('listagem');
  const [schedules, setSchedules] = useState<AdminSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState<AdminSchedule | null>(null);

  const [periodo, setPeriodo] = useState('30 Dias');
  const [servico, setServico] = useState('Todos');
  const [centro, setCentro] = useState('Todos');

  // Dynamic filter options
  const [servicoOptions, setServicoOptions] = useState<string[]>(['Todos']);
  const [centroOptions, setCentroOptions] = useState<string[]>(['Todos']);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [schedulesData, tiposData, centrosData] = await Promise.all([
        adminService.getAllSchedules(),
        adminService.getAllTiposServico(),
        adminService.getAllCenters(),
      ]);
      setSchedules(schedulesData);
      setServicoOptions(['Todos', ...tiposData.map((t) => t.descricao)]);
      setCentroOptions(['Todos', ...centrosData.map((c) => c.name)]);
    } catch {
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const now = new Date();
    const daysMap: Record<string, number> = { '7 Dias': 7, '15 Dias': 15, '30 Dias': 30, '90 Dias': 90 };
    const days = daysMap[periodo] || 30;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return schedules.filter((s) => {
      if (servico !== 'Todos' && s.tipologia !== servico) return false;
      if (centro !== 'Todos' && !s.local.toLowerCase().includes(centro.toLowerCase())) return false;
      const d = parseDateStr(s.data);
      if (d && d < cutoff) return false;
      return true;
    });
  }, [schedules, servico, centro, periodo]);

  const handleFilter = (e: FormEvent) => {
    e.preventDefault();
  };

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach((s) => {
      counts[s.tipologia] = (counts[s.tipologia] || 0) + 1;
    });
    return Object.entries(counts).map(([label, value]) => ({ label, value }));
  }, [filtered]);

  const maxChart = Math.max(...chartData.map((d) => d.value), 1);

  const formatDate = (dateStr: string) => {
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('pt-AO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const monthlyData = useMemo(() => {
    const months: Record<string, number> = {};
    filtered.forEach((s) => {
      const parts = s.data.split('/');
      const key = parts.length === 3 ? `${parts[1]}/${parts[2]}` : s.data.slice(0, 7);
      months[key] = (months[key] || 0) + 1;
    });
    return Object.entries(months).map(([month, count]) => ({ month, count }));
  }, [filtered]);

  const maxMonthly = Math.max(...monthlyData.map((d) => d.count), 1);

  const scheduleDetailFields = (s: AdminSchedule): DetailField[] => [
    { label: 'ID', value: s.id },
    { label: 'Data', value: formatDate(s.data) },
    { label: 'Nº Identificação', value: s.identificacao },
    { label: 'Cidadão', value: s.cidadao },
    { label: 'Tipologia', value: s.tipologia },
    { label: 'Local', value: s.local },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.titleRow}>
        <h2 className={styles.pageTitle}>Estatística</h2>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.toggleBtn} ${view === 'listagem' ? styles.toggleActive : ''}`}
            onClick={() => setView('listagem')}
          >
            Listagem
          </button>
          <button
            className={`${styles.toggleBtn} ${view === 'grafico' ? styles.toggleActive : ''}`}
            onClick={() => setView('grafico')}
          >
            Gráfico
          </button>
        </div>
      </div>

      <form onSubmit={handleFilter} className={styles.filterRow}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Periodo</span>
          <select className={styles.filterSelect} value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
            {PERIODOS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>serviços</span>
          <select className={styles.filterSelect} value={servico} onChange={(e) => setServico(e.target.value)}>
            {servicoOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Centro</span>
          <select className={styles.filterSelect} value={centro} onChange={(e) => setCentro(e.target.value)}>
            {centroOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button type="submit" className={styles.filterBtn}>Filtrar</button>
      </form>

      {view === 'listagem' ? (
        <div className={styles.outerCard}>
          <div className={styles.statsHeader}>
            <p className={styles.statsLabel}>{servico === 'Todos' ? 'Agendamentos' : servico}</p>
            <p className={styles.statsCount}>{filtered.length}</p>
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
                  <tr><td colSpan={6} className={styles.emptyCell}>A carregar...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className={styles.emptyCell}>Nenhum resultado encontrado.</td></tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.id}>
                      <td>{formatDate(s.data)}</td>
                      <td className={styles.monoCell}>{s.identificacao}</td>
                      <td>{s.cidadao}</td>
                      <td>{s.tipologia}</td>
                      <td>{s.local}</td>
                      <td>
                        <button
                          className={styles.detailsBtn}
                          onClick={() => setSelectedSchedule(s)}
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
      ) : (
        <div className={styles.chartCard}>
          <div className={styles.chartContainer}>
            <h3 className={styles.chartTitle}>
              Agendamentos por Tipologia — {servico === 'Todos' ? 'Geral' : servico}
            </h3>
            <div className={styles.barChart}>
              {chartData.map((d) => (
                <div key={d.label} className={styles.barGroup}>
                  <span className={styles.barValue}>{d.value}</span>
                  <div
                    className={styles.bar}
                    style={{ height: `${(d.value / maxChart) * 200}px` }}
                  />
                  <span className={styles.barLabel}>{d.label}</span>
                </div>
              ))}
            </div>

            <h3 className={styles.chartTitle} style={{ marginTop: 40 }}>
              Agendamentos por Mês
            </h3>
            <div className={styles.barChart}>
              {monthlyData.map((d) => (
                <div key={d.month} className={styles.barGroup}>
                  <span className={styles.barValue}>{d.count}</span>
                  <div
                    className={`${styles.bar} ${styles.barBlue}`}
                    style={{ height: `${(d.count / maxMonthly) * 200}px` }}
                  />
                  <span className={styles.barLabel}>{d.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
