import type { ReactNode } from "react";
import { SITE_ANCHORS } from "@/lib/portfolioProjects";
import ButtonLink from "@/components/ui/ButtonLink";
import Panel from "@/components/ui/Panel";
import SectionHeading from "@/components/ui/SectionHeading";
import { GitHubIcon } from "@/components/ui/icons";
import StatusPill, { type FetchStatus } from "./StatusPill";
import { LEETCODE_PROFILE_URL, LEETCODE_SOLUTIONS_URL } from "./profile";

// The frame of the home page's Coding section, apart from the live numbers
// (LeetcodeStats), so the section can still be drawn when those cannot load.

export function ProfileLinks() {
  return (
    <div className="flex flex-wrap gap-3">
      <ButtonLink href={LEETCODE_PROFILE_URL}>My LeetCode profile</ButtonLink>
      <ButtonLink href={LEETCODE_SOLUTIONS_URL} icon={<GitHubIcon />}>
        My favourite problems on GitHub
      </ButtonLink>
    </div>
  );
}

/** The section and its heading, the same in every state; `children` is the body. */
export function CodingSection({ status, children }: { status: FetchStatus; children: ReactNode }) {
  return (
    <section id={SITE_ANCHORS.coding} aria-labelledby="coding-title">
      <SectionHeading section="coding" title="Coding" id="coding-title" action={<StatusPill status={status} />}>
        Live numbers from my LeetCode profile: problems solved, recent work and a year of submissions.
      </SectionHeading>
      {children}
    </section>
  );
}

/** One short notice in place of the numbers, beside the links that work regardless. */
export function CodingNotice({ children }: { children: ReactNode }) {
  return (
    <Panel className="mt-8 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 p-4 sm:p-6">
      <p className="text-base text-body">{children}</p>
      <ProfileLinks />
    </Panel>
  );
}
