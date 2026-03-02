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
        showToast(error.message || "Hiba a bejelentkezés során.", "error");
      } else {
        showToast("Sikeres bejelentkezés!", "success");
        onLogin(data?.user);
      }
    } catch (err) {
      showToast("Váratlan hiba történt.", "error");
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 px-4 py-8 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl text-center mb-8 font-[cursive] text-rose-600 dark:text-rose-500 drop-shadow-sm">
          Cicagramm
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              className="peer w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-shadow invalid:border-rose-500 focus:invalid:border-rose-500 focus:invalid:ring-rose-500"
              placeholder="E-mail"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="mt-1 text-xs text-rose-500 hidden peer-invalid:block">Kérjük, adjon meg egy érvényes e-mail címet!</p>
          </div>
          <div>
            <input
              type="password"
              className="peer w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-neutral-50 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-shadow invalid:border-rose-500 focus:invalid:border-rose-500 focus:invalid:ring-rose-500"
              placeholder="Jelszó"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="mt-1 text-xs text-rose-500 hidden peer-invalid:block">A jelszó megadása kötelező!</p>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all shadow-md active:scale-[0.98] hover:shadow-lg"
            >
              Bejelentkezés
            </button>
          </div>
        </form>

        <p className="text-sm text-center mt-6 text-neutral-600 dark:text-neutral-400">
          Nincs fiókod?{" "}
          <span
            className="text-rose-600 dark:text-rose-500 font-semibold cursor-pointer hover:text-rose-700 dark:hover:text-rose-400 transition-colors"
            onClick={() => navigate("/register")}
          >
            Regisztrálj!
          </span>
        </p>
      </div>
    </div>
  );
}