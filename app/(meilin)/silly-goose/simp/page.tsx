import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "easter egg --> lefan.ca/silly-goose",
  description: "easter egg link",
};

export default function Simp() {
  return (
    <div className="text-black">
      with a lot of time and effort... PS. there&apos;s an easter egg somewhere
      <div className="text-white">
        HINT: maybe there&apos;s a part of the link you never visted?
      </div>
    </div>
  );
}
