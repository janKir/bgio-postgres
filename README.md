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