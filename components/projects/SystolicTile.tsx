const COLUMNS = 9;
const ROWS = 6;
const PITCH = 40;
const CELL = 20;
const INSET = (PITCH - CELL) / 2;

/**
 * Cover for the LLM accelerator, which has no photograph: a systolic array,
 * the structure the project is built from. A grid of identical compute cells
 * passes data to its right and lower neighbours each clock, so work moves
 * through it as diagonal wavefronts (the lit cells, each with the fainter
 * diagonal it has just left behind it).
 *
 * Drawn from the theme tokens, and cropped rather than squeezed to fill
 * whatever shape the card gives it.
 */
export default function SystolicTile({ className = "" }: { className?: string }) {
  const cells = Array.from({ length: COLUMNS * ROWS }, (_, index) => ({
    column: index % COLUMNS,
    row: Math.floor(index / COLUMNS),
  }));

  return (
    <svg
      viewBox={`0 0 ${COLUMNS * PITCH} ${ROWS * PITCH}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <g className="stroke-line-strong" strokeWidth={1.5}>
        {cells.map(({ column, row }) => {
          const x = column * PITCH + INSET;
          const y = row * PITCH + INSET;
          return (
            <path
              key={`${column}-${row}`}
              // To the right-hand neighbour, and to the one below.
              d={`M${x + CELL} ${y + CELL / 2}h${PITCH - CELL}M${x + CELL / 2} ${y + CELL}v${PITCH - CELL}`}
            />
          );
        })}
      </g>
      {cells.map(({ column, row }) => {
        const phase = (column + row) % 4;
        return (
          <rect
            key={`${column}-${row}`}
            x={column * PITCH + INSET}
            y={row * PITCH + INSET}
            width={CELL}
            height={CELL}
            rx={3}
            strokeWidth={1.5}
            className={
              phase === 2
                ? "fill-rune stroke-rune"
                : phase === 1
                  ? "fill-rune/25 stroke-rune/60"
                  : "fill-pane stroke-line-strong"
            }
          />
        );
      })}
    </svg>
  );
}
