import React, { useCallback, useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { validateFile, getAcceptedFormats } from '../utils/fileValidation';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, disabled }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const processFile = useCallback((file: File) => {
    const result = validateFile(file);
    if (!result.valid) {
      setValidationError(result.error || 'Invalid file');
      return;
    }
    setValidationError(null);
    onFileSelect(file);
  }, [onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragActive(true);
  }, [disabled]);

  const handleDragLeave = useCallback(() => {
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [disabled, processFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const formats = getAcceptedFormats();

  return (
    <div className="animate-fade-in">
      <label
        className={`glass-card draggable-zone ${isDragActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '300px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          border: isDragActive ? '2px dashed var(--primary)' : validationError ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--glass-border)',
          gap: '1rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled}
        />

        <div style={{
          borderRadius: '50%',
          color: validationError ? '#f87171' : 'var(--primary)'
        }}>
          {validationError ? <AlertCircle size={40} /> : <Upload size={40} />}
        </div>
        <div>
          <h3 style={{ marginBottom: '0.5rem' }}>
            {validationError ? 'Invalid File' : 'Click or Drop Image Here'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Supports {formats.join(', ')}
          </p>
        </div>
      </label>

      {validationError && (
        <div className="validation-error animate-fade-in">
          <AlertCircle size={16} />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
};
