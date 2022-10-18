import { match } from "../mock-data/match.mock";
import { TestPostgresStore } from "../test-postgres-store";

describe("create new match", () => {
  let testStore: TestPostgresStore;

  beforeAll(async () => {
    testStore = TestPostgresStore.create();
    await testStore.beforeAll();
  });

  beforeEach(async () => {
    await testStore.beforeEach();
  });

  afterAll(async () => {
    await testStore.afterAll();
  });

  it("should create a new database entry", async () => {
    await testStore.db.createMatch(match.id!, {
      initialState: match.initialState!,
      metadata: {
        gameName: match.gameName!,
        players: match.players!,
        setupData: match.setupData,
        gameover: match.gameover,
        nextMatchID: match.nextRoomID,
        unlisted: match.unlisted,
        createdAt: 0,
        updatedAt: 0,
      },
    });
    match.state = match.initialState;

    const [results] = await testStore.sequelize.query(
      "SELECT * FROM \"Games\" WHERE id = 'test-id'"
    );
    expect(results).toHaveLength(1);

    const result = results[0];
    expect(result).toEqual({
      ...match,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });
});
