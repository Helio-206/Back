import { Outlet } from 'react-router-dom';
import styles from './AuthLayout.module.css';

export default function AuthLayout() {
  return (
    <div className={styles.authLayout}>
      <div className={styles.authLogo}>
        <img src="/assets/emblema-angola.png" alt="Emblema de Angola" />
      </div>

      <Outlet />

      <footer className={styles.footer}>
        <p>
          2026 @Bureau Político do Itel - <span className={styles.footerBrand}>BPI.</span>
        </p>
        <div className={styles.footerLinks}>
          <a href="#">Política de Privacidade</a>
          <span>Termos de serviço</span>
          <span>Português - Portugal</span>
        </div>
      </footer>
    </div>
  );
}
