# Backend de descripciones · ServiFibras

Servicio **aislado** que genera las descripciones de producto vía API de Claude,
mirando la **foto** de cada uno (corrige la categoría cuando el Excel del proveedor
está mal). La API key vive como **variable de entorno en el panel del servicio** —
nunca en el repo ni en el navegador.

> ⚠️ Esto NO va en el Droplet del CRM. Es un proyecto/servicio **nuevo y separado**
> (DigitalOcean App Platform), sin relación con lo que ya corre en el Droplet.

## Qué hace

`POST /api/generar` con `{ code, desc, size, ship, img }` →
devuelve `{ tipo_real, nombre_publicacion, categoria, contradice_excel, nota_revision, html_tiendanube, txt_mercadolibre }`
siguiendo la arquitectura de 6 bloques del documento `docs/Sistema_Descripciones_ServiFibras.md`.

`GET /api/health` → estado (incluye si la clave está cargada).

El cacheo durable está en el **tablero** (localStorage); acá el cache es en memoria
y best-effort (App Platform reinicia y tiene disco efímero).

## Desplegar en DigitalOcean App Platform (paso a paso)

1. En DigitalOcean: **Create → Apps**.
2. **Source:** GitHub → repo `servifibras-web/APIV1`. (Si te pide instalar la app de
   DigitalOcean en GitHub, autorizá solo este repo.)
3. **Branch:** `claude/sleepy-archimedes-kyzifj` por ahora (para probar). Cuando se
   mergee a `main`, cambiás el branch a `main` en Settings.
4. **Source Directory:** `/backend`  ← importante: el servicio vive en esa subcarpeta.
5. DigitalOcean detecta Node automáticamente. Recurso: **Web Service**.
   - Build command: (vacío, usa `npm install`)
   - Run command: `npm start`
   - HTTP Port: `8080` (App Platform también setea `PORT` solo).
   - Plan: el más chico (Basic) alcanza de sobra. Costo ~USD 5/mes.
6. **Environment Variables** (Settings → App-Level Environment Variables) — acá va la clave:

   | Key | Value | Tipo |
   |-----|-------|------|
   | `ANTHROPIC_API_KEY` | tu clave de console.anthropic.com | **Encrypted / Secret** |
   | `ALLOWED_ORIGIN` | `https://servifibras-web.github.io` | normal |
   | `MODEL` | `claude-opus-4-8` (o `claude-sonnet-4-6` para gastar menos) | normal |

   > Marcá `ANTHROPIC_API_KEY` como **Encrypted** para que quede oculta en el panel.
7. **Create Resources** y esperá el deploy. Te queda una URL tipo
   `https://servifibras-backend-xxxxx.ondigitalocean.app`.
8. Probá: abrí `…ondigitalocean.app/api/health` → debe decir `"hasKey": true`.

## Conectarlo al tablero

En el tablero, entrá como **Encargado** → panel de control → botón
**“⚙ Backend de descripciones”** → pegá la URL del paso 7. Queda guardada en ese
dispositivo (localStorage). Listo: el botón **“Generar descripción”** de cada ficha
ya llama a este backend.

## Variables de entorno

Ver `.env.example`. Solo `ANTHROPIC_API_KEY` es obligatoria.

## Correr local (opcional, para probar)

```bash
cd backend
cp .env.example .env   # y completá ANTHROPIC_API_KEY
npm install
node --env-file=.env server.js   # Node 20+; o exportá las vars a mano
# luego: curl localhost:8080/api/health
```

## Costo

Cada generación es una llamada con foto (one-shot). Para 107 productos es un costo
**único y acotado**; con caché en el tablero no se repite. `MODEL=claude-sonnet-4-6`
abarata bastante si querés; `claude-opus-4-8` da la mejor calidad de copy.
