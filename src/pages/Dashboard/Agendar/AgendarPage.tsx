import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { scheduleService } from '../../../services/schedule.service';
import type { Center, EstadoAgendamento, TipoServico } from '../../../services/schedule.service';
import CalendarPicker from '../../../components/CalendarPicker';
import styles from './Agendar.module.css';

const RENOVACAO_WARNINGS = [
  '*Preencha todos os campos, para realizar o seu agendamento com sucesso*',
  '*Preencha os campos de forma correcta*',
  '*Todos os campos são obrigatório*s',
];

export default function AgendarPage() {
  const { user } = useAuth();
  const cidadao = user?.cidadao;

  const [tiposServico, setTiposServico] = useState<TipoServico[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [estados, setEstados] = useState<EstadoAgendamento[]>([]);

  const [selectedService, setSelectedService] = useState('');
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
    } catch {
      setTiposServico([]);
      setCenters([]);
      setEstados([]);
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
        tipoServicoId: selectedService || undefined,
      });

      setSuccess('Agendamento realizado com sucesso!');
      setSelectedService('');
      setSelectedCenter('');
      setDate1('');
      setDate2('');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Erro ao agendar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const nomeCompleto = cidadao ? `${cidadao.nome} ${cidadao.sobrenome}` : '—';

  return (
    <div className={styles.container}>
      <div className={styles.header}>Agendar</div>

      <div className={styles.body}>
        {/* Left Column - Service Cards */}
        <div className={styles.leftColumn}>
          <h2 className={styles.selectTitle}>Selecione um tipo de serviço</h2>

          <div className={styles.serviceCards}>
            {tiposServico.map((tipo) => {
              const isRenovacao = tipo.descricao.toLowerCase().includes('renova');
              return (
                <div
                  key={tipo.id}
                  className={`${styles.serviceCard} ${
                    selectedService === tipo.id ? styles.serviceCardActive : ''
                  } ${isRenovacao ? styles.serviceCardLarge : ''}`}
                  onClick={() =>
                    setSelectedService(prev => prev === tipo.id ? '' : tipo.id)
                  }
                >
                  <div
                    className={`${styles.checkbox} ${
                      selectedService === tipo.id ? styles.checkboxActive : ''
                    }`}
                  />
                  <div className={styles.cardBody}>
                    {tipo.descricao && (
                      <span className={styles.cardLabel}>{tipo.descricao}</span>
                    )}
                    {isRenovacao && (
                      <div className={styles.cardWarnings}>
                        {RENOVACAO_WARNINGS.map((w, i) => (
                          <p
                            key={i}
                            className={
                              i < 2 ? styles.warningRed : styles.warningMuted
                            }
                          >
                            {w}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
                value={cidadao?.numeroBIAnterior || '—'}
                disabled
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Local de Renvação</label>
              <select
                className={styles.formSelect}
                value={selectedCenter}
                onChange={(e) => setSelectedCenter(e.target.value)}
                required
              >
                <option value="">Selecione</option>
                {centers.map((center) => (
                  <option key={center.id} value={center.id}>
                    {center.name} — {center.provincia}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.dateRow}>
              <div className={styles.dateColumn}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>1ª Opção</label>
                  <CalendarPicker
                    value={date1}
                    onChange={setDate1}
                    placeholder="Selecione a data"
                    required
                  />
                </div>
              </div>
              <div className={styles.dateColumn}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>2ª Opção</label>
                  <CalendarPicker
                    value={date2}
                    onChange={setDate2}
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
