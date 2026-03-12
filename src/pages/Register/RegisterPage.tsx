import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, EyeOff, Eye, KeyRound, Mail, Scan, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import BIScanner from '../../components/BIScanner';
import type { BIData } from '../../components/BIScanner';
import styles from '../../layouts/AuthLayout.module.css';

const PROVINCIAS = [
  'Luanda', 'Benguela', 'Huíla', 'Huambo', 'Cabinda', 'Kwanza Sul',
  'Kwanza Norte', 'Malanje', 'Moxico', 'Namibe', 'Uíge', 'Zaire',
  'Bié', 'Cunene', 'Lunda Norte', 'Lunda Sul', 'Bengo', 'Cuando Cubango'
];

const PROVINCIA_TO_ENUM: Record<string, 'BENGO' | 'BENGUELA' | 'BIE' | 'CABINDA' | 'CUANDO_CUBANGO' | 'CUANZA_NORTE' | 'CUANZA_SUL' | 'CUNENE' | 'HUAMBO' | 'HUILA' | 'LUANDA' | 'LUNDA_NORTE' | 'LUNDA_SUL' | 'MALANJE' | 'MOXICO' | 'NAMIBE' | 'UIGE' | 'ZAIRE' | 'ICOLO_E_BENGO' | 'MUXICO_LESTE' | 'CASSAI_ZAMBEZE'> = {
  Luanda: 'LUANDA',
  Benguela: 'BENGUELA',
  Huíla: 'HUILA',
  Huambo: 'HUAMBO',
  Cabinda: 'CABINDA',
  'Kwanza Sul': 'CUANZA_SUL',
  'Kwanza Norte': 'CUANZA_NORTE',
  Malanje: 'MALANJE',
  Moxico: 'MOXICO',
  Namibe: 'NAMIBE',
  Uíge: 'UIGE',
  Zaire: 'ZAIRE',
  Bié: 'BIE',
  Cunene: 'CUNENE',
  'Lunda Norte': 'LUNDA_NORTE',
  'Lunda Sul': 'LUNDA_SUL',
  Bengo: 'BENGO',
  'Cuando Cubango': 'CUANDO_CUBANGO',
};

export default function RegisterPage() {
  const [bi, setBi] = useState('');
  const [semBI, setSemBI] = useState(false);
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [sexo, setSexo] = useState<'M' | 'F' | ''>('');
  const [provincia, setProvincia] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [bairro, setBairro] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [error, setError] = useState('');

  const getTodayISO = () => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().split('T')[0];
  };

  const calculateAge = (birthDateStr: string) => {
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age -= 1;
    }
    return age;
  };
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleScannerData = (data: Partial<BIData>) => {
    if (data.bi) setBi(data.bi);
    if (data.nome) setNome(data.nome);
    if (data.sobrenome) setSobrenome(data.sobrenome);
    if (data.dataNascimento) setDataNascimento(data.dataNascimento);
    if (data.sexo) setSexo(data.sexo);
    if (data.provincia) setProvincia(data.provincia);
    if (data.municipio) setMunicipio(data.municipio);
    if (data.bairro) setBairro(data.bairro);
    setShowScanner(false);
  };

  const validateBI = (bi: string): boolean => {
    // Format: 007654844BO042 or 009593845LA0444 (9 digits + 2 letters + 3-4 digits)
    const biPattern = /^\d{9}[A-Z]{2}\d{3,4}$/;
    return biPattern.test(bi);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!semBI && bi && !validateBI(bi)) {
      setError('Formato de BI inválido. Use o formato: 007654844BO042 ou 009593845LA0444');
      return;
    }

    if (!semBI && !bi) {
      setError('Por favor, preencha o número do BI ou marque "Sem BI".');
      return;
    }

    if (!nome || nome.trim().length < 2) {
      setError('Nome é obrigatório (mínimo 2 caracteres).');
      return;
    }

    if (!sobrenome || sobrenome.trim().length < 2) {
      setError('Sobrenome é obrigatório (mínimo 2 caracteres).');
      return;
    }

    if (!dataNascimento) {
      setError('Data de nascimento é obrigatória.');
      return;
    }

    const todayISO = getTodayISO();
    if (dataNascimento > todayISO) {
      setError('Data de nascimento não pode ser superior à data corrente.');
      return;
    }

    if (calculateAge(dataNascimento) < 1) {
      setError('Apenas pessoas com 1 ano de vida ou mais podem se registrar.');
      return;
    }

    if (!sexo) {
      setError('Sexo é obrigatório.');
      return;
    }

    if (!provincia || !PROVINCIA_TO_ENUM[provincia]) {
      setError('Província é obrigatória.');
      return;
    }

    setLoading(true);

    try {
      await register({
        email,
        password,
        cidadao: {
          nome: nome.trim(),
          sobrenome: sobrenome.trim(),
          dataNascimento,
          sexo,
          email,
          provinciaResidencia: PROVINCIA_TO_ENUM[provincia],
          municipioResidencia: municipio || undefined,
          bairroResidencia: bairro || undefined,
          numeroBIAnterior: semBI ? undefined : bi || undefined,
        },
      });
      navigate('/dashboard/perfil');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Erro ao registrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>Registrar</h1>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* BI Section with Scanner */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Bilhete de Identidade</label>
            
            <button
              type="button"
              className={styles.scanBtn}
              onClick={() => setShowScanner(true)}
              disabled={semBI}
            >
              <Scan size={18} />
              Digitalizar BI
            </button>

            <div className={styles.inputWrapper}>
              <User size={18} className={styles.inputIcon} />
              <input
                type="text"
                className={styles.inputField}
                placeholder="Digite o Nº do BI (ex: 009593845LA0444)"
                value={bi}
                onChange={(e) => setBi(e.target.value.toUpperCase())}
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

          {/* Personal Data */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nome</label>
              <input
                type="text"
                className={styles.inputField}
                placeholder="Nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Sobrenome</label>
              <input
                type="text"
                className={styles.inputField}
                placeholder="Sobrenome"
                value={sobrenome}
                onChange={(e) => setSobrenome(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Data de Nascimento</label>
              <div className={styles.inputWrapper}>
                <Calendar size={18} className={styles.inputIcon} />
                <input
                  type="date"
                  className={styles.inputField}
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  max={getTodayISO()}
                  required
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Sexo</label>
              <select
                className={styles.inputField}
                value={sexo}
                onChange={(e) => setSexo(e.target.value as 'M' | 'F' | '')}
                required
              >
                <option value="">Selecione</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Província</label>
            <select
              className={styles.inputField}
              value={provincia}
              onChange={(e) => setProvincia(e.target.value)}
              required
            >
              <option value="">Selecione a província</option>
              {PROVINCIAS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Município</label>
              <input
                type="text"
                className={styles.inputField}
                placeholder="Município"
                value={municipio}
                onChange={(e) => setMunicipio(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Bairro</label>
              <input
                type="text"
                className={styles.inputField}
                placeholder="Bairro"
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
              />
            </div>
          </div>

          {/* Account credentials */}
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

      {showScanner && (
        <BIScanner
          onDataExtracted={handleScannerData}
          onClose={() => setShowScanner(false)}
        />
      )}
    </>
  );
}
