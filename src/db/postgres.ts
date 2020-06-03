import { Async } from "boardgame.io/internal";
import { LogEntry, Server, State, StorageAPI } from "boardgame.io";

export class PostgresStore extends Async {
  /**
   * Connect.
   */
  connect(): Promise<void> {
    // TODO: implement
    return Promise.reject();
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
  createGame(gameID: string, opts: StorageAPI.CreateGameOpts): Promise<void> {
    // TODO: implement
    return Promise.reject();
  }

  /**
   * Update the game state.
   *
   * If passed a deltalog array, setState should append its contents to the
   * existing log for this game.
   */
  setState(gameID: string, state: State, deltalog?: LogEntry[]): Promise<void> {
    // TODO: implement
    return Promise.reject();
  }

  /**
   * Update the game metadata.
   */
  setMetadata(gameID: string, metadata: Server.GameMetadata): Promise<void> {
    // TODO: implement
    return Promise.reject();
  }

  /**
   * Fetch the game state.
   */
  fetch<O extends StorageAPI.FetchOpts>(
    gameID: string,
    opts: O
  ): Promise<StorageAPI.FetchResult<O>> {
    // TODO: implement
    return Promise.reject();
  }

  /**
   * Remove the game state.
   */
  wipe(gameID: string): Promise<void> {
    // TODO: implement
    return Promise.reject();
  }

  /**
   * Return all games.
   */
  listGames(opts?: StorageAPI.ListGamesOpts): Promise<string[]> {
    // TODO: implement
    return Promise.reject();
  }
}
