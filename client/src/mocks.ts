import * as C4Server from "./server";

export class MockServer implements C4Server.ServerInterface {
  getGames(): Promise<C4Server.GameSummary[]> {
    throw new Error("Method not implemented.");
  }
  getGame(gameId: string): Promise<C4Server.GameAndTurns> {
    throw new Error("Method not implemented.");
  }
  getPlayers(): Promise<C4Server.Player[]> {
    throw new Error("Method not implemented.");
  }
  getPlayer(pId: string): Promise<C4Server.Player> {
    throw new Error("Method not implemented.");
  }
  getPlayersForGame(gameId: string): Promise<C4Server.GamePlayer[]> {
    throw new Error("Method not implemented.");
  }
  createPlayer(player: C4Server.NewPlayer): Promise<C4Server.Player> {
    throw new Error("Method not implemented.");
  }
  createGame(dimensions: { height: string; width: string; }): Promise<C4Server.GameData> {
    throw new Error("Method not implemented.");
  }
  startGame(gameId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  dropPiece(gameId: string, playerId: string, col: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
  addPlayersToGame(gameId: string, players: string[]): Promise<C4Server.AddPlayerToGameResponseData> {
    throw new Error("Method not implemented.");
  }
  deletePlayer(playerId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  removePlayerFromGame(gameId: string, playerId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  deleteGame(gameId: string): Promise<void> {
    throw new Error("Method not implemented.");
  }

}