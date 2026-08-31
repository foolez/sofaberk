# ⚽ TAKIM TUT

İki kişilik takım tahmin oyunu. Herkes bir takım tutar, sırayla **evet / hayır** sorusu sorup
rakibin takımını bulmaya çalışır. **212 takım**, süreli turlar, iki oynama şekli:

| Mod | Nasıl | Ne gerekir |
|---|---|---|
| 📱 **Aynı cihazda** | Tek telefon ikiye bölünür, sırayla elden ele | Hiçbir şey, dosyayı aç |
| 🌐 **Online · oda kodu** | Herkes kendi telefonundan, 4 haneli oda koduyla | Küçük bir oda sunucusu (`online-server/`) |

👉 **Tek dosya:** `takim-tut.html` — indir, çift tıkla. Aynı cihazda oynamak için başka hiçbir şey gerekmez.
👉 **Kaynak sürüm:** `index.html` + `assets/`

---

## Aynı cihazda oynama

1. Ekran düzenini seç:
   - **Yatay (varsayılan):** telefonu yan çevir, yan yana oturun — sol taraf 1. oyuncu, sağ taraf 2. oyuncu.
   - **Karşılıklı:** telefonu aranıza yatır, üst yarı karşıdaki için 180° ters döner.
2. Telefon sırayla el değiştirir, **herkes kendi takımını gizlice seçer**.
3. Kendi takımını görmek için kendi yarındaki armaya **basılı tut** — parmağını çekince kilitlenir.
4. Yeşil çerçeveli taraf sesli soru sorar, mavi çerçeveli taraf **EVET / HAYIR**'a basar; sıra otomatik döner.
5. Süre dolarsa tur yanar. Emin olunca **TAHMİN ET** → bilirsen kazanırsın, hakların biterse rakip kazanır.

## Online oynama (oda kodu)

1. Oda sunucusunu çalıştır (aşağıda) ve adresini aç, örn. `https://xxx.up.railway.app`.
2. Bir kişi **Online → ODA KUR** der, ekranda 4 haneli kod çıkar (örn. `JV43`).
   Koda dokununca kod + davet linki (`...?oda=JV43`) panoya kopyalanır.
3. Diğeri aynı adresi açar, **Online → kodu yazar → KATIL**. Linke tıklarsa kod hazır gelir.
4. Kurucu **BAŞLAT** der; ikisi de kendi telefonundan takımını seçer.
   Rakibin takımı sunucudan karşı tarafa **hiç gönderilmez**, oyun bitene kadar gerçekten gizlidir.
5. Sırası gelen soruyu **yazar**, diğeri EVET / HAYIR'a basar. Süreyi ve sırayı sunucu tutar,
   iki telefon asla ayrışmaz. Bağlantı koparsa aynı kodla girince oyun kaldığı yerden devam eder.

### Oda sunucusunu çalıştırma

Lokal (iki telefon aynı wifi'de):

```bash
cd online-server
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
# telefonlardan: http://<bilgisayarın-yerel-ip>:8000
```

Railway'e deploy (depodaki `sofascore-backend` ile aynı akış):

1. Railway → **New Project → Deploy from GitHub repo** → bu repo.
2. Servis ayarlarında **Root Directory: `online-server`** (Nixpacks Python'ı tanır; `Procfile` ve `railway.json` hazır).
3. Deploy bitince verilen adresi aç — sunucu hem oyunu hem odayı servis eder, ayrı hosting gerekmez.

Sunucu oyunu kendisi servis ettiği için **Sunucu adresi** alanını boş bırakabilirsin.
Oyunu başka yerden (GitHub Pages, tek dosya) açtıysan oraya sunucunun adresini yaz.

> Not: claude.ai üzerinde yayınlanan önizlemede online mod çalışmaz — tarayıcı güvenlik
> politikası (CSP) sayfanın dışarıya WebSocket açmasına izin vermiyor. Aynı cihazda mod orada da tam çalışır.

## Takımlar

212 takım, havuz seçilebilir:

| Havuz | Takım |
|---|---|
| Süper Lig | 18 |
| Türkiye (Süper Lig + TFF 1. Lig + klasikler) | 50 |
| Avrupa 5 Büyük (PL, LaLiga, Serie A, Bundesliga, Ligue 1) | 96 |
| Tüm Avrupa (+ Eredivisie, Primeira, diğerleri) | 148 |
| Hepsi (+ dünya kulüpleri) | 212 |

Kadrolar 2025-26 sezonuna göre; bir takım eksikse veya yanlışsa `assets/js/teams.js`
içindeki tek satırı düzeltmen yeter:

```js
// [id, ad, kısa, şehir, lig, kuruluş, renk1, renk2, desen, grup, bayrak]
['gs','Galatasaray','GS','İstanbul','Süper Lig',1905,'F5B301','A32638','stripes','sl','sa'],
//  desen : stripes | hoops | halves | sash | solid
//  bayrak: s=deniz kenarı  b=başkent  a=Avrupa kupası var
```

### Armalar hakkında

Kulüplerin gerçek armaları telifli olduğu için her arma, takımın **gerçek renk / desen /
kuruluş yılı** verisinden kod içinde SVG olarak üretilir (`armaSVG`). Takım ilk bakışta
tanınır, telif sorunu olmaz.

## Diğer özellikler

- **Tur süresi**: 15 / 30 / 45 saniye veya süresiz — süre dolunca sıra otomatik geçer
- **Tahmin hakkı**: 1, 2 veya 3
- **Eleme tahtası (📋)**: elediğin takımları üstü çizili işaretle
- **Soru fikri (💡)**: takılınca hazır soru önerisi (online modda soru kutusuna yazar)
- Ayarlar tarayıcıda hatırlanır, titreşim geri bildirimi var

## Dosyalar

```
index.html               ekranlar (kurulum / seçim / yerel oyun / online / bitiş)
assets/css/style.css     arayüz, split-screen ve online düzen
assets/js/teams.js       212 takım + arma üreteci
assets/js/game.js        aynı cihazda mod: tur, süre, tahmin, eleme
assets/js/online.js      online mod: WebSocket istemcisi ve ekranları
online-server/main.py    oda sunucusu (FastAPI + WebSocket), oyunu da servis eder
takim-tut.html           tek dosya sürüm (üretilen çıktı — elle düzenleme)
tools/build.py           kaynakları tek dosyada birleştirir
sofascore-backend/       (ilgisiz) Scout Terminal SofaScore köprü servisi
```

Kaynakları değiştirdikten sonra tek dosyayı tazele:

```bash
python3 tools/build.py
```
