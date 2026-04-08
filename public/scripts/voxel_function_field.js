(function () {
  const canvas = document.getElementById("jsCanvas");
  const container = document.getElementById("canvasContainer");
  const ctx = canvas.getContext("2d");

  const GRID = 16;
  const THRESHOLD = 0.08;
  const VOXEL_WIDTH = 18;
  const VOXEL_HEIGHT = 10;
  const VOXEL_DEPTH = 18;

  let width = 0;
  let height = 0;
  let time = 0;

  function resizeCanvas() {
    width = container.clientWidth;
    height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;
  }

  function field(x, y, z, t) {
    const scale = 1.55;
    const gx = x * scale + t * 0.55;
    const gy = y * scale - t * 0.35;
    const gz = z * scale + t * 0.45;
    const gyroid =
      Math.sin(gx) * Math.cos(gy) +
      Math.sin(gy) * Math.cos(gz) +
      Math.sin(gz) * Math.cos(gx);

    // Soft radial falloff keeps the visible structure centered on screen.
    const envelope = 1.55 - Math.sqrt(x * x + y * y + z * z) * 0.72;
    return gyroid * 0.72 + envelope * 0.22;
  }

  function projectGrid(x, y, z) {
    const scale = Math.min(width, height) / 720;
    const voxelWidth = VOXEL_WIDTH * scale;
    const voxelHeight = VOXEL_HEIGHT * scale;
    const voxelDepth = VOXEL_DEPTH * scale;

    return {
      x: width / 2 + (x - z) * voxelWidth,
      y: height * 0.6 + (x + z) * voxelHeight - y * voxelDepth,
      voxelWidth: voxelWidth,
      voxelHeight: voxelHeight,
      voxelDepth: voxelDepth,
    };
  }

  function shade(colorHue, face) {
    const lightness = face === "top" ? 70 : face === "left" ? 50 : 38;
    return `hsl(${colorHue}, 78%, ${lightness}%)`;
  }

  function drawTopFace(px, py, voxelWidth, voxelHeight, hue) {
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + voxelWidth, py + voxelHeight);
    ctx.lineTo(px, py + voxelHeight * 2);
    ctx.lineTo(px - voxelWidth, py + voxelHeight);
    ctx.closePath();
    ctx.fillStyle = shade(hue, "top");
    ctx.fill();
    ctx.stroke();
  }

  function drawLeftFace(px, py, voxelWidth, voxelHeight, voxelDepth, hue) {
    ctx.beginPath();
    ctx.moveTo(px - voxelWidth, py + voxelHeight);
    ctx.lineTo(px, py + voxelHeight * 2);
    ctx.lineTo(px, py + voxelHeight * 2 + voxelDepth);
    ctx.lineTo(px - voxelWidth, py + voxelHeight + voxelDepth);
    ctx.closePath();
    ctx.fillStyle = shade(hue, "left");
    ctx.fill();
    ctx.stroke();
  }

  function drawRightFace(px, py, voxelWidth, voxelHeight, voxelDepth, hue) {
    ctx.beginPath();
    ctx.moveTo(px + voxelWidth, py + voxelHeight);
    ctx.lineTo(px, py + voxelHeight * 2);
    ctx.lineTo(px, py + voxelHeight * 2 + voxelDepth);
    ctx.lineTo(px + voxelWidth, py + voxelHeight + voxelDepth);
    ctx.closePath();
    ctx.fillStyle = shade(hue, "right");
    ctx.fill();
    ctx.stroke();
  }

  function drawFace(face) {
    if (face.type === "top") {
      drawTopFace(
        face.projected.x,
        face.projected.y,
        face.projected.voxelWidth,
        face.projected.voxelHeight,
        face.hue
      );
      return;
    }

    if (face.type === "left") {
      drawLeftFace(
        face.projected.x,
        face.projected.y,
        face.projected.voxelWidth,
        face.projected.voxelHeight,
        face.projected.voxelDepth,
        face.hue
      );
      return;
    }

    drawRightFace(
      face.projected.x,
      face.projected.y,
      face.projected.voxelWidth,
      face.projected.voxelHeight,
      face.projected.voxelDepth,
      face.hue
    );
  }

  function animate() {
    time += 0.018;
    ctx.clearRect(0, 0, width, height);

    const background = ctx.createLinearGradient(0, 0, 0, height);
    background.addColorStop(0, "#050816");
    background.addColorStop(1, "#120b2c");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(235, 244, 255, 0.92)";
    ctx.font = "600 17px sans-serif";
    ctx.fillText("Gyroid Voxel Field", 20, 28);
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "rgba(191, 219, 254, 0.82)";
    ctx.fillText("Voxelized slice of a famous triply periodic minimal surface", 20, 45);

    const occupancy = Array.from({ length: GRID }, function () {
      return Array.from({ length: GRID }, function () {
        return Array.from({ length: GRID }, function () {
          return false;
        });
      });
    });

    for (let zi = 0; zi < GRID; zi += 1) {
      for (let yi = 0; yi < GRID; yi += 1) {
        for (let xi = 0; xi < GRID; xi += 1) {
          const x = (xi / (GRID - 1)) * 4.4 - 2.2;
          const y = (yi / (GRID - 1)) * 4.4 - 2.2;
          const z = (zi / (GRID - 1)) * 4.4 - 2.2;
          const value = field(x, y, z, time);

          if (value >= THRESHOLD) {
            occupancy[xi][yi][zi] = true;
          }
        }
      }
    }

    ctx.strokeStyle = "rgba(8, 12, 24, 0.42)";
    ctx.lineWidth = 1;
    const faces = [];

    for (let yi = 0; yi < GRID; yi += 1) {
      for (let zi = GRID - 1; zi >= 0; zi -= 1) {
        for (let xi = 0; xi < GRID; xi += 1) {
          if (!occupancy[xi][yi][zi]) {
            continue;
          }

          const x = (xi / (GRID - 1)) * 4.4 - 2.2;
          const y = (yi / (GRID - 1)) * 4.4 - 2.2;
          const z = (zi / (GRID - 1)) * 4.4 - 2.2;
          const value = field(x, y, z, time);
          const hue = 165 + value * 190 + zi * 3;
          const projected = projectGrid(
            xi - (GRID - 1) / 2,
            yi - (GRID - 1) / 2,
            zi - (GRID - 1) / 2
          );

          const topExposed = yi === GRID - 1 || !occupancy[xi][yi + 1][zi];
          const leftExposed = xi === 0 || !occupancy[xi - 1][yi][zi];
          const rightExposed = zi === 0 || !occupancy[xi][yi][zi - 1];
          const depthKey = xi + yi + zi;

          if (topExposed) {
            faces.push({
              type: "top",
              projected: projected,
              hue: hue,
              depthKey: depthKey,
              facePriority: 0,
            });
          }
          if (leftExposed) {
            faces.push({
              type: "left",
              projected: projected,
              hue: hue,
              depthKey: depthKey,
              facePriority: 1,
            });
          }
          if (rightExposed) {
            faces.push({
              type: "right",
              projected: projected,
              hue: hue,
              depthKey: depthKey,
              facePriority: 2,
            });
          }
        }
      }
    }

    faces
      .sort(function (a, b) {
        if (a.depthKey !== b.depthKey) {
          return a.depthKey - b.depthKey;
        }
        return a.facePriority - b.facePriority;
      })
      .forEach(drawFace);

    requestAnimationFrame(animate);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  animate();
})();
