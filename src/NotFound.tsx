import { useNavigate } from "react-router-dom";
import { Cat } from "lucide-react";


export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="min-h-[calc(100vh-70px)] flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 px-4 transition-colors select-none">
            <Cat className="w-24 h-24 text-rose-400 dark:text-rose-500 mb-4" strokeWidth={1.5} />
            <h1 className="text-7xl font-bold text-rose-600 dark:text-rose-500 mb-2">404</h1>
            <p className="text-xl font-semibold mb-1">Az oldal nem található</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">
                A macska felborította a szervert. Ez az oldal nem létezik.
            </p>
            <button
                onClick={() => navigate("/")}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl shadow transition-all active:scale-[0.97] cursor-pointer"
            >
                Vissza a főoldalra
            </button>
        </div>
    );
}
