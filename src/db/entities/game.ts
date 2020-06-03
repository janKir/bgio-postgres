import { DataTypes, Model, ModelAttributes } from "sequelize/types";

export class Game extends Model {}

export const gameAttributes: ModelAttributes = {
  id: {
    type: DataTypes.STRING,
    unique: true,
    primaryKey: true,
  },
  // metadata
  name: {
    type: DataTypes.STRING,
  },
  // TODO: maybe create player table
  players: {
    type: DataTypes.JSON,
  },
  setupData: {
    type: DataTypes.JSON,
  },
  gameOver: {
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
};
