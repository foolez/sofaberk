@echo off
REM ============================================================
REM  TAKIM TUT - Windows tek tik baslatici
REM  Sunucuyu kurar, calistirir ve bedava bir internet linki acar.
REM ============================================================
setlocal enabledelayedexpansion
cd /d "%~dp0"
title Takim Tut - baslatici

echo.
echo  ================================================
echo    TAKIM TUT - online oda sunucusu
echo  ================================================
echo.

REM ---------- 1) Python var mi? ----------
set PY=
python --version >nul 2>&1 && set PY=python
if not defined PY ( py --version >nul 2>&1 && set PY=py )

if not defined PY (
  echo  [!] Python bulunamadi. Simdi kurmayi deneyecegim...
  echo.
  winget install -e --id Python.Python.3.12 --accept-source-agreements --accept-package-agreements
  echo.
  echo  [!] Python kuruldu. Bu pencereyi KAPAT, baslat.bat dosyasina TEKRAR cift tikla.
  echo      ^(Kurulum calismadiysa: python.org/downloads - kurarken
  echo       "Add python.exe to PATH" kutusunu isaretle^)
  echo.
  pause
  exit /b
)
echo  [1/4] Python bulundu: %PY%

REM ---------- 2) Gerekli paketler ----------
echo  [2/4] Sunucu paketleri kuruluyor ^(ilk seferde 1-2 dakika^)...
%PY% -m pip install --quiet --disable-pip-version-check -r online-server\requirements.txt
if errorlevel 1 (
  echo  [!] Paketler kurulamadi. Internet baglantini kontrol et.
  pause
  exit /b
)

REM ---------- 3) cloudflared ----------
if not exist cloudflared.exe (
  echo  [3/4] Bedava link araci indiriliyor...
  curl -L -o cloudflared.exe https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe
  if errorlevel 1 (
    echo  [!] Indirilemedi. Tarayicidan indirip bu klasore cloudflared.exe olarak koy:
    echo      https://github.com/cloudflare/cloudflared/releases/latest
    pause
    exit /b
  )
) else (
  echo  [3/4] Link araci zaten var.
)

REM ---------- 4) Sunucu + tunel ----------
echo  [4/4] Sunucu baslatiliyor...
start "Takim Tut sunucu (kapatma)" cmd /k "cd /d "%~dp0online-server" && %PY% -m uvicorn main:app --port 8000"

echo.
echo  Sunucu acildi. Simdi internet linki olusturuluyor...
echo  ------------------------------------------------------------
echo   ASAGIDA cikacak https://....trycloudflare.com adresini
echo   ARKADASINA GONDER. Ikiniz de acin:
echo     - Sen  : Online -^> ODA KUR  ^(4 haneli kod cikar^)
echo     - O    : Online -^> kodu yaz -^> KATIL
echo.
echo   Bu pencereyi kapatirsan link kapanir.
echo  ------------------------------------------------------------
echo.
timeout /t 3 >nul
cloudflared.exe tunnel --url http://localhost:8000

pause
