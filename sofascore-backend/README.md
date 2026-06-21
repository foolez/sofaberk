# Scout Terminal — SofaScore köprü backend

Bu backend, frontend (artifact) ile SofaScore arasındaki köprü. Tarayıcı SofaScore'a
doğrudan bağlanamaz (CORS + Cloudflare), o yüzden veri bu Python servisinden geçer.

`curl_cffi` ile Chrome TLS parmak izi taklit edilir; düz `requests` Cloudflare'e 403 yer,
bu kütüphane geçer.

## Railway'de deploy (Apex Liga botundaki akışın aynısı)

1. Bu klasörü bir GitHub repo'suna at (ya da Railway CLI ile `railway up`).
2. Railway → **New Project → Deploy from GitHub repo** → bu repo.
3. Railway otomatik tanır (Nixpacks + Python). `Procfile` ve `railway.json` hazır.
4. Deploy bitince Railway sana bir URL verir, örn: `https://scout-xxxx.up.railway.app`
5. O URL'i frontend'deki **Ayarlar → Backend URL** alanına yapıştır, "Bağlan" de.

Lokal test:
```bash
pip install -r requirements.txt
uvicorn main:app --reload
# http://localhost:8000/leagues
```

## Endpoint'ler

| Endpoint | Ne döner |
|---|---|
| `GET /leagues` | Desteklenen ligler (güncel sezon otomatik çözülür) |
| `GET /league/{key}?limit=60` | Ligin oyuncu havuzu (özet kart verisi) |
| `GET /player/{id}?utid=&sid=` | Tam profil: pasaport + sezon istatistikleri + radar + heatmap |
| `GET /player/{id}/image` | Oyuncu fotoğrafı (proxy) |
| `GET /search?q=` | Oyuncu arama |

## Bilmen gerekenler / tuzaklar

- **Cloudflare riski:** Railway datacenter IP'leri bazen bloklanır. 403 (kodda 429'a
  çeviriyorum) görürsen: birkaç dakika bekle, ya da Railway'e bir residential/HTTP proxy
  ekleyip `sofa_get` içinde `proxies=` ver. `MIN_GAP` (0.8sn) rate limit tamponu.
- **Sezon ID otomatik:** `/unique-tournament/{utid}/seasons` ile en güncel sezonu kendi
  bulur, her sezon başında elle güncelleme yok.
- **Yıldızlı lig ID'leri** (`main.py` içinde `* doğrula` notlu): Primeira Liga, Eredivisie,
  Brasileirão, Saudi Pro League — bunların `utid`'sinden %100 emin değilim. Deploy sonrası
  `/league/<key>` çağır, boş/yanlış dönerse log'a bak ve ID'yi düzelt. Doğru ID'yi bulmak
  için tarayıcıda o ligin SofaScore sayfasını aç, URL'deki sayı `utid`'dir.
- **Cache:** in-memory, TTL 1 saat. Railway restart'ında sıfırlanır (sorun değil).
- **Yasal:** SofaScore'un resmi API'si yok; bu, ToS'larına göre gri alan. Kişisel/eğitim
  amaçlı kullan, ticari dağıtım için lisanslı veri (Opta/Wyscout) gerekir.
