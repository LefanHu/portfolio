(function () {
  const canvas = document.getElementById("jsCanvas");
  const container = document.getElementById("canvasContainer");
  const ctx = canvas.getContext("2d");

  // Frames without pointer input before the piece starts drawing by itself (about 1.5 s).
  const IDLE_FRAMES = 90;

  const particles = [];
  let width = 0;
  let height = 0;
  let hue = 0;
  let frame = 0;
  // Nobody has moved yet, so the piece opens on its own path.
  let lastInput = -IDLE_FRAMES;

  const pointer = { x: 0, y: 0 };

  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.dx = Math.random() * 2 + 2 * (Math.random() < 0.5 ? -1 : 1);
      this.dy = Math.random() * 2 + 2 * (Math.random() < 0.5 ? -1 : 1);
      this.radius = Math.random() * (30 - 10) + 5;
      this.color = hue;
    }

    draw() {
      ctx.fillStyle = "hsl(" + this.color + ", 100%, 50%)";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
      ctx.fill();
    }

    update() {
      //updates position
      this.x += this.dx;
      this.y += this.dy;

      //decrease the size
      if (this.radius > 1) this.radius -= 0.3;
    }
  }

  function emit() {
    for (let i = 0; i < 2; i++) {
      particles.push(new Particle(pointer.x, pointer.y));
    }
  }

  // Without a pointer (first load, a touch screen at rest) the dot wanders a
  // slow Lissajous curve, so the stage is never an empty black box.
  function wander() {
    const t = frame * 0.02;
    pointer.x = width / 2 + Math.cos(t * 1.3) * width * 0.36;
    pointer.y = height / 2 + Math.sin(t * 2.1) * height * 0.34;
    emit();
  }

  function animate() {
    frame += 1;
    if (frame - lastInput >= IDLE_FRAMES) {
      wander();
    }

    //fade the previous frame instead of clearing it
    ctx.fillStyle = "rgba(0, 0, 0, 0.02)";
    ctx.fillRect(0, 0, width, height);

    //update&draw all particle positions (backwards, so removing one skips none)
    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      if (particle.radius < 2) {
        particles.splice(i, 1);
      } else {
        particle.update();
        particle.draw();
      }
    }

    //draw the pointer as a red dot
    drawPointer();

    //change the hue a bit
    hue += 1;

    requestAnimationFrame(animate);
  }

  function drawPointer() {
    ctx.beginPath();
    ctx.arc(pointer.x, pointer.y, 5, 0, Math.PI * 2, false);
    ctx.fillStyle = "red";
    ctx.fill();
  }

  // Pointer events cover mouse, pen and touch alike.
  function onPointer(event) {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    lastInput = frame;
    emit();
  }

  function resizeCanvas() {
    width = container.clientWidth;
    height = container.clientHeight;

    // Size the backing store for the screen (capped at 2x) and keep drawing in CSS pixels.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // A finger dragged across the stage should paint, not scroll the page.
  canvas.style.touchAction = "none";

  window.addEventListener("pointermove", onPointer);
  window.addEventListener("pointerdown", onPointer);
  window.addEventListener("resize", resizeCanvas);

  resizeCanvas();
  animate();
})();
