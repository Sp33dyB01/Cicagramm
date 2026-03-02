import { useState, useEffect } from "react";
import type { SelectTelepules } from "../../worker/schema";

export function usePostal(irsz: string) {
    const [cities, setCities] = useState<SelectTelepules[]>([]);
    const [loadingCities, setLoadingCities] = useState<boolean>(false);

    useEffect(() => {
        if (irsz && String(irsz).length === 4) {
            const fetchCities = async () => {
                setLoadingCities(true);
                try {
                    const res = await fetch(`/api/varos/irsz/${irsz}`);
                    if (res.ok) {
                        const data: SelectTelepules[] = await res.json();
                        setCities(data);
                    }
                } catch (err) {
                    console.error("Failed to fetch cities", err);
                } finally {
                    setLoadingCities(false);
                }
            };

            fetchCities();
        } else {
            setCities([]);
        }
    }, [irsz]);

    return { cities, loadingCities, setCities };
}
