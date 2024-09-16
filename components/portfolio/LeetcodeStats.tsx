"use client";

import { LTProfileResponse } from "@/lib/types/stats/lt";
import { useEffect, useState } from "react";
import AnimatedCounter from "../AnimatedCounter";
import { Badge, SemiCircleProgress, Skeleton } from "@mantine/core";
import Image from "next/image";

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
      <div className="mx-auto grid max-w-2xl grid-cols-1 items-center px-4 py-12 sm:px-6 sm:py-16 lg:max-w-7xl lg:px-8 bg-gray-600 bg-opacity-50 rounded-2xl">
        <h2 className="text-3xl font-bold tracking-tight text-gray-200 sm:text-4xl my-3">
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

  // calculating meme face level
  const memeFaceLevels = [5, 14, 30, 90, 100, 200, Number.MAX_SAFE_INTEGER];
  var memeFaceLevel = 0;
  while (
    memeFaceLevels[memeFaceLevel] <=
    profileStats.data.matchedUser.userCalendar.streak
  ) {
    memeFaceLevel++;
  }

  const skillCategories: Array<
    keyof typeof profileStats.data.matchedUser.tagProblemCounts
  > = ["fundamental", "intermediate", "advanced"];

  return (
    <div className="mx-auto grid max-w-2xl grid-cols-1 items-center px-4 py-12 sm:px-6 sm:py-16 lg:max-w-7xl lg:px-8">
      <h2 className="text-3xl font-bold tracking-tight text-gray-200 sm:text-4xl my-3">
        (Live!) Leetcode Statistics
      </h2>

      {/* leetcode stats */}
      <div className="bg-gray-900 bg-opacity-90 rounded-2xl p-4">
        <div className="flex flex-col gap-4 mx-auto my-4">
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
                        <h3 className="text-5xl font-extrabold leading-tight text-center text-gray-200">
                          {<AnimatedCounter from={0} to={questionType.count} />}
                        </h3>
                      }
                    />
                  ) : (
                    <h3 className="text-5xl font-extrabold leading-tight text-center text-gray-200">
                      {<AnimatedCounter from={0} to={questionType.count} />}
                    </h3>
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
            <div className="flex flex-col gap-2 items-center p-4 bg-gray-600 bg-opacity-45 rounded-2xl">
              <div>
                <h3 className="text-5xl font-extrabold leading-tight text-center text-gray-200">
                  <AnimatedCounter
                    from={0}
                    to={profileStats?.data.matchedUser.userCalendar.streak}
                  />
                </h3>
                <p className="text-base font-medium leading-7 text-center text-dark-grey-600">
                  Current Streak!
                </p>
              </div>

              {/* image */}
              <Image
                src={`/images/incredibles/phase${memeFaceLevel + 1}.webp`}
                width={300}
                height={300}
                alt="meme face based on streak counter"
                className="rounded-xl border-4 aspect-square object-cover w-full h-auto"
              />
            </div>
            <div className="col-span-1 md:col-span-3 p-4 bg-gray-600 bg-opacity-45 rounded-2xl row-auto">
              {skillCategories.map((skillCategory, skillIndx) => (
                <div key={skillIndx}>
                  <dt className="inline-block text-2xl font-bold tracking-tight bg-gradient-to-r from-yellow-300 to-red-500 bg-clip-text text-transparent">
                    {skillCategory.toUpperCase()}
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
                        {level.tagSlug} x{" "}
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
        </div>
      </div>
    </div>
  );
}
