import { useState } from "react";

const initial = {
    maxGuests: "",
    minPrice: "",
    maxPrice: "",
    minRating: "",
    checkIn: "",
    checkOut: "",
};

export default function useFilters() {
    const [filters, setFilters] = useState(initial);         // live input state
    const [appliedFilters, setAppliedFilters] = useState(initial); // only updates on Apply

    const updateFilter = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        setAppliedFilters({ ...filters }); // 👈 only fires fetch when Apply is clicked
    };

    const resetFilters = () => {
        setFilters(initial);
        setAppliedFilters(initial);        // 👈 reset both
    };

    return { filters, appliedFilters, updateFilter, applyFilters, resetFilters };
}