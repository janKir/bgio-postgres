import { Match } from "../../src/entities/match";
import { match } from "../mock-data/match.mock";
import { TestPostgresStore } from "../test-postgres-store";

describe("wipe", () => {
  let testStore: TestPostgresStore;

  beforeAll(async () => {
    testStore = TestPostgresStore.create();
    await testStore.beforeAll();
  });

  beforeEach(async () => {
    await testStore.beforeEach();
    await Match.create(match);
  });

  afterAll(async () => {
    await testStore.afterAll();
  });

  it("should delete the match with the given ID", async () => {
    await testStore.db.wipe(match.id!);

    const [results] = await testStore.sequelize.query(
      "SELECT * FROM \"Games\" WHERE id = 'test-id'"
    );
    expect(results).toHaveLength(0);
  });
});
