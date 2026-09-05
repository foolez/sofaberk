# 3D Ofsayt Karar Sistemi — ChatGPT Prompt'u

Kaynak analiz: Roboflow, "3D Soccer Offside VAR System with Vision AI"
(RF-DETR ile oyuncu tespiti → HSV ile saha çizgisi tespiti → SAM 3D Body ile
tek karelik görüntüden 3B insan mesh'i → metrik sahaya oturtma → ofsayt düzlemi).

Aşağıdaki prompt bu boru hattının **3B geometri + karar** kısmını, sentetik bir
ortamda tek adımda kurmak için yazılmıştır.

## PROMPT (kopyala–yapıştır)

```text
Python'da çalışan, tek dosyalık bir 3B OFSAYT karar sistemi yaz.

NE YAPACAK
- 105x68 m metrik bir futbol sahası kur. X ekseni = hücum yönü (kale çizgisine
  dik), Y = kale çizgisine paralel, Z = yukarı. Birim metre.
- Sahaya 3B insan vücudu modelleri yükle (GLB/OBJ/FBX mesh dosyası). Mesh yoksa
  basit prosedürel bir insan modeli üretip onunla çalış, yani kod her hâlükârda
  çalışsın. Her modeli boyuna göre ölçekle ve ayaklarını z=0'a otur.
- Her oyuncuya: id, takım (hücum/savunma), kaleci mi, konum (x,y), yön (yaw).
- Sahne basit bir Python dict / JSON senaryosundan kurulsun.

OFSAYT KURALI (IFAB)
- Karar baş, gövde ve ayaklarla verilir; KOL ve ELLER SAYILMAZ (koltuk altı
  hizasından sonrası kol). Mesh vertex'lerinden kol/el bölgesini maskele.
- Her oyuncunun "en ileri yasal noktası" = yasal vertex'lerin X ekseni üzerindeki
  maksimumu.
- Referans: savunan takımın sondan ikinci oyuncusunun en ileri yasal noktası.
- Hücumcu bu noktayı geçtiyse OFFSIDE, geçmediyse ONSIDE. Eşitlik ONSIDE.
- Hücumcu kendi sahasındaysa veya topun gerisindeyse ofsayt yok (top konumu da
  senaryoda olsun).

ÇIKTI
Her hücum oyuncusu için: verdict (OFFSIDE/ONSIDE), margin (cm, işaretli),
belirleyici uzuv (ör. "sol ayak"), referans savunmacı id.
Ayrıca matplotlib ile tepeden + kale arkası görünüm çiz: oyuncular, ofsayt
düzlemi, belirleyici nokta.

TEST
Şu 5 senaryoyu kur ve doğru sonuç verdiğini göster:
1) net ofsayt, 2) net onside, 3) 3 cm ile ofsayt, 4) tam eşitlik → ONSIDE,
5) hücumcunun KOLU savunmacıyı geçiyor ama gövdesi geçmiyor → ONSIDE.

KISITLAR
- numpy + trimesh + matplotlib yeterli, ekstra bağımlılık ekleme.
- Tek dosya: offside3d.py, `python offside3d.py` ile 5 senaryoyu çalıştırıp
  sonuç tablosunu bassın.
- Placeholder/TODO bırakma, kod eksiksiz ve çalışır olsun.
```

## Not

5. test senaryosu (kol/el) kritik: IFAB'a göre kol ve eller ofsaytta sayılmaz.
Mesh'in tüm vertex'lerini kullanan naif uygulamalar burada yanlış karar verir.

Gerçek videoya bağlanmak istenirse karar motoru aynı kalır; önüne sadece oyuncu
tespiti (RF-DETR), saha kalibrasyonu (HSV çizgi tespiti veya 4 nokta manuel) ve
gövde geri kazanımı (SAM 3D Body) eklenir.
