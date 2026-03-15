import { useQuery } from "@tanstack/react-query";
import type { SelectFajta } from "../../worker/schema"

export function useFajtak() {
    const { data: fajtak = [] } = useQuery({
        queryKey: ['fajtak'],
        queryFn: async () => {
            const res = await fetch('/api/fajta');
            if (!res.ok) throw new Error("Hiba a fajták lekérésekor");
            return res.json() as Promise<SelectFajta[]>;
        },
    });

    return fajtak;
}
