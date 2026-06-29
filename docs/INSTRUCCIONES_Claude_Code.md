# Tablero de Publicaciones ServiFibras — Instrucciones para Claude Code

Este documento es para pasarle a **Claude Code**. Describe qué construir, con qué reglas y con qué identidad de marca. Está pensado para que Claude Code lo lea una vez y pueda trabajar sobre el proyecto sin tener que volver a preguntar lo básico.

---

## 0. Qué es esto

Una herramienta web interna del local de **ServiFibras** (importador de materiales para resina epoxi, Caseros, GBA Oeste). Sirve para que el equipo arme publicaciones de producto en tanda: cada operador recibe una lista fija de productos, los va marcando como "publicados", y el encargado ve el avance en vivo. Al abrir cada producto, el operador tiene la foto, una descripción HTML lista para TiendaNube, un texto plano para MercadoLibre, y botones para buscar fotos del producto en Alibaba y Google.

Ya existe una **versión funcionando en un solo archivo HTML** (`Tablero_Publicaciones_ServiFibras.html`). Esa versión es el punto de partida. El objetivo con Claude Code es poder **iterar** sobre ella: ajustar plantillas de texto, sumar lotes nuevos de productos, mejorar el flujo, y más adelante agregar generación de imágenes.

---

## 1. Cómo instalar y arrancar Claude Code (una sola vez)

Marcos todavía no instaló Claude Code. Pasos:

1. Necesita **Node.js 18 o superior** instalado. Verificar con `node --version`.
2. Instalar Claude Code (seguir la guía oficial en docs.claude.com — la forma de instalación cambia, conviene confirmar ahí).
3. Crear una carpeta para el proyecto, por ejemplo `servifibras-tablero/`, y poner adentro el archivo HTML existente y este documento.
4. Abrir Claude Code en esa carpeta y empezar pidiéndole que lea este archivo.

> Nota: cuando Marcos abra Claude Code, lo primero que conviene pedirle es: *"Leé INSTRUCCIONES_Claude_Code.md y decime cómo está armado el proyecto antes de tocar nada."*

---

## 2. Estructura recomendada del proyecto

La versión actual es un único HTML autocontenido (datos + estilos + lógica en un archivo de ~1.3 MB, casi todo son las fotos en base64). Eso funciona pero es incómodo de editar. Para trabajar con Claude Code conviene **separarlo en archivos**:

```
servifibras-tablero/
├── index.html            ← estructura (gate de login + app)
├── estilos.css           ← todos los estilos
├── app.js                ← lógica (login, reparto, tildado, modal)
├── plantillas.js         ← generadores de descripción HTML y TXT  ← se edita seguido
├── productos.json        ← los 107 productos con sus fotos (base64)
└── INSTRUCCIONES_Claude_Code.md
```

Primer encargo sugerido para Claude Code: *"Separá el HTML actual en estos archivos sin cambiar el comportamiento."*

---

## 3. Datos de los productos

- **107 productos en total**: 77 del envío por barco (`SEA`) + 30 del aéreo (`AIR`).
- Cada producto tiene: `code` (código), `desc` (descripción original en inglés del proveedor), `size` (medida), `ship` (`SEA`/`AIR`), `img` (foto en base64 o vacío).
- **104 tienen foto**, 3 no: códigos **2079, 2080, 2100**. Esas tres no tienen imagen en el Excel original; hay que cargarlas a mano o conseguirlas del proveedor.
- Algunas fotos son **heredadas de su serie**: cuando un producto es una variante de tamaño (ej. serie 1891 de 3cm a 10cm), comparte la foto de la primera variante de la serie. Es correcto: es el mismo molde en otra medida.

El archivo `productos.json` (a generar al separar) debe contener este array. La fuente original es el Excel `Publicaciones_moldes_Junio_2026.xlsx`, hoja "Sea Shipping" (código en columna C, descripción en E, medida en F) y "Air Shipping" (código en B, descripción en D, medida en E). La primera columna numérica del Excel se ignora.

---

## 4. Operadores y reparto

- Operadores actuales: **Brenda, Franco, Matías**. (Definidos en una constante `OPERATORS` al inicio de la lógica; para cambiarlos se edita esa línea.)
- Además existe un usuario **Encargado** que ve todas las tandas y el control.
- El reparto es **parejo y automático**: los 107 se dividen entre los 3 (~36 cada uno), intercalando SEA y AIR para que nadie quede con todo lo fácil o todo lo difícil. Cada operador recibe una **tanda fija** (no es un pool compartido — esto es a propósito, para poder medir el rendimiento individual).
- El encargado puede reasignar (botón "Reparto parejo") o borrar el avance.

### Mejora pendiente (cuando se quiera)
Permitir que el encargado asigne **cantidades distintas** a mano (ej. más carga a quien rinde más). Hoy solo reparte parejo.

---

## 5. Persistencia

- El avance se guarda con la **storage API del entorno de artefactos** (`window.storage`), que es específica de Claude.ai y **no existe fuera de ahí**.
- **Importante para Claude Code:** si el tablero se va a usar fuera de Claude.ai (abriendo el HTML directo, o en un servidor propio), hay que reemplazar `window.storage` por otra cosa. Opciones, de menor a mayor esfuerzo:
  - `localStorage` del navegador → simple, pero el avance queda solo en ese dispositivo (no se comparte entre la compu del encargado y el celular del depósito).
  - Un backend chico (por ejemplo un JSON en un servidor, o Supabase/Firebase) → el avance se comparte en vivo entre todos, que es lo ideal para el local.
- **Decisión a tomar con Marcos:** ¿el tablero va a vivir dentro de Claude.ai, o quiere alojarlo aparte (GitHub Pages como la calculadora, o un servidor)? Eso define qué hacer con la persistencia. Si va a GitHub Pages, necesita el backend compartido para que el avance se sincronice.

---

## 6. Identidad de marca ServiFibras (respetar siempre)

Esto vale para el tablero y para todo lo que genere descripciones o imágenes.

**Colores**
- Fondo principal: `#101820`
- Azul acento digital: `#00A8DC` (NO usar como dominante en páginas institucionales)
- Rojo: `#B2292E`
- Gris: `#636569`
- Coral: `#EA6852`
- **Categoría MOLDES — acento plata `#C8D0D8`** (reemplaza al azul en todo lo de moldes). Como este lote es de moldes, el tablero usa plata como acento principal.

**Tipografía:** Poppins (un solo `@import` de Google Fonts).

**Reglas de las descripciones HTML para TiendaNube**
- 100% CSS inline (sin `<head>`, sin `<style>` global, sin `<script>`).
- Sin CSS Grid (usar flex-wrap si hace falta).
- Sin emojis decorativos.
- Jerarquía solo con tipografía, color y espaciado.
- Incluir, cuando aplique, schema Product + FAQPage para AEO/GEO.

**Otros datos fijos**
- Razón social: **ServiFibras SRL** (nunca LIBECOM SRL).
- WhatsApp oficial: `541135880083` → `https://wa.me/541135880083` (nunca otro número).
- Marca de los productos de este lote: **Resiners** (ServiFibras es representante exclusivo en Argentina).

---

## 7. Descripciones de producto — IMPORTANTE: leer el documento aparte

> **Este es el cambio más importante del proyecto.** La versión inicial del tablero generaba descripciones desde plantillas genéricas por categoría (una función `clasificar()` + `descLarga()` que rellenaba texto fijo). **Eso quedó DESCARTADO.** Producía 62 textos casi idénticos para los 62 "moldes de silicona" — exactamente la repetición que los buscadores IA penalizan y que no vende.

**El sistema de descripciones que hay que implementar está en el documento `Sistema_Descripciones_ServiFibras.md`.** Ese documento manda sobre todo lo relativo a descripciones. Resumen de lo que define:

- Cada descripción se genera **producto por producto vía API de Claude, usando la FOTO del producto** como insumo (no desde plantilla). Así cada una es única y describe el molde real.
- Arquitectura fija de 6 bloques (gancho de conversión → respuesta directa AEO → hechos duros → FAQ → cierre institucional → schema JSON-LD), con prioridad conversión > AEO/GEO > SEO.
- El **prompt maestro** que se envía a la API por cada producto está en la Parte 5 de ese documento.
- Existe una **descripción de muestra ya hecha** (producto 1891A) que sirve como estándar de calidad de referencia: el resultado debe verse a ese nivel.

### Qué tiene que hacer Claude Code con esto
1. **Eliminar** del código las funciones de plantilla genérica (`clasificar`, `descLarga`, `htmlTiendaNube`, `txtMercadoLibre` en su forma actual de relleno).
2. Implementar el botón **"Generar descripción"** por producto, que llama a la API de Claude con el prompt maestro + datos + foto (ver Parte 6 del documento de descripciones).
3. Cachear cada descripción generada en el storage para no re-gastar API; botón "regenerar".
4. Permitir **editar** el texto generado antes de copiar/publicar (revisión humana).
5. Opcional: botón "generar todas las pendientes" para producir las 107 en lote.

Toda duda sobre el contenido, estructura o reglas de las descripciones se resuelve en `Sistema_Descripciones_ServiFibras.md`, no acá.

---

## 8. Búsqueda de fotos

Cada producto tiene en su ficha dos botones que abren una búsqueda ya filtrada por código + tipo de producto:
- **Alibaba** (de donde se importa)
- **Google Imágenes**

Son búsquedas, no links a la publicación exacta (no se puede saber la URL exacta de cada molde en Alibaba). Sirven sobre todo para los 3 productos sin foto. Si se quiere, se puede sumar Amazon u otros con la misma lógica.

---

## 9. Generación de imágenes estilo ServiFibras (FASE FINAL — dejar para el final)

> Marcos quiere esto pero acordamos dejarlo para lo último. Acá queda la base para cuando se encare.

**Aclaración técnica importante:** un generador de imágenes por IA (DALL-E, etc.) **no puede tomar la foto real del molde y estilizarla manteniendo el producto idéntico** — genera imágenes nuevas desde cero. Para fotos de producto que se van a vender, una imagen inventada del molde sería un molde distinto al real, lo que es un problema (el cliente recibe algo diferente a la foto). Por eso la IA conviene usarla para:
- **Fondos / placas de marca** donde después se monta la foto real encima.
- **Imágenes de ambientación / lifestyle** (la resina terminada, no el molde).

Cuando se llegue a esta fase, el plan es: definir si se quiere (a) generar placas de fondo estilo marca, o (b) usar IA para escribir copys (que es donde la IA sí aporta sin riesgo). El prompt de generación de imágenes deberá respetar la paleta y tipografía de la sección 6.

---

## 10. Orden de trabajo sugerido para Claude Code

1. Leer este documento y el HTML existente; explicar la estructura.
2. Separar el HTML en archivos (sección 2).
3. Decidir con Marcos el tema persistencia/hosting (sección 5) — es la decisión que más condiciona el resto.
4. Mejoras de plantillas según lo que pida Marcos (sección 7).
5. Reparto manual por cantidades (sección 4).
6. Imágenes (sección 9) — al final.

---

## Resumen de un vistazo

| Cosa | Estado |
|------|--------|
| Tablero con reparto + tildado | Funciona |
| 107 productos cargados (104 con foto) | Listo |
| Fichas con foto + botones búsqueda Alibaba/Google | Funciona |
| Descripciones por plantilla genérica | DESCARTADO (ver doc Sistema_Descripciones) |
| Descripciones únicas vía API + foto | A implementar (ver Sistema_Descripciones) |
| Persistencia compartida fuera de Claude.ai | A definir/construir |
| Reparto manual por cantidad | Pendiente |
| Generación de imágenes | Fase final |
