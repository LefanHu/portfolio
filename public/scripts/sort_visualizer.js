(function () {
  const canvas = document.getElementById("jsCanvas");
  const container = document.getElementById("canvasContainer");
  const ctx = canvas.getContext("2d");

  const BAR_COUNT = 72;
  // Frames a finished sort stays on screen before the next algorithm starts (about 3 s).
  const HOLD_FRAMES = 180;
  const algorithms = [
    { name: "Bubble Sort", generateSteps: buildBubbleSteps },
    { name: "Selection Sort", generateSteps: buildSelectionSteps },
    { name: "Insertion Sort", generateSteps: buildInsertionSteps },
    { name: "Quick Sort", generateSteps: buildQuickSteps },
    { name: "Merge Sort", generateSteps: buildMergeSteps },
    { name: "Heap Sort", generateSteps: buildHeapSteps },
  ];

  let width = 0;
  let height = 0;
  let values = [];
  let steps = [];
  let stepIndex = 0;
  let algorithmIndex = 0;
  let activePair = [];
  let heldFrames = 0;
  let chart;
  let algorithmButtons = [];
  let algorithmSelect;
  let statusLabel;

  function randomValues() {
    return Array.from({ length: BAR_COUNT }, () => 0.08 + Math.random() * 0.92);
  }

  function cloneStep(type, first, second) {
    return { type: type, indices: [first, second] };
  }

  function writeStep(index, value, compareIndex) {
    return {
      type: "write",
      indices: compareIndex === undefined ? [index] : [index, compareIndex],
      value: value,
    };
  }

  function buildBubbleSteps(source) {
    const arr = source.slice();
    const localSteps = [];

    for (let end = arr.length - 1; end > 0; end -= 1) {
      for (let i = 0; i < end; i += 1) {
        localSteps.push(cloneStep("compare", i, i + 1));
        if (arr[i] > arr[i + 1]) {
          const tmp = arr[i];
          arr[i] = arr[i + 1];
          arr[i + 1] = tmp;
          localSteps.push(cloneStep("swap", i, i + 1));
        }
      }
    }

    return localSteps;
  }

  function buildSelectionSteps(source) {
    const arr = source.slice();
    const localSteps = [];

    for (let i = 0; i < arr.length - 1; i += 1) {
      let minIndex = i;
      for (let j = i + 1; j < arr.length; j += 1) {
        localSteps.push(cloneStep("compare", minIndex, j));
        if (arr[j] < arr[minIndex]) {
          minIndex = j;
        }
      }
      if (minIndex !== i) {
        const tmp = arr[i];
        arr[i] = arr[minIndex];
        arr[minIndex] = tmp;
        localSteps.push(cloneStep("swap", i, minIndex));
      }
    }

    return localSteps;
  }

  function buildInsertionSteps(source) {
    const arr = source.slice();
    const localSteps = [];

    for (let i = 1; i < arr.length; i += 1) {
      let j = i;
      while (j > 0) {
        localSteps.push(cloneStep("compare", j - 1, j));
        if (arr[j - 1] <= arr[j]) {
          break;
        }

        const tmp = arr[j];
        arr[j] = arr[j - 1];
        arr[j - 1] = tmp;
        localSteps.push(cloneStep("swap", j - 1, j));
        j -= 1;
      }
    }

    return localSteps;
  }

  function buildQuickSteps(source) {
    const arr = source.slice();
    const localSteps = [];

    function partition(low, high) {
      const pivot = arr[high];
      let i = low;

      for (let j = low; j < high; j += 1) {
        localSteps.push(cloneStep("compare", j, high));
        if (arr[j] < pivot) {
          if (i !== j) {
            const tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
            localSteps.push(cloneStep("swap", i, j));
          }
          i += 1;
        }
      }

      if (i !== high) {
        const tmp = arr[i];
        arr[i] = arr[high];
        arr[high] = tmp;
        localSteps.push(cloneStep("swap", i, high));
      }

      return i;
    }

    function quickSort(low, high) {
      if (low >= high) {
        return;
      }

      const pivotIndex = partition(low, high);
      quickSort(low, pivotIndex - 1);
      quickSort(pivotIndex + 1, high);
    }

    quickSort(0, arr.length - 1);
    return localSteps;
  }

  function buildMergeSteps(source) {
    const arr = source.slice();
    const localSteps = [];

    function merge(left, mid, right) {
      const leftPart = arr.slice(left, mid + 1);
      const rightPart = arr.slice(mid + 1, right + 1);
      let i = 0;
      let j = 0;
      let k = left;

      while (i < leftPart.length && j < rightPart.length) {
        localSteps.push(cloneStep("compare", left + i, mid + 1 + j));

        if (leftPart[i] <= rightPart[j]) {
          arr[k] = leftPart[i];
          localSteps.push(writeStep(k, leftPart[i], left + i));
          i += 1;
        } else {
          arr[k] = rightPart[j];
          localSteps.push(writeStep(k, rightPart[j], mid + 1 + j));
          j += 1;
        }
        k += 1;
      }

      while (i < leftPart.length) {
        arr[k] = leftPart[i];
        localSteps.push(writeStep(k, leftPart[i], left + i));
        i += 1;
        k += 1;
      }

      while (j < rightPart.length) {
        arr[k] = rightPart[j];
        localSteps.push(writeStep(k, rightPart[j], mid + 1 + j));
        j += 1;
        k += 1;
      }
    }

    function mergeSort(left, right) {
      if (left >= right) {
        return;
      }

      const mid = Math.floor((left + right) / 2);
      mergeSort(left, mid);
      mergeSort(mid + 1, right);
      merge(left, mid, right);
    }

    mergeSort(0, arr.length - 1);
    return localSteps;
  }

  function buildHeapSteps(source) {
    const arr = source.slice();
    const localSteps = [];

    function heapify(length, root) {
      let largest = root;
      const left = root * 2 + 1;
      const right = root * 2 + 2;

      if (left < length) {
        localSteps.push(cloneStep("compare", left, largest));
        if (arr[left] > arr[largest]) {
          largest = left;
        }
      }

      if (right < length) {
        localSteps.push(cloneStep("compare", right, largest));
        if (arr[right] > arr[largest]) {
          largest = right;
        }
      }

      if (largest !== root) {
        const tmp = arr[root];
        arr[root] = arr[largest];
        arr[largest] = tmp;
        localSteps.push(cloneStep("swap", root, largest));
        heapify(length, largest);
      }
    }

    for (let i = Math.floor(arr.length / 2) - 1; i >= 0; i -= 1) {
      heapify(arr.length, i);
    }

    for (let end = arr.length - 1; end > 0; end -= 1) {
      const tmp = arr[0];
      arr[0] = arr[end];
      arr[end] = tmp;
      localSteps.push(cloneStep("swap", 0, end));
      heapify(end, 0);
    }

    return localSteps;
  }

  function isSorted() {
    return stepIndex >= steps.length;
  }

  function updateControls() {
    algorithmButtons.forEach((button, index) => {
      button.setAttribute("aria-pressed", String(index === algorithmIndex));
    });
    algorithmSelect.value = String(algorithmIndex);
    statusLabel.textContent = isSorted()
      ? `${algorithms[algorithmIndex].name} complete`
      : `Running ${algorithms[algorithmIndex].name}`;
  }

  function startAlgorithm(nextAlgorithmIndex) {
    algorithmIndex = nextAlgorithmIndex % algorithms.length;
    values = randomValues();
    steps = algorithms[algorithmIndex].generateSteps(values);
    stepIndex = 0;
    activePair = [];
    heldFrames = 0;
    updateControls();
    // Shown at once, so a choice registers even while the animation is paused.
    draw();
  }

  function makeButton(label, onClick) {
    const button = document.createElement("button");
    button.textContent = label;
    button.type = "button";
    button.addEventListener("click", onClick);
    return button;
  }

  // The controls are laid out by the browser in a bar above the chart, not
  // floated over a header painted on the canvas, so nothing can overlap at any
  // width. (The playground's own title bar names the piece, so the bar holds
  // only the controls.) On a narrow stage the six algorithm buttons give way
  // to one menu.
  function buildLayout() {
    const style = document.createElement("style");
    style.textContent = `
      #canvasContainer { display: flex; flex-direction: column; background: #08111f; font-family: sans-serif; }
      .sv-controls { flex: none; display: flex; flex-wrap: wrap; align-items: center; gap: 8px; padding: 12px; background: rgba(255, 255, 255, 0.06); border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
      .sv-status { margin-left: 8px; font-size: 12px; font-weight: 500; color: rgba(191, 219, 254, 0.92); }
      .sv-controls button, .sv-controls select { min-height: 34px; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 999px; padding: 0 14px; background: rgba(255, 255, 255, 0.08); color: #dbeafe; font: 600 12px sans-serif; cursor: pointer; color-scheme: dark; }
      .sv-controls button[aria-pressed="true"] { background: #60a5fa; color: #08111f; }
      .sv-controls :focus-visible { outline: 2px solid #93c5fd; outline-offset: 2px; }
      .sv-controls select { display: none; flex: 1; min-width: 0; }
      .sv-chart { position: relative; flex: 1; min-height: 0; }
      .sv-chart canvas { position: absolute; inset: 0; }
      @media (pointer: coarse) {
        .sv-controls button, .sv-controls select { min-height: 44px; }
      }
      @media (max-width: 599px) {
        .sv-controls { padding: 8px; }
        .sv-status, .sv-controls button[data-algorithm-index] { display: none; }
        .sv-controls button, .sv-controls select { min-height: 44px; font-size: 13px; }
        .sv-controls select { display: block; }
      }
    `;
    document.head.appendChild(style);

    const controls = document.createElement("div");
    controls.className = "sv-controls";

    algorithmSelect = document.createElement("select");
    algorithmSelect.setAttribute("aria-label", "Algorithm");
    algorithmSelect.addEventListener("change", function () {
      startAlgorithm(Number(algorithmSelect.value));
    });

    algorithmButtons = algorithms.map((algorithm, index) => {
      const button = makeButton(algorithm.name, function () {
        startAlgorithm(index);
      });
      button.setAttribute("data-algorithm-index", String(index));
      controls.appendChild(button);

      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = algorithm.name;
      algorithmSelect.appendChild(option);
      return button;
    });

    statusLabel = document.createElement("span");
    statusLabel.className = "sv-status";

    controls.append(
      algorithmSelect,
      makeButton("Shuffle", function () {
        startAlgorithm(algorithmIndex);
      }),
      statusLabel
    );

    chart = document.createElement("div");
    chart.className = "sv-chart";
    chart.appendChild(canvas);
    container.append(controls, chart);
  }

  function resizeCanvas() {
    width = chart.clientWidth;
    height = chart.clientHeight;

    // Size the backing store for the screen (capped at 2x) and keep drawing in CSS pixels.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function applyNextStep() {
    const step = steps[stepIndex];
    activePair = step.indices;

    if (step.type === "swap") {
      const first = step.indices[0];
      const second = step.indices[1];
      const tmp = values[first];
      values[first] = values[second];
      values[second] = tmp;
    } else if (step.type === "write") {
      values[step.indices[0]] = step.value;
    }

    stepIndex += 1;
    if (isSorted()) {
      activePair = [];
      updateControls();
    }
  }

  function draw() {
    const background = ctx.createLinearGradient(0, 0, 0, height);
    background.addColorStop(0, "#08111f");
    background.addColorStop(1, "#131b2b");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    const chartHeight = height - 38;
    const gap = 2;
    const barWidth = width / values.length;
    const sorted = isSorted();

    for (let i = 0; i < values.length; i += 1) {
      const value = values[i];
      const x = i * barWidth;
      const h = Math.max(8, value * chartHeight);
      const y = height - h - 10;
      const active = activePair.indexOf(i) !== -1;

      let fill = `hsl(${210 + value * 120}, 90%, 62%)`;
      if (active) {
        fill = "#f97316";
      } else if (sorted) {
        fill = "#34d399";
      }

      ctx.fillStyle = fill;
      ctx.fillRect(x + gap / 2, y, Math.max(1, barWidth - gap), h);
    }
  }

  function animate() {
    if (isSorted()) {
      // Left alone, the piece moves on to the next algorithm by itself.
      heldFrames += 1;
      if (heldFrames >= HOLD_FRAMES) {
        startAlgorithm(algorithmIndex + 1);
      }
    } else {
      for (let i = 0; i < 2 && !isSorted(); i += 1) {
        applyNextStep();
      }
    }
    draw();
    requestAnimationFrame(animate);
  }

  buildLayout();
  // The bar changes height when its controls wrap, which resizes the chart
  // without resizing the window, so watch the chart itself.
  new ResizeObserver(resizeCanvas).observe(chart);
  resizeCanvas();
  startAlgorithm(0);
  animate();
})();
