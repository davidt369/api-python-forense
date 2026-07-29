# Documento Técnico: Prueba de Concepto (PoC) Multimedia
**Examen Práctico Final**

---

## 1. Información General de la Funcionalidad

**Nombre de la funcionalidad:**
Suite Forense Multimedia Interactiva (Prueba de Concepto - PoC)

**Objetivo:**
Proveer un entorno integrado en la web para el análisis visual y forense de evidencias multimedia, permitiendo a los peritos interactuar con imágenes (análisis ELA, separación RGB, lupas, filtros) y modelos 3D en tiempo real directamente desde el navegador.

**Problema que resuelve:**
Normalmente, el análisis de evidencias digitales requiere que el investigador descargue los archivos y utilice múltiples softwares de escritorio de terceros, que suelen ser pesados y desconectados del sistema principal. Esta PoC resuelve ese problema centralizando un "laboratorio preliminar" en la propia plataforma web, agilizando la inspección de metadatos visuales y posibles manipulaciones.

**Descripción técnica:**
Se desarrolló una SPA (Single Page Application) modular dentro de Next.js. El procesamiento de las imágenes (como la aplicación de filtros matemáticos, separación espectral RGB, y generación de ELA - Error Level Analysis) se realiza del lado del cliente mediante la manipulación de pixeles en **HTML5 Canvas**. Para la visualización tridimensional interactiva se implementó un entorno con **WebGL** utilizando el motor de Three.js encapsulado en componentes de React. El manejo de estado global a nivel de página coordina el flujo de un archivo subido de forma dinámica hacia todas las herramientas (pestañas) simultáneamente.

**Tecnologías utilizadas:**
*   **Frontend Core:** Next.js 14, React 19, TypeScript
*   **Estilos y UI:** Tailwind CSS, Shadcn UI, Lucide React (iconos), animaciones nativas CSS.
*   **Procesamiento de Imágenes:** HTML5 Canvas API nativa.
*   **Visor 3D:** Three.js, `@react-three/fiber`, `@react-three/drei` (WebGL).

**Capturas de pantalla:**
*(Nota para la entrega: Reemplaza las siguientes rutas por tus capturas reales)*
*   ![Visor 3D](./screenshots/visor-3d.png)
*   ![Motor ELA](./screenshots/motor-ela.png)
*   ![Lab de Filtros](./screenshots/lab-filtros.png)

**Posible integración con el proyecto principal:**
Al estar construido mediante componentes funcionales aislados e independientes (ej: `<ElaGenerator imageUrl={...} />`), la integración en el proyecto de equipo es directa. Estos componentes pueden incrustarse en la pantalla de "Detalle de Evidencia" del dashboard actual. El frontend solo necesita recibir la URL del archivo gestionado por la **API en Python**, pasarlo como `prop` a las herramientas y la PoC se encargará de renderizar la interfaz de análisis.

---

## 2. Defensa y Demostración Funcional (Cuestionario)

Esta sección responde a las preguntas clave para la sustentación del examen.

**¿Cuál fue la necesidad identificada?**
Se identificó la falta de interactividad en el manejo de evidencias multimedia en la plataforma. Las imágenes simplemente se mostraban de forma estática. Era necesario darle al investigador herramientas interactivas preliminares (lupa de precisión, análisis espectral, y visor de modelos tridimensionales) para detectar anomalías antes de enviar la evidencia a un análisis más profundo.

**¿Por qué decidió desarrollar esa funcionalidad?**
Porque aporta un enorme valor agregado a una plataforma de informática forense. Convertir un repositorio de evidencias pasivo en un entorno de trabajo activo (un laboratorio en el navegador) marca un diferencial enorme en innovación y experiencia de usuario.

**¿Qué tecnologías utilizó?**
Principalmente el ecosistema web moderno: **React (Next.js)** para la reactividad y enrutamiento, **HTML5 Canvas** para manipular los pixeles de las imágenes matemáticamente a bajo nivel en el navegador, y **Three.js (React Three Fiber)** para habilitar la renderización 3D usando la tarjeta gráfica del cliente mediante WebGL.

**¿Qué dificultades encontró?**
1.  **Rendimiento en el procesamiento de imágenes:** Al manipular grandes imágenes píxel por píxel (por ejemplo, en el separador RGB o el Motor ELA), el hilo principal (main thread) del navegador tendía a bloquearse.
2.  **Configuración del Canvas 3D:** Lograr la iluminación, la rotación adecuada y ajustar la cámara de forma dinámica para que cualquier modelo 3D sea visible sin que la pantalla quede en blanco o deformada.
3.  **Gestión dinámica de archivos locales:** Coordinar que una única imagen subida por el usuario con el componente de Drag & Drop (`DynamicUploader`) se actualizara instantáneamente en 5 pestañas de análisis distintas sin romper el estado de React.

**¿Cómo las resolvió?**
1.  Para el rendimiento visual en canvas, me aseguré de usar referencias (`useRef`) optimizadas, dibujar solo cuando el estado del componente estaba montado, y utilizar `drawImage` adecuadamente limitando resoluciones extremas a un ancho máximo en el lienzo.
2.  En 3D, utilicé ayudantes del paquete `@react-three/drei` como `<Stage>` (que auto-centra e ilumina el modelo) y `<OrbitControls>` para delegar las matemáticas de la cámara.
3.  Elevé el estado de la imagen (`activeImage`) al componente padre (`PagePoc3D`), pasándolo como *prop* hacia los hijos, de modo que React se encarga de re-renderizar todas las herramientas automáticamente cuando se carga una nueva evidencia.

**¿Cómo se integraría al proyecto del equipo?**
Es altamente modular. Simplemente se copia la carpeta de los componentes al proyecto grupal y se importan en la ruta deseada. Cuando la API en Python sirva el registro de la evidencia con su respectiva URL (desde un bucket S3, Cloudinary o directorio de estáticos), esa URL se pasa como atributo (`src` o `imageUrl`) a mis componentes multimedia.

**¿Qué beneficios aportaría?**
Aportaría velocidad de reacción y retención del usuario. El perito forense podría realizar análisis de falsificación de imágenes (ELA), descubrir marcas de agua ocultas (modificando canales de color) o rotar un arma/objeto modelado en 3D **sin abandonar el sistema del equipo**, ahorrando tiempo valioso.

**¿Qué mejoras implementaría en una siguiente versión?**
1.  **Offload a Servidor (Python):** Mover el procesamiento matemático intensivo (como algoritmos ELA más complejos) hacia el backend con la API Python utilizando `OpenCV`, para mejorar los tiempos en imágenes de ultra alta resolución (4K+).
2.  **Exportación de Reportes:** Agregar un botón para generar automáticamente un reporte en PDF capturando el estado de los filtros y un resumen del análisis.
3.  **Soporte Multi-Formato 3D:** Extender el soporte del visor de modelos para aceptar formatos `.obj` y `.fbx` además de `gltf/glb`.
