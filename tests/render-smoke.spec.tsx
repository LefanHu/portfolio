import React from "react";
import { render, screen } from "@testing-library/react";
import RootLayout from "@/app/layout";
import ContactForm from "@/components/ContactForm";
import Navbar from "@/components/Navbar";
import NotFoundPage from "@/app/(portfolio)/not-found";

describe("render smoke", () => {
  it("renders the root layout wrapper", () => {
    render(
      <RootLayout>
        <div>content</div>
      </RootLayout>
    );

    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("renders the navbar", () => {
    render(<Navbar />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Three.js")).toBeInTheDocument();
  });

  it("renders the contact section", () => {
    render(<ContactForm />);

    expect(screen.getByText("Contact Me")).toBeInTheDocument();
    expect(screen.getByText("lefanhu1@gmail.com")).toBeInTheDocument();
  });

  it("renders the not-found page", () => {
    render(<NotFoundPage />);

    expect(
      screen.getByText("Page is not found / Page is incomplete")
    ).toBeInTheDocument();
  });
});
