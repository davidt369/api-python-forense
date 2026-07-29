# Respuestas para la Defensa del Examen Práctico Final

A continuación se presentan las respuestas técnicas estructuradas para defender la Prueba de Concepto (PoC) Multimedia desarrollada durante la evaluación.

### 1. ¿Cuál fue la necesidad identificada?
Durante el desarrollo del sistema forense original, se identificó que los analistas y peritos carecían de herramientas avanzadas para inspeccionar visualmente la evidencia de forma dinámica. La revisión se limitaba a visualizar imágenes estáticas (2D), lo que obligaba al usuario a alternar pestañas manualmente para comparar una imagen original con su análisis de metadatos (ELA). Esto genera fatiga visual, lentitud en el flujo de trabajo y dificulta la detección de artefactos y alteraciones sutiles creadas por IA o manipulación digital.

### 2. ¿Por qué decidió desarrollar esa funcionalidad?
Decidí desarrollar una **"Suite Forense Multimedia"** en el cliente (Frontend) porque las tecnologías emergentes como WebGL y HTML5 Canvas permiten trasladar la carga del análisis computacional directamente al dispositivo del usuario. Al implementar Modelos 3D, un Comparador de Imágenes (Slider), un Zoom Inteligente y un Laboratorio de Procesamiento de Píxeles en tiempo real, se mejora exponencialmente la Experiencia de Usuario (UX). El perito ahora puede interactuar fluidamente con la evidencia de manera natural y ergonómica.

### 3. ¿Qué tecnologías utilizó?
- **Next.js 14 y React 19:** Como framework principal para la arquitectura del frontend y renderizado.
- **Three.js y React Three Fiber:** Para renderizar la evidencia en un entorno 3D (WebGL) inmersivo con sombras (PCFShadowMap) e iluminación ambiental.
- **HTML5 Canvas API:** Para la manipulación algorítmica de los píxeles (ImageData) en el "Lab de Filtros".
- **Tailwind CSS y Shadcn UI:** Para estilizar la interfaz, crear tarjetas, botones y pestañas responsivas y animadas.
- **jsPDF:** Para la generación automática de los reportes forenses resultantes directamente desde el cliente.

### 4. ¿Qué dificultades encontró?
1. **Renderizado entrecortado del Canvas 3D:** En dispositivos móviles o pantallas estrechas, el contenedor 3D de Three.js colapsaba debido a conflictos con las reglas de 'flexbox' del diseño original, lo que provocaba que la mesa forense se viera recortada a una tira horizontal.
2. **Procesamiento síncrono de píxeles:** Aplicar algoritmos de matrices de convolución espacial (Sobel, Emboss) iterando sobre arreglos RGBA de millones de datos bloqueaba el hilo principal de renderizado de React (Main Thread UI), congelando la página.

### 5. ¿Cómo las resolvió?
1. **Para el conflicto de CSS (Flexbox):** Modifiqué las clases del contenedor padre estableciendo un tamaño fijo y envolví el Canvas 3D en un bloque con posición absoluta (`absolute inset-0`). Esto obligó al motor gráfico a ocupar el 100% de la caja de renderizado de forma forzosa. Adicionalmente, aumenté la resolución del 'ShadowMap' a 2048x2048 para evitar sombras pixeladas.
2. **Para el procesamiento de los filtros:** Implementé la manipulación de píxeles (`getImageData` / `putImageData`) en un entorno asíncrono controlado con un pequeño `setTimeout`. Esto permitió que React procesara los cambios de estado (como activar un indicador visual de carga/spinner) antes de que la CPU se ocupara con los pesados bucles matemáticos sobre la matriz de imagen.

### 6. ¿Cómo se integraría al proyecto del equipo?
Dado que desarrollé estas funcionalidades utilizando un enfoque de componentes atómicos y aislados ("micro-frontend"), la integración es inmediata. Solo es necesario importar la carpeta `components` dentro del proyecto original e incrustar la vista en el archivo de ruta dinámica `/admin/evidencias/[id]/page.tsx`. Los componentes pueden recibir directamente las URLs de la imagen original (`original.jpg`) y del análisis generado por Python (`ia.jpg`) mediante `props` (parámetros de React).

### 7. ¿Qué beneficios aportaría?
- **Autonomía del Cliente:** Procesamiento de filtros y reportes en tiempo real sin consumir recursos del servidor Python.
- **Ergonomía:** Menor fatiga visual gracias al control directo sobre las imágenes (lupa, slider).
- **Modernización:** Otorga a la plataforma un aspecto visual e interactivo de software forense premium de última generación.
- **Eficiencia:** Acelera el proceso pericial al unificar todas las herramientas multimedia en una sola ventana (Single Page Application).

### 8. ¿Qué mejoras implementaría en una siguiente versión?
Como demostración de visión a futuro, ya he integrado en esta misma PoC una pestaña de "Análisis Espectral" que simula lo que sería una suite forense verdaderamente profesional:
- **Separador de Canales RGB (Espectrometría Visual):** Herramienta técnica real en la que el usuario puede desglosar una imagen en sus tres canales base (Rojo, Verde y Azul) a través de HTML5 Canvas.
- Esto es fundamental en el mundo del análisis forense digital porque las alteraciones o montajes (inpainting) a menudo dejan rastros microscópicos que solo son perceptibles al aislar frecuencias de luz específicas. 
- A futuro real, conectaría este separador a un procesador en un **Web Worker** para lograr cero latencia y agregaría un Histograma de Color (Gráfico Estadístico) en tiempo real con librerías como Recharts.
