// Login.tsx
import { useState } from "react";
import { authClient } from "./auth-client";

export default function Login({ onLogin, onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Hiányzik az e-mail vagy a jelszó!");
      return;
    }

    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        // SUCCESS: We tell the parent component we are done
        onLogin(data); 
      }
    } catch (err) {
      setError("Váratlan hiba történt.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white border rounded-lg p-6">
        <h1 className="text-4xl text-center mb-6 font-[cursive]">Cicagramm</h1>
        
        {error && <p className="text-sm text-red-500 text-center mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input 
            className="w-full px-3 py-2 border rounded bg-gray-50"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input 
            type="password"
            className="w-full px-3 py-2 border rounded bg-gray-50"
            placeholder="Jelszó"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full py-2 bg-blue-500 text-white rounded font-semibold mt-4">
            Bejelentkezés
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Nincs fiókod?{" "}
          <span className="text-blue-500 cursor-pointer" onClick={onSwitch}>
            Regisztrálj!
          </span>
        </p>
      </div>
    </div>
  );
}