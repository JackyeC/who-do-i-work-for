import { TopBar } from "./TopBar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <TopBar />
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
