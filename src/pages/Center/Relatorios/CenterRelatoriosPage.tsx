import { useEffect, useState, useMemo } from 'react';
import { FileText, Download, Filter } from 'lucide-react';
import { centerService } from '../../../services/center.service';
import type { CenterInfo, CenterSchedule } from '../../../services/center.service';
import styles from './CenterRelatorios.module.css';

type ReportType = 'geral' | 'por_servico' | 'por_estado' | 'diario';

export default function CenterRelatoriosPage() {
  const [center, setCenter] = useState<CenterInfo | null>(null);
  const [schedules, setSchedules] = useState<CenterSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  const [reportType, setReportType] = useState<ReportType>('geral');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [generated, setGenerated] = useState(false);

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
    return schedules.filter((s) => {
      const d = new Date(s.scheduledDate);
      if (dataInicio && d < new Date(dataInicio)) return false;
      if (dataFim && d > new Date(dataFim + 'T23:59:59')) return false;
      return true;
    });
  }, [schedules, dataInicio, dataFim]);

  const reportData = useMemo(() => {
    const total = filtered.length;
    const agendados = filtered.filter((s) => s.estadoAgendamento?.status === 'AGENDADO').length;
    const confirmados = filtered.filter((s) => s.estadoAgendamento?.status === 'CONFIRMADO').length;
    const concluidos = filtered.filter((s) => s.estadoAgendamento?.status === 'CONCLUIDO').length;
    const cancelados = filtered.filter(
      (s) => s.estadoAgendamento?.status === 'CANCELADO' || s.estadoAgendamento?.status === 'REJEITADO'
    ).length;

    const byService: Record<string, { total: number; concluidos: number; cancelados: number }> = {};
    filtered.forEach((s) => {
      const key = s.tipoServico?.descricao || 'Outro';
      if (!byService[key]) byService[key] = { total: 0, concluidos: 0, cancelados: 0 };
      byService[key].total++;
      if (s.estadoAgendamento?.status === 'CONCLUIDO') byService[key].concluidos++;
      if (s.estadoAgendamento?.status === 'CANCELADO' || s.estadoAgendamento?.status === 'REJEITADO')
        byService[key].cancelados++;
    });

    const byDay: Record<string, number> = {};
    filtered.forEach((s) => {
      const key = new Date(s.scheduledDate).toLocaleDateString('pt-PT', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      });
      byDay[key] = (byDay[key] || 0) + 1;
    });

    return { total, agendados, confirmados, concluidos, cancelados, byService, byDay };
  }, [filtered]);

  const handleGenerate = () => {
    setGenerated(true);
  };

  const handleExportCSV = () => {
    let csv = '';
    if (reportType === 'geral' || reportType === 'por_estado') {
      csv = 'Cidadão,Email,Serviço,Data,Estado\n';
      filtered.forEach((s) => {
        const name = s.user?.cidadao
          ? `${s.user.cidadao.nome} ${s.user.cidadao.sobrenome}`
          : s.user?.email || '';
        const date = new Date(s.scheduledDate).toLocaleDateString('pt-PT');
        csv += `"${name}","${s.user?.email || ''}","${s.tipoServico?.descricao || ''}","${date}","${s.estadoAgendamento?.descricao || ''}"\n`;
      });
    } else if (reportType === 'por_servico') {
      csv = 'Serviço,Total,Concluídos,Cancelados\n';
      Object.entries(reportData.byService).forEach(([svc, data]) => {
        csv += `"${svc}",${data.total},${data.concluidos},${data.cancelados}\n`;
      });
    } else if (reportType === 'diario') {
      csv = 'Data,Total Agendamentos\n';
      Object.entries(reportData.byDay).forEach(([day, count]) => {
        csv += `"${day}",${count}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_${center?.name?.replace(/\s/g, '_') || 'centro'}_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });

  if (loading) {
    return <div className={styles.loading}>A carregar...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>
          <FileText size={20} /> Relatórios
        </h2>
      </div>

      {center && (
        <p className={styles.centerLabel}>{center.name} — {center.provincia}</p>
      )}

      {/* Report Config */}
      <div className={styles.configCard}>
        <h3 className={styles.configTitle}>
          <Filter size={16} /> Configurar Relatório
        </h3>
        <div className={styles.configGrid}>
          <div className={styles.configGroup}>
            <label>Tipo de Relatório</label>
            <select
              value={reportType}
              onChange={(e) => { setReportType(e.target.value as ReportType); setGenerated(false); }}
            >
              <option value="geral">Relatório Geral</option>
              <option value="por_servico">Por Tipo de Serviço</option>
              <option value="por_estado">Por Estado</option>
              <option value="diario">Relatório Diário</option>
            </select>
          </div>
          <div className={styles.configGroup}>
            <label>Data Início</label>
            <input type="date" value={dataInicio} onChange={(e) => { setDataInicio(e.target.value); setGenerated(false); }} />
          </div>
          <div className={styles.configGroup}>
            <label>Data Fim</label>
            <input type="date" value={dataFim} onChange={(e) => { setDataFim(e.target.value); setGenerated(false); }} />
          </div>
          <div className={styles.configActions}>
            <button className={styles.generateBtn} onClick={handleGenerate}>
              Gerar Relatório
            </button>
          </div>
        </div>
      </div>

      {/* Report Output */}
      {generated && (
        <div className={styles.reportCard}>
          <div className={styles.reportHeader}>
            <h3 className={styles.reportTitle}>
              {reportType === 'geral' && 'Relatório Geral'}
              {reportType === 'por_servico' && 'Relatório por Tipo de Serviço'}
              {reportType === 'por_estado' && 'Relatório por Estado'}
              {reportType === 'diario' && 'Relatório Diário'}
            </h3>
            <button className={styles.exportBtn} onClick={handleExportCSV}>
              <Download size={14} /> Exportar CSV
            </button>
          </div>

          {/* Summary */}
          <div className={styles.summaryGrid}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryNum}>{reportData.total}</span>
              <span className={styles.summaryLbl}>Total</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryNum}>{reportData.agendados}</span>
              <span className={styles.summaryLbl}>Pendentes</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryNum}>{reportData.confirmados}</span>
              <span className={styles.summaryLbl}>Aceites</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryNum}>{reportData.concluidos}</span>
              <span className={styles.summaryLbl}>Concluídos</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryNum}>{reportData.cancelados}</span>
              <span className={styles.summaryLbl}>Cancelados</span>
            </div>
          </div>

          {/* Report Type Specific Content */}
          {(reportType === 'geral' || reportType === 'por_estado') && (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Cidadão</th>
                    <th>Serviço</th>
                    <th>Data</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={4} className={styles.emptyCell}>Nenhum resultado.</td></tr>
                  ) : (
                    filtered.map((s) => (
                      <tr key={s.id}>
                        <td>
                          {s.user?.cidadao
                            ? `${s.user.cidadao.nome} ${s.user.cidadao.sobrenome}`
                            : s.user?.email || '—'}
                        </td>
                        <td>{s.tipoServico?.descricao || '—'}</td>
                        <td>{formatDate(s.scheduledDate)}</td>
                        <td>
                          <span className={styles[`status${s.estadoAgendamento?.status}`] || styles.statusDefault}>
                            {s.estadoAgendamento?.descricao || '—'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {reportType === 'por_servico' && (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Tipo de Serviço</th>
                    <th>Total</th>
                    <th>Concluídos</th>
                    <th>Cancelados</th>
                    <th>Taxa Conclusão</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(reportData.byService).map(([svc, data]) => (
                    <tr key={svc}>
                      <td>{svc}</td>
                      <td>{data.total}</td>
                      <td>{data.concluidos}</td>
                      <td>{data.cancelados}</td>
                      <td>{data.total > 0 ? Math.round((data.concluidos / data.total) * 100) : 0}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {reportType === 'diario' && (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Total de Agendamentos</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(reportData.byDay).map(([day, count]) => (
                    <tr key={day}>
                      <td>{day}</td>
                      <td>{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
