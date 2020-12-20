import { LogEntry, Server, State, StorageAPI } from "boardgame.io";
import { Async } from "boardgame.io/internal";
import { Sequelize, Options, Op } from "sequelize";
import { Match, matchAttributes } from "./entities/match";

export class PostgresStore extends Async {
  private _sequelize: Sequelize;

  constructor(uri: string, options?: Options);
  constructor(options: Options);
  constructor(uriOrOptions: Options | string, extraOptions?: Options) {
    super();
    if (typeof uriOrOptions === "string") {
      this._sequelize = new Sequelize(uriOrOptions, extraOptions || {});
    } else {
      this._sequelize = new Sequelize({ dialect: "postgres", ...uriOrOptions });
    }

    Match.init(matchAttributes, {
      sequelize: this._sequelize,
      tableName: "Games",
    });

    this._sequelize.authenticate();
  }

  get sequelize(): Sequelize {
    return this._sequelize;
  }

  /**
   * Connect.
   */
  async connect(): Promise<void> {
    // sync sequelize models with database schema
    await this._sequelize.sync();
  }

  /**
   * Create a new match.
   *
   * This might just need to call setState and setMetadata in
   * most implementations.
   *
   * However, it exists as a separate call so that the
   * implementation can provision things differently when
   * a match is created.  For example, it might stow away the
   * initial match state in a separate field for easier retrieval.
   */
  async createMatch(
    id: string,
    {
      initialState,
      metadata: {
        gameName,
        players,
        setupData,
        gameover,
        nextMatchID,
        unlisted,
      },
    }: StorageAPI.CreateMatchOpts
  ): Promise<void> {
    await Match.create({
      id,
      gameName,
      players,
      setupData,
      gameover,
      nextMatchID,
      unlisted,
      initialState,
      state: initialState,
      log: [],
    });
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
   *
   * @deprecated Use createMatch instead, if implemented
   */
  createGame(matchID: string, opts: StorageAPI.CreateGameOpts): Promise<void> {
    return this.createMatch(matchID, opts);
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
    await this._sequelize.transaction(async (transaction) => {
      // 1. get previous state
      const match: Match | null = await Match.findByPk(id, {
        transaction,
      });
      const previousState = match?.state;
      // 2. check if given state is newer than previous, otherwise skip
      if (!previousState || previousState._stateID < state._stateID) {
        await Match.upsert(
          {
            id,
            // 3. set new state
            state,
            // 4. append deltalog to log if provided
            log: [...(match?.log ?? []), ...(deltalog ?? [])],
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
      nextMatchID,
      unlisted,
      createdAt,
      updatedAt,
    }: Server.MatchData
  ): Promise<void> {
    await Match.upsert({
      id,
      gameName,
      players,
      setupData,
      gameover,
      nextMatchID,
      unlisted,
      createdAt: createdAt ? new Date(createdAt) : undefined,
      updatedAt: updatedAt ? new Date(updatedAt) : undefined,
    });
  }

  /**
   * Fetch the game state.
   */
  async fetch<O extends StorageAPI.FetchOpts>(
    matchID: string,
    { state, log, metadata, initialState }: O
  ): Promise<StorageAPI.FetchResult<O>> {
    const result = {} as StorageAPI.FetchFields;
    const match: Match | null = await Match.findByPk(matchID);

    if (!match) {
      return result;
    }

    if (metadata) {
      result.metadata = {
        gameName: match.gameName,
        players: match.players || [],
        setupData: match.setupData,
        gameover: match.gameover,
        nextMatchID: match.nextRoomID,
        unlisted: match.unlisted,
        createdAt: match.createdAt.getTime(),
        updatedAt: match.updatedAt.getTime(),
      };
    }
    if (initialState) {
      result.initialState = match.initialState;
    }
    if (state) {
      result.state = match.state!;
    }
    if (log) {
      result.log = match.log;
    }

    return result as StorageAPI.FetchResult<O>;
  }

  /**
   * Remove the game state.
   */
  async wipe(id: string): Promise<void> {
    await Match.destroy({ where: { id } });
  }

  /**
   * Return all matches.
   */
  async listMatches(opts?: StorageAPI.ListMatchesOpts): Promise<string[]> {
    const where = {
      [Op.and]: [
        opts?.gameName && { gameName: opts.gameName },
        opts?.where?.isGameover === true && { gameover: { [Op.ne]: null } },
        opts?.where?.isGameover === false && { gameover: { [Op.is]: null } },
        opts?.where?.updatedBefore !== undefined && {
          updatedAt: { [Op.lt]: opts.where.updatedBefore },
        },
        opts?.where?.updatedAfter !== undefined && {
          updatedAt: { [Op.gt]: opts.where.updatedAfter },
        },
      ],
    };

    const matches: Match[] = await Match.findAll({
      attributes: ["id"],
      where,
    });
    return matches.map((match) => match.id);
  }

  /**
   * Return all games.
   *
   * @deprecated Use listMatches instead, if implemented
   */
  listGames(opts?: StorageAPI.ListGamesOpts): Promise<string[]> {
    return this.listMatches(opts);
  }
}
