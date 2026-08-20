/* Tek dosyalık sürüm üretir: three.js ve tüm modüller tek HTML'e gömülür.
   Kullanım:  node bundle.mjs      ->  tek-dosya/akkale.html  (çift tıkla aç)
                                       tek-dosya/akkale-artifact.html (gövde-içi sürüm) */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');

/* --- three.js'i modül kapsamından tek bir THREE nesnesine çevir --- */
let three = read('./vendor/three.module.min.js');
const m = three.match(/export\{([^}]*)\};?\s*$/);
if (!m) throw new Error('three.js export bloğu bulunamadı');
const pairs = m[1].split(',').map((s) => {
  const [a, b] = s.trim().split(/\s+as\s+/);
  return b ? `${JSON.stringify(b)}:${a}` : `${JSON.stringify(a)}:${a}`;
});
three = three.slice(0, m.index) + `\nconst THREE={${pairs.join(',')}};\n`;

/* --- kendi modüllerimizden import/export satırlarını temizle --- */
const strip = (src) => src
  .replace(/^\s*import[^;]+;\s*$/gm, '')
  .replace(/^export\s+(function|const|class|let)\b/gm, '$1');

/* Her modül kendi kapsamında kalsın: three.js'in minify edilmiş kısa
   isimleri (ac, C, P...) bizim isimlerimizle çakışmasın diye. */
const wrap = (src, exp) => `const ${exp} = (() => {\n${strip(src)}\nreturn ${exp};\n})();`;

const bundle = [
  three,
  wrap(read('./js/audio.js'), 'Sfx'),
  wrap(read('./js/characters.js'), 'createCharacter'),
  wrap(read('./js/world.js'), 'buildWorld'),
  `(() => {\n${strip(read('./js/game.js'))}\n})();`,
].join('\n');

/* --- index.html'i parçala --- */
const html = read('./index.html');
const title = html.match(/<title>([^<]*)<\/title>/)[1];
const fonts = html.match(/<link rel="preconnect"[\s\S]*?rel="stylesheet">/)[0];
const style = html.match(/<style>[\s\S]*?<\/style>/)[0];
const body = html.match(/<body>([\s\S]*?)<script type="importmap">/)[1].trim();

const head = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
${fonts}
${style}`;
const page = `${body}\n<script type="module">\n${bundle}\n<\/script>\n`;

mkdirSync(new URL('./tek-dosya/', import.meta.url), { recursive: true });
// Artifact/gövde-içi sürüm: doctype, html, head, body etiketi yok
writeFileSync(new URL('./tek-dosya/akkale-artifact.html', import.meta.url),
  `<title>${title}</title>\n${fonts}\n${style}\n${page}`);
// Çift tıklayıp açılabilen tam sayfa sürüm
writeFileSync(new URL('./tek-dosya/akkale.html', import.meta.url),
  `<!doctype html>\n<html lang="tr">\n<head>\n${head}\n</head>\n<body>\n${page}</body>\n</html>\n`);
console.log('tek-dosya/akkale.html ve akkale-artifact.html yazildi');
