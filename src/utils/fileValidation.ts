export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const VALID_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/bmp',
  'image/tiff',
];

const DEFAULT_MAX_SIZE_MB = 10;

export function isValidImageType(file: File): boolean {
  return VALID_IMAGE_TYPES.includes(file.type);
}

export function isValidFileSize(file: File, maxMB: number = DEFAULT_MAX_SIZE_MB): boolean {
  return file.size <= maxMB * 1024 * 1024;
}

export function validateFile(file: File, maxMB: number = DEFAULT_MAX_SIZE_MB): ValidationResult {
  if (!isValidImageType(file)) {
    const ext = file.name.split('.').pop()?.toUpperCase() || 'unknown';
    return {
      valid: false,
      error: `Unsupported file format: .${ext}. Please use JPG, PNG, WebP, BMP, or TIFF.`,
    };
  }

  if (!isValidFileSize(file, maxMB)) {
    return {
      valid: false,
      error: `File is too large (${formatFileSize(file.size)}). Maximum allowed: ${maxMB} MB.`,
    };
  }

  return { valid: true };
}

export function generateDownloadName(
  originalName: string | null,
  format: string = 'txt'
): string {
  if (originalName) {
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    return `ocr_${baseName}.${format}`;
  }
  return `ocr_result_${Date.now()}.${format}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);

  return `${size % 1 === 0 ? size : size.toFixed(1)} ${units[i]}`;
}

export function getAcceptedFormats(): string[] {
  return ['JPG', 'PNG', 'WebP', 'BMP', 'TIFF'];
}
