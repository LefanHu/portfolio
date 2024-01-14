import AdList from "@/components/adList";
import Divider from "@/components/divider";
import GenericList from "@/components/genericList";
import { WindowIcon } from "@heroicons/react/24/outline";

const jsList = [
  {
    title: "experiment #1",
    description: "some description",
    icon: WindowIcon
  },
  {
    title: "experiment #1",
    description: "some description",
    icon: WindowIcon
  },
  {
    title: "experiment #1",
    description: "some description",
    icon: WindowIcon
  },
  {
    title: "experiment #1",
    description: "some description",
    icon: WindowIcon
  },
  {
    title: "experiment #1",
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
      <div className="ml-8 col-span-3 rounded-xl border-white border-2 border-dashed box-border">
      </div>
    </div>
  )
}
