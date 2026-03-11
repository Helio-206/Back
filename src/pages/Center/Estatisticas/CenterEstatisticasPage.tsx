import { useEffect, useState, useMemo } from 'react';
import { CalendarCheck, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { centerService } from '../../../services/center.service';
import type { CenterInfo, CenterSchedule } from '../../../services/center.service';
import styles from './CenterEstatisticas.module.css';

export default function CenterEstatisticasPage() {
  const [center, setCenter] = useState<CenterInfo | null>(null);
  const [schedules, setSchedules] = useState<CenterSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('30');

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
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const days = parseInt(periodo);
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return schedules.filter((s) => new Date(s.scheduledDate) >= cutoff);
  }, [schedules, periodo]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const agendados = filtered.filter((s) => s.estadoAgendamento?.status === 'AGENDADO').length;
    const confirmados = filtered.filter((s) => s.estadoAgendamento?.status === 'CONFIRMADO').length;
    const concluidos = filtered.filter((s) => s.estadoAgendamento?.status === 'CONCLUIDO').length;
    const cancelados = filtered.filter(
      (s) => s.estadoAgendamento?.status === 'CANCELADO' || s.estadoAgendamento?.status === 'REJEITADO'
    ).length;
    const taxaConclusao = total > 0 ? Math.round((concluidos / total) * 100) : 0;

    // By service type
    const byService: Record<string, number> = {};
    filtered.forEach((s) => {
      const key = s.tipoServico?.descricao || 'Outro';
      byService[key] = (byService[key] || 0) + 1;
    });

    // By day of week
    const byDay: Record<string, number> = {
      Seg: 0, Ter: 0, Qua: 0, Qui: 0, Sex: 0, Sáb: 0, Dom: 0,
    };
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    filtered.forEach((s) => {
      const d = new Date(s.scheduledDate);
      byDay[dayNames[d.getDay()]] = (byDay[dayNames[d.getDay()]] || 0) + 1;
    });

    // By month
    const byMonth: Record<string, number> = {};
    filtered.forEach((s) => {
      const d = new Date(s.scheduledDate);
      const key = `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      byMonth[key] = (byMonth[key] || 0) + 1;
    });

    // By status
    const byStatus: Record<string, number> = {};
    filtered.forEach((s) => {
      const key = s.estadoAgendamento?.descricao || 'Desconhecido';
      byStatus[key] = (byStatus[key] || 0) + 1;
    });

    return {
      total, agendados, confirmados, concluidos, cancelados, taxaConclusao,
      byService: Object.entries(byService).sort((a, b) => b[1] - a[1]),
      byDay: Object.entries(byDay),
      byMonth: Object.entries(byMonth).sort(),
      byStatus: Object.entries(byStatus).sort((a, b) => b[1] - a[1]),
    };
  }, [filtered]);

  const maxService = Math.max(...stats.byService.map((s) => s[1]), 1);
  const maxDay = Math.max(...stats.byDay.map((d) => d[1]), 1);
  const maxMonth = Math.max(...stats.byMonth.map((m) => m[1]), 1);

  if (loading) {
    return <div className={styles.loading}>A carregar...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Estatísticas do Centro</h2>
        <select
          className={styles.periodoSelect}
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
        >
          <option value="7">Últimos 7 dias</option>
          <option value="15">Últimos 15 dias</option>
          <option value="30">Últimos 30 dias</option>
          <option value="90">Últimos 90 dias</option>
          <option value="365">Último ano</option>
        </select>
      </div>

      {center && (
        <p className={styles.centerLabel}>{center.name} — {center.provincia}</p>
      )}

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <CalendarCheck size={24} className={styles.kpiIconBlue} />
          <div>
            <span className={styles.kpiNumber}>{stats.total}</span>
            <span className={styles.kpiLabel}>Total</span>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <Clock size={24} className={styles.kpiIconOrange} />
          <div>
            <span className={styles.kpiNumber}>{stats.agendados}</span>
            <span className={styles.kpiLabel}>Pendentes</span>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <CheckCircle size={24} className={styles.kpiIconGreen} />
          <div>
            <span className={styles.kpiNumber}>{stats.confirmados}</span>
            <span className={styles.kpiLabel}>Aceites</span>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <CheckCircle size={24} className={styles.kpiIconTeal} />
          <div>
            <span className={styles.kpiNumber}>{stats.concluidos}</span>
            <span className={styles.kpiLabel}>Concluídos</span>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <XCircle size={24} className={styles.kpiIconRed} />
          <div>
            <span className={styles.kpiNumber}>{stats.cancelados}</span>
            <span className={styles.kpiLabel}>Cancelados</span>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <TrendingUp size={24} className={styles.kpiIconPurple} />
          <div>
            <span className={styles.kpiNumber}>{stats.taxaConclusao}%</span>
            <span className={styles.kpiLabel}>Taxa de Conclusão</span>
          </div>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        {/* By Service */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Por Tipo de Serviço</h3>
          <div className={styles.barChart}>
            {stats.byService.map(([label, value]) => (
              <div key={label} className={styles.barRow}>
                <span className={styles.barLabel}>{label}</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${(value / maxService) * 100}%` }}
                  />
                </div>
                <span className={styles.barValue}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By Status */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Por Estado</h3>
          <div className={styles.barChart}>
            {stats.byStatus.map(([label, value]) => (
              <div key={label} className={styles.barRow}>
                <span className={styles.barLabel}>{label}</span>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${styles.barFillAlt}`}
                    style={{ width: `${(value / stats.total) * 100}%` }}
                  />
                </div>
                <span className={styles.barValue}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By Day of Week */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Por Dia da Semana</h3>
          <div className={styles.dayChart}>
            {stats.byDay.map(([day, count]) => (
              <div key={day} className={styles.dayCol}>
                <div className={styles.dayBarWrap}>
                  <div
                    className={styles.dayBar}
                    style={{ height: `${(count / maxDay) * 100}%` }}
                  />
                </div>
                <span className={styles.dayLabel}>{day}</span>
                <span className={styles.dayValue}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By Month */}
        <div className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Por Mês</h3>
          <div className={styles.barChart}>
            {stats.byMonth.map(([month, value]) => (
              <div key={month} className={styles.barRow}>
                <span className={styles.barLabel}>{month}</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${(value / maxMonth) * 100}%` }}
                  />
                </div>
                <span className={styles.barValue}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
