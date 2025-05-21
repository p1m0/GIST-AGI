const Tournament = (function () {
  function e() {
    (y = document.getElementById("tournament-status")),
      (w = document.getElementById("stageSelect")),
      (b = document.getElementById("black-ai")),
      (G = document.getElementById("white-ai")),
      (stopTournamentButton = document.getElementById("stop-tournament-btn")),
      (runTournamentButton = document.getElementById("run-tournament-btn")),
      stopTournamentButton && (stopTournamentButton.disabled = !h);
  }
  function t() {
    return "undefined" != typeof OthelloCore && OthelloCore.countDiscs
      ? OthelloCore.countDiscs()
      : { black: 0, white: 0 };
  }
  function o(e) {
    "undefined" != typeof OthelloUI && OthelloUI.logMessage
      ? OthelloUI.logMessage(e)
      : console.log(e);
  }
  function n() {
    "undefined" != typeof OthelloStrategies &&
      (OthelloStrategies.getBuiltInStrategyNames().forEach((e) => {
        I[e] = OthelloStrategies.getBuiltInStrategy(e);
      }),
      OthelloStrategies.getStrategyNames().forEach((e) => {
        S[e] = OthelloStrategies.getStrategyCode(e);
      }));
  }
  function a(e, o, n) {
    const a = t(),
      r = {
        black: e,
        white: o,
        winner: n,
        date: new Date().toISOString(),
        score: a,
      };
    f.matches.push(r),
      [e, o].forEach((e) => {
        f.results[e] ||
          (f.results[e] = { wins: 0, losses: 0, draws: 0, totalGames: 0 });
      }),
      1 === n
        ? (f.results[e].wins++, f.results[o].losses++)
        : 2 === n
        ? (f.results[e].losses++, f.results[o].wins++)
        : (f.results[e].draws++, f.results[o].draws++),
      f.results[e].totalGames++,
      f.results[o].totalGames++,
      s();
  }
  function r() {
    const e = document.getElementById("leaderboard-body");
    if (!e) return;
    e.innerHTML = "";
    const t = Object.keys(f.results).map((e) => {
      const t = f.results[e];
      return {
        name: e,
        wins: t.wins,
        losses: t.losses,
        draws: t.draws,
        totalGames: t.totalGames,
        winRate:
          t.totalGames > 0
            ? (((t.wins + 0.5 * t.draws) / t.totalGames) * 100).toFixed(1)
            : 0,
      };
    });
    t.sort((e, t) => t.winRate - e.winRate || t.wins - e.wins),
      t.forEach((t, o) => {
        const n = document.createElement("tr");
        (n.innerHTML = `<td>${o + 1}</td><td>${t.name}</td><td>${
          t.winRate
        }%</td><td>${t.wins}</td><td>${t.losses}</td><td>${t.draws}</td><td>${
          t.totalGames
        }</td>`),
          (n.style.animation = "fadeIn 0.5s"),
          e.appendChild(n);
      });
    const o = document.createElement("style");
    (o.textContent =
      "\n        @keyframes fadeIn {\n            from { opacity: 0; background-color: rgba(76, 175, 80, 0.2); }\n            to { opacity: 1; background-color: transparent; }\n        }\n        "),
      document.head.appendChild(o);
  }
  function s() {
    try {
      localStorage.setItem("othelloLeaderboard", JSON.stringify(f));
    } catch (e) {
      console.error("Failed to save leaderboard data:", e);
    }
  }
  function l() {
    e();
    const t = localStorage.getItem("othelloLeaderboard");
    if (t)
      try {
        f = JSON.parse(t);
      } catch (o) {
        console.error("Error loading leaderboard data:", o),
          (f = { matches: [], results: {} });
      }
    else f = { matches: [], results: {} };
    r();
  }
  async function u() {
    if (!((b && G) || (e(), b && G)))
      return (
        console.error("AI select elements not found"),
        Promise.reject("UI elements not found")
      );
    const o = b.options[b.selectedIndex].text,
      n = G.options[G.selectedIndex].text;
    return new Promise((e) => {
      if ("undefined" == typeof GameController || !GameController.startGame)
        return console.error("GameController module not available"), void e(!1);
      GameController.startGame(!0, p);
      const s = setInterval(() => {
        if (
          !("undefined" != typeof OthelloCore && OthelloCore.isGameRunning())
        ) {
          clearInterval(s);
          const l = t();
          let u = 0;
          if (
            (l.black > l.white ? (u = 1) : l.white > l.black && (u = 2),
            a(o, n, u),
            r(),
            y && h)
          ) {
            const e = f.matches.length,
              t = d().length * (d().length - 1);
            y.textContent = `Running... (${e}/${t})`;
          }
          e();
        }
      }, 20);
    });
  }
  async function i() {
    if (h) return;
    e(),
      (h = !0),
      console.log("=== Othello Tournament Start ==="),
      y && (y.textContent = "Running...");
    const t = document.getElementById("run-tournament-btn");
    t && (t.disabled = !0),
      stopTournamentButton && (stopTournamentButton.disabled = !1),
      n();
    const a = d();
    if (a.length < 2)
      return y && (y.textContent = "Need >= 2 AIs"), void (h = !1);
    if (!w)
      return console.error("Stage select element not found"), void (h = !1);
    const l = parseInt((w && w.value) || 0);
    (p = stages[l >= 0 && l < stages.length ? l : 0]),
      console.log(`Tournament using stage: ${p.name}`),
      o(`=== Tournament Start on Stage: ${p.name} ===`);
    const i = a.length * (a.length - 1);
    let c = 0;
    (f = { matches: [], results: {} }), r();
    for (let e = 0; e < a.length; e++) {
      for (let t = 0; t < a.length; t++) {
        if (e === t) continue;
        const n = a[e],
          r = a[t];
        if ((c++, y && h && (y.textContent = `Running... (${c}/${i})`), !h)) {
          console.log("Tournament stopped during execution");
          break;
        }
        o(`\n===== Game ${c}/${i} =====`),
          o(`${n.name}(B) vs ${r.name}(W)`),
          console.log(`Game ${c}: ${n.name} vs ${r.name}`),
          await new Promise((e) => setTimeout(e, 10)),
          b && G
            ? ((b.value = n.id), (G.value = r.id), await u())
            : console.error("AI select elements not found");
      }
      if (!h) {
        console.log("Tournament stopped during execution");
        break;
      }
    }
    s(),
      r(),
      h &&
        ((y.textContent = `Complete! (${i} games on ${p.name})`),
        (h = !1),
        o("=== Tournament Finished ==="),
        console.log("=== Othello Tournament Finished ===")),
      t && (t.disabled = !1),
      stopTournamentButton && (stopTournamentButton.disabled = !0),
      m();
  }
  function m() {
    if (
      "undefined" != typeof GameLogger &&
      GameLogger.previousGames &&
      0 !== GameLogger.previousGames.length
    )
      try {
        const t = document.getElementById("log-input");
        if (t) {
          (() => {
            const e =
              GameLogger.previousGames[GameLogger.previousGames.length - 1];
            if (e && e.logText) t.value = e.logText;
            else {
              const e = GameLogger.previousGames.map((e, t) => {
                if (e.metadata) {
                  const {
                    blackStrategy: o,
                    whiteStrategy: n,
                    stage: a,
                    blackScore: r,
                    whiteScore: s,
                  } = e.metadata;
                  return `Game ${t + 1}: ${o}(B) ${r}-${s} ${n}(W) on ${a}`;
                }
                return `Game ${t + 1}: (No metadata available)`;
              });
              t.value = e.join("\n\n");
            }
          })();
        }
        if ("undefined" != typeof window.gameRollout) {
          window.gameRollout.analyzeGameBoundaries();
          const e = GameLogger.previousGames.length - 1;
          (window.gameRollout.currentGameIndex = e),
            (window.gameRollout.currentMoveIndex = -1),
            "function" == typeof updateRolloutControls &&
              updateRolloutControls(),
            console.log("Rollout setup completed for tournament games");
          const t = document.querySelector(".rollout-controls");
          t && t.scrollIntoView({ behavior: "smooth" });
        }
      } catch (e) {
        console.error("Error setting up rollout after tournament:", e);
      }
    else console.warn("No previous games available for rollout");
  }
  function d() {
    const e = [];
    return (
      "undefined" != typeof OthelloStrategies &&
        (OthelloStrategies.getBuiltInStrategyNames()
          .filter((e) => "custom" !== e)
          .sort()
          .forEach((t) =>
            e.push({ id: t, name: t.charAt(0).toUpperCase() + t.slice(1) })
          ),
        OthelloStrategies.getStrategyNames()
          .sort()
          .forEach((t) => e.push({ id: `custom_${t}`, name: t }))),
      e
    );
  }
  function c() {
    if (!h)
      return (
        console.log("No tournament running to stop"),
        y && (y.textContent = "No tournament is currently running."),
        !1
      );
    console.log("Tournament manually stopped by user"),
      (h = !1),
      o("=== Tournament Interrupted ==="),
      o(`Match was manually stopped after ${f.matches.length} games.`),
      y &&
        (y.textContent = `Competition stopped after ${f.matches.length} games.`),
      s();
    const e = document.getElementById("run-tournament-btn");
    return e && (e.disabled = !1), (h = !1), r(), m(), !0;
  }
  function g() {
    if (h)
      return (
        console.warn(
          "Cannot reset tournament data while a tournament is running."
        ),
        !1
      );
    stopTournamentButton && (stopTournamentButton.disabled = !0),
      (f = { matches: [], results: {} });
    try {
      localStorage.removeItem("othelloLeaderboard");
    } catch (e) {
      console.error("Failed to remove from localStorage:", e);
    }
    return (
      r(),
      y && (y.textContent = "Competition records have been reset."),
      console.log("Competition records reset."),
      !0
    );
  }
  let f = { matches: [], results: {} },
    h = !1,
    p = null,
    y = null,
    w = null,
    b = null,
    G = null,
    I = {},
    S = {};
  return {
    recordGameResult: a,
    updateLeaderboardDisplay: r,
    saveLeaderboardData: s,
    loadLeaderboardData: l,
    runTournament: i,
    getAllStrategies: d,
    playTournamentGame: u,
    resetLeaderboard: g,
    stopTournament: c,
    isRunning: () => h,
  };
})();
"undefined" != typeof module && module.exports && (module.exports = Tournament);
