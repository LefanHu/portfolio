import Image from "next/image"

interface ListProps {
    data: ListEntry[]
}

interface ListEntry {
    title: string,
    description: string,
    imageSrc: string,
}

export default function GenericList(props: ListProps) {
    return (
        <ul role="list" className="divide-y divide-gray-100">
            {props.data.map((entry) => (
                <li key={entry.title} className="flex justify-between gap-x-6 py-5">
                    <div className="flex min-w-0 gap-x-4">
                        <Image className="h-12 w-12 flex-none rounded-full bg-gray-50" src={entry.imageSrc} alt={entry.title} width={500} height={500} />
                        <div className="min-w-0 flex-auto">
                            <p className="text-sm font-semibold leading-6 text-gray-900">{entry.title}</p>
                            <p className="mt-1 truncate text-xs leading-5 text-gray-500">{entry.description}</p>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    )
}