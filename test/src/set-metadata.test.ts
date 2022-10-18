import { Match } from "../../src/entities/match";
import { TestPostgresStore } from "../test-postgres-store";
import { match } from "../mock-data/match.mock";
import { Server } from "boardgame.io";

describe("setMetadata", () => {
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

  it("should update the metadata of the Match with the given ID", async () => {
    await Match.create(match);

    const nextMetadata: Server.MatchData = {
      gameName: "test-game2",
      players: {
        "0": { id: 0, name: "Player 1" },
        "1": { id: 1, name: "Player 2" },
      },
      setupData: 3,
      gameover: "gameover2",
      nextMatchID: "next-match-id2",
      unlisted: true,
      createdAt: 2,
      updatedAt: 2,
    };

    await testStore.db.setMetadata(match.id!, nextMetadata);

    const [results] = await testStore.sequelize.query(
      `SELECT * FROM "Games" WHERE id = '${match.id}'`
    );
    expect(results).toHaveLength(1);

    const result = results[0];
    const { nextMatchID: nextRoomID, ...metadata } = nextMetadata;
    expect(result).toEqual({
      ...match,
      ...metadata,
      nextRoomID,
      createdAt: new Date(nextMetadata.createdAt),
      updatedAt: new Date(nextMetadata.updatedAt),
    });
  });

  it("should create a new Match if none is found with given ID", async () => {
    const nextMetadata: Server.MatchData = {
      gameName: "test-game2",
      players: {
        "0": { id: 0, name: "Player 1" },
        "1": { id: 1, name: "Player 2" },
      },
      setupData: 3,
      gameover: "gameover2",
      nextMatchID: "next-match-id2",
      unlisted: true,
      createdAt: 2,
      updatedAt: 2,
    };

    await testStore.db.setMetadata(match.id!, nextMetadata);

    const [results] = await testStore.sequelize.query(
      `SELECT * FROM "Games" WHERE id = '${match.id}'`
    );
    expect(results).toHaveLength(1);

    const result = results[0];
    const { nextMatchID: nextRoomID, ...metadata } = nextMetadata;
    expect(result).toEqual({
      id: match.id,
      initialState: null,
      state: null,
      log: null,
      ...metadata,
      nextRoomID,
      createdAt: new Date(nextMetadata.createdAt),
      updatedAt: new Date(nextMetadata.updatedAt),
    });
  });
});
