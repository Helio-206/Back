import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { adminService } from '../../../services/admin.service';
import type { AdminCenter, CreateCenterPayload } from '../../../services/admin.service';
import AdminDetailModal from '../../../components/AdminDetailModal';
import type { DetailField } from '../../../components/AdminDetailModal';
import styles from './GestaoCentros.module.css';

const PROVINCIAS = [
  'BENGO','BENGUELA','BIE','CABINDA','CUANDO_CUBANGO','CUANZA_NORTE','CUANZA_SUL',
  'CUNENE','HUAMBO','HUILA','LUANDA','LUNDA_NORTE','LUNDA_SUL','MALANJE','MOXICO',
  'NAMIBE','UIGE','ZAIRE','ICOLO_E_BENGO','MUXICO_LESTE','CASSAI_ZAMBEZE',
];
const CENTER_TYPES = ['HEALTH','ADMINISTRATIVE','EDUCATION','SECURITY','OTHER'];

const emptyForm: CreateCenterPayload = {
  name: '', type: 'ADMINISTRATIVE', address: '', provincia: 'LUANDA',
  description: '', phone: '', email: '', openingTime: '08:00', closingTime: '17:00',
  attendanceDays: 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY', capacidadeAgentos: 5, userPassword: '',
};

export default function GestaoCentrosPage() {
  const [centros, setCentros] = useState<AdminCenter[]>([]);
  const [filtered, setFiltered] = useState<AdminCenter[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCenter, setSelectedCenter] = useState<AdminCenter | null>(null);

  // CRUD state
  const [showForm, setShowForm] = useState(false);
  const [editingCenter, setEditingCenter] = useState<AdminCenter | null>(null);
  const [form, setForm] = useState<CreateCenterPayload>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => { loadCentros(); }, []);

  const loadCentros = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllCenters();
      setCentros(data);
      setFiltered(data);
      setTotalCount(data.length);
    } catch {
      setCentros([]);
      setFiltered([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) { setFiltered(centros); return; }
    const term = searchTerm.toLowerCase();
    setFiltered(centros.filter((c) =>
      c.name.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      c.id.includes(term)
    ));
  };

  const handleClear = () => { setSearchTerm(''); setFiltered(centros); };

  const openCreate = () => {
    setEditingCenter(null);
    setForm({ ...emptyForm });
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (c: AdminCenter) => {
    setEditingCenter(c);
    setForm({
      name: c.name,
      type: c.type || 'ADMINISTRATIVE',
      address: c.address,
      provincia: c.province || 'LUANDA',
      description: c.description || '',
      phone: c.phone || '',
      email: c.email || '',
      userPassword: '',
      openingTime: c.openTime || '08:00',
      closingTime: c.closeTime || '17:00',
      attendanceDays: c.attendanceDays || 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY',
      capacidadeAgentos: c.capacidade || 5,
    });
    setFormError('');
    setShowForm(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.address) {
      setFormError('Nome e Endereço são obrigatórios.');
      return;
    }

    if (!editingCenter) {
      if (!form.email) {
        setFormError('Email do utilizador do centro é obrigatório.');
        return;
      }

      if (!form.userPassword || form.userPassword.length < 8) {
        setFormError('Senha do utilizador do centro deve ter no mínimo 8 caracteres.');
        return;
      }
    }

    setSaving(true);
    setFormError('');
    try {
      if (editingCenter) {
        await adminService.updateCenter(editingCenter.id, form);
      } else {
        await adminService.createCenter(form);
      }
      setShowForm(false);
      await loadCentros();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setFormError(msg || 'Erro ao salvar centro.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (c: AdminCenter) => {
    try {
      if (c.active) {
        await adminService.deactivateCenter(c.id);
      } else {
        await adminService.reactivateCenter(c.id);
      }
      await loadCentros();
    } catch {
      /* ignore */
    }
  };

  const centerDetailFields = (c: AdminCenter): DetailField[] => [
    { label: 'ID', value: c.id },
    { label: 'Nome', value: c.name },
    { label: 'Tipo', value: c.type || '—' },
    { label: 'Província', value: c.province },
    { label: 'Endereço', value: c.address },
    { label: 'Email', value: c.email },
    { label: 'Telefone', value: c.phone || '—' },
    { label: 'Horário de Abertura', value: c.openTime },
    { label: 'Horário de Fecho', value: c.closeTime },
    { label: 'Capacidade', value: String(c.capacidade || '—') },
    { label: 'Estado', value: c.active ? 'Activo' : 'Inactivo' },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.titleRow}>
        <h2 className={styles.pageTitle}>Gestão de Centros</h2>
        <span className={styles.badge}>Listagem</span>
        <button className={styles.createBtn} onClick={openCreate}>+ Novo Centro</button>
      </div>

      <form onSubmit={handleSearch} className={styles.searchRow}>
        <div className={styles.searchWrapper}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Pesquisar Centro (ID, Nome Centro)"
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
          <p className={styles.statsLabel}>Centros</p>
          <p className={styles.statsCount}>{totalCount}</p>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome Centro</th>
                <th>Correio</th>
                <th>Localização</th>
                <th>Estado</th>
                <th>Acções</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className={styles.emptyCell}>A carregar...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className={styles.emptyCell}>Nenhum centro encontrado.</td></tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id}>
                    <td>{c.id.length > 4 ? c.id.slice(-4) : c.id.padStart(4, '0')}</td>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.address || `${c.province}`}</td>
                    <td>
                      <span className={c.active ? styles.statusActive : styles.statusInactive}>
                        {c.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className={styles.actionCell}>
                      <button className={styles.detailsBtn} onClick={() => setSelectedCenter(c)}>
                        Ver
                      </button>
                      <button className={styles.editBtn} onClick={() => openEdit(c)}>
                        Editar
                      </button>
                      <button
                        className={c.active ? styles.deactivateBtn : styles.activateBtn}
                        onClick={() => handleToggleActive(c)}
                      >
                        {c.active ? 'Desactivar' : 'Activar'}
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

      {/* Detail Modal */}
      {selectedCenter && (
        <AdminDetailModal
          title="Detalhes do Centro"
          fields={centerDetailFields(selectedCenter)}
          onClose={() => setSelectedCenter(null)}
        />
      )}

      {/* Create/Edit Modal */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={() => setShowForm(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              {editingCenter ? 'Editar Centro' : 'Novo Centro'}
            </h3>
            {formError && <p className={styles.formError}>{formError}</p>}
            <form onSubmit={handleSave} className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Nome *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className={styles.formGroup}>
                <label>Tipo *</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {CENTER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Endereço *</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
              </div>
              <div className={styles.formGroup}>
                <label>Província *</label>
                <select value={form.provincia} onChange={(e) => setForm({ ...form, provincia: e.target.value })}>
                  {PROVINCIAS.map((p) => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Descrição</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className={styles.formGroup}>
                <label>Telefone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9XXXXXXXX" />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              {!editingCenter && (
                <div className={styles.formGroup}>
                  <label>Senha do Utilizador *</label>
                  <input
                    type="password"
                    value={form.userPassword || ''}
                    onChange={(e) => setForm({ ...form, userPassword: e.target.value })}
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>
              )}
              <div className={styles.formGroup}>
                <label>Abertura</label>
                <input value={form.openingTime} onChange={(e) => setForm({ ...form, openingTime: e.target.value })} placeholder="08:00" />
              </div>
              <div className={styles.formGroup}>
                <label>Fecho</label>
                <input value={form.closingTime} onChange={(e) => setForm({ ...form, closingTime: e.target.value })} placeholder="17:00" />
              </div>
              <div className={styles.formGroup}>
                <label>Capacidade</label>
                <input type="number" min={1} max={100} value={form.capacidadeAgentos} onChange={(e) => setForm({ ...form, capacidadeAgentos: Number(e.target.value) })} />
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
