import { useState } from "react";
export interface filters {
    fajId: string;
    minKor: number;
    maxKor: number;
    ivartalanitott: string;
    nem: string;
}

export function useFilters(setCurrentPage: (value: React.SetStateAction<number>) => void) {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState<filters>({
        fajId: "",
        minKor: 0,
        maxKor: 20,
        ivartalanitott: "",
        nem: ""
    });
    const [appliedFilters, setAppliedFilters] = useState(filters);

    const handleApplyFilters = () => {
        setAppliedFilters(filters);
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
