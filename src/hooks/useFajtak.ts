import { useState, useEffect } from "react";
import type { SelectFajta } from "../../worker/schema"

export function useFajtak() {
    const [fajtak, setFajtak] = useState<SelectFajta[]>([]);

    useEffect(() => {
        fetch('/api/fajta')
            .then(res => res.json())
            .then(data => setFajtak(data))
            .catch(err => console.error("Hiba a fajták lekérésekor:", err));
    }, []);

    return fajtak;
}
