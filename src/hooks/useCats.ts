import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDistance } from "../../worker/tavolsag";
import type { SelectFelhasznalo, SelectCica } from "../../worker/schema";
import type { filters } from "./useFilters";
import type { ToastContextType } from "../Toast";

export type ExtendedCica = SelectCica & {
    ownerLat: number;
    ownerLon: number;
    ownerNev: string;
    ownerIrsz: number;
    ownerCity: string;
    ownerPFP: string;
    calculatedDistance: number;
    isLiked?: boolean;
};

export function useCats({ currentPage, sort, user, ipCoords, appliedFilters, showToastContext }: { currentPage: number, sort: string, user: SelectFelhasznalo, ipCoords: { lat: number, lon: number, displayName: string } | null, appliedFilters: filters, showToastContext: ToastContextType }) {

    const fetchCats = async () => {
        let apiSort = "1N";
        if (sort === "name_asc") apiSort = "1N";
        if (sort === "name_desc") apiSort = "1I";
        if (sort === "age_asc") apiSort = "3N";
        if (sort === "age_desc") apiSort = "3I";
        if (sort === "distance_asc") apiSort = "2N";
        if (sort === "distance_desc") apiSort = "2I";

        const fetchUrl = new URL(window.location.origin + "/api/cica");
        fetchUrl.searchParams.set("page", String(currentPage));
        fetchUrl.searchParams.set("sort", apiSort);
        fetchUrl.searchParams.set("display", window.innerWidth >= 768 ? "1" : "0");

        if (appliedFilters.fajId) fetchUrl.searchParams.set("fajId", appliedFilters.fajId);
        if (appliedFilters.minKor > 0) fetchUrl.searchParams.set("minKor", String(appliedFilters.minKor));
        if (appliedFilters.maxKor < 20) fetchUrl.searchParams.set("maxKor", String(appliedFilters.maxKor));
        if (appliedFilters.ivartalanitott !== "") fetchUrl.searchParams.set("ivartalanitott", appliedFilters.ivartalanitott);
        if (appliedFilters.nem !== "") fetchUrl.searchParams.set("nem", appliedFilters.nem);

        if (user) {
            if (user.lat && user.lon) {
                fetchUrl.searchParams.set("lat", String(user.lat));
                fetchUrl.searchParams.set("lon", String(user.lon));
            }
        } else if (ipCoords && ipCoords.lat && ipCoords.lon) {
            fetchUrl.searchParams.set("lat", String(ipCoords.lat));
            fetchUrl.searchParams.set("lon", String(ipCoords.lon));
        }

        const res = await fetch(fetchUrl.toString());
        if (!res.ok) {
            throw new Error("Hálózati hiba a macskák betöltésekor");
        }
        return res.json();
    };

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['cats', currentPage, sort, appliedFilters, user?.lat, user?.lon, ipCoords?.lat, ipCoords?.lon],
        queryFn: fetchCats,
    });

    if (isError) {
        if (showToastContext) showToastContext.showToast("Hiba a macskák betöltésekor", "error");
        console.error("Hiba:", error);
    }

    const cats = data?.data || (Array.isArray(data) ? data : []);
    const totalPages = data?.totalPages || 1;

    const catsWithDistance = useMemo(() => {
        return (cats || []).map((cat: any) => {
            const catLat = parseFloat(String(cat.ownerLat));
            const catLon = parseFloat(String(cat.ownerLon));

            let dist = null;
            const catCoords = { lat: catLat, lon: catLon, displayName: cat.ownerCity };
            if (user) {
                const userCoords = { lat: user.lat, lon: user.lon, displayName: user.varos };
                dist = getDistance(userCoords, catCoords);
            } else if (ipCoords && ipCoords.lat && ipCoords.lon) {
                dist = getDistance(ipCoords, catCoords);
            }
            return {
                ...cat,
                calculatedDistance: dist !== null ? Math.round(dist * 10) / 10 : null
            };
        });
    }, [cats, user, ipCoords]);

    return { catsWithDistance, loading: isLoading, totalPages };
}
