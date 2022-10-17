import { PostgresStore } from "../src/postgres";

describe("instantiate new PostgresStore", () => {
  it("should create a new instance using a URI", async () => {
    const db = new PostgresStore(
      `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`
    );

    expect(db).toBeDefined();

    await db.connect();
    await db.sequelize.close();
  });

  it("should create a new instance using an options object", async () => {
    const db = new PostgresStore({
      database: process.env.DB_DATABASE!,
      username: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      host: process.env.DB_HOST!,
      port: Number.parseInt(process.env.DB_PORT!),
    });

    expect(db).toBeDefined();

    await db.connect();
    await db.sequelize.close();
  });

  it("should create a new instance but throw on connect() if credentials are wrong", async () => {
    const db = new PostgresStore({
      database: "unknown",
      username: "nobody",
      password: "wrong",
      host: "notfound",
      port: 1234,
    });

    expect(db).toBeDefined();

    expect(async () => {
      await db.connect();
      await db.sequelize.close();
    }).rejects.toBeDefined();
  });
});
