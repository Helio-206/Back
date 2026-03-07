import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { scheduleService } from '../../../services/schedule.service';
import type { TipoServico, Center, EstadoAgendamento } from '../../../services/schedule.service';
import styles from './Agendar.module.css';

export default function AgendarPage() {
  const { user } = useAuth();
  const cidadao = user?.cidadao;

  const [tiposServico, setTiposServico] = useState<TipoServico[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [estados, setEstados] = useState<EstadoAgendamento[]>([]);

  const [selectedTipo, setSelectedTipo] = useState('');
  const [selectedCenter, setSelectedCenter] = useState('');
  const [date1, setDate1] = useState('');
  const [date2, setDate2] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadReferenceData();
  }, []);

  const loadReferenceData = async () => {
    try {
      const [tipos, centros, estadosList] = await Promise.all([
        scheduleService.getTiposServico(),
        scheduleService.getCenters(),
        scheduleService.getEstadosAgendamento(),
      ]);
      setTiposServico(tipos);
      setCenters(centros);
      setEstados(estadosList);
    } catch (err) {
      console.error('Failed to load reference data:', err);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const estadoAgendado = estados.find((e) => e.status === 'AGENDADO');
      if (!estadoAgendado) {
        setError('Estado de agendamento não encontrado.');
        return;
      }

      await scheduleService.createSchedule({
        centerId: selectedCenter,
        scheduledDate: new Date(date1).toISOString(),
        estadoAgendamentoId: estadoAgendado.id,
        tipoServicoId: selectedTipo || undefined,
      });

      setSuccess('Agendamento realizado com sucesso!');
      setSelectedTipo('');
      setSelectedCenter('');
      setDate1('');
      setDate2('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao agendar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const nomeCompleto = cidadao ? `${cidadao.nome} ${cidadao.sobrenome}` : '';

  return (
    <div className={styles.container}>
      <div className={styles.header}>Agendar</div>

      <div className={styles.body}>
        {/* Left Column - Service Selection */}
        <div className={styles.leftColumn}>
          <h2 className={styles.selectTitle}>Selecione um tipo de serviço</h2>

          {tiposServico.map((tipo) => (
            <div
              key={tipo.id}
              className={`${styles.serviceOption} ${
                selectedTipo === tipo.id ? styles.serviceOptionActive : ''
              }`}
              onClick={() => setSelectedTipo(tipo.id)}
            >
              <div
                className={`${styles.serviceRadio} ${
                  selectedTipo === tipo.id ? styles.serviceRadioActive : ''
                }`}
              />
              <span className={styles.serviceLabel}>{tipo.descricao}</span>
            </div>
          ))}

          <div className={styles.warnings}>
            <p className={styles.warningRed}>
              *Preencha todos os campos, para realizar o seu agendamento com sucesso*
            </p>
            <p className={styles.warningRed}>
              *Preencha os campos de forma correcta*
            </p>
            <p className={styles.warningMuted}>*Todos os campos são obrigatório*s</p>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className={styles.rightColumn}>
          <form onSubmit={handleSubmit}>
            {success && <div className={styles.successMessage}>{success}</div>}
            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nome Completo</label>
              <input
                type="text"
                className={styles.formInput}
                value={nomeCompleto}
                disabled
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nº do Bilhete de Identificação</label>
              <input
                type="text"
                className={styles.formInput}
                value={cidadao?.bi || ''}
                disabled
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Local de Renovação</label>
              <select
                className={styles.formSelect}
                value={selectedCenter}
                onChange={(e) => setSelectedCenter(e.target.value)}
                required
              >
                <option value="">Selecione</option>
                {centers.map((center) => (
                  <option key={center.id} value={center.id}>
                    {center.name} — {center.province}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.dateRow}>
              <div className={styles.dateColumn}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>1ª Opção</label>
                  <input
                    type="date"
                    className={styles.formInput}
                    value={date1}
                    onChange={(e) => setDate1(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className={styles.dateColumn}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>2ª Opção</label>
                  <input
                    type="date"
                    className={styles.formInput}
                    value={date2}
                    onChange={(e) => setDate2(e.target.value)}
                    placeholder="Data (Opcional)"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'A agendar...' : 'Agendar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
