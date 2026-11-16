# Jídelníček+

Aktuální aplikační verze: **0.8.63**

## Stabilní názvy aplikačních souborů
- `app.js`
- `foods.js` / `foods.css`
- `catalog.js` / `catalog.css`
- `category-images.js`
- `lab-help.js` / `lab-help.css`
- `lab-final.css`
- `style.css`
- `sw.js`

Číslo verze se už nebude přidávat do názvů těchto souborů. Cache busting řeší `?v=0863` v `index.html` a cache ID v `sw.js`.

## Katalog
- `catalog-workflow/` obsahuje serverové skripty.
- `catalog/` obsahuje výstupy workflow.
- `.github/workflows/update-food-catalog.yml` je povinná GitHub Actions definice.
