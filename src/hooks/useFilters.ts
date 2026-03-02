import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export interface filters {
    fajId: string;
    minKor: number;
    maxKor: number;
    ivartalanitott: string;
    nem: string;
}

export function useFilters(setCurrentPage: (value: React.SetStateAction<number>) => void) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const initialAppliedFilters: filters = {
        fajId: searchParams.get("fajId") || "",
        minKor: Number(searchParams.get("minKor")) || 0,
        maxKor: searchParams.get("maxKor") ? Number(searchParams.get("maxKor")) : 20,
        ivartalanitott: searchParams.get("ivartalanitott") || "",
        nem: searchParams.get("nem") || ""
    };

    const [filters, setFilters] = useState<filters>(initialAppliedFilters);
    const [appliedFilters, setAppliedFilters] = useState<filters>(initialAppliedFilters);

    useEffect(() => {
        const updatedFilters: filters = {
            fajId: searchParams.get("fajId") || "",
            minKor: Number(searchParams.get("minKor")) || 0,
            maxKor: searchParams.get("maxKor") ? Number(searchParams.get("maxKor")) : 20,
            ivartalanitott: searchParams.get("ivartalanitott") || "",
            nem: searchParams.get("nem") || ""
        };
        setAppliedFilters(updatedFilters);
        setFilters(updatedFilters);
    }, [searchParams]);

    const handleApplyFilters = () => {
        const newParams = new URLSearchParams(searchParams);

        if (filters.fajId) newParams.set("fajId", filters.fajId); else newParams.delete("fajId");
        if (filters.minKor > 0) newParams.set("minKor", String(filters.minKor)); else newParams.delete("minKor");
        if (filters.maxKor < 20) newParams.set("maxKor", String(filters.maxKor)); else newParams.delete("maxKor");
        if (filters.ivartalanitott) newParams.set("ivartalanitott", filters.ivartalanitott); else newParams.delete("ivartalanitott");
        if (filters.nem) newParams.set("nem", filters.nem); else newParams.delete("nem");

        setSearchParams(newParams);

        if (setCurrentPage) setCurrentPage(1);
        setIsFilterOpen(false);
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => {
            const newFilters = { ...prev, [name]: value };
            if (name === "minKor" && parseInt(value) > parseInt(String(prev.maxKor))) {
                newFilters.maxKor = Number(value);
            }
            if (name === "maxKor" && parseInt(value) < parseInt(String(prev.minKor))) {
                newFilters.minKor = Number(value);
            }
            return newFilters;
        });
    };

    return {
        isFilterOpen,
        setIsFilterOpen,
        filters,
        appliedFilters,
        handleApplyFilters,
        handleFilterChange
    };
}
