(function () {
  const canvas = document.getElementById("jsCanvas");
  const container = document.getElementById("canvasContainer");
  const ctx = canvas.getContext("2d");

  // 100 balls suited the 1030 x 770 stage this was written for. Keep that
  // density on other sizes, so a phone-sized stage is not a solid mass.
  const AREA_PER_BALL = 8000;
  const MIN_BALLS = 12;
  const MAX_BALLS = 100;

  let width = 0;
  let height = 0;
  let balls = [];

  class Ball {
    constructor(radius) {
      this.radius = radius;
      this.posX = Math.floor(Math.random() * (width - 2 * radius)) + radius;
      this.posY = Math.floor(Math.random() * (height - 2 * radius)) + radius;
      // Padded to six digits: a shorter string is not a valid colour.
      this.colour =
        "#" +
        Math.floor(Math.random() * 0x1000000)
          .toString(16)
          .padStart(6, "0");
      this.dx = Math.ceil(Math.random() * 2.5) * (Math.random() < 0.5 ? -1 : 1);
      this.dy = Math.ceil(Math.random() * 2.5) * (Math.random() < 0.5 ? -1 : 1);
    }
  }

  function draw() {
    // A translucent wash instead of a clear, so each ball drags a fading trail.
    ctx.fillStyle = "rgba(5, 7, 15, 0.2)";
    ctx.fillRect(0, 0, width, height);

    for (const ball of balls) {
      ctx.beginPath();
      ctx.arc(ball.posX, ball.posY, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = ball.colour;
      ctx.fill();
    }
  }

  function update() {
    for (const ball of balls) {
      ball.posX += ball.dx;
      ball.posY += ball.dy;

      // collision with canvas edge
      if (ball.posX + ball.radius > width || ball.posX - ball.radius < 0) {
        ball.dx *= -1;
      }
      if (ball.posY + ball.radius > height || ball.posY - ball.radius < 0) {
        ball.dy *= -1;
      }
    }
  }

  function start() {
    const numBalls = Math.max(
      MIN_BALLS,
      Math.min(MAX_BALLS, Math.round((width * height) / AREA_PER_BALL))
    );

    balls = [];
    for (let i = 0; i < numBalls; i++) {
      const radius = Math.floor(Math.random() * (40 - 5) + 5);
      balls.push(new Ball(radius));
    }
  }

  function resizeCanvas() {
    width = container.clientWidth;
    height = container.clientHeight;

    // Size the backing store for the screen (capped at 2x) and keep drawing in CSS pixels.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // restart
    start();
  }

  function game() {
    draw();
    update();
    requestAnimationFrame(game);
  }

  window.addEventListener("resize", resizeCanvas);

  resizeCanvas();
  game();
})();
