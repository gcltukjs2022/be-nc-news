# Northcoders News API

## Background

We will be building an API for the purpose of accessing application data programmatically. The intention here is to mimic the building of a real world backend service (such as reddit) which should provide this information to the front end architecture.

Your database will be PSQL, and you will interact with it using [node-postgres](https://node-postgres.com/).

## Setup

### Connect to the databases locally

You will need to create two .env files for your project: .env.test and .env.development. Into each, add PGDATABASE=<database_name_here>, with the correct database name for that environment (see /db/setup.sql for the database names). Double check that these .env files are .gitignored.

## 1. GET /api/topics

Responds with:

an array of topic objects, each of which should have the following properties:

```
slug
description
```

As this is the first endpoint you will need to set up your testing suite.

Errors handled.

## Husky

To ensure we are not commiting broken code this project makes use of git hooks. Git hooks are scripts triggered during certain events in the git lifecycle. Husky is a popular package which allows us to set up and maintain these scripts. This project makes use a _pre-commit hook_. When we attempt to commit our work, the script defined in the `pre-commit` file will run. If any of our tests fail than the commit will be aborted.

The [Husky documentation](https://typicode.github.io/husky/#/) explains how to configure Husky for your own project as well as creating your own custom hooks.\_
