import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('4.2.4 Pruebas de Seguridad Visuales (UI)', () => {
  // Configurar Playwright para tomar capturas
  test.use({ viewport: { width: 1280, height: 720 } });

  test('1. Contraseña incorrecta -> Acceso denegado (Captura Visual)', async ({ page }) => {
    // 1. Ir a la página de login
    await page.goto('/auth/login');
    
    // 2. Llenar credenciales incorrectas
    await page.fill('input[id="email"]', 'cliente@demo.bo');
    await page.fill('input[id="password"]', 'contrasenaincorrecta123');
    
    // 3. Hacer clic en iniciar sesión
    await page.click('button[type="submit"]');
    
    // 4. Esperar a que aparezca el mensaje de error de credenciales
    const errorMsg = page.locator('text=Credenciales inválidas');
    await expect(errorMsg).toBeVisible({ timeout: 5000 });
    
    // 5. Tomar CAPTURA DE PANTALLA
    await page.screenshot({ path: 'test-results/captura_1_login_denegado.png' });
  });

  test('3. Archivo no permitido (.exe) -> Rechazado (Captura Visual)', async ({ page, request }) => {
    // Hacemos el login válido primero
    await page.goto('/auth/login');
    await page.fill('input[id="email"]', 'cliente@demo.bo');
    await page.fill('input[id="password"]', '123456');
    await page.click('button[type="submit"]');
    
    // Esperar a estar en el dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    
    // Ir a subir evidencia
    await page.goto('/dashboard/evidencias/nueva');
    
    // Rellenar descripción
    await page.fill('textarea', 'Intento de subir un archivo exe malicioso');
    
    // Crear un archivo ficticio .exe para subirlo por el input file
    const buffer = Buffer.from('archivo ejecutable malicioso', 'utf-8');
    
    await page.setInputFiles('input[type="file"]', {
      name: 'virus.exe',
      mimeType: 'application/x-msdownload',
      buffer: buffer,
    });
    
    // Clic en registrar
    await page.click('button[type="submit"]');
    
    // Esperar el toast o mensaje de error visual (toast: "Solo se permiten imágenes")
    const errorToast = page.locator('text=Solo se permiten imágenes');
    await expect(errorToast).toBeVisible({ timeout: 5000 });
    
    // Tomar CAPTURA DE PANTALLA
    await page.screenshot({ path: 'test-results/captura_3_archivo_rechazado.png' });
  });
});
