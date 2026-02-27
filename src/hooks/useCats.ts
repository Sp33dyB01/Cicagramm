import { useState, useEffect, useMemo } from "react";
import { getDistance } from "../../worker/tavolsag";
import type { SelectFelhasznalo, SelectCica } from "../../worker/schema";
import type { filters } from "./useFilters";
import type { ToastContextType } from "../Toast";
import { useToast } from "../Toast"

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
    const [cats, setCats] = useState<ExtendedCica[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const { showToast } = useToast();

    useEffect(() => {
        setLoading(true);
        let apiSort = "1N";
        if (sort === "name") apiSort = "1N";
        if (sort === "age") apiSort = "3N";
        if (sort === "distance") apiSort = "2N";

        const fetchUrl = new URL(window.location.origin + "/api/cica");
        fetchUrl.searchParams.set("page", String(currentPage));
        fetchUrl.searchParams.set("sort", apiSort);

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

        fetch(fetchUrl.toString())
            .then((res) => res.json())
            .then((data) => {
                console.log("Fetched cats:", data);
                if (data.data) {
                    setCats(data.data);
                    setTotalPages(data.totalPages || 1);
                } else {
                    setCats(Array.isArray(data) ? data : []);
                    setTotalPages(1);
                }
                setLoading(false);
            })
            .catch((err) => {
                if (showToastContext) showToast("Hiba a macskák betöltésekor", "error");
                console.error("Hiba:", err);
                setLoading(false);
            });
    }, [currentPage, sort, user, ipCoords, appliedFilters, showToast]);

    const catsWithDistance = useMemo(() => {
        return (cats || []).map(cat => {
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

    return { catsWithDistance, setCats, loading, totalPages };
}
