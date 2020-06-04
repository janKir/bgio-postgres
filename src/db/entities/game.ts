import { DataTypes, Model, ModelAttributes } from "sequelize/types";
import { State, LogEntry } from "boardgame.io";

export class Game extends Model {
  public id!: string;
  // metadata
  public gameName!: string;
  public players!: unknown;
  public setupData!: unknown | undefined;
  public gameover!: unknown | undefined;
  public nextRoomID!: string | undefined;
  public unlisted!: boolean | undefined;
  // state
  public state!: State | undefined;
  public initialState!: State;
  // log
  public log!: LogEntry[];
}

export const gameAttributes: ModelAttributes = {
  id: {
    type: DataTypes.STRING,
    unique: true,
    primaryKey: true,
  },
  // metadata
  gameName: {
    type: DataTypes.STRING,
  },
  players: {
    type: DataTypes.JSON,
  },
  setupData: {
    type: DataTypes.JSON,
  },
  gameover: {
    type: DataTypes.JSON,
  },
  nextRoomID: {
    type: DataTypes.STRING,
  },
  unlisted: {
    type: DataTypes.BOOLEAN,
  },
  // State
  state: {
    type: DataTypes.JSON,
  },
  initialState: {
    type: DataTypes.JSON,
  },
  // Log
  log: {
    type: DataTypes.JSON,
  },
};
