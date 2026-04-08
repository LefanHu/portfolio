"use client";

import { LTProfileResponse } from "@/lib/types/stats/lt";
import { useEffect, useState } from "react";
import { Skeleton } from "@mantine/core";
import LTActivityCalendar from "../LTActivityCalendar";
import RecentAC from "./lt/RecentAC";
import { range } from "lodash";
import LTSkill from "./lt/Skill";
import ProgressCircles from "./lt/ProgressCircles";

type SkillCategory = "advanced" | "intermediate" | "fundamental";

export default function LeetcodeStats() {
  const [profileStats, setProfileStats] = useState<LTProfileResponse | null>(
    null
  );
  const [fetchState, setFetchState] = useState<"loading" | "ready" | "error">(
    "loading"
  );

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
        setProfileStats(results);
        setFetchState("ready");
      } catch (error) {
        console.log(`failed to fetch leetcode profile: ${error}`);
        setProfileStats(null);
        setFetchState("error");
      }
    };

    getLTProfile();
  }, []);

  const skillCategories: SkillCategory[] = [
    "fundamental",
    "intermediate",
    "advanced",
  ];
  const matchedUser = profileStats?.data?.matchedUser;
  const recentSubmissionList = profileStats?.data?.recentSubmissionList ?? [];
  const isLoading = fetchState === "loading";
  const hasProfile = Boolean(matchedUser);

  return (
    <div className="grid grid-cols-1 items-center">
      <h2 className="text-3xl font-bold tracking-tight text-gray-200 sm:text-4xl my-3">
        (
        {fetchState === "loading"
          ? "...Loading"
          : hasProfile
            ? "Live"
            : "Unavailable"}
        !) Leetcode Statistics
      </h2>

      <div className="bg-gray-900/90 rounded-2xl p-4">
        <div className="flex flex-col gap-4 mx-auto">
          <ProgressCircles
            progress={matchedUser?.submitStatsGlobal?.acSubmissionNum}
            beats={matchedUser?.problemsSolvedBeatsStats}
          />

          {/* section 2 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
            <div className="flex flex-col md:col-span-2 gap-2 items-center p-4 bg-gray-600/45 rounded-2xl">
              <div className="w-full">
                <h3 className="text-2xl font-extrabold leading-tight text-gray-200">
                  Recent AC
                </h3>
                <hr className="h-0.5 border-t-0 bg-neutral-100 dark:bg-white/5" />
              </div>
              <ul className="w-full flex flex-col gap-2">
                {isLoading
                  ? range(6).map((indx) => <RecentAC key={indx} />)
                  : recentSubmissionList.length > 0
                    ? recentSubmissionList
                        .filter((sub) => sub.statusDisplay === "Accepted")
                        .slice(0, 6)
                        .map((submission, indx) => (
                          <RecentAC sub={submission} key={indx} />
                        ))
                    : (
                      <li className="w-full rounded-lg border border-white/10 bg-gray-700/40 p-4 text-sm text-gray-300">
                        Recent accepted submissions are unavailable right now.
                      </li>
                    )}
              </ul>
            </div>
            <div className="col-span-1 md:col-span-2 p-4 bg-gray-600/45 rounded-2xl row-auto">
              {matchedUser ? (
                skillCategories.map((skillCategory, skillIndx) => (
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
                      {matchedUser.tagProblemCounts[skillCategory].map((skill, indx) => (
                        <LTSkill {...skill} key={indx} />
                      ))}
                    </dd>
                  </div>
                ))
              ) : isLoading ? (
                <Skeleton height="100%" radius="lg" />
              ) : (
                <p className="rounded-lg border border-white/10 bg-gray-700/40 p-4 text-sm text-gray-300">
                  Skill breakdown is unavailable right now.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full items-center p-4 bg-gray-600/45 rounded-2xl">
            <div className="w-full justify-start">
              <h3 className="text-3xl font-extrabold leading-tight text-gray-200">
                Submission Calendar
              </h3>
            </div>
            {matchedUser ? (
              <LTActivityCalendar
                calendarstring={matchedUser.submissionCalendar}
                className="flex w-full justify-center"
              />
            ) : isLoading ? (
              <Skeleton height={200} radius="lg" />
            ) : (
              <p className="w-full rounded-lg border border-white/10 bg-gray-700/40 p-4 text-sm text-gray-300">
                Submission calendar is unavailable right now.
              </p>
            )}
          </div>
        </div>
      </div>
      <p className="text-xl text-white mt-1">
        View some of my favorite problems{" "}
        <a
          href="https://github.com/LefanHu/leetcode/tree/main"
          className="font-bold text-blue-600 underline"
        >
          here
        </a>
      </p>
    </div>
  );
}
