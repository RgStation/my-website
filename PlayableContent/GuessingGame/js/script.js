// Game variables
let mysteryNumber = Math.ceil(Math.random() * 100);
let playersGuess = 0;
let guessesRemaining = 10;
let guessesMade = 0;
let gameState = "";
let gameWon = false;

let topGames = [];
const scoreList = document.querySelector("#scoreList");


// UI elements
const input = document.querySelector("#input");
const output = document.querySelector("#output");
const button = document.querySelector("#btn");
const replayButton = document.querySelector("#replay");

button.style.cursor = "pointer";
replayButton.style.cursor = "pointer";

// Event listeners
button.addEventListener("click", clickHandler, false);
window.addEventListener("keydown", keydownHandler, false);
replayButton.addEventListener("click", resetGame, false);

function clickHandler() {
    validateInput();
}

function keydownHandler(event) {
    if (event.keyCode === 13) {
        validateInput();
    }
}

function validateInput() {
    playersGuess = parseInt(input.value);
    input.select();

    if (isNaN(playersGuess)) {
        output.innerHTML = "Input only numbers!";
    } else if (playersGuess < 1 || playersGuess > 100) {
        output.innerHTML = "Input only numbers between 1 and 100!";
    } else {
        playGame();
    }
}

function playGame() {
    guessesMade++;
    guessesRemaining--;
    gameState = "Guess number: " + guessesMade + ",  Guesses left: " + guessesRemaining;

    if (playersGuess > mysteryNumber) {
        output.innerHTML = "Your guess is too large.<br>" + gameState;
        if (guessesRemaining < 1) {
            endGame();
        }
    } else if (playersGuess < mysteryNumber) {
        output.innerHTML = "Your guess is too small.<br>" + gameState;
        if (guessesRemaining < 1) {
            endGame();
        }
    } else {
        gameWon = true;
        endGame();
    }
}

function endGame() {
    if (gameWon) {
        output.innerHTML = "Yes, you answered correctly! The number was " + mysteryNumber +
            ".<br>It took you " + guessesMade + " guesses.";

        // Save this result
        topGames.push(guessesMade);

        // Sort and keep only best 5 (fewest guesses)
        topGames.sort((a, b) => a - b);
        topGames = topGames.slice(0, 5);

        // Update the scoreboard
        updateScoreboard();
    } else {
        output.innerHTML = "You lost the game... The number was " + mysteryNumber +
            ".<br>No more guesses left.";
    }

    button.disabled = true;
    input.disabled = true;
    window.removeEventListener("keydown", keydownHandler, false);
}

function resetGame() {
    // Reset variables
    mysteryNumber = Math.ceil(Math.random() * 100);
    playersGuess = 0;
    guessesRemaining = 10;
    guessesMade = 0;
    gameWon = false;

    // Reset UI
    input.disabled = false;
    input.value = "";
    output.innerHTML = "New game started! Guess a number between 1 and 100.";
    button.disabled = false;

    // Re-enable Enter key
    window.addEventListener("keydown", keydownHandler, false);
}

function updateScoreboard() {
    scoreList.innerHTML = "";

    if (topGames.length === 0) {
        scoreList.innerHTML = "<li>No games yet</li>";
        return;
    }

    topGames.forEach((score, index) => {
        const li = document.createElement("li");
        li.textContent = `${index + 1}. ${score} guesses`;
        scoreList.appendChild(li);
    });
}

updateScoreboard();