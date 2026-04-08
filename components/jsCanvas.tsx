"use client";

interface JSCanvasProps {
  scriptSrc: string;
  className?: string;
}

export default function JSCanvas(props: JSCanvasProps) {
  const iframeSrcDoc = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body {
        margin: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: #000;
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
    <script src="${props.scriptSrc}"></script>
  </body>
</html>`;

  return (
    <iframe
      key={props.scriptSrc}
      className={props.className}
      srcDoc={iframeSrcDoc}
      sandbox="allow-scripts"
      title="JS Canvas Experiment"
    />
  );
}
