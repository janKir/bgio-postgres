import { Match } from "../../src/entities/match";
import { match } from "../mock-data/match.mock";
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
});
