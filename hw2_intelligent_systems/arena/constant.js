const GAME_CONSTANTS = {
  EMPTY: 0,
  BLACK: 1,
  WHITE: 2,
  BLOCKED: 3,
  MAX_AI_TIME_PER_GAME: 1e4,
  DEFAULT_CELL_SIZE: 50,
  BOARD_GAP: 1,
  BOARD_PADDING: 4,
};
"undefined" != typeof module &&
  module.exports &&
  (module.exports = GAME_CONSTANTS);
