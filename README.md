# `bgio-postgres` - PostgreSQL storage adapter for boardgame.io

## Usage

You can use the `PostgresStore` in two ways.
Either provide credentials using a URI as only argument, or by using an options object.

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