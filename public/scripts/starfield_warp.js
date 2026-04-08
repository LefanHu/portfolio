(function () {
  const canvas = document.getElementById("jsCanvas");
  const container = document.getElementById("canvasContainer");
  const ctx = canvas.getContext("2d");

  let width = 0;
  let height = 0;
  let centerX = 0;
  let centerY = 0;
  let stars = [];
  const STAR_COUNT = 420;

  function resizeCanvas() {
    width = container.clientWidth;
    height = container.clientHeight;
    centerX = width / 2;
    centerY = height / 2;
    canvas.width = width;
    canvas.height = height;
    stars = Array.from({ length: STAR_COUNT }, createStar);
  }

  function createStar() {
    return {
      x: (Math.random() - 0.5) * width,
      y: (Math.random() - 0.5) * height,
      z: Math.random() * width,
    };
  }

  function recycleStar(star) {
    star.x = (Math.random() - 0.5) * width;
    star.y = (Math.random() - 0.5) * height;
    star.z = width;
  }

  function animate() {
    ctx.fillStyle = "rgba(3, 4, 18, 0.45)";
    ctx.fillRect(0, 0, width, height);

    for (const star of stars) {
      star.z -= 10;
      if (star.z <= 1) {
        recycleStar(star);
      }

      const sx = (star.x / star.z) * width + centerX;
      const sy = (star.y / star.z) * width + centerY;
      const radius = Math.max(0.5, 1.8 - star.z / width);

      if (sx < 0 || sx > width || sy < 0 || sy > height) {
        recycleStar(star);
        continue;
      }

      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${200 + radius * 80}, 100%, 80%, ${0.45 + radius / 2})`;
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  animate();
})();
