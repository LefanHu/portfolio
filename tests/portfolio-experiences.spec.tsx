import React from "react";
import { render, screen } from "@testing-library/react";
import Experiences, {
  experienceBranches,
} from "@/components/portfolio/PortfolioExperiences";

describe("portfolio experiences", () => {
  it("renders the overview and all major branches", () => {
    render(<Experiences />);

    expect(screen.getByText("Experience Tree")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Work experience grouped by the kinds of systems I like building."
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Career Journey")).toBeInTheDocument();

    for (const branch of experienceBranches) {
      expect(screen.getAllByText(branch.title).length).toBeGreaterThan(0);
    }
  });

  it("renders all resume roles", () => {
    render(<Experiences />);

    const roleTitles = experienceBranches.flatMap((branch) =>
      branch.roles.map((role) => role.title)
    );

    for (const title of roleTitles) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
  });

  it("shows the branch and experience counts in the overview", () => {
    render(<Experiences />);

    const totalRoles = experienceBranches.reduce(
      (count, branch) => count + branch.roles.length,
      0
    );

    expect(
      screen.getByText(`${experienceBranches.length} branches`)
    ).toBeInTheDocument();
    expect(screen.getByText(`${totalRoles} experiences`)).toBeInTheDocument();
  });
});
