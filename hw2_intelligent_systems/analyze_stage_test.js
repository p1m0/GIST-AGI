// const EMPTY = 0; const BLACK = 1; const WHITE = 2; const BLOCKED = 3;
// let BOARD_SIZE = 8;
// let board = [];

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
            const weight = Math.random() * 100; // Random value between 0 and 100
            
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
    if (validMoves.length === 0)
        return null;
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
        validMoves = api.getValidMoves(boardLocal, playerOnTurn)
        if (validMoves.length == 0)
        {
            let temp = playerOnTurn;
            playerOnTurn = playerNotOnTurn;
            playerNotOnTurn = temp;
            validMoves = api.getValidMoves(boardLocal, playerOnTurn);
            if (validMoves.length == 0)
                break;
        }

        // let move = positionalStrategy(validMoves, playerOnTurn == player1 ? positionWeights1 : positionWeights2);
        let move = strategyFn(validMoves, playerOnTurn == player1 ? positionWeights1 : positionWeights2);
        simulateMoveRet = api.simulateMove(boardLocal, playerOnTurn, move.row, move.col);
        if (!simulateMoveRet.valid)
            console.error("Invalid move attempted");
        boardLocal = simulateMoveRet.resultingBoard;

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
            weight = Math.random() < 0.5 ? parent1.individual[i][j] : parent2.individual[i][j];
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
                mutation = Math.random() * 100; // Random value between 0 and 100
                // positionWeights[i][j] = weight; // 0 1
                // positionWeights[i][boardSize-1-j] = weight; // 0 6
                // positionWeights[boardSize-1-i][j] = weight;
                // positionWeights[boardSize-1-i][boardSize-1-j] = weight;

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
    console.log("Starting evolution...");
    // for (let gen = 0; gen < generations; gen++)
    while (Date.now() - startTime < timeLimit * 1000)
    {
        gen++;
        console.log(`Generation ${gen}`);
        population = evaluatePopulation(population, initialBoard, api);
        
        const elite = selectElite(population, eliteSize);
        let nextGen = [...elite];
        
        
        while (nextGen.length < populationSize)
        {
            const [parent1, parent2] = selectParents(population);
            let child = crossover(parent1, parent2, boardSize);
            // if (gen < generations - 2)
            if (Date.now() - startTime < (timeLimit - 10) * 1000)
                child.individual = mutate(child.individual, mutationRate);
            nextGen.push(child);
        }
        
        population = nextGen;
        for (let i = 0; i < nextGen.length; i++)
            nextGen[i].fitness = 0;
    }
    
    population = evaluatePopulation(population, initialBoard, api);
    return getBestWeightTable(population);
}

function analyzeStage(stageName, boardSize, initialBoard, validMoves)
{
    // const weights = Array(boardSize).fill().map(() => Array(boardSize).fill(0));
    
    // // We only need to calculate 1/4 of the board due to symmetry
    // for (let i = 0; i < boardSize / 2; i++)
    // {
    //     for (let j = 0; j < boardSize / 2; j++)
    //     {
    //         console.log(`i: ${i}, j: ${j}`);
    //         let weight = i * boardSize / 2 + j;
            
    //         // Mirror to all four quadrants
    //         // weights[i][j] = weight;
    //         // weights[i][boardSize-1-j] = weight;
    //         // weights[boardSize-1-i][j] = weight;
    //         // weights[boardSize-1-i][boardSize-1-j] = weight;
    //         console.log(`First: ${i}, j: ${j}`);
    //         weights[i][j] = weight; // 0 1

    //         console.log(`Second: ${j}, j: ${boardSize - 1 - i}`);
    //         weights[j][boardSize - 1 - i] = weight; // 1 7

    //         console.log(`Third: ${boardSize - 1 - i}, j: ${boardSize - 1 - j}`);
    //         weights[boardSize - 1 - i][boardSize - 1 - j] = weight; // 7 6
            
    //         console.log(`Fourth: ${boardSize - 1 - j}, j: ${i}`);
    //         weights[boardSize - 1 - j][i] = weight; // 6 0
    //     }
    // }
    // console.table(weights);

    // Analysis code runs within 60 seconds
    const stageConfig = window.stages.find(stage => stage.name === stageName);
    console.log("Current stage config:", stageConfig);
    const api = window.systemInterface.getInteractionAPI(stageConfig)
   
    const populationSize = 80;
    const mutationRate = 0.01;
    const eliteSize = 0.3;
    const timeLimit = 10;

    const positionWeights = evolveWeightTables(boardSize, initialBoard, populationSize,
        mutationRate, eliteSize, timeLimit, api);
    
    console.log("Best position weights:");
    console.table(positionWeights);

    if (stageConfig.initialBlocked && stageConfig.initialBlocked.length > 0)
    {
        console.log("Initial blocked positions:");
        console.table(stageConfig.initialBlocked);
        for (const {r, c} of stageConfig.initialBlocked)
        {
            console.log(`Blocked: ${r}, ${c}`);
            positionWeights[r][c] = 0;
        }
    }

    const weightsStr = JSON.stringify(positionWeights);
    console.log("Weights string:", weightsStr);
    
    // Return a function with the weights embedded as a string literal
    return Function('board', 'player', 'validMoves', 'makeMove', `
        // Recreate weights from embedded string
        const positionWeights = ${weightsStr};
        
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
    `);
    // // Must return a strategy function with this signature:
    // return function(board, player, validMoves, makeMove)
    // {
    //     if (validMoves.length === 0)
    //         return null;
    //     return validMoves[Math.floor(Math.random() * validMoves.length)];
    // };
}