import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useEffect } from "react";
import { getDistance } from "../../worker/tavolsag";
import type { SelectFelhasznalo, SelectCica } from "../../worker/schema"
import type { filters } from "./useFilters"
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
const fetchCats = async ({ queryKey }: { queryKey: any }) => {
    const [_key, params] = queryKey;
    const { currentPage, sort, userLat, userLon, ipLat, ipLon, appliedFilters, display } = params;

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
    fetchUrl.searchParams.set("display", display);

    if (appliedFilters.fajId) fetchUrl.searchParams.set("fajId", appliedFilters.fajId);
    if (appliedFilters.minKor > 0) fetchUrl.searchParams.set("minKor", String(appliedFilters.minKor));
    if (appliedFilters.maxKor < 20) fetchUrl.searchParams.set("maxKor", String(appliedFilters.maxKor));
    if (appliedFilters.ivartalanitott !== "") fetchUrl.searchParams.set("ivartalanitott", appliedFilters.ivartalanitott);
    if (appliedFilters.nem !== "") fetchUrl.searchParams.set("nem", appliedFilters.nem);

    if (userLat && userLon) {
        fetchUrl.searchParams.set("lat", String(userLat));
        fetchUrl.searchParams.set("lon", String(userLon));
    } else if (ipLat && ipLon) {
        fetchUrl.searchParams.set("lat", String(ipLat));
        fetchUrl.searchParams.set("lon", String(ipLon));
    }

    const res = await fetch(fetchUrl.toString());
    if (!res.ok) {
        throw new Error("Hiba a macskák betöltésekor");
    }
    return res.json();
};

export function useCats({ currentPage, sort, user, ipCoords, appliedFilters, showToast }: { currentPage: number, sort: string, user: SelectFelhasznalo, ipCoords: { lat: number, lon: number, displayName: string } | null, appliedFilters: filters, showToast?: ToastContextType }) {
    const query = useQuery({
        queryKey: [
            "cats",
            {
                currentPage,
                sort,
                appliedFilters,
                userLat: user?.lat,
                userLon: user?.lon,
                ipLat: ipCoords?.lat,
                ipLon: ipCoords?.lon,
                display: window.innerWidth >= 768 ? "1" : "0"
            }
        ],
        queryFn: fetchCats,
        placeholderData: keepPreviousData,
        select: (data: any) => {
            const rawCats = data?.data || (Array.isArray(data) ? data : []);
            const totalPages = data?.totalPages || 1;

            const catsWithDistance = rawCats.map((cat: ExtendedCica) => {
                const catCoords = { lat: parseFloat(String(cat.ownerLat)), lon: parseFloat(String(cat.ownerLon)), displayName: cat.ownerCity };
                let dist = null;

                if (user?.lat && user?.lon) {
                    dist = getDistance({ lat: user.lat, lon: user.lon, displayName: user.varos }, catCoords);
                } else if (ipCoords?.lat && ipCoords?.lon) {
                    dist = getDistance(ipCoords, catCoords);
                }

                return {
                    ...cat,
                    calculatedDistance: dist !== null ? Math.round(dist * 10) / 10 : null
                };
            });

            return { catsWithDistance, totalPages };
        }
    });

    useEffect(() => {
        if (query.isError && showToast) {
            showToast.showToast("Hiba a macskák betöltésekor", "error");
            console.error("Hiba:", query.error);
        }
    }, [query.isError, query.error, showToast]);

    return { 
        catsWithDistance: query.data?.catsWithDistance || [], 
        loading: query.isLoading || query.isFetching, 
        totalPages: query.data?.totalPages || 1 
    };
}