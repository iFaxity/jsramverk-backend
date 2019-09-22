## Länk till github repo

https://github.com/ifaxity/jsramverk-backend

## Installera moduler

För att installera modulerna kör:

`npm install`


## Skapa .env fil

Skapa en .env fil i roten utav servern (där app.js finns).
Ändra filen så det passar dig.

```bash
# Server variables
NODE_ENV='production'
PORT=3000

# JWT Config
JWT_SECRET='<secret_string>'
JWT_ISSUER='<jwt_issuer>'
JWT_EXPIRES_IN='15m'
JWT_MAX_AGE='1d'
```

## Starta hemsidan

För att starta servern kör:

`npm run start`

Sedan ska servern startas på porten som är uppsatt i din .env fil
