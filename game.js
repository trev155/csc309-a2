/* Main javascript code */
/* Credit for base code:
http://www.isaacsukin.com/news/2015/01/detailed-explanation-javascript-game-loops-and-timing#starting-stopping
(look at the last example)
*/

/* GLOBALS */
var level = 1;
bugList = [];
foodList = [];
var canvas = document.getElementById("canvas");
var context = canvas.getContext('2d');
var timeElapsed = 0;
var bugTimer = 3;
var userScore = 0;



/* RNG Calculator */
function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Debugging
document.onmousemove = function(e){
    var x = e.pageX;
    var y = e.pageY;
    var box = document.getElementById("mouseCoords");
    box.textContent = "X: " + x + " Y: " + y;
};

// Test foods
for (var i = 0; i < 5; i++) {
    makeFood();
}




/* START */
start();


/* MAIN LOOP VERY IMPORTANT 
Essentially this runs on every frame. 

timestamp: What you would expect, the time that this function was invoked
(automatically passed as a parameter to requestAnimationFrame
*/
function mainLoop(timestamp) {
    // Throttle the frame rate.    
    if (timestamp < lastFrameTimeMs + (1000 / maxFPS)) {
        frameID = requestAnimationFrame(mainLoop);
        return;
    }
    delta += timestamp - lastFrameTimeMs;
    lastFrameTimeMs = timestamp;

    begin(timestamp, delta);

    if (timestamp > lastFpsUpdate + 1000) {
        fps = 0.25 * framesThisSecond + 0.75 * fps;

        lastFpsUpdate = timestamp;
        framesThisSecond = 0;
    }
    framesThisSecond++;

    var numUpdateSteps = 0;
    while (delta >= timestep) {
        boxUpdate(timestep);
        delta -= timestep;
        if (++numUpdateSteps >= 240) {
            panic();
            break;
        }
    }

    // Animation of box (will remove later)
    drawBox(delta / timestep);

    /* ADDED */

    // clear the whole canvas area 
    context.clearRect(0, 0, canvas.width, canvas.height);
    // make / draw info bar and components
    makeInfoBar();
    // draw the food
    for (var i = 0; i < foodList.length; i++) { drawFood(foodList[i]); }
    // Bug generation at random intervals
    if (timeElapsed / 1000 > bugTimer) {
        var num = getRandomIntInclusive(1, 3);
        makeBug();
        bugTimer += num;
    }
    // draw the bugs
    for (var i = 0; i < bugList.length; i++) {
        drawBug(bugList[i]);
    }

    // Bug movement
    



    // Keep track of time (if > 60 seconds, end)
    timeElapsed += timestep;
    if (timeElapsed / 1000 > 60) {
        stop();
        return;
    }

    /* END OF ADDED */


    end(fps);
    // go to next frame
    frameID = requestAnimationFrame(mainLoop);
}




/* HELPERS */
// box stuff (will remove after)
var box = document.getElementById('box'),
    boxPos = 10,
    boxLastPos = 10,
    boxspeed = 0.4,
    limit = 300;

// important stuff for game timer and main loop
var fpsDisplay = document.getElementById('fpsDisplay'),
    lastFrameTimeMs = 0,
    maxFPS = 60,
    delta = 0,
    timestep = 1000 / 60,
    fps = 60,
    framesThisSecond = 0,
    lastFpsUpdate = 0,
    running = false,
    started = false,
    frameID = 0;


/* Box Functions (will remove later)*/
function boxUpdate(delta) {
    boxLastPos = boxPos;
    boxPos += boxspeed * delta;
    // Switch directions if we go too far
    if (boxPos >= limit || boxPos <= 0) boxspeed = -boxspeed;
}

function drawBox(interp) {
    box.style.left = (boxLastPos + (boxPos - boxLastPos) * interp) + 'px';
    fpsDisplay.textContent = Math.round(fps) + ' FPS';
}


/* UTILITY FUNCTIONS */

/* Start the main loop */
function start() {
    if (!started) {
        started = true;
        frameID = requestAnimationFrame(function(timestamp) {
            drawBox(1);
            running = true;
            lastFrameTimeMs = timestamp;
            lastFpsUpdate = timestamp;
            framesThisSecond = 0;
            frameID = requestAnimationFrame(mainLoop);
        });
    }
}

/* Stop The main loop */
function stop() {
    running = false;
    started = false;
    cancelAnimationFrame(frameID);

    /* Added */
    makeInfoBar();
}

// Runs at the start of each frame
function begin() {

}

// Runs at the end of each frame
function end(fps) {
    // if (fps < 25) {
    //     box.style.backgroundColor = 'black';
    // }
    // else if (fps > 30) {
    //     box.style.backgroundColor = 'red';
    // }
}

// if frame rate goes to shit or something like that, do this
function panic() {
    delta = 0;
}