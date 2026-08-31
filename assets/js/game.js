/* ================= TAKIM TUT — oyun motoru ================= */
const $  = (s, k=document) => k.querySelector(s);
const $$ = (s, k=document) => [...k.querySelectorAll(s)];

const SORULAR = [
  'Takımın renklerinde kırmızı var mı?',
  'Renklerinde siyah var mı?',
  'Formasında dikey çubuklar var mı?',
  'Şehri deniz kenarında mı?',
  '1950’den önce mi kuruldu?',
  'Takımın Avrupa kupası var mı?',
  'Bir başkent takımı mı?',
  'İstanbul takımı mı?',
  'Adı bir şehir adıyla mı bitiyor?',
  'Türkiye’den mi?',
  'Şu an Süper Lig’de mi?',
  'Adı iki kelimeden mi oluşuyor?',
  'Renklerinde sarı var mı?',
  'Adında “spor” geçiyor mu?',
];

const S = {
  ayar: { havuz:'super-lig', sure:30, dagitim:'rastgele', hak:2 },
  oyuncular: [],
  havuz: [],
  sira: 0,          // soruyu soran oyuncu
  tur: 1,
  kalan: 0,
  timer: null,
  secimSirasi: 0,
};

/* ---------- yardımcılar ---------- */
const ekranGoster = id => { $$('.ekran').forEach(e=>e.classList.remove('aktif')); $('#'+id).classList.add('aktif'); };
const titret = ms => { try{ navigator.vibrate && navigator.vibrate(ms); }catch(e){} };
const karistir = a => a.map(v=>[Math.random(),v]).sort((x,y)=>x[0]-y[0]).map(v=>v[1]);
const norm = s => s.toLocaleLowerCase('tr').replace(/[çğıöşü]/g, c=>({'ç':'c','ğ':'g','ı':'i','ö':'o','ş':'s','ü':'u'}[c]));

function ayarKaydet(){ try{ localStorage.setItem('takimtut', JSON.stringify(S.ayar)); }catch(e){} }
function ayarYukle(){
  try{ const v = JSON.parse(localStorage.getItem('takimtut')||'null'); if(v) Object.assign(S.ayar, v); }catch(e){}
}

/* ================= KURULUM EKRANI ================= */
function kurulumHazirla(){
  ayarYukle();
  const hs = $('#havuz-secim'); hs.innerHTML = '';
  Object.entries(HAVUZLAR).forEach(([k,v])=>{
    const b = document.createElement('button');
    b.className = 'secenek' + (S.ayar.havuz===k ? ' secili':'');
    b.dataset.havuz = k;
    b.innerHTML = `${v.ad}<small>${takimlariGetir(k).length} takım</small>`;
    b.onclick = ()=>{ S.ayar.havuz=k; $$('#havuz-secim .secenek').forEach(x=>x.classList.toggle('secili', x.dataset.havuz===k)); ayarKaydet(); };
    hs.appendChild(b);
  });
  grupBagla('#sure-secim','sure','sure', Number);
  grupBagla('#dagitim-secim','dagitim','dagitim', String);
  grupBagla('#hak-secim','hak','hak', Number);
}
function grupBagla(sel, dataAdi, ayarAdi, tip){
  $$(sel+' .secenek').forEach(b=>{
    b.classList.toggle('secili', tip(b.dataset[dataAdi]) === S.ayar[ayarAdi]);
    b.onclick = ()=>{
      S.ayar[ayarAdi] = tip(b.dataset[dataAdi]);
      $$(sel+' .secenek').forEach(x=>x.classList.toggle('secili', x===b));
      ayarKaydet();
    };
  });
}

$('#basla').onclick = ()=>{
  S.havuz = takimlariGetir(S.ayar.havuz);
  S.oyuncular = [0,1].map(i=>({
    ad: ($('#ad'+(i+1)).value.trim() || ('Oyuncu '+(i+1))).slice(0,14),
    takim: null, kalanHak: S.ayar.hak, soru: 0, elenen: new Set(),
  }));
  S.tur = 1; S.sira = 0;

  if(S.ayar.dagitim === 'rastgele'){
    const iki = karistir(S.havuz).slice(0,2);
    S.oyuncular[0].takim = iki[0];
    S.oyuncular[1].takim = iki[1];
    devirGoster(0, 'Takımlar dağıtıldı!', 'Telefonu masaya yatır, ' + S.oyuncular[0].ad + ' ve ' + S.oyuncular[1].ad + ' karşılıklı otursun.', oyunuBaslat);
  } else {
    S.secimSirasi = 0;
    devirGoster(0, 'Telefonu ' + S.oyuncular[0].ad + '’a ver', 'Takımını gizlice seçeceksin. Rakip bakmasın.', secimEkrani);
  }
};

/* ================= DEVİR TESLİM ================= */
let devirDevam = null;
function devirGoster(_, baslik, alt, sonra){
  $('#devir-baslik').textContent = baslik;
  $('#devir-alt').textContent = alt;
  devirDevam = sonra;
  ekranGoster('ekran-devir');
}
$('#devir-btn').onclick = ()=>{ const f = devirDevam; devirDevam = null; f && f(); };

/* ================= GİZLİ SEÇİM ================= */
function secimEkrani(){
  const o = S.oyuncular[S.secimSirasi];
  $('#secim-oyuncu').textContent = o.ad;
  $('#secim-ara').value = '';
  secimListele('');
  ekranGoster('ekran-secim');
}
$('#secim-ara').oninput = e => secimListele(e.target.value);

function secimListele(q){
  const iz = $('#secim-izgara'); iz.innerHTML = '';
  const ara = norm(q.trim());
  S.havuz.filter(t => !ara || norm(t.ad).includes(ara) || norm(t.sehir).includes(ara) || norm(t.kisa).includes(ara))
    .forEach(t => iz.appendChild(takimKarti(t, ()=>{
      S.oyuncular[S.secimSirasi].takim = t;
      if(S.secimSirasi === 0){
        S.secimSirasi = 1;
        devirGoster(1, 'Telefonu ' + S.oyuncular[1].ad + '’a ver', 'Sıra onda — o da takımını gizlice seçecek.', secimEkrani);
      } else {
        devirGoster(0, 'Hazırsınız!', 'Telefonu ikinizin arasına yatırın. Üst yarı ters çevrilidir.', oyunuBaslat);
      }
    })));
}

function takimKarti(t, tikla){
  const d = document.createElement('button');
  d.className = 'kart'; d.type = 'button';
  d.innerHTML = `${armaSVG(t)}<div class="isim">${t.ad}</div><div class="lig">${t.sehir}</div>`;
  d.onclick = tikla;
  return d;
}

/* ================= OYUN ================= */
function oyunuBaslat(){
  ekranGoster('ekran-oyun');
  sahaCiz();
  turBasla(true);
}

function sahaCiz(){
  const saha = $('#saha');
  saha.innerHTML = '';
  [0,1].forEach(i=>{
    const o = S.oyuncular[i];
    const t = o.takim;
    const y = document.createElement('div');
    y.className = 'yari ' + (i===0 ? 'ust':'alt');
    y.id = 'yari-'+i;
    y.innerHTML = `
      <div class="yari-ust-serit">
        <div class="oyuncu-adi">${o.ad} <span class="hak" id="hak-${i}">🎯 ${o.kalanHak}</span></div>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="durum-rozet" id="rozet-${i}">bekliyor</span>
          <span class="sayac-mini" id="minisayac-${i}">–</span>
        </div>
      </div>

      <div class="arma-alan">
        ${armaSVG(t)}
        <div class="takim-bilgi">
          <div class="ad">${t.ad}</div>
          <div class="detay">${t.sehir} • ${t.kurulus} • ${t.lig}</div>
        </div>
        <div class="kilit" id="kilit-${i}">
          <div class="kilit-ikon">🔒</div>
          <div>BASILI TUT &amp; GÖR</div>
          <div class="kilit-alt">Takımın gizli. Sadece sen görmelisin — parmağını çekince tekrar kilitlenir.</div>
        </div>
      </div>

      <div class="mesaj" id="mesaj-${i}">Oyun başlıyor…</div>

      <div class="kontrol" id="kontrol-${i}">
        <button class="evet"   data-rol="evet">EVET</button>
        <button class="hayir"  data-rol="hayir">HAYIR</button>
        <button class="tahmin" data-rol="tahmin">TAHMİN ET</button>
        <button class="pas"    data-rol="pas">PAS</button>
        <button class="fikir"  data-rol="fikir" title="Soru fikri">💡</button>
        <button class="eleme"  data-rol="eleme" title="Eleme tahtası">📋</button>
      </div>`;
    saha.appendChild(y);

    /* kilit: arma alanına basılı tut & gör */
    const kilit = $('#kilit-'+i, y);
    const alan  = $('.arma-alan', y);
    const ac    = e => { e.preventDefault(); kilit.classList.add('gizli'); };
    const kapat = () => kilit.classList.remove('gizli');
    alan.addEventListener('pointerdown', ac);
    ['pointerup','pointercancel','pointerleave'].forEach(ev => alan.addEventListener(ev, kapat));
    document.addEventListener('pointerup', kapat);
    document.addEventListener('pointercancel', kapat);

    /* kontroller */
    $$('#kontrol-'+i+' button', y).forEach(b=>{
      b.onclick = () => kontrolTik(i, b.dataset.rol);
    });
  });
}

function kontrolTik(i, rol){
  const soran = S.sira, cevaplayan = 1 - S.sira;
  if(rol === 'eleme'){ elemeAc(i); return; }
  if(rol === 'fikir'){
    if(i !== soran) return;
    mesaj(i, '💡 ' + SORULAR[Math.floor(Math.random()*SORULAR.length)]);
    return;
  }
  if(rol === 'evet' || rol === 'hayir'){
    if(i !== cevaplayan) return;
    cevapVer(rol === 'evet');
  }
  if(rol === 'tahmin'){ if(i !== soran) return; tahminAc(i); }
  if(rol === 'pas'){ if(i !== soran) return; mesaj(soran, 'Turu pas geçtin.'); mesaj(cevaplayan, 'Rakip pas geçti.'); siraDegis(); }
}

function cevapVer(evetMi){
  const soran = S.sira, cevaplayan = 1 - S.sira;
  S.oyuncular[soran].soru++;
  titret(30);
  mesaj(soran, evetMi
    ? '<span class="rozet-evet">✅ Cevap: EVET</span>'
    : '<span class="rozet-hayir">❌ Cevap: HAYIR</span>');
  mesaj(cevaplayan, evetMi ? 'Cevabın: EVET' : 'Cevabın: HAYIR');
  siraDegis();
}

function siraDegis(){
  S.sira = 1 - S.sira;
  S.tur++;
  turBasla(false);
}

function turBasla(ilk){
  const soran = S.sira, cevaplayan = 1 - S.sira;
  $('#yari-'+soran).className = 'yari ' + (soran===0?'ust ':'alt ') + 'sirasi';
  $('#yari-'+cevaplayan).className = 'yari ' + (cevaplayan===0?'ust ':'alt ') + 'cevap-sirasi';
  $('#rozet-'+soran).textContent = 'SEN SOR';       $('#rozet-'+soran).className = 'durum-rozet sor';
  $('#rozet-'+cevaplayan).textContent = 'SEN CEVAPLA'; $('#rozet-'+cevaplayan).className = 'durum-rozet cevapla';

  butonDurum(soran,      { evet:false, hayir:false, tahmin:true,  pas:true,  fikir:true  });
  butonDurum(cevaplayan, { evet:true,  hayir:true,  tahmin:false, pas:false, fikir:false });

  if(ilk){
    mesaj(soran, 'Sıra sende: rakibe <b>evet/hayır</b>lık bir soru sor.');
    mesaj(cevaplayan, 'Rakip soracak. Kendi takımına göre cevapla.');
  } else {
    ekle(soran, 'Sıra sende — soru sor.');
    ekle(cevaplayan, 'Rakibin sorusunu cevapla.');
  }
  $('#orta-bilgi').textContent = 'Tur ' + S.tur + ' • ' + S.oyuncular[soran].ad + ' soruyor';
  sayacBaslat();
}

/* rolüne uymayan butonu tamamen gizle — 5 buton dar ekrana sığmıyor */
function butonDurum(i, harita){
  $$('#kontrol-'+i+' button').forEach(b=>{
    const r = b.dataset.rol;
    if(!(r in harita)) return;          // eleme tahtası her zaman açık
    b.style.display = harita[r] ? '' : 'none';
    b.disabled = !harita[r];
  });
}

function mesaj(i, html){ $('#mesaj-'+i).innerHTML = html; }
function ekle(i, html){ $('#mesaj-'+i).innerHTML = html; }

/* ---------- sayaç ---------- */
function sayacBaslat(){
  clearInterval(S.timer);
  if(!S.ayar.sure){
    $('#orta-sayac').textContent = '∞'; $('#orta-sayac').classList.remove('az');
    [0,1].forEach(i=>{ $('#minisayac-'+i).textContent = '∞'; $('#minisayac-'+i).classList.remove('az'); });
    return;
  }
  S.kalan = S.ayar.sure;
  sayacCiz();
  S.timer = setInterval(()=>{
    S.kalan--;
    sayacCiz();
    if(S.kalan <= 0){
      clearInterval(S.timer);
      titret([60,60,60]);
      const soran = S.sira, cevaplayan = 1 - S.sira;
      mesaj(soran, '⏱ Süren doldu! Tur rakibe geçti.');
      mesaj(cevaplayan, '⏱ Rakibin süresi doldu. Sıra sende.');
      siraDegis();
    }
  }, 1000);
}
function sayacCiz(){
  const az = S.kalan <= 5;
  const s = $('#orta-sayac'); s.textContent = S.kalan; s.classList.toggle('az', az);
  [0,1].forEach(i=>{ const m = $('#minisayac-'+i); m.textContent = S.kalan + '"'; m.classList.toggle('az', az); });
}

/* ---------- katman (tahmin & eleme) ---------- */
function katmanAc(i, baslik, kartTikla, elemeModu){
  const y = $('#yari-'+i);
  if($('.katman', y)) return;
  const k = document.createElement('div');
  k.className = 'katman';
  k.innerHTML = `
    <div class="katman-ust"><h3>${baslik}</h3><button class="kapat">KAPAT</button></div>
    <input class="girdi ara" placeholder="Takım ara…" autocomplete="off">
    <div class="izgara"></div>`;
  y.appendChild(k);
  const iz = $('.izgara', k), ara = $('.ara', k);
  const ciz = q => {
    iz.innerHTML = '';
    const n = norm(q.trim());
    S.havuz.filter(t=>!n || norm(t.ad).includes(n) || norm(t.sehir).includes(n) || norm(t.kisa).includes(n))
      .forEach(t=>{
        const kart = takimKarti(t, ()=> kartTikla(t, kart));
        if(elemeModu && S.oyuncular[i].elenen.has(t.id)) kart.classList.add('elendi');
        iz.appendChild(kart);
      });
  };
  ara.oninput = e => ciz(e.target.value);
  $('.kapat', k).onclick = ()=> k.remove();
  ciz('');
}

function elemeAc(i){
  katmanAc(i, 'Eleme tahtası — elediğini işaretle', (t, kart)=>{
    const e = S.oyuncular[i].elenen;
    if(e.has(t.id)){ e.delete(t.id); kart.classList.remove('elendi'); }
    else { e.add(t.id); kart.classList.add('elendi'); }
  }, true);
}

function tahminAc(i){
  katmanAc(i, 'Rakibin takımı hangisi?', (t)=>{
    $('.katman', $('#yari-'+i)).remove();
    tahminYap(i, t);
  }, false);
}

function tahminYap(i, t){
  const rakip = 1 - i;
  const dogru = S.oyuncular[rakip].takim.id === t.id;
  if(dogru){ bitir(i, 'tahmin'); return; }
  const o = S.oyuncular[i];
  o.kalanHak--;
  $('#hak-'+i).textContent = '🎯 ' + o.kalanHak;
  titret(120);
  if(o.kalanHak <= 0){ bitir(rakip, 'hak'); return; }
  mesaj(i, `❌ <b>${t.ad}</b> değil! Kalan tahmin hakkın: ${o.kalanHak}`);
  mesaj(rakip, `Rakip <b>${t.ad}</b> dedi, tutturamadı. Sıra sende.`);
  siraDegis();
}

/* ---------- bitiş ---------- */
function bitir(kazanan, sebep){
  clearInterval(S.timer);
  titret([80,50,80,50,160]);
  const k = S.oyuncular[kazanan], r = S.oyuncular[1-kazanan];
  $('#bitis-baslik').textContent = k.ad + ' kazandı! 🏆';
  $('#bitis-alt').innerHTML = sebep === 'tahmin'
    ? `<b>${r.takim.ad}</b> takımını <b>${k.soru}</b> soruda bildi. Toplam ${S.tur} tur sürdü.`
    : `${r.ad} tahmin haklarını tüketti. ${k.ad} otomatik kazandı.`;
  $('#bitis-acilis').innerHTML = S.oyuncular.map((o,i)=>`
    <div class="oyuncu-sonuc">
      ${armaSVG(o.takim)}
      <div class="kim">${o.ad}${i===kazanan?' 👑':''}</div>
      <div class="tkm">${o.takim.ad}</div>
      <div class="kim" style="margin-top:6px;color:#6d7a8d">${o.soru} soru</div>
    </div>`).join('');
  ekranGoster('ekran-bitis');
}

$('#tekrar').onclick = ()=>{ ekranGoster('ekran-kurulum'); $('#basla').click(); };
$('#menu').onclick   = ()=>{ clearInterval(S.timer); ekranGoster('ekran-kurulum'); };

/* başlat */
kurulumHazirla();
