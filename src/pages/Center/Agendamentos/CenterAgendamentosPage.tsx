import { useEffect, useState } from 'react';
import { centerService } from '../../../services/center.service';
import type { CenterSchedule, EstadoAgendamento } from '../../../services/center.service';
import styles from './CenterAgendamentos.module.css';

const STATUS_FLOW: Record<string, string[]> = {
  AGENDADO: ['CONFIRMADO', 'REJEITADO'],
  CONFIRMADO: ['CONCLUIDO', 'CANCELADO'],
  CONCLUIDO: [],
  REJEITADO: [],
  CANCELADO: [],
};

const STATUS_ACTION_LABELS: Record<string, string> = {
  CONFIRMADO: 'Aceitar',
  CONCLUIDO: 'Concluir Atendimento',
  CANCELADO: 'Cancelar',
  REJEITADO: 'Rejeitar',
};

const NEEDS_JUSTIFICATION = new Set(['REJEITADO', 'CANCELADO']);

interface PendingAction {
  scheduleId: string;
  newStatusCode: string;
}

export default function CenterAgendamentosPage() {
  const [schedules, setSchedules] = useState<CenterSchedule[]>([]);
  const [estados, setEstados] = useState<EstadoAgendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Modal state
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [justification, setJustification] = useState('');
  const [justError, setJustError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [centerData, estadosData] = await Promise.all([
        centerService.getMyCenter(),
        centerService.getEstadosAgendamento(),
      ]);
      setEstados(estadosData);
      const schedulesData = await centerService.getCenterSchedules(centerData.id);
      setSchedules(schedulesData);
    } catch {
      setError('Erro ao carregar agendamentos.');
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (scheduleId: string, newStatusCode: string) => {
    if (NEEDS_JUSTIFICATION.has(newStatusCode)) {
      setPendingAction({ scheduleId, newStatusCode });
      setJustification('');
      setJustError('');
    } else {
      const estadoTarget = estados.find((e) => e.status === newStatusCode);
      if (!estadoTarget) return;
      const label = STATUS_ACTION_LABELS[newStatusCode] || newStatusCode;
      if (!confirm(`Deseja ${label.toLowerCase()} este agendamento?`)) return;
      executeStatusChange(scheduleId, estadoTarget.id, undefined);
    }
  };

  const handleModalConfirm = async () => {
    if (!pendingAction) return;
    if (!justification.trim()) {
      setJustError('A justificação é obrigatória.');
      return;
    }
    const estadoTarget = estados.find((e) => e.status === pendingAction.newStatusCode);
    if (!estadoTarget) return;
    setPendingAction(null);
    executeStatusChange(pendingAction.scheduleId, estadoTarget.id, justification.trim());
  };

  const executeStatusChange = async (
    scheduleId: string,
    estadoAgendamentoId: string,
    notes: string | undefined,
  ) => {
    setUpdatingId(scheduleId);
    try {
      await centerService.updateScheduleStatus(scheduleId, estadoAgendamentoId, notes);
      const estado = estados.find((e) => e.id === estadoAgendamentoId);
      setSuccessMsg(`Agendamento actualizado para "${estado?.descricao || ''}".`);
      await loadData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao actualizar estado.';
      setError(msg);
      setTimeout(() => setError(''), 3000);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const filteredSchedules =
    filterStatus === 'TODOS'
      ? schedules
      : schedules.filter((s) => s.estadoAgendamento?.status === filterStatus);

  const uniqueStatuses = [...new Set(schedules.map((s) => s.estadoAgendamento?.status).filter(Boolean))];

  if (loading) {
    return <div className={styles.loading}>A carregar...</div>;
  }

  const pendingStatusLabel = pendingAction
    ? STATUS_ACTION_LABELS[pendingAction.newStatusCode] || pendingAction.newStatusCode
    : '';

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2 className={styles.pageTitle}>Gestão de Agendamentos</h2>
        <span className={styles.scheduleCount}>{filteredSchedules.length} agendamentos</span>
      </div>

      {successMsg && <div className={styles.successMsg}>{successMsg}</div>}
      {error && <div className={styles.errorMsg}>{error}</div>}

      {/* Filters */}
      <div className={styles.filterBar}>
        <button
          className={`${styles.filterBtn} ${filterStatus === 'TODOS' ? styles.filterActive : ''}`}
          onClick={() => setFilterStatus('TODOS')}
        >
          Todos
        </button>
        {uniqueStatuses.map((status) => (
          <button
            key={status}
            className={`${styles.filterBtn} ${filterStatus === status ? styles.filterActive : ''}`}
            onClick={() => setFilterStatus(status!)}
          >
            {estados.find((e) => e.status === status)?.descricao || status}
          </button>
        ))}
      </div>

      {/* Schedule Cards */}
      {filteredSchedules.length === 0 ? (
        <div className={styles.emptyState}>Nenhum agendamento encontrado.</div>
      ) : (
        <div className={styles.scheduleList}>
          {filteredSchedules.map((schedule) => {
            const currentStatus = schedule.estadoAgendamento?.status || '';
            const nextActions = STATUS_FLOW[currentStatus] || [];
            const citizenName = schedule.user?.cidadao
              ? `${schedule.user.cidadao.nome} ${schedule.user.cidadao.sobrenome}`
              : schedule.user?.email || '—';

            return (
              <div key={schedule.id} className={styles.scheduleCard}>
                <div className={styles.cardMain}>
                  <div className={styles.cardHeader}>
                    <span className={styles.citizenName}>{citizenName}</span>
                    <span className={styles[`status${currentStatus}`] || styles.statusDefault}>
                      {schedule.estadoAgendamento?.descricao || '—'}
                    </span>
                  </div>

                  <div className={styles.cardDetails}>
                    <span>
                      <strong>BI:</strong>{' '}
                      {schedule.user?.cidadao?.numeroBIAnterior || '—'}
                    </span>
                    <span>
                      <strong>Data:</strong> {formatDate(schedule.scheduledDate)}
                    </span>
                    <span>
                      <strong>Serviço:</strong>{' '}
                      {schedule.tipoServico?.descricao || '—'}
                    </span>
                    {schedule.user?.cidadao?.sexo && (
                      <span>
                        <strong>Sexo:</strong> {schedule.user.cidadao.sexo}
                      </span>
                    )}
                    {schedule.notes && (
                      <span className={styles.notesRow}>
                        <strong>Nota:</strong> {schedule.notes}
                      </span>
                    )}
                  </div>
                </div>

                {nextActions.length > 0 && (
                  <div className={styles.cardActions}>
                    {nextActions.map((nextStatus) => (
                      <button
                        key={nextStatus}
                        className={`${styles.actionBtn} ${
                          nextStatus === 'CANCELADO' || nextStatus === 'REJEITADO'
                            ? styles.actionDanger
                            : styles.actionPrimary
                        }`}
                        disabled={updatingId === schedule.id}
                        onClick={() => handleActionClick(schedule.id, nextStatus)}
                      >
                        {updatingId === schedule.id
                          ? '...'
                          : STATUS_ACTION_LABELS[nextStatus] || nextStatus}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Justification Modal */}
      {pendingAction && (
        <div className={styles.modalOverlay} onClick={() => setPendingAction(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              {pendingStatusLabel} agendamento
            </h3>
            <p className={styles.modalSubtitle}>
              Para {pendingStatusLabel.toLowerCase()} este agendamento é necessário indicar uma justificação.
            </p>
            <label className={styles.modalLabel}>
              Justificação <span className={styles.required}>*</span>
            </label>
            <textarea
              className={`${styles.modalTextarea} ${justError ? styles.modalTextareaError : ''}`}
              placeholder="Descreva o motivo..."
              rows={4}
              value={justification}
              onChange={(e) => {
                setJustification(e.target.value);
                if (e.target.value.trim()) setJustError('');
              }}
              autoFocus
            />
            {justError && <span className={styles.modalError}>{justError}</span>}
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setPendingAction(null)}>
                Cancelar
              </button>
              <button className={styles.modalConfirm} onClick={handleModalConfirm}>
                Confirmar {pendingStatusLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

