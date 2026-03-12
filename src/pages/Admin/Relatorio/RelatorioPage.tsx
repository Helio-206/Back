import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { adminService } from '../../../services/admin.service';
import type { AdminSchedule } from '../../../services/admin.service';
import styles from './Relatorio.module.css';

const PERIODOS = ['Intervalo', '7 Dias', '15 Dias', '30 Dias', '90 Dias'];
const TIPOS = ['CSV', 'PDF'];

function parseDateStr(dateStr: string): Date | null {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [d, m, y] = dateStr.split('/');
    return new Date(Number(y), Number(m) - 1, Number(d));
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function filterByPeriodo(schedules: AdminSchedule[], periodo: string): AdminSchedule[] {
  if (periodo === 'Intervalo') return schedules;
  const daysMap: Record<string, number> = { '7 Dias': 7, '15 Dias': 15, '30 Dias': 30, '90 Dias': 90 };
  const days = daysMap[periodo] || 30;
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return schedules.filter((s) => {
    const d = parseDateStr(s.data);
    return !d || d >= cutoff;
  });
}

function generateCSV(data: AdminSchedule[]): string {
  const header = 'Data,Identificação,Cidadão,Tipologia,Local';
  const rows = data.map((s) =>
    [s.data, s.identificacao, `"${s.cidadao}"`, `"${s.tipologia}"`, `"${s.local}"`].join(',')
  );
  return [header, ...rows].join('\n');
}

function generatePDFHtml(data: AdminSchedule[], filters: { periodo: string; servico: string; centro: string }): string {
  const rows = data.map((s) =>
    `<tr><td>${s.data}</td><td>${s.identificacao}</td><td>${s.cidadao}</td><td>${s.tipologia}</td><td>${s.local}</td></tr>`
  ).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Relatório</title>
<style>
body{font-family:Arial,sans-serif;margin:30px}
h1{color:#C41E24;font-size:20px}
.meta{color:#666;font-size:13px;margin-bottom:20px}
table{width:100%;border-collapse:collapse;margin-top:10px}
th{background:#C41E24;color:#fff;padding:8px 12px;text-align:left;font-size:13px}
td{padding:8px 12px;border-bottom:1px solid #eee;font-size:13px}
tr:nth-child(even){background:#f9f9f9}
.footer{margin-top:30px;font-size:11px;color:#999;text-align:center}
</style></head><body>
<h1>Relatório de Agendamentos</h1>
<p class="meta">Período: ${filters.periodo} | Serviço: ${filters.servico} | Centro: ${filters.centro} | Total: ${data.length}</p>
<table><thead><tr><th>Data</th><th>Identificação</th><th>Cidadão</th><th>Tipologia</th><th>Local</th></tr></thead>
<tbody>${rows}</tbody></table>
<p class="footer">Gerado em ${new Date().toLocaleString('pt-AO')} — RegulaFácil</p>
</body></html>`;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function RelatorioPage() {
  const [periodo, setPeriodo] = useState('Intervalo');
  const [servico, setServico] = useState('Todos');
  const [centro, setCentro] = useState('Todos');
  const [tipo, setTipo] = useState('CSV');
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [previewData, setPreviewData] = useState<AdminSchedule[] | null>(null);

  // Dynamic filter options
  const [servicoOptions, setServicoOptions] = useState<string[]>(['Todos']);
  const [centroOptions, setCentroOptions] = useState<string[]>(['Todos']);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [tiposData, centrosData] = await Promise.all([
          adminService.getAllTiposServico(),
          adminService.getAllCenters(),
        ]);
        setServicoOptions(['Todos', ...tiposData.map((t) => t.descricao)]);
        setCentroOptions(['Todos', ...centrosData.map((c) => c.name)]);
      } catch { /* keep defaults */ }
    };
    loadOptions();
  }, []);

  const handleGerar = async (e: FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setSuccess('');
    setError('');
    setPreviewData(null);

    try {
      let data = await adminService.getAllSchedules();

      let filtered = filterByPeriodo(data, periodo);
      if (servico !== 'Todos') filtered = filtered.filter((s) => s.tipologia === servico);
      if (centro !== 'Todos') filtered = filtered.filter((s) => s.local.toLowerCase().includes(centro.toLowerCase()));

      if (filtered.length === 0) {
        setError('Nenhum agendamento encontrado com os filtros selecionados.');
        setGenerating(false);
        return;
      }

      setPreviewData(filtered);

      const timestamp = new Date().toISOString().slice(0, 10);

      if (tipo === 'CSV') {
        const csv = generateCSV(filtered);
        downloadFile(csv, `relatorio-${timestamp}.csv`, 'text/csv;charset=utf-8;');
        setSuccess(`Relatório CSV gerado com sucesso! (${filtered.length} registos)`);
      } else {
        const html = generatePDFHtml(filtered, { periodo, servico, centro });
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => printWindow.print(), 500);
          setSuccess(`Relatório PDF aberto para impressão! (${filtered.length} registos)`);
        } else {
          downloadFile(html, `relatorio-${timestamp}.html`, 'text/html;charset=utf-8;');
          setSuccess(`Relatório HTML gerado com sucesso! (${filtered.length} registos)`);
        }
      }
    } catch {
      setError('Erro ao gerar relatório. Tente novamente.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className={styles.page}>
      <h2 className={styles.pageTitle}>Relatório</h2>

      <form onSubmit={handleGerar} className={styles.filterRow}>
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
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Tipo</span>
          <select className={styles.filterSelect} value={tipo} onChange={(e) => setTipo(e.target.value)}>
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <button type="submit" className={styles.filterBtn} disabled={generating}>
          {generating ? 'A gerar...' : 'Gerar'}
        </button>
      </form>

      {success && <div className={styles.successMessage}>{success}</div>}
      {error && <div className={styles.errorMessage}>{error}</div>}

      {previewData ? (
        <div className={styles.previewArea}>
          <h3 className={styles.previewTitle}>Pré-visualização ({previewData.length} registos)</h3>
          <div className={styles.previewTable}>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Identificação</th>
                  <th>Cidadão</th>
                  <th>Tipologia</th>
                  <th>Local</th>
                </tr>
              </thead>
              <tbody>
                {previewData.slice(0, 10).map((s) => (
                  <tr key={s.id}>
                    <td>{s.data}</td>
                    <td>{s.identificacao}</td>
                    <td>{s.cidadao}</td>
                    <td>{s.tipologia}</td>
                    <td>{s.local}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {previewData.length > 10 && (
              <p className={styles.previewMore}>... e mais {previewData.length - 10} registos</p>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.previewArea}>
          <p className={styles.previewText}>
            Selecione os filtros acima e clique em <strong>Gerar</strong> para criar o relatório.
          </p>
        </div>
      )}
    </div>
  );
}
