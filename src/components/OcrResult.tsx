import React, { useState, useMemo } from 'react';
import { Copy, Download, Check, FileText, Search, X, Eraser } from 'lucide-react';
import { TextStats } from './TextStats';
import { getTextStats, highlightMatches, searchInText, cleanText } from '../utils/textProcessing';
import { getAvailableFormats, exportByFormat, createDownloadBlob, type ExportFormat } from '../utils/exportUtils';
import { generateDownloadName } from '../utils/fileValidation';

interface OcrResultProps {
  text: string;
  fileName?: string | null;
  confidence?: number;
  onTextChange?: (text: string) => void;
}

export const OcrResult: React.FC<OcrResultProps> = ({ text, fileName, confidence, onTextChange }) => {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFormatMenu, setShowFormatMenu] = useState(false);
  const [exportFormat] = useState<ExportFormat>('txt');

  const stats = useMemo(() => getTextStats(text), [text]);
  const searchResult = useMemo(() => searchInText(text, searchQuery), [text, searchQuery]);
  const segments = useMemo(() => highlightMatches(text, searchQuery), [text, searchQuery]);
  const formats = useMemo(() => getAvailableFormats(), []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const handleExport = (format: ExportFormat) => {
    const exportData = exportByFormat(format, text, {
      fileName: fileName || undefined,
      confidence,
      title: fileName ? `OCR: ${fileName}` : undefined,
    });
    const blob = createDownloadBlob(exportData);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = generateDownloadName(fileName || null, exportData.extension);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowFormatMenu(false);
  };

  const handleClean = () => {
    if (text && onTextChange) {
      onTextChange(cleanText(text));
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Extracted Text</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {text && (
            <>
              {onTextChange && (
                <button onClick={handleClean} className="btn-secondary" style={{ padding: '0.4rem 0.8rem' }} title="Clean text">
                  <Eraser size={14} />
                  <span style={{ fontSize: '0.8rem' }}>Clean</span>
                </button>
              )}
              <button onClick={copyToClipboard} className="btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>
                {copied ? <Check size={14} color="var(--primary)" /> : <Copy size={14} />}
                <span style={{ fontSize: '0.8rem' }}>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowFormatMenu(!showFormatMenu)}
                  className="btn-primary"
                  style={{ padding: '0.4rem 0.8rem' }}
                >
                  <Download size={14} />
                  <span style={{ fontSize: '0.8rem' }}>Export</span>
                </button>
                {showFormatMenu && (
                  <div className="export-menu">
                    {formats.map(({ format, label, icon }) => (
                      <button
                        key={format}
                        onClick={() => handleExport(format)}
                        className={`export-menu-item ${exportFormat === format ? 'active' : ''}`}
                      >
                        <span>{icon}</span>
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {text && (
        <div className="search-bar">
          <Search size={14} className="search-bar-icon" />
          <input
            type="text"
            placeholder="Search in text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-bar-input"
          />
          {searchQuery && (
            <>
              <span className="search-bar-count">
                {searchResult.count} found
              </span>
              <button onClick={() => setSearchQuery('')} className="btn-icon" style={{ padding: '0.2rem' }}>
                <X size={14} />
              </button>
            </>
          )}
        </div>
      )}

      <div className="ocr-text-area" style={{
        display: text ? 'block' : 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: text ? 'left' : 'center'
      }}>
        {text ? (
          searchQuery ? (
            <span>
              {segments.map((seg, i) =>
                seg.highlighted ? (
                  <mark key={i} className="text-highlight">{seg.text}</mark>
                ) : (
                  <span key={i}>{seg.text}</span>
                )
              )}
            </span>
          ) : (
            text
          )
        ) : (
          <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <FileText size={48} style={{ opacity: 0.1 }} />
            <p style={{ maxWidth: '200px', fontSize: '0.9rem' }}>
              Select an area on the image and click Scan to see results here.
            </p>
          </div>
        )}
      </div>

      {text && <TextStats stats={stats} />}
    </div>
  );
};
