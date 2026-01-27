import { useState } from "react";
import { authClient } from "./auth-client";

export default function Register({ onSuccess, onSwitch }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); //ez arra van hogy ne legyen spammelve
  const [formData, setFormData] = useState({
    email: '',
    nev: '',
    jelszo: '',
    rBemutat: 'bemutat',
    irsz: '',
    utca: '',
    pKep: 'default.jpg'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!formData.email || !formData.jelszo || !formData.nev || !formData.irsz || !formData.utca) {
      setError("Kérlek tölts ki minden mezőt!"); //itt ezt jobban kéne megoldani de lusta vagyok szoval majd te
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await authClient.signUp.email({
        email: formData.email,
        password: formData.jelszo,
        name: formData.nev,
        image: "default.jpeg", // Default as per your requirement
        irsz: Number(formData.irsz), // Ensure this is a number
        utca: formData.utca,
      });

      if (error) {
        setError(error.message);
      } else {
        console.log("Registered user:", data);
        onSuccess(); // Move to login or dashboard
      }
    } catch (err) {
      setError("Hiba történt a regisztráció során.");
    } finally {
      setLoading(false);
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
            onChange={(e) => setFormData({... formData, email: e.target.value})}
          />

          <input
            className="w-full px-3 py-2 border rounded bg-gray-50"
            placeholder="Felhasználónév"
            onChange={(e) => setFormData({... formData, nev: e.target.value})}
          />

          <input
            type="password"
            className="w-full px-3 py-2 border rounded bg-gray-50"
            placeholder="Jelszó"
            onChange={(e) => setFormData({... formData, jelszo: e.target.value})}
          />

          <input
            className="w-full px-3 py-2 border rounded bg-gray-50"
            placeholder="Irányítószám"
            onChange={(e) => setFormData({... formData, irsz: e.target.value})}
          />
          <input
            className="w-full px-3 py-2 border rounded bg-gray-50"
            placeholder="Utca"
            onChange={(e) => setFormData({... formData, utca: e.target.value})}
          />
          <br/>
          <br/>
          <button 
            disabled={loading}
            className={`w-full py-2 text-white rounded font-semibold ${loading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'}`}
            
          >
            {loading ? "Folyamatban..." : "Regisztráció"}
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
