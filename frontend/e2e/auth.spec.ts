import { test, expect } from '@playwright/test';

test('auth page loads correctly', async ({ page }) => {
  await page.goto('/auth/login');

  // Verifica que el formulario de autenticación se muestre
  await expect(page.locator('form').first()).toBeVisible();
  
  // Busca el botón de submit (Login o Ingresar)
  const submitButton = page.locator('button[type="submit"]').first();
  await expect(submitButton).toBeVisible();
});
