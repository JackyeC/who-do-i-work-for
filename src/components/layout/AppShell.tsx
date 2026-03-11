import { TopBar } from "./TopBar";
import { ContextSidebar } from "./ContextSidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <TopBar />
      <div className="flex-1 flex min-w-0">
        <ContextSidebar />
        <main className="flex-1 overflow-y-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
