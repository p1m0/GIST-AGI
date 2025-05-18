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

function generateInitialWeightTable(boardSize)
{
    // Create empty weight matrix
    const weights = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
    
    // We only need to calculate 1/4 of the board due to symmetry
    for (let i = 0; i < boardSize / 2; i++)
    {
        for (let j = 0; j < boardSize / 2; j++)
        {
            const weight = 10 + Math.random() * 90; // Random value between 10 and 100
            
            // Mirror to all four quadrants
            // weights[i][j] = weight;
            // weights[i][boardSize-1-j] = weight;
            // weights[boardSize-1-i][j] = weight;
            // weights[boardSize-1-i][boardSize-1-j] = weight;

            weights[i][j] = weight;
            weights[j][boardSize - 1 - i] = weight;
            weights[boardSize - 1 - i][boardSize - 1 - j] = weight;
            weights[boardSize - 1 - j][i] = weight;
        }
    }
    
    return weights;
}

function randomStrategy(validMoves, positionWeights)
{
    const length = validMoves.length;
    if (length === 0)
        return null;

    if (length === 1)
        return validMoves[0];

    let totalWeight = 0;
    for (let i = 0; i < length; i++)
    {
        const move = validMoves[i];
        totalWeight += positionWeights[move.row][move.col];
    }

    const randomValue = Math.random() * totalWeight;
    let weightSum = 0;

    for (let i = 0; i < length; i++)
    {
        const move = validMoves[i];
        weightSum += positionWeights[move.row][move.col];
        if (randomValue <= weightSum)
            return move;
    }

    // Fallback
    return validMoves[length - 1];
}

function positionalStrategy(validMoves, positionWeights)
{
    let bestMove = null;
    let bestScore = -1;

    for (let move of validMoves)
    {
        const score = positionWeights[move.row][move.col];
        if (score > bestScore)
        {
            bestScore = score;
            bestMove = move;
        }
    }
    return bestMove;
}

function playGame(positionWeights1, positionWeights2, initialBoard, strategyFn, api)
{
    let boardLocal = initialBoard.map(row => [...row]);

    let player1 = BLACK;
    let player2 = WHITE;
    let playerOnTurn = player1;
    let playerNotOnTurn = player2;

    while (true)
    {
        let validMoves = api.getValidMoves(boardLocal, playerOnTurn)
        if (validMoves.length == 0)
        {
            let temp = playerOnTurn;
            playerOnTurn = playerNotOnTurn;
            playerNotOnTurn = temp;
            validMoves = api.getValidMoves(boardLocal, playerOnTurn);
            if (validMoves.length == 0)
                break;
        }

        let move = strategyFn(validMoves, playerOnTurn == player1 ? positionWeights1 : positionWeights2);
        boardLocal = api.simulateMove(boardLocal, playerOnTurn, move.row, move.col).resultingBoard;

        let temp = playerOnTurn;
        playerOnTurn = playerNotOnTurn;
        playerNotOnTurn = temp;
    }

    const { black, white } = countDiscs(boardLocal);
    return black > white;
}

function evaluatePopulation(population, initialBoard, api)
{
    for (let i = 0; i < population.length; i++)
        population[i].fitness = 0;

    for (let i = 0; i < population.length; i++)
    {
        for (let j = i + 1; j < population.length; j++)
        {
            // Individual i plays as BLACK
            // Use positioin weight greedy strategy for both players
            let result = playGame(population[i].individual, population[j].individual,
                initialBoard, positionalStrategy, api);
            result == 1 ? population[i].fitness++ : population[j].fitness++;
            // Use weighted random strategy for both players
            result = playGame(population[i].individual, population[j].individual,
                    initialBoard, randomStrategy, api);
            result == 1 ? population[i].fitness++ : population[j].fitness++;
                    
            // Individual i plays as WHITE
            // Use positioin weight greedy strategy for both players
            result = playGame(population[j].individual, population[i].individual,
                initialBoard, positionalStrategy, api);
            result == 1 ? population[j].fitness++ : population[i].fitness++;
            // Use weighted random strategy for both players
            result = playGame(population[j].individual, population[i].individual,
                initialBoard, randomStrategy, api);
            result == 1 ? population[j].fitness++ : population[i].fitness++;
        }
    }
    return population;
}

function evaluatePopulationRandom(population, initialBoard, api)
{
    for (let i = 0; i < population.length; i++)
        population[i].fitness = 0;

    const numGamesPerIndividual = 10;
    for (let i = 0; i < population.length; i++)
    {
        for (let k = 0; k < numGamesPerIndividual; k++)
        {
            j = Math.floor(Math.random() * population.length);
            while (i == j)
                j = Math.floor(Math.random() * population.length);
            // Individual i plays as BLACK
            // Use positioin weight greedy strategy for both players
            let result = playGame(population[i].individual, population[j].individual,
                initialBoard, positionalStrategy, api);
            result == 1 ? population[i].fitness++ : population[j].fitness++;
            // Use weighted random strategy for both players
            result = playGame(population[i].individual, population[j].individual,
                    initialBoard, randomStrategy, api);
            result == 1 ? population[i].fitness++ : population[j].fitness++;
                    
            // Individual i plays as WHITE
            // Use positioin weight greedy strategy for both players
            result = playGame(population[j].individual, population[i].individual,
                initialBoard, positionalStrategy, api);
            result == 1 ? population[j].fitness++ : population[i].fitness++;
            // Use weighted random strategy for both players
            result = playGame(population[j].individual, population[i].individual,
                initialBoard, randomStrategy, api);
            result == 1 ? population[j].fitness++ : population[i].fitness++;
        }
    }
    return population;
}

function selectElite(population, eliteSize)
{
    population.sort((a, b) => b.fitness - a.fitness);
    return population.slice(0, Math.floor(population.length * eliteSize));
}

function selectParents(population)
{
    const tournamentSize = 5;
    let parent1 = null;
    let parent2 = null;
    for (let i = 0; i < tournamentSize; i++)
    {
        let randomIndex = Math.floor(Math.random() * population.length);
        if (parent1 == null || population[randomIndex].fitness > parent1.fitness)
            parent1 = population[randomIndex];
        randomIndex = Math.floor(Math.random() * population.length);
        if (parent2 == null || population[randomIndex].fitness > parent2.fitness)
            parent2 = population[randomIndex];
    }
    return [parent1, parent2];
}

function crossover(parent1, parent2, boardSize)
{
    let child = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
    
    for (let i = 0; i < boardSize / 2; i++)
    {
        for (let j = 0; j < boardSize / 2; j++)
        {
            // 50% chance of inheriting from each parent
            let weight = Math.random() < 0.5 ? parent1.individual[i][j] : parent2.individual[i][j];
            // child[i][j] = weight;
            // child[i][boardSize-1-j] = weight;
            // child[boardSize-1-i][j] = weight;
            // child[boardSize-1-i][boardSize-1-j] = weight;
            child[i][j] = weight;
            child[j][boardSize - 1 - i] = weight;
            child[boardSize - 1 - i][boardSize - 1 - j] = weight;
            child[boardSize - 1 - j][i] = weight;
        }
    }
    
    return { individual: child, fitness: 0 };
}

function mutate(positionWeights, mutationRate)
{
    const boardSize = positionWeights.length;
    for (let i = 0; i < boardSize / 2; i++)
    {
        for (let j = 0; j < boardSize / 2; j++)
        {
            if (Math.random() < mutationRate)
            {
                let mutation = 10 + Math.random() * 90; // Random value between 0 and 100

                positionWeights[i][j] = mutation;
                positionWeights[j][boardSize - 1 - i] = mutation;
                positionWeights[boardSize - 1 - i][boardSize - 1 - j] = mutation;
                positionWeights[boardSize - 1 - j][i] = mutation;
            }
        }
    }
    return positionWeights;
}

function getBestWeightTable(population)
{
    // Sort population by fitness
    population.sort((a, b) => b.fitness - a.fitness);
    
    // Return the best individual
    return population[0].individual;
}

function evolveWeightTables(boardSize, initialBoard, populationSize, mutationRate, eliteSize, timeLimit, api)
{
    let population = [];
    for (let i = 0; i < populationSize; i++)
        population.push({ individual: generateInitialWeightTable(boardSize), fitness: 0 });
    
    let gen = 0;
    const startTime = Date.now();
    let meanPopulationEvalTime = 0;
    console.log("Starting evolution...");
    // for (let gen = 0; gen < generations; gen++)
    while (Date.now() - startTime < timeLimit * 1000 - meanPopulationEvalTime * 2)
    {
        gen++;
        let populationEvalTime = Date.now();
        population = evaluatePopulation(population, initialBoard, api);
        populationEvalTime = Date.now() - populationEvalTime;

        meanPopulationEvalTime += (1 / gen) * (populationEvalTime - meanPopulationEvalTime);
        console.log(`Generation ${gen}, time elapsed: ${(Date.now() - startTime) / 1000} seconds, mean population eval time: ${meanPopulationEvalTime / 1000} seconds`);
        
        let nextGen = selectElite(population, eliteSize);
        
        while (nextGen.length < populationSize)
        {
            const [parent1, parent2] = selectParents(population);
            let child = crossover(parent1, parent2, boardSize);
            // We don't want to mutate for the last few generations
            if (Date.now() - startTime < (timeLimit - 4.2 * populationEvalTime) * 1000)
                child.individual = mutate(child.individual, mutationRate);
            nextGen.push(child);
        }
        
        population = nextGen;
    }
    
    population = evaluatePopulation(population, initialBoard, api);
    return getBestWeightTable(population);
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

function analyzeStage(stageConfig, initialBoard, validMoves, api)
{
    // Analysis code runs within 60 seconds
    // TODO: detect fewerPiecesContinue to adjust max_time
    console.log('Api properties:', Object.getOwnPropertyNames(api));
    console.log('Api full inspection:', JSON.stringify(api, null, 2));

    const populationSize = 80;
    const mutationRate = 0.01;
    const eliteSize = 0.3;
    const timeLimit = 59;

    let positionWeights = evolveWeightTables(stageConfig.boardSize, initialBoard, populationSize,
        mutationRate, eliteSize, timeLimit, api);
    
    positionWeights = positionWeights.map(row => row.map(weight => Math.round(weight)));

    if (stageConfig.initialBlocked && stageConfig.initialBlocked.length > 0)
    {
        for (const {r, c} of stageConfig.initialBlocked)
            positionWeights[r][c] = 0;
    }
    console.log("Best position weights:");
    console.log(positionWeights);

    // TODO: detect fewerPiecesContinue to adjust max_time
    max_time = 2 * 10 / ((stageConfig.boardSize * stageConfig.boardSize - 4 - stageConfig.initialBlocked.length));
    max_time *= 0.9; // Add some leeway
    console.log("Max time [s]: " + max_time);

    return function(board, player, validMoves, makeMove)
    {
        const verbose = false;
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
    };
}