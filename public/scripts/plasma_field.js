(function () {
  const canvas = document.getElementById("jsCanvas");
  const container = document.getElementById("canvasContainer");
  const ctx = canvas.getContext("2d");

  let width = 0;
  let height = 0;
  let imageData;
  let pixels;
  let tick = 0;
  const scale = 4;

  function resizeCanvas() {
    width = Math.max(120, Math.floor(container.clientWidth / scale));
    height = Math.max(80, Math.floor(container.clientHeight / scale));
    canvas.width = width;
    canvas.height = height;
    canvas.style.imageRendering = "pixelated";
    imageData = ctx.createImageData(width, height);
    pixels = imageData.data;
  }

  function animate() {
    tick += 0.04;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = (y * width + x) * 4;
        const value =
          Math.sin(x * 0.09 + tick) +
          Math.sin(y * 0.08 - tick * 1.4) +
          Math.sin((x + y) * 0.05 + tick * 0.7) +
          Math.sin(Math.sqrt(x * x + y * y) * 0.12 - tick * 2);

        const normalized = (value + 4) / 8;
        pixels[index] = 60 + normalized * 195;
        pixels[index + 1] = 20 + Math.sin(normalized * Math.PI) * 190;
        pixels[index + 2] = 140 + (1 - normalized) * 100;
        pixels[index + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    requestAnimationFrame(animate);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  animate();
})();
