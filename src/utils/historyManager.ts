export interface HistoryEntry {
  id: string;
  fileName: string;
  text: string;
  preview: string;
  timestamp: number;
  confidence?: number;
}

export interface StorageProvider {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const STORAGE_KEY = 'web-ocr-history';
const MAX_ENTRIES = 50;

function getStorage(): StorageProvider {
  return localStorage;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function createPreview(text: string, maxLength: number = 100): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength) + '…';
}

export function getHistory(storage: StorageProvider = getStorage()): HistoryEntry[] {
  try {
    const data = storage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addToHistory(
  entry: { fileName: string; text: string; confidence?: number },
  storage: StorageProvider = getStorage()
): HistoryEntry {
  const history = getHistory(storage);

  const newEntry: HistoryEntry = {
    id: generateId(),
    fileName: entry.fileName,
    text: entry.text,
    preview: createPreview(entry.text),
    timestamp: Date.now(),
    confidence: entry.confidence,
  };

  history.unshift(newEntry);

  // Enforce limit
  if (history.length > MAX_ENTRIES) {
    history.splice(MAX_ENTRIES);
  }

  storage.setItem(STORAGE_KEY, JSON.stringify(history));
  return newEntry;
}

export function getHistoryEntry(
  id: string,
  storage: StorageProvider = getStorage()
): HistoryEntry | undefined {
  return getHistory(storage).find((e) => e.id === id);
}

export function deleteFromHistory(
  id: string,
  storage: StorageProvider = getStorage()
): boolean {
  const history = getHistory(storage);
  const filtered = history.filter((e) => e.id !== id);

  if (filtered.length === history.length) return false;

  storage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

export function clearHistory(storage: StorageProvider = getStorage()): void {
  storage.removeItem(STORAGE_KEY);
}

export function searchHistory(
  query: string,
  storage: StorageProvider = getStorage()
): HistoryEntry[] {
  if (!query.trim()) return getHistory(storage);

  const lowerQuery = query.toLowerCase();
  return getHistory(storage).filter(
    (entry) =>
      entry.fileName.toLowerCase().includes(lowerQuery) ||
      entry.text.toLowerCase().includes(lowerQuery)
  );
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}
