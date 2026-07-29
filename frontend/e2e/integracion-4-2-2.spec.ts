import { test, expect } from '@playwright/test';

// Prueba 4.2.2 - Pruebas de Integración (Flujo Completo E2E por API)
// Valida que los módulos se comuniquen correctamente entre sí.

test.describe('4.2.2 Pruebas de integración - Flujo Completo', () => {
  let evidenciaId: string;
  let hashGenerado: string;
  let clientToken: string;
  let adminToken: string;
  
  test.describe.configure({ mode: 'serial' }); // Deben ejecutarse en orden

  test.beforeAll(async ({ request }) => {
    // Autenticar como cliente
    const clientRes = await request.post('/api/auth/login', {
      data: { email: 'cliente@demo.bo', password: '123456' }
    });
    const clientData = await clientRes.json();
    clientToken = clientData.token;

    // Autenticar como admin/perito
    const adminRes = await request.post('/api/auth/login', {
      data: { email: 'rcondori@demo.bo', password: '123456' }
    });
    const adminData = await adminRes.json();
    adminToken = adminData.token;
  });

  // Creamos un buffer de imagen simulado (1x1 pixel PNG)
  const dummyImageBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    'base64'
  );

  test('1. Registro + Base de datos (Subir evidencia)', async ({ request }) => {
    // Simulamos el envío del formulario multipart desde el frontend
    const response = await request.post('/api/evidencias', {
      headers: { Cookie: `token=${clientToken}` },
      multipart: {
        file: {
          name: 'evidencia-prueba.png',
          mimeType: 'image/png',
          buffer: dummyImageBuffer,
        },
        description: 'Prueba de integración 4.2.2',
      },
    });

    // Verificamos que el módulo de registro se comunicó con la BD correctamente
    expect(response.status()).toBe(201);
    const data = await response.json();
    
    expect(data).toHaveProperty('evidence');
    expect(data.evidence).toHaveProperty('id');
    expect(data.evidence.status).toBe('PENDIENTE');
    
    // Guardamos el ID para las siguientes pruebas
    evidenciaId = data.evidence.id;
  });

  test('2. Base de datos + Pagos (Cambio de estado)', async ({ request }) => {
    // Simulamos el pago para que la evidencia pase a estar lista para análisis
    const response = await request.post(`/api/evidencias/${evidenciaId}/pago`, {
      headers: { Cookie: `token=${clientToken}` },
      multipart: {
        paymentProof: {
          name: 'comprobante.png',
          mimeType: 'image/png',
          buffer: dummyImageBuffer,
        }
      }
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    
    expect(data).toHaveProperty('message');
    expect(data.message).toContain('Comprobante de pago recibido');
  });

  test('3. Base de datos + API Python (ELA y Metadatos)', async ({ request }) => {
    // Forzamos el análisis (comunicación Frontend -> Base de Datos -> FastAPI Python)
    const response = await request.post(`/api/evidencias/${evidenciaId}/analizar`, {
      headers: { Cookie: `token=${adminToken}` },
      timeout: 30000 // Puede tardar si el servidor de Python está procesando
    });

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('analysis');
    expect(data.analysis.elaResult).toBeDefined();
    
    // Extraemos el hash para la validación del certificado (si existe en los resultados)
    if (data.forensicResult?.hashes?.cryptographic?.md5) {
      hashGenerado = data.forensicResult.hashes.cryptographic.md5;
    }
  });

  test('4. Metadatos/ELA + Reporte PDF (Generación de Certificado)', async ({ request }) => {
    // Generamos el certificado (vincula el análisis final con el PDF Generator)
    const response = await request.post(`/api/evidencias/${evidenciaId}/certificado`, {
      headers: { Cookie: `token=${adminToken}` }
    });
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    
    expect(data.certificate).toBeDefined();
    expect(data.certificate.certificateHash).toBeDefined();
    
    // Ahora probamos la descarga del PDF
    const pdfResponse = await request.get(`/api/evidencias/${evidenciaId}/certificado`, {
      headers: { Cookie: `token=${adminToken}` }
    });
    
    // Verificamos que el reporte se generó y devolvió el PDF correctamente
    expect(pdfResponse.status()).toBe(200);
    expect(pdfResponse.headers()['content-type']).toContain('application/pdf');
    
    // Validamos que sea un PDF válido (su encabezado comienza con %PDF)
    const pdfBytes = await pdfResponse.body();
    const pdfHeader = pdfBytes.subarray(0, 4).toString();
    expect(pdfHeader).toBe('%PDF');
  });
});
