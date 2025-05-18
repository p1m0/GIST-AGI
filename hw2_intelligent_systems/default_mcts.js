const EMPTY = 0; const BLACK = 1; const WHITE = 2; const BLOCKED = 3;


function countDiscs(boardLocal)
{
    let black = 0;
    let white = 0;
    
    for (let row = 0; row < boardLocal.length; row++)
    {
        for (let col = 0; col < boardLocal.length; col++)
        {
            if (boardLocal[row][col] === BLACK)
                black++;
            else if (boardLocal[row][col] === WHITE)
                white++;
        }
    }
    
    return { black, white };
}

function randomStrategy(validMoves, positionWeights)
{
    if (validMoves.length === 0)
        return null;
    if (positionWeights == null)
        return validMoves[Math.floor(Math.random() * validMoves.length)];
    
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

function randomPlayout(boardLocal, player, opponent, positionWeights, api)
{
    let playerOnTurn = opponent;
    let playerNotOnTurn = player;
    while (true)
    {
        let validMoves = api.getValidMoves(boardLocal, playerOnTurn);
        if (validMoves.length == 0)
        {
            let temp = playerOnTurn;
            playerOnTurn = playerNotOnTurn;
            playerNotOnTurn = temp;
            validMoves = api.getValidMoves(boardLocal, playerOnTurn);
            if (validMoves.length == 0)
                break;
        }

        let move = randomStrategy(validMoves, positionWeights);
        boardLocal = api.simulateMove(boardLocal, playerOnTurn, move.row, move.col).resultingBoard;

        let temp = playerOnTurn;
        playerOnTurn = playerNotOnTurn;
        playerNotOnTurn = temp;
    }

    const { black, white } = countDiscs(boardLocal);
    if (player == BLACK)
        return black > white ? 1 : -1;
    return black > white ? -1 : 1;
}

function mcts(boardLocal, validMoves, player, opponent, timeLimit, numMovesToReturn, positionWeights, api, verbose)
{
    if (verbose)
        console.log(`Simple MCTS running...`);
    let moveScores = [];
    const timePerMove = timeLimit / validMoves.length;
    
    let bestWinRate = -1;
    let totalGamesCount = 0;
    
    for (const move of validMoves)
    {
        const startTime = Date.now();
        newBoard = api.simulateMove(boardLocal, player, move.row, move.col).resultingBoard;
        let wins = 0;
        let losses = 0;
        while (Date.now() - startTime < timePerMove * 1000)
        {
            randomPlayout(newBoard, player, opponent, positionWeights, api) == 1 ? wins++ : losses++
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
        if (verbose)
            console.error(`[MCTS] No moves selected\n`);
        return null;
    }
    moveScores.sort((a, b) => b.winRate - a.winRate);
    return moveScores.slice(0, Math.min(numMovesToReturn, moveScores.length)).map(item => item.move);
}

function studentStrategy(board, player, validMoves, makeMove)
{
    api = window.IntelligentSystemInterface;
    console.log('Api properties:', Object.getOwnPropertyNames(api));
    console.log('Api full inspection:', JSON.stringify(api, null, 2));
    // const positionWeights = [
    //     [100, 10, 80, 40, 40, 80, 10, 100],
    //     [10,   8, 20, 20, 20, 20,  8,  10],
    //     [80,  20, 40, 40, 40, 40, 20,  80],
    //     [40,  20, 40, 40, 40, 40, 20,  40],
    //     [40,  20, 40, 40, 40, 40, 20,  40],
    //     [80,  20, 40, 40, 40, 40, 20,  80],
    //     [10,   8, 20, 20, 20, 20,  8,  10],
    //     [100, 10, 80, 40, 40, 80, 10, 100],
    // ];
    const positionWeights = null;

    const verbose = false;
    let max_time = 2 * 10 / ((board.length * board.length - 4));
    max_time *= 0.9;
    const timeLimitTotal = max_time;
    const timeLimit1 = 0.4 * timeLimitTotal;
    const timeLimit2 = 0.6 * timeLimitTotal;

    const opponent = player == BLACK ? WHITE : BLACK;

    if (validMoves.length == 0)
    {
        if (verbose)
            console.log(`[MCTS] No valid moves available\n`);
        return null;
    }
    else if (validMoves.length <= 5)
        return mcts(board, validMoves, player, opponent, timeLimit2 + timeLimit1, 1, positionWeights, api, verbose)[0];

    top3Moves = mcts(board, validMoves, player, opponent, timeLimit1, 3, positionWeights, api, false);
    return mcts(board, top3Moves, player, opponent, timeLimit2, 1, positionWeights, api, verbose)[0];
}