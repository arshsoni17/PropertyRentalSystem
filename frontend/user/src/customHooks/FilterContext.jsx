import { createContext, useContext } from "react";

import useFilters from "./useFilters";

const FilterContext = createContext(null);

export function FilterProvider({ children }) {
    const filterState = useFilters();
    return (
        <FilterContext.Provider value={filterState}>
            {children}
        </FilterContext.Provider>
    );
}

export function useFilterContext() {
    return useContext(FilterContext);
}


////wrap routes with FilterProvider