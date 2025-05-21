const OthelloCore = (function () {
  function e(e, t) {
    return e >= 0 && e < S && t >= 0 && t < S;
  }
  function t(t) {
    t || (t = stages[0]);
    const o = t.boardSize || 8,
      l = Array(o)
        .fill()
        .map(() => Array(o).fill(GAME_CONSTANTS.EMPTY));
    if (t)
      (t.initialBlocked || []).forEach((t) => {
        e(t.r, t.c) && (l[t.r][t.c] = GAME_CONSTANTS.BLOCKED);
      }),
        (t.initialPlayer1 || []).forEach((t) => {
          e(t.r, t.c) &&
            l[t.r][t.c] === GAME_CONSTANTS.EMPTY &&
            (l[t.r][t.c] = GAME_CONSTANTS.BLACK);
        }),
        (t.initialPlayer2 || []).forEach((t) => {
          e(t.r, t.c) &&
            l[t.r][t.c] === GAME_CONSTANTS.EMPTY &&
            (l[t.r][t.c] = GAME_CONSTANTS.WHITE);
        });
    else {
      const e = Math.floor(o / 2);
      (l[e - 1][e - 1] = GAME_CONSTANTS.WHITE),
        (l[e - 1][e] = GAME_CONSTANTS.BLACK),
        (l[e][e - 1] = GAME_CONSTANTS.BLACK),
        (l[e][e] = GAME_CONSTANTS.WHITE);
    }
    return l;
  }
  function o(e, o = !1) {
    console.log(`Init board. Stage:${e ? e.name : "Default"}, Preview:${o}`),
      (O = e),
      (S = e ? e.boardSize : 8),
      (T = t(e)),
      "undefined" != typeof OthelloUI &&
        OthelloUI.updateBoardDisplay &&
        OthelloUI.updateBoardDisplay(T),
      o
        ? ((u = !0),
          "undefined" != typeof OthelloUI &&
            OthelloUI.updateUIForPreview &&
            OthelloUI.updateUIForPreview())
        : ((N = GAME_CONSTANTS.BLACK),
          (u = !1),
          (f = !1),
          "undefined" != typeof OthelloUI &&
            (OthelloUI.updateStatus && OthelloUI.updateStatus(),
            OthelloUI.updateGameLog && OthelloUI.updateGameLog()));
  }
  function l(t, o, l, r = T) {
    if (!e(t, o) || r[t][o] !== GAME_CONSTANTS.EMPTY) return !1;
    const n =
        l === GAME_CONSTANTS.BLACK
          ? GAME_CONSTANTS.WHITE
          : GAME_CONSTANTS.BLACK,
      a = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ],
      i = (O || stages[0]).ignoreOcclusion || !1;
    for (const [A, T] of a) {
      let a = t + A,
        S = o + T,
        O = !1,
        N = !1;
      for (; e(a, S); ) {
        if (r[a][S] === n) O = !0;
        else if (r[a][S] === GAME_CONSTANTS.BLOCKED) {
          if (((N = !0), !i)) break;
        } else {
          if (r[a][S] === GAME_CONSTANTS.EMPTY) break;
          if (r[a][S] === l) {
            if (O && (!N || i)) return !0;
            break;
          }
        }
        (a += A), (S += T);
      }
    }
    return !1;
  }
  function r(e, t = T) {
    const o = [],
      r = t.length;
    for (let n = 0; n < r; n++)
      for (let a = 0; a < r; a++) l(n, a, e, t) && o.push({ row: n, col: a });
    return o;
  }
  function n(t, o, l) {
    if (!e(t, o) || T[t][o] !== GAME_CONSTANTS.EMPTY) return !1;
    (T[t][o] = l),
      "undefined" != typeof OthelloUI &&
        OthelloUI.logMove &&
        OthelloUI.logMove(t, o, l);
    const r =
        l === GAME_CONSTANTS.BLACK
          ? GAME_CONSTANTS.WHITE
          : GAME_CONSTANTS.BLACK,
      n = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1],
      ],
      a = (O || stages[0]).ignoreOcclusion || !1,
      i = [];
    let A = !1;
    for (const [S, O] of n) {
      let n = t + S,
        N = o + O;
      const f = [];
      let u = !1,
        s = !1;
      for (; e(n, N); ) {
        if (T[n][N] === r) f.push([n, N]), (s = !0);
        else if (T[n][N] === GAME_CONSTANTS.BLOCKED) {
          if (((u = !0), !a)) break;
        } else {
          if (T[n][N] === GAME_CONSTANTS.EMPTY) break;
          if (T[n][N] === l) {
            if (s && f.length > 0 && (!u || a)) {
              A = !0;
              for (const [e, t] of f) (T[e][t] = l), i.push([e, t]);
            }
            break;
          }
        }
        (n += S), (N += O);
      }
    }
    return (
      "undefined" != typeof GameLogger &&
        GameLogger.logMove &&
        GameLogger.logMove(
          l,
          { row: t, col: o },
          Array.from(T, (e) => [...e]),
          i.length
        ),
      "undefined" != typeof OthelloUI &&
        OthelloUI.updateBoardDisplay &&
        OthelloUI.updateBoardDisplay(T),
      A
    );
  }
  function a() {
    if (!((O || stages[0]).fewerPiecesContinue || !1))
      return N === GAME_CONSTANTS.BLACK
        ? GAME_CONSTANTS.WHITE
        : GAME_CONSTANTS.BLACK;
    const e = i();
    return e.black < e.white
      ? GAME_CONSTANTS.BLACK
      : e.white < e.black
      ? GAME_CONSTANTS.WHITE
      : N === GAME_CONSTANTS.BLACK
      ? GAME_CONSTANTS.WHITE
      : GAME_CONSTANTS.BLACK;
  }
  function i(e = T) {
    let t = 0,
      o = 0;
    for (let l = 0; l < e.length; l++)
      for (let r = 0; r < e[l].length; r++)
        e[l][r] === GAME_CONSTANTS.BLACK
          ? t++
          : e[l][r] === GAME_CONSTANTS.WHITE && o++;
    return { black: t, white: o };
  }
  function A(e = null) {
    if (!f) return;
    (f = !1), (u = !0);
    const t = i();
    if (
      (null === e &&
        (t.black > t.white
          ? (e = GAME_CONSTANTS.BLACK)
          : t.white > t.black && (e = GAME_CONSTANTS.WHITE)),
      "undefined" != typeof OthelloUI &&
        (OthelloUI.updateStatus && OthelloUI.updateStatus(e),
        OthelloUI.logMessage &&
          (OthelloUI.logMessage(`Game over: Final score ${t.black}-${t.white}`),
          e === GAME_CONSTANTS.BLACK
            ? OthelloUI.logMessage("Black wins!")
            : e === GAME_CONSTANTS.WHITE
            ? OthelloUI.logMessage("White wins!")
            : OthelloUI.logMessage("Tie!"))),
      "undefined" != typeof GameLogger && GameLogger.saveGameWithLog)
    ) {
      const e =
          "undefined" != typeof OthelloUI && OthelloUI.getPlayerName
            ? OthelloUI.getPlayerName(GAME_CONSTANTS.BLACK)
            : "Black",
        o =
          "undefined" != typeof OthelloUI && OthelloUI.getPlayerName
            ? OthelloUI.getPlayerName(GAME_CONSTANTS.WHITE)
            : "White";
      GameLogger.saveGameWithLog(
        t.black,
        t.white,
        e,
        o,
        O,
        "undefined" != typeof OthelloUI && OthelloUI.getMoveLog
          ? OthelloUI.getMoveLog()
          : []
      );
    }
    "undefined" != typeof OthelloUI &&
      OthelloUI.enableStartButton &&
      OthelloUI.enableStartButton();
  }
  let T = [],
    S = 8,
    O = null,
    N = GAME_CONSTANTS.BLACK,
    f = !1,
    u = !1;
  return {
    initializeBoard: o,
    createInitialBoard: t,
    isWithinBoard: e,
    isValidMove: l,
    getValidMoves: r,
    makeMove: n,
    countDiscs: i,
    determineNextPlayer: a,
    endGame: A,
    getBoard: () => T,
    getCurrentPlayer: () => N,
    getBoardSize: () => S,
    getCurrentStage: () => O,
    isGameRunning: () => f,
    isGameOver: () => u,
    setCurrentPlayer: (e) => {
      N = e;
    },
    setGameRunning: (e) => {
      f = e;
    },
    setGameOver: (e) => {
      u = e;
    },
  };
})();
"undefined" != typeof module &&
  module.exports &&
  (module.exports = OthelloCore);
