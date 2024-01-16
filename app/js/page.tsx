import AdList from "@/components/adList";
import JSCanvas from "@/components/jsCanvas";
import { WindowIcon } from "@heroicons/react/24/outline";

const jsList = [
  {
    title: "experiment #1",
    description: "some description",
    icon: WindowIcon
  },
  {
    title: "experiment #2",
    description: "some description",
    icon: WindowIcon
  },
  {
    title: "experiment #3",
    description: "some description",
    icon: WindowIcon
  },
]

export default function JSPage() {
  return (
    <div className="p-8 grid grid-cols-4 bg-black flex-grow box-border max-h-full">
      <div className="col-span-1 h-full box-border">
        <AdList className="flex-grow-1" entries={jsList} title="JS Experiments" />
      </div>
      <div className="ml-8 col-span-3 rounded-xl border-white border-2 border-dashed box-border overflow-clip">
        <JSCanvas className="w-full h-full" scriptSrc="scripts/balls.js" />
      </div>
    </div>
  )
}
