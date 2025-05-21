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
    
    let bestWinRate = -1;
    let totalGamesCount = 0;
    
    for (const move of validMoves)
    {
        newBoard = api.simulateMove(boardLocal, player, move.row, move.col).resultingBoard;
        let wins = 0;
        let losses = 0;
        for (let i = 0; i < 2; i++)
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
    const startTime = Date.now();
    api = window.IntelligentSystemInterface;
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

    const verbose = true;

    const opponent = player == BLACK ? WHITE : BLACK;
    const move = mcts(board, validMoves, player, opponent, 0, 1, positionWeights, api, verbose)[0];
    console.log('MCTS run for ' + (Date.now() - startTime) + 'ms');
    return move;
}