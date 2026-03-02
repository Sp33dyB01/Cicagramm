import { useState, useEffect } from "react";
import type { SelectTelepules } from "../../worker/schema";

export function useCities(varos: string) {
    const [postals, setPostals] = useState<SelectTelepules[]>([]);
    const [loadingPostal, setLoadingPostal] = useState<boolean>(false);
    const [debouncedValue, setDebouncedValue] = useState<string>('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(varos);
        }, 500);
        return () => clearTimeout(handler);
    }, [varos]);

    useEffect(() => {
        if (debouncedValue) {
            const fetchPostal = async () => {
                setLoadingPostal(true);
                try {
                    const res = await fetch(`/api/varos/nev/${debouncedValue}`);
                    if (res.ok) {
                        const data: SelectTelepules[] = await res.json();
                        setPostals(data);
                    }
                } catch (err) {
                    console.error("Failed to fetch postal codes", err);
                } finally {
                    setLoadingPostal(false);
                }
            };
            fetchPostal();
        } else {
            setPostals([]);
        }
    }, [debouncedValue]);

    return { postals, loadingPostal, setPostals };
}
