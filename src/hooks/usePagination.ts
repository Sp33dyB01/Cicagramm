import { useState } from "react";

export function usePagination(initialPage = 1) {
    const [currentPage, setCurrentPage] = useState(() => {
        const params = new URLSearchParams(window.location.search);
        return parseInt(String(params.get("page") || initialPage));
    });

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        const url = new URL(window.location.href);
        url.searchParams.set("page", String(newPage));
        window.history.pushState({}, "", url);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return { currentPage, setCurrentPage, handlePageChange };
}
