import { TabBar, TopBar } from "@/components/shell/Navigation";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      {children}
      <TabBar />
    </>
  );
}
