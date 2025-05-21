const GameRollout = (function () {
  class e {
    constructor(e, t) {
      (this.gameBoard = e),
        (this.gameLogger = t),
        (this.isRolling = !1),
        (this.currentMoveIndex = -1),
        (this.rolloutSpeed = 2),
        (this.rolloutTimer = null),
        (this.currentGameIndex = 0),
        (this.gameStartIndices = [0]),
        (this.movesPerGame = []),
        (this.targetEndIndex = -1);
    }
    analyzeGameBoundaries() {
      const e = this.gameLogger.getLogs();
      if (!e || !e.boards || 0 === e.boards.length)
        return (this.gameStartIndices = [0]), void (this.movesPerGame = []);
      (this.gameStartIndices = [0]), (this.movesPerGame = []);
      const t = e.boards[0];
      for (let o = 1; o < e.boards.length; o++) {
        const r = e.boards[o];
        if (
          this.isBoardReset(r, t) &&
          (this.gameStartIndices.push(o), this.gameStartIndices.length > 1)
        ) {
          const e = this.gameStartIndices[this.gameStartIndices.length - 2];
          this.movesPerGame.push(o - e);
        }
      }
      if (this.gameStartIndices.length > 0) {
        const t = this.gameStartIndices[this.gameStartIndices.length - 1];
        this.movesPerGame.push(e.boards.length - t);
      } else this.movesPerGame.push(e.boards.length);
      console.log(
        "Game boundaries identified by board resets:",
        this.gameStartIndices
      ),
        console.log("Moves per game:", this.movesPerGame);
    }
    isBoardReset(e, t) {
      if (e.length !== t.length) return !1;
      let o = !0;
      for (let r = 0; r < e.length; r++) {
        for (let s = 0; s < e[r].length; s++)
          if (e[r][s] !== t[r][s]) {
            o = !1;
            break;
          }
        if (!o) break;
      }
      if (o) return !0;
      let r = 0,
        s = 0,
        n = 0;
      for (let t = 0; t < e.length; t++)
        for (let o = 0; o < e[t].length; o++)
          e[t][o] === GAME_CONSTANTS.BLACK
            ? r++
            : e[t][o] === GAME_CONSTANTS.WHITE
            ? s++
            : e[t][o] === GAME_CONSTANTS.EMPTY && n++;
      const a = e.length * e[0].length;
      return 2 === r && 2 === s && n >= a - 8;
    }
    getCurrentGameTurn() {
      if (this.currentMoveIndex < 0) return 0;
      let e = 0,
        t = 0;
      for (let o = this.gameStartIndices.length - 1; o >= 0; o--)
        if (this.gameStartIndices[o] <= this.currentMoveIndex) {
          (e = this.gameStartIndices[o]), (t = o);
          break;
        }
      return (this.currentGameIndex = t), this.currentMoveIndex - e + 1;
    }
    getCurrentGameTotalTurns() {
      this.gameStartIndices.length <= 1 &&
        0 === this.movesPerGame.length &&
        this.analyzeGameBoundaries();
      const e = this.currentGameIndex;
      if (e < this.movesPerGame.length) return this.movesPerGame[e];
      const t = this.gameStartIndices[e];
      return (
        (e + 1 < this.gameStartIndices.length
          ? this.gameStartIndices[e + 1]
          : this.gameLogger.getLogs().moves.length) - t
      );
    }
    getCurrentSimulationIndex() {
      return this.currentGameIndex;
    }
    start(e = -1, t = -1) {
      this.isRolling && this.stop();
      const o = this.gameLogger.getLogs();
      if (!o || !o.moves || 0 === o.moves.length) {
        if (
          this.gameLogger.previousGames &&
          this.gameLogger.previousGames.length > 0
        ) {
          console.log(
            "Using previousGames data for replay, game index:",
            this.currentGameIndex
          );
          const o = this.gameLogger.previousGames[this.currentGameIndex];
          if (
            o &&
            o.moves &&
            o.moves.length > 0 &&
            o.boards &&
            o.boards.length > 0
          ) {
            const r = o.boards[0].length;
            console.log("Game board size:", r),
              "undefined" != typeof BOARD_SIZE &&
                (console.log(
                  `Updating global BOARD_SIZE: ${BOARD_SIZE} \u2192 ${r}`
                ),
                (BOARD_SIZE = r));
            const s = document.getElementById("board");
            if (s) {
              const e = s.style.gridTemplateColumns.match(/repeat\((\d+)/),
                t = e ? parseInt(e[1]) : 0;
              t !== r &&
                (console.log(`Board UI size mismatch: ${t} \u2192 ${r}`),
                this._resetBoardUI(r));
            }
            (this.isRolling = !0),
              (this.currentMoveIndex = Math.max(
                0,
                Math.min(e, o.moves.length - 1)
              )),
              (this.targetEndIndex =
                t < 0 ? o.moves.length - 1 : Math.min(t, o.moves.length - 1));
            const n = () => {
              const e = o.boards[this.currentMoveIndex];
              if (e) {
                console.log(
                  `Current board data size: ${e.length}x${e[0].length}`
                ),
                  this.gameBoard.setBoard(e);
                const t = o.players[this.currentMoveIndex];
                if (
                  (this.gameBoard.updatePlayerIndicator(t),
                  this.currentMoveIndex >= 0)
                ) {
                  const e = o.moves[this.currentMoveIndex];
                  e &&
                    e.position &&
                    this.gameBoard.highlightCell(
                      e.position.row,
                      e.position.col
                    );
                }
              }
            };
            n();
            this._displayCurrentState;
            return (
              (this._displayCurrentState = n),
              "function" == typeof updateBoardDisplay &&
                (console.log("Forcing board display update"),
                updateBoardDisplay()),
              this._scheduleNextMove(),
              "function" == typeof updateRolloutControls &&
                updateRolloutControls(),
              !0
            );
          }
        }
        return console.warn("No game logs available for rollout."), !1;
      }
      return (
        this.analyzeGameBoundaries(),
        (this.isRolling = !0),
        (this.currentMoveIndex = Math.max(0, Math.min(e, o.moves.length - 1))),
        (this.targetEndIndex =
          t < 0 ? o.moves.length - 1 : Math.min(t, o.moves.length - 1)),
        this._displayCurrentState(),
        this._scheduleNextMove(),
        "function" == typeof updateRolloutControls && updateRolloutControls(),
        !0
      );
    }
    stop() {
      return (
        this.rolloutTimer &&
          (clearTimeout(this.rolloutTimer), (this.rolloutTimer = null)),
        (this.isRolling = !1),
        "function" == typeof updateRolloutControls && updateRolloutControls(),
        this.currentMoveIndex
      );
    }
    pause() {
      return (
        this.rolloutTimer &&
          (clearTimeout(this.rolloutTimer), (this.rolloutTimer = null)),
        (this.isRolling = !1),
        "function" == typeof updateRolloutControls && updateRolloutControls(),
        this.currentMoveIndex
      );
    }
    resume() {
      return (
        !this.isRolling &&
        this.currentMoveIndex >= 0 &&
        ((this.isRolling = !0),
        "function" == typeof updateRolloutControls && updateRolloutControls(),
        this._scheduleNextMove(),
        !0)
      );
    }
    setSpeed(e) {
      return (this.rolloutSpeed = Math.max(2, e)), this.rolloutSpeed;
    }
    jumpToMove(e) {
      const t = this.gameLogger.getLogs(),
        o = !t || !t.moves || 0 === t.moves.length;
      if (
        -1 === e &&
        ((this.currentMoveIndex = -1),
        o &&
          this.gameLogger.previousGames &&
          this.gameLogger.previousGames.length > 0)
      ) {
        const e = this.gameLogger.previousGames[this.currentGameIndex];
        if (e) {
          let t = null;
          if (
            (e.metadata &&
              e.metadata.stage &&
              (t = stages.find((t) => t.name === e.metadata.stage)),
            !t && e.boards && e.boards.length > 0)
          ) {
            const o = e.boards[0].length;
            t = stages.find((e) => e.boardSize === o);
          }
          t || (t = stages[0]);
          const o = document
            .getElementById("board")
            .style.gridTemplateColumns.match(/repeat\((\d+)/);
          if (
            ((o ? parseInt(o[1]) : 0) !== t.boardSize &&
              this._resetBoardUI(t.boardSize),
            "function" == typeof createInitialBoard)
          ) {
            const e = createInitialBoard(t);
            this.gameBoard.setBoard(e);
          } else if (
            "undefined" != typeof OthelloCore &&
            OthelloCore.createInitialBoard
          ) {
            const e = OthelloCore.createInitialBoard(t);
            this.gameBoard.setBoard(e);
          }
          return (
            "function" == typeof updateRolloutControls &&
              updateRolloutControls(),
            !0
          );
        }
      }
      let r = !1;
      if (o) {
        if (
          this.gameLogger.previousGames &&
          this.gameLogger.previousGames.length > 0
        ) {
          const t = this.gameLogger.previousGames[this.currentGameIndex];
          if (t && t.moves && e >= 0 && e < t.moves.length) {
            this.currentMoveIndex = e;
            const o = t.boards[0].length,
              s = document.getElementById("board");
            if (s) {
              const e = s.style.gridTemplateColumns.match(/repeat\((\d+)/);
              (e ? parseInt(e[1]) : 0) !== o && this._resetBoardUI(o);
            }
            const n = t.boards[this.currentMoveIndex];
            if (n) {
              this.gameBoard.setBoard(n);
              const e = t.players[this.currentMoveIndex];
              if (
                (this.gameBoard.updatePlayerIndicator(e),
                this.currentMoveIndex >= 0)
              ) {
                const e = t.moves[this.currentMoveIndex];
                e &&
                  e.position &&
                  this.gameBoard.highlightCell(e.position.row, e.position.col);
              }
            }
            r = !0;
          }
        }
      } else
        !t || !t.moves || e < 0 || e >= t.moves.length
          ? (r = !1)
          : ((this.currentMoveIndex = e),
            this._displayCurrentState(),
            (r = !0));
      return (
        "function" == typeof updateRolloutControls && updateRolloutControls(), r
      );
    }
    next() {
      console.trace("next() called");
      const e = this.gameLogger.getLogs();
      let t = !1;
      if (!e || !e.moves || 0 === e.moves.length) {
        if (
          this.gameLogger.previousGames &&
          this.gameLogger.previousGames.length > 0
        ) {
          const e = this.gameLogger.previousGames[this.currentGameIndex];
          if (e && e.moves && this.currentMoveIndex < e.moves.length - 1) {
            this.currentMoveIndex++;
            const o = e.boards[this.currentMoveIndex];
            if (o) {
              this.gameBoard.setBoard(o);
              const t = e.players[this.currentMoveIndex];
              if (
                (this.gameBoard.updatePlayerIndicator(t),
                this.currentMoveIndex >= 0)
              ) {
                const t = e.moves[this.currentMoveIndex];
                t &&
                  t.position &&
                  this.gameBoard.highlightCell(t.position.row, t.position.col);
              }
            }
            t = !0;
          }
        }
      } else
        this.currentMoveIndex < e.moves.length - 1 &&
          (this.currentMoveIndex++, this._displayCurrentState(), (t = !0));
      return t;
    }
    previous() {
      const e = this.gameLogger.getLogs();
      let t = !1;
      if (!e || !e.moves || 0 === e.moves.length) {
        if (
          this.gameLogger.previousGames &&
          this.gameLogger.previousGames.length > 0
        ) {
          const e = this.gameLogger.previousGames[this.currentGameIndex];
          if (e && e.moves && this.currentMoveIndex > 0) {
            this.currentMoveIndex--;
            const o = e.boards[this.currentMoveIndex];
            if (o) {
              this.gameBoard.setBoard(o);
              const t = e.players[this.currentMoveIndex];
              if (
                (this.gameBoard.updatePlayerIndicator(t),
                this.currentMoveIndex >= 0)
              ) {
                const t = e.moves[this.currentMoveIndex];
                t &&
                  t.position &&
                  this.gameBoard.highlightCell(t.position.row, t.position.col);
              }
            }
            t = !0;
          }
        }
      } else
        this.currentMoveIndex > 0 &&
          (this.currentMoveIndex--, this._displayCurrentState(), (t = !0));
      return t;
    }
    _resetBoardUI(e) {
      const t = document.getElementById("board");
      if (!t) return void console.error("Board element not found");
      console.log(`Resetting board UI to ${e}x${e}`);
      const o = 50;
      (t.innerHTML = ""),
        (t.style.gridTemplateColumns = `repeat(${e}, ${o}px)`),
        (t.style.gridTemplateRows = `repeat(${e}, ${o}px)`);
      const r = e * o + 1 * (e - 1) + 8;
      (t.style.width = `${r}px`), (t.style.height = `${r}px`);
      for (let r = 0; r < e; r++)
        for (let s = 0; s < e; s++) {
          const e = document.createElement("div");
          (e.className = "cell"),
            (e.dataset.row = r),
            (e.dataset.col = s),
            (e.style.width = `${o}px`),
            (e.style.height = `${o}px`),
            t.appendChild(e);
        }
      "function" == typeof updateRolloutControls && updateRolloutControls();
    }
    _displayCurrentState() {
      const e = this.gameLogger.getBoardAtMove(this.currentMoveIndex);
      if (e) {
        this.gameBoard.setBoard(e);
        const t = this.gameLogger.getPlayerAtMove(this.currentMoveIndex);
        if (
          (this.gameBoard.updatePlayerIndicator(t), this.currentMoveIndex >= 0)
        ) {
          const e = this.gameLogger.getLogs().moves[this.currentMoveIndex];
          e &&
            e.position &&
            this.gameBoard.highlightCell(e.position.row, e.position.col);
        }
      }
    }
    _scheduleNextMove() {
      this.isRolling &&
        (this.currentMoveIndex < this.targetEndIndex
          ? (this.rolloutTimer = setTimeout(() => {
              this.next();
              const e = document.getElementById("rollout-moves");
              e && (e.value = this.currentMoveIndex), this._scheduleNextMove();
            }, this.rolloutSpeed))
          : ((this.isRolling = !1),
            "function" == typeof updateRolloutControls &&
              updateRolloutControls()));
    }
    nextGame() {
      if (
        this.gameLogger.previousGames &&
        this.currentGameIndex < this.gameLogger.previousGames.length - 1
      ) {
        this.currentGameIndex++, (this.currentMoveIndex = -1);
        const e = this.gameLogger.previousGames[this.currentGameIndex];
        if (!e || !e.boards || 0 === e.boards.length)
          return console.error("Invalid game data"), !1;
        const t = e.boards[0].length;
        let o = null;
        e.metadata &&
          e.metadata.stage &&
          (o = stages.find((t) => t.name === e.metadata.stage)),
          o || (o = stages.find((e) => e.boardSize === t) || stages[0]),
          "undefined" != typeof BOARD_SIZE && (BOARD_SIZE = t),
          "undefined" != typeof board &&
            (board = Array(t)
              .fill()
              .map(() => Array(t).fill(GAME_CONSTANTS.EMPTY))),
          this._resetBoardUI(t),
          "undefined" != typeof currentStage && (currentStage = o),
          "undefined" != typeof gameRunning && (gameRunning = !1),
          "undefined" != typeof gameOver && (gameOver = !0);
        const r = document.getElementById("start-btn");
        r && (r.disabled = !1);
        const s = document.getElementById("status");
        s &&
          ((s.textContent = "Ready to start."),
          (s.style.backgroundColor = "#4CAF50")),
          "function" == typeof resetGame && resetGame(o, !0),
          this.gameBoard.setBoard(
            "undefined" != typeof board
              ? board
              : Array(t)
                  .fill()
                  .map(() => Array(t).fill(GAME_CONSTANTS.EMPTY))
          );
        const n = document.getElementById("log-input");
        return (
          n &&
            (e.logText
              ? (n.value = e.logText)
              : e.metadata &&
                (n.value = `Game ${this.currentGameIndex + 1}: ${
                  e.metadata.blackStrategy
                }(B) vs ${e.metadata.whiteStrategy}(W) on ${
                  e.metadata.stage
                }`)),
          "function" == typeof updateRolloutControls && updateRolloutControls(),
          !0
        );
      }
      return !1;
    }
    createBasicBoard(e) {
      const t = e.boardSize || 8,
        o = Array(t)
          .fill()
          .map(() => Array(t).fill(0));
      return (
        e.initialPlayer1 &&
          e.initialPlayer1.forEach((e) => {
            e.r >= 0 && e.r < t && e.c >= 0 && e.c < t && (o[e.r][e.c] = 1);
          }),
        e.initialPlayer2 &&
          e.initialPlayer2.forEach((e) => {
            e.r >= 0 && e.r < t && e.c >= 0 && e.c < t && (o[e.r][e.c] = 2);
          }),
        e.initialBlocked &&
          e.initialBlocked.forEach((e) => {
            e.r >= 0 && e.r < t && e.c >= 0 && e.c < t && (o[e.r][e.c] = 3);
          }),
        o
      );
    }
    previousGame() {
      if (this.gameLogger.previousGames && this.currentGameIndex > 0) {
        this.currentGameIndex--, (this.currentMoveIndex = -1);
        const e = this.gameLogger.previousGames[this.currentGameIndex];
        if (!e || !e.boards || 0 === e.boards.length)
          return console.error("Invalid game data"), !1;
        const t = e.boards[0].length;
        let o = null;
        e.metadata &&
          e.metadata.stage &&
          (o = stages.find((t) => t.name === e.metadata.stage)),
          o || (o = stages.find((e) => e.boardSize === t) || stages[0]),
          "undefined" != typeof BOARD_SIZE && (BOARD_SIZE = t),
          "undefined" != typeof board &&
            (board = Array(t)
              .fill()
              .map(() => Array(t).fill(GAME_CONSTANTS.EMPTY))),
          this._resetBoardUI(t),
          "undefined" != typeof currentStage && (currentStage = o),
          "undefined" != typeof gameRunning && (gameRunning = !1),
          "undefined" != typeof gameOver && (gameOver = !0);
        const r = document.getElementById("start-btn");
        r && (r.disabled = !1);
        const s = document.getElementById("status");
        s &&
          ((s.textContent = "Ready to start."),
          (s.style.backgroundColor = "#4CAF50")),
          "function" == typeof resetGame && resetGame(o, !0),
          this.gameBoard.setBoard(
            "undefined" != typeof board
              ? board
              : Array(t)
                  .fill()
                  .map(() => Array(t).fill(GAME_CONSTANTS.EMPTY))
          );
        const n = document.getElementById("log-input");
        return (
          n &&
            (e.logText
              ? (n.value = e.logText)
              : e.metadata &&
                (n.value = `Game ${this.currentGameIndex + 1}: ${
                  e.metadata.blackStrategy
                }(B) vs ${e.metadata.whiteStrategy}(W) on ${
                  e.metadata.stage
                }`)),
          "function" == typeof updateRolloutControls && updateRolloutControls(),
          !0
        );
      }
      return !1;
    }
    getCurrentGameInfo() {
      return {
        gameIndex: this.currentGameIndex,
        totalGames: this.gameStartIndices.length,
        currentTurn: this.getCurrentGameTurn(),
        totalTurns: this.getCurrentGameTotalTurns(),
      };
    }
  }
  return e;
})();
"undefined" != typeof module &&
  module.exports &&
  (module.exports = GameRollout);
