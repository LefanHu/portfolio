import Navbar from "@/components/Navbar";
import { MantineProvider } from "@mantine/core";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="flex flex-col h-screen box-border">
        <Navbar />
        <MantineProvider defaultColorScheme="dark">
          {children}
        </MantineProvider>
      </div>
    </>
  );
}
