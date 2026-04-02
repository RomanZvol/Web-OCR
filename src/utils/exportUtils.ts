export interface ExportData {
  content: string;
  mimeType: string;
  extension: string;
}

export type ExportFormat = 'txt' | 'json' | 'csv' | 'md';

export interface ExportFormatOption {
  format: ExportFormat;
  label: string;
  icon: string;
}

export function exportAsText(text: string): ExportData {
  return {
    content: text,
    mimeType: 'text/plain',
    extension: 'txt',
  };
}

export function exportAsJson(
  text: string,
  metadata?: { fileName?: string; date?: string; confidence?: number }
): ExportData {
  const data = {
    text,
    lines: text.split('\n').filter((l) => l.trim()),
    wordCount: text.trim().split(/\s+/).filter(Boolean).length,
    ...(metadata && { metadata }),
    exportedAt: new Date().toISOString(),
  };

  return {
    content: JSON.stringify(data, null, 2),
    mimeType: 'application/json',
    extension: 'json',
  };
}

export function exportAsCsv(text: string): ExportData {
  const lines = text.split('\n').filter((l) => l.trim());
  const header = 'Line Number,Content';
  const rows = lines.map((line, i) => {
    const escaped = line.replace(/"/g, '""');
    return `${i + 1},"${escaped}"`;
  });

  return {
    content: [header, ...rows].join('\n'),
    mimeType: 'text/csv',
    extension: 'csv',
  };
}

export function exportAsMarkdown(text: string, title?: string): ExportData {
  const heading = title ? `# ${title}` : '# OCR Result';
  const date = `_Exported: ${new Date().toLocaleDateString()}_`;
  const content = `${heading}\n\n${date}\n\n---\n\n${text}\n`;

  return {
    content,
    mimeType: 'text/markdown',
    extension: 'md',
  };
}

export function createDownloadBlob(exportData: ExportData): Blob {
  return new Blob([exportData.content], { type: exportData.mimeType });
}

export function exportByFormat(
  format: ExportFormat,
  text: string,
  options?: { title?: string; fileName?: string; confidence?: number }
): ExportData {
  switch (format) {
    case 'json':
      return exportAsJson(text, {
        fileName: options?.fileName,
        confidence: options?.confidence,
        date: new Date().toISOString(),
      });
    case 'csv':
      return exportAsCsv(text);
    case 'md':
      return exportAsMarkdown(text, options?.title);
    case 'txt':
    default:
      return exportAsText(text);
  }
}

export function getAvailableFormats(): ExportFormatOption[] {
  return [
    { format: 'txt', label: 'Plain Text', icon: '📄' },
    { format: 'json', label: 'JSON', icon: '🔧' },
    { format: 'csv', label: 'CSV Table', icon: '📊' },
    { format: 'md', label: 'Markdown', icon: '📝' },
  ];
}
