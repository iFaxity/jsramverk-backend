[![Build Status](https://travis-ci.org/iFaxity/jsramverk-backend.svg?branch=master)](https://travis-ci.org/iFaxity/jsramverk-backend)

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

## Skapa sqlite databas

Se till att du har sqlite3 installerad på din dator, kör sedan:

```bash
$ db
$ sqlite3 texts.sqlite
sqlite> .read migrate.db
sqlite> .exit
```

## Starta servern

Nu kan vi starta vår server, då kör vi:

`npm run start`

Sedan ska servern startas på porten som är uppsatt i din .env fil
