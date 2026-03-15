import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { SelectTelepules } from "../../worker/schema";

export function useCities(varos: string) {
    const [debouncedValue, setDebouncedValue] = useState<string>('');

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(varos);
        }, 500);
        return () => clearTimeout(handler);
    }, [varos]);

    const { data: postals = [], isLoading: loadingPostal } = useQuery({
        queryKey: ['cities', debouncedValue],
        queryFn: async () => {
            if (!debouncedValue) return [];
            const res = await fetch(`/api/varos/nev/${debouncedValue}`);
            if (!res.ok) throw new Error("Failed to fetch cities");
            return res.json() as Promise<SelectTelepules[]>;
        },
        enabled: !!debouncedValue,
    });

    return { postals, loadingPostal };
}
