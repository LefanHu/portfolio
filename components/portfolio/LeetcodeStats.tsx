"use client";

import { LTProfileResponse } from "@/lib/stats/lt";
import { useEffect, useState } from "react";

export default function LeetcodeStats() {
  const [profileStats, setProfileStats] = useState<LTProfileResponse | null>(
    null
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
      } catch (error) {
        console.log(`failed to fetch leetcode profile: ${error}`);
      }
    };

    getLTProfile();
  }, []);

  return (
    <div className="mx-auto grid max-w-2xl grid-cols-1 items-center gap-x-8 gap-y-16 px-4 py-24 sm:px-6 sm:py-32 lg:max-w-7xl lg:grid-cols-2 lg:px-8">
      {profileStats ? (
        profileStats.data.matchedUser.contributions.points
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
