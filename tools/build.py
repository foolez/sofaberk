#!/usr/bin/env python3
"""index.html + css + js -> tek dosya çıktısı.

  python3 tools/build.py            -> takim-tut.html (tek tıkla açılan tam dosya)
  python3 tools/build.py --artifact -> stdout'a gövde (Artifact yayını için, <html>/<head> yok)
"""
import re, sys, pathlib

kok = pathlib.Path(__file__).resolve().parent.parent
oku = lambda p: (kok / p).read_text(encoding='utf-8')

html = oku('index.html')
css  = oku('assets/css/style.css')
js   = "\n".join(oku(f) for f in ('assets/js/teams.js','assets/js/game.js','assets/js/online.js','assets/js/logo.js'))

govde = re.search(r'<body>(.*)</body>', html, re.S).group(1)
govde = re.sub(r'\s*<script src="assets/js/[^"]+"></script>', '', govde)
fontlar = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
           '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
           'family=Archivo+Black&family=Manrope:wght@500;700;800&display=swap">')
ic = (f'<title>Takım Tut</title>\n{fontlar}\n<style>\n{css}\n</style>\n'
      f'{govde}\n<script>\n{js}\n</script>\n')

if '--artifact' in sys.argv:
    sys.stdout.write(ic)
else:
    tam = ('<!doctype html>\n<html lang="tr">\n<head>\n<meta charset="utf-8">\n'
           '<meta name="viewport" content="width=device-width, initial-scale=1, '
           'maximum-scale=1, user-scalable=no, viewport-fit=cover">\n'
           '<meta name="theme-color" content="#0a0d13">\n'
           '<link rel="icon" href="data:image/svg+xml,'
           "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>"
           "<text y='.9em' font-size='90'>⚽</text></svg>\">\n"
           + ic.replace('<title>', '<title>', 1) + '</head>\n<body>\n</body>\n</html>\n')
    # başlık/stil head'e, gövde body'ye
    bas, _, kalan = tam.partition('</head>')
    ust, _, alt = ic.partition('</style>')
    tam = ('<!doctype html>\n<html lang="tr">\n<head>\n<meta charset="utf-8">\n'
           '<meta name="viewport" content="width=device-width, initial-scale=1, '
           'maximum-scale=1, user-scalable=no, viewport-fit=cover">\n'
           '<meta name="theme-color" content="#0a0d13">\n'
           '<link rel="icon" href="data:image/svg+xml,'
           "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>"
           "<text y='.9em' font-size='90'>⚽</text></svg>\">\n"
           + ust + '</style>\n</head>\n<body>\n' + alt + '</body>\n</html>\n')
    (kok / 'takim-tut.html').write_text(tam, encoding='utf-8')
    print('takim-tut.html yazıldı (%.0f KB)' % ((kok/'takim-tut.html').stat().st_size/1024))
