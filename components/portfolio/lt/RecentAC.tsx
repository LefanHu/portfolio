import { Badge, Skeleton } from "@mantine/core";

interface Submission {
  title: string;
  titleSlug: string;
  timestamp: string;
  statusDisplay: string;
  lang: string;
}

export default function RecentAC(props: { sub?: Submission }) {
  return (
    <li className="w-full bg-gray-500 bg-opacity-80 rounded-lg p-2">
      <h4 className="text-white font-bold overflow-clip">
        {props.sub ? (
          props.sub.title
        ) : (
          <Skeleton height={8} mt={6} radius="xl" width="60%" />
        )}
      </h4>
      <div className="mt-2 grid grid-cols-2 justify-items-start">
        <div className="flex flex-row gap-2">
          <Badge size="sm" color="blue">
            {props.sub ? (
              props.sub.lang
            ) : (
              <Skeleton height={8} radius="lg" width={16} />
            )}
          </Badge>
          <Badge size="sm" color="blue">
            {props.sub ? (
              new Date(Number(props.sub.timestamp) * 1000).toLocaleString()
            ) : (
              <Skeleton height={8} radius="lg" width={32} />
            )}
          </Badge>
        </div>

        <Badge
          size="sm"
          color={
            props.sub
              ? props.sub.statusDisplay === "Accepted"
                ? "green"
                : "orange"
              : "gray"
          }
          className="justify-self-end"
        >
          {props.sub ? props.sub.statusDisplay : "----"}
        </Badge>
      </div>
    </li>
  );
}
