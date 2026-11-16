# Jídelníček+ 0.8.42 complete build

Nahraj celý obsah ZIPu do kořene GitHub repository.

## První spuštění
1. Commitni všechny soubory včetně skrytého adresáře `.github`.
2. Otevři GitHub > Actions > Update Czech food catalog > Run workflow.
3. Workflow vytvoří `data/catalog/manifest.json` a `chunk-*.json.gz` a commitne je.
4. Počkej na dokončení GitHub Pages deploymentu.
5. V aplikaci otevři Potraviny > Katalog > Aktualizovat katalog.

Telefon nestahuje celý dump. Stahuje jen změněné gzip části do 20 MiB na jeden ruční běh. Lokální limity jsou 20 000 produktů, 80 MiB hard limit a 200 MiB minimální volná kvóta.
