import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './DashboardLayout.module.css';

const navItems = [
  { label: 'Perfil Cidadão', path: '/dashboard/perfil' },
  { label: 'Agendar', path: '/dashboard/agendar' },
  { label: 'Estado', path: '/dashboard/estado' },
  { label: 'Atualização', path: '/dashboard/atualizacao' },
];

export default function DashboardLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
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
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}
