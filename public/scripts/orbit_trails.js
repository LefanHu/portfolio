(function () {
  const canvas = document.getElementById("jsCanvas");
  const container = document.getElementById("canvasContainer");
  const ctx = canvas.getContext("2d");

  let width = 0;
  let height = 0;
  let centerX = 0;
  let centerY = 0;
  let time = 0;

  const satellites = Array.from({ length: 18 }, (_, index) => ({
    orbit: 30 + index * 18,
    size: 2 + (index % 4),
    speed: 0.004 + index * 0.0006,
    offset: index * 0.7,
    color: `hsl(${(index * 28) % 360}, 90%, 65%)`,
  }));

  function resizeCanvas() {
    width = container.clientWidth;
    height = container.clientHeight;
    centerX = width / 2;
    centerY = height / 2;
    canvas.width = width;
    canvas.height = height;
  }

  function animate() {
    time += 1;
    ctx.fillStyle = "rgba(4, 7, 24, 0.12)";
    ctx.fillRect(0, 0, width, height);

    ctx.beginPath();
    ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fill();

    for (const satellite of satellites) {
      const wobble = Math.sin(time * 0.01 + satellite.offset) * 16;
      const x =
        centerX +
        Math.cos(time * satellite.speed + satellite.offset) * (satellite.orbit + wobble);
      const y =
        centerY +
        Math.sin(time * satellite.speed * 1.4 + satellite.offset) *
          (satellite.orbit * 0.7 + wobble);

      ctx.beginPath();
      ctx.arc(x, y, satellite.size, 0, Math.PI * 2);
      ctx.fillStyle = satellite.color;
      ctx.shadowBlur = 18;
      ctx.shadowColor = satellite.color;
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    requestAnimationFrame(animate);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  animate();
})();
