# Northcoders Solo Project News API

## Hosted version

Here is the link to the hosted version of the project:\
[https://nc-news-solo-project.herokuapp.com](https://nc-news-solo-project.herokuapp.com)

## Summary

I build this API for the purpose of accessing application data programmatically. The intention here is to mimic the building of a real world backend service (such as reddit) which should provide this information to the front end architecture. The database contains some news, topics, comments which can be accessed by a frontend web application by using the APIs.

## Instructions

### 1. Clone this repository

### 2. You will need to install these dependencies:

```
npm install
npm install -D jest
npm install -D jest-sorted
npm install -D supertest
```

### 3. Seed local database

The database is PSQL, and we will interact with it using node-postgres.\
You can add these two scripts to package.json

```
"scripts":
{
    "setup-dbs": "psql -f ./db/setup.sql",
    "seed": "node ./db/seeds/run-seed.js",
  }
```

### 4. Create two .env files

You will need to create a connection to the relevant database in a ./db/index.js file, and use dotenv files (.env.test & .env.development) to determine which database to connect to, based on whether you are running your jest tests, or running the server manually.

```
.env.test:
PGDATABASE=nc_news_test

.env.development:
PGDATABASE=nc_news
```

### 5. Run tests

```
npm test
```

## Requirement

Minimum Node.js version 16.17.0\
Minimum Postgres version 14.5
