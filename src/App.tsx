import { useState, useCallback } from 'react';
import Tesseract from 'tesseract.js';
import { FileUpload } from './components/FileUpload';
import { OcrResult } from './components/OcrResult';
import { CropZone } from './components/CropZone';
import { HistoryPanel } from './components/HistoryPanel';
import { addToHistory, type HistoryEntry } from './utils/historyManager';
import { getConfidenceLabel } from './utils/textProcessing';
import { Loader2, FileText, AlertCircle, RefreshCw, Shield } from 'lucide-react';
import './App.css';

function App() {
  const [ocrText, setOcrText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | undefined>(undefined);
  const [historyRefresh, setHistoryRefresh] = useState(0);

  const performOcr = useCallback(async (imageData: string) => {
    setIsProcessing(true);
    setError(null);
    setOcrText('');
    setProgress(0);
    setConfidence(undefined);
    setStatus('Initializing OCR engine...');

    try {
      const worker = await Tesseract.createWorker('ukr+eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
            setStatus(`Processing text... ${Math.round(m.progress * 100)}%`);
          } else {
            setStatus(m.status.charAt(0).toUpperCase() + m.status.slice(1));
          }
        },
      });

      const { data: { text, confidence: conf } } = await worker.recognize(imageData);
      setOcrText(text);
      setConfidence(Math.round(conf));

      // Save to history
      if (text.trim()) {
        addToHistory({
          fileName: fileName || 'Unknown',
          text,
          confidence: Math.round(conf),
        });
        setHistoryRefresh((prev) => prev + 1);
      }

      await worker.terminate();
      setStatus('Completed!');
    } catch (err) {
      console.error('OCR Error:', err);
      setError('An error occurred during text recognition. Please try again.');
      setStatus('Error');
    } finally {
      setIsProcessing(false);
    }
  }, [fileName]);

  const handleFileSelect = (selectedFile: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setSourceImage(reader.result as string);
      setFileName(selectedFile.name);
      setOcrText('');
      setError(null);
      setConfidence(undefined);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleHistorySelect = (entry: HistoryEntry) => {
    setOcrText(entry.text);
    setFileName(entry.fileName);
    setConfidence(entry.confidence);
    setSourceImage(null);
    setError(null);
  };

  const reset = () => {
    setSourceImage(null);
    setOcrText('');
    setFileName(null);
    setError(null);
    setConfidence(undefined);
  };

  const confidenceInfo = confidence !== undefined ? getConfidenceLabel(confidence) : null;

  return (
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: '4rem' }} className="animate-fade-in">
        <h1 style={{ 
          fontSize: '3.5rem', 
          fontWeight: 900, 
          letterSpacing: '-0.04em',
          marginBottom: '0.75rem',
          color: 'white'
        }}>
          Vision<span style={{ color: 'var(--primary)' }}>OCR</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Extract text from images with area selection
        </p>
      </header>

      <div className="studio-container animate-fade-in">
        <div className="studio-sidebar">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FileText size={20} color="var(--primary)" />
              Workspace
            </h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {sourceImage && (
                <button onClick={reset} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                  <RefreshCw size={14} />
                  Reset
                </button>
              )}
            </div>
          </div>

          {!sourceImage ? (
            <FileUpload onFileSelect={handleFileSelect} disabled={isProcessing} />
          ) : (
            <CropZone 
              imageSrc={sourceImage} 
              onCropComplete={performOcr} 
              isProcessing={isProcessing} 
            />
          )}

          {isProcessing && (
            <div style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                <Loader2 size={20} className="animate-spin" color="var(--primary)" />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary)' }}>{status}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}

          {confidence !== undefined && !isProcessing && ocrText && (
            <div className="confidence-badge animate-fade-in" style={{ marginTop: '1.5rem' }}>
              <Shield size={16} color={confidenceInfo?.color} />
              <span>Confidence:</span>
              <span style={{ color: confidenceInfo?.color, fontWeight: 700 }}>
                {confidence}% — {confidenceInfo?.label}
              </span>
            </div>
          )}

          {error && (
            <div className="glass-card" style={{ 
              marginTop: '2rem', 
              border: '1px solid rgba(239, 68, 68, 0.2)',
              background: 'rgba(239, 68, 68, 0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              color: '#fca5a5',
              padding: '1rem'
            }}>
              <AlertCircle size={20} />
              <span style={{ fontSize: '0.85rem' }}>{error}</span>
            </div>
          )}

          <div style={{ marginTop: '2rem' }}>
            <HistoryPanel
              onSelectEntry={handleHistorySelect}
              refreshTrigger={historyRefresh}
            />
          </div>
        </div>

        <div className="studio-content">
          <OcrResult
            text={ocrText}
            fileName={fileName}
            confidence={confidence}
            onTextChange={setOcrText}
          />
        </div>
      </div>

      <footer style={{ marginTop: '4rem', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
        <p>© 2026 VisionOCR Studio • Powered by Tesseract.js</p>
      </footer>
    </div>
  );
}

export default App;
