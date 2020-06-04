import { Async } from "boardgame.io/internal";
import { LogEntry, Server, State, StorageAPI } from "boardgame.io";
import { Sequelize } from "sequelize";
import { Game, gameAttributes } from "./entities/game";

export interface PostGresOptions {
  database: string;
  username: string;
  password: string;
  host: string;
}
export class PostgresStore extends Async {
  private sequelize: Sequelize;

  constructor({ database, username, password, host }: PostGresOptions) {
    super();
    this.sequelize = new Sequelize(database, username, password, {
      host: host,
      dialect: "postgres",
    });

    Game.init(gameAttributes, { sequelize: this.sequelize });
  }

  /**
   * Connect.
   */
  async connect(): Promise<void> {
    // sync sequelize models with database schema
    await this.sequelize.sync();
  }

  /**
   * Create a new game.
   *
   * This might just need to call setState and setMetadata in
   * most implementations.
   *
   * However, it exists as a separate call so that the
   * implementation can provision things differently when
   * a game is created.  For example, it might stow away the
   * initial game state in a separate field for easier retrieval.
   */
  async createGame(
    id: string,
    {
      initialState,
      metadata: {
        gameName,
        players,
        setupData,
        gameover,
        nextRoomID,
        unlisted,
      },
    }: StorageAPI.CreateGameOpts
  ): Promise<void> {
    await Game.create({
      id,
      gameName,
      players,
      setupData,
      gameover,
      nextRoomID,
      unlisted,
      initialState,
      log: [],
    });
  }

  /**
   * Update the game state.
   *
   * If passed a deltalog array, setState should append its contents to the
   * existing log for this game.
   */
  async setState(
    id: string,
    state: State,
    deltalog?: LogEntry[]
  ): Promise<void> {
    await this.sequelize.transaction(async (transaction) => {
      // 1. get previous state
      const game: Game = await Game.findByPk(id, { transaction });
      const previousState = game.state;
      // 2. check if given state is newer than previous, otherwise skip
      if (!previousState || previousState._stateID < state._stateID) {
        await Game.update(
          {
            // 3. set new state
            state,
            // 4. append deltalog to log if provided
            log: [...game.log, ...(deltalog ?? [])],
          },
          { where: { id }, transaction }
        );
      }
    });
  }

  /**
   * Update the game metadata.
   */
  async setMetadata(
    id: string,
    {
      gameName,
      players,
      setupData,
      gameover,
      nextRoomID,
      unlisted,
    }: Server.GameMetadata
  ): Promise<void> {
    await Game.update(
      {
        gameName,
        players,
        setupData,
        gameover,
        nextRoomID,
        unlisted,
      },
      { where: { id } }
    );
  }

  /**
   * Fetch the game state.
   */
  async fetch<O extends StorageAPI.FetchOpts>(
    gameID: string,
    {
      state: fetchState,
      log: fetchLog,
      metadata: fetchMetadata,
      initialState: fetchInitialState,
    }: O
  ): Promise<StorageAPI.FetchResult<O>> {
    const {
      gameName,
      players,
      setupData,
      gameover,
      nextRoomID,
      unlisted,
      initialState,
      state,
      log,
    }: Game = await Game.findByPk(gameID);
    const metadata = {
      gameName,
      players,
      setupData,
      gameover,
      nextRoomID,
      unlisted,
    };
    return Object.assign(
      {},
      fetchMetadata ? { metadata } : null,
      fetchInitialState ? { initialState } : null,
      fetchState ? { state } : null,
      fetchLog ? { log } : null
    ) as StorageAPI.FetchFields;
  }

  /**
   * Remove the game state.
   */
  async wipe(id: string): Promise<void> {
    await Game.destroy({ where: { id } });
  }

  /**
   * Return all games.
   */
  async listGames(opts?: StorageAPI.ListGamesOpts): Promise<string[]> {
    const games: Game[] = await Game.findAll(
      opts?.gameName ? { where: { gameName: opts.gameName } } : {}
    );
    return games.map((game) => game.id);
  }
}
