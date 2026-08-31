#!/usr/bin/env python3
"""tools/takimlar.py -> assets/js/teams.js icindeki _SATIRLAR blogunu yeniden yazar."""
import pathlib, re, sys

kok = pathlib.Path(__file__).resolve().parent.parent
ns = {}
exec(compile((kok / 'tools' / 'takimlar.py').read_text(encoding='utf-8'), 'takimlar.py', 'exec'), ns)
R = ns['TAKIMLAR']

ids = [r[0] for r in R]
cakisan = sorted({i for i in ids if ids.count(i) > 1})
if cakisan:
    sys.exit('Cakisan id: ' + ', '.join(cakisan))
for r in R:
    if len(r) != 11 or not isinstance(r[5], int):
        sys.exit('Bozuk satir: %r' % (r,))
    if r[8] not in ('stripes', 'hoops', 'halves', 'sash', 'solid'):
        sys.exit('Bilinmeyen desen: %r' % (r,))

govde = '\n'.join(
    "  ['%s','%s','%s','%s','%s',%d,'%s','%s','%s','%s','%s']," % r for r in R)

p = kok / 'assets' / 'js' / 'teams.js'
s = p.read_text(encoding='utf-8')
yeni = re.sub(r'(const _SATIRLAR = \[\n).*?(\n\];)', lambda m: m.group(1) + govde + m.group(2), s, flags=re.S)
p.write_text(yeni, encoding='utf-8')
print('teams.js guncellendi: %d takim' % len(R))
