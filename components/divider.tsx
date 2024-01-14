interface DividerProps {
    badgeTitle: string
}

export default function Divider(props: DividerProps) {
    return (
        <h3 className="flex items-center my-8">
            <span aria-hidden="true" className="flex-grow bg-gray-200 rounded h-0.5"></span>
            <span className="inline-block px-4 py-1 text-sm font-medium text-center text-gray-500 bg-gray-200 rounded-full">
                {props.badgeTitle}
            </span>
            <span aria-hidden="true" className="flex-grow bg-gray-200 rounded h-0.5"></span>
        </h3>
    )
}