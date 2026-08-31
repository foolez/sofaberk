/* ================= TAKIM TUT — gerçek logo çekici =================
   Kulüp armalarını Wikipedia'dan bulur (adres tarayıcıda çekilir,
   sonuç localStorage'a yazılır — ikinci açılışta anında gelir).

   Not: bu dosya sadece internet varken iş görür. Logoyu bulamazsa
   oyun stilize armayla devam eder, hiçbir şey kırılmaz.
   Tamamen çevrimdışı/gömülü logo istersen: python3 tools/logo-cek.py
   ================================================================== */

const LOGO_ANAHTAR = 'takimtut_logo_v1';
const LOGO_OMRU    = 30 * 24 * 3600 * 1000;   // 30 gün sonra tazele
const LOGO_ESZAMAN = 5;                        // aynı anda kaç istek

function logoOnbellekOku(){
  try {
    const ham = JSON.parse(localStorage.getItem(LOGO_ANAHTAR) || '{}');
    const simdi = Date.now();
    const temiz = {};
    for(const [id, kayit] of Object.entries(ham)){
      if(kayit && simdi - (kayit.z || 0) < LOGO_OMRU) temiz[id] = kayit;
    }
    return temiz;
  } catch(e){ return {}; }
}
function logoOnbellekYaz(ob){
  try { localStorage.setItem(LOGO_ANAHTAR, JSON.stringify(ob)); } catch(e){}
}

/* Wikipedia arama + sayfa görseli. pilicense=any → kulüp armaları da gelir. */
async function logoAra(t, dil){
  const sorgu = encodeURIComponent(`${t.ad} ${t.sehir} futbol kulübü`.trim());
  const url = `https://${dil}.wikipedia.org/w/api.php?action=query&format=json&origin=*` +
              `&prop=pageimages&pithumbsize=200&pilicense=any` +
              `&generator=search&gsrsearch=${sorgu}&gsrlimit=3`;
  const y = await fetch(url, { mode:'cors' });
  if(!y.ok) return null;
  const veri = await y.json();
  const sayfalar = veri && veri.query && veri.query.pages;
  if(!sayfalar) return null;

  const ilkKelime = norm(t.ad).split(' ')[0];
  const adaylar = Object.values(sayfalar)
    .filter(p => p.thumbnail && p.thumbnail.source)
    .sort((a,b) => (a.index||9) - (b.index||9));
  // başlığı takım adıyla örtüşen ilk sonucu tercih et
  const isabet = adaylar.find(p => norm(p.title).includes(ilkKelime)) || adaylar[0];
  return isabet ? isabet.thumbnail.source : null;
}

async function logoBul(t){
  // Türkiye takımları için önce tr.wikipedia, sonra en
  const diller = ['sl','1l','tr'].includes(t.grup) ? ['tr','en'] : ['en','tr'];
  for(const d of diller){
    try { const u = await logoAra(t, d); if(u) return u; } catch(e){}
  }
  return null;
}

/* Ekranda o an duran armaları tazele */
function logolariTazele(){
  document.querySelectorAll('[data-tid]').forEach(el => {
    const id = el.dataset.tid;
    if(el.tagName === 'IMG' && LOGOLAR[id] && el.src !== LOGOLAR[id]) el.src = LOGOLAR[id];
  });
  // stilize çizilmiş kartlar varsa görünen listeyi yeniden çiz
  if($('#ekran-secim') && $('#ekran-secim').classList.contains('aktif')) secimListele($('#secim-ara').value);
  if($('#ekran-net-secim') && $('#ekran-net-secim').classList.contains('aktif')) netSecimListele($('#net-secim-ara').value);
}

async function logolariYukle(){
  if(LOGO_MODU !== 'gercek') return;
  const onbellek = logoOnbellekOku();
  for(const [id, k] of Object.entries(onbellek)) if(k.u) LOGOLAR[id] = k.u;
  if(Object.keys(LOGOLAR).length) logolariTazele();

  const eksik = TAKIMLAR.filter(t => !(t.id in onbellek));
  if(!eksik.length || !navigator.onLine) return;

  let i = 0, degisti = 0;
  const isci = async () => {
    while(i < eksik.length){
      const t = eksik[i++];
      let url = null;
      try { url = await logoBul(t); } catch(e){}
      onbellek[t.id] = { u:url, z:Date.now() };
      if(url){ LOGOLAR[t.id] = url; degisti++; }
      if(degisti && degisti % 10 === 0){ logoOnbellekYaz(onbellek); logolariTazele(); }
    }
  };
  await Promise.all(Array.from({length: LOGO_ESZAMAN}, isci));
  logoOnbellekYaz(onbellek);
  logolariTazele();
}

/* gömülü logolar (tools/logo-cek.py çıktısı) varsa onlar kazanır */
if(typeof GOMULU_LOGOLAR === 'object' && GOMULU_LOGOLAR){
  Object.assign(LOGOLAR, GOMULU_LOGOLAR);
}
setTimeout(logolariYukle, 300);
