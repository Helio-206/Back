import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Check, AlertCircle, RotateCw, Loader } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import styles from './BIScanner.module.css';

GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();

export interface BIData {
  bi: string;
  nome: string;
  sobrenome: string;
  dataNascimento: string;
  sexo: 'M' | 'F' | '';
  provincia?: string;
  municipio?: string;
  bairro?: string;
}

interface BIScannerProps {
  onDataExtracted: (data: Partial<BIData>) => void;
  onClose: () => void;
}

type CaptureMode = 'menu' | 'camera' | 'upload';
type CaptureSide = 'front' | 'back' | 'complete';

function parseBIText(text: string): Partial<BIData> {
  const data: Partial<BIData> = {};
  
  // Remove line breaks and extra spaces for easier parsing
  const normalized = text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').toUpperCase();
  
  // Extract BI number (format: 007654844BO042 or 009593845LA0444)
  // Accepts 3-4 digits at the end
  const biMatch = normalized.match(/\b(\d{9}[A-Z]{2}\d{3,4})\b/);
  if (biMatch) {
    data.bi = biMatch[1];
  }
  
  // Extract date of birth (various formats: DD-MM-YYYY, DD/MM/YYYY, DDMMYYYY)
  const datePatterns = [
    /\b(\d{2})[-/](\d{2})[-/](\d{4})\b/,
    /NASC[A-Z]*\s*:?\s*(\d{2})[/-](\d{2})[/-](\d{4})/,
    /DATA\s*NASC[A-Z]*\s*:?\s*(\d{2})[/-](\d{2})[/-](\d{4})/,
  ];
  
  for (const pattern of datePatterns) {
    const match = normalized.match(pattern);
    if (match) {
      const [, day, month, year] = match;
      data.dataNascimento = `${year}-${month}-${day}`;
      break;
    }
  }
  
  // Extract sex (M or F)
  const sexMatch = normalized.match(/\bSEXO\s*:?\s*([MF])\b|\b([MF])\s*(?:MASC|FEM)/);
  if (sexMatch) {
    data.sexo = (sexMatch[1] || sexMatch[2]) as 'M' | 'F';
  }
  
  // Extract name - common patterns in BI
  const namePatterns = [
    /NOME\s*:?\s*([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ\s]+?)(?=\s*DATA|\s*NASC|\s*SEXO|\s*\d{2}[/-]\d{2})/,
    /APELIDO\s*:?\s*([A-ZÁÀÂÃÉÊÍÓÔÕÚÇ\s]+?)(?=\s*DATA|\s*NASC|\s*SEXO|\s*\d{2}[/-]\d{2})/,
  ];
  
  for (const pattern of namePatterns) {
    const match = normalized.match(pattern);
    if (match) {
      const fullName = match[1].trim();
      const nameParts = fullName.split(/\s+/);
      if (nameParts.length >= 2) {
        data.nome = nameParts.slice(0, -1).join(' ');
        data.sobrenome = nameParts[nameParts.length - 1];
      } else if (nameParts.length === 1) {
        data.nome = nameParts[0];
      }
      break;
    }
  }
  
  // Extract provincia
  const provincias = [
    'LUANDA', 'BENGUELA', 'HUÍLA', 'HUAMBO', 'CABINDA', 'KWANZA SUL', 
    'KWANZA NORTE', 'MALANJE', 'MOXICO', 'NAMIBE', 'UÍGE', 'ZAIRE',
    'BIÉ', 'CUNENE', 'LUNDA NORTE', 'LUNDA SUL', 'BENGO', 'CUANDO CUBANGO'
  ];
  
  for (const prov of provincias) {
    if (normalized.includes(prov)) {
      data.provincia = prov.charAt(0) + prov.slice(1).toLowerCase();
      break;
    }
  }
  
  return data;
}

export default function BIScanner({ onDataExtracted, onClose }: BIScannerProps) {
  const [mode, setMode] = useState<CaptureMode>('menu');
  const [side, setSide] = useState<CaptureSide>('front');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start camera with improved error handling
  const startCamera = async () => {
    setMode('camera');
    setSide('front');
    setError('');
    setCameraReady(false);

    try {
      // Try environment camera first, fall back to any camera
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch {
        // Fallback: try any camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }
      
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Try to play immediately
        try {
          await videoRef.current.play();
          setCameraReady(true);
        } catch {
          // If play fails, wait for metadata then try
          videoRef.current.onloadedmetadata = async () => {
            try {
              await videoRef.current?.play();
              setCameraReady(true);
            } catch (playErr) {
              console.error('Play error:', playErr);
              setError('Erro ao iniciar câmera. Tente novamente.');
              stopCamera();
              setMode('menu');
            }
          };
          
          // Safety timeout: mark ready after 3s regardless
          setTimeout(() => {
            setCameraReady(prev => {
              if (!prev && streamRef.current) {
                videoRef.current?.play().catch(() => {});
                return true;
              }
              return prev;
            });
          }, 3000);
        }
      }
    } catch (err) {
      console.error('Camera error:', err);
      const errName = (err as DOMException).name;
      if (errName === 'NotAllowedError') {
        setError('Permissão para câmera negada. Permita acesso às permissões do seu dispositivo.');
      } else if (errName === 'NotFoundError') {
        setError('Câmera não encontrada. Use a opção de carregar imagens.');
      } else {
        setError('Não foi possível aceder à câmera. Tente carregar imagens em seu lugar.');
      }
      setMode('menu');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get image as data URL
    const imageUrl = canvas.toDataURL('image/jpeg', 0.9);

    if (side === 'front') {
      setFrontImage(imageUrl);
      setSide('back');
    } else {
      setBackImage(imageUrl);
      setSide('complete');
      stopCamera();
      // Process both images
      processImages(frontImage!, imageUrl);
    }
  };

  // Handle file upload (both images and PDFs)
  const handleFileSelect = async (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';
    
    if (!isImage && !isPDF) {
      setError('Por favor, selecione uma imagem ou PDF válido.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const url = e.target?.result as string;
      
      try {
        if (isPDF) {
          setProcessing(true);
          setProgress(10);
          
          // For PDF, extract text and try to find BI
          const pdfData = url.split(',')[1];
          const binaryString = atob(pdfData);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          const pdf = await getDocument({ data: bytes }).promise;
          const maxPages = Math.min(pdf.numPages, 2);
          let fullText = '';
          
          for (let i = 1; i <= maxPages; i += 1) {
            setProgress(10 + Math.round((i / maxPages) * 40));
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items
              .map((item) => ('str' in item ? item.str : ''))
              .join(' ')
              .toUpperCase();
            fullText += ` ${pageText}`;
          }
          
          setProgress(50);
          
          const biMatch = fullText.match(/\d{9}[A-Z]{2}\d{3,4}/);
          if (biMatch) {
            const extractedData = parseBIText(fullText);
            setSuccess(true);
            setFrontImage('📄 PDF processado');
            setBackImage(null);
            setSide('complete');
            setProgress(100);
            setProcessing(false);
            onDataExtracted(extractedData);
            setTimeout(() => setProgress(0), 1000);
            return;
          } else {
            setError('Não foi possível extrair BI do PDF. Tente servir a frente e verso do BI como imagens.');
            setProcessing(false);
            return;
          }
        } else {
          // For images
          if (!frontImage) {
            setFrontImage(url);
            setError('');
            setMode('upload');
          } else {
            setBackImage(url);
            setMode('upload');
            processImages(frontImage, url);
          }
        }
      } catch (err) {
        console.error('File processing error:', err);
        setError('Erro ao processar ficheiro. Tente novamente.');
        setProcessing(false);
      }
    };
    
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Process both images with OCR (with timeout)
  const processImages = async (frontUrl: string, backUrl: string) => {
    setProcessing(true);
    setProgress(0);
    setError('');
    setSuccess(false);

    const ocrTimeout = (imageUrl: string, label: string, progressBase: number) => {
      return new Promise<string>((resolve) => {
        const timeoutId = setTimeout(() => {
          console.warn(`OCR timeout for ${label}`);
          resolve('');
        }, 30000); // 30s timeout per side

        Tesseract.recognize(imageUrl, 'por', {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(progressBase + Math.round(m.progress * 40));
            }
          },
        }).then((result) => {
          clearTimeout(timeoutId);
          resolve(result.data.text);
        }).catch((err) => {
          clearTimeout(timeoutId);
          console.error(`OCR error for ${label}:`, err);
          resolve('');
        });
      });
    };

    try {
      // Process front side
      setProgress(10);
      const frontText = await ocrTimeout(frontUrl, 'front', 10);

      // Process back side  
      setProgress(50);
      const backText = await ocrTimeout(backUrl, 'back', 50);

      setProgress(90);

      // Combine data from both sides
      const frontData = parseBIText(frontText);
      const backData = parseBIText(backText);
      
      const extractedData: Partial<BIData> = {
        ...backData,
        ...frontData, // Front takes precedence
      };
      
      setProgress(100);

      if (Object.keys(extractedData).length === 0) {
        setError('Não foi possível extrair dados do BI. Tente novamente ou preencha manualmente.');
      } else {
        setSuccess(true);
        onDataExtracted(extractedData);
      }
    } catch (err) {
      console.error('OCR Error:', err);
      setError('Erro ao processar as imagens. Tente novamente.');
    } finally {
      setProcessing(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  // Reset to capture again
  const resetCapture = () => {
    setFrontImage(null);
    setBackImage(null);
    setSide('front');
    setError('');
    setSuccess(false);
    setMode('menu');
    setCameraReady(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Digitalizar Bilhete de Identidade</h3>
          <button className={styles.closeBtn} onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {/* Menu Mode */}
          {mode === 'menu' && (
            <div className={styles.menuArea}>
              <div className={styles.uploadIcon}>
                <Camera size={48} strokeWidth={1.5} />
              </div>
              <p className={styles.uploadText}>
                Digitalize o seu Bilhete de Identidade
              </p>
              <p className={styles.uploadHint}>
                Será necessário capturar a frente e o verso do BI. Para melhores resultados, certifique-se de que o BI está bem iluminado e em foco.
              </p>

              <div className={styles.uploadButtons}>
                <button
                  type="button"
                  className={styles.uploadBtn}
                  onClick={startCamera}
                >
                  <Camera size={18} />
                  Tirar Foto com Câmera
                </button>
                <button
                  type="button"
                  className={styles.uploadBtn}
                  onClick={() => {
                    setMode('upload');
                    setTimeout(() => fileInputRef.current?.click(), 100);
                  }}
                >
                  <Upload size={18} />
                  Carregar Imagens ou PDF
                </button>
              </div>

              {error && (
                <div className={styles.errorBox}>
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className={styles.hiddenInput}
                onChange={handleFileInputChange}
              />
            </div>
          )}

          {/* Camera Mode */}
          {mode === 'camera' && side !== 'complete' && (
            <div className={styles.cameraArea}>
              <div className={styles.cameraContainer}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={styles.videoFeed}
                />
                
                {!cameraReady && (
                  <div className={styles.loadingOverlay}>
                    <Loader size={32} className={styles.spinner} />
                    <p>Iniciando câmera...</p>
                  </div>
                )}
                
                {/* ID Card Overlay Guide */}
                <div className={styles.cardOverlay}>
                  <div className={styles.cardFrame}>
                    <div className={styles.cardCorner} style={{ top: 0, left: 0 }} />
                    <div className={styles.cardCorner} style={{ top: 0, right: 0 }} />
                    <div className={styles.cardCorner} style={{ bottom: 0, left: 0 }} />
                    <div className={styles.cardCorner} style={{ bottom: 0, right: 0 }} />
                  </div>
                  <div className={styles.instructionBox}>
                    <p className={styles.instructionText}>
                      {side === 'front' 
                        ? 'Posicione a FRENTE do BI dentro do quadro'
                        : 'Agora posicione o VERSO do BI dentro do quadro'}
                    </p>
                  </div>
                </div>

                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </div>

              <div className={styles.cameraControls}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => {
                    stopCamera();
                    resetCapture();
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={styles.captureBtn}
                  onClick={capturePhoto}
                  disabled={!cameraReady}
                >
                  <Camera size={24} />
                  <span>Capturar {side === 'front' ? 'Frente' : 'Verso'}</span>
                </button>
              </div>

              {frontImage && (
                <div className={styles.capturedPreview}>
                  <Check size={16} className={styles.checkIcon} />
                  <span>Frente capturada</span>
                </div>
              )}
            </div>
          )}

          {/* Upload Mode (showing captured images) */}
          {mode === 'upload' && (frontImage || backImage) && !processing && !success && (
            <div className={styles.uploadArea}>
              <div className={styles.imageGrid}>
                {frontImage && (
                  <div className={styles.imagePreview}>
                    <img src={frontImage} alt="Frente do BI" />
                    <span className={styles.imageLabel}>Frente</span>
                  </div>
                )}
                {backImage && (
                  <div className={styles.imagePreview}>
                    <img src={backImage} alt="Verso do BI" />
                    <span className={styles.imageLabel}>Verso</span>
                  </div>
                )}
              </div>

              {!backImage && frontImage && (
                <div className={styles.uploadHint}>
                  Clique abaixo para carregar o verso do BI
                </div>
              )}

              {!backImage && (
                <button
                  type="button"
                  className={styles.uploadBtn}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={18} />
                  Carregar {frontImage ? 'Verso' : 'Frente'}
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className={styles.hiddenInput}
                onChange={handleFileInputChange}
              />
            </div>
          )}

          {/* Processing/Complete State */}
          {(processing || success || (side === 'complete' && !processing)) && (
            <div className={styles.resultArea}>
              {frontImage && backImage && (
                <div className={styles.imageGrid}>
                  <div className={styles.imagePreview}>
                    <img src={frontImage} alt="Frente do BI" />
                    <span className={styles.imageLabel}>Frente</span>
                  </div>
                  <div className={styles.imagePreview}>
                    <img src={backImage} alt="Verso do BI" />
                    <span className={styles.imageLabel}>Verso</span>
                  </div>
                </div>
              )}

              {processing && (
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                  <span className={styles.progressText}>{progress}%</span>
                </div>
              )}

              {error && !processing && (
                <div className={styles.errorBox}>
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className={styles.successBox}>
                  <Check size={18} />
                  <span>Dados extraídos com sucesso! Verifique os campos abaixo.</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          {!processing && (
            <>
              <button className={styles.cancelBtn} onClick={handleClose}>
                {success ? 'Fechar' : 'Cancelar'}
              </button>
              {(error || (frontImage && backImage && !success)) && (
                <button className={styles.retryBtn} onClick={resetCapture}>
                  <RotateCw size={16} />
                  Tentar Novamente
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
