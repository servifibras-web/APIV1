# Sistema de Descripciones ServiFibras — Motor de Generación SEO/AEO/GEO

Documento maestro para generar las descripciones de los 107 productos (y los que vengan) con calidad de empresa internacional, sin caer en la repetición típica de IA. Pensado para ejecutarse vía API de Claude, producto por producto, alimentado por la foto de cada uno.

Prioridad acordada con Marcos, en este orden estricto:
1. **Conversión** (que quien lee, compre)
2. **AEO/GEO** (que ChatGPT, Perplexity, Google AI lo citen)
3. **SEO clásico** (rankear en Google tradicional)

Las tres conviven en una misma descripción porque, bien hechas, no se pelean: la estructura que convierte (respuesta directa + beneficio + prueba) es la misma que las IA extraen y citan. La clave es el ORDEN dentro de la página.

---

## Parte 1 — Por qué la plantilla anterior fallaba

La versión anterior generaba el texto desde una plantilla fija por categoría. Para 62 "moldes de silicona" daba 62 textos casi idénticos. Eso es exactamente lo que los buscadores IA descartan. La investigación de 2026 es contundente en tres puntos:

- **Los LLM son "extractores de hechos".** Un párrafo de adjetivos no sirve. Lo que se extrae y se cita son datos concretos: medidas, capacidad en ml, tipo de resina compatible, tiempo de desmolde, rendimiento. Una descripción sin hechos duros es invisible para la IA.
- **El estudio de Princeton (citación en respuestas IA) midió qué sube la probabilidad de ser citado:** datos estadísticos +30%, citas/atribuciones +30%, y —al revés— el relleno de keywords la BAJA 9%. O sea: densidad de información real, no repetición de palabras clave.
- **Las IA hacen "query fan-out":** descomponen la pregunta del usuario en sub-preguntas y buscan cada una. "¿Qué molde uso para hacer posavasos de resina?" se rompe en "molde posavasos", "molde silicona resina", "medidas posavasos". La descripción tiene que responder cada fragmento por separado, con encabezados que sean esas preguntas.

Conclusión: la única forma de hacer 107 descripciones no-repetitivas y de alto nivel es que cada una hable de **ese producto concreto**. Por eso el sistema usa la FOTO de cada molde como insumo: el modelo describe lo que realmente se ve, no una categoría abstracta.

---

## Parte 2 — Arquitectura de cada descripción

Toda descripción sigue esta estructura fija (el ORDEN es deliberado: vende arriba, IA-extrae en el medio, schema abajo). El CONTENIDO de cada bloque es único por producto.

### Bloque 1 — Gancho de conversión (lo primero que ve el humano)
- Una frase de apertura que nombra el producto por lo que **hace o resuelve**, no por lo que es. No "Molde de silicona de 8cm" sino el resultado: qué vas a poder crear con él.
- Inmediatamente después, el beneficio diferencial concreto.
- Esto va arriba de todo porque la prioridad #1 es conversión: el que llegó tiene que querer comprarlo en los primeros 2 renglones.

### Bloque 2 — Respuesta directa (formato AEO)
- Un párrafo de 40-60 palabras que responde la pregunta central que un comprador le haría a una IA sobre este producto ("¿para qué sirve este molde?", "¿qué puedo hacer con él?").
- Redactado como respuesta autónoma: si una IA lo extrae solo, tiene sentido completo sin el resto de la página. Este es el bloque que ChatGPT/Perplexity citan.

### Bloque 3 — Hechos duros (lo que la IA extrae y el comprador técnico necesita)
Lista de datos concretos y verificables. Cuantos más datos reales, mejor. Según el producto:
- Medida exacta y, si aplica, capacidad estimada en ml de resina.
- Material y propiedades (flexibilidad, antiadherencia, reutilizable).
- Tipo de resina recomendada (cristal, artesanos, altos espesores — vincular al catálogo ServiFibras real).
- Tiempo/facilidad de desmolde, rendimiento, número de piezas si es set.
- Para qué proyecto concreto sirve (llaveros, posavasos, joyería, bandejas, etc.).
> Nunca inventar un dato. Si no se conoce (ej. capacidad exacta en ml), se omite o se da un rango razonable marcado como aproximado. Un dato falso destruye la confianza con el comprador y con la IA.

### Bloque 4 — FAQ (formato AEO/GEO, alto valor de citación)
- 2 a 4 preguntas reales que un comprador haría, con respuesta directa cada una.
- Las preguntas son los encabezados (responden al query fan-out). Ejemplos de patrones que citan mucho:
  - "¿Qué resina conviene para este molde?"
  - "¿Cuántas piezas salen de [medida]?"
  - "¿El molde se reutiliza?"
- Incluir, donde sea natural, un encuadre de precio/valor ("opción accesible para…") porque las consultas con encuadre de presupuesto tienen la tasa de citación más alta.

### Bloque 5 — Cierre institucional + conversión final
- Bloque corto de marca ServiFibras (importador directo, 25+ años, envíos a todo el país, consultá por mayorista).
- Llamado a la acción con el WhatsApp oficial.

### Bloque 6 — Schema JSON-LD (invisible para el humano, oro para la IA)
- `Product` schema con nombre, marca (Resiners), descripción, material, dimensiones, SKU.
- `FAQPage` schema con las preguntas/respuestas del Bloque 4.
- La investigación 2026: el schema bien hecho hace el contenido ~50% más probable de entrar en respuestas IA. Es requisito técnico, no opcional.

---

## Parte 3 — Reglas de redacción (lo que evita el "olor a IA")

Estas reglas son las que diferencian una descripción profesional de una genérica:

1. **Cero relleno adjetival.** Prohibido "este increíble producto de alta calidad ideal para todos tus proyectos". Cada oración aporta un dato o un beneficio concreto.
2. **Variedad estructural obligatoria entre productos.** Dos moldes distintos NO pueden abrir con la misma frase. El sistema debe variar el gancho, el orden de los hechos, las preguntas del FAQ. (Ver Parte 5: cómo se fuerza esto en el prompt.)
3. **Especificidad sobre el producto real.** Usar lo que se ve en la foto: forma, cantidad de cavidades, geometría, detalles. Un molde de esferas y uno de letras describen cosas distintas.
4. **Voz de marca ServiFibras:** profesional, directa, sin signos de exclamación múltiples, sin emojis, sin promesas vacías. Habla un importador con 25 años de experiencia, no un copy de relleno.
5. **Vincular al ecosistema real:** mencionar las resinas que ServiFibras vende por nombre (Cristal 1:1, Artesanos 2:1, Altos Espesores) cuando sea relevante. Esto construye entidad/knowledge-graph y hace cross-sell.
6. **Datos antes que promesas.** "Desmolde en frío sin desmoldante" vale más que "fácil de usar".

---

## Parte 4 — Identidad visual del HTML (no cambia)

El HTML de salida respeta el manual de marca (igual que la versión anterior):
- Fondo `#101820`, acento plata `#C8D0D8` (categoría moldes), Poppins.
- 100% CSS inline, sin `<head>`/`<style>`/`<script>` globales, sin CSS Grid (flex-wrap).
- Sin emojis decorativos. Jerarquía por tipografía, color y espaciado.
- Encabezados reales (H2/H3) con un tema por sección — importante para AEO: la IA lee la jerarquía HTML.
- WhatsApp oficial: `https://wa.me/541135880083`. Razón social: ServiFibras SRL. Marca producto: Resiners.

---

## Parte 5 — El prompt maestro (esto es lo que ejecuta la API por cada producto)

Este es el prompt que el tablero (vía Claude Code + API de Claude) envía por cada producto, junto con su foto. Es el corazón del sistema.

```
Sos el redactor senior de e-commerce de ServiFibras, importador argentino de
materiales para resina epoxi con más de 25 años en el mercado. Escribís
descripciones de producto de nivel internacional, optimizadas para conversión
primero, y para citación por buscadores IA (ChatGPT, Perplexity, Google AI)
segundo. Tu trabajo se distingue por la densidad de datos concretos y por NO
sonar genérico ni repetitivo.

Te paso la FOTO del producto y sus datos. Mirá la foto con atención: describí
el producto REAL que ves (forma, cavidades, geometría, detalles), no una
categoría abstracta.

DATOS DEL PRODUCTO:
- Código: {code}
- Tipo (proveedor): {desc}
- Medida: {size}
- Marca: Resiners (ServiFibras es representante exclusivo en Argentina)

GENERÁ una descripción siguiendo EXACTAMENTE esta estructura, devuelta como
HTML con CSS 100% inline, paleta ServiFibras (fondo #101820, acento plata
#C8D0D8, tipografía Poppins), sin <head>/<style>/<script>, sin CSS Grid, sin
emojis:

1. GANCHO (1-2 frases): abrí por lo que el producto permite CREAR o el problema
   que resuelve, no por lo que es. Tiene que dar ganas de comprarlo.

2. RESPUESTA DIRECTA (40-60 palabras): párrafo autónomo que responde "¿para qué
   sirve este producto?" de forma que una IA pueda citarlo solo.

3. HECHOS DUROS (lista): medida exacta; capacidad estimada en ml si podés
   inferirla de la foto/medida (marcala aproximada); material y propiedades;
   resina ServiFibras recomendada (Cristal 1:1 / Artesanos 2:1 / Altos
   Espesores según el caso); facilidad de desmolde; proyectos concretos para
   los que sirve. NUNCA inventes un dato; si no lo sabés, omitilo.

4. FAQ (2-4 preguntas con respuesta directa): preguntas REALES de comprador,
   usadas como encabezados. Incluí, si es natural, un encuadre de valor/precio.

5. CIERRE: bloque institucional ServiFibras (importador directo, 25+ años,
   envíos a todo el país, consultá por mayorista) + CTA a WhatsApp
   https://wa.me/541135880083

6. SCHEMA: al final, un <script type="application/ld+json"> con Product +
   FAQPage. (Nota: este script va en el HTML de la página, es la única
   excepción a la regla de "sin script".)

REGLAS ESTRICTAS:
- Cero relleno adjetival. Cada oración aporta un dato o un beneficio concreto.
- Variá la estructura respecto de otros moldes: NO empieces con la misma frase
  que usarías para cualquier molde. Este producto es único.
- Voz profesional de importador con 25 años, directa, sin exclamaciones
  múltiples, sin promesas vacías.
- Español rioplatense neutro-profesional.

Devolvé SOLO el HTML, sin explicaciones.
```

### Variante para MercadoLibre (texto plano)
Mismo prompt pero pidiendo salida en **texto plano** (sin HTML, sin schema), adaptado al campo descripción de ML: respuesta directa arriba, hechos duros en líneas, cierre institucional. ML no renderiza HTML en la descripción, así que es texto limpio.

---

## Parte 6 — Cómo lo ejecuta el tablero (para Claude Code)

1. Cada ficha de producto en el tablero tiene un botón **"Generar descripción"**.
2. Al hacer clic, el tablero llama a la API de Claude (modelo recomendado: el mejor disponible para calidad de copy) pasando: el prompt maestro (Parte 5) + los datos del producto + la foto en base64.
3. La respuesta (HTML para TiendaNube + versión TXT para ML) se muestra en las pestañas y se puede copiar.
4. **Cachear el resultado:** una vez generada, guardar la descripción (en el storage del tablero) para no re-generar y no re-gastar API. Botón "regenerar" por si no gustó.
5. **Generación por lote opcional:** un botón "generar todas las pendientes" que recorre los productos sin descripción y las genera de a una (con un pequeño delay para no saturar la API). Útil para producir las 107 de una.

### Costo y control
- Cada generación con foto tiene un costo de API. Para 107 productos es un costo único y acotado, pero conviene cachear (punto 4) para no repetir.
- Recomendable: que el encargado revise/edite cada descripción generada antes de publicar. La IA da el 90%; el ojo humano sobre el producto real da el 10% que la hace impecable. El tablero debería permitir editar el texto generado antes de copiar.

---

## Parte 7 — Lo que sigue siendo responsabilidad humana

El sistema genera descripciones excelentes, pero para llegar al nivel "empresa internacional" de verdad hay piezas que la investigación 2026 marca como decisivas y que NO salen de generar texto:

- **Reseñas de clientes (UGC):** las IA citan muchísimo el contenido de reseñas reales con atributos específicos. Pedir a los clientes reseñas que mencionen el uso concreto ("lo usé para hacer posavasos y…") alimenta la citación IA mejor que cualquier descripción. Esto es de TiendaNube/ML, no del tablero.
- **Consistencia de entidad:** que "ServiFibras SRL", "Resiners" y los nombres de producto aparezcan idénticos en todos lados (web, ML, Google Business, redes). Las IA construyen el knowledge-graph con esa consistencia.
- **Schema a nivel sitio + llms.txt:** que el sitio no bloquee crawlers IA en robots.txt, y considerar un archivo llms.txt. Esto es técnico, de la web, y conviene revisarlo con Claude Code cuando se aloje.

---

## Resumen

| Pieza | Qué hace |
|-------|----------|
| Arquitectura de 6 bloques | Vende arriba, IA-extrae al medio, schema abajo |
| Prompt maestro (Parte 5) | Genera cada descripción única vía API + foto |
| Reglas anti-"olor a IA" | Datos sobre adjetivos, variedad estructural obligatoria |
| Caché + edición humana | Costo controlado, calidad final impecable |
| UGC + entidad + técnica | Lo humano/web que completa el nivel internacional |
