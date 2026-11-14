import React from "react";
import { render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import RootLayout from "@/app/layout";
import ContactForm from "@/components/ContactForm";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import NotFoundPage from "@/app/not-found";

describe("render smoke", () => {
  it("renders the root layout wrapper", () => {
    const markup = renderToStaticMarkup(
      <RootLayout>
        <div>content</div>
      </RootLayout>
    );

    expect(markup).toContain("content");
    expect(markup).toContain("font-sans");
  });

  it("renders the site header and footer", () => {
    render(
      <>
        <SiteHeader />
        <SiteFooter />
      </>
    );

    expect(screen.getAllByRole("link", { name: "Lefan Hu" })[0]).toHaveAttribute("href", "/");
    expect(screen.getAllByRole("link", { name: "Experience" })[0]).toHaveAttribute("href", "/#experience");
    expect(screen.getByRole("link", { name: "All projects" })).toHaveAttribute("href", "/project-gallery");
  });

  it("renders the contact section", () => {
    const { container } = render(<ContactForm />);

    expect(container.querySelector("#contact")).not.toBeNull();
    expect(screen.getAllByText("l2hu@uwaterloo.ca").length).toBeGreaterThan(0);
  });

  it("renders the not-found page with ways back into the site", () => {
    render(<NotFoundPage />);

    expect(screen.getByRole("heading", { level: 1, name: "This page isn't here" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to the home page" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Browse all projects" })).toHaveAttribute("href", "/project-gallery");
  });
});
