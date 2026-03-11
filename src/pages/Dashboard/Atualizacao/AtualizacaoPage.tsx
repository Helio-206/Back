import { useState, useRef } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import { userService } from '../../../services/user.service';
import { validateBI, validatePDFFile } from '../../../utils/validators';
import styles from './Atualizacao.module.css';

GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();

function UploadIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Dashed circle */}
      <circle cx="40" cy="40" r="36" stroke="#000" strokeWidth="2.5" strokeDasharray="8 5" fill="none" />
      {/* Arrow shaft */}
      <line x1="40" y1="55" x2="40" y2="28" stroke="#000" strokeWidth="3" strokeLinecap="round" />
      {/* Arrow head */}
      <polyline points="30,36 40,26 50,36" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export default function AtualizacaoPage() {
  const { user } = useAuth();
  const cidadao = user?.cidadao;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tipoDocumento, setTipoDocumento] = useState('');
  const [descricao, setDescricao] = useState('');
  const [numeroBI, setNumeroBI] = useState(cidadao?.numeroBIAnterior || '');
  const [fileName, setFileName] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const extractBiFromPdf = async (file: File): Promise<string | null> => {
    const data = await file.arrayBuffer();
    const pdf = await getDocument({ data }).promise;
    const maxPages = Math.min(pdf.numPages, 3);
    let fullText = '';

    for (let i = 1; i <= maxPages; i += 1) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
        .toUpperCase();
      fullText += ` ${pageText}`;
    }

    // Suporta formato de BI: 9 dígitos + 2 letras + 3-4 dígitos (ex: 007654844BO042)
    const match = fullText.match(/\d{9}[A-Z]{2}\d{3,4}/);
    return match ? match[0] : null;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const pdfValidation = validatePDFFile(file);
      if (!pdfValidation.valid) {
        setError(pdfValidation.message || 'PDF inválido.');
        setPdfFile(null);
        setFileName('');
        return;
      }

      setError('');
      setFileName(file.name);
      setPdfFile(file);

      try {
        const extractedBi = await extractBiFromPdf(file);
        if (extractedBi) {
          setNumeroBI(extractedBi);
          setSuccess('PDF lido com sucesso. Número do BI preenchido automaticamente.');
        } else {
          setSuccess('PDF carregado. Preencha o BI manualmente se não for detetado automaticamente.');
        }
      } catch {
        setSuccess('PDF carregado. Não foi possível extrair o BI automaticamente.');
      }
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
      const biValidation = validateBI(numeroBI);
      if (!biValidation.valid) {
        setError(biValidation.message || 'BI inválido.');
        return;
      }

      if (pdfFile) {
        const pdfValidation = validatePDFFile(pdfFile);
        if (!pdfValidation.valid) {
          setError(pdfValidation.message || 'PDF inválido.');
          return;
        }
      }

      await userService.updateMyBi({
        numeroBIAnterior: numeroBI.toUpperCase(),
      });

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser) as {
          cidadao?: { numeroBIAnterior?: string };
        };
        parsed.cidadao = parsed.cidadao || {};
        parsed.cidadao.numeroBIAnterior = numeroBI.toUpperCase();
        localStorage.setItem('user', JSON.stringify(parsed));
      }

      setSuccess('BI atualizado com sucesso!');
      setTipoDocumento('');
      setDescricao('');
      setFileName('');
      setPdfFile(null);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Erro ao atualizar BI.');
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
          <UploadIcon />
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
                value={numeroBI}
                onChange={(e) => setNumeroBI(e.target.value.toUpperCase())}
                placeholder="Ex: 009593845LA0444"
                required
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

          <div className={styles.rules}>
            <p className={styles.rulesTitle}>Regras para atualização de documentos:</p>
            <ul className={styles.rulesList}>
              <li>O documento deve estar no formato <strong>.pdf</strong></li>
              <li>O tamanho máximo permitido é de <strong>5 MB</strong></li>
              <li>O documento deve ser legível e sem rasuras</li>
              <li>Preencha correctamente o tipo e a descrição do documento</li>
              <li>Após a submissão, aguarde a validação por um funcionário</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
