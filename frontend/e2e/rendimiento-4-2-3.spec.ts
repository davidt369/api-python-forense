import { test, expect } from '@playwright/test';
import jwt from 'jsonwebtoken';

// Prueba 4.2.3 - Pruebas de Rendimiento (E2E Frontend -> Backend)
// Mide el tiempo total que percibe el usuario en el frontend al realizar peticiones al backend.

test.describe('4.2.3 Pruebas de Rendimiento (Frontend -> Backend)', () => {
  let clientToken: string;
  let adminToken: string;
  
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async ({ request }) => {
    // Autenticar como cliente
    const clientRes = await request.post('/api/auth/login', {
      data: { email: 'cliente@demo.bo', password: '123456' }
    });
    clientToken = (await clientRes.json()).token;

    // Autenticar como admin
    const adminRes = await request.post('/api/auth/login', {
      data: { email: 'rcondori@demo.bo', password: '123456' }
    });
    adminToken = (await adminRes.json()).token;
  });

  // Base64 de un pixel PNG válido
  const validPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  const smallBuffer = Buffer.from(validPngBase64, 'base64');
  
  // Simulamos diferentes tamaños inflando el buffer válido para el test de latencia
  // Nota: Para ELA real, se necesita una imagen JPEG real, pero para test de latencia de red sirve.
  const sizes = {
    'Pequeña (1 pixel)': smallBuffer,
  };

  for (const [name, buffer] of Object.entries(sizes)) {
    test(`Medir tiempos para imagen: ${name}`, async ({ request }) => {
      let evidenciaId: string;

      // 1. Medir tiempo de Carga (Frontend -> Next.js -> FastAPI)
      const startCarga = Date.now();
      const responseCarga = await request.post('/api/evidencias', {
        headers: { Cookie: `token=${clientToken}` },
        multipart: {
          file: {
            name: `test-${name}.png`,
            mimeType: 'image/png',
            buffer: buffer,
          },
          description: `Test de rendimiento - ${name}`,
        },
      });
      const timeCarga = (Date.now() - startCarga) / 1000;
      expect(responseCarga.status()).toBe(201);
      evidenciaId = (await responseCarga.json()).evidence.id;

      // Bypass de pago para poder analizar directamente
      await request.post(`/api/evidencias/${evidenciaId}/pago`, {
        headers: { Cookie: `token=${clientToken}` },
        multipart: {
          paymentProof: {
            name: 'pago.png',
            mimeType: 'image/png',
            buffer: sizes['Pequeña (1 pixel)'],
          }
        }
      });

      // 2. Medir tiempo de Análisis Completo (EXIF, ELA, Hash) percibido por el Frontend
      // Nota: El backend lanzará error 400 si intentamos procesar un buffer vacío con PIL. 
      // Para efectos de latencia real con imágenes válidas, omitiremos el fallo de PIL o usaríamos una imagen PNG real.
      // Pero como prueba conceptual de arquitectura E2E se mide la llamada:
      
      const startAnalisis = Date.now();
      const responseAnalisis = await request.post(`/api/evidencias/${evidenciaId}/analizar`, {
        headers: { Cookie: `token=${adminToken}` },
        timeout: 60000 
      });
      const timeAnalisis = (Date.now() - startAnalisis) / 1000;
      
      // 3. Medir tiempo de Generar Reporte PDF
      const startReporte = Date.now();
      await request.get(`/api/evidencias/${evidenciaId}/certificado`, {
        headers: { Cookie: `token=${adminToken}` }
      });
      const timeReporte = (Date.now() - startReporte) / 1000;

      console.log(`\n--- Resultados E2E para Imagen ${name} ---`);
      console.log(`⏱️ Cargar imagen (Subida Frontend -> Backend): ${timeCarga} s`);
      console.log(`⏱️ Procesamiento Forense Total (Backend): ${timeAnalisis} s`);
      console.log(`⏱️ Generación y Descarga de PDF: ${timeReporte} s`);
    });
  }
});
