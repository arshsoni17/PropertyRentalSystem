import { useState, useRef, useEffect } from "react";
import useSearch from "./customHooks/useSearch";
import { useFilterContext } from "./customHooks/FilterContext";

const openNewTab = (cityname) => {
    window.open(`${window.location.origin}/city/${cityname}`, '_blank');
};

const Nav = () => {
    const filterRef = useRef();
    const { filters, updateFilter, applyFilters, resetFilters } = useFilterContext();
    const { query, setQuery, results, loading } = useSearch("http://localhost:3000/search/cities");
    const [showFilter, setShowFilter] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showFilter && filterRef.current && !filterRef.current.contains(event.target)) {
                setShowFilter(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showFilter]);

    return (
        <div className="relative flex justify-center">
            <nav className="bg-white border-2 border-gray-200 sticky top-2 p-2 h-16 rounded-full w-2/5 m-3 z-10 opacity-60 hover:opacity-100 transition-opacity shadow-sm">
                <div className="flex justify-around items-center h-full gap-2 px-4">

                    {/* ✅ Search: relative wrapper so dropdown anchors correctly */}
                    <div className="relative grow max-w-[70%]">
                        <div className="flex items-center bg-gray-100 px-4 py-2 rounded-full group focus-within:bg-white focus-within:ring-2 focus-within:ring-amber-200 transition-all">
                            <svg className="w-5 h-5 text-gray-400 mr-2 group-focus-within:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by city..."
                                className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>

                        {/* ✅ Results now anchored below the search bar */}
                        {results.length > 0 && (
                            <ul className="absolute top-full mt-1 left-0 w-full bg-white shadow-lg rounded-xl z-20 border border-gray-100 overflow-hidden">
                                {results.map((city, index) => (
                                    <li
                                        key={index}
                                        onClick={() => openNewTab(city)}
                                        className="px-4 py-2 hover:bg-amber-50 cursor-pointer text-sm text-gray-700"
                                    >
                                        {city}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* ✅ Filter: dropdown is sibling to button, NOT inside it */}
                    <div ref={filterRef} className="relative">
                        <button
                            onClick={() => setShowFilter(!showFilter)}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                                showFilter ? 'bg-amber-300' : 'bg-amber-200 hover:bg-amber-300'
                            }`}
                        >
                            Filter
                        </button>

                        {/* ✅ Dropdown is outside button but inside filterRef — ref.contains() works */}
                        {showFilter && (
                            <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl p-5 z-30 w-80">
                                <h3 className="font-semibold text-gray-800 mb-4">Filters</h3>

                                <div className="mb-3">
                                    <label className="text-sm text-gray-600 mb-1 block">Min Guests</label>
                                    <input
                                        type="number" min="1"
                                        value={filters.maxGuests}
                                        onChange={(e) => updateFilter("maxGuests", e.target.value)}
                                        placeholder="e.g. 4"
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-200"
                                    />
                                </div>

                                <div className="flex gap-2 mb-3">
                                    <div className="flex-1">
                                        <label className="text-sm text-gray-600 mb-1 block">Min Price ₹</label>
                                        <input
                                            type="number"
                                            value={filters.minPrice}
                                            onChange={(e) => updateFilter("minPrice", e.target.value)}
                                            placeholder="1000"
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-200"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-sm text-gray-600 mb-1 block">Max Price ₹</label>
                                        <input
                                            type="number"
                                            value={filters.maxPrice}
                                            onChange={(e) => updateFilter("maxPrice", e.target.value)}
                                            placeholder="10000"
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-200"
                                        />
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <label className="text-sm text-gray-600 mb-1 block">Min Rating</label>
                                    <select
                                        value={filters.minRating}
                                        onChange={(e) => updateFilter("minRating", e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-200"
                                    >
                                        <option value="">Any</option>
                                        <option value="3">3+ </option>
                                        <option value="3.5">3.5+ </option>
                                        <option value="4">4+ </option>
                                        <option value="4.5">4.5+ </option>
                                    </select>
                                </div>

                                <div className="flex gap-2 mb-4">
                                    <div className="flex-1">
                                        <label className="text-sm text-gray-600 mb-1 block">Check In</label>
                                        <input
                                            type="date"
                                            value={filters.checkIn}
                                            onChange={(e) => updateFilter("checkIn", e.target.value)}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-200"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-sm text-gray-600 mb-1 block">Check Out</label>
                                        <input
                                            type="date"
                                            value={filters.checkOut}
                                            onChange={(e) => updateFilter("checkOut", e.target.value)}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-200"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={resetFilters}
                                        className="flex-1 border border-gray-300 rounded-lg py-2 text-sm hover:bg-gray-50 transition"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={() => { applyFilters(); setShowFilter(false); }}
                                        className="flex-1 bg-amber-200 hover:bg-amber-300 rounded-lg py-2 text-sm font-medium transition"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </nav>
        </div>
    );
};

export default Nav;