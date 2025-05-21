const stages = [
    {
        name: "Standard 8x8",
        boardSize: 8,
        initialBlocked: [],
        initialPlayer1: [
            { r: 3, c: 4 },
            { r: 4, c: 3 },
        ],
        initialPlayer2: [
            { r: 3, c: 3 },
            { r: 4, c: 4 },
        ],
    },
    {
        name: "Small Board (6x6)",
        boardSize: 6,
        initialBlocked: [],
        initialPlayer1: [
            { r: 2, c: 3 },
            { r: 3, c: 2 },
        ],
        initialPlayer2: [
            { r: 2, c: 2 },
            { r: 3, c: 3 },
        ],
    },
    {
        name: "8x8 (Partial C-Squares-cw)",
        boardSize: 8,
        initialBlocked: [
            { r: 0, c: 1 },
            { r: 1, c: 7 },
            { r: 7, c: 6 },
            { r: 6, c: 0 },
        ],
        initialPlayer1: [
            { r: 3, c: 4 },
            { r: 4, c: 3 },
        ],
        initialPlayer2: [
            { r: 3, c: 3 },
            { r: 4, c: 4 },
        ],
    },
    {
        name: "10x10 (Corner Missing)",
        boardSize: 10,
        initialBlocked: [
            { r: 0, c: 4 },
            { r: 0, c: 5 },
            { r: 1, c: 4 },
            { r: 1, c: 5 },
            { r: 8, c: 4 },
            { r: 8, c: 5 },
            { r: 9, c: 4 },
            { r: 9, c: 5 },
            { r: 4, c: 0 },
            { r: 5, c: 0 },
            { r: 4, c: 1 },
            { r: 5, c: 1 },
            { r: 4, c: 8 },
            { r: 5, c: 8 },
            { r: 4, c: 9 },
            { r: 5, c: 9 },
        ],
        initialPlayer1: [
            { r: 4, c: 5 },
            { r: 5, c: 4 },
        ],
        initialPlayer2: [
            { r: 4, c: 4 },
            { r: 5, c: 5 },
        ],
    },
];
"undefined" != typeof module && module.exports && (module.exports = stages);
