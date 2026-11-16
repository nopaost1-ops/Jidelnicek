Workflow 2.1 – cache produktu + oprava archiver 8

Nahraď:
.github/workflows/update-food-catalog.yml

Před prvním spuštěním spusť lokálně nebo přes dočasný GitHub Actions krok:
node fix-archiver-import.mjs
Potom commitni upravený build-food-images.mjs a fix-archiver-import.mjs můžeš odstranit.

Workflow načte ETag/Last-Modified/Content-Length OFF dumpu a vytvoří fingerprint.
Shodný fingerprint obnoví catalog-manifest.json a catalog-chunk-*.json.gz z GitHub Actions cache.
Při cache hit se dlouhý scan přeskočí a workflow pokračuje obrázky.
Po novém scanu se produktový snapshot uloží do cache okamžitě, ještě před image buildem.
