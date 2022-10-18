import { TestPostgresStore } from "../test-postgres-store";

describe("connect to PostgreSQL database", () => {
  let testStore: TestPostgresStore;

  beforeAll(async () => {
    testStore = TestPostgresStore.create();
    await testStore.beforeAll();
  });

  beforeEach(async () => {
    await testStore.beforeEach();
  });

  afterAll(async () => {
    await testStore.sequelize.close();
  });

  it("should create the Games table in the database", async () => {
    const sequelize = testStore.sequelize;

    const [tables] = await sequelize.query(
      "SELECT * FROM pg_catalog.pg_tables WHERE tablename = 'Games';"
    );
    expect(tables).toHaveLength(1);
  });

  it("should create columns in Games table", async () => {
    const [columns] = await testStore.sequelize.query(
      `SELECT 
        column_name,
        data_type,
        case when character_maximum_length is not null
            then character_maximum_length
            else numeric_precision end as max_length,
        is_nullable
      from information_schema.columns
      where table_name = 'Games';`
    );
    expect(columns).toHaveLength(12);

    expect(columns).toContainEqual({
      column_name: "id",
      data_type: "character varying",
      max_length: 255,
      is_nullable: "NO",
    });

    expect(columns).toContainEqual({
      column_name: "createdAt",
      data_type: "timestamp with time zone",
      max_length: null,
      is_nullable: "NO",
    });

    expect(columns).toContainEqual({
      column_name: "updatedAt",
      data_type: "timestamp with time zone",
      max_length: null,
      is_nullable: "NO",
    });

    expect(columns).toContainEqual({
      column_name: "initialState",
      data_type: "json",
      max_length: null,
      is_nullable: "YES",
    });

    expect(columns).toContainEqual({
      column_name: "log",
      data_type: "json",
      max_length: null,
      is_nullable: "YES",
    });

    expect(columns).toContainEqual({
      column_name: "players",
      data_type: "json",
      max_length: null,
      is_nullable: "YES",
    });

    expect(columns).toContainEqual({
      column_name: "setupData",
      data_type: "json",
      max_length: null,
      is_nullable: "YES",
    });

    expect(columns).toContainEqual({
      column_name: "gameover",
      data_type: "json",
      max_length: null,
      is_nullable: "YES",
    });

    expect(columns).toContainEqual({
      column_name: "unlisted",
      data_type: "boolean",
      max_length: null,
      is_nullable: "YES",
    });

    expect(columns).toContainEqual({
      column_name: "state",
      data_type: "json",
      max_length: null,
      is_nullable: "YES",
    });

    expect(columns).toContainEqual({
      column_name: "gameName",
      data_type: "character varying",
      max_length: 255,
      is_nullable: "YES",
    });

    expect(columns).toContainEqual({
      column_name: "nextRoomID",
      data_type: "character varying",
      max_length: 255,
      is_nullable: "YES",
    });
  });
});
