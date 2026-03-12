import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { User, LogOut, CalendarPlus, ClipboardList, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NotificationPanel from '../components/NotificationPanel';
import styles from './DashboardLayout.module.css';

const navItems = [
  { label: 'Perfil Cidadão', path: '/dashboard/perfil', icon: User },
  { label: 'Agendar', path: '/dashboard/agendar', icon: CalendarPlus },
  { label: 'Estado', path: '/dashboard/estado', icon: ClipboardList },
  { label: 'Atualização', path: '/dashboard/atualizacao', icon: RefreshCw },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const citizenName = user?.cidadao
    ? `${user.cidadao.nome} ${user.cidadao.sobrenome}`
    : user?.email || 'Cidadão';

  const avatarLetter = citizenName.trim().charAt(0).toUpperCase() || 'C';

  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
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

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Header bar */}
        <div className={styles.headerBar}>
          <span className={styles.headerLine} />
          <h1 className={styles.headerTitle}>Painel do Cidadão</h1>
          <span className={styles.headerLine} />

          <NotificationPanel accentColor="#C41E24" />

          <div className={styles.userBadge}>
            <div className={styles.userAvatar}>
              <span className={styles.avatarLetter}>{avatarLetter}</span>
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userRole}>Cidadão</span>
              <span className={styles.userName}>{citizenName}</span>
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
