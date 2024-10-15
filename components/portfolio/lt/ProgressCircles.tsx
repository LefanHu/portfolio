import AnimatedCounter from "@/components/AnimatedCounter";
import { SemiCircleProgress } from "@mantine/core";

interface ACSubmissionNum {
  difficulty: string;
  count: number;
}

interface Beats {
  difficulty: string;
  percentage: number;
}

// Define default values
const defaultProgress: ACSubmissionNum[] = [
  { difficulty: "All", count: 0 },
  { difficulty: "Easy", count: 0 },
  { difficulty: "Medium", count: 0 },
  { difficulty: "Hard", count: 0 },
];

const defaultBeats: Beats[] = [
  { difficulty: "Easy", percentage: 0 },
  { difficulty: "Medium", percentage: 0 },
  { difficulty: "Hard", percentage: 0 },
];

export default function LTProgress(props: {
  progress?: ACSubmissionNum[];
  beats?: Beats[];
}) {
  const { progress = defaultProgress, beats = defaultBeats } = props;
  const problemColors = [
    "text-white",
    "text-green-500",
    "text-orange-400",
    "text-red-600",
  ];
  const progressCircleColors = ["none", "green", "yellow", "red"];

  return (
    <div className="grid w-full grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-y-8 bg-gray-600 bg-opacity-45 p-3 rounded-2xl">
      {progress.map((questionType, index) => (
        <div className="flex flex-col items-center justify-end" key={index}>
          {index !== 0 ? (
            <SemiCircleProgress
              fillDirection="left-to-right"
              orientation="up"
              filledSegmentColor={progressCircleColors[index]}
              size={200}
              thickness={12}
              value={beats[index - 1].percentage}
              label={
                <span className="text-5xl font-extrabold leading-tight text-center text-gray-200">
                  {<AnimatedCounter from={0} to={questionType.count} />}
                </span>
              }
            />
          ) : (
            <span className="text-5xl font-extrabold leading-tight text-center text-gray-200">
              {<AnimatedCounter from={0} to={questionType.count} />}
            </span>
          )}
          <p
            className={`text-base font-medium leading-7 text-center ${problemColors[index]}`}
          >
            {questionType.difficulty}
            {index !== 0 ? ` - beats ${beats[index - 1].percentage}%` : ""}
          </p>
        </div>
      ))}
    </div>
  );
}
