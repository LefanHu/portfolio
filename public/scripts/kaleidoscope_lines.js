(function () {
  const canvas = document.getElementById("jsCanvas");
  const container = document.getElementById("canvasContainer");
  const ctx = canvas.getContext("2d");

  let width = 0;
  let height = 0;
  let time = 0;
  const slices = 12;

  function resizeCanvas() {
    width = container.clientWidth;
    height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;
  }

  function animate() {
    time += 0.01;
    ctx.fillStyle = "rgba(6, 2, 17, 0.16)";
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2, height / 2);

    for (let i = 0; i < slices; i += 1) {
      ctx.save();
      const rotation = (Math.PI * 2 * i) / slices;
      ctx.rotate(rotation);

      for (let j = 0; j < 7; j += 1) {
        const hue = (time * 180 + i * 18 + j * 26) % 360;
        const length = 80 + j * 28 + Math.sin(time * 3 + j) * 20;
        const offset = Math.sin(time * 4 + j * 2.1) * 30;

        ctx.beginPath();
        ctx.moveTo(offset, 0);
        ctx.lineTo(length, Math.cos(time * 2 + j) * 42);
        ctx.strokeStyle = `hsla(${hue}, 95%, 68%, 0.75)`;
        ctx.lineWidth = 2 + (j % 3);
        ctx.stroke();
      }

      ctx.restore();
    }

    ctx.restore();
    requestAnimationFrame(animate);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  animate();
})();
