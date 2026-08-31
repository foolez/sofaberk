@echo off
REM ============================================================
REM  TAKIM TUT - Windows tek tik baslatici
REM  Cift tikla: sunucuyu kurar, calistirir ve bedava link acar.
REM ============================================================
cd /d "%~dp0"
title Takim Tut - baslatici

echo.
echo  ================================================
echo    TAKIM TUT - online oda sunucusu
echo  ================================================
echo.

REM ---------- 1) Python ----------
set "PY="
where python >nul 2>&1 && set "PY=python"
if not defined PY where py >nul 2>&1 && set "PY=py"

if not defined PY (
  echo  [!] Python bulunamadi. Simdi kurmayi deneyecegim...
  echo.
  winget install -e --id Python.Python.3.12 --accept-source-agreements --accept-package-agreements
  echo.
  echo  [!] Kurulum bitti. Bu pencereyi KAPAT, baslat.bat dosyasina TEKRAR cift tikla.
  echo      ^(Olmadiysa python.org/downloads - kurarken "Add python.exe to PATH" isaretli olsun^)
  echo.
  pause
  exit /b
)
echo  [1/4] Python bulundu: %PY%

REM ---------- 2) Paketler ----------
echo  [2/4] Sunucu paketleri kuruluyor ^(ilk seferde 1-2 dakika^)...
%PY% -m pip install --quiet --disable-pip-version-check -r "%~dp0online-server\requirements.txt"
if errorlevel 1 (
  echo  [!] Paketler kurulamadi. Internet baglantini kontrol edip tekrar dene.
  pause
  exit /b
)

REM ---------- 3) cloudflared ----------
if not exist "%~dp0cloudflared.exe" (
  echo  [3/4] Bedava link araci indiriliyor...
  curl -L -o "%~dp0cloudflared.exe" https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe
  if errorlevel 1 (
    echo  [!] Indirilemedi. Su adresten indirip bu klasore cloudflared.exe adiyla koy:
    echo      https://github.com/cloudflare/cloudflared/releases/latest
    pause
    exit /b
  )
) else (
  echo  [3/4] Link araci hazir.
)

REM ---------- 4) Sunucu + tunel ----------
echo  [4/4] Sunucu baslatiliyor...
cd /d "%~dp0online-server"
start "Takim Tut sunucu - KAPATMA" cmd /k %PY% -m uvicorn main:app --port 8000
cd /d "%~dp0"

echo.
echo  ------------------------------------------------------------
echo   Birazdan asagida  https://....trycloudflare.com  diye
echo   bir adres cikacak. O ADRESI ARKADASINA GONDER.
echo.
echo   Ikiniz de acin:
echo     Sen : Online -^> ODA KUR   ^(4 haneli kod cikar^)
echo     O   : Online -^> kodu yaz -^> KATIL
echo.
echo   Bu iki pencereyi kapatirsan link kapanir.
echo  ------------------------------------------------------------
echo.
timeout /t 3 >nul
"%~dp0cloudflared.exe" tunnel --url http://localhost:8000

pause
