/* ServiFibras — Backend de generación de descripciones por API de Claude.
 *
 * Servicio AISLADO (pensado para DigitalOcean App Platform, un proyecto nuevo
 * separado del Droplet del CRM). Guarda la API key en una variable de entorno
 * del panel — NUNCA en el repo ni en el navegador.
 *
 * Endpoint principal: POST /api/generar  { code, desc, size, ship, img }
 *   -> mira la FOTO, deduce el producto real (corrigiendo la categoría del
 *      proveedor si la foto la contradice) y genera la descripción de 6 bloques.
 *
 * El cacheo durable vive en el TABLERO (localStorage): App Platform tiene disco
 * efímero, así que acá solo hay un cache en memoria best-effort por instancia.
 */
'use strict';
const express = require('express');
const cors = require('cors');

const PORT = process.env.PORT || 8080;
const API_KEY = process.env.ANTHROPIC_API_KEY;       // se carga en el panel de App Platform
const MODEL = process.env.MODEL || 'claude-opus-4-8'; // mejor calidad de copy; cambiable por env
const MAX_TOKENS = parseInt(process.env.MAX_TOKENS || '4000', 10);
// Origen permitido (el tablero en GitHub Pages). Coma-separado para varios.
const ALLOWED = (process.env.ALLOWED_ORIGIN || 'https://servifibras-web.github.io')
  .split(',').map(s => s.trim()).filter(Boolean);

const app = express();
app.use(express.json({ limit: '20mb' })); // las fotos van en base64
app.use(cors({
  origin(origin, cb) {
    // Permitir sin origin (curl/health) y los orígenes whitelisteados.
    if (!origin || ALLOWED.includes(origin) || ALLOWED.includes('*')) return cb(null, true);
    cb(new Error('Origen no permitido: ' + origin));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
}));

const memCache = new Map(); // code -> resultado (best-effort, se pierde al reiniciar)

/* ---------- Prompt maestro (doc Sistema_Descripciones, Parte 5) ---------- */
const SYSTEM_PROMPT = `Sos el redactor senior de e-commerce de ServiFibras, importador argentino de
materiales para resina epoxi con más de 25 años en el mercado. Escribís
descripciones de producto de nivel internacional, optimizadas para conversión
primero, y para citación por buscadores IA (ChatGPT, Perplexity, Google AI)
segundo. Tu trabajo se distingue por la densidad de datos concretos y por NO
sonar genérico ni repetitivo.

Además sos experto en identificar productos por su foto. El texto del proveedor
(en inglés, del Excel) suele estar MAL: a veces dice "silicone mold" / "molde de
silicona" a cosas que no lo son (marcadores, herrajes, mats, sets, accesorios).
NUNCA confíes ciegamente en ese texto: mirá la foto y deducí qué es REALMENTE el
producto. Si la foto contradice el texto del proveedor, corregí y usá lo que ves.

Marca de los productos: Resiners (ServiFibras es representante exclusivo en
Argentina). Razón social: ServiFibras SRL. WhatsApp oficial: https://wa.me/541135880083.

PRIORIDAD (estricta): 1) Conversión, 2) AEO/GEO (citación por IA), 3) SEO clásico.

REGLAS DE REDACCIÓN:
- Cero relleno adjetival. Cada oración aporta un dato o un beneficio concreto.
- Variá la estructura respecto de otros productos: NO empieces con la misma frase
  que usarías para cualquier molde. Este producto es único.
- Especificidad sobre el producto REAL de la foto (forma, cavidades, geometría,
  cantidad de piezas, detalles).
- Nunca inventes un dato. Si no lo sabés (ej. capacidad exacta en ml), omitilo o
  dalo como rango aproximado marcado como tal.
- Voz profesional de importador con 25 años, español rioplatense neutro, sin
  exclamaciones múltiples, sin emojis, sin promesas vacías.
- Vinculá al ecosistema real cuando aplique: resinas ServiFibras por nombre
  (Cristal 1:1, Artesanos 2:1, Altos Espesores).

HTML de salida (campo html_tiendanube): CSS 100% inline, paleta ServiFibras
(fondo #101820, acento plata #C8D0D8, tipografía Poppins), SIN <head>/<style>/
<script> globales (la ÚNICA excepción es el <script type="application/ld+json">
del schema), SIN CSS Grid (usar flex-wrap), sin emojis. Encabezados reales H2/H3.

Arquitectura OBLIGATORIA de 6 bloques, en este orden:
1. Gancho de conversión (1-2 frases): abrí por lo que el producto permite CREAR
   o el problema que resuelve, no por lo que es.
2. Respuesta directa (40-60 palabras): párrafo autónomo que una IA pueda citar solo.
3. Hechos duros (lista): medida exacta; capacidad estimada en ml si se infiere de
   la foto/medida (marcala aproximada); material y propiedades; resina ServiFibras
   recomendada; facilidad de desmolde; proyectos concretos.
4. FAQ (2-4 preguntas reales de comprador como encabezados, con respuesta directa;
   incluí, si es natural, un encuadre de valor/precio).
5. Cierre institucional ServiFibras (importador directo, 25+ años, envíos a todo
   el país, consultá por mayorista) + CTA a WhatsApp https://wa.me/541135880083.
6. Schema JSON-LD: <script type="application/ld+json"> con Product (marca Resiners,
   material, dimensiones, SKU = código) + FAQPage con las preguntas del bloque 4.

El campo txt_mercadolibre es el MISMO contenido pero en TEXTO PLANO (sin HTML, sin
schema), adaptado al campo descripción de MercadoLibre: respuesta directa arriba,
hechos duros en líneas, cierre institucional.`;

function buildUserContent(p) {
  const content = [];
  if (p.img && typeof p.img === 'string' && p.img.startsWith('data:')) {
    const m = p.img.match(/^data:([^;]+);base64,(.*)$/s);
    if (m) {
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: m[1], data: m[2] },
      });
    }
  }
  const sinFoto = content.length === 0;
  content.push({
    type: 'text',
    text:
`DATOS DEL PRODUCTO (del Excel del proveedor — pueden estar mal):
- Código: ${p.code ?? ''}
- Tipo (proveedor, en inglés): ${p.desc ?? ''}
- Medida: ${p.size ?? ''}
- Envío: ${p.ship ?? ''}
- Marca: Resiners

${sinFoto
  ? 'ATENCIÓN: este producto NO tiene foto. Generá con lo que se pueda inferir del texto, siendo conservador, marcá baja confianza en "contradice_excel"=false y aclarando en "nota_revision" que falta foto para confirmar el producto real.'
  : 'Mirá la FOTO con atención. Identificá qué es REALMENTE el producto. Si la foto contradice el texto del proveedor, corregí (ej.: el Excel dice "molde de silicona" pero la foto muestra marcadores metálicos -> es un set de marcadores).'}

Devolvé ÚNICAMENTE un objeto JSON válido (sin \`\`\` y sin texto fuera del JSON),
con EXACTAMENTE estas claves:
{
  "tipo_real": "qué es realmente, corto y en español (ej: 'Set de marcadores metálicos')",
  "nombre_publicacion": "título de publicación, ej: 'Set de marcadores metálicos · Resiners'",
  "categoria": "una de: molde | set | mat | herraje | deco | acc | equipo | marcador | otro",
  "contradice_excel": true o false (true si la foto contradice el texto del proveedor),
  "nota_revision": "nota corta para el humano que revisa (qué corregiste y por qué)",
  "html_tiendanube": "la descripción completa de 6 bloques como HTML con CSS inline (incluye el <script> JSON-LD del bloque 6)",
  "txt_mercadolibre": "la versión en texto plano para MercadoLibre"
}
El JSON debe ser válido y parseable: escapá comillas dobles dentro de los strings.`,
  });
  return content;
}

function extractJSON(text) {
  // El modelo debería devolver JSON puro; por las dudas, recortamos a {...}.
  let t = text.trim();
  if (t.startsWith('```')) t = t.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a !== -1 && b !== -1 && b > a) t = t.slice(a, b + 1);
  return JSON.parse(t);
}

async function generarDescripcion(p) {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserContent(p) }],
    }),
  });
  if (!resp.ok) {
    const body = await resp.text().catch(() => '');
    const err = new Error(`API Claude ${resp.status}`);
    err.status = resp.status; err.detail = body.slice(0, 500);
    throw err;
  }
  const data = await resp.json();
  const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('');
  const out = extractJSON(text);
  out._model = MODEL;
  out._usage = data.usage || null;
  return out;
}

/* ---------------------------- Rutas ---------------------------- */
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, model: MODEL, hasKey: !!API_KEY, allowedOrigin: ALLOWED });
});

app.post('/api/generar', async (req, res) => {
  if (!API_KEY) return res.status(500).json({ error: 'Falta ANTHROPIC_API_KEY en el servicio.' });
  const p = req.body || {};
  if (!p.code && !p.img && !p.desc) return res.status(400).json({ error: 'Faltan datos del producto.' });
  const key = String(p.code || '');
  if (key && memCache.has(key) && !p.force) {
    return res.json({ ...memCache.get(key), _cache: 'mem' });
  }
  try {
    const out = await generarDescripcion(p);
    if (key) memCache.set(key, out);
    res.json(out);
  } catch (e) {
    console.error('generar error:', e.status || '', e.message, e.detail || '');
    res.status(e.status === 401 ? 401 : 502).json({
      error: e.status === 401 ? 'API key inválida o sin crédito.' : 'No se pudo generar la descripción.',
      detail: e.detail || e.message,
    });
  }
});

app.get('/', (_req, res) => res.type('text').send('ServiFibras backend — POST /api/generar'));

app.listen(PORT, () => console.log(`ServiFibras backend escuchando en :${PORT} (modelo ${MODEL})`));
