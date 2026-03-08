import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { scheduleService } from '../../../services/schedule.service';
import type { Center, EstadoAgendamento } from '../../../services/schedule.service';
import styles from './Agendar.module.css';

/* Static service cards matching the prototype design */
const SERVICE_CARDS = [
  { id: 'empty', label: '', description: '' },
  { id: '2via', label: '2ª Via do Bilhete de Identificação', description: '' },
  {
    id: 'renovacao',
    label: 'Renovação do Bilhete',
    description: '',
    warnings: [
      '*Preencha todos os campos, para realizar o seu agendamento com sucesso*',
      '*Preencha os campos de forma correcta*',
      '*Todos os campos são obrigatório*s',
    ],
  },
  { id: 'atualizar', label: 'Atualizar Documentos', description: '' },
];

export default function AgendarPage() {
  const { user } = useAuth();
  const cidadao = user?.cidadao;

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
      const [centros, estadosList] = await Promise.all([
        scheduleService.getCenters(),
        scheduleService.getEstadosAgendamento(),
      ]);
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
        tipoServicoId: selectedService || undefined,
      });

      setSuccess('Agendamento realizado com sucesso!');
      setSelectedService('');
      setSelectedCenter('');
      setDate1('');
      setDate2('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao agendar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const nomeCompleto = cidadao ? `${cidadao.nome} ${cidadao.sobrenome}` : 'Nataniel Hélio Matondo';

  return (
    <div className={styles.container}>
      <div className={styles.header}>Agendar</div>

      <div className={styles.body}>
        {/* Left Column - Service Cards */}
        <div className={styles.leftColumn}>
          <h2 className={styles.selectTitle}>Selecione um tipo de serviço</h2>

          <div className={styles.serviceCards}>
            {SERVICE_CARDS.map((card) => (
              <div
                key={card.id}
                className={`${styles.serviceCard} ${
                  selectedService === card.id ? styles.serviceCardActive : ''
                } ${card.id === 'renovacao' ? styles.serviceCardLarge : ''}`}
                onClick={() => setSelectedService(card.id)}
              >
                <div
                  className={`${styles.checkbox} ${
                    selectedService === card.id ? styles.checkboxActive : ''
                  }`}
                />
                <div className={styles.cardBody}>
                  {card.label && (
                    <span className={styles.cardLabel}>{card.label}</span>
                  )}
                  {card.warnings && (
                    <div className={styles.cardWarnings}>
                      {card.warnings.map((w, i) => (
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
            ))}
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
                value={cidadao?.bi || '009593845LA044'}
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
                    type="text"
                    className={styles.formInput}
                    placeholder="Data"
                    value={date1}
                    onFocus={(e) => (e.target.type = 'date')}
                    onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                    onChange={(e) => setDate1(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className={styles.dateColumn}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>2ª Opção</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Data (Opcional)"
                    value={date2}
                    onFocus={(e) => (e.target.type = 'date')}
                    onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                    onChange={(e) => setDate2(e.target.value)}
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
