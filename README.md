# Jídelníček+ 0.8.44 root-only, manual catalog build

Aplikační a katalogové soubory jsou v rootu. Jediná nutná adresářová výjimka je `.github/workflows/update-food-catalog.yml`.

Workflow je pouze ruční (`workflow_dispatch`) a nemá `schedule`. Spusť jej přes GitHub > Actions > Update Czech food catalog > Run workflow.

Workflow vytvoří/aktualizuje v rootu `catalog-manifest.json` a `catalog-chunk-XXXX.json.gz`.
