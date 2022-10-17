import { Sequelize } from "sequelize/types";
import { PostgresStore } from "../src/postgres";

export class TestPostgresStore {
  constructor(private postgresStore: PostgresStore) {}

  static create(): TestPostgresStore {
    return new TestPostgresStore(
      new PostgresStore({
        database: process.env.DB_DATABASE!,
        username: process.env.DB_USER!,
        password: process.env.DB_PASSWORD!,
        host: process.env.DB_HOST!,
        port: Number.parseInt(process.env.DB_PORT!),
      })
    );
  }

  get db(): PostgresStore {
    return this.postgresStore;
  }

  get sequelize(): Sequelize {
    return this.postgresStore.sequelize;
  }

  async setup(): Promise<void> {
    await this.db.connect();
  }

  async teardown(): Promise<void> {
    await this.postgresStore.sequelize.close();
  }
}
