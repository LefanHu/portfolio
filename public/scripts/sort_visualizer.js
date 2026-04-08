(function () {
  const canvas = document.getElementById("jsCanvas");
  const container = document.getElementById("canvasContainer");
  const ctx = canvas.getContext("2d");

  const BAR_COUNT = 72;
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
  let controls;
  let statusLabel;

  function resizeCanvas() {
    container.style.position = "relative";
    width = container.clientWidth;
    height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    ensureControls();
    startAlgorithm(algorithmIndex);
  }

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

  function updateControls() {
    if (!controls) {
      return;
    }

    const buttons = controls.querySelectorAll("[data-algorithm-index]");
    buttons.forEach((button) => {
      const isActive =
        Number(button.getAttribute("data-algorithm-index")) === algorithmIndex;
      button.style.background = isActive ? "#60a5fa" : "rgba(255,255,255,0.08)";
      button.style.color = isActive ? "#08111f" : "#dbeafe";
    });

    if (statusLabel) {
      statusLabel.textContent =
        stepIndex >= steps.length
          ? `${algorithms[algorithmIndex].name} complete`
          : `Running ${algorithms[algorithmIndex].name}`;
    }
  }

  function resetVisualization(nextAlgorithmIndex) {
    algorithmIndex = nextAlgorithmIndex % algorithms.length;
    values = randomValues();
    steps = algorithms[algorithmIndex].generateSteps(values);
    stepIndex = 0;
    activePair = [];
    updateControls();
  }

  function startAlgorithm(nextAlgorithmIndex) {
    resetVisualization(nextAlgorithmIndex);
  }

  function shuffleCurrentAlgorithm() {
    resetVisualization(algorithmIndex);
  }

  function makeControlButton(label, onClick) {
    const button = document.createElement("button");
    button.textContent = label;
    button.type = "button";
    button.style.border = "1px solid rgba(255,255,255,0.12)";
    button.style.borderRadius = "999px";
    button.style.padding = "8px 12px";
    button.style.background = "rgba(255,255,255,0.08)";
    button.style.color = "#dbeafe";
    button.style.font = "600 12px sans-serif";
    button.style.cursor = "pointer";
    button.addEventListener("click", onClick);
    return button;
  }

  function ensureControls() {
    if (controls) {
      return;
    }

    controls = document.createElement("div");
    controls.style.position = "absolute";
    controls.style.top = "12px";
    controls.style.left = "12px";
    controls.style.right = "12px";
    controls.style.display = "flex";
    controls.style.flexWrap = "wrap";
    controls.style.alignItems = "center";
    controls.style.gap = "8px";
    controls.style.zIndex = "1";

    algorithms.forEach((algorithm, index) => {
      const button = makeControlButton(algorithm.name, function () {
        startAlgorithm(index);
      });
      button.setAttribute("data-algorithm-index", String(index));
      controls.appendChild(button);
    });

    const shuffleButton = makeControlButton("Shuffle", function () {
      shuffleCurrentAlgorithm();
    });
    controls.appendChild(shuffleButton);

    statusLabel = document.createElement("span");
    statusLabel.style.marginLeft = "8px";
    statusLabel.style.color = "rgba(191, 219, 254, 0.92)";
    statusLabel.style.font = "500 12px sans-serif";
    controls.appendChild(statusLabel);

    container.appendChild(controls);
    updateControls();
  }

  function applyNextStep() {
    if (stepIndex < steps.length) {
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
      if (stepIndex >= steps.length) {
        activePair = [];
      }
      updateControls();
      return;
    }

    activePair = [];
    updateControls();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    const background = ctx.createLinearGradient(0, 0, 0, height);
    background.addColorStop(0, "#08111f");
    background.addColorStop(1, "#131b2b");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    const panelHeight = 92;
    ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
    ctx.fillRect(0, 0, width, panelHeight);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.beginPath();
    ctx.moveTo(0, panelHeight + 0.5);
    ctx.lineTo(width, panelHeight + 0.5);
    ctx.stroke();

    ctx.fillStyle = "rgba(222, 231, 255, 0.95)";
    ctx.font = "600 18px sans-serif";
    ctx.fillText("Sort Visualizer", 20, 62);
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "rgba(188, 200, 232, 0.85)";
    ctx.fillText("Choose an algorithm and reshuffle whenever you want.", 20, 80);

    const chartTop = panelHeight + 20;
    const chartHeight = height - chartTop - 18;
    const gap = 2;
    const barWidth = width / values.length;

    for (let i = 0; i < values.length; i += 1) {
      const value = values[i];
      const x = i * barWidth;
      const h = Math.max(8, value * chartHeight);
      const y = height - h - 10;
      const active = activePair.indexOf(i) !== -1;
      const isSorted = stepIndex >= steps.length;

      let fill = `hsl(${210 + value * 120}, 90%, 62%)`;
      if (active) {
        fill = "#f97316";
      } else if (isSorted) {
        fill = "#34d399";
      }

      ctx.fillStyle = fill;
      ctx.fillRect(x + gap / 2, y, Math.max(1, barWidth - gap), h);
    }
  }

  function animate() {
    if (stepIndex < steps.length) {
      for (let i = 0; i < 2; i += 1) {
        applyNextStep();
      }
    }
    draw();
    requestAnimationFrame(animate);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  animate();
})();
