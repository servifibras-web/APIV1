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
function nombrePub(p){
  const c=clasificar(p);
  const med = p.size? ` ${p.size}` : '';
  return `${c.es}${med} · Resiners`;
}

/* ========= PLANTILLAS DESCRIPCIÓN ========= */
// Acento plata para moldes (manual de marca ServiFibras), Poppins, inline CSS
function htmlTiendaNube(p){
  const c=clasificar(p);
  const nombre=`${c.es}${p.size?(' '+p.size):''}`;
  const PLATA='#C8D0D8', BG='#101820', TXT='#eef2f5', MUT='#8b97a3';
  const medRow = p.size? `<tr><td style="padding:8px 14px;border-bottom:1px solid #2a3949;color:${MUT}">Medida</td><td style="padding:8px 14px;border-bottom:1px solid #2a3949;color:${TXT}">${p.size}</td></tr>`:'';
  return `<div style="font-family:'Poppins',Arial,sans-serif;background:${BG};color:${TXT};padding:28px 22px;border-radius:14px;max-width:680px;margin:0 auto">
<h2 style="margin:0 0 4px;font-size:22px;font-weight:600;color:${PLATA};letter-spacing:.3px">${nombre}</h2>
<p style="margin:0 0 18px;font-size:13px;color:${MUT};letter-spacing:1px;text-transform:uppercase">Cód. ${p.code} · Resiners · ServiFibras</p>
<p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:${TXT}">${descLarga(c,p)}</p>
<h3 style="margin:0 0 10px;font-size:14px;font-weight:600;color:${PLATA};letter-spacing:.5px">Especificaciones</h3>
<table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:18px">
<tr><td style="padding:8px 14px;border-bottom:1px solid #2a3949;color:${MUT}">Producto</td><td style="padding:8px 14px;border-bottom:1px solid #2a3949;color:${TXT}">${c.tipo}</td></tr>
<tr><td style="padding:8px 14px;border-bottom:1px solid #2a3949;color:${MUT}">Código</td><td style="padding:8px 14px;border-bottom:1px solid #2a3949;color:${TXT}">${p.code}</td></tr>
${medRow}
<tr><td style="padding:8px 14px;color:${MUT}">Material</td><td style="padding:8px 14px;color:${TXT}">${c.cat==='herraje'?'Metal':c.cat==='deco'?'Decorativo':'Silicona de alta calidad'}</td></tr>
</table>
<div style="background:#18222e;border:1px solid #2a3949;border-radius:10px;padding:16px;margin-bottom:6px">
<p style="margin:0;font-size:13.5px;line-height:1.55;color:${TXT}"><strong style="color:${PLATA}">ServiFibras</strong> · Importador directo de materiales para resina epoxi. Más de 25 años en el mercado. Envíos a todo el país.</p>
</div>
</div>`;
}
function descLarga(c,p){
  const med = p.size? ` de ${p.size}` : '';
  switch(c.cat){
    case 'molde': return `${c.es}${med} fabricado en silicona flexible de alta calidad, ideal para trabajos con resina epoxi. Fácil desmolde, reutilizable y de larga duración. Permite obtener piezas con excelente terminación y detalle.`;
    case 'set': return `${c.es}${med} en silicona flexible para resina epoxi. Set completo listo para trabajar, con desmolde fácil y terminación profesional. Reutilizable y de larga vida útil.`;
    case 'mat': return `${c.es}${med}. Base de trabajo antiadherente para proteger tu mesa al trabajar con resina. La resina curada se despega con facilidad. Flexible y lavable.`;
    case 'herraje': return `${c.es}. Accesorios metálicos para terminación y armado de tus piezas de resina: bijouterie, llaveros y proyectos decorativos.`;
    case 'deco': return `${c.es}. Elemento decorativo para embeber en resina epoxi y dar color, brillo y textura a tus creaciones.`;
    case 'equipo': return `${c.es}. Equipo auxiliar para el proceso de trabajo con resina epoxi.`;
    case 'acc': return `${c.es}. Accesorio para el trabajo con resina epoxi, pensado para facilitar y mejorar tus proyectos.`;
    default: return `${c.es}${med} para trabajos con resina epoxi.`;
  }
}
// MercadoLibre: texto plano, sin HTML, optimizado para el campo descripción de ML
function txtMercadoLibre(p){
  const c=clasificar(p);
  const nombre=`${c.es}${p.size?(' '+p.size):''}`;
  let t=`${nombre.toUpperCase()} - RESINERS\n`;
  t+=`Código: ${p.code}\n\n`;
  t+=descLarga(c,p).replace(/<[^>]+>/g,'')+`\n\n`;
  t+=`CARACTERÍSTICAS\n`;
  t+=`- Producto: ${c.tipo}\n`;
  t+=`- Código: ${p.code}\n`;
  if(p.size) t+=`- Medida: ${p.size}\n`;
  t+=`- Material: ${c.cat==='herraje'?'Metal':c.cat==='deco'?'Decorativo':'Silicona de alta calidad'}\n\n`;
  t+=`SERVIFIBRAS\n`;
  t+=`Importador directo de materiales para resina epoxi. Más de 25 años en el mercado. Envíos a todo el país. Consultanos por mayorista.`;
  return t;
}
// Links de búsqueda de fotos
function linkAlibaba(p){ const c=clasificar(p); const q=encodeURIComponent(`${p.code} ${c.tipo} silicone mold resin`); return `https://www.alibaba.com/trade/search?SearchText=${q}`; }
function linkGoogleImg(p){ const c=clasificar(p); const q=encodeURIComponent(`${p.code} ${c.tipo} silicone mold resin`); return `https://www.google.com/search?tbm=isch&q=${q}`; }
