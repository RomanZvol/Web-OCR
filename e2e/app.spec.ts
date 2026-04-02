import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * E2E Тест 1: Завантаження зображення та запуск розпізнавання (критичний шлях)
 *
 * Сценарій: Користувач завантажує зображення → бачить зону обрізки →
 *           натискає "Scan Selected Area" → бачить прогрес OCR.
 */
test('E2E 1: Upload image and start OCR recognition', async ({ page }) => {
  await page.goto('/');

  // Перевіряємо початковий стан інтерфейсу
  await expect(page.locator('h1')).toContainText('VisionOCR');
  await expect(page.locator('text=Click or Drop Image Here')).toBeVisible();
  await expect(page.locator('text=Extracted Text')).toBeVisible();

  // Зона завантаження відображає підтримувані формати
  await expect(page.locator('text=Supports JPG, PNG, WebP, BMP, TIFF')).toBeVisible();

  // Завантажуємо тестове зображення через file input
  const fileInput = page.locator('input[type="file"]');
  const testImagePath = path.resolve(__dirname, 'fixtures', 'test-image.png');
  await fileInput.setInputFiles(testImagePath);

  // Після завантаження має з'явитися зона обрізки з кнопкою Scan
  await expect(page.locator('text=Scan Selected Area')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('text=Adjust the box to select text region')).toBeVisible();

  // Кнопка Reset доступна
  await expect(page.locator('text=Reset')).toBeVisible();

  // Натискаємо "Scan Selected Area" — запускаємо OCR
  await page.click('text=Scan Selected Area');

  // Перевіряємо що OCR процес запустився (з'являється індикатор прогресу)
  await expect(page.locator('.progress-bar')).toBeVisible({ timeout: 5000 });
});

/**
 * E2E Тест 2: Валідація файлу та навігація історії
 *
 * Сценарій: Користувач намагається завантажити невалідний файл →
 *           бачить помилку → потім відкриває панель історії.
 */
test('E2E 2: File validation error and history panel interaction', async ({ page }) => {
  await page.goto('/');

  // Перевіряємо початковий стан
  await expect(page.locator('text=Click or Drop Image Here')).toBeVisible();

  // Спробуємо завантажити невалідний файл (text file)
  const fileInput = page.locator('input[type="file"]');
  const invalidFilePath = path.resolve(__dirname, 'fixtures', 'invalid-file.txt');
  await fileInput.setInputFiles(invalidFilePath);

  // Має з'явитися помилка валідації
  await expect(page.locator('.validation-error')).toBeVisible({ timeout: 3000 });
  await expect(page.locator('.validation-error')).toContainText('Unsupported');

  // Зона завантаження все ще відображається (не перейшли до кропу)
  await expect(page.locator('text=Invalid File')).toBeVisible();

  // Перевіряємо роботу панелі історії
  const historyBtn = page.locator('text=History');
  await expect(historyBtn).toBeVisible();
  await historyBtn.click();

  // Панель історії розгорнулась
  await expect(page.locator('text=Recognition History')).toBeVisible({ timeout: 3000 });

  // Поле пошуку доступне
  await expect(page.locator('input[placeholder="Search history..."]')).toBeVisible();
});
