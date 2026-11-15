"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { STAGE_BACKGROUND, STAGE_INK } from "./layout";

// Frames played in one go to make the picture a paused piece holds (see the harness).
const STILL_FRAMES = 30;

/**
 * Runs inside the sandbox and loads the experiment. The scripts are plain
 * canvas sketches that loop with requestAnimationFrame; this puts a gate on
 * that one function, so every script, present and future, stops while the tab
 * is hidden, honours the playground's pause button (a message from the
 * parent, the only channel into the sandbox) and holds a still frame for
 * visitors who ask for reduced motion, without any of them having to know.
 */
const harness = (scriptSrc: string) => `(function () {
  var nativeRequest = window.requestAnimationFrame.bind(window);
  var queue = new Map();
  var nextId = 1;
  var scheduled = false;
  var loaded = false;
  var failed = false;
  var settled = false;
  var running = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function open() {
    return running && !document.hidden;
  }

  function flush(time) {
    var batch = queue;
    queue = new Map();
    batch.forEach(function (callback) {
      callback(time);
    });
  }

  function pump() {
    if (scheduled || queue.size === 0 || !open()) return;
    scheduled = true;
    nativeRequest(function (time) {
      scheduled = false;
      if (open()) flush(time);
    });
  }

  window.requestAnimationFrame = function (callback) {
    var id = nextId++;
    queue.set(id, callback);
    pump();
    return id;
  };

  window.cancelAnimationFrame = function (id) {
    queue.delete(id);
  };

  // A paused piece still needs a picture. Play a second's worth of frames in
  // one go and hold the result: a developed still, with no motion on screen.
  function still() {
    for (var i = 0; i < ${STILL_FRAMES} && queue.size > 0; i += 1) {
      flush(performance.now());
    }
  }

  // The still for a piece that starts out paused, made once.
  function settle() {
    if (!loaded || running || settled) return;
    settled = true;
    still();
  }

  // Loading and sizing. In a few loads in a hundred on a busy machine, a
  // script included straight in the document measured the stage as 0 x 0 and
  // stayed blank: no resize event followed, though the frame had its full
  // size. (A sandboxed frame is laid out by another process; its size
  // apparently can arrive after its document has started running, and a
  // frame's first size is not a resize.) So the script is only loaded once
  // the stage has a size, and from then on a resize is sent whenever the stage
  // differs from what the script last had the chance to measure.
  var container = document.getElementById("canvasContainer");
  var seenSize = "";
  var requested = false;

  function size() {
    return container.clientWidth + "x" + container.clientHeight;
  }

  function noteSize() {
    seenSize = size();
  }

  var script = document.createElement("script");
  script.src = ${JSON.stringify(scriptSrc)};
  // Fires as soon as the script has run, with nothing in between: the size it
  // measured is the size now.
  script.onload = function () {
    loaded = true;
    noteSize();
    settle();
    announce();
  };
  // The file did not arrive (offline, a stale page after a deploy): say so
  // rather than report an empty canvas as ready.
  script.onerror = function () {
    loaded = true;
    failed = true;
    announce();
  };

  new ResizeObserver(function () {
    if (container.clientWidth === 0 || container.clientHeight === 0) return;
    if (!requested) {
      requested = true;
      document.body.appendChild(script);
    } else if (loaded && size() !== seenSize) {
      window.dispatchEvent(new Event("resize"));
    }
  }).observe(container);

  function announce() {
    window.parent.postMessage({ source: "playground-frame", ready: true, failed: failed }, "*");
  }

  window.addEventListener("message", function (event) {
    var message = event.data;
    if (event.source !== window.parent || !message || message.source !== "playground") return;
    if (message.hello) {
      if (loaded) announce();
      return;
    }
    running = message.running === true;
    if (running) pump();
    else if (message.initial) settle();
  });

  document.addEventListener("visibilitychange", pump);

  // Most pieces wipe their canvas when it is resized and count on the next
  // frame to repaint it. Paused, there is no next frame, so make a new still
  // (after the piece's own resize handler has run).
  window.addEventListener("resize", function () {
    noteSize();
    nativeRequest(function () {
      if (loaded && !running) still();
    });
  });
})();`;

function buildDocument(scriptSrc: string) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body {
        margin: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: ${STAGE_BACKGROUND};
      }

      #canvasContainer {
        width: 100%;
        height: 100%;
      }

      #jsCanvas {
        display: block;
        width: 100%;
        height: 100%;
      }
    </style>
  </head>
  <body>
    <div id="canvasContainer">
      <canvas id="jsCanvas"></canvas>
    </div>
    <script>${harness(scriptSrc)}</script>
  </body>
</html>`;
}

interface ScriptRunnerProps {
  /** Site path of the script to run, for example `/scripts/starfield_warp.js`. */
  scriptSrc: string;
  /** Accessible name of the frame. */
  title: string;
  /** False holds the animation on its current frame. */
  running?: boolean;
  /** Called once, when the script has loaded and drawn its first frame, or has failed to load. */
  onReady?: () => void;
  className?: string;
}

/** Sends the harness a message. The sandboxed document has no origin to name, hence "*"; nothing private is sent. */
function post(frame: HTMLIFrameElement | null, message: { hello: true } | { running: boolean; initial: boolean }) {
  frame?.contentWindow?.postMessage({ source: "playground", ...message }, "*");
}

/**
 * Runs one canvas script in a sandboxed frame. `allow-scripts` without
 * `allow-same-origin` gives the script an opaque origin: it cannot read this
 * site's cookies, storage or DOM, and messages are the only way in or out.
 *
 * The frame says when it is ready (script loaded, first frame drawn) and is
 * then told whether to animate. The component also asks once when it starts
 * listening, for a frame that finished loading before that. A script that
 * cannot be fetched is reported too, and a notice takes the frame's place.
 */
export default function ScriptRunner({ scriptSrc, title, running = true, onReady, className }: ScriptRunnerProps) {
  const frame = useRef<HTMLIFrameElement>(null);
  const ready = useRef(false);
  // The script that failed to load, so a different one starts with a clean slate.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const srcDoc = useMemo(() => buildDocument(scriptSrc), [scriptSrc]);

  // The handlers below outlive a render; these keep them on the latest props.
  const latest = useRef({ running, onReady });
  useEffect(() => {
    latest.current = { running, onReady };
  });

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow || event.data?.source !== "playground-frame") return;
      const first = !ready.current;
      ready.current = true;
      if (event.data.failed === true) setFailedSrc(scriptSrc);
      // `initial` marks the state the piece starts in: paused from the start means "show a still".
      post(frame.current, { running: latest.current.running, initial: true });
      if (first) latest.current.onReady?.();
    };

    ready.current = false;
    window.addEventListener("message", onMessage);
    post(frame.current, { hello: true });
    return () => window.removeEventListener("message", onMessage);
  }, [scriptSrc]);

  useEffect(() => {
    // Before the frame is ready nobody is listening; it is told the state when it reports in.
    if (ready.current) post(frame.current, { running, initial: false });
  }, [running]);

  if (failedSrc === scriptSrc) {
    return (
      <p
        role="alert"
        className="flex h-full items-center justify-center px-6 text-center text-sm"
        style={{ color: STAGE_INK }}
      >
        This experiment could not load. Check the connection, then press restart.
      </p>
    );
  }

  return (
    <iframe
      // A different script always gets a fresh document.
      key={scriptSrc}
      ref={frame}
      className={className}
      srcDoc={srcDoc}
      sandbox="allow-scripts"
      title={title}
    />
  );
}
