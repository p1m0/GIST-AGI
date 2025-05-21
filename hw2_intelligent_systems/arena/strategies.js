const OthelloStrategies = (function () {
  function e(e) {
    if (e.startsWith("custom_")) {
      const r = e.replace("custom_", "");
      if (c[r]) return c[r];
      if (a[r]) {
        console.log(`Compiling Othello strategy: ${r}`);
        const e = a[r];
        try {
          const o = new Function(
            "boardArg",
            "playerArg",
            "validMovesArg",
            "makeMoveFunc",
            `${e}\nreturn studentStrategy(boardArg, playerArg, validMovesArg, makeMoveFunc);`
          );
          return (c[r] = o), o;
        } catch (t) {
          return console.error(`Compile error for ${r}:`, t), null;
        }
      }
      return console.error(`Code not found for custom strategy: ${r}`), null;
    }
    return i[e]
      ? i[e]
      : (console.error(`Strategy function not found or invalid ID: ${e}`),
        null);
  }
  function t(e, t) {
    if (!e || !t)
      return console.error("Cannot save strategy: Missing name or code"), !1;
    t.includes("studentStrategy") ||
      t.includes("function(") ||
      console.warn("Code might not be valid"),
      (a[e] = t),
      (c[e] = null);
    try {
      localStorage.setItem("othelloStrategies", JSON.stringify(a));
    } catch (r) {
      console.error("Failed to save to localStorage:", r);
    }
    return !0;
  }
  function r(e) {
    if (!a[e]) return console.error(`Strategy "${e}" not found`), !1;
    delete a[e], delete c[e];
    try {
      localStorage.setItem("othelloStrategies", JSON.stringify(a));
    } catch (t) {
      console.error("Failed to update localStorage:", t);
    }
    return !0;
  }
  function o() {
    const e = localStorage.getItem("othelloStrategies");
    if (e)
      try {
        a = JSON.parse(e);
      } catch (t) {
        console.error("Error loading strategies:", t), (a = {});
      }
    else a = {};
    c = {};
  }
  function n() {
    return Object.keys(a);
  }
  function l(e) {
    return a[e] || null;
  }
  function s(e) {
    return new Promise((t) => {
      let r = 0,
        o = 0;
      const n = [];
      if (0 === e.length)
        return void t({ success: 0, errors: ["No files selected"] });
      let l = 0;
      Array.from(e).forEach((s) => {
        const i = new FileReader();
        (i.onload = (i) => {
          try {
            const e = i.target.result,
              t = s.name.replace(/\.js$/, "");
            if (!e || !t) throw new Error("Empty file or invalid name");
            if (!e.includes("studentStrategy") && !e.includes("function("))
              throw new Error(
                "The file must implement a 'studentStrategy' function"
              );
            if (e.includes("analyzeStage"))
              throw new Error("Do not upload intelligent system here");
            (a[t] = e), (c[t] = null), r++;
          } catch (u) {
            o++,
              n.push(`${s.name}: ${u.message}`),
              console.error(`File ${s.name} error:`, u);
          }
          if (++l === e.length) {
            try {
              localStorage.setItem("othelloStrategies", JSON.stringify(a));
            } catch (i) {
              n.push(`Storage error: ${i.message}`),
                console.error("Failed to save to localStorage:", i);
            }
            t({ success: r, errors: o > 0 ? n : [] });
          }
        }),
          (i.onerror = () => {
            o++,
              n.push(`${s.name}: Read error`),
              ++l === e.length && t({ success: r, errors: o > 0 ? n : [] });
          }),
          i.readAsText(s);
      });
    });
  }
  let a = {},
    c = {};
  const i = {
    random: function (e, t, r) {
      return 0 === r.length ? null : r[Math.floor(Math.random() * r.length)];
    },
    greedy: function (e, t, r) {
      if (0 === r.length) return null;
      const o =
        t === GAME_CONSTANTS.BLACK
          ? GAME_CONSTANTS.WHITE
          : GAME_CONSTANTS.BLACK;
      let n = null,
        l = -1;
      for (const s of r) {
        const r = e.map((e) => [...e]);
        let a = 0;
        r[s.row][s.col] = t;
        const c = [
          [-1, -1],
          [-1, 0],
          [-1, 1],
          [0, -1],
          [0, 1],
          [1, -1],
          [1, 0],
          [1, 1],
        ];
        for (const [e, n] of c) {
          let l = s.row + e,
            c = s.col + n;
          const i = [];
          for (
            ;
            l >= 0 && l < r.length && c >= 0 && c < r.length && r[l][c] === o;

          )
            i.push([l, c]), (l += e), (c += n);
          i.length > 0 &&
            l >= 0 &&
            l < r.length &&
            c >= 0 &&
            c < r.length &&
            r[l][c] === t &&
            (a += i.length);
        }
        a > l && ((l = a), (n = s));
      }
      return (
        null === n &&
          r.length > 0 &&
          (console.warn(
            "Greedy AI fallback: No move increased flips > -1, selecting random valid move."
          ),
          (n = r[Math.floor(Math.random() * r.length)])),
        n
      );
    },
    corners: function (e, t, r, o) {
      if (0 === r.length) return null;
      const n = e.length,
        l = r.filter(
          (e) =>
            !(
              (0 !== e.row && e.row !== n - 1) ||
              (0 !== e.col && e.col !== n - 1)
            )
        );
      if (l.length > 0) return l[0];
      const s = r.filter(
        (e) => 0 === e.row || e.row === n - 1 || 0 === e.col || e.col === n - 1
      );
      return s.length > 0
        ? s[Math.floor(Math.random() * s.length)]
        : i.greedy(e, t, r, o);
    },
    positional: function (e, t, r, o) {
      if (0 === r.length) return null;
      let n = null,
        l = -Infinity;
      if (8 !== e.length)
        return (
          console.warn(
            "Positional weights only valid for 8x8! Falling back to greedy."
          ),
          i.greedy(e, t, r, o)
        );
      const s = [
        [120, -20, 20, 5, 5, 20, -20, 120],
        [-20, -40, -5, -5, -5, -5, -40, -20],
        [20, -5, 15, 3, 3, 15, -5, 20],
        [5, -5, 3, 3, 3, 3, -5, 5],
        [5, -5, 3, 3, 3, 3, -5, 5],
        [20, -5, 15, 3, 3, 15, -5, 20],
        [-20, -40, -5, -5, -5, -5, -40, -20],
        [120, -20, 20, 5, 5, 20, -20, 120],
      ];
      for (const e of r) {
        const t = s[e.row][e.col];
        t > l && ((l = t), (n = e));
      }
      return n;
    },
  };
  return {
    getCompiledStrategy: e,
    saveStrategy: t,
    deleteStrategy: r,
    loadSavedStrategies: o,
    getStrategyNames: n,
    getStrategyCode: l,
    importStrategiesFromFiles: s,
    getBuiltInStrategyNames: () => Object.keys(i).filter((e) => "custom" !== e),
    getBuiltInStrategy: (e) => i[e] || null,
  };
})();
"undefined" != typeof module &&
  module.exports &&
  (module.exports = OthelloStrategies);
