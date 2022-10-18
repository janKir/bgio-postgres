import { State } from "boardgame.io";

export const state: State = {
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
};
