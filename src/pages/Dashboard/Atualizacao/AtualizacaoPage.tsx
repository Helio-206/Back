import { useState, useRef } from 'react';
import type { FormEvent } from 'react';
import { Upload } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './Atualizacao.module.css';

export default function AtualizacaoPage() {
  const { user } = useAuth();
  const cidadao = user?.cidadao;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tipoDocumento, setTipoDocumento] = useState('');
  const [descricao, setDescricao] = useState('');
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // TODO: Implement document upload API call
      setSuccess('Documento submetido com sucesso!');
      setTipoDocumento('');
      setDescricao('');
      setFileName('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao submeter documento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>Atualização</div>

      <div className={styles.body}>
        {/* Left: Upload Area */}
        <div className={styles.uploadArea} onClick={handleDropZoneClick}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className={styles.fileInput}
            onChange={handleFileChange}
          />
          <Upload size={80} strokeWidth={1.2} className={styles.uploadIcon} />
          <p className={styles.uploadText}>
            {fileName || 'Submeter aqui o seu documento\n.pdf'}
          </p>
        </div>

        {/* Right: Form */}
        <div className={styles.formCard}>
          <form onSubmit={handleSubmit}>
            {success && <div className={styles.successMessage}>{success}</div>}
            {error && <div className={styles.errorMessage}>{error}</div>}

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nº do Bilhete de Identificação</label>
              <input
                type="text"
                className={styles.formInput}
                value={cidadao?.bi || '009593845LA044'}
                disabled
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tipo de Documento</label>
              <input
                type="text"
                className={styles.formInput}
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value)}
                placeholder="Nome do Documento"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Descrição</label>
              <textarea
                className={styles.formTextarea}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Digite aqui"
                rows={4}
              />
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'A submeter...' : 'Atualizar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
