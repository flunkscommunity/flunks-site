function AITrainer(){

    this.AIPolicy = new AIPolicy();
    this.sessionStarting = false; // Flag to prevent double-triggering
    this.isPlayingTurn = false; // Flag to track when AI is executing its shot

}

AITrainer.prototype.init = function(state, gamePolicy){

    AI.opponents = [];
    AI.currentOpponent = new Opponent();
    AI.finishedSession = true;
    AI.iteration = 0;
    AI.isPlayingTurn = false; // Reset when initializing
    AI.sessionStarting = false;

    AI.bestOpponentIndex = 0;
    AI.bestOpponentEval = 0;

    if(gamePolicy.foul){
        //TO DO: Pick best position for the white ball.
        state.whiteBall.position.x = 413;
        state.whiteBall.position.y = 413;
        state.whiteBall.inHole = false;
        gamePolicy.foul = false;
    }
    AI.initialState = JSON.parse(JSON.stringify(state));
    AI.initialGamePolicyState = JSON.parse(JSON.stringify(gamePolicy));

    AI.state = state;
    AI.gamePolicy = gamePolicy;

}

AITrainer.prototype.train = function(){

    // Only log start and end to avoid performance issues
    if(AI.iteration === 0) console.log('[AI] Training started, iterations:', TRAIN_ITER);

    if(AI.iteration === TRAIN_ITER){
        console.log('[AI] Training complete after', TRAIN_ITER, 'iterations');
        AI.finishedSession = true;
        AI.playTurn();
        return;
    }

    let ballsMoving = AI.state.ballsMoving();

    if(!ballsMoving){

        if(AI.iteration !== 0){
            AI.currentOpponent.evaluation = AI.AIPolicy.evaluate(this.state, this.gamePolicy);

            AI.opponents.push(JSON.parse(JSON.stringify(AI.currentOpponent)));

            if(AI.currentOpponent.evaluation > AI.bestOpponentEval){
                AI.bestOpponentEval = AI.currentOpponent.evaluation;
                AI.bestOpponentIndex =  AI.opponents.length - 1;
            }

            if(LOG){
                console.log('-------------'+new Number(AI.iteration+1)+'--------------------');
                console.log('Current evaluation: ' + AI.currentOpponent.evaluation);
                console.log('Current power: ' + AI.currentOpponent.power);
                console.log('Current rotation: ' + AI.currentOpponent.rotation);
                console.log('---------------------------------');
            }
        }

        AI.state.initiateState(AI.initialState.balls);
        AI.gamePolicy.initiateState(AI.initialGamePolicyState);
        AI.buildNewOpponent();
        AI.simulate();
    }

}

AITrainer.prototype.buildNewOpponent = function(){

    if(AI.iteration % 10 === 0){
        AI.currentOpponent = new Opponent();
        AI.iteration++;
        return;
    }

    let bestOpponent = AI.opponents[AI.bestOpponentIndex];

    let newPower = bestOpponent.power;
    newPower += + ((Math.random() * 30) - 15);
    newPower = newPower < 20 ? 20 : newPower;
    newPower = newPower > 75 ? 75 : newPower;

    let newRotation = bestOpponent.rotation;

    if(bestOpponent.evaluation > 0){
        newRotation += (1/bestOpponent.evaluation)*(Math.random() * 2 * Math.PI - Math.PI)
    }
    else{
        newRotation = (Math.random() * 2 * Math.PI - Math.PI);
    }

    AI.currentOpponent = new Opponent(newPower,newRotation);

    AI.iteration++;

}

AITrainer.prototype.simulate = function(){
    AI.state.stick.shoot(AI.currentOpponent.power, AI.currentOpponent.rotation);
}

AITrainer.prototype.playTurn = function(){

    console.log('[AI] playTurn() called, isPlayingTurn:', AI.isPlayingTurn);

    // Prevent re-entry while playing
    if(AI.isPlayingTurn) {
        console.log('[AI] playTurn() blocked - already playing');
        return;
    }
    AI.isPlayingTurn = true;

    bestOpponent = AI.opponents[AI.bestOpponentIndex];
    console.log('[AI] Best opponent power:', bestOpponent.power, 'rotation:', bestOpponent.rotation);
    Game.gameWorld.stick.rotation = bestOpponent.rotation;
    Game.gameWorld.stick.trackMouse = false;

    setTimeout(() => {
        console.log('[AI] First timeout - resetting state and showing stick');

        Game.gameWorld.stick.visible = true;
        Canvas2D.clear();
        Game.gameWorld.draw();

        Game.sound = true;
        Game.gameWorld.initiateState(AI.initialState.balls);
        Game.policy.initiateState(AI.initialGamePolicyState);

        DISPLAY = true;
        
        requestAnimationFrame(Game.mainLoop);

        setTimeout(() => {
            console.log('[AI] Second timeout - executing shot');
            Game.gameWorld.stick
            .shoot(
                bestOpponent.power, 
                bestOpponent.rotation,
                1200
            );
            Game.gameWorld.stick.trackMouse = true;
            
            // Allow next turn after shot is executed
            setTimeout(() => {
                console.log('[AI] Third timeout - resetting isPlayingTurn');
                AI.isPlayingTurn = false;
            }, 500);
        }, 700);

    }, 1000);
}

AITrainer.prototype.opponentTrainingLoop = function(){

    Game.sound = false;
    DISPLAY = false;

    if(DISPLAY_TRAINING){
        if(!AI.finishedSession){
            AI.train();
            Game.gameWorld.handleInput(DELTA);
            Game.gameWorld.update(DELTA);
            Canvas2D.clear();
            Game.gameWorld.draw();
            Mouse.reset();
            setTimeout(AI.opponentTrainingLoop,0.00000000001);
        }
    }
    else{
        while(!AI.finishedSession){
            AI.train();
            Game.gameWorld.handleInput(DELTA);
            Game.gameWorld.update(DELTA);
            Mouse.reset();
        }
    }

}

AITrainer.prototype.startSession = function(){
        console.log('[AI] startSession() called');
        setTimeout(
            ()=>{
                console.log('[AI] startSession timeout - beginning training');
                Game.gameWorld.stick.visible = false;
                Canvas2D.clear();
                Game.gameWorld.draw();

                AI.init(Game.gameWorld, Game.policy);
                AI.finishedSession = false;
                AI.opponentTrainingLoop();
            },
            1000
        );
}

const AI = new AITrainer();