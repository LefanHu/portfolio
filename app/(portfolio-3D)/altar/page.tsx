import type { Metadata } from "next";
import AltarEntry from "@/components/altar/AltarEntry";

export const metadata: Metadata = {
  title: "3D altar",
  description:
    "The 3D version of Lefan Hu's portfolio: a floating island with an altar. Combine items in its cauldron to open his projects, experience, coding stats and contact details.",
};

export default function AltarPage() {
  return <AltarEntry />;
}
