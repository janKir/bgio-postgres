import { Match } from "../../src/entities/match";
import { TestPostgresStore } from "../test-postgres-store";
import { match } from "../mock-data/match.mock";
import { state } from "../mock-data/state.mock";
import { logEntry } from "../mock-data/log-entry.mock";
import { LogEntry, State } from "boardgame.io";

describe("concurrent setState", () => {
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

  it("should not corrupt data when two calls race with the same _stateID", async () => {
    await Match.create(match);

    const stateA: State = {
      ...state,
      ctx: { ...state.ctx, currentPlayer: "102", turn: 2 },
      _stateID: 2,
    };
    const stateB: State = {
      ...state,
      ctx: { ...state.ctx, currentPlayer: "103", turn: 2 },
      _stateID: 2,
    };

    const logA: LogEntry[] = [
      {
        ...logEntry,
        _stateID: 2,
        turn: 2,
        action: {
          ...logEntry.action,
          payload: { ...logEntry.action.payload, playerID: "102" },
        },
      },
    ];
    const logB: LogEntry[] = [
      {
        ...logEntry,
        _stateID: 2,
        turn: 2,
        action: {
          ...logEntry.action,
          payload: { ...logEntry.action.payload, playerID: "103" },
        },
      },
    ];

    await Promise.all([
      testStore.db.setState(match.id!, stateA, logA),
      testStore.db.setState(match.id!, stateB, logB),
    ]);

    const result = await testStore.db.fetch(match.id!, {
      state: true,
      log: true,
    });

    // Exactly one state must have won — no partial merge
    const wonA =
      result.state!.ctx.currentPlayer === "102" &&
      result.state!._stateID === 2;
    const wonB =
      result.state!.ctx.currentPlayer === "103" &&
      result.state!._stateID === 2;
    expect(wonA || wonB).toBe(true);

    // The log should be consistent with whichever state won
    if (wonA) {
      expect(result.log).toEqual([...match.log, ...logA]);
    } else {
      expect(result.log).toEqual([...match.log, ...logB]);
    }
  });

  it("should converge to the highest _stateID when two calls race with sequential IDs", async () => {
    await Match.create(match);

    const stateA: State = {
      ...state,
      ctx: { ...state.ctx, currentPlayer: "102", turn: 2 },
      _stateID: 2,
    };
    const stateB: State = {
      ...state,
      ctx: { ...state.ctx, currentPlayer: "103", turn: 3 },
      _stateID: 3,
    };

    const logA: LogEntry[] = [
      {
        ...logEntry,
        _stateID: 2,
        turn: 2,
        action: {
          ...logEntry.action,
          payload: { ...logEntry.action.payload, playerID: "102" },
        },
      },
    ];
    const logB: LogEntry[] = [
      {
        ...logEntry,
        _stateID: 3,
        turn: 3,
        action: {
          ...logEntry.action,
          payload: { ...logEntry.action.payload, playerID: "103" },
        },
      },
    ];

    await Promise.all([
      testStore.db.setState(match.id!, stateA, logA),
      testStore.db.setState(match.id!, stateB, logB),
    ]);

    const result = await testStore.db.fetch(match.id!, {
      state: true,
      log: true,
    });

    // Final state must be the higher _stateID regardless of execution order
    expect(result.state!._stateID).toBe(3);
    expect(result.state!.ctx.currentPlayer).toBe("103");

    // Log depends on execution order:
    // - If stateA ran first: initial log + logA + logB (length 3)
    // - If stateB ran first: stateA is rejected (2 < 3 is false), so initial log + logB (length 2)
    const logLength = result.log!.length;
    expect(logLength === 2 || logLength === 3).toBe(true);

    // logB must always be present
    expect(result.log).toEqual(
      expect.arrayContaining([expect.objectContaining({ _stateID: 3 })])
    );
  });

  // Regression: without SELECT … FOR UPDATE, concurrent setState calls can
  // read the same stale _stateID, both pass the < check, and the last writer
  // wins — even if it carries a lower _stateID (lost update).
  // The row lock ensures the second transaction sees the first's committed
  // write, so the stale update is correctly rejected.
  // We repeat the race multiple times to catch non-deterministic regressions.
  it("should never regress to a lower _stateID under concurrent writes", async () => {
    const ITERATIONS = 20;

    for (let i = 0; i < ITERATIONS; i++) {
      await testStore.beforeEach(); // reset DB between iterations

      await Match.create(match);

      const stateA: State = {
        ...state,
        ctx: { ...state.ctx, currentPlayer: "102", turn: 2 },
        _stateID: 2,
      };
      const stateB: State = {
        ...state,
        ctx: { ...state.ctx, currentPlayer: "103", turn: 3 },
        _stateID: 3,
      };

      const logA: LogEntry[] = [
        {
          ...logEntry,
          _stateID: 2,
          turn: 2,
          action: {
            ...logEntry.action,
            payload: { ...logEntry.action.payload, playerID: "102" },
          },
        },
      ];
      const logB: LogEntry[] = [
        {
          ...logEntry,
          _stateID: 3,
          turn: 3,
          action: {
            ...logEntry.action,
            payload: { ...logEntry.action.payload, playerID: "103" },
          },
        },
      ];

      await Promise.all([
        testStore.db.setState(match.id!, stateA, logA),
        testStore.db.setState(match.id!, stateB, logB),
      ]);

      const result = await testStore.db.fetch(match.id!, {
        state: true,
      });

      expect(result.state!._stateID).toBe(3);
      expect(result.state!.ctx.currentPlayer).toBe("103");
    }
  }, 30_000);
});
