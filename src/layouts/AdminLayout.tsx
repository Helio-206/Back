import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Settings, MapPin, Users, FileText, LogOut, UserCog, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import styles from './AdminLayout.module.css';

const navItems = [
  { label: 'Painel', path: '/addadd', icon: LayoutDashboard },
  { label: 'Estatística', path: '/addadd/estatistica', icon: BarChart3 },
  { label: 'Gestão de Serviços', path: '/addadd/servicos', icon: Settings },
  { label: 'Gestão de Centros', path: '/addadd/centros', icon: MapPin },
  { label: 'Gestão de Utilizadores', path: '/addadd/utilizadores', icon: Users },
  { label: 'Logs de Actividade', path: '/addadd/logs', icon: Activity },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminName = user?.cidadao
    ? `${user.cidadao.nome} ${user.cidadao.sobrenome}`
    : user?.name || user?.email || 'Administrador';

  const avatarLetter = adminName.trim().charAt(0).toUpperCase() || 'A';

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <img src="/assets/emblema-angola.png" alt="Emblema de Angola" />
        </div>
        <p className={styles.sidebarBrand}>
          Sistema de<br />
          Agendamento<br />
          Regularização do BI
        </p>

        <nav className={styles.sidebarNav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/addadd'}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
                }
              >
                <Icon size={15} strokeWidth={1.8} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <NavLink
            to="/addadd/perfil"
            className={({ isActive }) =>
              `${styles.reportBtn} ${isActive ? styles.reportBtnActive : ''}`
            }
          >
            <UserCog size={15} strokeWidth={1.8} />
            Meu Perfil
          </NavLink>

          <NavLink
            to="/addadd/relatorio"
            className={({ isActive }) =>
              `${styles.reportBtn} ${isActive ? styles.reportBtnActive : ''}`
            }
          >
            <FileText size={15} strokeWidth={1.8} />
            Relatórios
          </NavLink>

          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={17} strokeWidth={2} />
            Logout
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.headerBar}>
          <span className={styles.headerLine} />
          <h1 className={styles.headerTitle}>Painel Administrativo</h1>
          <span className={styles.headerLine} />

          <div className={styles.adminBadge}>
            <NavLink to="/addadd/perfil" className={styles.adminBadgeLink}>
              <div className={styles.adminAvatar}>
                <span className={styles.avatarLetter}>{avatarLetter}</span>
                <span className={styles.avatarNotif}>4</span>
              </div>
              <div className={styles.adminInfo}>
                <span className={styles.adminRole}>Admin</span>
                <span className={styles.adminName}>{adminName}</span>
              </div>
            </NavLink>
          </div>
        </div>
        <div className={styles.mainBody}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
