/* =============================================================
   TAKIM TUT — takım veritabanı + arma (logo) üreteci
   -------------------------------------------------------------
   Kulüplerin gerçek armaları telifli olduğu için her takım için
   kendi renk / desen / kuruluş verisinden STİLİZE bir arma
   üretilir. Takım ilk bakışta tanınır, telif sorunu olmaz.

   Satır düzeni:
   [id, ad, kısa, şehir, lig, kuruluş, renk1, renk2, desen, grup, bayrak]
     desen  : stripes | hoops | halves | sash | solid
     grup   : sl=Süper Lig  1l=TFF 1. Lig  tr=Türkiye klasikleri
              pl ll sa bl l1 = Avrupa'nın 5 büyük ligi
              ed=Eredivisie  pt=Primeira  dg=diğer Avrupa  dn=dünya
     bayrak : s=deniz kenarı şehir  b=başkent  a=Avrupa kupası var
   ============================================================= */

const _SATIRLAR = [
  ['gs','Galatasaray','GS','İstanbul','Süper Lig',1905,'F5B301','A32638','stripes','sl','sa'],
  ['fb','Fenerbahçe','FB','İstanbul','Süper Lig',1907,'FFED00','12326E','stripes','sl','s'],
  ['bjk','Beşiktaş','BJK','İstanbul','Süper Lig',1903,'111111','FFFFFF','stripes','sl','s'],
  ['ts','Trabzonspor','TS','Trabzon','Süper Lig',1967,'6E1B37','2C6DB5','stripes','sl','s'],
  ['ibfk','Başakşehir','İBFK','İstanbul','Süper Lig',1990,'0A2A5B','F26522','halves','sl','s'],
  ['sam','Samsunspor','SAM','Samsun','Süper Lig',1965,'D2172A','FFFFFF','hoops','sl','s'],
  ['goz','Göztepe','GÖZ','İzmir','Süper Lig',1925,'F5B301','A32638','halves','sl','s'],
  ['kon','Konyaspor','KON','Konya','Süper Lig',1922,'0B6B3A','FFFFFF','stripes','sl',''],
  ['kay','Kayserispor','KAY','Kayseri','Süper Lig',1966,'F5B301','A32638','halves','sl',''],
  ['ant','Antalyaspor','ANT','Antalya','Süper Lig',1966,'D2172A','FFFFFF','stripes','sl','s'],
  ['aln','Alanyaspor','ALN','Alanya','Süper Lig',1948,'F47B20','0B6B3A','halves','sl','s'],
  ['rize','Çaykur Rizespor','RİZ','Rize','Süper Lig',1953,'0B6B3A','1B65B0','stripes','sl','s'],
  ['ksp','Kasımpaşa','KSP','İstanbul','Süper Lig',1921,'12326E','FFFFFF','stripes','sl','s'],
  ['gfk','Gaziantep FK','GFK','Gaziantep','Süper Lig',1969,'D2172A','111111','stripes','sl',''],
  ['eyp','Eyüpspor','EYP','İstanbul','Süper Lig',1919,'5B2A86','F5D000','stripes','sl','s'],
  ['koc','Kocaelispor','KOC','Kocaeli','Süper Lig',1966,'0B6B3A','111111','stripes','sl','s'],
  ['gbb','Gençlerbirliği','GBB','Ankara','Süper Lig',1923,'A32638','111111','stripes','sl','b'],
  ['kgm','F. Karagümrük','KGM','İstanbul','Süper Lig',1926,'A32638','111111','halves','sl','s'],
  ['bod','Bodrum FK','BOD','Bodrum','1. Lig',1931,'0B6B3A','FFFFFF','hoops','1l','s'],
  ['hat','Hatayspor','HAT','Hatay','1. Lig',1967,'6E1B37','FFFFFF','stripes','1l','s'],
  ['siv','Sivasspor','SİV','Sivas','1. Lig',1967,'D2172A','FFFFFF','hoops','1l',''],
  ['ads','Adana Demirspor','ADS','Adana','1. Lig',1940,'12326E','FFFFFF','stripes','1l',''],
  ['erz','Erzurumspor FK','ERZ','Erzurum','1. Lig',1967,'0B6B3A','FFFFFF','halves','1l',''],
  ['sak','Sakaryaspor','SAK','Sakarya','1. Lig',1965,'0B6B3A','111111','stripes','1l',''],
  ['man','Manisa FK','MAN','Manisa','1. Lig',2016,'D2172A','FFFFFF','halves','1l',''],
  ['bol','Boluspor','BOL','Bolu','1. Lig',1965,'A32638','FFFFFF','stripes','1l',''],
  ['ban','Bandırmaspor','BAN','Bandırma','1. Lig',1965,'0B6B3A','A32638','stripes','1l','s'],
  ['ums','Ümraniyespor','ÜMS','İstanbul','1. Lig',1938,'A32638','FFFFFF','sash','1l','s'],
  ['ist','İstanbulspor','İST','İstanbul','1. Lig',1926,'F5B301','111111','stripes','1l','s'],
  ['pen','Pendikspor','PEN','İstanbul','1. Lig',1950,'12326E','FFFFFF','stripes','1l','s'],
  ['kec','Keçiörengücü','KEÇ','Ankara','1. Lig',1945,'12326E','A32638','halves','1l','b'],
  ['amd','Amedspor','AMD','Diyarbakır','1. Lig',1990,'0B6B3A','A32638','halves','1l',''],
  ['urf','Şanlıurfaspor','URF','Şanlıurfa','1. Lig',1969,'F5B301','0B6B3A','stripes','1l',''],
  ['cor','Çorum FK','ÇOR','Çorum','1. Lig',1967,'A32638','111111','stripes','1l',''],
  ['sar','Sarıyer','SAR','İstanbul','1. Lig',1940,'12326E','A32638','stripes','1l','s'],
  ['van','Vanspor FK','VAN','Van','1. Lig',1976,'A32638','FFFFFF','halves','1l',''],
  ['brs','Bursaspor','BRS','Bursa','Türkiye',1963,'0B6B3A','FFFFFF','stripes','tr',''],
  ['ank','MKE Ankaragücü','ANK','Ankara','Türkiye',1910,'F5B301','12326E','stripes','tr','b'],
  ['esk','Eskişehirspor','ESK','Eskişehir','Türkiye',1965,'A32638','111111','stripes','tr',''],
  ['dnz','Denizlispor','DNZ','Denizli','Türkiye',1966,'0B6B3A','111111','halves','tr',''],
  ['alt','Altay','ALT','İzmir','Türkiye',1914,'111111','FFFFFF','stripes','tr','s'],
  ['ksy','Karşıyaka','KŞY','İzmir','Türkiye',1912,'0B6B3A','A32638','stripes','tr','s'],
  ['gir','Giresunspor','GİR','Giresun','Türkiye',1967,'0B6B3A','FFFFFF','halves','tr','s'],
  ['mlt','Malatyaspor','MLT','Malatya','Türkiye',1986,'F5B301','111111','halves','tr',''],
  ['miy','Mersin İdmanyurdu','MİY','Mersin','Türkiye',1925,'A32638','12326E','stripes','tr','s'],
  ['zon','Zonguldakspor','ZON','Zonguldak','Türkiye',1966,'12326E','A32638','halves','tr','s'],
  ['ada','Adanaspor','ADA','Adana','Türkiye',1954,'F47B20','FFFFFF','halves','tr',''],
  ['ord','Orduspor','ORD','Ordu','Türkiye',1967,'A32638','111111','stripes','tr','s'],
  ['akh','Akhisarspor','AKH','Akhisar','Türkiye',1970,'0B6B3A','FFFFFF','stripes','tr',''],
  ['vef','Vefa','VEF','İstanbul','Türkiye',1908,'0B6B3A','111111','halves','tr','s'],
  ['ars','Arsenal','ARS','Londra','Premier Lig',1886,'EF0107','FFFFFF','sash','pl','ba'],
  ['avl','Aston Villa','AVL','Birmingham','Premier Lig',1874,'670E36','95BFE5','stripes','pl','a'],
  ['bou','Bournemouth','BOU','Bournemouth','Premier Lig',1899,'DA291C','111111','stripes','pl','s'],
  ['bre','Brentford','BRE','Londra','Premier Lig',1889,'E30613','FFFFFF','stripes','pl','b'],
  ['bha','Brighton','BHA','Brighton','Premier Lig',1901,'0057B8','FFFFFF','stripes','pl','s'],
  ['bur','Burnley','BUR','Burnley','Premier Lig',1882,'6C1D45','87CEEB','solid','pl',''],
  ['che','Chelsea','CHE','Londra','Premier Lig',1905,'034694','FFFFFF','solid','pl','ba'],
  ['cry','Crystal Palace','CRY','Londra','Premier Lig',1905,'1B458F','C4122E','stripes','pl','b'],
  ['eve','Everton','EVE','Liverpool','Premier Lig',1878,'003399','FFFFFF','solid','pl','s'],
  ['ful','Fulham','FUL','Londra','Premier Lig',1879,'FFFFFF','111111','halves','pl','b'],
  ['lee','Leeds United','LEE','Leeds','Premier Lig',1919,'FFFFFF','1D428A','solid','pl',''],
  ['liv','Liverpool','LIV','Liverpool','Premier Lig',1892,'C8102E','FFFFFF','solid','pl','sa'],
  ['mci','Manchester City','MCI','Manchester','Premier Lig',1880,'6CABDD','FFFFFF','solid','pl','a'],
  ['mun','Manchester United','MUN','Manchester','Premier Lig',1878,'DA291C','111111','solid','pl','a'],
  ['new','Newcastle United','NEW','Newcastle','Premier Lig',1892,'111111','FFFFFF','stripes','pl','sa'],
  ['nfo','Nottingham Forest','NFO','Nottingham','Premier Lig',1865,'DD0000','FFFFFF','solid','pl','a'],
  ['sun','Sunderland','SUN','Sunderland','Premier Lig',1879,'EB172B','FFFFFF','stripes','pl','s'],
  ['tot','Tottenham','TOT','Londra','Premier Lig',1882,'FFFFFF','132257','halves','pl','ba'],
  ['whu','West Ham United','WHU','Londra','Premier Lig',1895,'7A263A','1BB1E7','solid','pl','ba'],
  ['wol','Wolverhampton','WOL','Wolverhampton','Premier Lig',1877,'FDB913','111111','solid','pl',''],
  ['ala','Deportivo Alavés','ALA','Vitoria','LaLiga',1921,'0761AF','FFFFFF','stripes','ll',''],
  ['ath','Athletic Bilbao','ATH','Bilbao','LaLiga',1898,'EE2523','FFFFFF','stripes','ll','s'],
  ['atm','Atlético Madrid','ATM','Madrid','LaLiga',1903,'CB3524','FFFFFF','stripes','ll','ba'],
  ['fcb','Barcelona','FCB','Barcelona','LaLiga',1899,'A50044','004D98','stripes','ll','sa'],
  ['bet','Real Betis','BET','Sevilla','LaLiga',1907,'00954C','FFFFFF','stripes','ll',''],
  ['cta','Celta Vigo','CEL','Vigo','LaLiga',1923,'8AC3EE','FFFFFF','solid','ll','s'],
  ['elc','Elche','ELC','Elche','LaLiga',1923,'00873E','FFFFFF','halves','ll','s'],
  ['esp','Espanyol','ESP','Barcelona','LaLiga',1900,'0067B1','FFFFFF','stripes','ll','s'],
  ['get','Getafe','GET','Getafe','LaLiga',1983,'004FA3','FFFFFF','solid','ll',''],
  ['gro','Girona','GIR','Girona','LaLiga',1930,'D81E05','FFFFFF','stripes','ll',''],
  ['lev','Levante','LEV','Valencia','LaLiga',1909,'004B9F','A50044','halves','ll','s'],
  ['mll','Mallorca','MLL','Palma','LaLiga',1916,'C4122E','111111','solid','ll','s'],
  ['osa','Osasuna','OSA','Pamplona','LaLiga',1920,'D91A21','00184E','solid','ll',''],
  ['ovi','Real Oviedo','OVI','Oviedo','LaLiga',1926,'0B4EA2','FFFFFF','solid','ll',''],
  ['ray','Rayo Vallecano','RAY','Madrid','LaLiga',1924,'FFFFFF','E53027','sash','ll','b'],
  ['rma','Real Madrid','RMA','Madrid','LaLiga',1902,'FFFFFF','FEBE10','solid','ll','ba'],
  ['rso','Real Sociedad','RSO','San Sebastián','LaLiga',1909,'0067B1','FFFFFF','stripes','ll','s'],
  ['sev','Sevilla','SEV','Sevilla','LaLiga',1890,'FFFFFF','D0021B','halves','ll','a'],
  ['val','Valencia','VAL','Valencia','LaLiga',1919,'FFFFFF','F18E00','halves','ll','sa'],
  ['vil','Villarreal','VIL','Villarreal','LaLiga',1923,'FFE667','005187','solid','ll','sa'],
  ['ata','Atalanta','ATA','Bergamo','Serie A',1907,'1D2D5C','111111','stripes','sa','a'],
  ['blg','Bologna','BOL','Bologna','Serie A',1909,'A21C24','12326E','halves','sa',''],
  ['cag','Cagliari','CAG','Cagliari','Serie A',1920,'A5122B','12326E','halves','sa','s'],
  ['com','Como','COM','Como','Serie A',1907,'12326E','FFFFFF','solid','sa',''],
  ['crm','Cremonese','CRE','Cremona','Serie A',1903,'A21C24','111111','halves','sa',''],
  ['fio','Fiorentina','FIO','Floransa','Serie A',1926,'59308F','FFFFFF','solid','sa','a'],
  ['gen','Genoa','GEN','Cenova','Serie A',1893,'A21C24','12326E','halves','sa','s'],
  ['hel','Hellas Verona','VER','Verona','Serie A',1903,'F5B301','12326E','halves','sa',''],
  ['int','Inter','INT','Milano','Serie A',1908,'0068A8','111111','stripes','sa','a'],
  ['juv','Juventus','JUV','Torino','Serie A',1897,'111111','FFFFFF','stripes','sa','a'],
  ['laz','Lazio','LAZ','Roma','Serie A',1900,'87D8F7','FFFFFF','solid','sa','ba'],
  ['lce','Lecce','LEC','Lecce','Serie A',1908,'F5B301','A21C24','halves','sa','s'],
  ['mil','Milan','MIL','Milano','Serie A',1899,'FB090B','111111','stripes','sa','a'],
  ['nap','Napoli','NAP','Napoli','Serie A',1926,'12A0D7','FFFFFF','solid','sa','sa'],
  ['par','Parma','PAR','Parma','Serie A',1913,'F5D000','12326E','hoops','sa','a'],
  ['pis','Pisa','PIS','Pisa','Serie A',1909,'12326E','FFFFFF','solid','sa','s'],
  ['rom','Roma','ROM','Roma','Serie A',1927,'8E1F2F','F0BC42','solid','sa','ba'],
  ['sas','Sassuolo','SAS','Sassuolo','Serie A',1920,'00A752','111111','stripes','sa',''],
  ['tno','Torino','TOR','Torino','Serie A',1906,'7C2529','FFFFFF','solid','sa',''],
  ['udi','Udinese','UDI','Udine','Serie A',1896,'111111','FFFFFF','stripes','sa',''],
  ['aug','Augsburg','FCA','Augsburg','Bundesliga',1907,'BA3733','00875B','stripes','bl',''],
  ['bay','Bayern München','FCB','Münih','Bundesliga',1900,'DC052D','FFFFFF','solid','bl','a'],
  ['b04','Bayer Leverkusen','B04','Leverkusen','Bundesliga',1904,'E32219','111111','halves','bl','a'],
  ['bvb','Borussia Dortmund','BVB','Dortmund','Bundesliga',1909,'FDE100','111111','solid','bl','a'],
  ['sge','Eintracht Frankfurt','SGE','Frankfurt','Bundesliga',1899,'111111','E1000F','stripes','bl','a'],
  ['scf','Freiburg','SCF','Freiburg','Bundesliga',1904,'E2001A','FFFFFF','stripes','bl',''],
  ['hsv','Hamburger SV','HSV','Hamburg','Bundesliga',1887,'12326E','FFFFFF','halves','bl','sa'],
  ['fch','Heidenheim','FCH','Heidenheim','Bundesliga',1846,'E4002B','12326E','solid','bl',''],
  ['tsg','Hoffenheim','TSG','Hoffenheim','Bundesliga',1899,'1961B5','FFFFFF','solid','bl',''],
  ['koe','1. FC Köln','KÖL','Köln','Bundesliga',1948,'ED1C24','FFFFFF','halves','bl',''],
  ['rbl','RB Leipzig','RBL','Leipzig','Bundesliga',2009,'DD0741','FFFFFF','solid','bl',''],
  ['m05','Mainz 05','M05','Mainz','Bundesliga',1905,'C3141E','FFFFFF','solid','bl',''],
  ['bmg','B. Mönchengladbach','BMG','Mönchengladbach','Bundesliga',1900,'111111','00A752','stripes','bl','a'],
  ['stp','St. Pauli','STP','Hamburg','Bundesliga',1910,'61371F','FFFFFF','solid','bl','s'],
  ['vfb','Stuttgart','VFB','Stuttgart','Bundesliga',1893,'FFFFFF','E32219','sash','bl',''],
  ['fcu','Union Berlin','FCU','Berlin','Bundesliga',1966,'EB1923','F5D000','solid','bl','b'],
  ['svw','Werder Bremen','SVW','Bremen','Bundesliga',1899,'1D9053','FFFFFF','stripes','bl','a'],
  ['wob','Wolfsburg','WOB','Wolfsburg','Bundesliga',1945,'65B32E','FFFFFF','solid','bl',''],
  ['ang','Angers','SCO','Angers','Ligue 1',1919,'111111','FFFFFF','halves','l1',''],
  ['axr','Auxerre','AJA','Auxerre','Ligue 1',1905,'FFFFFF','12326E','stripes','l1',''],
  ['sb29','Brest','SB29','Brest','Ligue 1',1950,'A50044','FFFFFF','solid','l1','s'],
  ['hac','Le Havre','HAC','Le Havre','Ligue 1',1872,'87CEEB','12326E','stripes','l1','s'],
  ['len','Lens','RCL','Lens','Ligue 1',1906,'F5D000','A50044','stripes','l1',''],
  ['lil','Lille','LOSC','Lille','Ligue 1',1944,'E01E13','12326E','solid','l1',''],
  ['lor','Lorient','FCL','Lorient','Ligue 1',1926,'F58220','111111','solid','l1','s'],
  ['ol','Lyon','OL','Lyon','Ligue 1',1950,'FFFFFF','122E62','halves','l1',''],
  ['om','Marseille','OM','Marsilya','Ligue 1',1899,'FFFFFF','2FAEE0','solid','l1','sa'],
  ['fcm','Metz','FCM','Metz','Ligue 1',1932,'6E1B37','FFFFFF','solid','l1',''],
  ['asm','Monaco','ASM','Monako','Ligue 1',1924,'E63329','FFFFFF','halves','l1','sb'],
  ['fcn','Nantes','FCN','Nantes','Ligue 1',1943,'F5D000','00843D','stripes','l1','s'],
  ['ogc','Nice','OGCN','Nice','Ligue 1',1904,'A21C24','111111','halves','l1','s'],
  ['pfc','Paris FC','PFC','Paris','Ligue 1',1969,'12326E','FFFFFF','solid','l1','b'],
  ['psg','Paris Saint-Germain','PSG','Paris','Ligue 1',1970,'004170','DA291C','sash','l1','ba'],
  ['srf','Rennes','SRFC','Rennes','Ligue 1',1901,'E4002B','111111','halves','l1',''],
  ['rcs','Strasbourg','RCSA','Strazburg','Ligue 1',1906,'12326E','FFFFFF','solid','l1',''],
  ['tfc','Toulouse','TFC','Toulouse','Ligue 1',1970,'5B2A86','FFFFFF','solid','l1',''],
  ['aja','Ajax','AJAX','Amsterdam','Eredivisie',1900,'FFFFFF','D2122E','sash','ed','ba'],
  ['psv','PSV','PSV','Eindhoven','Eredivisie',1913,'ED1C24','FFFFFF','stripes','ed','a'],
  ['fey','Feyenoord','FEY','Rotterdam','Eredivisie',1908,'CE1317','FFFFFF','halves','ed','sa'],
  ['az','AZ Alkmaar','AZ','Alkmaar','Eredivisie',1967,'E4002B','FFFFFF','solid','ed','a'],
  ['twe','Twente','TWE','Enschede','Eredivisie',1965,'ED1C24','FFFFFF','solid','ed',''],
  ['utr','Utrecht','UTR','Utrecht','Eredivisie',1970,'ED1C24','FFFFFF','halves','ed',''],
  ['gae','Go Ahead Eagles','GAE','Deventer','Eredivisie',1902,'F5D000','A32638','stripes','ed',''],
  ['hee','Heerenveen','HEE','Heerenveen','Eredivisie',1920,'12326E','FFFFFF','halves','ed',''],
  ['nec','NEC Nijmegen','NEC','Nijmegen','Eredivisie',1900,'12326E','A32638','stripes','ed',''],
  ['spa','Sparta Rotterdam','SPA','Rotterdam','Eredivisie',1888,'A32638','FFFFFF','stripes','ed','s'],
  ['grn','Groningen','GRO','Groningen','Eredivisie',1971,'00A752','FFFFFF','halves','ed',''],
  ['zwo','PEC Zwolle','PEC','Zwolle','Eredivisie',1910,'12326E','FFFFFF','solid','ed',''],
  ['ben','Benfica','SLB','Lizbon','Primeira Liga',1904,'E30613','FFFFFF','solid','pt','sba'],
  ['por','Porto','FCP','Porto','Primeira Liga',1893,'003DA5','FFFFFF','stripes','pt','sa'],
  ['spo','Sporting CP','SCP','Lizbon','Primeira Liga',1906,'008057','FFFFFF','hoops','pt','sba'],
  ['bra','Sporting Braga','SCB','Braga','Primeira Liga',1921,'A32638','FFFFFF','solid','pt',''],
  ['vsc','Vitória SC','VSC','Guimarães','Primeira Liga',1922,'FFFFFF','111111','stripes','pt',''],
  ['fam','Famalicão','FAM','Famalicão','Primeira Liga',1931,'FFFFFF','111111','halves','pt',''],
  ['mor','Moreirense','MOR','Moreira','Primeira Liga',1938,'0B6B3A','FFFFFF','stripes','pt',''],
  ['rav','Rio Ave','RAV','Vila do Conde','Primeira Liga',1939,'0B6B3A','FFFFFF','halves','pt','s'],
  ['est','Estoril','EST','Estoril','Primeira Liga',1939,'F5D000','12326E','halves','pt','s'],
  ['cpa','Casa Pia','CPA','Lizbon','Primeira Liga',1920,'111111','A32638','stripes','pt','sb'],
  ['cel','Celtic','CEL','Glasgow','İskoçya',1887,'018749','FFFFFF','hoops','dg','a'],
  ['ran','Rangers','RAN','Glasgow','İskoçya',1872,'1B458F','FFFFFF','solid','dg','a'],
  ['and','Anderlecht','AND','Brüksel','Belçika',1908,'5B2A86','FFFFFF','solid','dg','ba'],
  ['clb','Club Brugge','CLB','Brugge','Belçika',1891,'12326E','111111','stripes','dg',''],
  ['gnk','Genk','GNK','Genk','Belçika',1988,'12326E','FFFFFF','solid','dg',''],
  ['stl','Standard Liège','STL','Liège','Belçika',1898,'A32638','FFFFFF','solid','dg',''],
  ['oly','Olympiakos','OLY','Pire','Yunanistan',1925,'A32638','FFFFFF','stripes','dg','sa'],
  ['pao','Panathinaikos','PAO','Atina','Yunanistan',1908,'0B6B3A','FFFFFF','stripes','dg','b'],
  ['aek','AEK Atina','AEK','Atina','Yunanistan',1924,'F5D000','111111','halves','dg','b'],
  ['pak','PAOK','PAOK','Selanik','Yunanistan',1926,'111111','FFFFFF','stripes','dg','s'],
  ['zvz','Kızılyıldız','CRZ','Belgrad','Sırbistan',1945,'A32638','FFFFFF','stripes','dg','ba'],
  ['par2','Partizan','PAR','Belgrad','Sırbistan',1945,'111111','FFFFFF','stripes','dg','b'],
  ['dzg','Dinamo Zagreb','DZG','Zagreb','Hırvatistan',1945,'12326E','FFFFFF','solid','dg','b'],
  ['haj','Hajduk Split','HAJ','Split','Hırvatistan',1911,'FFFFFF','12326E','stripes','dg','s'],
  ['shk','Shakhtar Donetsk','SHK','Donetsk','Ukrayna',1936,'F58220','111111','stripes','dg','a'],
  ['dnk','Dinamo Kiev','DYN','Kiev','Ukrayna',1927,'FFFFFF','12326E','halves','dg','ba'],
  ['zen','Zenit','ZEN','St. Petersburg','Rusya',1925,'12326E','87CEEB','solid','dg','sa'],
  ['spm','Spartak Moskova','SPM','Moskova','Rusya',1922,'A32638','FFFFFF','sash','dg','b'],
  ['cka','CSKA Moskova','CSKA','Moskova','Rusya',1911,'A32638','12326E','halves','dg','ba'],
  ['salz','RB Salzburg','SLZ','Salzburg','Avusturya',1933,'A32638','FFFFFF','solid','dg',''],
  ['rpd','Rapid Wien','RAP','Viyana','Avusturya',1899,'00A752','FFFFFF','halves','dg','b'],
  ['bas','Basel','BAS','Basel','İsviçre',1893,'A32638','12326E','halves','dg',''],
  ['ybb','Young Boys','YB','Bern','İsviçre',1898,'F5D000','111111','stripes','dg','b'],
  ['fck','Kopenhag','FCK','Kopenhag','Danimarka',1992,'FFFFFF','12326E','halves','dg','sb'],
  ['mff','Malmö','MFF','Malmö','İsveç',1910,'87CEEB','FFFFFF','solid','dg','s'],
  ['leg','Legia Varşova','LEG','Varşova','Polonya',1916,'0B6B3A','FFFFFF','stripes','dg','b'],
  ['fer','Ferencváros','FTC','Budapeşte','Macaristan',1899,'00A752','FFFFFF','stripes','dg','b'],
  ['slv','Slavia Prag','SLA','Prag','Çekya',1892,'A32638','FFFFFF','halves','dg','b'],
  ['spr','Sparta Prag','SPT','Prag','Çekya',1893,'8E1F2F','F5D000','solid','dg','b'],
  ['fcs','FCSB','FCSB','Bükreş','Romanya',1947,'A32638','12326E','halves','dg','ba'],
  ['boc','Boca Juniors','BOC','Buenos Aires','Arjantin',1905,'12326E','F5D000','hoops','dn','sba'],
  ['riv','River Plate','RIV','Buenos Aires','Arjantin',1901,'FFFFFF','A32638','sash','dn','sba'],
  ['fla','Flamengo','FLA','Rio de Janeiro','Brezilya',1895,'A32638','111111','hoops','dn','sa'],
  ['pal','Palmeiras','PAL','São Paulo','Brezilya',1914,'00623B','FFFFFF','solid','dn','a'],
  ['cnt','Corinthians','COR','São Paulo','Brezilya',1910,'FFFFFF','111111','halves','dn','a'],
  ['spf','São Paulo','SPFC','São Paulo','Brezilya',1930,'FFFFFF','A32638','hoops','dn','a'],
  ['san','Santos','SAN','Santos','Brezilya',1912,'FFFFFF','111111','halves','dn','sa'],
  ['pen2','Peñarol','PEÑ','Montevideo','Uruguay',1891,'F5D000','111111','stripes','dn','sba'],
  ['col','Colo-Colo','COLO','Santiago','Şili',1925,'FFFFFF','111111','solid','dn','ba'],
  ['hil','Al Hilal','HIL','Riyad','S. Arabistan',1957,'12326E','FFFFFF','stripes','dn','b'],
  ['nsr','Al Nassr','NSR','Riyad','S. Arabistan',1955,'F5D000','12326E','halves','dn','b'],
  ['ahl','Al Ahly','AHLY','Kahire','Mısır',1907,'A32638','FFFFFF','solid','dn','b'],
  ['mia','Inter Miami','MIA','Miami','ABD',2018,'F8B7CD','111111','solid','dn','s'],
  ['lag','LA Galaxy','LAG','Los Angeles','ABD',1994,'FFFFFF','12326E','solid','dn','s'],
  ['lok','Lokomotiv Moskova','LOK','Moskova','Rusya',1922,'0B6B3A','A32638','halves','ru','b'],
  ['dnm','Dinamo Moskova','DIN','Moskova','Rusya',1923,'12326E','FFFFFF','halves','ru','b'],
  ['krd','Krasnodar','KRD','Krasnodar','Rusya',2008,'111111','00A752','stripes','ru',''],
  ['rub','Rubin Kazan','RUB','Kazan','Rusya',1958,'A32638','0B6B3A','halves','ru',''],
  ['ros','Rostov','ROS','Rostov','Rusya',1930,'F5B301','12326E','halves','ru',''],
  ['sam2','Krylia Sovetov','KRY','Samara','Rusya',1942,'12326E','FFFFFF','stripes','ru',''],
  ['dnp','Dnipro-1','DNP','Dnipro','Ukrayna',2017,'12326E','F5B301','halves','ru',''],
  ['zor','Zorya Luhansk','ZOR','Luhansk','Ukrayna',1923,'111111','FFFFFF','stripes','ru',''],
  ['pol','Polissya','POL','Jitomir','Ukrayna',2016,'0B6B3A','FFFFFF','halves','ru',''],
  ['olx','Oleksandriya','OLK','Oleksandriya','Ukrayna',1990,'F5B301','111111','stripes','ru',''],
  ['ast','Astana','AST','Astana','Kazakistan',2009,'12326E','F5B301','halves','kz','b'],
  ['kai','Kairat','KAI','Almatı','Kazakistan',1954,'F5B301','111111','stripes','kz',''],
  ['tob','Tobol','TOB','Kostanay','Kazakistan',1967,'12326E','FFFFFF','stripes','kz',''],
  ['orda','Ordabasy','ORB','Şımkent','Kazakistan',1998,'0B6B3A','FFFFFF','halves','kz',''],
  ['akt','Aktobe','AKT','Aktöbe','Kazakistan',1967,'A32638','FFFFFF','stripes','kz',''],
  ['qar','Qarabağ','QAR','Ağdam','Azerbaycan',1951,'FFFFFF','111111','halves','kz',''],
  ['nef','Neftçi','NEF','Bakü','Azerbaycan',1937,'FFFFFF','111111','stripes','kz','sb'],
  ['sbh','Sabah','SBH','Bakü','Azerbaycan',2017,'12326E','FFFFFF','solid','kz','sb'],
  ['dtb','Dinamo Tiflis','DTB','Tiflis','Gürcistan',1925,'12326E','FFFFFF','solid','kz','ba'],
  ['tku','Torpedo Kutaisi','TKU','Kutaisi','Gürcistan',1946,'A32638','111111','halves','kz',''],
  ['pyu','Pyunik','PYU','Erivan','Ermenistan',1992,'F5B301','12326E','halves','kz','b'],
  ['ara','Ararat-Armenia','ARA','Erivan','Ermenistan',2017,'A32638','FFFFFF','stripes','kz','b'],
  ['bat','BATE Borisov','BATE','Barysav','Belarus',1973,'F5B301','12326E','stripes','kz',''],
  ['dmn','Dinamo Minsk','DMN','Minsk','Belarus',1927,'12326E','FFFFFF','solid','kz','b'],
  ['shf','Sheriff Tiraspol','SHF','Tiraspol','Moldova',1997,'F5B301','111111','halves','kz',''],
  ['mls2','Milsami','MIL2','Orhei','Moldova',2005,'0B6B3A','F5B301','stripes','kz',''],
  ['bodo','Bodø/Glimt','BOD2','Bodø','Norveç',1916,'F5B301','111111','solid','eu2','s'],
  ['mol','Molde','MOL','Molde','Norveç',1911,'12326E','FFFFFF','solid','eu2','s'],
  ['ros2','Rosenborg','RBK','Trondheim','Norveç',1917,'FFFFFF','111111','solid','eu2','s'],
  ['brn','Brann','BRA','Bergen','Norveç',1908,'A32638','FFFFFF','solid','eu2','s'],
  ['aik','AIK','AIK','Stockholm','İsveç',1891,'111111','F5B301','solid','eu2','sb'],
  ['dju','Djurgården','DIF','Stockholm','İsveç',1891,'12326E','87CEEB','stripes','eu2','sb'],
  ['hck','BK Häcken','HAC','Göteborg','İsveç',1940,'F5B301','111111','stripes','eu2','s'],
  ['elf','Elfsborg','ELF','Borås','İsveç',1904,'F5B301','111111','stripes','eu2',''],
  ['ifk','IFK Göteborg','IFK','Göteborg','İsveç',1904,'12326E','FFFFFF','stripes','eu2','sa'],
  ['fcm2','Midtjylland','FCM2','Herning','Danimarka',1999,'111111','A32638','stripes','eu2',''],
  ['brb','Brøndby','BIF','Kopenhag','Danimarka',1964,'F5B301','12326E','halves','eu2','sb'],
  ['agf','AGF Aarhus','AGF','Aarhus','Danimarka',1880,'FFFFFF','12326E','stripes','eu2','s'],
  ['hjk','HJK Helsinki','HJK','Helsinki','Finlandiya',1907,'12326E','FFFFFF','stripes','eu2','sb'],
  ['kup','KuPS','KUPS','Kuopio','Finlandiya',1923,'F5B301','111111','halves','eu2',''],
  ['bre2','Breiðablik','BRE2','Kópavogur','İzlanda',1950,'0B6B3A','FFFFFF','stripes','eu2','s'],
  ['val2','Valur','VAL2','Reykjavík','İzlanda',1911,'A32638','FFFFFF','stripes','eu2','sb'],
  ['flo','Flora Tallinn','FLO','Tallinn','Estonya',1990,'0B6B3A','FFFFFF','stripes','eu2','sb'],
  ['lev2','Levadia','LEV2','Tallinn','Estonya',1998,'0B6B3A','111111','stripes','eu2','sb'],
  ['rfs','RFS','RFS','Riga','Letonya',2005,'6E1B37','FFFFFF','solid','eu2','sb'],
  ['rga','Riga FC','RGA','Riga','Letonya',2014,'111111','FFFFFF','halves','eu2','sb'],
  ['zal','Žalgiris','ZAL','Vilnius','Litvanya',1947,'0B6B3A','FFFFFF','stripes','eu2','b'],
  ['pnv','Panevėžys','PNV','Panevėžys','Litvanya',2015,'12326E','FFFFFF','solid','eu2',''],
  ['lec2','Lech Poznań','LEC2','Poznań','Polonya',1922,'12326E','FFFFFF','stripes','eu2',''],
  ['rak','Raków','RAK','Częstochowa','Polonya',1921,'A32638','12326E','halves','eu2',''],
  ['jag','Jagiellonia','JAG','Białystok','Polonya',1920,'F5B301','A32638','stripes','eu2',''],
  ['pog','Pogoń Szczecin','POG','Szczecin','Polonya',1948,'12326E','6E1B37','stripes','eu2','s'],
  ['wis','Wisła Kraków','WIS','Kraków','Polonya',1906,'FFFFFF','A32638','sash','eu2',''],
  ['plz','Viktoria Plzeň','PLZ','Plzeň','Çekya',1911,'A32638','12326E','stripes','eu2',''],
  ['ban2','Baník Ostrava','BAN2','Ostrava','Çekya',1922,'12326E','FFFFFF','stripes','eu2',''],
  ['slo','Slovan Bratislava','SLO','Bratislava','Slovakya',1919,'87CEEB','FFFFFF','solid','eu2','b'],
  ['trn','Spartak Trnava','TRN','Trnava','Slovakya',1923,'A32638','111111','halves','eu2',''],
  ['pus','Puskás Akadémia','PUS','Felcsút','Macaristan',2005,'12326E','FFFFFF','stripes','eu2',''],
  ['feh','Fehérvár','FEH','Székesfehérvár','Macaristan',1941,'A32638','12326E','halves','eu2',''],
  ['stu','Sturm Graz','STU','Graz','Avusturya',1909,'111111','FFFFFF','stripes','eu2',''],
  ['las','LASK','LASK','Linz','Avusturya',1908,'111111','FFFFFF','halves','eu2',''],
  ['awi','Austria Wien','AUW','Viyana','Avusturya',1911,'5B2A86','FFFFFF','solid','eu2','b'],
  ['srv','Servette','SRV','Cenevre','İsviçre',1890,'6E1B37','FFFFFF','solid','eu2',''],
  ['lug','Lugano','LUG','Lugano','İsviçre',1908,'111111','FFFFFF','halves','eu2',''],
  ['sga','St. Gallen','SGA','St. Gallen','İsviçre',1879,'0B6B3A','FFFFFF','stripes','eu2',''],
  ['zur','FC Zürich','ZUR','Zürih','İsviçre',1896,'FFFFFF','12326E','halves','eu2',''],
  ['gnt','Gent','GNT','Gent','Belçika',1900,'12326E','FFFFFF','stripes','eu2',''],
  ['ant2','Antwerp','ANT2','Anvers','Belçika',1880,'A32638','FFFFFF','solid','eu2','s'],
  ['usg','Union SG','USG','Brüksel','Belçika',1897,'F5B301','12326E','halves','eu2','b'],
  ['cer','Cercle Brugge','CER','Brugge','Belçika',1899,'0B6B3A','111111','stripes','eu2',''],
  ['lud','Ludogorets','LUD','Razgrad','Bulgaristan',1945,'0B6B3A','FFFFFF','stripes','eu2',''],
  ['lvs','Levski Sofya','LVS','Sofya','Bulgaristan',1914,'12326E','FFFFFF','halves','eu2','b'],
  ['cks','CSKA Sofya','CSKS','Sofya','Bulgaristan',1948,'A32638','FFFFFF','solid','eu2','b'],
  ['cfr','CFR Cluj','CFR','Cluj','Romanya',1907,'6E1B37','FFFFFF','stripes','eu2',''],
  ['ucv','U. Craiova','UCV','Craiova','Romanya',1991,'12326E','FFFFFF','halves','eu2',''],
  ['rap2','Rapid Bükreş','RAP2','Bükreş','Romanya',1923,'6E1B37','F5B301','stripes','eu2','b'],
  ['voj','Vojvodina','VOJ','Novi Sad','Sırbistan',1914,'A32638','FFFFFF','stripes','eu2',''],
  ['cuk','Čukarički','CUK','Belgrad','Sırbistan',1926,'F5B301','111111','halves','eu2','b'],
  ['rij','Rijeka','RIJ','Rijeka','Hırvatistan',1946,'FFFFFF','12326E','halves','eu2','s'],
  ['osi','Osijek','OSI','Osijek','Hırvatistan',1947,'12326E','FFFFFF','stripes','eu2',''],
  ['olj','Olimpija','OLJ','Ljubljana','Slovenya',1911,'0B6B3A','FFFFFF','stripes','eu2','b'],
  ['mar','Maribor','MAR','Maribor','Slovenya',1960,'5B2A86','F5B301','halves','eu2',''],
  ['cel2','Celje','CEL2','Celje','Slovenya',1919,'F5B301','12326E','stripes','eu2',''],
  ['zrn','Zrinjski','ZRN','Mostar','Bosna',1905,'A32638','FFFFFF','stripes','eu2',''],
  ['fks','FK Sarajevo','FKS','Saraybosna','Bosna',1946,'6E1B37','FFFFFF','solid','eu2','b'],
  ['bor','Borac','BOR','Banja Luka','Bosna',1926,'A32638','12326E','halves','eu2',''],
  ['shk2','Shkëndija','SHK2','Tetova','K. Makedonya',1979,'A32638','111111','stripes','eu2',''],
  ['vrd','Vardar','VRD','Üsküp','K. Makedonya',1947,'A32638','111111','halves','eu2','b'],
  ['tir','KF Tirana','TIR','Tiran','Arnavutluk',1920,'12326E','FFFFFF','stripes','eu2','b'],
  ['ptz','Partizani','PTZ','Tiran','Arnavutluk',1946,'A32638','FFFFFF','solid','eu2','b'],
  ['bal','Ballkani','BAL','Suva Reka','Kosova',1947,'A32638','12326E','halves','eu2',''],
  ['drt','Drita','DRT','Gjilan','Kosova',1947,'12326E','FFFFFF','stripes','eu2',''],
  ['bud','Budućnost','BUD','Podgorica','Karadağ',1925,'12326E','FFFFFF','stripes','eu2','b'],
  ['ari','Aris','ARI','Selanik','Yunanistan',1914,'F5B301','111111','halves','eu2','s'],
  ['apo','APOEL','APO','Lefkoşa','Kıbrıs',1926,'12326E','F5B301','halves','eu2','b'],
  ['omo','Omonia','OMO','Lefkoşa','Kıbrıs',1948,'0B6B3A','FFFFFF','stripes','eu2','b'],
  ['paf','Pafos','PAF','Baf','Kıbrıs',2014,'12326E','FFFFFF','solid','eu2','s'],
  ['mtl','Maccabi Tel Aviv','MTA','Tel Aviv','İsrail',1906,'F5B301','12326E','stripes','eu2','s'],
  ['mhf','Maccabi Haifa','MHF','Hayfa','İsrail',1913,'0B6B3A','FFFFFF','stripes','eu2','s'],
  ['hbs','Hapoel Beer Şeva','HBS','Beer Şeva','İsrail',1949,'A32638','FFFFFF','solid','eu2',''],
  ['bjr','Beitar Kudüs','BJR','Kudüs','İsrail',1936,'F5B301','111111','stripes','eu2','b'],
  ['hea','Hearts','HEA','Edinburgh','İskoçya',1874,'6E1B37','FFFFFF','solid','eu2','b'],
  ['hib','Hibernian','HIB','Edinburgh','İskoçya',1875,'0B6B3A','FFFFFF','halves','eu2','b'],
  ['abd','Aberdeen','ABD','Aberdeen','İskoçya',1903,'A32638','FFFFFF','solid','eu2','s'],
  ['shr','Shamrock Rovers','SHR','Dublin','İrlanda',1899,'0B6B3A','FFFFFF','hoops','eu2','sb'],
  ['boh','Bohemians','BOH','Dublin','İrlanda',1890,'A32638','111111','stripes','eu2','sb'],
  ['lin','Linfield','LIN','Belfast','K. İrlanda',1886,'12326E','FFFFFF','solid','eu2','s'],
  ['lar','Larne','LAR','Larne','K. İrlanda',1889,'A32638','111111','halves','eu2','s'],
  ['tns','The New Saints','TNS','Oswestry','Galler',1959,'0B6B3A','FFFFFF','stripes','eu2',''],
  ['lri','Lincoln Red Imps','LRI','Cebelitarık','Cebelitarık',1976,'111111','A32638','stripes','eu2','sb'],
  ['kik','KÍ Klaksvík','KI','Klaksvík','Faroe',1904,'12326E','FFFFFF','stripes','eu2','s'],
  ['hbt','HB Tórshavn','HB','Tórshavn','Faroe',1904,'12326E','FFFFFF','stripes','eu2','sb'],
  ['ham','Hamrun Spartans','HAM','Ħamrun','Malta',1907,'A32638','111111','stripes','eu2','s'],
  ['flr','Floriana','FLR','Floriana','Malta',1894,'0B6B3A','FFFFFF','stripes','eu2','s'],
  ['dif','Differdange 03','DIF','Differdange','Lüksemburg',2003,'A32638','111111','halves','eu2',''],
  ['dud','F91 Dudelange','DUD','Dudelange','Lüksemburg',1991,'F5B301','111111','stripes','eu2',''],
  ['ies','Inter Escaldes','IES','Escaldes','Andorra',1991,'12326E','FFFFFF','solid','eu2',''],
  ['tfi','Tre Fiori','TFI','Fiorentino','San Marino',1949,'F5B301','12326E','halves','eu2',''],
  ['lafc','Los Angeles FC','LAFC','Los Angeles','MLS',2014,'111111','F5B301','halves','na','s'],
  ['sea','Seattle Sounders','SEA','Seattle','MLS',2007,'0B6B3A','12326E','stripes','na','s'],
  ['atl','Atlanta United','ATL','Atlanta','MLS',2014,'A32638','111111','stripes','na',''],
  ['nyc','New York City FC','NYC','New York','MLS',2013,'87CEEB','12326E','halves','na','s'],
  ['rbny','New York Red Bulls','RBNY','New York','MLS',1994,'A32638','FFFFFF','solid','na','s'],
  ['ptl','Portland Timbers','POR2','Portland','MLS',2009,'0B6B3A','F5B301','stripes','na',''],
  ['clbc','Columbus Crew','CLB2','Columbus','MLS',1994,'F5B301','111111','halves','na',''],
  ['tor','Toronto FC','TOR2','Toronto','MLS',2005,'A32638','FFFFFF','stripes','na','s'],
  ['phi','Philadelphia Union','PHI','Philadelphia','MLS',2008,'12326E','F5B301','stripes','na','s'],
  ['sdg','San Diego FC','SDFC','San Diego','MLS',2023,'12326E','F5B301','halves','na','s'],
  ['ame','Club América','AME','Meksiko','Liga MX',1916,'F5D000','12326E','solid','na','ba'],
  ['chv','Guadalajara (Chivas)','CHV','Guadalajara','Liga MX',1906,'A32638','FFFFFF','stripes','na','a'],
  ['cru','Cruz Azul','CAZ','Meksiko','Liga MX',1927,'12326E','FFFFFF','solid','na','ba'],
  ['pum','Pumas UNAM','PUM','Meksiko','Liga MX',1954,'F5B301','12326E','halves','na','ba'],
  ['tig','Tigres UANL','TIG','Monterrey','Liga MX',1960,'F5B301','12326E','stripes','na','a'],
  ['mty','Monterrey','MTY','Monterrey','Liga MX',1945,'12326E','FFFFFF','stripes','na','a'],
  ['tol','Toluca','TOL','Toluca','Liga MX',1917,'A32638','FFFFFF','stripes','na',''],
  ['pac','Pachuca','PAC','Pachuca','Liga MX',1901,'12326E','FFFFFF','stripes','na','a'],
  ['rac','Racing Club','RAC','Buenos Aires','Arjantin',1903,'87CEEB','FFFFFF','stripes','sam','sba'],
  ['ind','Independiente','IND','Buenos Aires','Arjantin',1905,'A32638','FFFFFF','solid','sam','sba'],
  ['sanl','San Lorenzo','SLZ','Buenos Aires','Arjantin',1908,'12326E','A32638','stripes','sam','sba'],
  ['estu','Estudiantes','EST2','La Plata','Arjantin',1905,'A32638','FFFFFF','stripes','sam','sa'],
  ['vel','Vélez Sarsfield','VEL','Buenos Aires','Arjantin',1910,'FFFFFF','12326E','sash','sam','sba'],
  ['new2','Newells Old Boys','NOB','Rosario','Arjantin',1903,'A32638','111111','halves','sam',''],
  ['roc','Rosario Central','CEN','Rosario','Arjantin',1889,'F5B301','12326E','stripes','sam',''],
  ['gre','Grêmio','GRE','Porto Alegre','Brezilya',1903,'87CEEB','111111','stripes','sam','sa'],
  ['int2','Internacional','INT2','Porto Alegre','Brezilya',1909,'A32638','FFFFFF','solid','sam','sa'],
  ['cru2','Cruzeiro','CRU','Belo Horizonte','Brezilya',1921,'12326E','FFFFFF','solid','sam','a'],
  ['cam','Atlético Mineiro','CAM','Belo Horizonte','Brezilya',1908,'111111','FFFFFF','stripes','sam','a'],
  ['bot','Botafogo','BOT','Rio de Janeiro','Brezilya',1904,'111111','FFFFFF','stripes','sam','sa'],
  ['vas','Vasco da Gama','VAS','Rio de Janeiro','Brezilya',1898,'111111','FFFFFF','sash','sam','s'],
  ['flu','Fluminense','FLU','Rio de Janeiro','Brezilya',1902,'6E1B37','0B6B3A','stripes','sam','sa'],
  ['bah','Bahia','BAH','Salvador','Brezilya',1931,'12326E','A32638','stripes','sam','s'],
  ['for','Fortaleza','FOR','Fortaleza','Brezilya',1918,'12326E','A32638','stripes','sam','s'],
  ['nac','Nacional','NAC','Montevideo','Uruguay',1899,'FFFFFF','12326E','solid','sam','sba'],
  ['def','Defensor Sporting','DEF','Montevideo','Uruguay',1913,'5B2A86','FFFFFF','solid','sam','sb'],
  ['ldu','LDU Quito','LDU','Quito','Ekvador',1930,'FFFFFF','111111','solid','sam','ba'],
  ['bsc','Barcelona SC','BSC','Guayaquil','Ekvador',1925,'F5B301','A32638','stripes','sam','s'],
  ['idv','Independiente del Valle','IDV','Sangolquí','Ekvador',1958,'111111','A32638','stripes','sam','a'],
  ['oli','Olimpia','OLI','Asunción','Paraguay',1902,'FFFFFF','111111','solid','sam','ba'],
  ['cer2','Cerro Porteño','CER2','Asunción','Paraguay',1912,'A32638','12326E','stripes','sam','b'],
  ['liber','Libertad','LIB','Asunción','Paraguay',1905,'111111','FFFFFF','stripes','sam','b'],
  ['blv','Bolívar','BOL2','La Paz','Bolivya',1925,'87CEEB','FFFFFF','solid','sam','b'],
  ['str','The Strongest','STR','La Paz','Bolivya',1908,'F5B301','111111','stripes','sam','b'],
  ['uni','Universitario','UNI','Lima','Peru',1924,'FFFFFF','A32638','solid','sam','sb'],
  ['ali','Alianza Lima','ALI','Lima','Peru',1901,'12326E','FFFFFF','solid','sam','sb'],
  ['spc','Sporting Cristal','SPC','Lima','Peru',1955,'87CEEB','FFFFFF','solid','sam','sb'],
  ['unc','U. de Chile','UCH','Santiago','Şili',1927,'12326E','A32638','solid','sam','ba'],
  ['ucc','U. Católica','UCC','Santiago','Şili',1937,'FFFFFF','12326E','sash','sam','b'],
  ['atn','Atlético Nacional','ATN','Medellín','Kolombiya',1947,'0B6B3A','FFFFFF','stripes','sam','a'],
  ['mll2','Millonarios','MLL2','Bogotá','Kolombiya',1946,'12326E','FFFFFF','solid','sam','b'],
  ['jun','Junior','JUN','Barranquilla','Kolombiya',1924,'A32638','FFFFFF','stripes','sam','s'],
  ['adc','América de Cali','ADC','Cali','Kolombiya',1927,'A32638','FFFFFF','solid','sam',''],
  ['car','Caracas FC','CAR','Karakas','Venezuela',1967,'A32638','FFFFFF','stripes','sam','b'],
  ['auc','Auckland City','AUC','Auckland','Yeni Zelanda',2004,'12326E','FFFFFF','stripes','ok','sa'],
  ['wel','Wellington Phoenix','WEL','Wellington','Yeni Zelanda',2007,'F5B301','111111','solid','ok','sb'],
  ['mvi','Melbourne Victory','MVI','Melbourne','Avustralya',2004,'12326E','FFFFFF','stripes','ok','s'],
  ['mci2','Melbourne City','MCY','Melbourne','Avustralya',2009,'87CEEB','FFFFFF','solid','ok','s'],
  ['syd','Sydney FC','SYD','Sidney','Avustralya',2004,'87CEEB','12326E','halves','ok','s'],
  ['wsw','Western Sydney','WSW','Sidney','Avustralya',2012,'A32638','111111','stripes','ok','s'],
  ['cmr','Central Coast Mariners','CCM','Gosford','Avustralya',2004,'F5B301','12326E','stripes','ok','s'],
  ['adl','Adelaide United','ADL','Adelaide','Avustralya',2003,'A32638','12326E','stripes','ok','s'],
  ['itt','Al Ittihad','ITT','Cidde','S. Arabistan',1927,'F5B301','111111','stripes','as','sa'],
  ['ahi','Al Ahli','AHLI','Cidde','S. Arabistan',1937,'0B6B3A','FFFFFF','stripes','as','s'],
  ['shb','Al Shabab','SHB','Riyad','S. Arabistan',1947,'FFFFFF','111111','halves','as','b'],
  ['urw','Urawa Reds','URW','Saitama','Japonya',1950,'A32638','111111','solid','as','a'],
  ['kaw','Kawasaki Frontale','KAW','Kawasaki','Japonya',1955,'87CEEB','111111','stripes','as','sa'],
  ['kas','Kashima Antlers','KAS','Kashima','Japonya',1947,'6E1B37','FFFFFF','solid','as','sa'],
  ['gam','Gamba Osaka','GAM','Osaka','Japonya',1980,'12326E','111111','stripes','as','sa'],
  ['jeo','Jeonbuk Hyundai','JEO','Jeonju','G. Kore',1994,'0B6B3A','FFFFFF','solid','as','a'],
  ['uls','Ulsan HD','ULS','Ulsan','G. Kore',1983,'12326E','F5B301','stripes','as','sa'],
  ['fcs2','FC Seoul','SEO','Seul','G. Kore',1983,'A32638','111111','stripes','as','ba'],
  ['shp','Shanghai Port','SHP','Şanghay','Çin',2005,'A32638','111111','solid','as','s'],
  ['gua','Guangzhou FC','GUA','Guangzhou','Çin',1954,'A32638','FFFFFF','solid','as','sa'],
  ['per','Persepolis','PER','Tahran','İran',1963,'A32638','FFFFFF','stripes','as','b'],
  ['est3','Esteghlal','EST3','Tahran','İran',1945,'12326E','FFFFFF','stripes','as','ba'],
  ['sad','Al Sadd','SADD','Doha','Katar',1969,'FFFFFF','111111','solid','as','ba'],
  ['duh','Al Duhail','DUH','Doha','Katar',2009,'A32638','111111','stripes','as','b'],
  ['ain','Al Ain','AIN','Al Ain','BAE',1968,'5B2A86','FFFFFF','solid','as','a'],
  ['zam','Zamalek','ZAM','Kahire','Mısır',1911,'FFFFFF','A32638','solid','af','ba'],
  ['pyr','Pyramids FC','PYR','Kahire','Mısır',2008,'87CEEB','FFFFFF','solid','af','ba'],
  ['wac','Wydad Casablanca','WAC','Kazablanka','Fas',1937,'A32638','FFFFFF','solid','af','sa'],
  ['rca','Raja Casablanca','RCA','Kazablanka','Fas',1949,'0B6B3A','FFFFFF','solid','af','sa'],
  ['esp2','Espérance Tunis','EST4','Tunus','Tunus',1919,'F5B301','A32638','stripes','af','ba'],
  ['csx','Club Africain','CSA','Tunus','Tunus',1920,'A32638','FFFFFF','stripes','af','ba'],
  ['mca','MC Alger','MCA','Cezayir','Cezayir',1921,'0B6B3A','A32638','halves','af','sba'],
  ['esset','ES Sétif','ESS','Sétif','Cezayir',1958,'111111','FFFFFF','stripes','af','a'],
  ['msd','Mamelodi Sundowns','SUN2','Pretoria','G. Afrika',1970,'F5B301','12326E','solid','af','ba'],
  ['kai2','Kaizer Chiefs','KZC','Johannesburg','G. Afrika',1970,'F5B301','111111','solid','af',''],
  ['ori','Orlando Pirates','ORL','Johannesburg','G. Afrika',1937,'111111','FFFFFF','solid','af','a'],
  ['sim','Simba SC','SIM','Darüsselam','Tanzanya',1936,'A32638','FFFFFF','solid','af','sb'],
  ['tpm','TP Mazembe','TPM','Lubumbashi','Kongo',1939,'111111','FFFFFF','solid','af','a'],
  ['enu','Enyimba','ENY','Aba','Nijerya',1976,'12326E','FFFFFF','solid','af','a'],
];

const _GRUP_ADI = {
  sl:'Süper Lig', '1l':'TFF 1. Lig', tr:'Türkiye klasikleri',
  pl:'Premier Lig', ll:'LaLiga', sa:'Serie A', bl:'Bundesliga', l1:'Ligue 1',
  ed:'Eredivisie', pt:'Primeira Liga', dg:'Avrupa', eu2:'Avrupa kupaları',
  ru:'Rusya/Ukrayna', kz:'Kazakistan/Kafkasya',
  na:'Kuzey Amerika', sam:'Güney Amerika', ok:'Okyanusya', as:'Asya', af:'Afrika', dn:'Dünya',
};

const AVRUPA_GRUPLARI = ['pl','ll','sa','bl','l1','ed','pt','dg','eu2','ru','kz'];
const DUNYA_GRUPLARI  = ['na','sam','ok','as','af','dn'];

const TAKIMLAR = _SATIRLAR.map(([id, ad, kisa, sehir, lig, kurulus, r1, r2, desen, grup, bay]) => ({
  id, ad, kisa, sehir, lig, kurulus, desen, grup,
  renkler: ['#' + r1, '#' + r2],
  sahil:   bay.includes('s'),
  baskent: bay.includes('b'),
  avrupa:  bay.includes('a'),
}));

const HAVUZLAR = {
  'super-lig': { ad:'Süper Lig',   aciklama:'Sadece Süper Lig',
                 filtre: t => t.grup === 'sl' },
  'turkiye':   { ad:'Türkiye',     aciklama:'Süper Lig + 1. Lig + klasikler',
                 filtre: t => ['sl','1l','tr'].includes(t.grup) },
  'top5':      { ad:'Avrupa 5 Büyük', aciklama:'PL, LaLiga, Serie A, Bundesliga, Ligue 1',
                 filtre: t => ['pl','ll','sa','bl','l1'].includes(t.grup) },
  'avrupa':    { ad:'Tüm Avrupa',  aciklama:'ŞL, Avrupa Ligi ve Konferans Ligi kulüpleri — Rusya, Kafkasya, adalar dahil',
                 filtre: t => AVRUPA_GRUPLARI.includes(t.grup) || t.grup === 'sl' },
  'dunya':     { ad:'Dünya',       aciklama:'Amerika, Asya, Afrika, Okyanusya',
                 filtre: t => DUNYA_GRUPLARI.includes(t.grup) },
  'hepsi':     { ad:'Hepsi',       aciklama:'Bütün takımlar — en zor mod',
                 filtre: () => true },
};

/* -------------------- ARMA ÜRETECİ — yardımcılar -------------------- */

function _parlaklik(hex){
  const h = hex.replace('#','');
  const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
  return (0.299*r + 0.587*g + 0.114*b) / 255;
}
function kontrastRenk(hex){ return _parlaklik(hex) > 0.6 ? '#101318' : '#FFFFFF'; }

/* Kalkanın içini takımın desenine göre boyar */
function _desenIcerik(t){
  const [a, b] = t.renkler;
  switch(t.desen){
    case 'stripes': {
      let s = `<rect x="0" y="0" width="200" height="240" fill="${a}"/>`;
      for(let i=0;i<5;i++) s += `<rect x="${20+i*40}" y="0" width="20" height="240" fill="${b}"/>`;
      return s;
    }
    case 'hoops': {
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

/* -------------------- GERÇEK LOGOLAR --------------------
   LOGOLAR[takimId] = resim adresi ya da data: URI.
   İki yoldan dolar:
     1) assets/js/logos.js  — tools/logo-cek.py ile üretilen gömülü sürüm
        (internet gerekmez, tek dosya sürümde de çalışır)
     2) assets/js/logo.js   — tarayıcı açılışta Wikipedia'dan çeker, sonucu
        localStorage'a yazar
   Logo yoksa aşağıdaki stilize arma çizilir, oyun hiç aksamaz.        */
const LOGOLAR = Object.create(null);
/* 'stil'  = herkes icin stilize kalkan (varsayilan, internet gerekmez)
   'gercek'= Wikipedia'dan gercek kulup armalarini cek (assets/js/logo.js)  */
let LOGO_MODU = 'stil';

/* Ekrana çizilecek arma: gerçek logo varsa o, yoksa stilize kalkan */
function arma(t){
  const kaynak = LOGO_MODU === 'gercek' ? LOGOLAR[t.id] : null;
  if(kaynak){
    return `<img class="arma logo" src="${kaynak}" alt="${t.ad} logosu" loading="lazy" `+
           `data-tid="${t.id}" onerror="this.replaceWith(logoYedek('${t.id}'))">`;
  }
  return armaSVG(t);
}
/* <img> yüklenemezse stilize armaya düş */
function logoYedek(id){
  const t = takimBul(id);
  const kap = document.createElement('span');
  kap.className = 'arma-yedek';
  kap.innerHTML = t ? armaSVG(t) : '';
  delete LOGOLAR[id];
  return kap.firstElementChild || kap;
}

/* Takımın stilize armasını SVG string olarak döner */
function armaSVG(t){
  const uid = 'c' + t.id + '_' + Math.random().toString(36).slice(2,7);
  const cerceve = _parlaklik(t.renkler[0]) > 0.75 ? '#101318' : '#F7F7F7';
  const seritZemin = t.renkler[1];
  const seritYazi = kontrastRenk(t.renkler[1]);
  const kalkan = 'M100 4 L192 40 C192 150 160 210 100 236 C40 210 8 150 8 40 Z';
  const boy = t.kisa.length > 3 ? 30 : 40;
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
  <path d="${kalkan}" fill="${cerceve}"/>
  <g clip-path="url(#${uid})">
    ${_desenIcerik(t)}
    <rect x="0" y="96" width="200" height="52" fill="${seritZemin}" opacity=".95"/>
    <text x="100" y="133" text-anchor="middle" font-size="${boy}" font-weight="900"
          font-family="'Archivo Black', 'Arial Black', Impact, system-ui, sans-serif" fill="${seritYazi}"
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
function takimBul(id){ return TAKIMLAR.find(t => t.id === id) || null; }
