"""
TAKIM TUT — online oda sunucusu
================================
Aynı odadaki iki oyuncuyu WebSocket üzerinden eşleştirir. Oyun durumu
tamamen sunucuda tutulur (kimin sırası, süre, tahmin hakları), istemciler
sadece gelen durumu çizer — böylece iki telefon asla ayrışmaz.

Ayrıca deponun kökündeki statik oyunu da servis eder: sunucuyu deploy edip
adresi açman yeterli, ayrı bir hosting gerekmez.

Çalıştırma:
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8000
    # http://localhost:8000
"""

from __future__ import annotations

import asyncio
import json
import os
import random
import string
import time
from dataclasses import dataclass, field
from typing import Dict, List, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # depo kökü
ODA_HARFLERI = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # karışan harfler (I,O,0,1) yok
ODA_OMRU = 3 * 60 * 60      # 3 saat dokunulmayan oda silinir
VARSAYILAN_SURE = 30

app = FastAPI(title="Takım Tut — oda sunucusu")


# ----------------------------------------------------------------- modeller
@dataclass
class Oyuncu:
    pid: str
    ad: str
    ws: Optional[WebSocket] = None
    takim: Optional[str] = None
    hak: int = 2
    soru: int = 0
    bagli: bool = True


@dataclass
class Oda:
    kod: str
    havuz: str = "super-lig"
    sure: int = VARSAYILAN_SURE
    hak: int = 2
    oyuncular: List[Oyuncu] = field(default_factory=list)
    faz: str = "lobi"           # lobi | secim | oyun | bitis
    sira: int = 0               # soruyu soran oyuncu
    tur: int = 1
    bekleyen: str = "soru"      # soru | cevap
    son_soru: str = ""
    kayit: List[dict] = field(default_factory=list)
    bitis: float = 0.0          # turun bitiş zamanı (epoch)
    kazanan: Optional[int] = None
    sebep: str = ""
    dokunma: float = field(default_factory=time.time)

    def oyuncu_bul(self, pid: str) -> Optional[Oyuncu]:
        return next((o for o in self.oyuncular if o.pid == pid), None)

    def indeks(self, pid: str) -> int:
        return next((i for i, o in enumerate(self.oyuncular) if o.pid == pid), -1)


ODALAR: Dict[str, Oda] = {}


def yeni_kod() -> str:
    while True:
        kod = "".join(random.choice(ODA_HARFLERI) for _ in range(4))
        if kod not in ODALAR:
            return kod


def kalan_sn(oda: Oda) -> Optional[int]:
    if not oda.sure or oda.faz != "oyun":
        return None
    return max(0, int(round(oda.bitis - time.time())))


def turu_kur(oda: Oda):
    oda.bitis = time.time() + oda.sure if oda.sure else 0.0


# ------------------------------------------------------- durum yayını
def durum(oda: Oda, pid: str) -> dict:
    """Bir oyuncunun görmesi gereken durum. Rakibin takımı OYUN BİTENE KADAR gizli."""
    ben = oda.indeks(pid)
    goster_hepsi = oda.faz == "bitis"
    return {
        "t": "durum",
        "kod": oda.kod,
        "ben": ben,
        "faz": oda.faz,
        "havuz": oda.havuz,
        "sure": oda.sure,
        "hakAyar": oda.hak,
        "sira": oda.sira,
        "tur": oda.tur,
        "bekleyen": oda.bekleyen,
        "sonSoru": oda.son_soru,
        "kalan": kalan_sn(oda),
        "kayit": oda.kayit[-30:],
        "kazanan": oda.kazanan,
        "sebep": oda.sebep,
        "oyuncular": [
            {
                "ad": o.ad,
                "bagli": o.bagli,
                "hak": o.hak,
                "soru": o.soru,
                "secti": o.takim is not None,
                # kendi takımını her zaman, rakibinkini sadece oyun bitince gör
                "takim": o.takim if (i == ben or goster_hepsi) else None,
            }
            for i, o in enumerate(oda.oyuncular)
        ],
    }


async def yayinla(oda: Oda):
    oda.dokunma = time.time()
    for o in list(oda.oyuncular):
        if o.ws is None:
            continue
        try:
            await o.ws.send_text(json.dumps(durum(oda, o.pid), ensure_ascii=False))
        except Exception:
            o.bagli = False


async def hata(ws: WebSocket, mesaj: str):
    try:
        await ws.send_text(json.dumps({"t": "hata", "mesaj": mesaj}, ensure_ascii=False))
    except Exception:
        pass


# ------------------------------------------------------- oyun hamleleri
def kayit_ekle(oda: Oda, tip: str, kim: int, metin: str):
    oda.kayit.append({"tip": tip, "kim": kim, "metin": metin, "tur": oda.tur})


def sirayi_devret(oda: Oda):
    oda.sira = 1 - oda.sira
    oda.tur += 1
    oda.bekleyen = "soru"
    oda.son_soru = ""
    turu_kur(oda)


def oyunu_bitir(oda: Oda, kazanan: int, sebep: str):
    oda.faz = "bitis"
    oda.kazanan = kazanan
    oda.sebep = sebep
    oda.bitis = 0.0


def oyunu_baslat(oda: Oda):
    oda.faz = "oyun"
    oda.sira = random.randint(0, 1)
    oda.tur = 1
    oda.bekleyen = "soru"
    oda.son_soru = ""
    oda.kayit = []
    oda.kazanan = None
    oda.sebep = ""
    for o in oda.oyuncular:
        o.hak = oda.hak
        o.soru = 0
    turu_kur(oda)


async def hamle(oda: Oda, oyuncu: Oyuncu, m: dict) -> Optional[str]:
    """Hamleyi uygular. Hata metni döner ya da None."""
    t = m.get("t")
    ben = oda.indeks(oyuncu.pid)

    if t == "ayar":
        if ben != 0:
            return "Ayarları sadece odayı kuran değiştirebilir."
        if oda.faz != "lobi":
            return "Oyun başladı, ayarlar kilitli."
        oda.havuz = str(m.get("havuz", oda.havuz))[:20]
        oda.sure = max(0, min(120, int(m.get("sure", oda.sure))))
        oda.hak = max(1, min(5, int(m.get("hak", oda.hak))))
        return None

    if t == "basla":
        if ben != 0:
            return "Oyunu odayı kuran başlatır."
        if len(oda.oyuncular) < 2:
            return "Rakip henüz odaya girmedi."
        oda.faz = "secim"
        for o in oda.oyuncular:
            o.takim = None
        return None

    if t == "takim":
        if oda.faz != "secim":
            return "Şu an takım seçilmiyor."
        oyuncu.takim = str(m.get("id", ""))[:24]
        if all(o.takim for o in oda.oyuncular) and len(oda.oyuncular) == 2:
            oyunu_baslat(oda)
        return None

    if oda.faz != "oyun":
        return "Oyun sürmüyor."

    if t == "soru":
        if ben != oda.sira or oda.bekleyen != "soru":
            return "Sıra sende değil."
        metin = str(m.get("metin", "")).strip()[:140]
        if not metin:
            return "Soru boş olamaz."
        oda.son_soru = metin
        oda.bekleyen = "cevap"
        oyuncu.soru += 1
        kayit_ekle(oda, "soru", ben, metin)
        turu_kur(oda)
        return None

    if t == "cevap":
        if ben == oda.sira or oda.bekleyen != "cevap":
            return "Cevap sırası sende değil."
        evet = bool(m.get("evet"))
        kayit_ekle(oda, "cevap", ben, "EVET" if evet else "HAYIR")
        sirayi_devret(oda)
        return None

    if t == "pas":
        if ben != oda.sira or oda.bekleyen != "soru":
            return "Sıra sende değil."
        kayit_ekle(oda, "pas", ben, "turu pas geçti")
        sirayi_devret(oda)
        return None

    if t == "tahmin":
        if ben != oda.sira or oda.bekleyen != "soru":
            return "Tahmin sırası sende değil."
        secilen = str(m.get("id", ""))
        rakip = oda.oyuncular[1 - ben]
        if secilen == rakip.takim:
            kayit_ekle(oda, "tahmin", ben, "doğru tahmin")
            oyunu_bitir(oda, ben, "tahmin")
        else:
            oyuncu.hak -= 1
            kayit_ekle(oda, "yanlis", ben, secilen)
            if oyuncu.hak <= 0:
                oyunu_bitir(oda, 1 - ben, "hak")
            else:
                sirayi_devret(oda)
        return None

    return "Bilinmeyen hamle."


async def tekrar(oda: Oda):
    oda.faz = "secim"
    for o in oda.oyuncular:
        o.takim = None
    oda.kazanan = None
    oda.sebep = ""
    oda.kayit = []


# ------------------------------------------------------- süre bekçisi
async def bekci():
    """Süresi dolan turları işler, ölü odaları temizler."""
    while True:
        await asyncio.sleep(0.5)
        simdi = time.time()
        for kod, oda in list(ODALAR.items()):
            if simdi - oda.dokunma > ODA_OMRU:
                ODALAR.pop(kod, None)
                continue
            if oda.faz == "oyun" and oda.sure and oda.bitis and simdi >= oda.bitis:
                if oda.bekleyen == "cevap":
                    kayit_ekle(oda, "sure", 1 - oda.sira, "cevap süresi doldu")
                else:
                    kayit_ekle(oda, "sure", oda.sira, "soru süresi doldu")
                sirayi_devret(oda)
                await yayinla(oda)


@app.on_event("startup")
async def basla():
    asyncio.create_task(bekci())


# ------------------------------------------------------- websocket
@app.websocket("/ws")
async def ws_uc(ws: WebSocket):
    await ws.accept()
    oda: Optional[Oda] = None
    oyuncu: Optional[Oyuncu] = None
    try:
        while True:
            ham = await ws.receive_text()
            try:
                m = json.loads(ham)
            except Exception:
                continue
            t = m.get("t")

            # --- odaya girmeden önce sadece kur/katil ---
            if oda is None:
                ad = str(m.get("ad", "")).strip()[:14] or "Oyuncu"
                pid = str(m.get("pid", "")).strip()[:40] or "".join(
                    random.choice(string.ascii_lowercase + string.digits) for _ in range(12))

                if t == "kur":
                    oda = Oda(kod=yeni_kod())
                    oda.havuz = str(m.get("havuz", oda.havuz))[:20]
                    oda.sure = max(0, min(120, int(m.get("sure", VARSAYILAN_SURE))))
                    oda.hak = max(1, min(5, int(m.get("hak", 2))))
                    oyuncu = Oyuncu(pid=pid, ad=ad, ws=ws, hak=oda.hak)
                    oda.oyuncular.append(oyuncu)
                    ODALAR[oda.kod] = oda
                    await ws.send_text(json.dumps({"t": "oda", "kod": oda.kod, "pid": pid}, ensure_ascii=False))
                    await yayinla(oda)
                    continue

                if t == "katil":
                    kod = str(m.get("kod", "")).strip().upper()[:6]
                    hedef = ODALAR.get(kod)
                    if not hedef:
                        await hata(ws, "Böyle bir oda yok. Kodu kontrol et.")
                        continue
                    eski = hedef.oyuncu_bul(pid)
                    if eski:                       # yeniden bağlanma
                        eski.ws, eski.bagli, eski.ad = ws, True, ad
                        oda, oyuncu = hedef, eski
                    elif len(hedef.oyuncular) >= 2:
                        await hata(ws, "Oda dolu (2 kişilik).")
                        continue
                    else:
                        oyuncu = Oyuncu(pid=pid, ad=ad, ws=ws, hak=hedef.hak)
                        hedef.oyuncular.append(oyuncu)
                        oda = hedef
                    await ws.send_text(json.dumps({"t": "oda", "kod": oda.kod, "pid": pid}, ensure_ascii=False))
                    await yayinla(oda)
                    continue

                await hata(ws, "Önce oda kur ya da bir odaya katıl.")
                continue

            # --- oda içi hamleler ---
            if t == "tekrar":
                await tekrar(oda)
                await yayinla(oda)
                continue
            if t == "ping":
                await ws.send_text('{"t":"pong"}')
                continue

            sorun = await hamle(oda, oyuncu, m)
            if sorun:
                await hata(ws, sorun)
            await yayinla(oda)

    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        if oyuncu is not None:
            oyuncu.bagli = False
            oyuncu.ws = None
        if oda is not None:
            await yayinla(oda)


# ------------------------------------------------------- statik oyun
@app.get("/saglik")
async def saglik():
    return JSONResponse({"durum": "ayakta", "oda": len(ODALAR)})


@app.get("/")
async def kok():
    return FileResponse(os.path.join(KOK, "index.html"))


app.mount("/assets", StaticFiles(directory=os.path.join(KOK, "assets")), name="assets")
