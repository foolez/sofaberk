# 3D Ofsayt Karar Sistemi — ChatGPT Prompt'u

> Kaynak analiz: Roboflow, "3D Soccer Offside VAR System with Vision AI"
> (RF-DETR ile oyuncu tespiti → HSV ile saha çizgisi tespiti → SAM 3D Body ile
> tek karelik monoküler görüntüden 3B insan mesh'i → metrik sahaya oturtma →
> ofsayt düzlemi).
>
> Aşağıdaki prompt, bu boru hattının **3B geometri + karar** yarısını, sentetik
> bir test ortamında (3B insan modelleri yükleyip sahneye yerleştirerek)
> kurmak için ChatGPT'ye verilmek üzere yazılmıştır.

---

## PROMPT (kopyala–yapıştır)

```text
ROL
Sen kıdemli bir bilgisayarlı görü + 3B geometri mühendisisin. Spor analitiği
(futbol) ve IFAB kural yorumları konusunda uzmansın. Python ve 3B sahne
kurgusu (trimesh / Open3D / Blender bpy / Three.js) konusunda üretim kalitesinde
kod yazıyorsun.

AMAÇ
Bana, futbolda OFSAYT / ONSIDE kararını 3 boyutlu olarak veren, uçtan uca
çalışan bir sistem kur. Sistem gerçek videodan bağımsız olarak da test
edilebilmeli: 3B insan vücudu modellerini (mesh) sahneye yükleyip, metrik bir
futbol sahası üzerine yerleştirerek sanal senaryolar üretecek ve bu senaryolarda
kararı verecek. Yani önce "3B sanal test tezgahı", sonra istersem gerçek
görüntüye bağlanabilen bir mimari istiyorum.

REFERANS MİMARİ (bilgin olsun, birebir kopyalama; geometri kısmına odaklan)
Roboflow'un tek kameralı VAR denemesi şu adımları izliyor:
1) RF-DETR ile karedeki tüm oyuncuların tespiti,
2) Saha çizgilerinin klasik HSV renk eşiği ile bulunması (kale çizgisine
   paralel referans çizgiler; yedek olarak kullanıcıdan 4 nokta seçimi),
3) SAM 3D Body ile her oyuncunun tek RGB kareden tam gövde 3B mesh'inin
   (SMPL-X benzeri parametrik insan modeli) geri kazanılması,
4) Bu mesh'lerin metrik sahaya oturtulması ve ofsayt "düzlemi"nin çizilmesi.
Ben senden bu boru hattının 3. ve 4. adımlarına karşılık gelen, sentetik
modellerle çalışan bağımsız bir çekirdek istiyorum.

--------------------------------------------------------------------
BÖLÜM 1 — 3B ORTAM VE MODEL YÜKLEME
--------------------------------------------------------------------
- Metrik bir futbol sahası oluştur: 105 m x 68 m, orta saha çizgisi, ceza
  sahası, kale çizgisi. Dünya koordinat sistemi: X = kale çizgisine dik
  (hücum ekseni), Y = kale çizgisine paralel, Z = yukarı. Birim: metre.
- Sahneye N adet 3B insan vücudu modeli yükle. Desteklenecek girişler:
  (a) GLB/GLTF/FBX/OBJ mesh dosyası,
  (b) SMPL-X / MHR tipi parametrik model (beta = vücut şekli, theta = poz,
      global_orient, transl),
  (c) prosedürel olarak üretilen basit iskelet + kaplama (bağımlılık yoksa
      fallback).
- Her model için otomatik normalizasyon yap: ölçek (gerçek boy metre cinsinden,
  varsayılan 1.60–2.00 m arası), ayak tabanının z=0 düzlemine oturtulması,
  yön (facing) düzeltmesi.
- Her oyuncuya meta veri: player_id, team ("attacking"/"defending"),
  is_goalkeeper, konum (x, y), gövde yönü (yaw), poz adı.
- Sahne bir YAML/JSON senaryo dosyasından kurulabilsin (senaryolar sürüm
  kontrolüne girsin).

--------------------------------------------------------------------
BÖLÜM 2 — OFSAYT GEOMETRİSİ (İŞİN KALBİ)
--------------------------------------------------------------------
IFAB Kural 11'i geometriye şöyle çevir:
- Ofsayt konumu, oyuncunun BAŞ, GÖVDE veya AYAK'larının herhangi bir noktası
  ile değerlendirilir. KOL ve ELLER HARİÇTİR (koltuk altının alt hizasına
  kadar olan kısım gövde sayılır, ondan sonrası kol sayılır ve dikkate alınmaz).
  Bu yüzden mesh üzerinde vertex/segment bazlı bir "yasal bölge maskesi"
  üret: SMPL-X/MHR eklem indislerinden ya da mesh segmentasyonundan
  kol/el vertex'lerini dışla. Koltuk altı z-yüksekliğini omuz ve dirsek
  eklemlerinden hesapla ve kolları bu hizadan kes.
- Her oyuncu için "en ileri yasal nokta" (most advanced legal point):
  yasal vertex kümesinin hücum ekseni (X) üzerindeki projeksiyonunun maksimumu.
  Bu SADECE bir nokta değil, o noktadan geçen ve kale çizgisine paralel
  DÜZLEM olarak temsil edilsin (normal = hücum ekseni).
- Referans hat: savunma yapan takımın SONDAN İKİNCİ oyuncusunun en ileri
  yasal noktası (kaleci dahil sıralanır; kaleci ileri çıkmışsa kural yine
  "sondan ikinci oyuncu" üzerinden işler).
- Ek koşullar:
  * Oyuncu kendi sahasında ise ofsayt olamaz (X, orta saha çizgisinin gerisinde).
  * Oyuncu TOPUN gerisinde ise ofsayt olamaz → topun 3B konumu da senaryoda
    olsun.
  * Eşitlik (level) ONSIDE'dır. Kayan nokta hassasiyeti için bir tolerans
    (varsayılan 0.01 m) tanımla ve raporda "too close to call" bandını göster.
- Çıktı: her hücum oyuncusu için
  { player_id, verdict: OFFSIDE | ONSIDE | LEVEL, margin_m (işaretli mesafe,
    + = ofsayt), decisive_body_part: "sol ayak / sağ omuz / baş ...",
    decisive_vertex_xyz, reference_defender_id, confidence }
  ve maçın o anı için tek bir toplu karar.
- "Karar anı" (kick point / topa temas anı) senaryoda parametre olsun; ileride
  video akışından gelecek şekilde arayüz bırak.

--------------------------------------------------------------------
BÖLÜM 3 — GÖRSELLEŞTİRME
--------------------------------------------------------------------
- Döndürülebilir 3B sahne render'ı: oyuncu mesh'leri (takım renkleriyle),
  yarı saydam ofsayt düzlemi, sondan ikinci savunmacının düzlemi, hücumcunun
  belirleyici noktası işaretli.
- Kale arkası, yandan ve tepeden (bird's eye) üç sabit kamera görünümü + PNG
  export.
- Karar kartı: verdict, margin santimetre cinsinden, belirleyici uzuv,
  referans oyuncu.
- Tercihen: Three.js tabanlı tek dosyalık HTML viewer (glTF sahnesini yükleyip
  döndürebilen), ve/veya matplotlib/Open3D offline render.

--------------------------------------------------------------------
BÖLÜM 4 — TEST ORTAMI (BUNU ATLAMA)
--------------------------------------------------------------------
Sentetik senaryo üreteci yaz ve şu vakaları kapsayan test seti kur:
1. Açık ofsayt (hücumcu savunmacının 1.5 m önünde).
2. Açık onside (hücumcu 1.5 m geride).
3. Kıl payı ofsayt (2–5 cm) — uzatılmış ayak ucu belirleyici.
4. Kıl payı onside (2–5 cm).
5. Tam eşitlik (level) → ONSIDE dönmeli.
6. Kol/el testi: hücumcunun KOLU savunmacıyı geçiyor ama gövdesi geçmiyor →
   ONSIDE dönmeli (kritik regresyon testi).
7. Baş ile ofsayt: kafa vuruşuna giden oyuncunun başı önde.
8. Yatay/kayan (sliding) savunmacı — vücut yönü değişince maksimum nokta değişir.
9. Kaleci ileri çıkmış, sondan ikinci oyuncu bir defans.
10. Hücumcu orta sahanın gerisinde → ofsayt yok.
11. Hücumcu topun gerisinde → ofsayt yok.
12. Farklı vücut ölçüleri (kısa/uzun oyuncu) ve farklı mesh kaynakları.
Her senaryo için beklenen karar ve beklenen margin toleransı ile
pytest testleri yaz. Ground truth'u senaryo üreteci bildiği için tam doğrulama
mümkün — bunu kullan.
Ayrıca duyarlılık analizi: oyuncu konumuna ±5 cm, yaw'a ±5°, ölçeğe ±%2 gürültü
ekleyip kararın ne sıklıkla değiştiğini raporla (Monte Carlo, 1000 örnek).
Bu bana sistemin gerçek hayatta hangi marj altında güvenilmez olduğunu göstersin.

--------------------------------------------------------------------
BÖLÜM 5 — GERÇEK GÖRÜNTÜYE BAĞLANMA (ARAYÜZ, ŞİMDİLİK STUB)
--------------------------------------------------------------------
Çekirdek karar motoru, giriş olarak sadece "sahaya oturtulmuş 3B mesh listesi +
top konumu + hücum yönü" almalı. Bu yüzden şu adaptörleri soyut arayüz (Protocol
/ ABC) olarak tanımla ve sentetik implementasyonunu yaz, gerçek olanını stub bırak:
- PlayerDetector (görüntü → 2B kutular)  [ileride RF-DETR]
- TeamClassifier (kırpılmış oyuncu → takım)  [ileride embedding + kümeleme]
- PitchCalibrator (görüntü → homografi / kamera pozu)  [HSV çizgi tespiti veya
  4 noktalı manuel seçim]
- BodyReconstructor (kutu + görüntü → 3B mesh)  [ileride SAM 3D Body / SMPL-X]
Böylece sanal ortamda test ettiğim motor, aynı kodla gerçek videoya bağlanabilsin.

--------------------------------------------------------------------
TEKNİK KISITLAR
--------------------------------------------------------------------
- Python 3.11+, tip ipuçlu (type hints), saf fonksiyonlar tercih, numpy vektörel.
- Bağımlılıklar: numpy, trimesh, scipy, pytest zorunlu; open3d / pyrender /
  matplotlib opsiyonel (yoksa zarifçe devre dışı kalsın).
- Proje yapısı:
  offside3d/
    scene.py        (saha, koordinat sistemi, senaryo yükleyici)
    bodies.py       (mesh yükleme, normalizasyon, yasal bölge maskesi)
    rules.py        (IFAB geometrisi, karar motoru)
    render.py       (3B görselleştirme, viewer export)
    adapters/       (detector/calibrator/reconstructor arayüzleri + stub)
    scenarios/*.yaml
  tests/test_rules.py, tests/test_bodies.py, tests/test_scenarios.py
  README.md, pyproject.toml
- CLI: `python -m offside3d decide --scenario scenarios/tight_offside.yaml
  --render out/`
- Kod tam ve çalışır olsun; sahte (placeholder) fonksiyon bırakma — mesh yoksa
  prosedürel insan üretimi ile yine de çalışsın.

ÇIKTI BİÇİMİ
1. Önce 10–15 satırlık mimari özet + koordinat sistemi ve kural varsayımları.
2. Sonra dosya dosya tam kod (her dosya kendi kod bloğunda, yol başlıklı).
3. Sonra çalıştırma talimatları ve örnek çıktı (12 senaryonun karar tablosu).
4. En sonda: bu yaklaşımın gerçek hayattaki hata kaynakları (monoküler derinlik
   belirsizliği, kalibrasyon hatası, kare hızı / topa temas anının kaçırılması,
   örtüşen oyuncular, mesh geri kazanımının ±cm hatası) ve her biri için somut
   iyileştirme önerisi.

BENDEN İSTEDİĞİN NETLEŞTİRMELER VARSA ÖNCE 3 SORU SOR, SONRA KODA BAŞLA.
```

---

## Kullanım notları

- Prompt'u ChatGPT'ye tek parça ver. Model uzun kod üretirken kesilirse
  "Bölüm 2'den devam et" diyerek dosya dosya ilerlet.
- Gerçek videoya geçince `adapters/` altındaki stub'ları RF-DETR (oyuncu
  tespiti) ve SAM 3D Body (gövde mesh'i) ile doldurman yeterli; karar motoru
  değişmez.
- Kritik test: **6 numaralı kol/el senaryosu**. IFAB'a göre kol ve eller ofsaytta
  sayılmaz; çoğu naif uygulama mesh'in tüm vertex'lerini kullandığı için burada
  yanlış karar verir.
