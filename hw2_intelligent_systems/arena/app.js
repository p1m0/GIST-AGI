function initializeApp() {
  console.log("Initializing Othello Arena..."),
    window.gameLogger ||
      "undefined" == typeof GameLogger ||
      ((window.gameLogger = GameLogger), GameLogger.loadFromLocalStorage()),
    OthelloUI.populateStageSelect(),
    OthelloStrategies.loadSavedStrategies(),
    updateStrategyList(),
    updateAISelectors(),
    initializeBoardWithDefaultStage(),
    "undefined" != typeof Tournament &&
      (Tournament.loadLeaderboardData(), Tournament.updateLeaderboardDisplay()),
    document.getElementById("start-btn").addEventListener("click", startGame),
    document.getElementById("reset-btn").addEventListener("click", resetGame),
    document
      .getElementById("save-strategy")
      .addEventListener("click", saveStrategy),
    document
      .getElementById("clear-editor")
      .addEventListener("click", clearEditor),
    document
      .getElementById("board")
      .addEventListener("click", OthelloUI.handleHumanMove),
    document
      .getElementById("upload-strategies")
      .addEventListener("click", uploadStrategies),
    document
      .getElementById("run-tournament-btn")
      .addEventListener("click", runTournament),
    document
      .getElementById("stop-tournament-btn")
      .addEventListener("click", stopTournament),
    document
      .getElementById("reset-tournament-btn")
      .addEventListener("click", resetTournamentRecords),
    document
      .getElementById("upload-intelligent-system")
      .addEventListener("click", uploadIntelligentSystem),
    document.getElementById("save-log").addEventListener("click", saveGameLog),
    document
      .getElementById("stageSelect")
      .addEventListener("change", onStageChange),
    document
      .getElementById("clear-all-btn")
      .addEventListener("click", clearAllData),
    "undefined" != typeof GameRollout &&
      window.gameLogger &&
      ((window.gameRollout = new GameRollout(
        {
          setBoard: (e) => {
            "undefined" != typeof OthelloCore &&
              OthelloUI.updateBoardDisplay(e);
          },
          updatePlayerIndicator: () => {},
          highlightCell: () => {},
        },
        window.gameLogger
      )),
      setupRolloutControls()),
    console.log("Othello Arena Initialized.");
}
function initializeBoardWithDefaultStage() {
  const e = document.getElementById("stageSelect"),
    t = parseInt((e && e.value) || 0),
    o = stages[t >= 0 && t < stages.length ? t : 0];
  console.log("Initializing board with default stage:", o.name),
    OthelloUI.setupBoardUI(o.boardSize),
    OthelloCore.initializeBoard(o, !0);
}
function onStageChange() {
  const e = document.getElementById("stageSelect"),
    t = parseInt(e.value),
    o = stages[t] || stages[0];
  console.log("Stage changed to:", o.name),
    OthelloUI.setupBoardUI(o.boardSize),
    OthelloCore.initializeBoard(o, !0);
}
function startGame() {
  console.log("Starting game...");
  const e = document.getElementById("stageSelect"),
    t = parseInt((e && e.value) || 0),
    o = stages[t] || stages[0];
  "undefined" != typeof GameController && GameController.startGame
    ? GameController.startGame(!1, o)
    : console.error("GameController not available. Cannot start game.");
}
function resetGame() {
  console.log("Resetting game...");
  const e = document.getElementById("stageSelect"),
    t = parseInt((e && e.value) || 0),
    o = stages[t] || stages[0];
  "undefined" != typeof GameController && GameController.resetGame
    ? GameController.resetGame(o, !0)
    : OthelloCore.initializeBoard(o, !0);
}
function clearAllData() {
  if (
    confirm(
      "This will clear ALL saved games, tournament data, and logs. This cannot be undone. Continue?"
    )
  )
    try {
      if (
        (window.gameLogger &&
          ((window.gameLogger.previousGames = []),
          (window.gameLogger.gameResults = []),
          window.gameLogger.reset(),
          window.gameLogger.saveToLocalStorage()),
        localStorage.removeItem("othelloPreviousGames"),
        localStorage.removeItem("othelloGameResults"),
        localStorage.removeItem("othelloLeaderboard"),
        "undefined" != typeof OthelloCore)
      ) {
        const e = OthelloCore.getCurrentStage() || stages[0];
        OthelloCore.initializeBoard(e, !0);
      }
      const t = document.getElementById("log-input");
      t && (t.value = ""),
        "undefined" != typeof OthelloUI &&
          OthelloUI.clearMoveLog &&
          OthelloUI.clearMoveLog(),
        "function" == typeof updateRolloutControls && updateRolloutControls(),
        "undefined" != typeof Tournament &&
          Tournament.resetLeaderboard &&
          Tournament.resetLeaderboard(),
        window.gameRollout &&
          ((window.gameRollout.currentMoveIndex = -1),
          (window.gameRollout.currentGameIndex = 0),
          (window.gameRollout.gameStartIndices = [0]),
          (window.gameRollout.movesPerGame = []),
          (window.gameRollout.isRolling = !1),
          window.gameRollout.rolloutTimer &&
            (clearTimeout(window.gameRollout.rolloutTimer),
            (window.gameRollout.rolloutTimer = null)));
      const o = document.getElementById("status");
      o
        ? ((o.textContent = "All game data has been cleared."),
          (o.style.backgroundColor = "#4CAF50"),
          setTimeout(() => {
            (o.textContent = "Ready to start."),
              (o.style.backgroundColor = "#4CAF50");
          }, 3e3))
        : alert("All game data has been cleared successfully."),
        console.log("All game data cleared successfully");
    } catch (e) {
      console.error("Error clearing game data:", e),
        alert("An error occurred while clearing game data: " + e.message);
    }
}
function saveStrategy() {
  const e = document.getElementById("strategy-name").value.trim(),
    t = document.getElementById("js-code").value;
  if (e)
    if (t)
      if (OthelloStrategies.saveStrategy(e, t)) {
        console.log(`Strategy "${e}" saved successfully.`);
        const t = document.getElementById("status");
        t &&
          ((t.textContent = `Saved "${e}".`),
          (t.style.backgroundColor = "#4CAF50")),
          updateStrategyList(),
          updateAISelectors();
      } else {
        console.error(`Failed to save strategy "${e}".`);
        const t = document.getElementById("status");
        t &&
          ((t.textContent = `Failed to save "${e}".`),
          (t.style.backgroundColor = "#f44336"));
      }
    else alert("Strategy code is required.");
  else alert("Strategy name is required.");
}
function uploadStrategies() {
  const e = document.getElementById("strategy-file-input"),
    t = e.files;
  0 !== t.length
    ? "undefined" != typeof OthelloStrategies &&
      OthelloStrategies.importStrategiesFromFiles
      ? OthelloStrategies.importStrategiesFromFiles(t)
          .then((t) => {
            const o = document.getElementById("upload-status-msg");
            if (o) {
              if (0 === t.errors.length)
                (o.textContent = `Successfully uploaded ${t.success} strategy files!`),
                  (o.className = "upload-status upload-success");
              else {
                0 === t.success
                  ? (o.textContent = `Upload failed: ${t.errors[0]}`)
                  : (o.textContent = `Uploaded ${t.success} files, but ${t.errors.length} failed: ${t.errors[0]}`),
                  (o.className = "upload-status upload-error");
                const e = t.errors.join("\n");
                o.title = e;
              }
              o.style.display = "block";
              const e = t.errors.length > 0 ? 1e4 : 4800;
              setTimeout(() => {
                o.style.display = "none";
              }, e);
            }
            const n = document.getElementById("status");
            if (n)
              if (0 === t.errors.length)
                (n.textContent = "Strategy upload successful!"),
                  (n.style.backgroundColor = "#4CAF50");
              else {
                const e = t.errors[0] || "Unknown error";
                (n.textContent = `Strategy upload issue: ${e}`),
                  (n.style.backgroundColor = "#FF9800");
              }
            updateStrategyList(), updateAISelectors(), (e.value = "");
          })
          ["catch"]((e) => {
            console.error("Error uploading strategies:", e);
            const t = document.getElementById("upload-status-msg");
            t &&
              ((t.textContent = `Upload error: ${e.message}`),
              (t.className = "upload-status upload-error"),
              (t.style.display = "block"),
              setTimeout(() => {
                t.style.display = "none";
              }, 1e4));
            const o = document.getElementById("status");
            o &&
              ((o.textContent = `Upload error: ${e.message}`),
              (o.style.backgroundColor = "#f44336"));
          })
      : (console.error("OthelloStrategies module not available"),
        alert("Strategy upload is not supported in this version"))
    : alert("Please select files first");
}
function clearEditor() {
  (document.getElementById("js-code").value = ""),
    (document.getElementById("strategy-name").value = "");
}
function runTournament() {
  "undefined" != typeof Tournament && Tournament.runTournament
    ? Tournament.runTournament()
    : console.error("Tournament module not available");
}
function stopTournament() {
  "undefined" != typeof Tournament && Tournament.stopTournament
    ? Tournament.stopTournament()
    : (console.error("Tournament module not available"),
      alert("Cannot stop tournament - Tournament module not available"));
}
function resetTournamentRecords() {
  if (
    "undefined" != typeof Tournament &&
    Tournament.isRunning &&
    Tournament.isRunning()
  )
    return void alert(
      "Cannot reset competition leaderboard while it is running."
    );
  "undefined" != typeof Tournament
    ? Tournament.resetLeaderboard
      ? Tournament.resetLeaderboard()
      : (Tournament.leaderboardData &&
          (Tournament.leaderboardData = { matches: [], results: {} }),
        Tournament.updateLeaderboardDisplay &&
          Tournament.updateLeaderboardDisplay(),
        Tournament.saveLeaderboardData && Tournament.saveLeaderboardData())
    : console.error("Tournament module not available");
  const e = document.getElementById("tournament-status");
  e && (e.textContent = "Competition records have been reset."),
    console.log("Competition records reset.");
}
function uploadIntelligentSystem() {
  const e = document.getElementById("intelligent-system-file-input"),
    t = document.getElementById("intelligent-system-progress-bar"),
    o = document.getElementById("intelligent-system-progress"),
    n = document.getElementById("intelligent-system-status");
  if (!e || !e.files || 0 === e.files.length)
    return void (
      n &&
      ((n.textContent = "Please select a file first."),
      (n.className = "intelligent-system-status upload-error"),
      (n.style.display = "block"),
      setTimeout(() => {
        n.style.display = "none";
      }, 3e3))
    );
  const l = e.files[0];
  n &&
    ((n.textContent = `Reading file: ${l.name}...`),
    (n.style.display = "block"),
    (n.className = "intelligent-system-status")),
    o && (o.style.display = "block"),
    t && (t.style.width = "5%");
  const a = new FileReader();
  (a.onload = async (o) => {
    try {
      t && (t.style.width = "15%"),
        n && (n.textContent = `Validating file: ${l.name}...`);
      const r = o.target.result,
        s = l.name.replace(/\.js$/, "");
      if (!r.includes("function analyzeStage") && !r.includes("analyzeStage ="))
        throw new Error(
          "The intelligent system must implement an 'analyzeStage' function"
        );
      t && (t.style.width = "25%"),
        n && (n.textContent = "System validated. Preparing analysis...");
      const d = document.getElementById("stageSelect"),
        i = parseInt((d && d.value) || 0),
        u = stages[i] || stages[0];
      if (
        (t && (t.style.width = "30%"),
        n &&
          (n.textContent = `Starting analysis on ${u.name}... (This may take up to 60 seconds)`),
        "undefined" == typeof IntelligentSystemInterface ||
          !IntelligentSystemInterface.analyzeStageWithSystem)
      )
        throw new Error("Intelligent System Interface not available");
      "undefined" == typeof intelligentSystems &&
        (window.intelligentSystems = {}),
        (window.intelligentSystems[s] = r),
        (await IntelligentSystemInterface.analyzeStageWithSystem(s, u, r))
          ? (t && (t.style.width = "100%"),
            n &&
              ((n.textContent = `Analysis complete! Strategy generated for ${u.name}`),
              (n.className = "intelligent-system-status upload-success")),
            updateStrategyList(),
            updateAISelectors())
          : (t && (t.style.width = "0%"),
            n &&
              ((n.textContent = "Analysis failed or timed out."),
              (n.className = "intelligent-system-status upload-error")));
    } catch (a) {
      console.error("Error uploading intelligent system:", a),
        n &&
          ((n.textContent = `Error: ${a.message}`),
          (n.className = "intelligent-system-status upload-error")),
        t && (t.style.width = "0%");
    } finally {
      e.value = "";
      const t = document.getElementById("upload-intelligent-system");
      t && (t.disabled = !1);
    }
  }),
    (a.onerror = () => {
      n &&
        ((n.textContent = "Error reading file"),
        (n.className = "intelligent-system-status upload-error")),
        t && (t.style.width = "0%");
      const e = document.getElementById("upload-intelligent-system");
      e && (e.disabled = !1);
    });
  const r = document.getElementById("upload-intelligent-system");
  r && (r.disabled = !0), a.readAsText(l);
}
function updateAISelectors() {
  const e = document.getElementById("black-ai"),
    t = document.getElementById("white-ai");
  if (!e || !t) return;
  const o = e.value,
    n = t.value;
  (e.innerHTML = ""), (t.innerHTML = "");
  const l = document.createElement("option");
  (l.value = "human"), (l.textContent = "Human"), e.appendChild(l);
  const a = document.createElement("option");
  if (
    ((a.value = "human"),
    (a.textContent = "Human"),
    t.appendChild(a),
    "undefined" != typeof OthelloStrategies &&
      OthelloStrategies.getBuiltInStrategyNames)
  ) {
    const o = OthelloStrategies.getBuiltInStrategyNames();
    if (o && o.length > 0) {
      const n = document.createElement("optgroup");
      n.label = "Built-in AI";
      const l = document.createElement("optgroup");
      (l.label = "Built-in AI"),
        o.forEach((e) => {
          const t = e.charAt(0).toUpperCase() + e.slice(1),
            o = document.createElement("option");
          (o.value = e), (o.textContent = t), n.appendChild(o);
          const a = document.createElement("option");
          (a.value = e), (a.textContent = t), l.appendChild(a);
        }),
        e.appendChild(n),
        t.appendChild(l);
    }
  }
  if (
    "undefined" != typeof OthelloStrategies &&
    OthelloStrategies.getStrategyNames
  ) {
    const o = OthelloStrategies.getStrategyNames().filter(
      (e) =>
        !e.startsWith("intelligent_") &&
        !e.includes("_generated_") &&
        !e.endsWith("_AI")
    );
    if (o && o.length > 0) {
      const n = document.createElement("optgroup");
      n.label = "Custom Strategies";
      const l = document.createElement("optgroup");
      (l.label = "Custom Strategies"),
        o.forEach((e) => {
          const t = document.createElement("option");
          (t.value = `custom_${e}`), (t.textContent = e), n.appendChild(t);
          const o = document.createElement("option");
          (o.value = `custom_${e}`), (o.textContent = e), l.appendChild(o);
        }),
        n.children.length > 0 && (e.appendChild(n), t.appendChild(l));
    }
  }
  if (
    "undefined" != typeof OthelloStrategies &&
    OthelloStrategies.getStrategyNames
  ) {
    const o = OthelloStrategies.getStrategyNames().filter(
      (e) =>
        e.startsWith("intelligent_") ||
        e.includes("_generated_") ||
        e.endsWith("_AI")
    );
    if (o && o.length > 0) {
      const n = document.createElement("optgroup");
      n.label = "Intelligent Strategies";
      const l = document.createElement("optgroup");
      (l.label = "Intelligent Strategies"),
        o.forEach((e) => {
          const t = document.createElement("option");
          (t.value = `custom_${e}`), (t.textContent = e), n.appendChild(t);
          const o = document.createElement("option");
          (o.value = `custom_${e}`), (o.textContent = e), l.appendChild(o);
        }),
        n.children.length > 0 && (e.appendChild(n), t.appendChild(l));
    }
  }
  try {
    const l = Array.from(e.options).some((e) => e.value === o),
      a = Array.from(t.options).some((e) => e.value === n);
    (e.value = l ? o : "human"), (t.value = a ? n : "human");
  } catch (r) {
    console.error("Error restoring AI selector values:", r),
      (e.value = "human"),
      (t.value = "human");
  }
  console.log("AI selectors updated with categorized strategies.");
}
function saveGameLog() {
  try {
    const t = document.getElementById("log-input");
    if (!t) return void console.error("Log input element not found");
    const o = [];
    let n = t.value.trim();
    if (
      "undefined" != typeof GameLogger &&
      (GameLogger.previousGames &&
        GameLogger.previousGames.length > 0 &&
        (console.log(
          `Found ${GameLogger.previousGames.length} previous games to save`
        ),
        GameLogger.previousGames.forEach((e, t) => {
          if (e.logText && "" !== e.logText.trim())
            o.push(`=== Game ${t + 1} ===\n${e.logText}`);
          else if (e.metadata) {
            const {
              blackStrategy: n,
              whiteStrategy: l,
              stage: a,
              blackScore: r,
              whiteScore: s,
            } = e.metadata;
            let d = `=== Game ${t + 1} ===\n`;
            if (
              ((d += `${n}(B) vs ${l}(W) on Stage: ${a}\n`),
              e.moves && e.moves.length > 0)
            ) {
              const t = "abcdefghijklmnopqrstuvwxyz";
              e.moves.forEach((e) => {
                if (e && e.player && e.position) {
                  const o = e.player === GAME_CONSTANTS.BLACK ? n : l,
                    a = e.player === GAME_CONSTANTS.BLACK ? "(B)" : "(W)",
                    r = t[e.position.col],
                    s = e.position.row + 1;
                  d += `${o}${a}: ${r}${s}\n`;
                }
              });
            }
            (d += `Game over: Final score ${r}-${s}\n`),
              (d +=
                r > s ? "Black wins!" : s > r ? "White wins!" : "It's a tie!"),
              o.push(d);
          }
        })),
      "undefined" != typeof OthelloUI && OthelloUI.getMoveLog)
    ) {
      const e = OthelloUI.getMoveLog();
      if (e && e.length > 0) {
        const t = e.join("\n");
        o.some((e) => e.includes(t) || t.includes(e.split("\n")[0])) ||
          o.push(`=== Current Game ===\n${t}`);
      }
    }
    if (o.length > 0 && !n) (n = o.join("\n\n")), (t.value = n);
    else if (n && o.length > 0) {
      !o.every((e) => n.includes(e.split("\n")[1])) &&
        o.join("\n\n").length > n.length &&
        ((n = o.join("\n\n")), (t.value = n));
    }
    if (!n) return void console.error("No game log data to save");
    const l = new Date(),
      a = `${l.getFullYear()}-${(l.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${l.getDate().toString().padStart(2, "0")}_${l
        .getHours()
        .toString()
        .padStart(2, "0")}-${l.getMinutes().toString().padStart(2, "0")}`,
      r = `OthelloGameLog_${a}.txt`,
      s = new Blob([n], { type: "text/plain" }),
      d = URL.createObjectURL(s),
      i = document.createElement("a");
    (i.href = d),
      (i.download = r),
      (i.style.display = "none"),
      document.body.appendChild(i),
      i.click(),
      setTimeout(() => {
        if (
          "undefined" != typeof GameLogger &&
          GameLogger.previousGames &&
          GameLogger.previousGames.length > 0
        ) {
          const e = `OthelloGameData_${a}.json`,
            t = new Blob([JSON.stringify(GameLogger.previousGames)], {
              type: "application/json",
            }),
            o = URL.createObjectURL(t),
            n = document.createElement("a");
          (n.href = o),
            (n.download = e),
            (n.style.display = "none"),
            document.body.appendChild(n),
            n.click(),
            setTimeout(() => {
              document.body.removeChild(n), URL.revokeObjectURL(o);
            }, 100);
        }
        document.body.removeChild(i), URL.revokeObjectURL(d);
        const e = document.getElementById("status");
        e &&
          ((e.textContent = `Game logs saved as ${r}`),
          (e.style.backgroundColor = "#4CAF50"),
          setTimeout(() => {
            (e.textContent = "Ready to start"),
              (e.style.backgroundColor = "#4CAF50");
          }, 3e3)),
          console.log(`Game logs saved as ${r}`);
      }, 200);
  } catch (e) {
    console.error("Error saving game logs:", e);
    const t = document.getElementById("status");
    t &&
      ((t.textContent = "Error saving game logs"),
      (t.style.backgroundColor = "#f44336"));
  }
}
function updateStrategyList() {
  const e = document.getElementById("strategy-list");
  if (!e) return;
  e.innerHTML = "";
  const t = OthelloStrategies.getStrategyNames();
  0 !== t.length
    ? t.forEach((t) => {
        const o = document.createElement("div");
        o.className = "strategy-item";
        const n = document.createElement("span");
        n.textContent = t;
        const l = document.createElement("div");
        l.className = "buttons";
        const a = document.createElement("button");
        (a.textContent = "Edit"),
          a.addEventListener("click", () => {
            const e = OthelloStrategies.getStrategyCode(t);
            e &&
              ((document.getElementById("strategy-name").value = t),
              (document.getElementById("js-code").value = e));
          });
        const r = document.createElement("button");
        (r.textContent = "Delete"),
          (r.className = "delete-btn"),
          r.addEventListener("click", () => {
            OthelloStrategies.deleteStrategy(t),
              updateStrategyList(),
              updateAISelectors();
          }),
          l.appendChild(a),
          l.appendChild(r),
          o.appendChild(n),
          o.appendChild(l),
          e.appendChild(o);
      })
    : (e.innerHTML =
        '<div class="strategy-item"><span>No saved strategies</span></div>');
}
function setupRolloutControls() {
  [
    "rollout-play",
    "rollout-pause",
    "rollout-stop",
    "rollout-prev",
    "rollout-next",
    "rollout-prev-game",
    "rollout-next-game",
  ].forEach((e) => {
    const t = document.getElementById(e);
    if (t) {
      const e = t.cloneNode(!0);
      t.parentNode.replaceChild(e, t);
    }
  });
  const e = document.getElementById("rollout-play"),
    t = document.getElementById("rollout-pause"),
    o = document.getElementById("rollout-stop"),
    n = document.getElementById("rollout-prev"),
    l = document.getElementById("rollout-next"),
    a = document.getElementById("rollout-prev-game"),
    r = document.getElementById("rollout-next-game"),
    s = document.getElementById("rollout-speed"),
    d = document.getElementById("rollout-moves");
  e && t && o && n && l
    ? (a &&
        a.addEventListener("click", () => {
          window.gameRollout &&
            (window.gameRollout.previousGame(), updateRolloutControls());
        }),
      r &&
        r.addEventListener("click", () => {
          window.gameRollout &&
            (window.gameRollout.nextGame(), updateRolloutControls());
        }),
      e &&
        e.addEventListener("click", () => {
          window.gameRollout &&
            (window.gameRollout.start(0), updateRolloutControls());
        }),
      t &&
        t.addEventListener("click", () => {
          window.gameRollout &&
            (window.gameRollout.pause(), updateRolloutControls());
        }),
      o &&
        o.addEventListener("click", () => {
          window.gameRollout &&
            (window.gameRollout.stop(), updateRolloutControls());
        }),
      n &&
        n.addEventListener("click", () => {
          window.gameRollout &&
            (window.gameRollout.previous(), updateRolloutControls());
        }),
      l &&
        l.addEventListener("click", () => {
          window.gameRollout &&
            (window.gameRollout.next(), updateRolloutControls());
        }),
      s &&
        s.addEventListener("input", (e) => {
          if (window.gameRollout) {
            const t = parseInt(e.target.value);
            let o = 2e3 / Math.pow(2, t - 1);
            (o = Math.max(o, 4)), window.gameRollout.setSpeed(o);
          }
        }),
      d &&
        d.addEventListener("input", (e) => {
          if (window.gameRollout) {
            const t = parseInt(e.target.value, 10);
            window.gameRollout.jumpToMove(t), updateRolloutControls();
          }
        }),
      updateRolloutControls())
    : console.log("Rollout controls not found in the document");
}
function updateRolloutControls() {
  if (window.gameRollout)
    try {
      let t = window.gameRollout.currentMoveIndex + 1;
      -1 === window.gameRollout.currentMoveIndex && (t = 0);
      const o = window.gameRollout.getCurrentGameTotalTurns() || 0,
        n = window.gameRollout.currentGameIndex || 0;
      let l = 1;
      "undefined" != typeof window.gameLogger &&
        window.gameLogger.previousGames &&
        window.gameLogger.previousGames.length > 0 &&
        (l = window.gameLogger.previousGames.length);
      const a = document.getElementById("rollout-progress"),
        r = document.getElementById("game-counter");
      a && (a.textContent = `Turn ${t}/${o}`),
        r && (r.textContent = `(Game ${n + 1}/${l})`);
      const s = document.getElementById("rollout-moves");
      s &&
        ((s.min = -1),
        (s.max = Math.max(0, o - 1)),
        (s.value = window.gameRollout.currentMoveIndex));
      const d = document.getElementById("rollout-play"),
        i = document.getElementById("rollout-pause"),
        u = document.getElementById("rollout-prev-game"),
        m = document.getElementById("rollout-next-game");
      d && (d.disabled = window.gameRollout.isRolling),
        i && (i.disabled = !window.gameRollout.isRolling),
        u && (u.disabled = n <= 0),
        m && (m.disabled = n >= l - 1),
        console.log(
          `Rollout controls updated: Game ${n + 1}/${l}, Turn ${t}/${o}`
        );
    } catch (e) {
      console.error("Error updating rollout controls:", e),
        [
          "rollout-play",
          "rollout-pause",
          "rollout-stop",
          "rollout-prev",
          "rollout-next",
          "rollout-prev-game",
          "rollout-next-game",
        ].forEach((e) => {
          const t = document.getElementById(e);
          t && (t.disabled = !1);
        });
    }
}
window.addEventListener("load", initializeApp),
  (window.updateRolloutControls = updateRolloutControls);
