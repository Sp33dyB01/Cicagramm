import { Outlet } from "react-router-dom";
import TopBar from "./Topbar";
export default function Layout({ user, onLogout }) {
  return (
    <div className="flex flex-col min-h-screen w-full bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 transition-colors pt-[70px]">
      <TopBar user={user} onLogout={onLogout} />
      <main className="flex-1 w-full flex flex-col relative">
        <Outlet />
      </main>
    </div>
  );
}