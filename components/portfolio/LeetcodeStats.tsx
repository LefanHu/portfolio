"use client";

import { useEffect, useState } from "react";
import { CodingNotice, CodingSection, ProfileLinks } from "./lt/CodingSection";
import RecentlySolved from "./lt/RecentlySolved";
import Skills from "./lt/Skills";
import StatTiles from "./lt/StatTiles";
import SubmissionCalendar from "./lt/SubmissionCalendar";
import { toProfileView, type ProfileView } from "./lt/profile";

type State = { status: "loading" } | { status: "ready"; profile: ProfileView } | { status: "error" };

/**
 * Live LeetCode numbers, fetched in the browser from /api/leetcode/profile.
 * The section and its heading are the same in every state; only the body
 * changes: placeholders of the final size, then the data, or one short notice.
 */
export default function LeetcodeStats() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/leetcode/profile", { signal: controller.signal, headers: { Accept: "application/json" } })
      .then((response) => {
        // An error reply is JSON too ({ error }), but it is not a profile.
        if (!response.ok) throw new Error(`LeetCode profile request failed (${response.status})`);
        return response.json();
      })
      .then((json: unknown) => {
        const profile = toProfileView(json);
        setState(profile ? { status: "ready", profile } : { status: "error" });
      })
      .catch(() => {
        // Aborted means unmounted: nothing to update. Anything else is shown as unavailable.
        if (!controller.signal.aborted) setState({ status: "error" });
      });
    return () => controller.abort();
  }, []);

  const profile = state.status === "ready" ? state.profile : undefined;

  return (
    <CodingSection status={state.status}>
      {state.status === "error" ? (
        <CodingNotice>LeetCode statistics are unavailable right now.</CodingNotice>
      ) : (
        <div className="mt-8 space-y-4" aria-busy={state.status === "loading"}>
          <StatTiles stats={profile?.stats} />
          <RecentlySolved problems={profile?.recent} />
          <Skills groups={profile?.skills} />
          <SubmissionCalendar year={profile ? profile.year : undefined} />
          <ProfileLinks />
        </div>
      )}
    </CodingSection>
  );
}
