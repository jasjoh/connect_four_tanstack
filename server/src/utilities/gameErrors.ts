class GameError extends Error {
  constructor (message: string) {
    super(message);
  }
}

class TooFewPlayers extends GameError {
  constructor (message: string) {
    super(message);
    this.name = 'TooFewPlayers'
  }
}

class PlayerAlreadyExists extends GameError {
  constructor (message: string) {
    super(message);
    this.name = 'PlayerAlreadyExists'
  }
}

class InvalidGameState extends GameError {
  constructor (message: string) {
    super(message);
    this.name = 'InvalidGameState'
  }
}

class NotCurrentPlayer extends GameError {
  constructor (message: string = 'Specified player is not current player.') {
    super(message);
    this.name = 'NotCurrentPlayer'
  }
}

class InvalidPiecePlacement extends GameError {
  constructor (message: string = 'Invalid column or column is full.') {
    super(message);
    this.name = 'NotCurrentPlayer'
  }
}

export {
  TooFewPlayers, PlayerAlreadyExists,
  InvalidGameState, InvalidPiecePlacement, NotCurrentPlayer
 };