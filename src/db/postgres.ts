import { Async } from "boardgame.io/internal";
import { LogEntry, Server, State, StorageAPI } from "boardgame.io";
import { Sequelize, Options } from "sequelize";
import { Game, gameAttributes } from "./entities/game";

export class PostgresStore extends Async {
  private sequelize: Sequelize;

  constructor(uriOrOptions: Options | string) {
    super();
    if (typeof uriOrOptions === "string") {
      this.sequelize = new Sequelize(uriOrOptions);
    } else {
      this.sequelize = new Sequelize({ dialect: "postgres", ...uriOrOptions });
    }

    Game.init(gameAttributes, { sequelize: this.sequelize });

    this.sequelize.authenticate();
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
      state: initialState,
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
      const game: Game | undefined = await Game.findByPk(id, { transaction });
      const previousState = game?.state;
      // 2. check if given state is newer than previous, otherwise skip
      if (!previousState || previousState._stateID < state._stateID) {
        await Game.upsert(
          {
            id,
            // 3. set new state
            state,
            // 4. append deltalog to log if provided
            log: [...(game?.log ?? []), ...(deltalog ?? [])],
          },
          { transaction }
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
    await Game.upsert({
      id,
      gameName,
      players,
      setupData,
      gameover,
      nextRoomID,
      unlisted,
    });
  }

  /**
   * Fetch the game state.
   */
  async fetch<O extends StorageAPI.FetchOpts>(
    gameID: string,
    { state, log, metadata, initialState }: O
  ): Promise<StorageAPI.FetchResult<O>> {
    const result = {} as StorageAPI.FetchFields;
    const game: Game = await Game.findByPk(gameID);

    if (!game) {
      return result;
    }

    if (metadata) {
      result.metadata = {
        gameName: game.gameName,
        players: game.players,
        setupData: game.setupData,
        gameover: game.gameover,
        nextRoomID: game.nextRoomID,
        unlisted: game.unlisted,
      };
    }
    if (initialState) {
      result.initialState = game.initialState;
    }
    if (state) {
      result.state = game.state!;
    }
    if (log) {
      result.log = game.log;
    }

    return result as StorageAPI.FetchResult<O>;
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
    const games: Game[] = await Game.findAll({
      attributes: ["id"],
      where: opts?.gameName ? { gameName: opts.gameName } : undefined,
    });
    return games.map((game) => game.id);
  }
}
