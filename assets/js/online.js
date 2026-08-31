/* ================= TAKIM TUT — online oda istemcisi =================
   Sunucu (online-server/main.py) oyunun tek doğrusu: sıra, süre ve
   tahmin hakları orada tutulur. Bu dosya sadece gelen durumu çizer
   ve hamleleri iletir. Rakibin takımı oyun bitene kadar sunucudan
   hiç gönderilmez — yani gerçekten görünmez.
   ==================================================================== */

const NET = {
  ws: null, kod: null, pid: null, ben: -1, d: null,
  sunucu: '', kalan: null, sayacId: null, elenen: new Set(),
  kapaniyor: false, denemeler: 0,
};

/* ---------- kimlik & adres ---------- */
function netPid(){
  let p = null;
  try { p = localStorage.getItem('takimtut_pid'); } catch(e){}
  if(!p){
    p = Math.random().toString(36).slice(2) + Date.now().toString(36);
    try { localStorage.setItem('takimtut_pid', p); } catch(e){}
  }
  return p;
}
function netVarsayilanSunucu(){
  if(location.protocol === 'http:' || location.protocol === 'https:') return location.origin;
  return '';
}
function netWsAdresi(taban){
  const t = (taban || '').trim().replace(/\/+$/,'');
  if(!t) return null;
  if(/^wss?:\/\//.test(t)) return t + '/ws';
  if(/^https?:\/\//.test(t)) return t.replace(/^http/, 'ws') + '/ws';
  return 'wss://' + t + '/ws';   // şema yazılmadıysa güvenli varsay
}
function netMesaj(metin, kotu){
  const e = $('#net-durum');
  e.textContent = metin || '';
  e.classList.toggle('kotu', !!kotu);
}

/* ---------- bağlantı ---------- */
function netBaglan(ilkMesaj, hazir){
  const adres = netWsAdresi($('#net-sunucu').value || NET.sunucu || netVarsayilanSunucu());
  if(!adres){
    netMesaj('Sunucu adresi gerekli. Odayı çalıştırdığın adresi yaz (örn. https://xxx.up.railway.app).', true);
    return;
  }
  netMesaj('Bağlanılıyor…');
  let ws;
  try { ws = new WebSocket(adres); }
  catch(e){ netMesaj('Adres geçersiz: ' + adres, true); return; }

  NET.ws = ws;
  NET.kapaniyor = false;

  ws.onopen = () => { netMesaj(''); ws.send(JSON.stringify(ilkMesaj)); hazir && hazir(); };
  ws.onmessage = ev => {
    let m; try { m = JSON.parse(ev.data); } catch(e){ return; }
    if(m.t === 'oda'){
      NET.kod = m.kod; NET.pid = m.pid;
      try { history.replaceState(null, '', '?oda=' + m.kod); } catch(e){}
    }
    if(m.t === 'hata'){ netUyar(m.mesaj); netMesaj(m.mesaj, true); }
    if(m.t === 'durum'){ NET.d = m; netCiz(); }
  };
  ws.onclose = () => {
    if(NET.kapaniyor) return;
    netMesaj('Bağlantı koptu. Yeniden bağlanılıyor…', true);
    netUyar('Bağlantı koptu, yeniden bağlanılıyor…');
    if(NET.kod){
      setTimeout(()=> netBaglan({ t:'katil', kod:NET.kod, ad:netAd(), pid:netPid() }), 1500);
    }
  };
  ws.onerror = () => netMesaj('Sunucuya ulaşılamadı: ' + adres, true);
}
function netGonder(o){
  if(NET.ws && NET.ws.readyState === 1) NET.ws.send(JSON.stringify(o));
}
function netAd(){ return ($('#net-ad').value || '').trim().slice(0,14) || 'Oyuncu'; }
function netKapat(){
  NET.kapaniyor = true;
  try { NET.ws && NET.ws.close(); } catch(e){}
  NET.ws = null; NET.kod = null; NET.d = null; NET.elenen.clear();
  clearInterval(NET.sayacId);
  try { history.replaceState(null, '', location.pathname); } catch(e){}
  ekranGoster('ekran-kurulum');
}

/* geçici bildirim */
function netUyar(metin){
  let k = $('#net-toast');
  if(!k){
    k = document.createElement('div');
    k.id = 'net-toast';
    k.style.cssText = 'position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:60;'+
      'background:#1b2230;border:1.5px solid #38e08a;color:#eef2f8;padding:12px 18px;border-radius:999px;'+
      'font-weight:800;font-size:13px;max-width:88vw;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.5)';
    document.body.appendChild(k);
  }
  k.textContent = metin;
  k.style.display = 'block';
  clearTimeout(k._z);
  k._z = setTimeout(()=>{ k.style.display = 'none'; }, 2600);
}

/* ---------- kurulum ekranı: mod geçişi ---------- */
$$('.mod').forEach(b => b.onclick = () => {
  $$('.mod').forEach(x => x.classList.toggle('aktif', x === b));
  if(b.dataset.mod === 'online'){
    $('#net-ad').value = $('#net-ad').value || $('#ad1').value || '';
    $('#net-sunucu').value = NET.sunucu || netVarsayilanSunucu();
    ekranGoster('ekran-online');
  }
});
$$('[data-geri]').forEach(b => b.onclick = () => {
  $$('.mod').forEach(x => x.classList.toggle('aktif', x.dataset.mod === 'yerel'));
  ekranGoster(b.dataset.geri);
});

$('#net-kur').onclick = () => {
  NET.sunucu = $('#net-sunucu').value.trim();
  try { localStorage.setItem('takimtut_sunucu', NET.sunucu); } catch(e){}
  netBaglan({ t:'kur', ad:netAd(), pid:netPid(), havuz:S.ayar.havuz, sure:S.ayar.sure, hak:S.ayar.hak });
};
$('#net-katil').onclick = () => {
  const kod = $('#net-kod').value.trim().toUpperCase();
  if(kod.length !== 4){ netMesaj('Oda kodu 4 karakter olmalı.', true); return; }
  NET.sunucu = $('#net-sunucu').value.trim();
  try { localStorage.setItem('takimtut_sunucu', NET.sunucu); } catch(e){}
  netBaglan({ t:'katil', kod, ad:netAd(), pid:netPid() });
};
$('#net-kod').oninput = e => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,''); };

$('#lobi-kod').onclick = () => {
  const bag = location.origin + location.pathname + '?oda=' + NET.kod;
  const metin = NET.kod + ' — ' + bag;
  if(navigator.clipboard) navigator.clipboard.writeText(metin).then(()=>netUyar('Kod ve link kopyalandı'), ()=>netUyar('Kod: ' + NET.kod));
  else netUyar('Kod: ' + NET.kod);
};
$('#lobi-basla').onclick = () => netGonder({ t:'basla' });
$('#lobi-cik').onclick = netKapat;
$('#net-bitis-cik').onclick = netKapat;
$('#net-tekrar').onclick = () => netGonder({ t:'tekrar' });

/* ---------- ekran çizimi ---------- */
function netCiz(){
  const d = NET.d;
  if(!d) return;
  NET.ben = d.ben;
  if(d.faz === 'lobi')  { lobiCiz(d);      ekranGoster('ekran-lobi'); }
  if(d.faz === 'secim') { netSecimCiz(d);  ekranGoster('ekran-net-secim'); }
  if(d.faz === 'oyun')  { oyunCiz(d);      ekranGoster('ekran-net'); }
  if(d.faz === 'bitis') { netBitisCiz(d);  ekranGoster('ekran-net-bitis'); }
  netSayacKur(d);
}

function lobiCiz(d){
  $('#lobi-kod').textContent = d.kod;
  const liste = $('#lobi-oyuncular'); liste.innerHTML = '';
  for(let i=0;i<2;i++){
    const o = d.oyuncular[i];
    const el = document.createElement('div');
    el.className = 'lobi-oyuncu' + (o ? '' : ' bos');
    el.innerHTML = o
      ? `<span>${o.ad}${i===d.ben?' (sen)':''}</span><span class="rol">${i===0?'kurucu':'rakip'}${o.bagli?'':' • bağlantı yok'}</span>`
      : `<span>Rakip bekleniyor…</span><span class="rol">boş</span>`;
    liste.appendChild(el);
  }
  lobiAyarCiz(d);
  const bas = $('#lobi-basla');
  const kurucu = d.ben === 0;
  bas.style.display = kurucu ? '' : 'none';
  bas.disabled = d.oyuncular.length < 2;
  bas.textContent = d.oyuncular.length < 2 ? 'RAKİP BEKLENİYOR…' : 'BAŞLAT';
  $('#lobi-ipucu').textContent = kurucu
    ? 'Kodu rakibine söyle. Havuzu, süreyi ve tahmin hakkını aşağıdan değiştirebilirsin.'
    : 'Odaya girdin. Kurucu ayarları seçip başlatınca takım seçimine geçeceğiz.';
}

/* Lobide oda ayarları: havuz, süre, tahmin hakkı — sadece kurucu değiştirir */
function lobiAyarCiz(d){
  const kap = $('#lobi-ayar');
  const h = HAVUZLAR[d.havuz] || HAVUZLAR['super-lig'];
  if(d.ben !== 0){
    kap.className = 'lobi-ayar';
    kap.innerHTML =
      `<span>${h.ad} · ${takimlariGetir(d.havuz).length} takım</span>` +
      `<span>${d.sure ? d.sure + ' sn tur' : 'süresiz'}</span>` +
      `<span>${d.hakAyar} tahmin hakkı</span>`;
    return;
  }
  kap.className = 'lobi-ayar kurucu';
  const cip = (etkin, etiket, alt) =>
    `<button class="lobi-cip${etkin ? ' secili' : ''}">${etiket}${alt ? `<small>${alt}</small>` : ''}</button>`;

  kap.innerHTML = `
    <div class="lobi-grup">
      <span class="etiket">Takım havuzu</span>
      <div class="cipler" id="lb-havuz">${Object.entries(HAVUZLAR).map(([k,v]) =>
        cip(k === d.havuz, v.ad, takimlariGetir(k).length + ' takım')).join('')}</div>
    </div>
    <div class="lobi-grup">
      <span class="etiket">Tur süresi</span>
      <div class="cipler" id="lb-sure">${[15,30,45,0].map(x =>
        cip(x === d.sure, x ? x + ' sn' : 'Süresiz')).join('')}</div>
    </div>
    <div class="lobi-grup">
      <span class="etiket">Tahmin hakkı</span>
      <div class="cipler" id="lb-hak">${[1,2,3].map(x =>
        cip(x === d.hakAyar, x + ' hak')).join('')}</div>
    </div>`;

  const yolla = (yeniAyar) => {
    Object.assign(S.ayar, yeniAyar);          // bir dahaki odaya da taşınsın
    ayarKaydet();
    netGonder({ t:'ayar', havuz:S.ayar.havuz, sure:S.ayar.sure, hak:S.ayar.hak });
  };
  const anahtarlar = Object.keys(HAVUZLAR);
  $$('#lb-havuz .lobi-cip').forEach((b,i) => b.onclick = () => yolla({ havuz:anahtarlar[i] }));
  $$('#lb-sure .lobi-cip').forEach((b,i)  => b.onclick = () => yolla({ sure:[15,30,45,0][i] }));
  $$('#lb-hak .lobi-cip').forEach((b,i)   => b.onclick = () => yolla({ hak:[1,2,3][i] }));
}

function netSecimCiz(d){
  const rakip = d.oyuncular[1 - d.ben];
  $('#net-secim-durum').textContent = rakip && rakip.secti ? 'Rakip seçti ✓' : 'Rakip seçiyor…';
  if($('#net-secim-izgara').dataset.havuz === d.havuz) return;   // tekrar çizme
  $('#net-secim-izgara').dataset.havuz = d.havuz;
  netSecimListele('');
}
function netSecimListele(q){
  const d = NET.d;
  const iz = $('#net-secim-izgara'); iz.innerHTML = '';
  const n = norm((q||'').trim());
  takimlariGetir(d.havuz)
    .filter(t => !n || norm(t.ad).includes(n) || norm(t.sehir).includes(n) || norm(t.lig).includes(n))
    .forEach(t => iz.appendChild(takimKarti(t, ()=>{
      netGonder({ t:'takim', id:t.id });
      $('#net-secim-durum').textContent = t.ad + ' seçildi ✓';
    })));
}
$('#net-secim-ara').oninput = e => netSecimListele(e.target.value);

function oyunCiz(d){
  const ben = d.oyuncular[d.ben], rakip = d.oyuncular[1 - d.ben];
  const benimSiram = d.sira === d.ben;
  const takim = ben.takim ? takimBul(ben.takim) : null;

  $('#net-ben-ad').textContent = ben.ad;
  $('#net-hak').textContent = '🎯 ' + ben.hak;
  $('#net-rakip-ad').textContent = rakip ? rakip.ad : 'Rakip';
  $('#net-cevrim').className = 'cevrim' + (rakip && rakip.bagli ? ' acik' : '');

  /* kendi arman — kilitli */
  const alan = $('#net-arma-alan');
  if(takim && alan.dataset.takim !== takim.id){
    alan.dataset.takim = takim.id;
    const eski = $('.arma', alan); if(eski) eski.remove();
    alan.insertAdjacentHTML('afterbegin', arma(takim));
    $('#net-takim-ad').textContent = takim.ad;
    $('#net-takim-detay').textContent = `${takim.sehir} • ${takim.kurulus} • ${takim.lig}`;
  }

  const rozet = $('#net-rozet');
  rozet.className = 'net-rozet ' + (benimSiram ? 'sen' : 'rakip');
  rozet.textContent = benimSiram
    ? (d.bekleyen === 'soru' ? 'Sıra sende — soru sor' : 'Cevabı bekliyorsun')
    : (d.bekleyen === 'soru' ? rakip.ad + ' soru yazıyor…' : 'Cevap sırası sende');

  /* akış */
  const akis = $('#net-akis');
  // cevap beklenirken son soru zaten büyük kutuda duruyor, akışta tekrar etmesin
  let gecmis = d.kayit;
  if(d.bekleyen === 'cevap' && gecmis.length && gecmis[gecmis.length-1].tip === 'soru') gecmis = gecmis.slice(0,-1);
  akis.innerHTML = gecmis.slice(-8).map(k => {
    const kim = d.oyuncular[k.kim] ? d.oyuncular[k.kim].ad : '?';
    if(k.tip === 'soru')   return `<div class="satir"><span class="etiket2">${kim} sordu</span>${kacir(k.metin)}</div>`;
    if(k.tip === 'cevap')  return `<div class="satir ${k.metin==='EVET'?'evet':'hayir'}"><span class="etiket2">${kim}</span>${k.metin}</div>`;
    if(k.tip === 'yanlis') { const t = takimBul(k.metin); return `<div class="satir hayir"><span class="etiket2">${kim} tahmin</span>${t?t.ad:k.metin} — yanlış</div>`; }
    if(k.tip === 'pas')    return `<div class="satir sistem">${kim} turu pas geçti</div>`;
    if(k.tip === 'sure')   return `<div class="satir sistem">${kim}: süre doldu</div>`;
    return '';
  }).join('');
  akis.scrollTop = akis.scrollHeight;

  /* aksiyonlar */
  const a = $('#net-aksiyon');
  if(benimSiram && d.bekleyen === 'soru'){
    a.innerHTML = `
      <div class="soru-satir">
        <input id="net-soru" class="girdi" maxlength="140" placeholder="Evet/hayır sorusu yaz…" autocomplete="off">
        <button id="net-sor">SOR</button>
      </div>
      <div class="satir-btn">
        <button class="tahmin" id="net-tahmin">TAHMİN ET</button>
        <button id="net-pas">PAS</button>
        <button class="dar" id="net-fikir" title="Soru fikri">💡</button>
        <button class="dar" id="net-eleme" title="Eleme tahtası">📋</button>
      </div>`;
    const inp = $('#net-soru');
    const yolla = () => {
      const metin = inp.value.trim();
      if(!metin){ netUyar('Önce soruyu yaz.'); return; }
      netGonder({ t:'soru', metin });
      inp.value = '';
    };
    $('#net-sor').onclick = yolla;
    inp.onkeydown = e => { if(e.key === 'Enter') yolla(); };
    $('#net-tahmin').onclick = netTahminAc;
    $('#net-pas').onclick = () => netGonder({ t:'pas' });
    $('#net-fikir').onclick = () => { inp.value = SORULAR[Math.floor(Math.random()*SORULAR.length)]; inp.focus(); };
    $('#net-eleme').onclick = netElemeAc;
  } else if(!benimSiram && d.bekleyen === 'cevap'){
    a.innerHTML = `
      <div class="buyuk-soru">“${kacir(d.sonSoru)}”</div>
      <div class="satir-btn">
        <button class="evet" id="net-evet">EVET</button>
        <button class="hayir" id="net-hayir">HAYIR</button>
        <button class="dar" id="net-eleme" title="Eleme tahtası">📋</button>
      </div>`;
    $('#net-evet').onclick  = () => netGonder({ t:'cevap', evet:true });
    $('#net-hayir').onclick = () => netGonder({ t:'cevap', evet:false });
    $('#net-eleme').onclick = netElemeAc;
  } else if(benimSiram && d.bekleyen === 'cevap'){
    a.innerHTML = `
      <div class="buyuk-soru">“${kacir(d.sonSoru)}”</div>
      <div class="bekle">${rakip.ad} cevaplıyor…</div>
      <div class="satir-btn"><button class="dar" id="net-eleme" style="flex:1">📋 Eleme tahtası</button></div>`;
    $('#net-eleme').onclick = netElemeAc;
  } else {
    a.innerHTML = `
      <div class="bekle">${rakip.ad} sorusunu yazıyor…</div>
      <div class="satir-btn"><button class="dar" id="net-eleme" style="flex:1">📋 Eleme tahtası</button></div>`;
    $('#net-eleme').onclick = netElemeAc;
  }
}
function kacir(s){ return String(s||'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

/* Online modda kilit yok: telefon senin, rakip zaten karşı taraftan
   göremiyor — takımın sürekli açık dursun. */

/* sayaç: sunucu kalan saniyeyi yollar, ekranda yerel sayarız */
function netSayacKur(d){
  clearInterval(NET.sayacId);
  const e = $('#net-sayac');
  if(d.faz !== 'oyun' || d.kalan === null || d.kalan === undefined){
    e.textContent = d.faz === 'oyun' ? '∞' : '–';
    e.classList.remove('az');
    return;
  }
  NET.kalan = d.kalan;
  const ciz = () => {
    e.textContent = NET.kalan + '"';
    e.classList.toggle('az', NET.kalan <= 5);
  };
  ciz();
  NET.sayacId = setInterval(()=>{
    NET.kalan = Math.max(0, NET.kalan - 1);
    ciz();
    if(NET.kalan === 0) clearInterval(NET.sayacId);
  }, 1000);
}

/* ---------- tam ekran katmanlar ---------- */
function tamKatman(baslik, kartTikla, elemeModu){
  if($('#tam-katman')) return;
  const k = document.createElement('div');
  k.id = 'tam-katman'; k.className = 'tam-katman';
  k.innerHTML = `
    <div class="katman-ust"><h3>${baslik}</h3><button class="kapat">KAPAT</button></div>
    <input class="girdi ara" placeholder="Takım ya da şehir ara…" autocomplete="off">
    <div class="izgara"></div>`;
  document.body.appendChild(k);
  const iz = $('.izgara', k);
  const ciz = q => {
    iz.innerHTML = '';
    const n = norm((q||'').trim());
    takimlariGetir(NET.d.havuz)
      .filter(t => !n || norm(t.ad).includes(n) || norm(t.sehir).includes(n) || norm(t.lig).includes(n))
      .forEach(t => {
        const kart = takimKarti(t, ()=> kartTikla(t, kart, k));
        if(elemeModu && NET.elenen.has(t.id)) kart.classList.add('elendi');
        iz.appendChild(kart);
      });
  };
  $('.ara', k).oninput = e => ciz(e.target.value);
  $('.kapat', k).onclick = () => k.remove();
  ciz('');
}
function netElemeAc(){
  tamKatman('Eleme tahtası — elediğini işaretle', (t, kart)=>{
    if(NET.elenen.has(t.id)){ NET.elenen.delete(t.id); kart.classList.remove('elendi'); }
    else { NET.elenen.add(t.id); kart.classList.add('elendi'); }
  }, true);
}
function netTahminAc(){
  tamKatman('Rakibin takımı hangisi?', (t, kart, katman)=>{
    katman.remove();
    netGonder({ t:'tahmin', id:t.id });
  }, false);
}

/* ---------- bitiş ---------- */
function netBitisCiz(d){
  const kazandim = d.kazanan === d.ben;
  const ben = d.oyuncular[d.ben], rakip = d.oyuncular[1 - d.ben];
  $('#net-bitis-kupa').textContent = kazandim ? '🏆' : '😤';
  $('#net-bitis-baslik').textContent = kazandim ? 'Bildin, kazandın!' : rakip.ad + ' kazandı';
  $('#net-bitis-alt').innerHTML = d.sebep === 'tahmin'
    ? (kazandim ? `<b>${adBul(rakip)}</b> takımını ${ben.soru} soruda çözdün.`
                : `Takımın <b>${adBul(ben)}</b>’di, rakip ${rakip.soru} soruda buldu.`)
    : (kazandim ? 'Rakip tahmin haklarını tüketti.' : 'Tahmin hakkın bitti.');
  $('#net-bitis-acilis').innerHTML = d.oyuncular.map((o,i)=>{
    const t = o.takim ? takimBul(o.takim) : null;
    return `<div class="oyuncu-sonuc">
      ${t ? arma(t) : ''}
      <div class="kim">${o.ad}${i===d.kazanan?' 👑':''}</div>
      <div class="tkm">${t ? t.ad : '—'}</div>
      <div class="kim" style="margin-top:6px;color:#6d7a8d">${o.soru} soru</div>
    </div>`;
  }).join('');
}
function adBul(o){ const t = o.takim ? takimBul(o.takim) : null; return t ? t.ad : '?'; }

/* ---------- açılış: ?oda=KOD ile gelindiyse ---------- */
(function netAcilis(){
  try {
    const s = localStorage.getItem('takimtut_sunucu');
    if(s) NET.sunucu = s;
  } catch(e){}
  const kod = new URLSearchParams(location.search).get('oda');
  if(kod){
    $$('.mod').forEach(x => x.classList.toggle('aktif', x.dataset.mod === 'online'));
    $('#net-kod').value = kod.toUpperCase().slice(0,4);
    $('#net-sunucu').value = NET.sunucu || netVarsayilanSunucu();
    ekranGoster('ekran-online');
    netMesaj('Oda kodu hazır: ' + kod.toUpperCase() + ' — adını yazıp KATIL’a bas.');
  }
})();
