import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { adminService } from '../../../services/admin.service';
import { User, Save, Mail, MapPin, Phone } from 'lucide-react';
import styles from './PerfilAdmin.module.css';

const PROVINCIAS = [
  'BENGO','BENGUELA','BIE','CABINDA','CUANDO_CUBANGO','CUANZA_NORTE',
  'CUANZA_SUL','CUNENE','HUAMBO','HUILA','ICOLO_E_BENGO','LUANDA',
  'LUNDA_NORTE','LUNDA_SUL','MALANJE','MOXICO','NAMIBE','UIGE','ZAIRE',
];

const PROVINCIA_LABELS: Record<string, string> = {
  BENGO: 'Bengo', BENGUELA: 'Benguela', BIE: 'Bié', CABINDA: 'Cabinda',
  CUANDO_CUBANGO: 'Cuando Cubango', CUANZA_NORTE: 'Cuanza Norte',
  CUANZA_SUL: 'Cuanza Sul', CUNENE: 'Cunene', HUAMBO: 'Huambo',
  HUILA: 'Huíla', ICOLO_E_BENGO: 'Ícolo e Bengo', LUANDA: 'Luanda',
  LUNDA_NORTE: 'Lunda Norte', LUNDA_SUL: 'Lunda Sul', MALANJE: 'Malanje',
  MOXICO: 'Moxico', NAMIBE: 'Namibe', UIGE: 'Uíge', ZAIRE: 'Zaire',
};

export default function PerfilAdminPage() {
  const { user, updateUser } = useAuth();

  const [form, setForm] = useState({
    email: '',
    nome: '',
    sobrenome: '',
    sexo: '',
    provinciaResidencia: '',
    municipioResidencia: '',
    bairroResidencia: '',
    estadoCivil: '',
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setForm({
        email: user.email || '',
        nome: user.cidadao?.nome || '',
        sobrenome: user.cidadao?.sobrenome || '',
        sexo: user.cidadao?.sexo || '',
        provinciaResidencia: user.cidadao?.provinciaResidencia || '',
        municipioResidencia: user.cidadao?.municipioResidencia || '',
        bairroResidencia: user.cidadao?.bairroResidencia || '',
        estadoCivil: (user.cidadao as Record<string, string> | undefined)?.estadoCivil || '',
      });
    }
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setMessage(null);
  };

  const handleSave = async () => {
    if (!form.nome.trim() || !form.sobrenome.trim()) {
      setMessage({ type: 'error', text: 'Nome e sobrenome são obrigatórios.' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const result = await adminService.updateMyProfile({
        email: form.email || undefined,
        nome: form.nome,
        sobrenome: form.sobrenome,
        sexo: form.sexo || undefined,
        provinciaResidencia: form.provinciaResidencia || undefined,
        municipioResidencia: form.municipioResidencia || undefined,
        bairroResidencia: form.bairroResidencia || undefined,
        estadoCivil: form.estadoCivil || undefined,
      });

      // Update auth context with new data
      const cidadaoData = result.cidadao as Record<string, string> | undefined;
      updateUser({
        email: (result.email as string) || form.email,
        cidadao: {
          id: user?.cidadao?.id || '',
          nome: cidadaoData?.nome || form.nome,
          sobrenome: cidadaoData?.sobrenome || form.sobrenome,
          sexo: cidadaoData?.sexo || form.sexo,
          provinciaResidencia: cidadaoData?.provinciaResidencia || form.provinciaResidencia,
          municipioResidencia: cidadaoData?.municipioResidencia || form.municipioResidencia,
          bairroResidencia: cidadaoData?.bairroResidencia || form.bairroResidencia,
        },
      });

      setMessage({ type: 'success', text: 'Perfil actualizado com sucesso!' });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao actualizar perfil.';
      setMessage({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  const avatarLetter = (form.nome || user?.email || 'A').charAt(0).toUpperCase();

  return (
    <div className={styles.page}>
      <div className={styles.titleRow}>
        <h2 className={styles.pageTitle}>Meu Perfil</h2>
        <span className={styles.badge}>Configurações</span>
      </div>

      <div className={styles.profileLayout}>
        {/* Profile Card */}
        <div className={styles.profileCard}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>
              <span>{avatarLetter}</span>
            </div>
            <h3 className={styles.profileName}>{form.nome} {form.sobrenome}</h3>
            <p className={styles.profileRole}>Administrador</p>
            <p className={styles.profileEmail}>
              <Mail size={14} />
              {form.email}
            </p>
            {form.provinciaResidencia && (
              <p className={styles.profileLocation}>
                <MapPin size={14} />
                {PROVINCIA_LABELS[form.provinciaResidencia] || form.provinciaResidencia}
                {form.municipioResidencia ? `, ${form.municipioResidencia}` : ''}
              </p>
            )}
          </div>

          <div className={styles.profileStats}>
            <div className={styles.statItem}>
              <User size={16} />
              <span>Cargo: Administrador do Sistema</span>
            </div>
            <div className={styles.statItem}>
              <Phone size={16} />
              <span>Estado: Activo</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className={styles.formCard}>
          <h3 className={styles.formTitle}>Editar Informações</h3>

          {message && (
            <div className={`${styles.alert} ${message.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
              {message.text}
            </div>
          )}

          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Nome</label>
              <input
                type="text"
                className={styles.input}
                value={form.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Nome"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Sobrenome</label>
              <input
                type="text"
                className={styles.input}
                value={form.sobrenome}
                onChange={(e) => handleChange('sobrenome', e.target.value)}
                placeholder="Sobrenome"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                className={styles.input}
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="email@exemplo.com"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Sexo</label>
              <select
                className={styles.input}
                value={form.sexo}
                onChange={(e) => handleChange('sexo', e.target.value)}
              >
                <option value="">— Selecionar —</option>
                <option value="M">Masculino</option>
                <option value="F">Feminino</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Província de Residência</label>
              <select
                className={styles.input}
                value={form.provinciaResidencia}
                onChange={(e) => handleChange('provinciaResidencia', e.target.value)}
              >
                <option value="">— Selecionar —</option>
                {PROVINCIAS.map((p) => (
                  <option key={p} value={p}>{PROVINCIA_LABELS[p] || p}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Município</label>
              <input
                type="text"
                className={styles.input}
                value={form.municipioResidencia}
                onChange={(e) => handleChange('municipioResidencia', e.target.value)}
                placeholder="Município"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Bairro</label>
              <input
                type="text"
                className={styles.input}
                value={form.bairroResidencia}
                onChange={(e) => handleChange('bairroResidencia', e.target.value)}
                placeholder="Bairro"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Estado Civil</label>
              <select
                className={styles.input}
                value={form.estadoCivil}
                onChange={(e) => handleChange('estadoCivil', e.target.value)}
              >
                <option value="">— Selecionar —</option>
                <option value="Solteiro(a)">Solteiro(a)</option>
                <option value="Casado(a)">Casado(a)</option>
                <option value="Divorciado(a)">Divorciado(a)</option>
                <option value="Viúvo(a)">Viúvo(a)</option>
                <option value="União de Facto">União de Facto</option>
              </select>
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={16} />
              {saving ? 'A guardar...' : 'Guardar Alterações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
