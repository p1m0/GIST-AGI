const OthelloUI = (function () {
    function e(e = null) {
        if ((e || "undefined" == typeof OthelloCore || (e = OthelloCore.getBoard()), !e))
            return void console.error("No board state available for display update");
        const l =
                "undefined" != typeof OthelloCore && OthelloCore.getCurrentPlayer
                    ? OthelloCore.getCurrentPlayer()
                    : GAME_CONSTANTS.BLACK,
            n =
                !("undefined" == typeof OthelloCore || !OthelloCore.isGameRunning) &&
                OthelloCore.isGameRunning(),
            a = e.length;
        N.board.querySelectorAll(".cell").forEach((o) => {
            const r = parseInt(o.dataset.row),
                s = parseInt(o.dataset.col);
            if (
                ((o.innerHTML = ""),
                o.classList.remove("blocked", "black", "white", "valid-move-hint", "playable"),
                (o.onclick = null),
                !t(r, s, a))
            )
                return;
            const i = e[r][s];
            if (i === GAME_CONSTANTS.BLACK) {
                const e = document.createElement("div");
                (e.className = "disc black"), o.appendChild(e), (o.style.cursor = "default");
            } else if (i === GAME_CONSTANTS.WHITE) {
                const e = document.createElement("div");
                (e.className = "disc white"), o.appendChild(e), (o.style.cursor = "default");
            } else if (i === GAME_CONSTANTS.BLOCKED)
                o.classList.add("blocked"), (o.style.cursor = "not-allowed");
            else {
                const e =
                    (l === GAME_CONSTANTS.BLACK && "human" === N.blackAISelect.value) ||
                    (l === GAME_CONSTANTS.WHITE && "human" === N.whiteAISelect.value);
                n &&
                !B &&
                e &&
                "undefined" != typeof OthelloCore &&
                OthelloCore.isValidMove &&
                OthelloCore.isValidMove(r, s, l)
                    ? (o.classList.add("valid-move-hint"), o.classList.add("playable"))
                    : (o.style.cursor = "default");
            }
        });
        const r = o(e);
        (N.blackScore.textContent = r.black), (N.whiteScore.textContent = r.white);
    }
    function t(e, t, o) {
        return e >= 0 && e < o && t >= 0 && t < o;
    }
    function o(e) {
        let t = 0,
            o = 0;
        for (let l = 0; l < e.length; l++)
            for (let n = 0; n < e[l].length; n++)
                e[l][n] === GAME_CONSTANTS.BLACK ? t++ : e[l][n] === GAME_CONSTANTS.WHITE && o++;
        return { black: t, white: o };
    }
    function l(e) {
        y.push(e), r();
    }
    function n(e, t, o) {
        l(
            `${i(o)}${o === GAME_CONSTANTS.BLACK ? "(B)" : "(W)"}: ${String.fromCharCode(97 + t)}${
                e + 1
            }`
        );
    }
    function a(e) {
        l(`${i(e)} passes`);
    }
    function r() {
        N.gameLog &&
            ((N.gameLog.innerHTML = y.join("<br>")),
            (N.gameLog.scrollTop = N.gameLog.scrollHeight));
    }
    function s() {
        if (!N.blackTimer || !N.whiteTimer) return;
        const e = (M / 1e3).toFixed(2),
            t = (p / 1e3).toFixed(2);
        (N.blackTimer.textContent = `${e}s`), (N.whiteTimer.textContent = `${t}s`);
        const o = document.querySelector(".timer.black"),
            l = document.querySelector(".timer.white");
        o && (o.classList.toggle("warning", M >= 6e3), o.classList.toggle("danger", M >= 8e3)),
            l && (l.classList.toggle("warning", p >= 6e3), l.classList.toggle("danger", p >= 8e3));
    }
    function i(e) {
        const t = (e === GAME_CONSTANTS.BLACK ? N.blackAISelect : N.whiteAISelect).value;
        if ("human" === t) return "Human";
        if (t.startsWith("custom_")) {
            const e = t.replace("custom_", "");
            return e.length > 20 ? e.substring(0, 18) + "..." : e;
        }
        return "undefined" != typeof OthelloStrategies &&
            OthelloStrategies.getBuiltInStrategyNames().includes(t)
            ? t.charAt(0).toUpperCase() + t.slice(1)
            : "?";
    }
    function c(e = null) {
        if (!N.status) return;
        const t =
                !("undefined" == typeof OthelloCore || !OthelloCore.isGameRunning) &&
                OthelloCore.isGameRunning(),
            l =
                "undefined" != typeof OthelloCore && OthelloCore.getCurrentPlayer
                    ? OthelloCore.getCurrentPlayer()
                    : GAME_CONSTANTS.BLACK,
            n =
                "undefined" != typeof OthelloCore && OthelloCore.countDiscs
                    ? OthelloCore.countDiscs()
                    : o(OthelloCore.getBoard());
        if (t) {
            const e = l === GAME_CONSTANTS.BLACK ? N.blackAISelect.value : N.whiteAISelect.value,
                t = i(l);
            N.status.textContent = `${t}'s turn (${n.black}-${n.white})`;
            const o = (M / 1e3).toFixed(1),
                a = (p / 1e3).toFixed(1);
            N.status.textContent += ` [B:${o}s W:${a}s]`;
            const r =
                "undefined" != typeof OthelloCore && OthelloCore.getCurrentStage
                    ? OthelloCore.getCurrentStage()
                    : null;
            if (r && r.fewerPiecesContinue) {
                ((l === GAME_CONSTANTS.BLACK && n.black < n.white) ||
                    (l === GAME_CONSTANTS.WHITE && n.white < n.black)) &&
                    (N.status.textContent += " (continuing - fewer pieces)");
            }
            (N.status.className = "status " + ("human" === e ? "" : "thinking")),
                (N.status.style.backgroundColor =
                    "human" === e ? (l === GAME_CONSTANTS.BLACK ? "#333" : "#999") : "#FFC107");
        } else {
            let t = "Game over. ";
            if (null !== e) {
                (t += `${e === GAME_CONSTANTS.BLACK ? "Black" : "White"} wins! (${n.black}-${
                    n.white
                })`),
                    ((e === GAME_CONSTANTS.BLACK && p > GAME_CONSTANTS.MAX_AI_TIME_PER_GAME) ||
                        (e === GAME_CONSTANTS.WHITE && M > GAME_CONSTANTS.MAX_AI_TIME_PER_GAME)) &&
                        (t += " (by time forfeit)");
            } else
                n.black > n.white
                    ? (t += `Black wins! (${n.black}-${n.white})`)
                    : n.white > n.black
                    ? (t += `White wins! (${n.black}-${n.white})`)
                    : (t += `Tie! (${n.black}-${n.white})`);
            (N.status.textContent = t), (N.status.style.backgroundColor = "#666");
        }
        s();
    }
    function u(e, t = "") {
        N.status && ((N.status.textContent = e), (N.status.className = "status " + t));
    }
    function d(e) {
        if (!N.board) return;
        const t = GAME_CONSTANTS.DEFAULT_CELL_SIZE;
        (N.board.innerHTML = ""),
            (N.board.style.gridTemplateColumns = `repeat(${e}, ${t}px)`),
            (N.board.style.gridTemplateRows = `repeat(${e}, ${t}px)`);
        const o = e * t + (e - 1) * GAME_CONSTANTS.BOARD_GAP + 2 * GAME_CONSTANTS.BOARD_PADDING;
        (N.board.style.width = `${o}px`), (N.board.style.height = `${o}px`);
        for (let o = 0; o < e; o++)
            for (let l = 0; l < e; l++) {
                const e = document.createElement("div");
                (e.className = "cell"),
                    (e.dataset.row = o),
                    (e.dataset.col = l),
                    (e.style.width = `${t}px`),
                    (e.style.height = `${t}px`),
                    N.board.appendChild(e);
            }
    }
    function C() {
        N.status &&
            ((N.status.textContent = "Stage selected. Click Start Game button."),
            (N.status.style.backgroundColor = "#4CAF50"),
            N.startButton && (N.startButton.disabled = !1));
    }
    function m() {
        N.startButton && (N.startButton.disabled = !1);
    }
    function g(e) {
        if ("undefined" == typeof OthelloCore)
            return void console.error("OthelloCore module not available");
        const t = OthelloCore.getCurrentPlayer(),
            o = OthelloCore.isGameRunning(),
            n = OthelloCore.isGameOver(),
            r =
                (t === GAME_CONSTANTS.BLACK &&
                    "human" === document.getElementById("black-ai").value) ||
                (t === GAME_CONSTANTS.WHITE &&
                    "human" === document.getElementById("white-ai").value);
        if (!r || !o || n) return;
        if (r && o && !B && !n) {
            if (0 === OthelloCore.getValidMoves(t).length) {
                console.log(`Human player ${t} has no valid moves. Passing automatically.`), a(t);
                const e = t === GAME_CONSTANTS.BLACK ? GAME_CONSTANTS.WHITE : GAME_CONSTANTS.BLACK;
                return 0 === OthelloCore.getValidMoves(e).length
                    ? (console.log("Both players have no moves. Ending game."),
                      void OthelloCore.endGame())
                    : (OthelloCore.setCurrentPlayer(e),
                      c(),
                      void (
                          "undefined" != typeof GameController &&
                          GameController.makeAIMove &&
                          GameController.makeAIMove(!1)
                      ));
            }
        }
        const s = e.target.closest(".cell");
        if (!s || !o || B || n) return;
        const d = parseInt(s.dataset.row),
            C = parseInt(s.dataset.col);
        if (r)
            if (OthelloCore.isValidMove(d, C, t)) {
                console.log(`Human Move: P${t} plays at R${d} C${C}`),
                    OthelloCore.makeMove(d, C, t);
                const e = t,
                    o = OthelloCore.determineNextPlayer();
                if ((OthelloCore.setCurrentPlayer(o), c(), e === o)) {
                    if (
                        (console.log(`Player ${o} continues (fewer pieces rule)`),
                        l(`${i(o)} continues (fewer pieces rule)`),
                        0 === OthelloCore.getValidMoves(o).length)
                    ) {
                        console.log(`Continuing player ${o} has no valid moves. Passing.`), a(o);
                        const e =
                            o === GAME_CONSTANTS.BLACK
                                ? GAME_CONSTANTS.WHITE
                                : GAME_CONSTANTS.BLACK;
                        OthelloCore.setCurrentPlayer(e), c();
                    }
                }
                const n = OthelloCore.getValidMoves(GAME_CONSTANTS.BLACK),
                    r = OthelloCore.getValidMoves(GAME_CONSTANTS.WHITE);
                0 === n.length && 0 === r.length
                    ? (console.log(
                          "Game end detected after human move - no valid moves for either player."
                      ),
                      OthelloCore.endGame())
                    : (console.log("Human move done, triggering next player check"),
                      "undefined" != typeof GameController &&
                          GameController.makeAIMove &&
                          GameController.makeAIMove(!1));
            } else
                console.log(`Human invalid move attempt at R${d} C${C}`),
                    u("Invalid move!", "error"),
                    setTimeout(() => c(), 1500);
    }
    function A(t, o) {
        if (o > GAME_CONSTANTS.MAX_AI_TIME_PER_GAME) {
            l(
                `${t === GAME_CONSTANTS.BLACK ? "Black" : "White"} (${i(
                    t
                )}) exceeded the time limit of ${GAME_CONSTANTS.MAX_AI_TIME_PER_GAME / 1e3}s!`
            );
            const o = t === GAME_CONSTANTS.BLACK ? GAME_CONSTANTS.WHITE : GAME_CONSTANTS.BLACK;
            l(`${o === GAME_CONSTANTS.BLACK ? "Black" : "White"} wins by time forfeit!`);
            const n = OthelloCore.getBoard(),
                a = o;
            for (let e = 0; e < n.length; e++)
                for (let t = 0; t < n[e].length; t++)
                    n[e][t] !== GAME_CONSTANTS.BLOCKED && n[e][t] !== a && (n[e][t] = a);
            return e(n), OthelloCore.endGame(o), !0;
        }
        return !1;
    }
    function h() {
        N.stageSelect &&
            ((N.stageSelect.innerHTML = ""),
            "undefined" != typeof stages && Array.isArray(stages)
                ? stages.forEach((e, t) => {
                      const o = document.createElement("option");
                      (o.value = t),
                          (o.textContent = `${t + 1}: ${e.name}`),
                          N.stageSelect.appendChild(o);
                  })
                : console.error("Stages not defined or not an array"));
    }
    function S(e) {
        B = e;
    }
    function T() {
        return [...y];
    }
    function f() {
        (y = []), r();
    }
    function E(e) {
        (M = e), s();
    }
    function O(e) {
        (p = e), s();
    }
    const N = {
        board: document.getElementById("board"),
        status: document.getElementById("status"),
        blackScore: document.getElementById("black-score"),
        whiteScore: document.getElementById("white-score"),
        blackTimer: document.getElementById("black-timer"),
        whiteTimer: document.getElementById("white-timer"),
        stageSelect: document.getElementById("stageSelect"),
        blackAISelect: document.getElementById("black-ai"),
        whiteAISelect: document.getElementById("white-ai"),
        startButton: document.getElementById("start-btn"),
        resetButton: document.getElementById("reset-btn"),
        gameLog: document.getElementById("game-log"),
        jsCode: document.getElementById("js-code"),
        strategyName: document.getElementById("strategy-name"),
        saveStrategyButton: document.getElementById("save-strategy"),
        clearEditorButton: document.getElementById("clear-editor"),
        strategyList: document.getElementById("strategy-list"),
        logInput: document.getElementById("log-input"),
    };
    let y = [],
        M = 0,
        p = 0,
        B = !1;
    return {
        updateBoardDisplay: e,
        setupBoardUI: d,
        updateUIForPreview: C,
        updateStatus: c,
        displayMessage: u,
        enableStartButton: m,
        logMessage: l,
        logMove: n,
        logPass: a,
        updateGameLog: r,
        getMoveLog: T,
        clearMoveLog: f,
        getPlayerName: i,
        updateTimers: s,
        updateBlackTime: E,
        updateWhiteTime: O,
        checkTimeLimit: A,
        setAIThinking: S,
        populateStageSelect: h,
        handleHumanMove: g,
        getElement: (e) => N[e] || null,
    };
})();
"undefined" != typeof module && module.exports && (module.exports = OthelloUI);
