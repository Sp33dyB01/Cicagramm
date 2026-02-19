// Login.tsx
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom"; // 1. Importáljuk a navigációt
import { authClient } from "./auth-client";
import retryOperation from "./assets/utils/Retry";
import { useToast } from "./Toast";

interface LoginProps {
  onLogin: (user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { showToast } = useToast();
  // 2. Inicializáljuk a navigációt
  const navigate = useNavigate();
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      showToast("Hiányzik az e-mail vagy a jelszó!", 'error')
      return;
    }

    try {
      const { data, error } = await retryOperation(() =>
        authClient.signIn.email({
          email,
          password,
        }));

      if (error) {
        setError(error.message || "Hiba a bejelentkezés során.");
      } else {
        console.log("Sikeres bejelentkezés", data);
        onLogin(data?.user);
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
          <br /><br />
          <button className="w-full py-2 bg-blue-500 text-white rounded font-semibold">
            Bejelentkezés
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Nincs fiókod?{" "}
          <span
            className="text-blue-500 cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Regisztrálj!
          </span>
        </p>
      </div>
    </div>
  );
}