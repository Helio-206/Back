import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, EyeOff, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail, validatePassword } from '../../utils/validators';
import styles from '../../layouts/AuthLayout.module.css';

interface FieldErrors {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateField = (field: 'email' | 'password', value: string) => {
    const errors = { ...fieldErrors };

    if (field === 'email') {
      const validation = validateEmail(value);
      errors.email = validation.valid ? '' : validation.message || '';
    }

    if (field === 'password' && touched.password) {
      const validation = validatePassword(value);
      errors.password = validation.valid ? '' : validation.message || '';
    }

    setFieldErrors(errors);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    validateField('email', value);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (touched.password) {
      validateField('password', value);
    }
  };

  const handlePasswordBlur = () => {
    setTouched({ ...touched, password: true });
    validateField('password', password);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    const errors: FieldErrors = {
      email: emailValidation.valid ? '' : emailValidation.message || '',
      password: passwordValidation.valid ? '' : passwordValidation.message || '',
    };

    setFieldErrors(errors);

    if (errors.email || errors.password) {
      return;
    }

    setLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard/perfil');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Credenciais inválidas. Tente novamente.');
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
          <label className={styles.formLabel}>Email</label>
          <div className={styles.inputWrapper}>
            <User size={18} className={styles.inputIcon} />
            <input
              type="email"
              className={`${styles.inputField} ${fieldErrors.email ? styles.inputError : ''}`}
              placeholder="seu.email@gov.ao"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              onBlur={() => setTouched({ ...touched, email: true })}
              autoComplete="email"
            />
          </div>
          {fieldErrors.email && touched.email && (
            <span className={styles.fieldError}>{fieldErrors.email}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>Senha</label>
          <div className={styles.inputWrapper}>
            <Lock size={18} className={styles.inputIcon} />
            <input
              type={showPassword ? 'text' : 'password'}
              className={`${styles.inputField} ${fieldErrors.password ? styles.inputError : ''}`}
              placeholder="Mínimo 8 caracteres"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              onBlur={handlePasswordBlur}
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
          {fieldErrors.password && touched.password && (
            <span className={styles.fieldError}>{fieldErrors.password}</span>
          )}
          <div className={styles.forgotRow}>
            Esquecido <Link to="#" className={styles.forgotLink}>senha</Link>?
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
            Lembre-se de mim
          </label>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading || !!fieldErrors.email || !!fieldErrors.password}>
          {loading ? 'A entrar...' : 'Entrar'}
        </button>
      </form>

      <p className={styles.registerLink}>
        Não tem conta? <Link to="/register">Registrar?</Link>
      </p>
    </div>
  );
}
