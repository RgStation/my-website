document.addEventListener("DOMContentLoaded", () => {
  // --- Canvas setup ---
  const canvas = document.querySelector("#c");
  const ctx = canvas.getContext("2d");

  // --- Game settings ---
  const INITIAL_BALL_XSPEED = 1.5;
  const INITIAL_BALL_YSPEED = 3;
  const paddleWidth = 100;
  const paddleHeight = 10;
  const playerPaddleSpeed = 6;
  const aiPaddleSpeed = 1.1;

  // --- State ---
  let pointsPlayer = 0;
  let pointsComputer = 0;
  let gameStarted = false;
  let gameOver = false;
  let ballWaiting = false;
  let leftArrowHit = false;
  let rightArrowHit = false;
  let countdownTimer = null;

  // --- Objects ---
  const ball = { x: canvas.width / 2, y: canvas.height / 2, xSpeed: 0, ySpeed: 0, radius: 10 };
  const topPaddle = { x: canvas.width / 2 - paddleWidth / 2, y: 10 };
  const bottomPaddle = { x: canvas.width / 2 - paddleWidth / 2, y: canvas.height - 20 };

  // --- UI Elements ---
  const startBtn = document.getElementById("startBtn");
  const countdownDiv = document.getElementById("countdown");
  const playerScoreSpan = document.getElementById("playerScore");
  const computerScoreSpan = document.getElementById("computerScore");
  const topScoresList = document.getElementById("topScoresList");
  const overlay = document.getElementById("endMessage");
  const overlayText = document.getElementById("endMessageText");
  const overlayClose = document.getElementById("closeEndMessage");

  // Ensure overlay hidden on load
  if (overlay) overlay.classList.add("hidden");

  // --- Top Scores ---
  let topScores = JSON.parse(localStorage.getItem("pongTopScores") || "[]");

  function updateTopScoresDisplay() {
    if (!topScoresList) return;
    topScoresList.innerHTML = "";
    topScores.forEach((entry, i) => {
      const li = document.createElement("li");
      li.textContent = `${entry.winner} - ${entry.score} pts (${entry.time})`;
      topScoresList.appendChild(li);
    });
  }
  updateTopScoresDisplay();

  function addToTopScores(pPlayer, pComputer) {
    const date = new Date();
    let winner, score;
    if (pPlayer > pComputer) {
      winner = "Player"; score = pPlayer;
    } else if (pComputer > pPlayer) {
      winner = "Computer"; score = pComputer;
    } else {
      winner = "Tie"; score = pPlayer;
    }

    topScores.push({
      winner,
      score,
      time: date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });

    topScores.sort((a, b) => b.score - a.score);
    topScores = topScores.slice(0, 10);
    localStorage.setItem("pongTopScores", JSON.stringify(topScores));
    updateTopScoresDisplay();
  }

  // --- Start Game / Countdown ---
  if (startBtn) startBtn.addEventListener("click", startCountdown);

  function startCountdown() {
    if (gameStarted || gameOver) return;
    let count = 3;
    countdownDiv.textContent = count;
    countdownDiv.classList.remove("hidden");
    startBtn.disabled = true;

    countdownTimer = setInterval(() => {
      count--;
      if (count > 0) {
        countdownDiv.textContent = count;
      } else {
        clearInterval(countdownTimer);
        countdownDiv.classList.add("hidden");
        startGame();
      }
    }, 1000);
  }

  function startGame() {
    gameStarted = true;
    resumeBall();
  }

  function resumeBall() {
    ballWaiting = false;
    ball.xSpeed = INITIAL_BALL_XSPEED * (Math.random() < 0.5 ? 1 : -1);
    ball.ySpeed = INITIAL_BALL_YSPEED * (Math.random() < 0.5 ? 1 : -1);
  }

  // --- Input ---
  window.addEventListener("keydown", (evt) => {
    if (evt.key === "ArrowRight") rightArrowHit = true;
    if (evt.key === "ArrowLeft") leftArrowHit = true;
  });
  window.addEventListener("keyup", (evt) => {
    if (evt.key === "ArrowRight") rightArrowHit = false;
    if (evt.key === "ArrowLeft") leftArrowHit = false;
  });

  // --- Drawing ---
  function drawBackground() {
    ctx.fillStyle = "#e2ffd0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  function drawTopPaddle() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(topPaddle.x, topPaddle.y, paddleWidth, paddleHeight);
  }
  function drawBottomPaddle() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(bottomPaddle.x, bottomPaddle.y, paddleWidth, paddleHeight);
  }
  function drawBall() {
    ctx.strokeStyle = "#000000";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#B0E38E";
    ctx.fill();
  }

  // --- Hit Detection ---
  function hitDetection() {
    // Bottom paddle
    if (ball.y + ball.radius >= bottomPaddle.y) {
      if (bottomPaddle.x <= ball.x && ball.x <= bottomPaddle.x + paddleWidth) {
        ball.ySpeed *= -1;
        ball.y = bottomPaddle.y - ball.radius;
        return;
      }
    }
    // Top paddle
    if (ball.y - ball.radius <= topPaddle.y + paddleHeight) {
      if (topPaddle.x <= ball.x && ball.x <= topPaddle.x + paddleWidth) {
        ball.ySpeed *= -1;
        ball.y = topPaddle.y + paddleHeight + ball.radius;
        return;
      }
    }
    // Side walls
    if (ball.x + ball.radius >= canvas.width || ball.x - ball.radius <= 0) {
      ball.xSpeed *= -1;
    }

    // Scoring
    if (ball.y > canvas.height + ball.radius) {
      pointsComputer++;
      computerScoreSpan.textContent = pointsComputer;
      checkGameOver();
      if (!gameOver) resetBallAfterScore();
    }

    if (ball.y < 0 - ball.radius) {
      pointsPlayer++;
      playerScoreSpan.textContent = pointsPlayer;
      checkGameOver();
      if (!gameOver) resetBallAfterScore();
    }
  }

  function resetBallAfterScore() {
    ballWaiting = true;
    ball.xSpeed = 0;
    ball.ySpeed = 0;
    initGameObjects();
    // pause 1s before resuming
    setTimeout(() => {
      if (!gameOver) resumeBall();
    }, 1000);
  }

  // --- Game Over ---
  function checkGameOver() {
    const totalPoints = pointsPlayer + pointsComputer;
    if (totalPoints >= 10 || pointsPlayer > 5 || pointsComputer > 5) {
      gameOver = true;
      addToTopScores(pointsPlayer, pointsComputer);

      let winnerText = "";
      if (pointsPlayer > pointsComputer) winnerText = `🏆 Player wins with ${pointsPlayer} points!`;
      else if (pointsComputer > pointsPlayer) winnerText = `💻 Computer wins with ${pointsComputer} points!`;
      else winnerText = `🤝 It's a tie! Both scored ${pointsPlayer} points.`;

      ball.xSpeed = 0;
      ball.ySpeed = 0;

      if (overlay && overlayText && overlayClose) {
        overlayText.textContent = winnerText;
        overlay.classList.remove("hidden");
        overlayClose.onclick = () => {
          overlay.classList.add("hidden");
          resetGame();
        };
      } else {
        alert(winnerText);
        resetGame();
      }
    }
  }

  // --- Init & Reset ---
  function resetGame() {
    pointsPlayer = 0;
    pointsComputer = 0;
    playerScoreSpan.textContent = 0;
    computerScoreSpan.textContent = 0;
    gameOver = false;
    gameStarted = false;
    startBtn.disabled = false;
    initGameObjects();
  }

  function initGameObjects() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.xSpeed = 0;
    ball.ySpeed = 0;
    topPaddle.x = canvas.width / 2 - paddleWidth / 2;
    bottomPaddle.x = canvas.width / 2 - paddleWidth / 2;
  }

  // --- Movement ---
  function keyboardEvents() {
    if (leftArrowHit) bottomPaddle.x -= playerPaddleSpeed;
    if (rightArrowHit) bottomPaddle.x += playerPaddleSpeed;
    if (bottomPaddle.x < 0) bottomPaddle.x = 0;
    if (bottomPaddle.x > canvas.width - paddleWidth) bottomPaddle.x = canvas.width - paddleWidth;
  }

  function computerAI() {
    const targetX = ball.x - paddleWidth / 2;
    const dx = targetX - topPaddle.x;
    if (Math.abs(dx) < aiPaddleSpeed) topPaddle.x = targetX;
    else if (dx > 0) topPaddle.x += aiPaddleSpeed;
    else topPaddle.x -= aiPaddleSpeed;
    if (topPaddle.x < 0) topPaddle.x = 0;
    if (topPaddle.x > canvas.width - paddleWidth) topPaddle.x = canvas.width - paddleWidth;
  }

  // --- Main Loop ---
  function pongGame() {
    drawBackground();
    drawTopPaddle();
    drawBall();
    drawBottomPaddle();

    if (gameStarted && !gameOver) {
      keyboardEvents();   // allow paddle movement
      computerAI();

      if (!ballWaiting) {
        hitDetection();
        ball.x += ball.xSpeed;
        ball.y += ball.ySpeed;
      }
    }
  }

  function gameLoop() {
    pongGame();
    requestAnimationFrame(gameLoop);
  }

  // --- Initialize ---
  initGameObjects();
  canvas.tabIndex = 0;
  canvas.focus();
  requestAnimationFrame(gameLoop);
});
