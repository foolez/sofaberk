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
  ['slz','RB Salzburg','SLZ','Salzburg','Avusturya',1933,'A32638','FFFFFF','solid','dg',''],
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
];

const _GRUP_ADI = {
  sl:'Süper Lig', '1l':'TFF 1. Lig', tr:'Türkiye klasikleri',
  pl:'Premier Lig', ll:'LaLiga', sa:'Serie A', bl:'Bundesliga', l1:'Ligue 1',
  ed:'Eredivisie', pt:'Primeira Liga', dg:'Avrupa', dn:'Dünya',
};

const TAKIMLAR = _SATIRLAR.map(([id, ad, kisa, sehir, lig, kurulus, r1, r2, desen, grup, bay]) => ({
  id, ad, kisa, sehir, lig, kurulus, desen, grup,
  renkler: ['#' + r1, '#' + r2],
  sahil:   bay.includes('s'),
  baskent: bay.includes('b'),
  avrupa:  bay.includes('a'),
}));

const HAVUZLAR = {
  'super-lig': { ad:'Süper Lig',      aciklama:'18 takım',            filtre: t => t.grup === 'sl' },
  'turkiye':   { ad:'Türkiye',        aciklama:'Süper Lig + 1. Lig + klasikler', filtre: t => ['sl','1l','tr'].includes(t.grup) },
  'top5':      { ad:'Avrupa 5 Büyük', aciklama:'PL, LaLiga, Serie A, Bundesliga, Ligue 1', filtre: t => ['pl','ll','sa','bl','l1'].includes(t.grup) },
  'avrupa':    { ad:'Tüm Avrupa',     aciklama:'5 büyük lig + Hollanda, Portekiz ve diğerleri', filtre: t => ['pl','ll','sa','bl','l1','ed','pt','dg'].includes(t.grup) },
  'hepsi':     { ad:'Hepsi',          aciklama:'Türkiye + Avrupa + dünya — zor mod', filtre: () => true },
};

/* -------------------- ARMA (LOGO) ÜRETECİ -------------------- */

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
