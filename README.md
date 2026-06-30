# 🚌 alasRisas trip 🏖️

> **De Capurro al mundo, juntos siempre.** Una plataforma comunitaria y colaborativa diseñada para la autoorganización de viajes recreativos entre amigos, sin intermediarios, con cuentas claras y la mejor onda.

[![Sitio en Producción](https://img.shields.io/badge/Live-Sitio%20Web-brightgreen?style=for-the-badge)](https://alasrisas.netlify.app/)
[![Hecho por](https://img.shields.io/badge/Hecho%20con%20%E2%9D%A4%EF%B8%8F%20por-Kikiriya%20DevOps-blue?style=for-the-badge)](https://kikiriya-software.netlify.app/)
[![Estado del Proyecto](https://img.shields.io/badge/Status-Activo-orange?style=for-the-badge)](#)

---

## 🗺️ Sobre el Proyecto

**alasRisas trip** nace como una herramienta independiente construida para resolver la logística que implica mover a un batallón de amigos. Centraliza toda la información de la aventura de verano rumbo a **Florianópolis**, permitiendo coordinar fechas, registrarse en la lista de viaje y gestionar los costos compartidos de manera transparente, asegurando que *cuanta más gente se anote, más barato sea para todos*.

### 🚀 Características Principales

*   **🎬 Landing Inmersiva:** Experiencia de bienvenida interactiva con video introductorio y reproductor de audio ambiental.
*   **📝 Registro de la Banda ("T-Saludo"):** Sistema ágil para que los miembros se anoten en menos de 2 minutos y reserven su cupo en el autobús.
*   **💰 Calculadora de Finanzas Seguras:** Módulo privado (acceso mediante usuario y contraseña) para cargar costos fijos (traslado/hospedaje) y calcular la cuota equitativa automáticamente.
*   **📸 Galería Integrada:** Espacio interactivo de 12 capturas para dar un vistazo al paraíso que espera al grupo.
*   **❓ Sección Avanzada de FAQ:** Respuestas interactivas sobre presupuestos, reglas de convivencia del ómnibus, políticas de cancelación y planes de contingencia.
*   **📲 Canales de Comunicación rápidos:** Integración nativa con WhatsApp para invitar a más personas al viaje.

---

## 🛠️ Tecnologías Utilizadas

Este sitio está optimizado para una carga veloz, accesibilidad semántica y una experiencia móvil fluida utilizando:

*   **Estructura:** HTML5 Semántico (con foco en atributos `aria-*` y etiquetas de accesibilidad).
*   **Estilos:** CSS3 nativo (diseño responsive, transiciones suaves y variables personalizadas).
*   **Hosting & Deployment:** Netlify (CI/CD continuo desde el repositorio).
*   **Herramientas & Assets:** Integración multimedia optimizada (videos ligeros, WebP, SVG) y soporte técnico por **Kikiriya Software**.

---

## 📂 Estructura de Archivos (Sugerida)

```text
├── assets/             # SVGs, íconos de calificación y gifs de interacción
├── imgs/               # Imágenes optimizadas (.webp) y videos de la interfaz (.mp4)
├── index.html          # Documentación semántica principal y secciones
├── README.md           # El archivo que estás leyendo ahora
└── [styles/scripts]    # Archivos de lógica y personalización visual
