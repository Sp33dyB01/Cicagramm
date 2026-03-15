import { useQuery } from "@tanstack/react-query";
import type { SelectTelepules } from "../../worker/schema";

export function usePostal(irsz: string) {
    const { data: cities = [], isLoading: loadingCities } = useQuery({
        queryKey: ['postal', irsz],
        queryFn: async () => {
            if (!irsz || String(irsz).length !== 4) return [];
            const res = await fetch(`/api/varos/irsz/${irsz}`);
            if (!res.ok) throw new Error("Failed to fetch cities");
            return res.json() as Promise<SelectTelepules[]>;
        },
        enabled: !!irsz && String(irsz).length === 4,
    });

    return { cities, loadingCities };
}
