import { Outlet } from "react-router-dom";
import TopBar from "./Topbar";

export default function Layout({ user, onLogout }) {
  return (
    <div className="app-container">
      <TopBar user={user} onLogout={onLogout}/>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}