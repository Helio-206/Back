import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarCheck, LogOut, Building2, BarChart3, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import styles from './CenterLayout.module.css';

const navItems = [
  { label: 'Painel', path: '/centro', icon: LayoutDashboard },
  { label: 'Agendamentos', path: '/centro/agendamentos', icon: CalendarCheck },
  { label: 'Estatísticas', path: '/centro/estatisticas', icon: BarChart3 },
  { label: 'Relatórios', path: '/centro/relatorios', icon: FileText },
];

export default function CenterLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const centerName = user?.cidadao
    ? `${user.cidadao.nome} ${user.cidadao.sobrenome}`
    : user?.email || 'Gestor';

  const avatarLetter = centerName.trim().charAt(0).toUpperCase() || 'C';

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <img src="/assets/emblema-angola.png" alt="Emblema de Angola" />
        </div>
        <p className={styles.sidebarBrand}>
          RegulaFácil
        </p>

        <nav className={styles.sidebarNav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/centro'}
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
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={17} strokeWidth={2} />
            Logout
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.headerBar}>
          <span className={styles.headerLine} />
          <h1 className={styles.headerTitle}>Gestão do Centro</h1>
          <span className={styles.headerLine} />

          <div className={styles.adminBadge}>
            <div className={styles.adminAvatar}>
              <Building2 size={16} />
              <span className={styles.avatarLetter}>{avatarLetter}</span>
            </div>
            <div className={styles.adminInfo}>
              <span className={styles.adminRole}>Gestor</span>
              <span className={styles.adminName}>{centerName}</span>
            </div>
          </div>
        </div>
        <div className={styles.mainBody}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
