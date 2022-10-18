import { Match } from "../../src/entities/match";
import { TestPostgresStore } from "../test-postgres-store";
import { match } from "../mock-data/match.mock";
import { LogEntry, State } from "boardgame.io";

describe("setState", () => {
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

  it("should update the state of the Match with the given ID", async () => {
    await Match.create(match);

    const nextState: State = {
      ...match.state,
      ctx: { ...match.state.ctx, currentPlayer: "102", turn: 2 },
      _stateID: 2,
    };

    await testStore.db.setState(match.id!, nextState);

    const [results] = await testStore.sequelize.query(
      `SELECT * FROM "Games" WHERE id = '${match.id}'`
    );
    expect(results).toHaveLength(1);

    const result = results[0];
    expect(result).toEqual({
      ...match,
      state: nextState,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  it("should append the deltalogs to the Matchs logs", async () => {
    await Match.create(match);

    const nextState: State = {
      ...match.state,
      ctx: { ...match.state.ctx, currentPlayer: "102", turn: 2 },
      _stateID: 2,
    };

    const deltaLogs: LogEntry[] = [
      {
        action: {
          type: "MAKE_MOVE",
          payload: {
            type: "MAKE_MOVE",
            args: null,
            playerID: "102",
          },
        },
        _stateID: 2,
        turn: 2,
        phase: "setup",
      },
    ];

    await testStore.db.setState(match.id!, nextState, deltaLogs);

    const [results] = await testStore.sequelize.query(
      `SELECT * FROM "Games" WHERE id = '${match.id}'`
    );
    expect(results).toHaveLength(1);

    const result = results[0];
    expect(result).toEqual({
      ...match,
      state: nextState,
      log: [...match.log, ...deltaLogs],
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  it("should not make any changes if given state is outdated", async () => {
    await Match.create(match);

    const nextState: State = {
      ...match.state,
      ctx: { ...match.state.ctx, currentPlayer: "103", turn: 0 },
      _stateID: 0,
    };

    await testStore.db.setState(match.id!, nextState);

    const [results] = await testStore.sequelize.query(
      `SELECT * FROM "Games" WHERE id = '${match.id}'`
    );
    expect(results).toHaveLength(1);

    const result = results[0];
    expect(result).toEqual({
      ...match,
      state: match.state,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });

  it("should create a new Match if none is found with given ID", async () => {
    await testStore.db.setState(match.id!, match.state);

    const [results] = await testStore.sequelize.query(
      `SELECT * FROM "Games" WHERE id = '${match.id}'`
    );
    expect(results).toHaveLength(1);

    const result = results[0];
    expect(result).toEqual({
      ...match,
      state: match.state,
      initialState: null,
      gameName: null,
      players: null,
      setupData: null,
      gameover: null,
      nextRoomID: null,
      unlisted: null,
      log: [],
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
  });
});
