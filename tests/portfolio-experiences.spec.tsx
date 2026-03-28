import React from "react";
import { render, screen } from "@testing-library/react";
import Experiences, {
  mockExperienceBranches,
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

    for (const branch of mockExperienceBranches) {
      expect(screen.getAllByText(branch.title).length).toBeGreaterThan(0);
    }
  });

  it("renders all mock roles", () => {
    render(<Experiences />);

    const roleTitles = mockExperienceBranches.flatMap((branch) =>
      branch.roles.map((role) => role.title)
    );

    for (const title of roleTitles) {
      expect(screen.getByText(title)).toBeInTheDocument();
    }
  });

  it("shows the branch and experience counts in the overview", () => {
    render(<Experiences />);

    const totalRoles = mockExperienceBranches.reduce(
      (count, branch) => count + branch.roles.length,
      0
    );

    expect(
      screen.getByText(`${mockExperienceBranches.length} branches`)
    ).toBeInTheDocument();
    expect(screen.getByText(`${totalRoles} experiences`)).toBeInTheDocument();
  });
});
