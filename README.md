# ☕ Café POS

Punto de venta (POS) para cafetería. App web móvil optimizada para iPhone.

## Estructura

```
cafe-pos/
├── index.html       ← HTML principal
├── styles.css       ← Estilos (CSS)
├── app.jsx          ← Lógica de la app (React + Babel)
├── manifest.json    ← PWA manifest
├── sw.js            ← Service Worker (cache offline)
├── sw-register.js   ← Registro del Service Worker
└── README.md        ← Este archivo
```

## Features

- **Menú** con grid de productos por categoría (Comida, Bebidas, Snacks)
- **Carrito** con control de cantidad y tipos de orden (Llevar / Aquí / WhatsApp)
- **Calculadora de cambio** con pago rápido ($20, $50, $70, $100, $150, $200, $500)
- **Control de mesas** (máximo 7 personas para comer aquí)
- **Saldo a favor** cuando un cliente deja pagado de más
- **Hora de entrega** programada para pedidos
- **Gestión de pedidos** con estados: Pendiente → Preparando → Listo → Entregado
- **Resumen de ventas** del día
- **PWA** — se puede agregar a pantalla de inicio como app nativa
- **Offline** — funciona sin internet después de la primera carga
- **Persistencia** con localStorage

## Deploy

### GitHub Pages
1. Sube estos archivos a un repo de GitHub
2. Ve a Settings → Pages → Source: main branch
3. Tu app estará en `https://tu-usuario.github.io/cafe-pos/`

### Netlify
1. Arrastra la carpeta a [netlify.com/drop](https://netlify.com/drop)
2. Listo, te da un URL público

### Vercel
1. Importa el repo desde GitHub
2. Deploy automático

## Agregar a iPhone como App

1. Abre el URL de tu deploy en **Safari**
2. Toca el botón de compartir (↑)
3. Selecciona **"Agregar a pantalla de inicio"**
4. Se instala como app con ícono ☕

## Tech Stack

- React 18 (via CDN)
- Babel Standalone (transpila JSX en el browser)
- CSS puro
- localStorage para datos
- Service Worker para PWA/offline
