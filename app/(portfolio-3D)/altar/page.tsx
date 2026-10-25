import type { Metadata } from "next";
import AltarEntry from "@/components/altar/AltarEntry";

export const metadata: Metadata = {
  title: "Lefan's Altar",
};

export default function AltarPage() {
  return <AltarEntry />;
}
