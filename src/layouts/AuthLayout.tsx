import { Outlet, Link } from 'react-router-dom';
import styles from './AuthLayout.module.css';
import ParticlesBackground from '../components/ParticlesBackground';

export default function AuthLayout() {
  return (
    <div className={styles.authLayout}>
      <ParticlesBackground />
      <div className={styles.authLogo}>
        <img src="/assets/emblema-angola.png" alt="Emblema de Angola" />
      </div>

      <Outlet />

      <footer className={styles.footer}>
        <p>
          2026 @Bureau Político do Itel - <span className={styles.footerBrand}>BPI.</span>
        </p>
        <div className={styles.footerLinks}>
          <Link to="/politica-de-privacidade">Política de Privacidade</Link>
          <span>Termos de serviço</span>
          <span>Português - Portugal</span>
        </div>
      </footer>
    </div>
  );
}
