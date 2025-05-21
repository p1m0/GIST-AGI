const GameLogger = (function () {
  class e {
    constructor() {
      (this.moves = []),
        (this.boardStates = []),
        (this.currentPlayer = []),
        (this.capturedCounts = []),
        (this.gameResults = []),
        (this.previousGames = []);
    }
    logMove(e, t, s, o = 0) {
      this.moves.push({ player: e, position: t }),
        this.boardStates.push(JSON.parse(JSON.stringify(s))),
        this.currentPlayer.push(e),
        this.capturedCounts.push(o);
    }
    getLogs() {
      if (this.moves && this.moves.length > 0)
        return {
          moves: this.moves,
          boards: this.boardStates,
          players: this.currentPlayer,
          capturedCounts: this.capturedCounts,
        };
      if (this.previousGames && this.previousGames.length > 0) {
        console.log(
          "GameLogger.getLogs: Using data from the most recent previous game"
        );
        const e = this.previousGames[this.previousGames.length - 1];
        return {
          moves: e.moves || [],
          boards: e.boards || [],
          players: e.players || [],
          capturedCounts: e.capturedCounts || [],
        };
      }
      return { moves: [], boards: [], players: [], capturedCounts: [] };
    }
    saveGameWithLog(e, t, s, o, a, r) {
      (s = s || "Black"), (o = o || "White");
      const i = a && a.name ? a.name : "Unknown Stage",
        l = r.join("\n");
      this.previousGames.push({
        moves: [...this.moves],
        boards: [...this.boardStates],
        players: [...this.currentPlayer],
        capturedCounts: [...this.capturedCounts],
        logText: l,
        metadata: {
          blackStrategy: s,
          whiteStrategy: o,
          stage: i,
          blackScore: e,
          whiteScore: t,
          date: new Date().toISOString(),
        },
      }),
        console.log(`Game saved with fixed log: ${s}(B) vs ${o}(W) on ${i}`);
      const n = {
        date: new Date().toISOString(),
        blackScore: e,
        whiteScore: t,
        blackStrategy: s,
        whiteStrategy: o,
        stage: i,
        winner: e > t ? GAME_CONSTANTS.BLACK : t > e ? GAME_CONSTANTS.WHITE : 0,
        totalMoves: this.moves.length,
      };
      return (
        this.gameResults.push(n), this.reset(), this.saveToLocalStorage(), n
      );
    }
    saveToLocalStorage() {
      try {
        sessionStorage.setItem(
          "othelloGameResults",
          JSON.stringify(this.gameResults)
        ),
          sessionStorage.setItem(
            "othelloPreviousGames",
            JSON.stringify(this.previousGames)
          ),
          console.log(
            `Game data saved: ${this.previousGames.length} games, ${this.gameResults.length} results`
          );
      } catch (e) {
        console.error("Failed to save game data:", e);
      }
    }
    loadFromLocalStorage() {
      try {
        const t = localStorage.getItem("othelloGameResults");
        t && (this.gameResults = JSON.parse(t));
        const s = localStorage.getItem("othelloPreviousGames");
        s && (this.previousGames = JSON.parse(s));
      } catch (e) {
        console.error("Failed to load game data:", e);
      }
    }
    getGameResults(e = null) {
      return null === e ? [...this.gameResults] : this.gameResults.slice(-e);
    }
    getPreviousGames(e = null) {
      return null === e
        ? [...this.previousGames]
        : this.previousGames.slice(-e);
    }
    reset() {
      (this.moves = []),
        (this.boardStates = []),
        (this.currentPlayer = []),
        (this.capturedCounts = []),
        console.log("GameLogger reset: Current game data cleared");
    }
    getBoardAtMove(e) {
      return e >= 0 && e < this.boardStates.length ? this.boardStates[e] : null;
    }
    getPlayerAtMove(e) {
      return e >= 0 && e < this.currentPlayer.length
        ? this.currentPlayer[e]
        : null;
    }
    generateHumanReadableLog(e = {}, t = "Unknown Stage") {
      if (!this.moves || 0 === this.moves.length)
        return "No game log data available.";
      const s = e.black || "Black",
        o = e.white || "White";
      let a = `Game started: ${s}(B) vs ${o}(W) on Stage: ${t}\n`;
      const r = "abcdefghijklmnopqrstuvwxyz";
      if (
        (this.moves.forEach((e) => {
          if (e && e.player && e.position) {
            const t = e.player === GAME_CONSTANTS.BLACK ? s : o,
              i = e.player === GAME_CONSTANTS.BLACK ? "(B)" : "(W)";
            if (
              "object" == typeof e.position &&
              "number" == typeof e.position.row &&
              "number" == typeof e.position.col
            ) {
              const s = r[e.position.col],
                o = e.position.row + 1;
              a += `${t}${i}: ${s}${o}\n`;
            }
          }
        }),
        this.boardStates && this.boardStates.length > 0)
      ) {
        const e = this.boardStates[this.boardStates.length - 1];
        let t = 0,
          s = 0;
        for (let o = 0; o < e.length; o++)
          for (let a = 0; a < e[o].length; a++)
            e[o][a] === GAME_CONSTANTS.BLACK
              ? t++
              : e[o][a] === GAME_CONSTANTS.WHITE && s++;
        (a += `Game over: Final score ${t}-${s}\n`),
          (a += t > s ? "Black wins!" : s > t ? "White wins!" : "It's a tie!");
      }
      return a;
    }
  }
  const t = new e();
  return {
    logMove: (e, s, o, a) => t.logMove(e, s, o, a),
    saveGameWithLog: (e, s, o, a, r, i) => t.saveGameWithLog(e, s, o, a, r, i),
    reset: () => t.reset(),
    getLogs: () => t.getLogs(),
    getBoardAtMove: (e) => t.getBoardAtMove(e),
    getPlayerAtMove: (e) => t.getPlayerAtMove(e),
    getGameResults: (e) => t.getGameResults(e),
    getPreviousGames: (e) => t.getPreviousGames(e),
    generateHumanReadableLog: (e, s) => t.generateHumanReadableLog(e, s),
    saveToLocalStorage: () => t.saveToLocalStorage(),
    loadFromLocalStorage: () => t.loadFromLocalStorage(),
    get previousGames() {
      return t.previousGames;
    },
    get gameResults() {
      return t.gameResults;
    },
  };
})();
"undefined" != typeof module && module.exports && (module.exports = GameLogger);
