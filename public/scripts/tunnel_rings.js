(function () {
  const canvas = document.getElementById("jsCanvas");
  const container = document.getElementById("canvasContainer");
  const ctx = canvas.getContext("2d");

  let width = 0;
  let height = 0;
  let time = 0;
  let rings = [];

  function resizeCanvas() {
    width = container.clientWidth;
    height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;
    rings = Array.from({ length: 24 }, (_, index) => ({
      z: index / 24,
      hue: 180 + index * 7,
    }));
  }

  function animate() {
    time += 0.01;
    ctx.fillStyle = "rgba(2, 6, 18, 0.28)";
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;

    for (const ring of rings) {
      ring.z -= 0.012;
      if (ring.z <= 0.02) {
        ring.z = 1;
      }

      const radius = ring.z * Math.min(width, height) * 0.7;
      const wobbleX = Math.sin(time * 2 + ring.hue) * 24 * (1 - ring.z);
      const wobbleY = Math.cos(time * 2.4 + ring.hue) * 18 * (1 - ring.z);

      ctx.beginPath();
      ctx.arc(cx + wobbleX, cy + wobbleY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${ring.hue + time * 60}, 100%, ${60 + (1 - ring.z) * 20}%, ${1 - ring.z})`;
      ctx.lineWidth = 1 + (1 - ring.z) * 5;
      ctx.stroke();
    }

    requestAnimationFrame(animate);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  animate();
})();
