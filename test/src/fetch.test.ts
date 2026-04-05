import { Match } from "../../src/entities/match";
import { match } from "../mock-data/match.mock";
import { state } from "../mock-data/state.mock";
import { TestPostgresStore } from "../test-postgres-store";

describe("fetch", () => {
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

  it("should return empty object if match is not found", async () => {
    const result = await testStore.db.fetch("non-existent-id", { state: true });

    expect(result).toEqual({});
  });

  it("should return empty object if all flags are falsy", async () => {
    const result = await testStore.db.fetch(match.id, {});

    expect(result).toEqual({});
  });

  it("should return metadata key in object if flag is true", async () => {
    const result = await testStore.db.fetch(match.id, { metadata: true });

    expect(result).toEqual({
      metadata: {
        gameName: match.gameName,
        players: match.players,
        setupData: match.setupData,
        gameover: match.gameover,
        nextMatchID: match.nextRoomID,
        unlisted: match.unlisted,
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
      },
    });
  });

  it("should return initialState key in object if flag is true", async () => {
    const result = await testStore.db.fetch(match.id, { initialState: true });

    expect(result).toEqual({
      initialState: match.initialState,
    });
  });

  it("should return state key in object if flag is true", async () => {
    const result = await testStore.db.fetch(match.id, { state: true });

    expect(result).toEqual({
      state: match.state,
    });
  });

  it("should return log key in object if flag is true", async () => {
    const result = await testStore.db.fetch(match.id, { log: true });

    expect(result).toEqual({
      log: match.log,
    });
  });

  it("should return all keys in object if all flags are true", async () => {
    const result = await testStore.db.fetch(match.id, {
      metadata: true,
      initialState: true,
      state: true,
      log: true,
    });

    expect(result).toEqual({
      metadata: {
        gameName: match.gameName,
        players: match.players,
        setupData: match.setupData,
        gameover: match.gameover,
        nextMatchID: match.nextRoomID,
        unlisted: match.unlisted,
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
      },
      initialState: match.initialState,
      state: match.state,
      log: match.log,
    });
  });

  it("should handle fetch with metadata on a row created via setState (null metadata fields)", async () => {
    // setState upsert only populates id, state, log — other columns may be null
    await testStore.db.setState("upsert-only-id", state);

    // Sequelize auto-manages createdAt/updatedAt, so this should succeed
    const result = await testStore.db.fetch("upsert-only-id", {
      metadata: true,
    });
    expect(result).toEqual({
      metadata: {
        gameName: null,
        players: [],
        setupData: null,
        gameover: null,
        nextMatchID: null,
        unlisted: null,
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
      },
    });
  });

  it("should round-trip complex JSON state through the adapter", async () => {
    const complexState = {
      ...state,
      G: {
        nested: { deep: { value: [1, 2, null, "hello"] } },
        emptyObj: {},
        emptyArr: [],
        unicode: "日本語テスト 🎲",
        largeNumber: 9007199254740991, // Number.MAX_SAFE_INTEGER
        zero: 0,
        booleans: [true, false],
        nullValue: null,
      },
    };
    await Match.create({
      ...match,
      id: "complex-json-id",
      state: complexState,
      initialState: complexState,
    });

    const result = await testStore.db.fetch("complex-json-id", {
      state: true,
      initialState: true,
    });

    expect(result.state).toEqual(complexState);
    expect(result.initialState).toEqual(complexState);
  });
});
