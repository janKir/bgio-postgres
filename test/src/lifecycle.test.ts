import { LogEntry, State } from "boardgame.io";
import { state } from "../mock-data/state.mock";
import { TestPostgresStore } from "../test-postgres-store";

describe("match lifecycle", () => {
  let testStore: TestPostgresStore;

  const matchId = "lifecycle-test-id";
  const initialGameName = "lifecycle-game";
  const updatedGameName = "lifecycle-game-updated";

  const initialState: State = { ...state };

  const initialMetadata = {
    gameName: initialGameName,
    players: {
      101: { id: 101 },
      102: { id: 102 },
    },
    setupData: { rounds: 3 },
    gameover: null,
    nextMatchID: "next-lifecycle-id",
    unlisted: false,
    createdAt: 0,
    updatedAt: 0,
  };

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

  it("should support the full match lifecycle: create, read, update, list, delete", async () => {
    // Step 1: Create match
    await testStore.db.createMatch(matchId, {
      initialState,
      metadata: initialMetadata,
    });

    // Step 2: Fetch all fields after creation
    const afterCreate = await testStore.db.fetch(matchId, {
      state: true,
      metadata: true,
      initialState: true,
      log: true,
    });

    expect(afterCreate.state).toEqual(initialState);
    expect(afterCreate.initialState).toEqual(initialState);
    expect(afterCreate.log).toEqual([]);
    expect(afterCreate.metadata).toEqual({
      gameName: initialGameName,
      players: initialMetadata.players,
      setupData: initialMetadata.setupData,
      gameover: initialMetadata.gameover,
      nextMatchID: initialMetadata.nextMatchID,
      unlisted: initialMetadata.unlisted,
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number),
    });

    // Step 3: setState with _stateID: 2
    const newState1: State = {
      ...state,
      ctx: { ...state.ctx, currentPlayer: "102", turn: 2 },
      _stateID: 2,
    };
    const deltalog1: LogEntry[] = [
      {
        action: {
          type: "MAKE_MOVE",
          payload: { type: "MAKE_MOVE", args: null, playerID: "101" },
        },
        _stateID: 2,
        turn: 2,
        phase: "setup",
      },
    ];
    await testStore.db.setState(matchId, newState1, deltalog1);

    // Step 4: setState with _stateID: 3
    const newState2: State = {
      ...state,
      ctx: { ...state.ctx, currentPlayer: "101", turn: 3 },
      _stateID: 3,
    };
    const deltalog2: LogEntry[] = [
      {
        action: {
          type: "MAKE_MOVE",
          payload: { type: "MAKE_MOVE", args: null, playerID: "102" },
        },
        _stateID: 3,
        turn: 3,
        phase: "setup",
      },
    ];
    await testStore.db.setState(matchId, newState2, deltalog2);

    // Step 5: Fetch state and log — verify cumulative updates
    const afterStates = await testStore.db.fetch(matchId, {
      state: true,
      log: true,
    });

    expect(afterStates.state).toEqual(newState2);
    expect(afterStates.log).toEqual([...deltalog1, ...deltalog2]);

    // Step 6: setMetadata — update game name and players
    const updatedMetadata = {
      gameName: updatedGameName,
      players: {
        101: { id: 101, name: "Alice" },
        102: { id: 102, name: "Bob" },
      },
      setupData: { rounds: 5 },
      gameover: "player-101-wins",
      nextMatchID: "rematch-id",
      unlisted: true,
      createdAt: 0,
      updatedAt: 0,
    };
    await testStore.db.setMetadata(matchId, updatedMetadata);

    // Step 7: Fetch metadata — verify update
    const afterMetadata = await testStore.db.fetch(matchId, {
      metadata: true,
    });

    expect(afterMetadata.metadata).toEqual({
      gameName: updatedGameName,
      players: updatedMetadata.players,
      setupData: updatedMetadata.setupData,
      gameover: updatedMetadata.gameover,
      nextMatchID: updatedMetadata.nextMatchID,
      unlisted: updatedMetadata.unlisted,
      createdAt: expect.any(Number),
      updatedAt: expect.any(Number),
    });

    // Step 8: listMatches — verify match appears under updated game name
    const matchesBefore = await testStore.db.listMatches({
      gameName: updatedGameName,
    });
    expect(matchesBefore).toContain(matchId);

    // Step 9: wipe — delete the match
    await testStore.db.wipe(matchId);

    // Step 10: Fetch after wipe — should return empty
    const afterWipe = await testStore.db.fetch(matchId, { state: true });
    expect(afterWipe).toEqual({});

    // Step 11: listMatches after wipe — should not contain deleted match
    const matchesAfter = await testStore.db.listMatches({
      gameName: updatedGameName,
    });
    expect(matchesAfter).toHaveLength(0);
  });
});
