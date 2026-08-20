# Akkale'ye Selam — Ortaçağ Selam Duruşu Oyunu

Three.js ile yazılmış, tarayıcıda çalışan küçük bir ortaçağ oyunu.
Sen uzak diyarlardan gelen bir **efendisin**; töre gereği şehrin sahibi
**Bey Alparslan**'ın huzuruna çıkmadan önce Akkale halkının gönlünü alman gerekiyor.

## Nasıl oynanır

| Tuş | İş |
| --- | --- |
| `W A S D` | yürü |
| `Üst Karakter (Shift)` | koş |
| Fare | çevrene bak (tıklayınca imleç kilitlenir) |
| Fare tekerleği | kamera mesafesi |
| `1` / `2` / `3` | selam çeşidini seç |
| `E` | selam dur / huzura çık |
| `H` | töre kitabı |

### Töre
- **Baş Selamı (1)** → halktan kişilere (çoban, oduncu, çırak, hizmetkâr, dilenci, pazarcı)
- **Temenna (2)** → erkândan kişilere (usta, tüccar, muhafız, şövalye, müneccim, kâhya)
- **Diz Selamı (3)** → yalnızca şehrin sahibi Bey'e

Fazla eğilirsen zayıf, az eğilirsen küstah sayılırsın; ikisi de itibar kaybettirir.
Yanılırsan o kişi sana bir şans daha verir. İtibarın **60**'a ulaşınca kale kapısı açılır.

### Final: Huzura çıkış töreni
Kale avlusunda sekiye yaklaşıp `E`'ye bas. Dört adımlık selam töreninde
(şapkayı çıkar → diz çök → eli kalbe koy → selamı söyle) gösterilen tuşa
zamanlama çubuğunun tam ortasında basmalısın. İtibar + tören puanı unvanını belirler:
*Kapı Dışarı*'dan *Akkale'nin Onur Konuğu*'na kadar beş son var.

## Çalıştırma

ES modülleri kullanıldığı için dosyayı çift tıklamak yerine küçük bir sunucu gerekir:

```bash
cd ortacag-selam-oyunu
python3 -m http.server 8080
# tarayıcıda: http://localhost:8080
```

İnternet gerekmez — three.js `vendor/` klasöründe gömülüdür (yalnızca yazı tipleri
çevrimiçi yüklenir, olmazsa serif yazı tipine düşer).

## Dosyalar
- `index.html` — arayüz (itibar çubuğu, selam kartları, tören paneli, sonuç ekranı)
- `js/world.js` — Akkale: sokaklar, evler, pazar meydanı, surlar, kale ve taht sekisi
- `js/characters.js` — kutulardan yontulmuş karakterler ve selam/diz çökme pozları
- `js/game.js` — kamera, hareket, çarpışma, selam mantığı, tören mini oyunu
- `js/audio.js` — WebAudio ile üretilen adım/çan/boru sesleri
- `vendor/three.module.min.js` — three.js r160 (MIT, `vendor/LICENSE-three.txt`)
