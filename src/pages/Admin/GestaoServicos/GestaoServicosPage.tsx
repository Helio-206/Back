import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { adminService } from '../../../services/admin.service';
import type { AdminTipoServico } from '../../../services/admin.service';
import styles from './GestaoServicos.module.css';

export default function GestaoServicosPage() {
  const [servicos, setServicos] = useState<AdminTipoServico[]>([]);
  const [filtered, setFiltered] = useState<AdminTipoServico[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // CRUD state
  const [showForm, setShowForm] = useState(false);
  const [editingServico, setEditingServico] = useState<AdminTipoServico | null>(null);
  const [descricao, setDescricao] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => { loadServicos(); }, []);

  const loadServicos = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllTiposServico();
      setServicos(data);
      setFiltered(data);
      setTotalCount(data.length);
    } catch {
      setServicos([]);
      setFiltered([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) { setFiltered(servicos); return; }
    const term = searchTerm.toLowerCase();
    setFiltered(servicos.filter((s) =>
      s.descricao.toLowerCase().includes(term) || s.id.includes(term)
    ));
  };

  const handleClear = () => { setSearchTerm(''); setFiltered(servicos); };

  const openCreate = () => {
    setEditingServico(null);
    setDescricao('');
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (s: AdminTipoServico) => {
    setEditingServico(s);
    setDescricao(s.descricao);
    setFormError('');
    setShowForm(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!descricao.trim()) { setFormError('Descrição é obrigatória.'); return; }
    setSaving(true);
    setFormError('');
    try {
      if (editingServico) {
        await adminService.updateTipoServico(editingServico.id, descricao.trim());
      } else {
        await adminService.createTipoServico(descricao.trim());
      }
      setShowForm(false);
      await loadServicos();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(msg || 'Erro ao salvar serviço.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (s: AdminTipoServico) => {
    try {
      await adminService.toggleTipoServico(s.id);
      await loadServicos();
    } catch { /* ignore */ }
  };

  return (
    <div className={styles.page}>
      <div className={styles.titleRow}>
        <h2 className={styles.pageTitle}>Gestão de Serviços</h2>
        <span className={styles.badge}>Listagem</span>
        <button className={styles.createBtn} onClick={openCreate}>+ Novo Serviço</button>
      </div>

      <form onSubmit={handleSearch} className={styles.searchRow}>
        <div className={styles.searchWrapper}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Pesquisar Serviço (ID, Descrição)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button type="button" className={styles.clearBtn} onClick={handleClear}>×</button>
          )}
        </div>
        <button type="submit" className={styles.searchBtn}>Pesquisar</button>
      </form>

      <div className={styles.outerCard}>
        <div className={styles.statsHeader}>
          <p className={styles.statsLabel}>Serviços</p>
          <p className={styles.statsCount}>{totalCount}</p>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Descrição</th>
                <th>Status</th>
                <th>Acções</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className={styles.emptyCell}>A carregar...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className={styles.emptyCell}>Nenhum serviço encontrado.</td></tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id.length > 6 ? s.id.slice(-4) : s.id}</td>
                    <td>{s.descricao}</td>
                    <td>
                      <span className={s.active ? styles.statusActive : styles.statusInactive}>
                        {s.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className={styles.actionCell}>
                      <button className={styles.editBtn} onClick={() => openEdit(s)}>
                        Editar
                      </button>
                      <button
                        className={s.active ? styles.deactivateBtn : styles.activateBtn}
                        onClick={() => handleToggle(s)}
                      >
                        {s.active ? 'Desactivar' : 'Activar'}
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

      {/* Create/Edit Modal */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              {editingServico ? 'Editar Serviço' : 'Novo Serviço'}
            </h3>
            {formError && <p className={styles.formError}>{formError}</p>}
            <form onSubmit={handleSave} className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Descrição *</label>
                <input
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Renovação, 2ª Via..."
                  required
                />
              </div>
              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? 'A guardar...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
