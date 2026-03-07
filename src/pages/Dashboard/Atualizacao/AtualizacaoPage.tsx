import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './Atualizacao.module.css';

export default function AtualizacaoPage() {
  const { user } = useAuth();
  const cidadao = user?.cidadao;

  const [nome, setNome] = useState(cidadao?.nome || '');
  const [sobrenome, setSobrenome] = useState(cidadao?.sobrenome || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // TODO: Implement profile update API call
      setSuccess('Dados atualizados com sucesso!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>Atualização</div>

      <div className={styles.body}>
        <h2 className={styles.sectionTitle}>Atualizar Dados Pessoais</h2>

        <div className={styles.formCard}>
          <form onSubmit={handleSubmit}>
            {success && <div className={styles.successMessage}>{success}</div>}
            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nº do Bilhete de Identidade</label>
              <input
                type="text"
                className={styles.formInput}
                value={cidadao?.bi || ''}
                disabled
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nome</label>
              <input
                type="text"
                className={styles.formInput}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="O seu nome"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Sobrenome</label>
              <input
                type="text"
                className={styles.formInput}
                value={sobrenome}
                onChange={(e) => setSobrenome(e.target.value)}
                placeholder="O seu sobrenome"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Email</label>
              <input
                type="email"
                className={styles.formInput}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="O seu email"
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'A atualizar...' : 'Atualizar Documentos'}
            </button>
          </form>

          <p className={styles.infoText}>
            Para alterações de dados do BI (nome, data de nascimento, filiação),
            dirija-se a um posto de identificação com os documentos necessários.
          </p>
        </div>
      </div>
    </div>
  );
}
