/* plantillas.js — clasificacion y generadores de descripcion (HTML TiendaNube + TXT MercadoLibre).
   Separado del HTML monolitico original. Comportamiento identico.
   NOTA: este motor por plantilla queda para reemplazar por generacion via API (ver docs/). */

/* ========= TRADUCCIÓN ES + CATEGORIZACIÓN ========= */
const DICT=[
  [/silicone mold set\s*\(?(\d+)\s*pcs/i, (m)=>({tipo:'Set de moldes de silicona', es:`Set de ${m[1]} moldes de silicona`, cat:'set'})],
  [/silicone mold set/i, ()=>({tipo:'Set de moldes de silicona', es:'Set de moldes de silicona', cat:'set'})],
  [/a5 silicone mold/i, ()=>({tipo:'Molde de silicona A5', es:'Molde de silicona tamaño A5', cat:'molde'})],
  [/silicone mold with hole/i, ()=>({tipo:'Molde de silicona con orificio', es:'Molde de silicona con orificio', cat:'molde'})],
  [/silicone mold \(in positive/i, ()=>({tipo:'Molde de silicona (positivo)', es:'Molde de silicona en positivo', cat:'molde'})],
  [/silicone mold/i, ()=>({tipo:'Molde de silicona', es:'Molde de silicona', cat:'molde'})],
  [/black silicone mat/i, ()=>({tipo:'Mat de silicona negro', es:'Mat / base de trabajo de silicona negra', cat:'mat'})],
  [/white silicone mat/i, ()=>({tipo:'Mat de silicona blanco', es:'Mat / base de trabajo de silicona blanca', cat:'mat'})],
  [/silicone mat/i, ()=>({tipo:'Mat de silicona', es:'Mat / base de trabajo de silicona', cat:'mat'})],
  [/silicone cup/i, ()=>({tipo:'Vaso de silicona', es:'Vaso medidor de silicona', cat:'acc'})],
  [/metal parts set/i, ()=>({tipo:'Set de herrajes metálicos', es:'Set de herrajes / accesorios metálicos', cat:'herraje'})],
  [/metal parts/i, ()=>({tipo:'Herrajes metálicos', es:'Herrajes / accesorios metálicos', cat:'herraje'})],
  [/polymer clay slices/i, ()=>({tipo:'Láminas de arcilla polimérica', es:'Láminas decorativas de arcilla polimérica', cat:'deco'})],
  [/plastic spatula set\s*\(?(\d+)\s*pcs/i, (m)=>({tipo:'Set de espátulas', es:`Set de ${m[1]} espátulas plásticas`, cat:'acc'})],
  [/sticker set/i, ()=>({tipo:'Set de stickers', es:'Set de stickers decorativos', cat:'deco'})],
  [/glitters?/i, ()=>({tipo:'Glitter', es:'Glitter / brillantina decorativa', cat:'deco'})],
  [/heating pad/i, ()=>({tipo:'Manta térmica', es:'Manta térmica de curado', cat:'equipo'})],
  [/marker/i, ()=>({tipo:'Marcador', es:'Marcador para resina', cat:'acc'})],
  [/stones?/i, ()=>({tipo:'Piedras decorativas', es:'Piedras decorativas', cat:'deco'})],
  [/cover/i, ()=>({tipo:'Cobertor', es:'Cobertor / tapa', cat:'acc'})],
  [/small mold/i, ()=>({tipo:'Molde chico', es:'Molde de silicona chico', cat:'molde'})],
  [/medium mold/i, ()=>({tipo:'Molde mediano', es:'Molde de silicona mediano', cat:'molde'})],
  [/large mold/i, ()=>({tipo:'Molde grande', es:'Molde de silicona grande', cat:'molde'})],
  [/only this model/i, ()=>({tipo:'Molde de silicona', es:'Molde de silicona', cat:'molde'})],
];
function clasificar(p){
  const d=(p.desc||'').trim();
  for(const [rx,fn] of DICT){ const m=d.match(rx); if(m) return fn(m); }
  return {tipo:'Molde de silicona', es: d||'Molde de silicona', cat:'molde'};
}
// nombrePub: nombre provisional (Excel) para etiquetar la card antes de generar.
function nombrePub(p){
  const c=clasificar(p);
  const med = p.size? ` ${p.size}` : '';
  return `${c.es}${med} · Resiners`;
}

/* ========= DESCRIPCIONES =========
 * La generación por PLANTILLA genérica (htmlTiendaNube/descLarga/txtMercadoLibre)
 * fue ELIMINADA: producía 62 textos casi idénticos para los moldes y no miraba
 * la foto. Ahora las descripciones se generan por producto vía API de Claude,
 * usando la FOTO como insumo (ver app.js -> generarDesc + backend/). clasificar()
 * se conserva solo como ETIQUETA PROVISIONAL de la card hasta que se genere. */

// (Se quitaron linkAlibaba/linkGoogleImg: la busqueda por texto generica
//  llevaba a moldes en general, no al producto. Ahora la busqueda es por
//  IMAGEN real, manejada en el modal de app.js — Camino B.)
