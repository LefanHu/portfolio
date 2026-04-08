(function () {
  const canvas = document.getElementById("jsCanvas");
  const container = document.getElementById("canvasContainer");
  const ctx = canvas.getContext("2d");

  let width = 0;
  let height = 0;
  let time = 0;
  let fireflies = [];

  function createFirefly() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      dx: (Math.random() - 0.5) * 0.8,
      dy: (Math.random() - 0.5) * 0.8,
      size: 2 + Math.random() * 4,
      phase: Math.random() * Math.PI * 2,
      hue: 50 + Math.random() * 70,
    };
  }

  function resizeCanvas() {
    width = container.clientWidth;
    height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;
    fireflies = Array.from({ length: 85 }, createFirefly);
  }

  function animate() {
    time += 0.02;
    ctx.fillStyle = "rgba(3, 8, 12, 0.25)";
    ctx.fillRect(0, 0, width, height);

    for (const firefly of fireflies) {
      firefly.x += firefly.dx + Math.sin(time + firefly.phase) * 0.35;
      firefly.y += firefly.dy + Math.cos(time * 1.4 + firefly.phase) * 0.2;

      if (firefly.x < -20) firefly.x = width + 20;
      if (firefly.x > width + 20) firefly.x = -20;
      if (firefly.y < -20) firefly.y = height + 20;
      if (firefly.y > height + 20) firefly.y = -20;

      const glow = (Math.sin(time * 3 + firefly.phase) + 1) / 2;
      ctx.beginPath();
      ctx.arc(firefly.x, firefly.y, firefly.size + glow * 2, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${firefly.hue}, 100%, 70%, ${0.15 + glow * 0.45})`;
      ctx.shadowBlur = 18 + glow * 16;
      ctx.shadowColor = `hsla(${firefly.hue}, 100%, 70%, 0.8)`;
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    requestAnimationFrame(animate);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  animate();
})();
