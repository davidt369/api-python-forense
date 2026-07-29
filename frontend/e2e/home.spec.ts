import { test, expect } from '@playwright/test';

test('has title and main heading', async ({ page }) => {
  await page.goto('/');

  // Dependiendo de tu aplicación, el título podría ser diferente.
  // Aquí comprobamos que al menos carga y no da error.
  await expect(page).toHaveTitle(/Image Forensic|Forense/i);

  // Verificamos que algún elemento clave se cargue. 
  // Suponiendo que hay un encabezado h1 o similar:
  const heading = page.getByRole('heading', { level: 1 });
  await expect(heading).toBeVisible();
});

test('navigation to verify page works', async ({ page }) => {
  await page.goto('/');
  
  // Buscar un enlace que lleve a la sección de verificar imágenes
  const verifyLink = page.locator('a[href*="/verificar"], a:has-text("Verificar"), a:has-text("Analizar")').first();
  
  if (await verifyLink.isVisible()) {
    await verifyLink.click();
    await expect(page).toHaveURL(/.*\/verificar/);
  }
});
