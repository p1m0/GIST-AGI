const GameController = (function () {
  async function e(e = !1, t = null) {
    if (
      (console.log("[startGame] Start."), "undefined" != typeof OthelloCore)
    ) {
      if (!t) {
        const e = document.getElementById("stageSelect"),
          o = parseInt((e && e.value) || 0);
        t = stages[o] || stages[0];
      }
      if (t) {
        if (
          ("undefined" == typeof GameLogger || e || GameLogger.reset(),
          OthelloCore.initializeBoard(t, !1),
          OthelloCore.setGameRunning(!0),
          OthelloCore.setCurrentPlayer(GAME_CONSTANTS.BLACK),
          (a = 0),
          (s = 0),
          "undefined" != typeof OthelloUI)
        ) {
          OthelloUI.clearMoveLog(),
            OthelloUI.updateStatus(),
            OthelloUI.updateBoardDisplay();
          const e = OthelloUI.getElement("startButton");
          e && (e.disabled = !0);
          const o = OthelloUI.getPlayerName(GAME_CONSTANTS.BLACK),
            l = OthelloUI.getPlayerName(GAME_CONSTANTS.WHITE);
          OthelloUI.logMessage(
            `Game started: ${o}(B) vs ${l}(W) on Stage: ${t.name}`
          );
        }
        (h = e),
          setTimeout(() => {
            OthelloCore.isGameRunning() && !OthelloCore.isGameOver()
              ? (console.log(
                  "[startGame -> setTimeout] Triggering first move check..."
                ),
                o(e))
              : console.warn(
                  "[startGame -> setTimeout] Game ended before first move check."
                );
          }, 10),
          console.log(
            "[startGame] Finish initial setup. First move check scheduled."
          );
      } else alert("Please select a valid stage.");
    } else console.error("OthelloCore not available");
  }
  async function o(e = !1) {
    if (
      (console.log(
        `[makeAIMove] Enter. Player: ${OthelloCore.getCurrentPlayer()}, Running: ${OthelloCore.isGameRunning()}, Thinking: ${
          !!OthelloUI && OthelloUI.getElement("aiThinking")
        }`
      ),
      !OthelloCore.isGameRunning() || OthelloCore.isGameOver())
    )
      return (
        console.log("[makeAIMove] Aborting: Game not running or over."),
        "undefined" != typeof OthelloUI && OthelloUI.setAIThinking(!1),
        void (i && (clearTimeout(i), (i = null)))
      );
    const l = OthelloCore.getCurrentPlayer(),
      n = l === GAME_CONSTANTS.BLACK ? "blackAISelect" : "whiteAISelect",
      r = OthelloUI ? OthelloUI.getElement(n) : null;
    if (!r)
      return void console.error(
        `[makeAIMove] Player select element not found for player ${l}`
      );
    const h = r.value;
    if ("human" === h)
      return (
        "undefined" != typeof OthelloUI &&
          (OthelloUI.setAIThinking(!1),
          OthelloUI.updateStatus(),
          OthelloUI.updateBoardDisplay()),
        void console.log(`[makeAIMove] Human turn P${l}. Waiting for input.`)
      );
    if (("undefined" != typeof OthelloUI && OthelloUI.setAIThinking(!0), !1))
      return void console.warn(
        `[makeAIMove] AI P${l} is already thinking. Aborting duplicate call.`
      );
    if ("undefined" != typeof OthelloUI) {
      OthelloUI.setAIThinking(!0);
      const e = OthelloUI.getPlayerName(l);
      OthelloUI.displayMessage(`${e} (AI) is thinking...`, "thinking");
    }
    let d = null;
    if (
      ("undefined" != typeof OthelloStrategies &&
        (d = OthelloStrategies.getCompiledStrategy(h, l)),
      !d)
    ) {
      if (
        (console.error(`[makeAIMove] Strategy function failed for ${h}`),
        "undefined" != typeof OthelloUI)
      ) {
        const e = OthelloUI.getPlayerName(l);
        OthelloUI.logMessage(`Error: AI ${e} failed. Using random move.`);
      }
      return void t(l, e);
    }
    const u = OthelloCore.getValidMoves(l);
    if (
      (console.log(`[makeAIMove] P${l} has ${u.length} valid moves.`),
      0 === u.length)
    ) {
      console.log(`[makeAIMove] P${l} has no moves. Checking opponent...`);
      const t =
        l === GAME_CONSTANTS.BLACK
          ? GAME_CONSTANTS.WHITE
          : GAME_CONSTANTS.BLACK;
      return 0 === OthelloCore.getValidMoves(t).length
        ? (console.log("[makeAIMove] Both players have no moves. Ending game."),
          "undefined" != typeof OthelloUI && OthelloUI.setAIThinking(!1),
          void OthelloCore.endGame())
        : (console.log(`[makeAIMove] P${l} passes.`),
          "undefined" != typeof OthelloUI && OthelloUI.logPass(l),
          OthelloCore.setCurrentPlayer(t),
          "undefined" != typeof OthelloUI && OthelloUI.updateStatus(),
          "undefined" != typeof OthelloUI && OthelloUI.setAIThinking(!1),
          void o(e));
    }
    const O = e ? 0 : 20;
    i && clearTimeout(i),
      (i = setTimeout(async () => {
        if (!OthelloCore.isGameRunning() || OthelloCore.isGameOver())
          return (
            console.log(
              `[makeAIMove -> setTimeout] Aborting before AI execution. GameRunning: ${OthelloCore.isGameRunning()}, GameOver: ${OthelloCore.isGameOver()}`
            ),
            void (
              "undefined" != typeof OthelloUI && OthelloUI.setAIThinking(!1)
            )
          );
        const n =
          "undefined" != typeof OthelloUI
            ? OthelloUI.getPlayerName(l)
            : `Player ${l}`;
        console.log(
          `[makeAIMove -> setTimeout] Executing AI logic for ${n} (P${l})`
        );
        try {
          console.log(
            `[makeAIMove -> setTimeout] Calling strategy function for ${n}...`
          );
          const i = performance.now(),
            h = OthelloCore.getBoard().map((e) => [...e]),
            O = new Promise(async (e) => {
              try {
                e(await d(h, l, u, OthelloCore.makeMove));
              } catch (o) {
                console.error("[makeAIMove] Error in strategy function:", o),
                  e(null);
              }
            }),
            c = new Promise((e, o) => {
              setTimeout(() => {
                o(new Error("AI move timed out after 10 seconds"));
              }, GAME_CONSTANTS.MAX_AI_TIME_PER_GAME - (l === GAME_CONSTANTS.BLACK ? a : s));
            }),
            m = await Promise.race([O, c])["catch"](
              (e) => (
                console.error("[makeAIMove] Timeout or error:", e.message), null
              )
            ),
            I = performance.now() - i;
          if (
            (l === GAME_CONSTANTS.BLACK
              ? ((a += I),
                "undefined" != typeof OthelloUI && OthelloUI.updateBlackTime(a))
              : ((s += I),
                "undefined" != typeof OthelloUI &&
                  OthelloUI.updateWhiteTime(s)),
            console.log(
              `[makeAIMove -> setTimeout] ${n} returned move:`,
              m,
              `in ${(I / 1e3).toFixed(3)}s (total: ${
                l === GAME_CONSTANTS.BLACK ? a.toFixed(0) : s.toFixed(0)
              }ms)`
            ),
            "undefined" != typeof OthelloUI &&
              OthelloUI.checkTimeLimit(l, l === GAME_CONSTANTS.BLACK ? a : s))
          )
            return;
          let g = m,
            f = !1;
          const A = m && u.some((e) => e.row === m.row && e.col === m.col);
          if (!m || !A) {
            if (
              (console.log("--- Invalid Move Detected ---"),
              console.log("AI Identifier:", n),
              console.log("Returned move:", m),
              console.log("Current player:", l),
              console.log("Calculated validMoves:", u),
              m &&
                console.log(
                  "isValidMove result (for info):",
                  OthelloCore.isValidMove(m.row, m.col, l)
                ),
              console.log("Current board state:"),
              console.table(OthelloCore.getBoard()),
              (g = u[Math.floor(Math.random() * u.length)]),
              (f = !0),
              !g)
            )
              return (
                console.error(
                  "Fallback failed - Could not select random move from non-empty list?"
                ),
                void t(l, e)
              );
            console.log(
              "[makeAIMove -> setTimeout] Fallback move selected:",
              g
            );
          }
          console.log(
            `[makeAIMove -> setTimeout] Executing makeMove for P${l}:`,
            g
          ),
            OthelloCore.makeMove(g.row, g.col, l);
          const U = l,
            C = OthelloCore.determineNextPlayer();
          OthelloCore.setCurrentPlayer(C),
            "undefined" != typeof OthelloUI && OthelloUI.updateStatus(),
            console.log(
              `[makeAIMove -> setTimeout] Switched player from P${U} to P${C}.`
            ),
            U === C &&
              (console.log(
                `[makeAIMove -> setTimeout] Same player (${n}) continues (fewer pieces rule)`
              ),
              "undefined" != typeof OthelloUI &&
                OthelloUI.logMessage(`${n} continues (fewer pieces rule)`)),
            "undefined" != typeof OthelloUI && OthelloUI.setAIThinking(!1),
            console.log(
              `[makeAIMove -> setTimeout] Scheduling check for next turn (P${C}).`
            ),
            o(e);
        } catch (r) {
          if (
            (console.error(
              `[makeAIMove -> setTimeout] Error during AI logic or move execution (${n}):`,
              r
            ),
            "undefined" != typeof OthelloUI &&
              OthelloUI.logMessage(
                `Error in AI move (${n}): ${r.message}. Using random move.`
              ),
            "undefined" != typeof OthelloUI && OthelloUI.updateTimers(),
            "undefined" != typeof OthelloUI &&
              OthelloUI.checkTimeLimit(l, l === GAME_CONSTANTS.BLACK ? a : s))
          )
            return;
          t(l, e);
        }
      }, O));
  }
  function t(e, t) {
    const l = OthelloCore.getValidMoves(e);
    if (0 === l.length) {
      const l =
        e === GAME_CONSTANTS.BLACK
          ? GAME_CONSTANTS.WHITE
          : GAME_CONSTANTS.BLACK;
      return 0 === OthelloCore.getValidMoves(l).length
        ? ("undefined" != typeof OthelloUI && OthelloUI.setAIThinking(!1),
          void OthelloCore.endGame())
        : ("undefined" != typeof OthelloUI && OthelloUI.logPass(e),
          OthelloCore.setCurrentPlayer(l),
          "undefined" != typeof OthelloUI && OthelloUI.updateStatus(),
          "undefined" != typeof OthelloUI && OthelloUI.setAIThinking(!1),
          void o(t));
    }
    const n = 100;
    if (
      (e === GAME_CONSTANTS.BLACK
        ? ((a += n),
          "undefined" != typeof OthelloUI && OthelloUI.updateBlackTime(a))
        : ((s += n),
          "undefined" != typeof OthelloUI && OthelloUI.updateWhiteTime(s)),
      "undefined" != typeof OthelloUI && OthelloUI.updateTimers(),
      "undefined" != typeof OthelloUI &&
        OthelloUI.checkTimeLimit(e, e === GAME_CONSTANTS.BLACK ? a : s))
    )
      return;
    const r =
      "undefined" != typeof OthelloUI
        ? OthelloUI.getPlayerName(e)
        : `Player ${e}`;
    "undefined" != typeof OthelloUI &&
      OthelloUI.logMessage(`${r} is using random strategy (fallback)`);
    const i = l[Math.floor(Math.random() * l.length)];
    console.log(`[useFallbackMove] Selected random move for P${e}:`, i),
      OthelloCore.makeMove(i.row, i.col, e);
    const h = e,
      d = OthelloCore.determineNextPlayer();
    h === d &&
      (console.log(
        `[useFallbackMove] Same player (${r}) continues (fewer pieces rule)`
      ),
      "undefined" != typeof OthelloUI &&
        OthelloUI.logMessage(`${r} continues (fewer pieces rule)`)),
      OthelloCore.setCurrentPlayer(d),
      "undefined" != typeof OthelloUI && OthelloUI.updateStatus(),
      "undefined" != typeof OthelloUI && OthelloUI.setAIThinking(!1),
      o(t);
  }
  function l(e, o = !0) {
    if (
      (console.log("[resetGame] Function called!"),
      i && (clearTimeout(i), (i = null)),
      OthelloCore.setGameRunning(!1),
      "undefined" != typeof OthelloUI && OthelloUI.setAIThinking(!1),
      !e)
    ) {
      const o = document.getElementById("stageSelect"),
        t = parseInt((o && o.value) || 0);
      e = stages[t] || stages[0];
    }
    OthelloCore.initializeBoard(e, o),
      OthelloCore.setCurrentPlayer(GAME_CONSTANTS.BLACK),
      "undefined" != typeof OthelloUI &&
        (OthelloUI.clearMoveLog(),
        OthelloUI.logMessage("Board reset."),
        OthelloUI.updateGameLog(),
        OthelloUI.enableStartButton(),
        OthelloUI.displayMessage("Ready to start.", ""));
  }
  function n() {
    return a;
  }
  function r() {
    return s;
  }
  let i = null,
    a = 0,
    s = 0,
    h = !1;
  return {
    startGame: e,
    resetGame: l,
    makeAIMove: o,
    getBlackTimeUsed: n,
    getWhiteTimeUsed: r,
  };
})();
"undefined" != typeof module &&
  module.exports &&
  (module.exports = GameController);
