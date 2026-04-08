(function () {
  const canvas = document.getElementById("jsCanvas");
  const container = document.getElementById("canvasContainer");
  const ctx = canvas.getContext("2d");

  let width = 0;
  let height = 0;
  let time = 0;
  let bars = [];

  function resizeCanvas() {
    width = container.clientWidth;
    height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;

    const count = 40;
    bars = Array.from({ length: count }, (_, index) => ({
      offset: Math.random() * Math.PI * 2,
      hue: 180 + (index / count) * 140,
    }));
  }

  function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#12051f");
    gradient.addColorStop(0.55, "#261447");
    gradient.addColorStop(1, "#090d18");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    for (let y = height * 0.2; y < height; y += 28) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  function animate() {
    time += 0.045;
    drawBackground();

    const barWidth = width / (bars.length * 1.35);
    const gap = barWidth * 0.35;
    const baseline = height * 0.86;

    bars.forEach((bar, index) => {
      const energy =
        0.2 +
        Math.abs(
          Math.sin(time * 1.8 + bar.offset) *
            Math.cos(time * 0.7 + index * 0.3)
        );
      const barHeight = energy * height * 0.58;
      const x = gap + index * (barWidth + gap);
      const y = baseline - barHeight;

      const gradient = ctx.createLinearGradient(0, y, 0, baseline);
      gradient.addColorStop(0, `hsla(${bar.hue + 40}, 100%, 72%, 0.95)`);
      gradient.addColorStop(1, `hsla(${bar.hue}, 100%, 45%, 0.8)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);
    });

    requestAnimationFrame(animate);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  animate();
})();
