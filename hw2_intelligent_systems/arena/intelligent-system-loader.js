console.log("Loading IntelligentSystemInterface..."),
    window.compiledIntelligentSystems || (window.compiledIntelligentSystems = {}),
    (window.IntelligentSystemInterface = {
        analyzeStageWithSystem: async function (e, t, n) {
            console.log("analyzeStageWithSystem called with:", e, t);
            const o = document.getElementById("intelligent-system-status"),
                l = document.getElementById("intelligent-system-progress-bar"),
                r = document.getElementById("intelligent-system-progress");
            o &&
                ((o.textContent = `Analyzing ${t.name} with ${e}...`), (o.style.display = "block")),
                r && (r.style.display = "block"),
                l && (l.style.width = "30%");
            const i = window.console;
            try {
                if (!n || "string" != typeof n) throw new Error("No system code provided");
                if (!n.includes("function analyzeStage") && !n.includes("analyzeStage ="))
                    throw new Error(
                        "The intelligent system must implement an 'analyzeStage' function"
                    );
                console.log("Compiling system code..."), l && (l.style.width = "40%");
                const r = this.compileSystem(n);
                if ("function" != typeof r)
                    throw new Error("Failed to extract analyzeStage function");
                const a = [],
                    c = {
                        log: function (...e) {
                            a.push({ type: "log", args: e }), i.log("[Strategy]", ...e);
                        },
                        warn: function (...e) {
                            a.push({ type: "warn", args: e }), i.warn("[Strategy]", ...e);
                        },
                        error: function (...e) {
                            a.push({ type: "error", args: e }), i.error("[Strategy]", ...e);
                        },
                    },
                    d = this.createInitialBoard(t),
                    y = this.getValidMoves(d, 1),
                    g = {
                        getValidMoves: (e, t) => this.getValidMoves(e, t),
                        simulateMove: (e, t, n, o) => this.simulateMove(e, t, n, o),
                        evaluateBoard: (e, t) => this.evaluateBoard(e, t),
                    };
                let u;
                l && (l.style.width = "50%"), (window.console = c);
                try {
                    const e = r(t, d, y, g);
                    "function" != typeof e
                        ? (console.error("The analyzeStage function did not return a function"),
                          (u = null))
                        : (u = e);
                } finally {
                    (window.console = i),
                        console.log("---- Strategy Analysis Logs ----"),
                        a.forEach((e) => {
                            const t = e.type || "log";
                            console[t](...e.args);
                        }),
                        console.log("-------------------------------");
                }
                l && (l.style.width = "70%"),
                    u ||
                        (console.warn("Using fallback random strategy"),
                        (u = function (e, t, n) {
                            return n && 0 !== n.length
                                ? n[Math.floor(Math.random() * n.length)]
                                : null;
                        }));
                const f = `intelligent_${e}_${t.name.replace(/\s+/g, "_")}`;
                window.compiledIntelligentSystems[f] = u;
                const m = `\nfunction studentStrategy(board, player, validMoves, makeMove) {\n    // Generated for ${t.name} by ${e}\n    \n    // \ucef4\ud30c\uc77c\ub41c \uc804\ub7b5 \ud568\uc218 \ucc38\uc870\n    if (typeof window.compiledIntelligentSystems === 'undefined' || \n        !window.compiledIntelligentSystems["${f}"]) {\n        console.error("Strategy function not found");\n        return validMoves && validMoves.length > 0 ? validMoves[0] : null;\n    }\n    \n    try {\n        // \uc800\uc7a5\ub41c \uc804\ub7b5 \ud568\uc218 \ud638\ucd9c - \ud074\ub85c\uc800 \ubcf4\uc874\n        return window.compiledIntelligentSystems["${f}"](board, player, validMoves, makeMove);\n    } catch (error) {\n        console.error("Error in strategy execution:", error);\n        return validMoves && validMoves.length > 0 ? validMoves[0] : null;\n    }\n}`;
                return (
                    "undefined" != typeof OthelloStrategies &&
                        OthelloStrategies.saveStrategy &&
                        (OthelloStrategies.saveStrategy(f, m),
                        l && (l.style.width = "100%"),
                        o &&
                            ((o.textContent = `Analysis complete! Generated strategy: ${f}`),
                            (o.className = "intelligent-system-status upload-success")),
                        "function" == typeof updateStrategyList && updateStrategyList(),
                        "function" == typeof updateAISelectors && updateAISelectors()),
                    !0
                );
            } catch (s) {
                return (
                    console.error("Error analyzing system:", s),
                    o &&
                        ((o.textContent = `Error: ${s.message}`),
                        (o.className = "intelligent-system-status upload-error")),
                    l && (l.style.width = "0%"),
                    !1
                );
            } finally {
                window.console !== i && (window.console = i);
                const e = document.getElementById("upload-intelligent-system");
                e && (e.disabled = !1);
            }
        },
        compileSystem: function (e) {
            try {
                return new Function(
                    `\n                ${e}\n                return typeof analyzeStage === 'function' ? analyzeStage : null;\n            `
                )();
            } catch (t) {
                return console.error("Error compiling system:", t), null;
            }
        },
        createInitialBoard: function (e) {
            if (!e) return null;
            const t = e.boardSize || 8,
                n = Array(t)
                    .fill()
                    .map(() => Array(t).fill(0));
            return (
                e.initialBlocked &&
                    e.initialBlocked.forEach((e) => {
                        e.r >= 0 && e.r < t && e.c >= 0 && e.c < t && (n[e.r][e.c] = 3);
                    }),
                e.initialPlayer1 &&
                    e.initialPlayer1.forEach((e) => {
                        e.r >= 0 && e.r < t && e.c >= 0 && e.c < t && (n[e.r][e.c] = 1);
                    }),
                e.initialPlayer2 &&
                    e.initialPlayer2.forEach((e) => {
                        e.r >= 0 && e.r < t && e.c >= 0 && e.c < t && (n[e.r][e.c] = 2);
                    }),
                n
            );
        },
        getValidMoves: function (e, t) {
            if (!e) return [];
            const n = e.length,
                o = [];
            for (let l = 0; l < n; l++)
                for (let r = 0; r < n; r++)
                    this.isValidMove(e, l, r, t) && o.push({ row: l, col: r });
            return o;
        },
        isValidMove: function (e, t, n, o) {
            if (!e) return !1;
            const l = e.length;
            if (t < 0 || t >= l || n < 0 || n >= l) return !1;
            if (0 !== e[t][n]) return !1;
            const r = 1 === o ? 2 : 1,
                i = [
                    [-1, -1],
                    [-1, 0],
                    [-1, 1],
                    [0, -1],
                    [0, 1],
                    [1, -1],
                    [1, 0],
                    [1, 1],
                ];
            for (const [s, a] of i) {
                let i = t + s,
                    c = n + a,
                    d = !1;
                for (; i >= 0 && i < l && c >= 0 && c < l && e[i][c] === r; )
                    (d = !0), (i += s), (c += a);
                if (d && i >= 0 && i < l && c >= 0 && c < l && e[i][c] === o) return !0;
            }
            return !1;
        },
        simulateMove: function (e, t, n, o) {
            if (!e || !this.isValidMove(e, n, o, t)) return { valid: !1 };
            const l = e.length,
                r = e.map((e) => [...e]),
                i = 1 === t ? 2 : 1,
                s = [
                    [-1, -1],
                    [-1, 0],
                    [-1, 1],
                    [0, -1],
                    [0, 1],
                    [1, -1],
                    [1, 0],
                    [1, 1],
                ];
            r[n][o] = t;
            let a = 0;
            for (const [e, c] of s) {
                let s = n + e,
                    d = o + c;
                const y = [];
                for (; s >= 0 && s < l && d >= 0 && d < l && r[s][d] === i; )
                    y.push([s, d]), (s += e), (d += c);
                if (y.length > 0 && s >= 0 && s < l && d >= 0 && d < l && r[s][d] === t) {
                    for (const [e, n] of y) r[e][n] = t;
                    a += y.length;
                }
            }
            return { valid: !0, resultingBoard: r, capturedCount: a };
        },
        evaluateBoard: function (e, t) {
            if (!e) return { totalScore: 0 };
            const n = e.length,
                o = 1 === t ? 2 : 1;
            let l = 0,
                r = 0,
                i = 0,
                s = 0;
            for (let a = 0; a < n; a++)
                for (let c = 0; c < n; c++)
                    e[a][c] === t
                        ? (l++,
                          (0 !== a && a !== n - 1) || (0 !== c && c !== n - 1)
                              ? (0 !== a && a !== n - 1 && 0 !== c && c !== n - 1) || (s += 20)
                              : (i += 100))
                        : e[a][c] === o && r++;
            const a = this.getValidMoves(e, t).length - this.getValidMoves(e, o).length;
            return {
                pieceScore: l - r,
                mobilityScore: a,
                cornerScore: i,
                edgeScore: s,
                totalScore: l - r + 2 * a + i + 0.5 * s,
            };
        },
    }),
    console.log(
        "IntelligentSystemInterface loaded successfully:",
        window.IntelligentSystemInterface
    );
