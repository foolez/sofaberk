# ⚽ TAKIM TUT

İki kişilik, **bölünmüş ekranlı**, **sıralı ve süreli** takım tahmin oyunu.
Herkes bir takım tutar; sırayla **evet / hayır** sorusu sorup rakibin takımını bulmaya çalışır.

👉 **Hemen oyna:** https://claude.ai/code/artifact/cbf1213f-9fc9-4f66-92e8-d957d69a04a7
👉 Ya da `takim-tut.html` dosyasını indirip çift tıkla — tek dosya, kurulum/sunucu gerekmez.
   (Kaynak sürüm: `index.html` + `assets/`)

## Nasıl oynanır

1. Telefonu iki oyuncunun **arasına yatır**. Üst yarı karşındaki oyuncu için ters çevrilidir.
2. Oyun ikinize birer takım dağıtır (ya da "Kendim seçeyim" ile gizlice seçersiniz).
3. Kendi takımını görmek için arma alanına **basılı tut** — parmağını çekince tekrar kilitlenir.
   Böylece rakip senin takımını göremez.
4. Sıra kimdeyse **o sorar** (yeşil çerçeve), diğeri kendi takımına bakıp **EVET / HAYIR**'a basar.
   Cevap verilince sıra otomatik olarak karşıya geçer.
5. Süre dolarsa tur yanar, sıra rakibe geçer.
6. Emin olunca **TAHMİN ET** → rakibin takımını seç. Bilirsen kazanırsın; tahmin hakların biterse rakip kazanır.

## Özellikler

- **75 takım**: Süper Lig (18), Türkiye klasikleri (13), Avrupa devleri (44)
- **Havuz seçimi**: Süper Lig / Türkiye (geniş) / Avrupa / Hepsi karışık
- **Tur süresi**: 15 / 30 / 45 saniye veya süresiz
- **Tahmin hakkı**: 1, 2 veya 3
- **Eleme tahtası (📋)**: elediğin takımları üstü çizili işaretle
- **Soru fikri (💡)**: takılınca sorabileceğin hazır soru önerisi
- Ayarlar tarayıcıda hatırlanır, titreşim geri bildirimi var

## Armalar hakkında

Kulüplerin gerçek armaları telifli olduğu için her takımın arması, kendi
**gerçek renk / desen / kuruluş yılı** bilgisinden kod içinde SVG olarak üretilir
(`assets/js/teams.js` → `armaSVG`). Takım ilk bakışta tanınır, telif sorunu olmaz.

Yeni takım eklemek için `TAKIMLAR` dizisine bir satır ekle:

```js
{ id:'xyz', ad:'Takım Adı', kisa:'XYZ', sehir:'Şehir', ulke:'Türkiye', lig:'Süper Lig',
  kurulus:1923, renkler:['#0B6B3A','#FFFFFF'], desen:'stripes',  // stripes | hoops | halves | sash | solid
  lakap:'Lakap', sahil:true, baskent:false, avrupa:false, havuz:'tr' }
```

## Dosyalar

```
index.html            ekranlar (kurulum / gizli seçim / oyun / bitiş)
assets/css/style.css  arayüz + split-screen düzeni
assets/js/teams.js    takım veritabanı + arma üreteci
assets/js/game.js     tur, süre, tahmin ve eleme mantığı
takim-tut.html        tek dosya sürüm (üretilen çıktı — elle düzenleme)
tools/build.py        kaynakları tek dosyada birleştirir
sofascore-backend/    (ilgisiz) Scout Terminal SofaScore köprü servisi
```

Kaynakları değiştirdikten sonra tek dosyayı tazele:

```bash
python3 tools/build.py
```

## Yayına alma

Statik site olduğu için GitHub Pages yeter: **Settings → Pages → Branch: `main` / root**.
