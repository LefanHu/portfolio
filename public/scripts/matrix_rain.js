(function () {
  const canvas = document.getElementById("jsCanvas");
  const container = document.getElementById("canvasContainer");
  const ctx = canvas.getContext("2d");
  const glyphs = "01アイウエオカキクケコサシスセソタチツテトナニヌネノ";

  let width = 0;
  let height = 0;
  let columns = [];
  const fontSize = 18;

  function resizeCanvas() {
    width = container.clientWidth;
    height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;

    const columnCount = Math.ceil(width / fontSize);
    columns = Array.from({ length: columnCount }, () => ({
      y: Math.random() * -height,
      speed: 0.8 + Math.random() * 2.4,
    }));
  }

  function animate() {
    ctx.fillStyle = "rgba(1, 10, 5, 0.16)";
    ctx.fillRect(0, 0, width, height);
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = "top";

    columns.forEach((column, index) => {
      const char = glyphs[Math.floor(Math.random() * glyphs.length)];
      const x = index * fontSize;

      ctx.fillStyle = "rgba(180, 255, 180, 0.95)";
      ctx.fillText(char, x, column.y);

      ctx.fillStyle = "rgba(60, 220, 120, 0.35)";
      ctx.fillRect(x, column.y - fontSize * 3, fontSize, fontSize * 3);

      column.y += fontSize * column.speed;
      if (column.y > height + fontSize * 4 && Math.random() > 0.975) {
        column.y = Math.random() * -height;
      }
    });

    requestAnimationFrame(animate);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  animate();
})();
