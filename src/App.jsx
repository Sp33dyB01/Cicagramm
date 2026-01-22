import { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import MainApp from "./MainApp";

export default function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [screen, setScreen] = useState("login");

  if (isAuth) return <MainApp />;

  return screen === "login" ? (
    <Login
      onLogin={() => setIsAuth(true)}
      onSwitch={() => setScreen("register")}
    />
  ) : (
    <Register
      onSuccess={() => setScreen("login")}
      onSwitch={() => setScreen("login")}
    />
  );
}
