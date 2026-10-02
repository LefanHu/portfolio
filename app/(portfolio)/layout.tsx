import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { config } from "@fortawesome/fontawesome-svg-core";
import { createTheme, MantineProvider } from "@mantine/core";

config.autoAddCss = false;


export const metadata: Metadata = {
  title: "Lefan's Website",
  description:
    "Lefan Hu, University of Waterloo Computer Engineering student. Explore projects and experience in AI, robotics, cloud infrastructure, and FPGA acceleration.",
};

const theme = createTheme({});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex flex-col h-screen box-border">
        <Navbar />
        <MantineProvider theme={theme} defaultColorScheme="dark">
          {children}
        </MantineProvider>
      </div>
    </>
  );
}
