import { useState } from "react";
import { loginUser } from "./auth";

export default function Login({ onLogin, onSwitch }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

const handleSubmit = (e) => {
  e.preventDefault();

  if (!email.trim() || !username.trim() || !password.trim()) {
    setError("Hiányzik az e-mail, felhasználónév vagy jelszó!");
    return;
  }

  const user = loginUser(username, password);

  if (!user) {
    setError("Rossz E-mail, felhasználónév vagy jelszó!");
  } else {
    onLogin();
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white border rounded-lg p-6">
        <h1 className="text-4xl text-center mb-6 font-[cursive]">
          Cicagramm
        </h1>

        {error && (
          <p className="text-sm text-red-500 text-center mb-3">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full px-3 py-2 border rounded bg-gray-50"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="w-full px-3 py-2 border rounded bg-gray-50"
            placeholder="Felhasználónév"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            className="w-full px-3 py-2 border rounded bg-gray-50"
            placeholder="Jelszó"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br/>
          <br/>
          <button className="w-full py-2 bg-blue-500 text-white rounded font-semibold">
            Bejelentkezés
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Nincs fiókod?{" "}
          <span
            className="text-blue-500 cursor-pointer"
            onClick={onSwitch}
          >
            Regisztrálj!
          </span>
        </p>
      </div>
    </div>
  );
}
