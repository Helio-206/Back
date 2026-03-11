import { useState, useEffect, useMemo } from 'react';
import type { FormEvent } from 'react';
import { adminService } from '../../../services/admin.service';
import type { AdminUser } from '../../../services/admin.service';
import AdminDetailModal from '../../../components/AdminDetailModal';
import type { DetailField } from '../../../components/AdminDetailModal';
import styles from './GestaoUtilizadores.module.css';

const ROLE_TABS = [
  { key: 'TODOS', label: 'Todos' },
  { key: 'ADMIN', label: 'Administradores' },
  { key: 'CENTER', label: 'Centros' },
  { key: 'CITIZEN', label: 'Cidadãos' },
];

export default function GestaoUtilizadoresPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [roleFilter, setRoleFilter] = useState('TODOS');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let result = users;
    if (roleFilter !== 'TODOS') {
      result = result.filter((u) => u.role === roleFilter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((u) =>
        `${u.nome} ${u.sobrenome}`.toLowerCase().includes(term) ||
        u.bi.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.id.includes(term)
      );
    }
    return result;
  }, [users, roleFilter, searchTerm]);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    // filtering is done reactively via useMemo
  };

  const handleClear = () => { setSearchTerm(''); };

  const handleViewUser = async (user: AdminUser) => {
    try {
      const detail = await adminService.getUserById(user.id);
      setSelectedUser(detail || user);
    } catch {
      setSelectedUser(user);
    }
  };

  const handleDeactivate = async (user: AdminUser) => {
    if (!confirm(`Desactivar utilizador ${user.nome} ${user.sobrenome}?`)) return;
    try {
      await adminService.deactivateUser(user.id);
      await loadUsers();
    } catch { /* ignore */ }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('pt-AO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const roleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Administrador';
      case 'CENTER': return 'Centro';
      case 'CITIZEN': return 'Cidadão';
      default: return role;
    }
  };

  const userDetailFields = (u: AdminUser): DetailField[] => [
    { label: 'ID', value: u.id },
    { label: 'Nome Completo', value: `${u.nome} ${u.sobrenome}`.trim() },
    { label: 'Email', value: u.email },
    { label: 'Nº BI', value: u.bi },
    { label: 'Data de Nascimento', value: formatDate(u.dataNascimento) },
    { label: 'Sexo', value: u.sexo === 'M' ? 'Masculino' : u.sexo === 'F' ? 'Feminino' : u.sexo || '—' },
    { label: 'Província', value: u.provincia },
    { label: 'Município', value: u.municipio },
    { label: 'Bairro', value: u.bairro },
    { label: 'Função', value: roleLabel(u.role) },
    { label: 'Registado em', value: formatDate(u.createdAt) },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.titleRow}>
        <h2 className={styles.pageTitle}>Gestão de Utilizadores</h2>
        <span className={styles.badge}>Listagem</span>
      </div>

      {/* Role Filter Tabs */}
      <div className={styles.roleTabs}>
        {ROLE_TABS.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.roleTab} ${roleFilter === tab.key ? styles.roleTabActive : ''}`}
            onClick={() => setRoleFilter(tab.key)}
          >
            {tab.label}
            <span className={styles.roleCount}>
              {tab.key === 'TODOS'
                ? users.length
                : users.filter((u) => u.role === tab.key).length}
            </span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSearch} className={styles.searchRow}>
        <div className={styles.searchWrapper}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Pesquisar Utilizador (ID, BI, Nome Usuário, Email)"
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
          <p className={styles.statsLabel}>Utilizadores</p>
          <p className={styles.statsCount}>{filtered.length}</p>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>BI</th>
                <th>Usuário</th>
                <th>Email</th>
                <th>Função</th>
                <th>Acções</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className={styles.emptyCell}>A carregar...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className={styles.emptyCell}>Nenhum utilizador encontrado.</td></tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id.length > 4 ? u.id.slice(-4) : u.id.padStart(4, '0')}</td>
                    <td className={styles.monoCell}>{u.bi}</td>
                    <td>{`${u.nome} ${u.sobrenome}`.trim()}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={styles.roleBadge}>{roleLabel(u.role)}</span>
                    </td>
                    <td className={styles.actionCell}>
                      <button className={styles.detailsBtn} onClick={() => handleViewUser(u)}>
                        Ver
                      </button>
                      <button className={styles.deactivateBtn} onClick={() => handleDeactivate(u)}>
                        Desactivar
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

      {selectedUser && (
        <AdminDetailModal
          title="Detalhes do Utilizador"
          fields={userDetailFields(selectedUser)}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
