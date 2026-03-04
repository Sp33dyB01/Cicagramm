import { Outlet } from "react-router-dom";
import TopBar from "./Topbar";
export default function Layout({ user, onLogout }) {
  return (
    <div className="flex flex-col min-h-screen w-full bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 transition-colors pt-[70px]">
      <TopBar user={user} onLogout={onLogout} />
      <main className="flex-1 w-full flex flex-col relative">
        <Outlet />
      </main>
      <footer className="mt-auto bg-neutral-900 text-neutral-100 py-10 px-5 border-t-4 border-black flex justify-center">
        <div className="flex flex-col items-center gap-3 max-w-3xl text-center">
          <h3 className="m-0 text-2xl tracking-wide font-bold">Cicagramm</h3>
          <p className="m-0 text-neutral-400 text-sm">Találd meg a tökéletes doromboló társat!</p>
          <p className="mt-5 text-xs text-neutral-500">
            &copy; {new Date().getFullYear()} Cicagramm. Minden jog fenntartva.
          </p>
        </div>
      </footer>
    </div>
  );
}