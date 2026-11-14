import { PANEL } from "@/components/ui/Panel";
import { PLAYGROUND_GRID, STAGE_BACKGROUND, STAGE_FRAME } from "./layout";

/**
 * Stands in for the playground until the browser has read the URL: the choice
 * of experiment lives in `?script=`, which the prerendered page cannot know.
 * Same boxes, same sizes.
 */
export default function PlaygroundFallback() {
  return (
    <div className={PLAYGROUND_GRID} role="status">
      <span className="sr-only">Loading the playground</span>
      <div className={`${PANEL} flex min-w-0 flex-col overflow-hidden`}>
        <div className="px-4 pb-3 pt-2.5 sm:px-5">
          <div className="flex h-11 items-center">
            <div className="skeleton h-6 w-44" />
          </div>
          <div className="flex min-h-[3em] items-start text-sm sm:min-h-0">
            <div className="skeleton h-4 w-72 max-w-full" />
          </div>
        </div>
        <div className={`border-y border-line ${STAGE_FRAME}`} style={{ backgroundColor: STAGE_BACKGROUND }} />
        <div className="h-14" />
      </div>
      <div className={`${PANEL} h-15 lg:h-auto`} />
    </div>
  );
}
