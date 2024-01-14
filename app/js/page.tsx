import Divider from "@/components/divider";
import GenericList from "@/components/genericList";

const jsList = [
  {
    title: "experiment #1",
    description: "some description",
    imageSrc: "/"
  },
  {
    title: "experiment #1",
    description: "some description",
    imageSrc: "/"
  },
  {
    title: "experiment #1",
    description: "some description",
    imageSrc: "/"
  },
  {
    title: "experiment #1",
    description: "some description",
    imageSrc: "/"
  },
  {
    title: "experiment #1",
    description: "some description",
    imageSrc: "/"
  },
  {
    title: "experiment #1",
    description: "some description",
    imageSrc: "/"
  },
  {
    title: "experiment #1",
    description: "some description",
    imageSrc: "/"
  },
  {
    title: "experiment #1",
    description: "some description",
    imageSrc: "/"
  },
  {
    title: "experiment #1",
    description: "some description",
    imageSrc: "/"
  },
]

export default function JSPage() {
  return (
    <div className="grid grid-cols-4 max-h-full bg-black">
      <div className="m-8 col-span-1 rounded-xl border-white border-2 overflow-y-scroll max-h-full">
        <Divider badgeTitle="JS" />
        <GenericList data={jsList} />
      </div>
      <div className="m-8 col-span-3 rounded-xl border-white border-2 border-dashed">
      </div>
    </div>
  )
}
