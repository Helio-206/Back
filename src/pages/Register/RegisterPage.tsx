import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, EyeOff, Eye, KeyRound, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../layouts/AuthLayout.module.css';

export default function RegisterPage() {
  const [bi, setBi] = useState('');
  const [semBI, setSemBI] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({
        email,
        password,
        cidadao: {
          nome: '',
          sobrenome: '',
          bi: semBI ? undefined : bi,
        },
      });
      navigate('/dashboard/perfil');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao registrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authCard}>
      <h1 className={styles.authTitle}>Registrar</h1>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>BI</label>
          <div className={styles.inputWrapper}>
            <User size={18} className={styles.inputIcon} />
            <input
              type="text"
              className={styles.inputField}
              placeholder="Digite o Nº do Bi"
              value={bi}
              onChange={(e) => setBi(e.target.value)}
              disabled={semBI}
              required={!semBI}
            />
          </div>
          <div className={styles.inlineCheckbox}>
            <span>Sem BI (Primeira vez)</span>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={semBI}
              onChange={(e) => {
                setSemBI(e.target.checked);
                if (e.target.checked) setBi('');
              }}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Email</label>
          <div className={styles.inputWrapper}>
            <Mail size={18} className={styles.inputIcon} />
            <input
              type="email"
              className={styles.inputField}
              placeholder="Digite o seu E-mail"
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
              autoComplete="new-password"
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
          <p className={styles.warningText}>*Não compartilhe a sua senha*</p>
        </div>

        <div className={styles.checkboxRow}>
          <input
            type="checkbox"
            id="rememberRegister"
            className={styles.checkbox}
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="rememberRegister" className={styles.checkboxLabel}>
            Lembre-se de mim neste computador
          </label>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'A registrar...' : 'Registrar'}
        </button>
      </form>

      <div className={styles.divider}>
        <span className={styles.dividerLine} />
        <span className={styles.dividerText}>OU</span>
        <span className={styles.dividerLine} />
      </div>

      <Link to="/login">
        <button type="button" className={styles.altBtn}>
          <KeyRound size={18} className={styles.altBtnIcon} />
          Acessar a sua conta
        </button>
      </Link>
    </div>
  );
}
