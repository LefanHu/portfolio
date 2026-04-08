(function () {
  const canvas = document.getElementById("jsCanvas");
  const container = document.getElementById("canvasContainer");
  const ctx = canvas.getContext("2d");

  let width = 0;
  let height = 0;
  let blobs = [];

  function createBlob(index) {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 90 + Math.random() * 110,
      dx: (Math.random() - 0.5) * 0.8,
      dy: (Math.random() - 0.5) * 0.8,
      hue: (index * 65 + Math.random() * 20) % 360,
    };
  }

  function resizeCanvas() {
    width = container.clientWidth;
    height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;
    blobs = Array.from({ length: 6 }, (_, index) => createBlob(index));
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#10051d";
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = "lighter";
    for (const blob of blobs) {
      blob.x += blob.dx;
      blob.y += blob.dy;

      if (blob.x < -blob.radius || blob.x > width + blob.radius) {
        blob.dx *= -1;
      }
      if (blob.y < -blob.radius || blob.y > height + blob.radius) {
        blob.dy *= -1;
      }

      const gradient = ctx.createRadialGradient(
        blob.x,
        blob.y,
        0,
        blob.x,
        blob.y,
        blob.radius
      );
      gradient.addColorStop(0, `hsla(${blob.hue}, 95%, 65%, 0.85)`);
      gradient.addColorStop(0.5, `hsla(${(blob.hue + 24) % 360}, 95%, 55%, 0.35)`);
      gradient.addColorStop(1, `hsla(${blob.hue}, 95%, 50%, 0)`);

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";

    requestAnimationFrame(animate);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  animate();
})();
