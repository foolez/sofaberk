/* =============================================================
   TAKIM TUT — takım veritabanı + arma (logo) üreteci
   -------------------------------------------------------------
   Kulüplerin gerçek armaları telifli olduğu için burada her takım
   için kendi renk/desen bilgisinden STİLİZE bir arma üretiliyor.
   Renkler, desen, şehir, kuruluş yılı gerçek -> takım hemen tanınıyor,
   telif sorunu da yok.
   ============================================================= */

const TAKIMLAR = [
  /* ---------------- SÜPER LİG ---------------- */
  { id:'gs',  ad:'Galatasaray',      kisa:'GS',  sehir:'İstanbul', ulke:'Türkiye', lig:'Süper Lig', kurulus:1905, renkler:['#F5B301','#A32638'], desen:'stripes', lakap:'Cimbom',      sahil:true,  baskent:false, avrupa:true,  havuz:'tr' },
  { id:'fb',  ad:'Fenerbahçe',       kisa:'FB',  sehir:'İstanbul', ulke:'Türkiye', lig:'Süper Lig', kurulus:1907, renkler:['#FFED00','#12326E'], desen:'stripes', lakap:'Kanarya',     sahil:true,  baskent:false, avrupa:false, havuz:'tr' },
  { id:'bjk', ad:'Beşiktaş',         kisa:'BJK', sehir:'İstanbul', ulke:'Türkiye', lig:'Süper Lig', kurulus:1903, renkler:['#111111','#FFFFFF'], desen:'stripes', lakap:'Kara Kartal', sahil:true,  baskent:false, avrupa:false, havuz:'tr' },
  { id:'ts',  ad:'Trabzonspor',      kisa:'TS',  sehir:'Trabzon',  ulke:'Türkiye', lig:'Süper Lig', kurulus:1967, renkler:['#6E1B37','#2C6DB5'], desen:'stripes', lakap:'Fırtına',     sahil:true,  baskent:false, avrupa:false, havuz:'tr' },
  { id:'ibfk',ad:'Başakşehir',       kisa:'İBFK',sehir:'İstanbul', ulke:'Türkiye', lig:'Süper Lig', kurulus:1990, renkler:['#0A2A5B','#F26522'], desen:'halves',  lakap:'Turuncu-Lacivert', sahil:true, baskent:false, avrupa:false, havuz:'tr' },
  { id:'ksp', ad:'Kasımpaşa',        kisa:'KSP', sehir:'İstanbul', ulke:'Türkiye', lig:'Süper Lig', kurulus:1921, renkler:['#12326E','#FFFFFF'], desen:'stripes', lakap:'Paşa',        sahil:true,  baskent:false, avrupa:false, havuz:'tr' },
  { id:'kon', ad:'Konyaspor',        kisa:'KON', sehir:'Konya',    ulke:'Türkiye', lig:'Süper Lig', kurulus:1922, renkler:['#0B6B3A','#FFFFFF'], desen:'stripes', lakap:'Anadolu Kartalı', sahil:false, baskent:false, avrupa:false, havuz:'tr' },
  { id:'ant', ad:'Antalyaspor',      kisa:'ANT', sehir:'Antalya',  ulke:'Türkiye', lig:'Süper Lig', kurulus:1966, renkler:['#D2172A','#FFFFFF'], desen:'stripes', lakap:'Akrepler',    sahil:true,  baskent:false, avrupa:false, havuz:'tr' },
  { id:'aln', ad:'Alanyaspor',       kisa:'ALN', sehir:'Alanya',   ulke:'Türkiye', lig:'Süper Lig', kurulus:1948, renkler:['#F47B20','#0B6B3A'], desen:'halves',  lakap:'Akdeniz Fırtınası', sahil:true, baskent:false, avrupa:false, havuz:'tr' },
  { id:'rize',ad:'Çaykur Rizespor',  kisa:'RİZ', sehir:'Rize',     ulke:'Türkiye', lig:'Süper Lig', kurulus:1953, renkler:['#0B6B3A','#1B65B0'], desen:'stripes', lakap:'Yeşil-Mavi',  sahil:true,  baskent:false, avrupa:false, havuz:'tr' },
  { id:'sam', ad:'Samsunspor',       kisa:'SAM', sehir:'Samsun',   ulke:'Türkiye', lig:'Süper Lig', kurulus:1965, renkler:['#D2172A','#FFFFFF'], desen:'hoops',   lakap:'Kızıl Şimşekler', sahil:true, baskent:false, avrupa:false, havuz:'tr' },
  { id:'gfk', ad:'Gaziantep FK',     kisa:'GFK', sehir:'Gaziantep',ulke:'Türkiye', lig:'Süper Lig', kurulus:1969, renkler:['#D2172A','#111111'], desen:'stripes', lakap:'Şahinler',    sahil:false, baskent:false, avrupa:false, havuz:'tr' },
  { id:'kay', ad:'Kayserispor',      kisa:'KAY', sehir:'Kayseri',  ulke:'Türkiye', lig:'Süper Lig', kurulus:1966, renkler:['#F5B301','#A32638'], desen:'halves',  lakap:'Erciyes Kartalı', sahil:false, baskent:false, avrupa:false, havuz:'tr' },
  { id:'siv', ad:'Sivasspor',        kisa:'SİV', sehir:'Sivas',    ulke:'Türkiye', lig:'Süper Lig', kurulus:1967, renkler:['#D2172A','#FFFFFF'], desen:'hoops',   lakap:'Yiğidolar',   sahil:false, baskent:false, avrupa:false, havuz:'tr' },
  { id:'goz', ad:'Göztepe',          kisa:'GÖZ', sehir:'İzmir',    ulke:'Türkiye', lig:'Süper Lig', kurulus:1925, renkler:['#F5B301','#A32638'], desen:'halves',  lakap:'Göz Göz',     sahil:true,  baskent:false, avrupa:false, havuz:'tr' },
  { id:'eyp', ad:'Eyüpspor',         kisa:'EYP', sehir:'İstanbul', ulke:'Türkiye', lig:'Süper Lig', kurulus:1919, renkler:['#5B2A86','#F5D000'], desen:'stripes', lakap:'Mor-Sarı',    sahil:true,  baskent:false, avrupa:false, havuz:'tr' },
  { id:'bod', ad:'Bodrum FK',        kisa:'BOD', sehir:'Bodrum',   ulke:'Türkiye', lig:'Süper Lig', kurulus:1931, renkler:['#0B6B3A','#FFFFFF'], desen:'hoops',   lakap:'Yeşil-Beyaz', sahil:true,  baskent:false, avrupa:false, havuz:'tr' },
  { id:'hat', ad:'Hatayspor',        kisa:'HAT', sehir:'Hatay',    ulke:'Türkiye', lig:'Süper Lig', kurulus:1967, renkler:['#6E1B37','#FFFFFF'], desen:'stripes', lakap:'Bordo-Beyaz', sahil:true,  baskent:false, avrupa:false, havuz:'tr' },

  /* ------------- TÜRKİYE KLASİKLERİ ------------- */
  { id:'ads', ad:'Adana Demirspor',  kisa:'ADS', sehir:'Adana',    ulke:'Türkiye', lig:'Türkiye', kurulus:1940, renkler:['#12326E','#FFFFFF'], desen:'stripes', lakap:'Şimşekler',  sahil:false, baskent:false, avrupa:false, havuz:'tr2' },
  { id:'brs', ad:'Bursaspor',        kisa:'BRS', sehir:'Bursa',    ulke:'Türkiye', lig:'Türkiye', kurulus:1963, renkler:['#0B6B3A','#FFFFFF'], desen:'stripes', lakap:'Timsah',     sahil:false, baskent:false, avrupa:false, havuz:'tr2' },
  { id:'ank', ad:'MKE Ankaragücü',   kisa:'ANK', sehir:'Ankara',   ulke:'Türkiye', lig:'Türkiye', kurulus:1910, renkler:['#F5B301','#12326E'], desen:'stripes', lakap:'Başkentin Ateşi', sahil:false, baskent:true, avrupa:false, havuz:'tr2' },
  { id:'gbb', ad:'Gençlerbirliği',   kisa:'GBB', sehir:'Ankara',   ulke:'Türkiye', lig:'Türkiye', kurulus:1923, renkler:['#A32638','#111111'], desen:'stripes', lakap:'Ankara Rüzgarı', sahil:false, baskent:true, avrupa:false, havuz:'tr2' },
  { id:'koc', ad:'Kocaelispor',      kisa:'KOC', sehir:'Kocaeli',  ulke:'Türkiye', lig:'Türkiye', kurulus:1966, renkler:['#0B6B3A','#111111'], desen:'stripes', lakap:'Körfezin Fırtınası', sahil:true, baskent:false, avrupa:false, havuz:'tr2' },
  { id:'esk', ad:'Eskişehirspor',    kisa:'ESK', sehir:'Eskişehir',ulke:'Türkiye', lig:'Türkiye', kurulus:1965, renkler:['#A32638','#111111'], desen:'stripes', lakap:'Es Es',      sahil:false, baskent:false, avrupa:false, havuz:'tr2' },
  { id:'dnz', ad:'Denizlispor',      kisa:'DNZ', sehir:'Denizli',  ulke:'Türkiye', lig:'Türkiye', kurulus:1966, renkler:['#0B6B3A','#111111'], desen:'halves',  lakap:'Horoz',      sahil:false, baskent:false, avrupa:false, havuz:'tr2' },
  { id:'kgm', ad:'F. Karagümrük',    kisa:'KGM', sehir:'İstanbul', ulke:'Türkiye', lig:'Türkiye', kurulus:1926, renkler:['#A32638','#111111'], desen:'halves',  lakap:'Kırmızı-Siyah', sahil:true, baskent:false, avrupa:false, havuz:'tr2' },
  { id:'alt', ad:'Altay',            kisa:'ALT', sehir:'İzmir',    ulke:'Türkiye', lig:'Türkiye', kurulus:1914, renkler:['#111111','#FFFFFF'], desen:'stripes', lakap:'Siyah Kartallar', sahil:true, baskent:false, avrupa:false, havuz:'tr2' },
  { id:'mlt', ad:'Yeni Malatyaspor', kisa:'MLT', sehir:'Malatya',  ulke:'Türkiye', lig:'Türkiye', kurulus:1986, renkler:['#F5B301','#111111'], desen:'halves',  lakap:'Kayısılar',  sahil:false, baskent:false, avrupa:false, havuz:'tr2' },
  { id:'gir', ad:'Giresunspor',      kisa:'GİR', sehir:'Giresun',  ulke:'Türkiye', lig:'Türkiye', kurulus:1967, renkler:['#0B6B3A','#FFFFFF'], desen:'halves',  lakap:'Çotanaklar', sahil:true,  baskent:false, avrupa:false, havuz:'tr2' },
  { id:'ums', ad:'Ümraniyespor',     kisa:'ÜMS', sehir:'İstanbul', ulke:'Türkiye', lig:'Türkiye', kurulus:1938, renkler:['#A32638','#FFFFFF'], desen:'sash',    lakap:'Kırmızı-Beyaz', sahil:true, baskent:false, avrupa:false, havuz:'tr2' },
  { id:'ist', ad:'İstanbulspor',     kisa:'İST', sehir:'İstanbul', ulke:'Türkiye', lig:'Türkiye', kurulus:1926, renkler:['#F5B301','#111111'], desen:'stripes', lakap:'Sarı-Siyah', sahil:true,  baskent:false, avrupa:false, havuz:'tr2' },

  /* ---------------- PREMIER LEAGUE ---------------- */
  { id:'mci', ad:'Manchester City',  kisa:'MCI', sehir:'Manchester', ulke:'İngiltere', lig:'Premier Lig', kurulus:1880, renkler:['#6CABDD','#FFFFFF'], desen:'solid',  lakap:'Citizens', sahil:false, baskent:false, avrupa:true,  havuz:'eu' },
  { id:'mun', ad:'Manchester United',kisa:'MUN', sehir:'Manchester', ulke:'İngiltere', lig:'Premier Lig', kurulus:1878, renkler:['#DA291C','#111111'], desen:'solid',  lakap:'Kızıl Şeytanlar', sahil:false, baskent:false, avrupa:true, havuz:'eu' },
  { id:'liv', ad:'Liverpool',        kisa:'LIV', sehir:'Liverpool',  ulke:'İngiltere', lig:'Premier Lig', kurulus:1892, renkler:['#C8102E','#FFFFFF'], desen:'solid',  lakap:'Kırmızılar', sahil:true,  baskent:false, avrupa:true,  havuz:'eu' },
  { id:'ars', ad:'Arsenal',          kisa:'ARS', sehir:'Londra',     ulke:'İngiltere', lig:'Premier Lig', kurulus:1886, renkler:['#EF0107','#FFFFFF'], desen:'sash',   lakap:'Topçular', sahil:false, baskent:true,  avrupa:true,  havuz:'eu' },
  { id:'che', ad:'Chelsea',          kisa:'CHE', sehir:'Londra',     ulke:'İngiltere', lig:'Premier Lig', kurulus:1905, renkler:['#034694','#FFFFFF'], desen:'solid',  lakap:'Mavi Aslanlar', sahil:false, baskent:true, avrupa:true, havuz:'eu' },
  { id:'tot', ad:'Tottenham',        kisa:'TOT', sehir:'Londra',     ulke:'İngiltere', lig:'Premier Lig', kurulus:1882, renkler:['#FFFFFF','#132257'], desen:'halves', lakap:'Horozlar', sahil:false, baskent:true,  avrupa:true,  havuz:'eu' },
  { id:'new', ad:'Newcastle United', kisa:'NEW', sehir:'Newcastle',  ulke:'İngiltere', lig:'Premier Lig', kurulus:1892, renkler:['#111111','#FFFFFF'], desen:'stripes',lakap:'Saksağanlar', sahil:true, baskent:false, avrupa:true, havuz:'eu' },
  { id:'avl', ad:'Aston Villa',      kisa:'AVL', sehir:'Birmingham', ulke:'İngiltere', lig:'Premier Lig', kurulus:1874, renkler:['#670E36','#95BFE5'], desen:'stripes',lakap:'Villans', sahil:false, baskent:false, avrupa:true,  havuz:'eu' },
  { id:'eve', ad:'Everton',          kisa:'EVE', sehir:'Liverpool',  ulke:'İngiltere', lig:'Premier Lig', kurulus:1878, renkler:['#003399','#FFFFFF'], desen:'solid',  lakap:'Toffees', sahil:true,  baskent:false, avrupa:false, havuz:'eu' },
  { id:'whu', ad:'West Ham United',  kisa:'WHU', sehir:'Londra',     ulke:'İngiltere', lig:'Premier Lig', kurulus:1895, renkler:['#7A263A','#1BB1E7'], desen:'solid',  lakap:'Çekiççiler', sahil:false, baskent:true, avrupa:true, havuz:'eu' },

  /* ---------------- LALIGA ---------------- */
  { id:'rma', ad:'Real Madrid',      kisa:'RMA', sehir:'Madrid',    ulke:'İspanya', lig:'LaLiga', kurulus:1902, renkler:['#FFFFFF','#FEBE10'], desen:'solid',  lakap:'Kraliyet', sahil:false, baskent:true,  avrupa:true, havuz:'eu' },
  { id:'fcb', ad:'Barcelona',        kisa:'FCB', sehir:'Barcelona', ulke:'İspanya', lig:'LaLiga', kurulus:1899, renkler:['#A50044','#004D98'], desen:'stripes',lakap:'Blaugrana', sahil:true, baskent:false, avrupa:true, havuz:'eu' },
  { id:'atm', ad:'Atlético Madrid',  kisa:'ATM', sehir:'Madrid',    ulke:'İspanya', lig:'LaLiga', kurulus:1903, renkler:['#CB3524','#FFFFFF'], desen:'stripes',lakap:'Yatağancılar', sahil:false, baskent:true, avrupa:true, havuz:'eu' },
  { id:'sev', ad:'Sevilla',          kisa:'SEV', sehir:'Sevilla',   ulke:'İspanya', lig:'LaLiga', kurulus:1890, renkler:['#FFFFFF','#D0021B'], desen:'halves', lakap:'Endülüs', sahil:false, baskent:false, avrupa:true, havuz:'eu' },
  { id:'val', ad:'Valencia',         kisa:'VAL', sehir:'Valencia',  ulke:'İspanya', lig:'LaLiga', kurulus:1919, renkler:['#FFFFFF','#F18E00'], desen:'halves', lakap:'Yarasalar', sahil:true, baskent:false, avrupa:true, havuz:'eu' },
  { id:'ath', ad:'Athletic Bilbao',  kisa:'ATH', sehir:'Bilbao',    ulke:'İspanya', lig:'LaLiga', kurulus:1898, renkler:['#EE2523','#FFFFFF'], desen:'stripes',lakap:'Aslanlar', sahil:true, baskent:false, avrupa:false, havuz:'eu' },
  { id:'rso', ad:'Real Sociedad',    kisa:'RSO', sehir:'San Sebastián', ulke:'İspanya', lig:'LaLiga', kurulus:1909, renkler:['#0067B1','#FFFFFF'], desen:'stripes',lakap:'Txuri-urdin', sahil:true, baskent:false, avrupa:false, havuz:'eu' },
  { id:'vil', ad:'Villarreal',       kisa:'VIL', sehir:'Villarreal',ulke:'İspanya', lig:'LaLiga', kurulus:1923, renkler:['#FFE667','#005187'], desen:'solid',  lakap:'Sarı Denizaltı', sahil:true, baskent:false, avrupa:true, havuz:'eu' },

  /* ---------------- SERIE A ---------------- */
  { id:'juv', ad:'Juventus',         kisa:'JUV', sehir:'Torino',   ulke:'İtalya', lig:'Serie A', kurulus:1897, renkler:['#111111','#FFFFFF'], desen:'stripes',lakap:'Yaşlı Kadın', sahil:false, baskent:false, avrupa:true, havuz:'eu' },
  { id:'mil', ad:'Milan',            kisa:'MIL', sehir:'Milano',   ulke:'İtalya', lig:'Serie A', kurulus:1899, renkler:['#FB090B','#111111'], desen:'stripes',lakap:'Rossoneri', sahil:false, baskent:false, avrupa:true, havuz:'eu' },
  { id:'int', ad:'Inter',            kisa:'INT', sehir:'Milano',   ulke:'İtalya', lig:'Serie A', kurulus:1908, renkler:['#0068A8','#111111'], desen:'stripes',lakap:'Nerazzurri', sahil:false, baskent:false, avrupa:true, havuz:'eu' },
  { id:'nap', ad:'Napoli',           kisa:'NAP', sehir:'Napoli',   ulke:'İtalya', lig:'Serie A', kurulus:1926, renkler:['#12A0D7','#FFFFFF'], desen:'solid',  lakap:'Partenopei', sahil:true, baskent:false, avrupa:true, havuz:'eu' },
  { id:'rom', ad:'Roma',             kisa:'ROM', sehir:'Roma',     ulke:'İtalya', lig:'Serie A', kurulus:1927, renkler:['#8E1F2F','#F0BC42'], desen:'solid',  lakap:'Kurtlar', sahil:false, baskent:true, avrupa:true, havuz:'eu' },
  { id:'laz', ad:'Lazio',            kisa:'LAZ', sehir:'Roma',     ulke:'İtalya', lig:'Serie A', kurulus:1900, renkler:['#87D8F7','#FFFFFF'], desen:'solid',  lakap:'Kartallar', sahil:false, baskent:true, avrupa:true, havuz:'eu' },
  { id:'ata', ad:'Atalanta',         kisa:'ATA', sehir:'Bergamo',  ulke:'İtalya', lig:'Serie A', kurulus:1907, renkler:['#1D2D5C','#111111'], desen:'stripes',lakap:'La Dea', sahil:false, baskent:false, avrupa:true, havuz:'eu' },
  { id:'fio', ad:'Fiorentina',       kisa:'FIO', sehir:'Floransa', ulke:'İtalya', lig:'Serie A', kurulus:1926, renkler:['#59308F','#FFFFFF'], desen:'solid',  lakap:'Viola', sahil:false, baskent:false, avrupa:true, havuz:'eu' },

  /* ---------------- BUNDESLIGA ---------------- */
  { id:'bay', ad:'Bayern München',   kisa:'FCB', sehir:'Münih',     ulke:'Almanya', lig:'Bundesliga', kurulus:1900, renkler:['#DC052D','#FFFFFF'], desen:'solid',  lakap:'Bavyera Devi', sahil:false, baskent:false, avrupa:true, havuz:'eu' },
  { id:'bvb', ad:'Borussia Dortmund',kisa:'BVB', sehir:'Dortmund',  ulke:'Almanya', lig:'Bundesliga', kurulus:1909, renkler:['#FDE100','#111111'], desen:'solid',  lakap:'Arılar', sahil:false, baskent:false, avrupa:true, havuz:'eu' },
  { id:'rbl', ad:'RB Leipzig',       kisa:'RBL', sehir:'Leipzig',   ulke:'Almanya', lig:'Bundesliga', kurulus:2009, renkler:['#DD0741','#FFFFFF'], desen:'solid',  lakap:'Boğalar', sahil:false, baskent:false, avrupa:false, havuz:'eu' },
  { id:'lev', ad:'Bayer Leverkusen', kisa:'B04', sehir:'Leverkusen',ulke:'Almanya', lig:'Bundesliga', kurulus:1904, renkler:['#E32219','#111111'], desen:'halves', lakap:'Aspirinciler', sahil:false, baskent:false, avrupa:true, havuz:'eu' },
  { id:'s04', ad:'Schalke 04',       kisa:'S04', sehir:'Gelsenkirchen', ulke:'Almanya', lig:'Bundesliga', kurulus:1904, renkler:['#004D9D','#FFFFFF'], desen:'solid', lakap:'Madenciler', sahil:false, baskent:false, avrupa:true, havuz:'eu' },
  { id:'sge', ad:'Eintracht Frankfurt', kisa:'SGE', sehir:'Frankfurt', ulke:'Almanya', lig:'Bundesliga', kurulus:1899, renkler:['#111111','#E1000F'], desen:'stripes',lakap:'Kartallar', sahil:false, baskent:false, avrupa:true, havuz:'eu' },

  /* ---------------- LIGUE 1 & DİĞER ---------------- */
  { id:'psg', ad:'Paris Saint-Germain', kisa:'PSG', sehir:'Paris',  ulke:'Fransa', lig:'Ligue 1', kurulus:1970, renkler:['#004170','#DA291C'], desen:'sash',   lakap:'Parisliler', sahil:false, baskent:true, avrupa:true, havuz:'eu' },
  { id:'om',  ad:'Marseille',        kisa:'OM',  sehir:'Marsilya', ulke:'Fransa', lig:'Ligue 1', kurulus:1899, renkler:['#FFFFFF','#2FAEE0'], desen:'solid',  lakap:'Phocéens', sahil:true,  baskent:false, avrupa:true, havuz:'eu' },
  { id:'ol',  ad:'Lyon',             kisa:'OL',  sehir:'Lyon',     ulke:'Fransa', lig:'Ligue 1', kurulus:1950, renkler:['#FFFFFF','#122E62'], desen:'halves', lakap:'Les Gones', sahil:false, baskent:false, avrupa:false, havuz:'eu' },
  { id:'asm', ad:'Monaco',           kisa:'ASM', sehir:'Monako',   ulke:'Monako', lig:'Ligue 1', kurulus:1924, renkler:['#E63329','#FFFFFF'], desen:'halves', lakap:'Kırmızı-Beyazlar', sahil:true, baskent:true, avrupa:false, havuz:'eu' },
  { id:'aja', ad:'Ajax',             kisa:'AJA', sehir:'Amsterdam',ulke:'Hollanda', lig:'Eredivisie', kurulus:1900, renkler:['#FFFFFF','#D2122E'], desen:'sash', lakap:'Amsterdam', sahil:false, baskent:true, avrupa:true, havuz:'eu' },
  { id:'psv', ad:'PSV Eindhoven',    kisa:'PSV', sehir:'Eindhoven',ulke:'Hollanda', lig:'Eredivisie', kurulus:1913, renkler:['#ED1C24','#FFFFFF'], desen:'stripes', lakap:'Boertjes', sahil:false, baskent:false, avrupa:true, havuz:'eu' },
  { id:'fey', ad:'Feyenoord',        kisa:'FEY', sehir:'Rotterdam',ulke:'Hollanda', lig:'Eredivisie', kurulus:1908, renkler:['#CE1317','#FFFFFF'], desen:'halves', lakap:'Rotterdam', sahil:true, baskent:false, avrupa:true, havuz:'eu' },
  { id:'por', ad:'Porto',            kisa:'FCP', sehir:'Porto',    ulke:'Portekiz', lig:'Primeira Liga', kurulus:1893, renkler:['#003DA5','#FFFFFF'], desen:'stripes', lakap:'Ejderhalar', sahil:true, baskent:false, avrupa:true, havuz:'eu' },
  { id:'ben', ad:'Benfica',          kisa:'SLB', sehir:'Lizbon',   ulke:'Portekiz', lig:'Primeira Liga', kurulus:1904, renkler:['#E30613','#FFFFFF'], desen:'solid', lakap:'Kartallar', sahil:true, baskent:true, avrupa:true, havuz:'eu' },
  { id:'spo', ad:'Sporting CP',      kisa:'SCP', sehir:'Lizbon',   ulke:'Portekiz', lig:'Primeira Liga', kurulus:1906, renkler:['#008057','#FFFFFF'], desen:'hoops', lakap:'Aslanlar', sahil:true, baskent:true, avrupa:true, havuz:'eu' },
  { id:'cel', ad:'Celtic',           kisa:'CEL', sehir:'Glasgow',  ulke:'İskoçya', lig:'İskoçya Ligi', kurulus:1887, renkler:['#018749','#FFFFFF'], desen:'hoops', lakap:'Bhoys', sahil:false, baskent:false, avrupa:true, havuz:'eu' },
  { id:'ran', ad:'Rangers',          kisa:'RAN', sehir:'Glasgow',  ulke:'İskoçya', lig:'İskoçya Ligi', kurulus:1872, renkler:['#1B458F','#FFFFFF'], desen:'solid', lakap:'Gers', sahil:false, baskent:false, avrupa:false, havuz:'eu' },
];

const HAVUZLAR = {
  'super-lig': { ad:'Süper Lig',        aciklama:'18 takım — klasik akşam maçı',      filtre: t => t.havuz==='tr' },
  'turkiye':   { ad:'Türkiye (Geniş)',  aciklama:'Süper Lig + eski efsaneler (30)',   filtre: t => t.havuz==='tr' || t.havuz==='tr2' },
  'avrupa':    { ad:'Avrupa Devleri',   aciklama:'Avrupa’nın 45 büyük kulübü',        filtre: t => t.havuz==='eu' },
  'hepsi':     { ad:'Hepsi Karışık',    aciklama:'Tüm takımlar — zor mod',            filtre: () => true },
};

/* -------------------- ARMA (LOGO) ÜRETECİ -------------------- */

function _parlaklik(hex){
  const h = hex.replace('#','');
  const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
  return (0.299*r + 0.587*g + 0.114*b) / 255;
}
function kontrastRenk(hex){ return _parlaklik(hex) > 0.6 ? '#101318' : '#FFFFFF'; }

/* Desen dolgusu: kalkanın içini takımın desenine göre boyar */
function _desenIcerik(t, uid){
  const [a, b] = t.renkler;
  switch(t.desen){
    case 'stripes': { // dikey çubuklar
      let s = `<rect x="0" y="0" width="200" height="240" fill="${a}"/>`;
      for(let i=0;i<5;i++) s += `<rect x="${20+i*40}" y="0" width="20" height="240" fill="${b}"/>`;
      return s;
    }
    case 'hoops': { // yatay bantlar
      let s = `<rect x="0" y="0" width="200" height="240" fill="${a}"/>`;
      for(let i=0;i<5;i++) s += `<rect x="0" y="${24+i*48}" width="200" height="24" fill="${b}"/>`;
      return s;
    }
    case 'halves':
      return `<rect x="0" y="0" width="100" height="240" fill="${a}"/><rect x="100" y="0" width="100" height="240" fill="${b}"/>`;
    case 'sash':
      return `<rect x="0" y="0" width="200" height="240" fill="${a}"/>`+
             `<path d="M -20 200 L 150 -20 L 220 30 L 50 250 Z" fill="${b}"/>`;
    default:
      return `<rect x="0" y="0" width="200" height="240" fill="${a}"/>`;
  }
}

/* Takımın stilize armasını SVG string olarak döner */
function armaSVG(t, opt={}){
  const uid = 'c'+t.id+'_'+Math.random().toString(36).slice(2,7);
  const cerceve = _parlaklik(t.renkler[0]) > 0.75 ? '#101318' : '#F7F7F7';
  const yaziRengi = kontrastRenk(t.renkler[0]);
  const seritZemin = t.renkler[1];
  const seritYazi = kontrastRenk(t.renkler[1]);
  const kalkan = 'M100 4 L192 40 C192 150 160 210 100 236 C40 210 8 150 8 40 Z';
  return `
<svg viewBox="0 0 200 260" class="arma" role="img" aria-label="${t.ad} arması" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="${uid}"><path d="${kalkan}"/></clipPath>
    <linearGradient id="${uid}g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".28"/>
      <stop offset=".55" stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="1" stop-color="#000000" stop-opacity=".28"/>
    </linearGradient>
  </defs>
  <path d="${kalkan}" fill="${cerceve}" transform="translate(0,0)"/>
  <g clip-path="url(#${uid})">
    ${_desenIcerik(t, uid)}
    <rect x="0" y="96" width="200" height="52" fill="${seritZemin}" opacity=".95"/>
    <text x="100" y="133" text-anchor="middle" font-size="40" font-weight="900"
          font-family="Impact, 'Arial Black', system-ui, sans-serif" fill="${seritYazi}"
          letter-spacing="1">${t.kisa}</text>
    <rect x="60" y="154" width="80" height="30" rx="15" fill="#000" opacity=".38"/>
    <text x="100" y="176" text-anchor="middle" font-size="22" font-weight="800"
          font-family="system-ui, sans-serif" fill="#FFFFFF" opacity=".95">${t.kurulus}</text>
    <rect x="0" y="0" width="200" height="240" fill="url(#${uid}g)"/>
  </g>
  <path d="${kalkan}" fill="none" stroke="${cerceve}" stroke-width="7"/>
  <path d="${kalkan}" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="2"/>
</svg>`;
}

function takimlariGetir(havuzKey){
  const h = HAVUZLAR[havuzKey] || HAVUZLAR['super-lig'];
  return TAKIMLAR.filter(h.filtre);
}
