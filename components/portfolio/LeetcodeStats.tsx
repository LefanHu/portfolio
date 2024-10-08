"use client";

import { LTProfileResponse } from "@/lib/types/stats/lt";
import { useEffect, useState } from "react";
import AnimatedCounter from "../AnimatedCounter";
import { Badge, SemiCircleProgress, Skeleton } from "@mantine/core";
import LTActivityCalendar from "../LTActivityCalendar";

export default function LeetcodeStats() {
  const [profileStats, setProfileStats] = useState<LTProfileResponse | null>();

  const problemColors = [
    "text-white",
    "text-green-500",
    "text-orange-400",
    "text-red-600",
  ];
  const progressCircleColors = ["none", "green", "yellow", "red"];

  // fetch stats
  useEffect(() => {
    const getLTProfile = async () => {
      try {
        const res = await fetch("/api/leetcode/profile", {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
        const results = (await res.json()) as LTProfileResponse;

        // Throw error with status code in case Fetch API req failed
        if (!res.ok) {
          throw new Error(res.status.toString());
        }
        console.log(results);
        setProfileStats(results);
      } catch (error) {
        console.log(`failed to fetch leetcode profile: ${error}`);
      }
    };

    getLTProfile();
  }, []);

  // TODO: do skeleton placeholder here
  if (!profileStats) {
    return (
      <div className="flex flex-col">
        <h2 className="text-3xl font-bold tracking-tight text-gray-200 sm:text-4xl my-4">
          (Live!) Leetcode Statistics
        </h2>

        <div className="bg-gray-900 bg-opacity-90 rounded-2xl p-4">
          <Skeleton height={8} radius="xl" />
          <Skeleton height={8} mt={6} radius="xl" />
          <Skeleton height={8} mt={6} width="70%" radius="xl" />
        </div>
      </div>
    );
  }

  const skillCategories: Array<
    keyof typeof profileStats.data.matchedUser.tagProblemCounts
  > = ["fundamental", "intermediate", "advanced"];

  return (
    <div className="grid grid-cols-1 items-center">
      <h2 className="text-3xl font-bold tracking-tight text-gray-200 sm:text-4xl my-3">
        (Live!) Leetcode Statistics
      </h2>

      {/* leetcode stats */}
      <div className="bg-gray-900 bg-opacity-90 rounded-2xl p-4">
        <div className="flex flex-col gap-4 mx-auto">
          <div className="grid w-full grid-cols-1 lg:grid-cols-4 md:grid-cols-2 gap-y-8 bg-gray-600 bg-opacity-45 p-3 rounded-2xl">
            {profileStats?.data.matchedUser.submitStatsGlobal.acSubmissionNum.map(
              (questionType, index) => (
                <div
                  className="flex flex-col items-center justify-end"
                  key={index}
                >
                  {index !== 0 ? (
                    <SemiCircleProgress
                      fillDirection="left-to-right"
                      orientation="up"
                      filledSegmentColor={progressCircleColors[index]}
                      size={200}
                      thickness={12}
                      value={
                        profileStats.data.matchedUser.problemsSolvedBeatsStats[
                          index - 1
                        ].percentage
                      }
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
                    {index !== 0
                      ? ` - beats ${
                          profileStats.data.matchedUser
                            .problemsSolvedBeatsStats[index - 1].percentage
                        }%`
                      : ""}
                  </p>
                </div>
              )
            )}
          </div>

          {/* section 2 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
            <div className="flex flex-col md:col-span-2 gap-2 items-center p-4 bg-gray-600 bg-opacity-45 rounded-2xl">
              <div className="w-full">
                <h3 className="text-2xl font-extrabold leading-tight text-gray-200">
                  Recent AC
                </h3>
                <hr className="h-0.5 border-t-0 bg-neutral-100 dark:bg-white/5" />
              </div>
              <ul className="w-full flex flex-col gap-2">
                {profileStats.data.recentSubmissionList
                  .slice(0, 6)
                  .map((submission, index) => (
                    <li
                      key={index}
                      className="w-full bg-gray-500 bg-opacity-80 rounded-lg p-2"
                    >
                      <h4 className="text-white font-bold overflow-clip">
                        {submission.title}
                      </h4>
                      <div className="mt-2 grid grid-cols-2 justify-items-start">
                        <div className="flex flex-row gap-2">
                          <Badge size="sm" color="blue">
                            {submission.lang}
                          </Badge>
                          <Badge size="sm" color="blue">
                            {new Date(
                              Number(submission.timestamp) * 1000
                            ).toLocaleString()}
                          </Badge>
                        </div>
                        <Badge
                          size="sm"
                          color={
                            submission.statusDisplay === "Accepted"
                              ? "green"
                              : "orange"
                          }
                          className="justify-self-end"
                        >
                          {submission.statusDisplay}
                        </Badge>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
            <div className="col-span-1 md:col-span-2 p-4 bg-gray-600 bg-opacity-45 rounded-2xl row-auto">
              {skillCategories.map((skillCategory, skillIndx) => (
                <div key={skillIndx}>
                  <dt className="inline-block text-2xl font-bold Skills">
                    {skillCategory.charAt(0).toUpperCase() +
                      skillCategory.substring(1) +
                      " Skills"}
                  </dt>
                  <hr className="h-0.5 border-t-0 bg-neutral-100 dark:bg-white/10" />
                  <dd
                    key={skillIndx}
                    className="flex flex-row flex-wrap gap-2 m-2 p-2"
                  >
                    {profileStats.data.matchedUser.tagProblemCounts[
                      skillCategory
                    ].map((level, badgeIndx) => (
                      <Badge size="sm" color="blue" key={badgeIndx}>
                        {level.tagSlug} <span className="text-gray-800">x</span>{" "}
                        <span className="text-orange-500 font-bold">
                          {level.problemsSolved}
                        </span>
                      </Badge>
                    ))}
                  </dd>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full items-center p-4 bg-gray-600 bg-opacity-45 rounded-2xl">
            <div className="w-full justify-start">
              <h3 className="text-3xl font-extrabold leading-tight text-gray-200">
                Submission Calendar
              </h3>
            </div>
            <LTActivityCalendar
              calendarstring={profileStats.data.matchedUser.submissionCalendar}
              className="flex w-full justify-center"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
