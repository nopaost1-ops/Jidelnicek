Jídelníček+ katalog workflow

Serverové skripty jsou izolované v tomto adresáři:
- build-cz-catalog.mjs
- build-food-images.mjs
- validate-snapshot-set.mjs
- fix-archiver-import.mjs

Workflow zůstává povinně v .github/workflows/update-food-catalog.yml, ale spouští skripty odsud.
Výstupy snapshotu zůstávají v rootu, protože je načítá PWA přes GitHub Pages.
