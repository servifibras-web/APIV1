# Tablero de Publicaciones · ServiFibras

Herramienta web interna para armar publicaciones de producto en tanda: cada
operador recibe una lista fija de productos, los marca como "publicados", y el
encargado ve el avance. Cada ficha tiene foto, descripción para TiendaNube,
texto para MercadoLibre y búsqueda de fotos (Alibaba / Google).

Lote actual: **Moldes Junio 2026** — 107 productos (77 SEA + 30 AIR), 104 con foto.

## Estructura

| Archivo | Qué es |
|---|---|
| `index.html` | Estructura: gate de login + app. Carga el CSS y los JS. |
| `estilos.css` | Todos los estilos (marca ServiFibras: fondo `#101820`, acento plata `#C8D0D8`, Poppins). |
| `app.js` | Lógica: login, storage, reparto, tildado, render, modal. Carga `productos.json`. |
| `plantillas.js` | Clasificación y generadores de descripción (HTML + TXT). **Pendiente:** reemplazar por generación vía API de Claude (ver `docs/`). |
| `productos.json` | Los 107 productos con sus fotos en base64. |
| `docs/` | `INSTRUCCIONES_Claude_Code.md` y `Sistema_Descripciones_ServiFibras.md` (documentos maestros). |
| `original/` | El HTML monolítico original (~1.3 MB), conservado como referencia. |

Esta versión es el resultado de separar el HTML monolítico original en archivos,
**sin cambiar el comportamiento**.

## Cómo probarlo en local

```bash
python3 -m http.server 8099
# abrir http://localhost:8099/index.html
```

> El avance todavía **no se persiste** fuera de Claude.ai: el código usa
> `window.storage` (API exclusiva de Claude.ai). Fuera de ahí funciona en
> memoria por sesión. Reemplazar esto por un backend compartido es el próximo
> paso (ver `docs/INSTRUCCIONES_Claude_Code.md`, sección 5).

## Roadmap (ver `docs/`)

1. ✅ Separar el HTML en archivos (hecho).
2. ⏳ Backend en el Droplet (DigitalOcean): persistencia compartida + proxy seguro para la API de Claude.
3. ⏳ Motor de descripciones por API + foto (reemplaza las plantillas genéricas).
4. ⏳ Deploy al Droplet, reparto manual por cantidades, generación de imágenes (fase final).
