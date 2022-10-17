import { Sequelize } from "sequelize/types";
import { PostgresStore } from "../src/postgres";

export class TestPostgresStore {
  constructor(private postgresStore: PostgresStore) {}

  static create(): TestPostgresStore {
    return new TestPostgresStore(
      new PostgresStore({
        database: "postgres",
        username: "postgres",
        password: "postgres",
        host: "host.docker.internal",
        port: 5432,
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
