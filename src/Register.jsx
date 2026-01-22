import { useState } from "react";
import { registerUser } from "./auth";

export default function Register({ onSuccess, onSwitch }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const success = registerUser(username, password);
    if (!success) {
      setError("Username already exists");
    } else {
      onSuccess();
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
            Regisztráció
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Van már fiókod?{" "}
          <span
            className="text-blue-500 cursor-pointer"
            onClick={onSwitch}
          >
            Jelentkezz be!
          </span>
        </p>
      </div>
    </div>
  );
}
