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

## Publicación (GitHub Pages)

El tablero se sirve como sitio estático desde la rama `main` en GitHub Pages:

**https://servifibras-web.github.io/apiv1/**

El archivo `.nojekyll` desactiva el procesamiento Jekyll (servimos los archivos
tal cual). Todas las rutas son **relativas**, así que funciona bajo el subpath
`/apiv1/` sin romper el `fetch` de `productos.json`.

## Cómo probarlo en local

```bash
python3 -m http.server 8099
# abrir http://localhost:8099/index.html
```

## Persistencia

Por ahora el avance se guarda con **`localStorage` (por dispositivo)**: cada
celular/compu recuerda su propio avance, pero **no se comparte entre
dispositivos** (el encargado no ve en vivo lo que tilda el del depósito). El
reparto es determinístico, así que todos los dispositivos calculan la misma
tanda por operador.

> Para avance **compartido en vivo** hace falta un backend (paso 2 del roadmap).
> Antes usaba `window.storage`, exclusivo de Claude.ai.

## Roadmap (ver `docs/`)

1. ✅ Separar el HTML en archivos.
2. ✅ Persistencia por dispositivo (localStorage) + publicación en GitHub Pages para probar con operadores.
3. ⏳ Backend en el Droplet (DigitalOcean): persistencia compartida + proxy seguro para la API de Claude.
4. ⏳ Motor de descripciones por API + foto (reemplaza las plantillas genéricas).
5. ⏳ Reparto manual por cantidades, generación de imágenes (fase final).
