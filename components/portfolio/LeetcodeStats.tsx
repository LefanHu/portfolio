"use client";

import { useEffect, useState } from "react";
import { SITE_ANCHORS } from "@/lib/portfolioProjects";
import ButtonLink from "@/components/ui/ButtonLink";
import Panel from "@/components/ui/Panel";
import SectionHeading from "@/components/ui/SectionHeading";
import { GitHubIcon } from "@/components/ui/icons";
import RecentlySolved from "./lt/RecentlySolved";
import Skills from "./lt/Skills";
import StatTiles from "./lt/StatTiles";
import StatusPill from "./lt/StatusPill";
import SubmissionCalendar from "./lt/SubmissionCalendar";
import { LEETCODE_PROFILE_URL, LEETCODE_SOLUTIONS_URL, toProfileView, type ProfileView } from "./lt/profile";

type State = { status: "loading" } | { status: "ready"; profile: ProfileView } | { status: "error" };

function Links() {
  return (
    <div className="flex flex-wrap gap-3">
      <ButtonLink href={LEETCODE_PROFILE_URL}>My LeetCode profile</ButtonLink>
      <ButtonLink href={LEETCODE_SOLUTIONS_URL} icon={<GitHubIcon />}>
        My favourite problems on GitHub
      </ButtonLink>
    </div>
  );
}

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
    <section id={SITE_ANCHORS.coding} aria-labelledby="coding-title">
      <SectionHeading
        section="coding"
        title="Coding"
        id="coding-title"
        action={<StatusPill status={state.status} />}
      >
        Live numbers from my LeetCode profile: problems solved, recent work and a year of submissions.
      </SectionHeading>

      {state.status === "error" ? (
        <Panel className="mt-8 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 p-4 sm:p-6">
          <p className="text-base text-body">LeetCode statistics are unavailable right now.</p>
          <Links />
        </Panel>
      ) : (
        <div className="mt-8 space-y-4" aria-busy={state.status === "loading"}>
          <StatTiles stats={profile?.stats} />
          <RecentlySolved problems={profile?.recent} />
          <Skills groups={profile?.skills} />
          <SubmissionCalendar year={profile ? profile.year : undefined} />
          <Links />
        </div>
      )}
    </section>
  );
}
