# alasRisas Trip

**El viaje grupal que siempre soñaron: Florianópolis 2026**

> Playas paradisiacas, aventuras con amigos del barrio y recuerdos para toda la vida. Esta vez sí va!

[![Netlify Status](https://api.netlify.com/api/v1/badges/deploy-status)](https://app.netlify.com/sites/alasrisas/deploys)

**[alasrisas.netlify.app](https://alasrisas.netlify.app/)** | [Instagram @alasrisas_trip](https://www.instagram.com/alasrisas_trip/)

---

## Descripción

Aplicación web comunitaria para organizar un viaje grupal de amigos del barrio de Capurro, Montevideo, Uruguay a Florianópolis, Brasil en diciembre de 2026. Centraliza registro de participantes, control de aportes financieros, galería de fotos, preguntas frecuentes y comunicación del grupo.

## Fortalezas

### Rendimiento y Velocidad de Carga

- **Cero framework** — Vanilla JavaScript puro, sin overhead de React/Vue/Angular. Carga instantánea sin bundle de framework.
- **LCP optimizado** — Imagen hero en `webp` con `preload`, `fetchpriority="high"` y dimensiones explícitas para evitar layout shift (CLS).
- **Lazy loading nativo** — Todas las imágenes de galería, avatares y pie de página usan `loading="lazy" decoding="async"`.
- **Audio bajo demanda** — Música de fondo con `preload="none"`, solo carga cuando el usuario presiona play.
- **Throttle inteligente** — `requestAnimationFrame` y `rafThrottle()` en handlers de scroll para evitar thrashing.
- **Scroll pasivo** — Todos los listeners de scroll registrados con `{ passive: true }`.
- **Cache en memoria** — `DataService` y `WalletService` mantienen caché `_usersCache` para evitar llamadas API redundantes.
- **Fallback offline** — Si la API no está disponible, la app funciona completamente con `localStorage` como almacenamiento local, y sincroniza cuando vuelve la conexión.
- **Preconnect de fuentes** — `fonts.googleapis.com` y `fonts.gstatic.com` con `crossorigin` para carga paralela de tipografías.
- **Contain CSS** — `.landing-content` usa `contain: layout paint` para aislar renders costosos.
- **`will-change` temporal** — Aplicado solo durante animaciones y removido vía `transitionend` para liberar compositor.

### Accesibilidad (a11y)

| Característica | Implementación |
|---|---|
| HTML semántico | `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, `<aside>`, `<table>` |
| ARIA completo | `aria-label`, `aria-expanded`, `aria-hidden`, `aria-controls`, `aria-pressed`, `aria-modal`, `aria-required`, `aria-describedby`, `aria-invalid` |
| Regiones live | `aria-live="polite"` en toasts, `role="alert"` en errores de formulario |
| Texto visualmente oculto | Clase `.visually-hidden` para contenido solo para lectores de pantalla |
| Navegación por teclado | FAQ (botones nativos), carrusel (flechas), Escape cierra lightbox/modales |
| Focus management | Focus se mueve al primer campo inválido en errores; lightbox captura focus |
| `:focus-visible` | Estilos explícitos en botones, links y toggle de tema |
| `prefers-reduced-motion` | Desactiva todas las animaciones y transiciones cuando el usuario lo solicita |
| `prefers-color-scheme` | Tema claro/oscuro respeta preferencia del sistema en primera visita |
| `lang="es"` | Atributo de idioma correctamente configurado |
| Touch targets | Botones mínimo 36x36px; legales mínimo 44px de alto |
| `font-size: 1rem` | Inputs a 16px para prevenir zoom automático en iOS |
| `autocomplete` | Campos de formulario con `given-name`, `new-password`, `family-name` |
| `inputmode="numeric"` | Input de wallet para teclado numérico en móviles |

### Diseño y Experiencia de Usuario

- **Tema claro/oscuro** — Toggle persistente con `localStorage` y respeto a preferencia del sistema.
- **Splash animado** — Pantalla de inicio con animación de expansión que revela la imagen de Florianópolis.
- **Carrusel interactivo** — 16 imágenes con autoplay, dots, swipe táctil, lightbox modal y barra de progreso.
- **Contador regresivo** — Timer en tiempo real hasta el 26/12/2026 con animación de caída en cada cambio de valor.
- **FAQ acordeón** — 13 preguntas con comportamiento accordion (una abierta a la vez).
- **Toast notifications** — Sistema de notificaciones no bloqueantes (éxito, error, advertencia, info).
- **Reproductor de audio** — Botón flotante que aparece al 80% de scroll con control play/pause.
- **Botón WhatsApp** — Contacto directo con mensaje predefinido, aparece al 50% de scroll.
- **Scroll to top** — Botón de retorno al inicio con smooth scroll.
- **Responsive completo** — Sidebar mobile con hamburger, layouts adaptivos, `100dvh` y `100svh`.

### Funcionalidades de la App

- **Registro/Login** — Formulario con validación, subida de avatar (comprimido a WebP 150x150 vía Canvas), nick opcional.
- **Billetera individual** — Cada usuario registra aportes y retiros en UYU con historial completo y meta de $200,000 UYU.
- **Muro de comentarios** — CRUD completo: crear, leer, editar y eliminar comentarios (500 caracteres máx.).
- **Panel de usuario** — Perfil con avatar, tabs para comentarios/billetera/editar/cerrar sesión.
- **Estadísticas** — Contador animado de viajeros, cálculo de costo por persona, meta financiera visible.
- **Tabla de amigos** — Lista de todos los participantes con avatar, nombre, nick y botón de detalle.
- **Legal y pie** — Disclaimer, aviso legal, política de privacidad, términos de uso, soporte y cookies en acordeón.

### SEO y Social

- Meta tags completos (descripción, keywords, robots, autor, idioma)
- Open Graph para compartir en redes sociales
- Twitter Card tags
- JSON-LD estructurado (FAQ, Event, Organization, WebSite)
- Canonical URL configurada

## Estructura del Proyecto

```
alasrisasTrip/
├── index.html                  # SPA completa (HTML único)
├── package.json                # Configuración del proyecto
├── netlify.toml                # Configuración de Netlify (CORS, redirects, functions)
├── css/
│   ├── base.css                # Reset CSS, tokens de diseño, animaciones, utilidades
│   └── components.css          # Estilos de todos los componentes
├── js/
│   ├── main.js                 # Punto de entrada, orquestador de módulos
│   ├── api.js                  # Cliente HTTP (fetch wrapper para /api/*)
│   ├── utils.js                # Utilidades ($, $$, escHtml, rafThrottle, lockScroll)
│   ├── components/             # Módulos de UI (uno por componente)
│   │   ├── landing.js          # Splash screen con animación de expansión
│   │   ├── nav.js              # Navegación desktop + sidebar mobile
│   │   ├── theme.js            # Toggle tema claro/oscuro
│   │   ├── faq.js              # Acordeón de preguntas frecuentes
│   │   ├── audio.js            # Reproductor de música flotante
│   │   ├── countdown.js        # Contador regresivo
│   │   ├── carousel.js         # Carrusel con lightbox y swipe
│   │   ├── form.js             # Formulario registro/login con validación
│   │   ├── wallet.js           # Billetera de aportes por usuario
│   │   ├── user.js             # Lista de usuarios, estadísticas, modal detalle
│   │   ├── comments.js         # Muro de comentarios (CRUD)
│   │   └── toast.js            # Sistema de notificaciones
│   └── services/               # Capa de abstracción de datos
│       ├── DataService.js      # CRUD de usuarios (API + fallback localStorage)
│       ├── WalletService.js    # CRUD de billeteras (API + fallback localStorage)
│       └── ComentariosService.js # Servicio de comentarios
├── netlify/
│   └── functions/              # Funciones serverless (backend)
│       ├── users.mjs           # API REST: GET/POST/PUT/DELETE /api/users
│       └── wallets.mjs         # API REST: GET/POST /api/wallets
├── assets/                     # Medios estáticos (audio, iconos SVG)
└── imgs/                       # Imágenes (landing, galería, logos, favicon)
```

## Arquitectura

```
┌─────────────────────────────────────────────┐
│  Browser (index.html + ES Modules)          │
│  ┌───────────┐  ┌────────────┐              │
│  │ components │  │  services  │              │
│  │ (UI logic) │──│ (data abs) │              │
│  └───────────┘  └─────┬──────┘              │
│                       │                     │
│                  ┌────▼─────┐               │
│                  │  api.js  │               │
│                  │ (fetch)  │               │
│                  └────┬─────┘               │
└───────────────────────┼─────────────────────┘
                        │ HTTP
┌───────────────────────▼─────────────────────┐
│  Netlify Functions (Serverless Backend)      │
│  ┌───────────┐       ┌───────────┐          │
│  │ users.mjs │       │wallets.mjs│          │
│  └─────┬─────┘       └─────┬─────┘          │
│        └───────┬───────────┘                │
│          ┌─────▼──────┐                     │
│          │ Netlify    │                     │
│          │ Blobs      │                     │
│          └────────────┘                     │
└─────────────────────────────────────────────┘
```

- **Frontend**: ES Modules nativos, sin bundler. Carga directa del navegador.
- **Backend**: Netlify Functions (Node.js) con esbuild bundler.
- **Storage**: Netlify Blobs (key-value storage) con fallback a `localStorage` en el cliente.
- **Migración**: Al iniciar, `migrateLocalData()` sincroniza datos locales a la API cuando está disponible.

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Lenguaje | Vanilla JavaScript (ES Modules) |
| HTML | SPA en `index.html` (1044 líneas) |
| CSS | 2 archivos (~3636 líneas), CSS custom properties |
| Tipografías | Google Fonts: Syne, DM Sans, Space Grotesk, Outfit, Playfair Display |
| Iconos | Font Awesome 5.15.4 |
| Backend | Netlify Serverless Functions |
| Base de datos | Netlify Blobs |
| Hosting | Netlify (deploy automático vía git) |
| Bundler | esbuild (solo para funciones serverless) |

## Desarrollo Local

### Prerrequisitos

- [Node.js](https://nodejs.org/) (v18+)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/)

### Instalación

```bash
npm install
npm install -g netlify-cli
netlify login
```

### Ejecutar en desarrollo

```bash
npm run dev
```

Inicia `netlify dev` con archivos estáticos + funciones serverless localmente.

### Estructura de Datos

```javascript
// Usuario
{ id, nombre, nick, pass, descripcion, img (base64 webp), comentarios: [{id, texto, fecha}], rol, fecha }

// Billetera
{ [userId]: { totalAcumulado, historial: [{fecha, monto, tipo}] } }

// Meta
{ valor: 200000, divisa: "UYU" }
```

## Despliegue

Automático vía integración Netlify con Git. Cada push a la rama principal activa un deploy. Las funciones serverless se empaquetan con esbuild automáticamente.

---

*Desarrollado por **Kikiriya DevOps by Andrés** para los amigos del barrio.*
