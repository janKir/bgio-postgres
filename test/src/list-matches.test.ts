import { Match } from "../../src/entities/match";
import { match } from "../mock-data/match.mock";
import { TestPostgresStore } from "../test-postgres-store";

describe("listMatches", () => {
  let testStore: TestPostgresStore;

  beforeAll(async () => {
    jest.useFakeTimers();

    testStore = TestPostgresStore.create();
    await testStore.beforeAll();
  });

  beforeEach(async () => {
    await testStore.beforeEach();

    jest.setSystemTime(1666000000000);
    await Match.create({
      ...match,
      id: "test-id-1",
      gameName: "test-game-1",
      gameover: null,
    });

    jest.setSystemTime(1667000000000);
    await Match.create({
      ...match,
      id: "test-id-2",
      gameName: "test-game-1",
      gameover: "test-gameover",
    });

    jest.setSystemTime(1668000000000);
    await Match.create({
      ...match,
      id: "test-id-3",
      gameName: "test-game-1",
      gameover: "test-gameover",
    });

    jest.setSystemTime(1666000000000);
    await Match.create({
      ...match,
      id: "test-id-4",
      gameName: "test-game-2",
      gameover: null,
    });

    jest.setSystemTime(1667000000000);
    await Match.create({
      ...match,
      id: "test-id-5",
      gameName: "test-game-2",
      gameover: "test-gameover",
    });

    jest.setSystemTime(1668000000000);
    await Match.create({
      ...match,
      id: "test-id-6",
      gameName: "test-game-2",
      gameover: null,
    });
  });

  afterAll(async () => {
    await testStore.afterAll();

    jest.useRealTimers();
  });

  it("should return all matches if no filter is provided", async () => {
    const result = await testStore.db.listMatches();

    expect(result).toHaveLength(6);
    expect(result).toContain("test-id-1");
    expect(result).toContain("test-id-2");
    expect(result).toContain("test-id-3");
    expect(result).toContain("test-id-4");
    expect(result).toContain("test-id-5");
    expect(result).toContain("test-id-6");
  });

  it("should only return matches with provided gamename", async () => {
    const result = await testStore.db.listMatches({ gameName: "test-game-1" });

    expect(result).toHaveLength(3);
    expect(result).toContain("test-id-1");
    expect(result).toContain("test-id-2");
    expect(result).toContain("test-id-3");
  });

  it("should only return finished matches if isGameover flag is true", async () => {
    const result = await testStore.db.listMatches({
      where: {
        isGameover: true,
      },
    });

    expect(result).toHaveLength(3);
    expect(result).toContain("test-id-2");
    expect(result).toContain("test-id-3");
    expect(result).toContain("test-id-5");
  });

  it("should only return unfinished matches if isGameover flag is false", async () => {
    const result = await testStore.db.listMatches({
      where: {
        isGameover: false,
      },
    });

    expect(result).toHaveLength(3);
    expect(result).toContain("test-id-1");
    expect(result).toContain("test-id-4");
    expect(result).toContain("test-id-6");
  });

  it("should only return matches last updated before timestamp provided in updatedBefore", async () => {
    const result = await testStore.db.listMatches({
      where: {
        updatedBefore: 1667000000001,
      },
    });

    expect(result).toHaveLength(4);
    expect(result).toContain("test-id-1");
    expect(result).toContain("test-id-2");
    expect(result).toContain("test-id-4");
    expect(result).toContain("test-id-5");
  });

  it("should only return matches last updated after timestamp provided in updatedAfter", async () => {
    const result = await testStore.db.listMatches({
      where: {
        updatedAfter: 1666000000001,
      },
    });

    expect(result).toHaveLength(4);
    expect(result).toContain("test-id-2");
    expect(result).toContain("test-id-3");
    expect(result).toContain("test-id-5");
    expect(result).toContain("test-id-6");
  });

  it("should only return matches that fit all filter criteria", async () => {
    const result = await testStore.db.listMatches({
      gameName: "test-game-1",
      where: {
        isGameover: true,
        updatedBefore: 1667000000001,
        updatedAfter: 1666000000001,
      },
    });

    expect(result).toHaveLength(1);
    expect(result).toContain("test-id-2");

    const emptyResult = await testStore.db.listMatches({
      gameName: "test-game-1",
      where: {
        isGameover: false,
        updatedBefore: 1667000000001,
        updatedAfter: 1666000000001,
      },
    });

    expect(emptyResult).toHaveLength(0);
  });
});
