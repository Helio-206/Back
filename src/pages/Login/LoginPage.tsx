import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, EyeOff, Eye, KeyRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../layouts/AuthLayout.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard/perfil');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciais inválidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authCard}>
      <h1 className={styles.authTitle}>Entrar</h1>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>email.username</label>
          <div className={styles.inputWrapper}>
            <User size={18} className={styles.inputIcon} />
            <input
              type="text"
              className={styles.inputField}
              placeholder="Entre com o seu nome de usuário"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Senha</label>
          <div className={styles.inputWrapper}>
            <Lock size={18} className={styles.inputIcon} />
            <input
              type={showPassword ? 'text' : 'password'}
              className={styles.inputField}
              placeholder="Coloque a senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className={styles.togglePasswordBtn}
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
          <div className={styles.forgotRow}>
            Esquecido <Link to="#" className={styles.forgotLink}>senha</Link> ?
          </div>
        </div>

        <div className={styles.checkboxRow}>
          <input
            type="checkbox"
            id="rememberLogin"
            className={styles.checkbox}
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="rememberLogin" className={styles.checkboxLabel}>
            Lembre-se de mim neste computador
          </label>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'A entrar...' : 'Entrar'}
        </button>
      </form>

      <div className={styles.divider}>
        <span className={styles.dividerLine} />
        <span className={styles.dividerText}>OU</span>
        <span className={styles.dividerLine} />
      </div>

      <Link to="/register">
        <button type="button" className={styles.altBtn}>
          <KeyRound size={18} className={styles.altBtnIcon} />
          Entrar com admin.gov
        </button>
      </Link>
    </div>
  );
}
