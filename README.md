# `bgio-postgres` - PostgreSQL storage adapter for boardgame.io

## Usage

You can use the `PostgresStore` in two ways.
Either provide credentials using a URI as the first argument, or by using an options object.

```typescript
import { Server } from "boardgame.io/server";
import { PostgresStore } from "bgio-postgres";

// EITHER provide a URI
const db = new PostgresStore("postgresql://<username>:<password>@<host>/<database>");

// OR provide options
const db = new PostgresStore({
  database: "database",
  username: "username",
  password: "password",
  host: "host",
});

const server = Server({
  games: [...],
  db,
});
```

## Optional Parameters

This adapter uses [Sequelize][sequelize] as the ORM. Any additional options provided to `PostgresStore` will be passed to the initialization arguments of the underlying Sequelize instance.

```typescript
// EITHER provide options after the URI...
const db = new PostgresStore(
  "postgresql://<username>:<password>@<host>/<database>",
  {
    logging: myLogger,
    timezone: '+00:00',
  }
);

// ...OR provide addition options with the credentials.
const db = new PostgresStore({
  database: "database",
  username: "username",
  password: "password",
  host: "host",
  logging: myLogger,
  timezone: '+00:00',
});

```

The full list of available options is documented in the [Sequelize API Docs][class-sequelize].

[sequelize]: https://sequelize.org/master/
[class-sequelize]: https://sequelize.readthedocs.io/en/latest/api/sequelize/#class-sequelize

## Using with MySQL or other databases
Because Sequelize is used by the adapter under the hood, which can also be used by other database models, it is in theory possible for this adapter to be used to connect to any of the supported sequelize databases. _HOWEVER_, there are a few important caveats:
- this adapter utilizes JSON data types to persist storage, which is not supported by all database models. At the time of writing this, [Sequelize recognizes the JSON datatype for MySQL, Postgres and SQLite](https://sequelize.org/api/v6/class/src/data-types.js~jsontype)
- This library was not made with other database models in mind. While there have been reports of it working with MySQL, any reported issues with models other than Postgres will not be addressed. That being said, there doesn't seem to be a reason it should work any differently.

In order to use this with another database, either provide credentials using a URI as the first argument:

```typescript
const db = new PostgresStore("mysql://<username>:<password>@<host>/<database>");
```

or by using an options object. In this case, the option `dialect: "<database_model>"` **_must be included_**.

```typescript
const db = new PostgresStore({
  database: "database",
  username: "username",
  password: "password",
  host: "host",
  dialect: "mysql",
});
```

