import { createMock } from "@golevelup/ts-jest";
import { Match } from "../../src/entities/match";
import { logEntry } from "./log-entry.mock";
import { state } from "./state.mock";

export const match = createMock<Match>({
  id: "test-id",
  initialState: state,
  state: state,
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
  log: [logEntry],
});
