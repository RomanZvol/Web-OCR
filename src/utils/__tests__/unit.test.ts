import { describe, it, expect } from 'vitest';

// --- Імпорти з утилітних модулів ---
import { getTextStats, cleanText, searchInText, highlightMatches } from '../textProcessing';
import { validateFile } from '../fileValidation';
import { exportAsJson, exportAsCsv } from '../exportUtils';
import {
  addToHistory, getHistory, deleteFromHistory, searchHistory,
  type StorageProvider,
} from '../historyManager';

// --- Хелпер: mock File ---
function createMockFile(name: string, size: number, type: string): File {
  const blob = new Blob(['x'.repeat(size)], { type });
  return new File([blob], name, { type });
}

// --- Mock-об'єкт для localStorage (ізоляція від реального сховища) ---
function createMockStorage(): StorageProvider {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
  };
}

// =================================================================
//  UNIT TESTS — 7 тестів для бізнес-логіки Web-OCR
// =================================================================

describe('Web-OCR Unit Tests', () => {

  // Тест 1: Підрахунок слів та статистика тексту (Assertions)
  it('Test 1: getTextStats — correctly computes text statistics', () => {
    const text = 'Привіт світ.\nДругий рядок.';
    const stats = getTextStats(text);
    expect(stats.words).toBe(30);
    expect(stats.characters).toBe(text.length);
    expect(stats.charactersNoSpaces).toBe(text.replace(/\s/g, '').length);
    expect(stats.lines).toBe(2);
    expect(stats.sentences).toBe(2);
  });

  // Тест 2: Очищення тексту від зайвих пробілів та рядків
  it('Test 2: cleanText — removes excessive whitespace', () => {
    const dirty = '  hello    world  \n\n\n\n  bye  ';
    const clean = cleanText(dirty);
    expect(clean).toBe('hello world\n\nbye');
    expect(cleanText('')).toBe('');
  });

  // Тест 3: Пошук та підсвітка тексту (searchInText + highlightMatches)
  it('Test 3: searchInText + highlightMatches — finds and highlights matches', () => {
    const text = 'OCR works great. OCR is fast.';
    const result = searchInText(text, 'OCR');
    expect(result.count).toBe(2);
    expect(result.positions).toEqual([0, 17]);

    const segments = highlightMatches(text, 'OCR');
    expect(segments[0]).toEqual({ text: 'OCR', highlighted: true });
    expect(segments[1].highlighted).toBe(false);
    expect(segments[2]).toEqual({ text: 'OCR', highlighted: true });
  });

  // Тест 4: Валідація файлів (тип + розмір)
  it('Test 4: validateFile — accepts valid images, rejects invalid files', () => {
    const validFile = createMockFile('photo.jpg', 5000, 'image/jpeg');
    expect(validateFile(validFile).valid).toBe(true);

    const pdfFile = createMockFile('doc.pdf', 5000, 'application/pdf');
    expect(validateFile(pdfFile).valid).toBe(false);
    expect(validateFile(pdfFile).error).toContain('Unsupported');

    const hugeFile = createMockFile('big.png', 15 * 1024 * 1024, 'image/png');
    expect(validateFile(hugeFile).valid).toBe(false);
    expect(validateFile(hugeFile).error).toContain('too large');
  });

  // Тест 5: Експорт у JSON з метаданими
  it('Test 5: exportAsJson — generates valid JSON with metadata', () => {
    const result = exportAsJson('Hello\nWorld', { fileName: 'scan.png', confidence: 92 });
    const parsed = JSON.parse(result.content);
    expect(parsed.text).toBe('Hello\nWorld');
    expect(parsed.wordCount).toBe(2);
    expect(parsed.lines).toHaveLength(2);
    expect(parsed.metadata.fileName).toBe('scan.png');
    expect(parsed.metadata.confidence).toBe(92);
    expect(result.mimeType).toBe('application/json');
  });

  // Тест 6: Експорт у CSV (з екрануванням лапок)
  it('Test 6: exportAsCsv — creates correct CSV with escaping', () => {
    const result = exportAsCsv('First line\nHe said "hello"');
    const lines = result.content.split('\n');
    expect(lines[0]).toBe('Line Number,Content');
    expect(lines[1]).toBe('1,"First line"');
    expect(lines[2]).toContain('""hello""'); // escaped quotes
    expect(result.extension).toBe('csv');
  });

  // Тест 7: Історія розпізнавань з Mock Storage (CRUD + пошук)
  it('Test 7: historyManager — CRUD operations with mock storage', () => {
    const storage = createMockStorage();

    // Додавання
    const entry1 = addToHistory({ fileName: 'passport.jpg', text: 'Іванов Іван' }, storage);
    const entry2 = addToHistory({ fileName: 'receipt.png', text: 'Total: 500 UAH' }, storage);
    expect(getHistory(storage)).toHaveLength(2);

    // Пошук
    const found = searchHistory('паспорт', storage); // шукає по fileName — not found
    expect(found).toHaveLength(0);
    const found2 = searchHistory('passport', storage);
    expect(found2).toHaveLength(1);
    expect(found2[0].fileName).toBe('passport.jpg');

    // Видалення
    deleteFromHistory(entry1.id, storage);
    expect(getHistory(storage)).toHaveLength(1);
    expect(getHistory(storage)[0].id).toBe(entry2.id);
  });
});
