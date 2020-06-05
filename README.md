# `bgio-postgres` - PostgreSQL storage adapter for boardgame.io

## Usage

```typescript
import { Server } from "boardgame.io/server";
import { PostgresStore } from "bgio-postgres";

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