Jídelníček+ – unified catalog + images workflow

Root files:
- build-cz-catalog.mjs
- build-food-images.mjs
- validate-snapshot-set.mjs

Workflow path:
- .github/workflows/update-food-catalog.yml

Výsledkem jednoho ručního běhu je společná sada se stejným snapshotId:
- snapshot-manifest.json
- catalog-manifest.json + catalog-chunk-*.json.gz
- image-manifest.json + image-index.json.gz + image-chunk-*.zip

Nová sada se commitne pouze tehdy, když produktová i obrazová část projdou validací.
