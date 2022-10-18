import { Match } from "../../src/entities/match";
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
    const match: Partial<Match> = {
      id: "test-id",
      initialState: {
        ctx: {
          numPlayers: 3,
          playOrder: ["101", "102", "103"],
          playOrderPos: 0,
          activePlayers: null,
          currentPlayer: "101",
          turn: 0,
          phase: "setup",
        },
        G: 2,
        plugins: {},
        _undo: [],
        _redo: [],
        _stateID: 0,
      },
      gameName: "test-gamename",
      players: {
        101: { id: 101 },
        102: { id: 102 },
        103: { id: 103 },
      },
      setupData: 2,
      gameover: "gameover",
      nextRoomID: "nextMatchId",
      unlisted: false,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      log: [],
    };
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
    expect(result).toEqual(match);
  });
});
