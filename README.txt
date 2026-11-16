Jídelníček+ catalog builder progress patch 0.8.45

Nahraď v rootu repository soubor build-cz-catalog.mjs tímto souborem.
Workflow .github/workflows/update-food-catalog.yml nahraď obsahem z tohoto balíčku pouze pokud chceš i název kroku a LOG_EVERY explicitně v workflow.

Workflow je jen ruční. Loguje stav každých 100 000 zpracovaných řádků a každý vytvořený chunk.
