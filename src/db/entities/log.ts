import { Model, DataTypes, ModelAttributes } from "sequelize/types";

export class Log extends Model {}

export const LogAttributes: ModelAttributes = {
  id: {
    type: DataTypes.STRING,
    autoIncrement: true,
    primaryKey: true,
  },
  gameID: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  action: {
    type: DataTypes.JSON,
  },
  _stateID: {
    type: DataTypes.INTEGER,
  },
  turn: {
    type: DataTypes.INTEGER,
  },
  phase: {
    type: DataTypes.STRING,
  },
  redact: {
    type: DataTypes.BOOLEAN,
  },
  automatic: {
    type: DataTypes.BOOLEAN,
  },
};
