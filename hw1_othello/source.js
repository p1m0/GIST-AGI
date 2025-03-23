function countDiscsLocal(boardIn)
{
    let black = 0;
    let white = 0;
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (boardIn[row][col] === BLACK) {
                black++;
            } else if (boardIn[row][col] === WHITE) {
                white++;
            }
        }
    }
    
    return { black, white };
}

function countFreeSpaces(boardIn)
{
    let freeSpaces = 0;
    for (let row = 0; row < BOARD_SIZE; row++)
    {
        for (let col = 0; col < BOARD_SIZE; col++)
        {
            if (boardIn[row][col] === EMPTY)
            freeSpaces++;
        }
    }
    return freeSpaces;
}

function makeMoveLocal(row, col, boardIn, player, opponent)
{
    // Place the piece
    boardIn[row][col] = player;
    
    // Flip opponent pieces
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
    ];
    
    for (const [dr, dc] of directions)
    {
        let r = row + dr;
        let c = col + dc;
        const piecesToFlip = [];
        
        // Collect opponent pieces in this direction
        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && boardIn[r][c] === opponent)
        {
            piecesToFlip.push([r, c]);
            r += dr;
            c += dc;
        }
        
        // If line ends with our piece, flip all collected pieces
        if (piecesToFlip.length > 0 && r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && boardIn[r][c] === player)
        {
            for (const [fr, fc] of piecesToFlip)
                boardIn[fr][fc] = player;
        }
    }
}

function isValidMoveLocal(row, col, boardIn, player, opponent)
{
    // Must be an empty cell
    if (boardIn[row][col] !== EMPTY)
        return false;
    
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
    ];
    
    // Check in each direction
    for (const [dr, dc] of directions)
    {
        let r = row + dr;
        let c = col + dc;
        let foundOpponent = false;
        
        // Follow line of opponent pieces
        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && boardIn[r][c] === opponent)
        {
            foundOpponent = true;
            r += dr;
            c += dc;
        }
        
        // If line ends with our piece, it's a valid move
        if (foundOpponent && r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && boardIn[r][c] === player)
        {
            return true;
        }
    }
    
    return false;
}

function getValidMovesLocal(player, opponent, boardIn)
{
    const moves = [];
    
    for (let row = 0; row < BOARD_SIZE; row++)
    {
        for (let col = 0; col < BOARD_SIZE; col++)
        {
            if (isValidMoveLocal(row, col, boardIn, player, opponent))
                moves.push({ row, col });
        }
    }
    
    return moves;
}

function getWeightedRandomMove(validMoves)
{
    const positionWeights = [
        [100, 10, 80, 40, 40, 80, 10, 100],
        [10,   8, 20, 20, 20, 20,  8,  10],
        [80,  20, 40, 40, 40, 40, 20,  80],
        [40,  20, 40, 40, 40, 40, 20,  40],
        [40,  20, 40, 40, 40, 40, 20,  40],
        [80,  20, 40, 40, 40, 40, 20,  80],
        [10,   8, 20, 20, 20, 20,  8,  10],
        [100, 10, 80, 40, 40, 80, 10, 100],
    ];
    
    const moveWeights = validMoves.map(move => positionWeights[move.row][move.col]);
    const totalWeight = moveWeights.reduce((sum, weight) => sum + weight, 0);

    let randomValue = Math.random() * totalWeight;
    let weightSum = 0;

    for (let i = 0; i < validMoves.length; i++)
    {
        weightSum += moveWeights[i];
        if (randomValue <= weightSum)
            return validMoves[i];
    }

    // Fallback
    return validMoves[0];
}

function randomPlayout(boardIn, player, opponent)
{
    let boardCopy = boardIn.map(row => [...row]);
    let playerOnTurn = opponent;
    let playerNotOnTurn = player;
    while (true)
    {
        let validMoves = getValidMovesLocal(playerOnTurn, playerNotOnTurn, boardCopy);
        if (validMoves.length == 0)
        {
            let temp = playerOnTurn;
            playerOnTurn = playerNotOnTurn;
            playerNotOnTurn = temp;
            validMoves = getValidMovesLocal(playerOnTurn, playerNotOnTurn, boardCopy);
            if (validMoves.length == 0)
                break;
        }

        let move = getWeightedRandomMove(validMoves);
        makeMoveLocal(move.row, move.col, boardCopy, playerOnTurn, playerNotOnTurn);

        let temp = playerOnTurn;
        playerOnTurn = playerNotOnTurn;
        playerNotOnTurn = temp;
    }

    const { black, white } = countDiscsLocal(boardCopy);
    if (player == BLACK)
        return black > white ? 1 : -1;
    return black > white ? -1 : 1;
}

function mcts(boardIn, validMoves, player, opponent, timeLimit, numMovesToReturn, verbose)
{
    if (verbose)
        console.log(`Simple MCTS running...`);
    let moveScores = [];
    if (countFreeSpaces(boardIn) <= 16)
        timeLimit *= 1.1;
    const timePerMove = timeLimit / validMoves.length;
    
    let bestWinRate = -1;
    let totalGamesCount = 0;
    
    for (const move of validMoves)
    {
        const startTime = Date.now();
        let boardCopy = boardIn.map(row => [...row]);
        makeMoveLocal(move.row, move.col, boardCopy, player, opponent);
        let wins = 0;
        let losses = 0;
        while (Date.now() - startTime < timePerMove * 1000)
        {
            randomPlayout(boardCopy, player, opponent) == 1 ? wins++ : losses++
            totalGamesCount++;
        }

        winRate = wins / (wins + losses);
        moveScores.push({
            move,
            winRate
        });
        
        if (winRate > bestWinRate)
            bestWinRate = winRate
    }

    if (verbose)
        console.log(`[MCTS] Best win %: ${(100 * bestWinRate).toFixed(2)}, Total # of games: ${totalGamesCount}\n`);

    if (moveScores.length == 0)
    {
        console.error(`[MCTS] No moves selected\n`);
        return null;
    }
    moveScores.sort((a, b) => b.winRate - a.winRate);
    return moveScores.slice(0, Math.min(numMovesToReturn, moveScores.length)).map(item => item.move);
}

const verbose = true;
const timeLimitTotal = 0.05;
const timeLimit1 = 0.4 * timeLimitTotal;
const timeLimit2 = 0.6 * timeLimitTotal;

const opponent = player == BLACK ? WHITE : BLACK;
const validMoves = getValidMoves(player);

if (validMoves.length == 0)
{
    console.log(`[MCTS] No valid moves available\n`);
    return null;
}
else if (validMoves.length <= 5)
    return mcts(board, validMoves, player, opponent, timeLimit2 + timeLimit1, 1, verbose)[0];

top3Moves = mcts(board, validMoves, player, opponent, timeLimit1, 3, false);
return mcts(board, top3Moves, player, opponent, timeLimit2, 1, verbose)[0];