(function () {
  const canvas = document.getElementById("jsCanvas");
  const container = document.getElementById("canvasContainer");
  const ctx = canvas.getContext("2d");

  let width = 0;
  let height = 0;
  let tick = 0;

  const layers = [
    { amplitude: 18, wavelength: 0.010, speed: 0.018, y: 0.62, color: "rgba(255, 212, 102, 0.85)" },
    { amplitude: 26, wavelength: 0.013, speed: 0.014, y: 0.7, color: "rgba(255, 153, 102, 0.7)" },
    { amplitude: 38, wavelength: 0.016, speed: 0.011, y: 0.78, color: "rgba(255, 92, 92, 0.55)" },
    { amplitude: 54, wavelength: 0.019, speed: 0.008, y: 0.87, color: "rgba(122, 63, 196, 0.45)" },
  ];

  function resizeCanvas() {
    width = container.clientWidth;
    height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;
  }

  function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#140b35");
    gradient.addColorStop(0.35, "#8f3b76");
    gradient.addColorStop(0.65, "#ff8a5b");
    gradient.addColorStop(1, "#ffd166");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.beginPath();
    ctx.arc(width * 0.75, height * 0.28, Math.min(width, height) * 0.12, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 244, 214, 0.82)";
    ctx.fill();
  }

  function drawWave(layer) {
    const baseY = height * layer.y;
    ctx.beginPath();
    ctx.moveTo(0, height);

    for (let x = 0; x <= width; x += 8) {
      const y =
        baseY +
        Math.sin(x * layer.wavelength + tick * layer.speed) * layer.amplitude +
        Math.sin(x * layer.wavelength * 0.35 + tick * layer.speed * 1.7) *
          (layer.amplitude * 0.35);
      ctx.lineTo(x, y);
    }

    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fillStyle = layer.color;
    ctx.fill();
  }

  function animate() {
    tick += 1;
    drawBackground();
    layers.forEach(drawWave);
    requestAnimationFrame(animate);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  animate();
})();
