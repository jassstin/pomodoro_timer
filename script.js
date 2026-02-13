// ---- Constants ----

let config = {
    WORK_TIME: 25 * 60 * 1000, // milliseconds
    REST_TIME: 5 * 60 * 1000,
    LONG_REST_TIME: 7 * 60 * 1000,
    TICK_RATE: 10,
    ADJUST_TIME: 30 * 1000
}


// ---- State ----
let remainingTime = config.WORK_TIME;
let timerId = null;
let state = "idle"; // idle | running | paused
let rounds = 0;
let resetCount = 0;
let phase = "work"; // work | shortRest | longRest
let startDelayId = null;


// ---- DOM Elements ----
const display = document.getElementById("timer-display");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");
const plusBtn = document.getElementById("plus-btn");
const minusBtn = document.getElementById("minus-btn");
const nextBtn = document.getElementById("next-btn");
const stateDisplay = document.getElementById("state");
const phaseDisplay = document.getElementById("phase");
const roundsDisplay = document.getElementById("rounds");
const restTimer = document.getElementById("restTimer");

const workInput = document.getElementById("work-input");
const restInput = document.getElementById("rest-input");
const longRestInput = document.getElementById("long-rest-input");
const applyBtn = document.getElementById("apply-settings");

function updateDisplay(remainingTime) {


    let minutes = Math.floor(remainingTime / 60000);        // 1 min = 60,000 ms
    let seconds = Math.floor((remainingTime % 60000) / 1000); // remainder / 1000
    let milliseconds = Math.floor((remainingTime % 1000) / 10); // two-digit ms (00-99)


    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;
    if (milliseconds < 10) milliseconds = "0" + milliseconds;

    display.textContent = `${minutes}:${seconds}`;


}


startBtn.addEventListener("click", () => {
    startTimer();


});

pauseBtn.addEventListener("click", () => {
    pauseTimer();
});

resetBtn.addEventListener("click", () => {
    resetTimer();
});

plusBtn.addEventListener("click", () => {
    changeRemainingTime("plus");
});

minusBtn.addEventListener("click", () => {
    changeRemainingTime("minus");
});

nextBtn.addEventListener("click", () => {
    clearInterval(timerId);
    handlePhaseEnd();
    
});


applyBtn.addEventListener("click", () => {

    config.WORK_TIME = workInput.value * 60 * 1000;
    config.REST_TIME = restInput.value * 60 * 1000;
    config.LONG_REST_TIME = longRestInput.value * 60 * 1000;

    remainingTime = config.WORK_TIME;
    updateDisplay(remainingTime);

});

function changeRemainingTime(command) {
    if (command === "plus") {
        remainingTime += config.ADJUST_TIME;
    } else if (command === "minus") {
        remainingTime -= config.ADJUST_TIME;
    }

    if (remainingTime < 0) remainingTime = 0;

    updateDisplay(remainingTime);

    if (remainingTime === 0) {
        clearInterval(timerId);


        // Only advance phase if timer is running
        if (state === "running") {
            handlePhaseEnd();
        }
    }
}


function startInterval(tickFn) { 
    clearInterval(timerId); 
    timerId = setInterval(tickFn, config.TICK_RATE); 
}
 

function tickWorkTimer() {
    remainingTime -= config.TICK_RATE;
    if (remainingTime < 0) remainingTime = 0;

    updateDisplay(remainingTime);

    if (remainingTime === 0) {
        clearInterval(timerId);
        restTimer.innerHTML = ``;
        handlePhaseEnd();
    }
}

function startWithDelay(tickFn) {
    clearTimeout(startDelayId);
    startDelayId = setTimeout(() => {
        if (state === "running") {
            startInterval(tickFn);
        }
    }, 1000);
};




function startTimer() {
    if (phase == " ") phase = "work";
    phaseDisplay.textContent = `Phase: ${phase}`;

    state = "running";
    stateDisplay.textContent = `State: ${state}`;
    
    startWithDelay(tickWorkTimer);
};






function pauseTimer() {
    console.log("Pause button clicked");
    if (state === "running") {
        state = "paused";
        clearInterval(timerId);
        stateDisplay.textContent = `State: ${state}`;
    }
    else if (state === "paused") {
        state = "running";
        startWithDelay(tickWorkTimer); // update every 10ms
        stateDisplay.textContent = `State: ${state}`;
    }
};



function resetTimer() {
    console.log("Reset button clicked");
    resetCount++;
    remainingTime = config.WORK_TIME;
    clearInterval(timerId);
    updateDisplay(remainingTime);
    state = "idle";
    stateDisplay.textContent = `State: ${state}`;
    phase = "";
    phaseDisplay.textContent = `Phase: ${state}`;
    restTimer.innerHTML = ``;

    if (resetCount >= 2) {
        rounds = 0;
        roundsDisplay.textContent = `Rounds: ${rounds}`;
        resetCount = 0; // reset the reset
        console.log("Full reset: rounds cleared");
    }

};

function handlePhaseEnd() {
    clearInterval(timerId);
    restTimer.innerHTML = ``;
    if (phase === "work") {
        // Work just ended
        rounds++;
        roundsDisplay.textContent = `Rounds: ${rounds}`;
        startBreak();
    } else if (phase === "shortRest" || phase === "longRest") {
        // Rest just ended

        if (rounds >= 4) {
            rounds = 0;
            roundsDisplay.textContent = `Rounds: ${rounds}`;
        };
        phase = "work";
        phaseDisplay.textContent = `Phase: ${phase}`;
        remainingTime = config.WORK_TIME;
        updateDisplay(remainingTime);
        startTimer();
    }
};







function startBreak() {
    state = "running";
    stateDisplay.textContent = `State: ${state}`;
    if (rounds < 4) {
        phase = "shortRest";
        phaseDisplay.textContent = `Phase: ${phase}`;
restTimer.innerHTML = `
<div class="card text-center shadow-lg mt-3 border-0 bg-info-subtle breathing">
    <div class="card-body">
        <h2 class="text-info">☕ Short Break</h2>
        <p class="lead mb-0">Relax. Breathe. Reset.</p>
    </div>
</div>
`;


        remainingTime = config.REST_TIME;
        updateDisplay(remainingTime);
        startWithDelay(tickWorkTimer);; // update every 10ms
    } else {
        phase = "longRest";
        phaseDisplay.textContent = `Phase : ${phase}`;
        restTimer.innerHTML = `
<div class="card text-center shadow-lg mt-3 border-0 bg-success-subtle breathing">
    <div class="card-body">
        <h2 class="text-success">🌴 Long Break</h2>
        <p class="lead mb-0">You earned this.</p>
    </div>
</div>
`;

        remainingTime = config.LONG_REST_TIME;
        updateDisplay(remainingTime);
        startWithDelay(tickWorkTimer); // update every 10ms


    }




};


