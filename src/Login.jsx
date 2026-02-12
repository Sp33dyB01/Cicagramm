import { useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. Importáljuk a navigációt
import { authClient } from "./auth-client";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  // 2. Inicializáljuk a navigációt
  const navigate = useNavigate();

  // Fájl feltöltés teszt (ezt meghagytam)
  const handleSubmit2 = async (e) => { 
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const response = await fetch("/api/cica/123test/upload", { 
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    console.log(result);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Töröljük az előző hibákat

    if (!email.trim() || !password.trim()) {
      setError("Hiányzik az e-mail vagy a jelszó!");
      return;
    }

    try {
      const { data, error } = await authClient.signIn.email({
        email: email,
        password: password,
      });

      if (error) {
        setError(error.message);
      } else {
        console.log("Sikeres bejelentkezés", data);
        
        // 3. FONTOS: Átadjuk a user adatokat az App.jsx-nek!
        // A better-auth válaszában általában data.user van
        onLogin(data.user); 
      }
    } catch (err) {
      setError("Váratlan hiba történt.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white border rounded-lg p-6">
        <h1 className="text-4xl text-center mb-6 font-[cursive]" style={{ textAlign: 'center' }}>
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
            type="password"
            className="w-full px-3 py-2 border rounded bg-gray-50"
            placeholder="Jelszó"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br/><br/>
          <button className="w-full py-2 bg-blue-500 text-white rounded font-semibold">
            Bejelentkezés
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Nincs fiókod?{" "}
          {/* 4. JAVÍTÁS: Nem onSwitch-et hívunk, hanem navigálunk a routerrel */}
          <span
            className="text-blue-500 cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Regisztrálj!
          </span>
        </p>

        {/* Fájl feltöltés teszt */}
        <form onSubmit={handleSubmit2} className="mt-4 border-t pt-4">
          <p className="text-xs text-gray-400 mb-2">Dev teszt feltöltés:</p>
          <input type="file" name="file" />
          <button className="text-xs bg-gray-200 px-2 py-1 rounded ml-2">Küld</button>
        </form>
      </div>
    </div>
  );
}