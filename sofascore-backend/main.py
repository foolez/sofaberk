"""
SCOUT TERMINAL — SofaScore köprü backend'i
==========================================
SofaScore'un resmi API'si yok ve internal endpoint'leri Cloudflare ile korunuyor.
Düz `requests` 403 yer. Çözüm: curl_cffi ile Chrome TLS parmak izini taklit etmek.

Endpoint'ler:
  GET  /                         -> sağlık kontrolü
  GET  /leagues                  -> desteklenen ligler (güncel sezon otomatik çözülür)
  GET  /league/{key}             -> o ligin oyuncu havuzu (özet kartlar)
  GET  /player/{id}              -> tam profil (pasaport + sezon istatistikleri + radar + heatmap)
  GET  /player/{id}/image        -> oyuncu fotoğrafı (proxy)
  GET  /search?q=                -> oyuncu arama

Deploy: bkz. README.md
"""

import time
import threading
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse

try:
    from curl_cffi import requests as creq  # TLS impersonation -> Cloudflare'i geçer
except Exception as e:  # pragma: no cover
    raise RuntimeError(
        "curl_cffi gerekli. requirements.txt yüklendi mi? -> pip install curl_cffi"
    ) from e

API = "https://www.sofascore.com/api/v1"
IMG_API = "https://api.sofascore.app/api/v1"

# Bilinen unique-tournament ID'leri. Sezon ID'si OTOMATİK çözülür (/seasons -> en güncel),
# o yüzden her sezon başında elle güncellemen gerekmez.
# NOT: Birkaçından %100 emin değilim (yıldızlı). Test edip log'a bak, yanlışı düzeltiriz.
LEAGUES: Dict[str, Dict[str, Any]] = {
    "premier-league": {"name": "Premier League", "utid": 17,  "flag": "🏴", "country": "İngiltere", "region": "Batı Avrupa"},
    "laliga":         {"name": "LaLiga",          "utid": 8,   "flag": "🇪🇸", "country": "İspanya",   "region": "Batı Avrupa"},
    "serie-a":        {"name": "Serie A",         "utid": 23,  "flag": "🇮🇹", "country": "İtalya",    "region": "Batı Avrupa"},
    "bundesliga":     {"name": "Bundesliga",      "utid": 35,  "flag": "🇩🇪", "country": "Almanya",   "region": "Orta Avrupa"},
    "ligue-1":        {"name": "Ligue 1",         "utid": 34,  "flag": "🇫🇷", "country": "Fransa",    "region": "Batı Avrupa"},
    "super-lig":      {"name": "Süper Lig",       "utid": 52,  "flag": "🇹🇷", "country": "Türkiye",   "region": "Doğu Avrupa"},
    "champions-league":{"name": "Şampiyonlar Ligi","utid": 7,  "flag": "🏆", "country": "Avrupa",    "region": "Avrupa"},
    "primeira-liga":  {"name": "Primeira Liga",   "utid": 238, "flag": "🇵🇹", "country": "Portekiz",  "region": "Batı Avrupa"},   # * doğrula
    "eredivisie":     {"name": "Eredivisie",      "utid": 37,  "flag": "🇳🇱", "country": "Hollanda",  "region": "Batı Avrupa"},   # * doğrula
    "brazil-serie-a": {"name": "Brasileirão",     "utid": 325, "flag": "🇧🇷", "country": "Brezilya",  "region": "Güney Amerika"}, # * doğrula
    "saudi-pro":      {"name": "Saudi Pro League","utid": 955, "flag": "🇸🇦", "country": "S.Arabistan","region": "Orta Doğu"},     # * doğrula
}

HEADERS = {
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9,tr;q=0.8",
    "Referer": "https://www.sofascore.com/",
    "Origin": "https://www.sofascore.com",
    "User-Agent": ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                   "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"),
}

# ----------------------------------------------------------------------------
# basit thread-safe TTL cache + nazik rate limit (Cloudflare ban yememek için)
# ----------------------------------------------------------------------------
_cache: Dict[str, Any] = {}
_cache_lock = threading.Lock()
_last_call = [0.0]
_call_lock = threading.Lock()
MIN_GAP = 0.8  # saniye, istekler arası minimum boşluk


def _throttle():
    with _call_lock:
        gap = time.time() - _last_call[0]
        if gap < MIN_GAP:
            time.sleep(MIN_GAP - gap)
        _last_call[0] = time.time()


def cached(key: str, ttl: int, producer):
    now = time.time()
    with _cache_lock:
        hit = _cache.get(key)
        if hit and now - hit[0] < ttl:
            return hit[1]
    val = producer()
    with _cache_lock:
        _cache[key] = (now, val)
    return val


def sofa_get(path: str) -> dict:
    """SofaScore'a impersonate'li istek. 403/blok olursa anlamlı hata fırlatır."""
    _throttle()
    url = f"{API}{path}"
    try:
        r = creq.get(url, headers=HEADERS, impersonate="chrome124", timeout=20)
    except Exception as e:
        raise HTTPException(502, f"SofaScore'a ulaşılamadı: {e}")
    if r.status_code == 403:
        raise HTTPException(
            429,
            "SofaScore Cloudflare engeli (403). Railway IP'si bloklanmış olabilir; "
            "biraz bekle veya proxy ekle.",
        )
    if r.status_code == 404:
        raise HTTPException(404, f"Bulunamadı: {path}")
    if r.status_code != 200:
        raise HTTPException(502, f"SofaScore {r.status_code}: {path}")
    try:
        return r.json()
    except Exception:
        raise HTTPException(502, "SofaScore JSON parse edilemedi (muhtemelen Cloudflare sayfası).")


# ----------------------------------------------------------------------------
# yardımcılar
# ----------------------------------------------------------------------------
POS_GROUP = {"G": "Kale", "D": "Defans", "M": "Orta Saha", "F": "Hücum"}
POS_NAME = {"G": "Kaleci", "D": "Defans", "M": "Orta Saha", "F": "Hücum"}


def resolve_season(utid: int) -> Optional[int]:
    """Bir ligin en güncel sezon ID'sini bulur (elle güncelleme derdi olmasın)."""
    def _p():
        data = sofa_get(f"/unique-tournament/{utid}/seasons")
        seasons = data.get("seasons", [])
        return seasons[0]["id"] if seasons else None
    return cached(f"season:{utid}", ttl=6 * 3600, producer=_p)


def thumb(player_id: int) -> str:
    return f"{IMG_API}/player/{player_id}/image"


# ----------------------------------------------------------------------------
# uygulama
# ----------------------------------------------------------------------------
app = FastAPI(title="Scout Terminal — SofaScore Bridge", version="1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # artifact'in origin'i değişken; herkese açık
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health():
    return {"ok": True, "service": "scout-terminal-bridge", "leagues": len(LEAGUES)}


@app.get("/leagues")
def leagues():
    out = []
    for key, lg in LEAGUES.items():
        out.append({
            "key": key, "name": lg["name"], "flag": lg["flag"],
            "country": lg["country"], "region": lg["region"], "utid": lg["utid"],
        })
    return {"leagues": out}


@app.get("/league/{key}")
def league_players(key: str, limit: int = Query(60, ge=10, le=200)):
    if key not in LEAGUES:
        raise HTTPException(404, "Bilinmeyen lig anahtarı")
    lg = LEAGUES[key]
    utid = lg["utid"]
    sid = resolve_season(utid)
    if not sid:
        raise HTTPException(502, "Sezon ID çözülemedi")

    def _p():
        # rating'e göre en iyi oyuncular -> sağlam scouting havuzu
        data = sofa_get(
            f"/unique-tournament/{utid}/season/{sid}/top-players/overall?limit={limit}"
        )
        rows = (data.get("topPlayers", {}) or {}).get("rating", []) or []
        players = []
        for row in rows:
            p = row.get("player", {}) or {}
            team = row.get("team", {}) or {}
            st = row.get("statistics", {}) or {}
            pid = p.get("id")
            if not pid:
                continue
            pos = p.get("position") or "?"
            players.append({
                "id": pid,
                "name": p.get("name", "?"),
                "club": team.get("name", "?"),
                "clubId": team.get("id"),
                "image": thumb(pid),
                "posCode": pos,
                "posGroup": POS_GROUP.get(pos, "Diğer"),
                "rating": round(st.get("rating", 0) or 0, 2),
                "goals": st.get("goals", 0) or 0,
                "assists": st.get("assists", 0) or 0,
                "appearances": st.get("appearances", 0) or 0,
                "leagueKey": key,
                "leagueName": lg["name"],
                "flag": lg["flag"],
                "region": lg["region"],
                "country": lg["country"],
                "utid": utid, "sid": sid,
            })
        return {"league": lg["name"], "season": sid, "count": len(players), "players": players}

    return cached(f"league:{key}:{limit}", ttl=3600, producer=_p)


@app.get("/player/{player_id}")
def player_detail(player_id: int,
                  utid: Optional[int] = None,
                  sid: Optional[int] = None):
    def _p():
        base = sofa_get(f"/player/{player_id}").get("player", {}) or {}

        # pasaport
        dob = base.get("dateOfBirthTimestamp")
        age = None
        if dob:
            age = int((time.time() - dob) / (365.25 * 24 * 3600))
        mv = None
        mvraw = base.get("proposedMarketValueRaw") or {}
        if mvraw.get("value"):
            mv = mvraw["value"]
        elif base.get("proposedMarketValue"):
            mv = base.get("proposedMarketValue")
        contract = base.get("contractUntilTimestamp")
        contract_year = (time.gmtime(contract).tm_year if contract else None)
        pos = base.get("position") or "?"

        passport = {
            "id": player_id,
            "name": base.get("name", "?"),
            "image": thumb(player_id),
            "age": age,
            "dob": dob,
            "height": base.get("height"),
            "preferredFoot": base.get("preferredFoot"),
            "country": (base.get("country") or {}).get("name"),
            "nationality": (base.get("country") or {}).get("alpha2"),
            "club": (base.get("team") or {}).get("name"),
            "clubId": (base.get("team") or {}).get("id"),
            "shirtNumber": base.get("shirtNumber") or base.get("jerseyNumber"),
            "marketValue": mv,
            "contractYear": contract_year,
            "posCode": pos,
            "posGroup": POS_GROUP.get(pos, "Diğer"),
        }

        # radar (SofaScore'un kendi attribute overview'i)
        radar = None
        try:
            ao = sofa_get(f"/player/{player_id}/attribute-overviews")
            arr = ao.get("playerAttributeOverviews") or []
            if arr:
                a = arr[0]
                radar = {
                    "attacking": a.get("attacking"),
                    "technical": a.get("technical"),
                    "tactical": a.get("tactical"),
                    "defending": a.get("defending"),
                    "creativity": a.get("creativity"),
                }
                avg = (ao.get("averageAttributeOverviews") or [{}])[0]
                radar_avg = {
                    "attacking": avg.get("attacking"),
                    "technical": avg.get("technical"),
                    "tactical": avg.get("tactical"),
                    "defending": avg.get("defending"),
                    "creativity": avg.get("creativity"),
                }
            else:
                radar_avg = None
        except HTTPException:
            radar, radar_avg = None, None

        # sezon istatistikleri (tüm parametreler) — utid/sid verilmişse
        stats = None
        if utid and sid:
            try:
                sdata = sofa_get(
                    f"/player/{player_id}/unique-tournament/{utid}/season/{sid}/statistics/overall"
                )
                stats = sdata.get("statistics", {}) or {}
            except HTTPException:
                stats = None

        # heatmap (sezonluk) — utid/sid varsa
        heatmap = None
        if utid and sid:
            try:
                hdata = sofa_get(
                    f"/player/{player_id}/unique-tournament/{utid}/season/{sid}/heatmap/overall"
                )
                pts = hdata.get("points") or hdata.get("heatmap") or []
                heatmap = [{"x": pt.get("x"), "y": pt.get("y"),
                            "v": pt.get("count", pt.get("value", 1))} for pt in pts]
            except HTTPException:
                heatmap = None

        return {"passport": passport, "radar": radar, "radarAvg": radar_avg,
                "stats": stats, "heatmap": heatmap}

    return cached(f"player:{player_id}:{utid}:{sid}", ttl=3600, producer=_p)


@app.get("/player/{player_id}/image")
def player_image(player_id: int):
    _throttle()
    try:
        r = creq.get(f"{IMG_API}/player/{player_id}/image",
                     headers=HEADERS, impersonate="chrome124", timeout=20)
        if r.status_code == 200:
            return Response(content=r.content,
                            media_type=r.headers.get("content-type", "image/png"),
                            headers={"Cache-Control": "public, max-age=86400"})
    except Exception:
        pass
    return Response(status_code=204)


@app.get("/search")
def search(q: str = Query(..., min_length=2)):
    def _p():
        data = sofa_get(f"/search/all?q={q}")
        out = []
        for res in data.get("results", []):
            if res.get("type") != "player":
                continue
            e = res.get("entity", {}) or {}
            pid = e.get("id")
            if not pid:
                continue
            team = e.get("team", {}) or {}
            out.append({
                "id": pid, "name": e.get("name"),
                "club": team.get("name"), "image": thumb(pid),
                "posCode": e.get("position"),
            })
        return {"results": out[:25]}
    return cached(f"search:{q.lower()}", ttl=1800, producer=_p)


if __name__ == "__main__":
    import os, uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
