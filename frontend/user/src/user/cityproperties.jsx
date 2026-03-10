import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Heart, ChevronLeft, ChevronRight, Star } from "lucide-react";
import Header from "../header";
import Footer from "../footer";
import Nav from "../nav";
// import useFilters from "../customHooks/useFilters";

import { useFilterContext } from "../customHooks/FilterContext";

const openNewTab = (propertyId) => {
    window.open(`${window.location.origin}/property/book/${propertyId}`, '_blank');
};

const PropertyCard = ({ property }) => {
    const [isFavorite, setIsFavorite] = useState(false);

    // ✅ no more fetchRating — comes from backend now
    const avgRating = property.avg_rating ? parseFloat(property.avg_rating) : null;
    const totalReviews = property.total_reviews || 0;

    const getImageUrl = (imagePath) => {
        if (!imagePath) return 'https://via.placeholder.com/400x300?text=No+Image';
        const cleanPath = imagePath.replace(/\\/g, '/');
        return `http://localhost:3000/${cleanPath}`;
    };

    return (
        <div className="group cursor-pointer" onClick={() => openNewTab(property.id)}>
            <div className="relative aspect-4/3 rounded-xl overflow-hidden mb-3">
                <img
                    src={getImageUrl(property.image_path)}
                    alt={property.title}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                    {totalReviews > 0 ? "Guest fav.." : "New"}
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }}
                    className="absolute top-3 right-3 p-2 hover:scale-110 transition-transform"
                >
                    {/* <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500 stroke-red-500' : 'fill-black/20 stroke-white'}`} /> */}
                </button>
            </div>

            <div>
                <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate flex-1">
                        {property.title} in {property.city}
                    </h3>
                    <div className="flex items-center gap-1 ml-2">
                        {totalReviews > 0 ? (
                            <div className="flex items-center gap-1">
                                <Star size={15} className={avgRating >= 3.5 ? "fill-green-500 stroke-green-500" : "fill-red-500 stroke-red-500"} />
                                <span className="text-sm font-medium">{Number(avgRating).toFixed(1)}</span>
                            </div>
                        ) : (
                            <span className="text-xs text-gray-500">No ratings yet</span>
                        )}
                    </div>
                </div>
                <p className="text-gray-600 text-sm mb-1 line-clamp-1">{property.description}</p>
                <p className="text-gray-600 text-sm mb-2">Up to {property.max_guests} guests</p>
                <p className="text-gray-900">
                    <span className="font-semibold">₹{property.price_per_night.toLocaleString('en-IN')}</span>
                    <span className="text-gray-600 text-sm"> night</span>
                </p>
            </div>
        </div>
    );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-2 mt-12">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg border ${currentPage === 1 ? 'border-gray-200 text-gray-300' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            {getPageNumbers().map((page, index) => (
                <button
                    key={index}
                    onClick={() => typeof page === 'number' && onPageChange(page)}
                    disabled={page === '...'}
                    className={`min-w-10 h-10 px-3 rounded-lg ${page === currentPage ? 'bg-gray-900 text-white'
                        : page === '...' ? 'text-gray-400'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                >
                    {page}
                </button>
            ))}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg border ${currentPage === totalPages ? 'border-gray-200 text-gray-300' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
};

function CityProperties() {
    const { cityName } = useParams();
    const { filters, appliedFilters, updateFilter, applyFilters, resetFilters } = useFilterContext();


    const [properties, setProperties] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProperties, setTotalProperties] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCityProperties = async (page = 1) => {
        try {
            setLoading(true);

            const params = new URLSearchParams();
            params.append("page", page);
            params.append("limit", 20);
            if (appliedFilters.maxGuests) params.append("maxGuests", appliedFilters.maxGuests);
            if (appliedFilters.minPrice) params.append("minPrice", appliedFilters.minPrice);
            if (appliedFilters.maxPrice) params.append("maxPrice", appliedFilters.maxPrice);
            if (appliedFilters.minRating) params.append("minRating", appliedFilters.minRating);
            if (appliedFilters.checkIn) params.append("checkIn", appliedFilters.checkIn);
            if (appliedFilters.checkOut) params.append("checkOut", appliedFilters.checkOut);
            const response = await fetch(
                `http://localhost:3000/home/city/${cityName}?${params.toString()}`
            );
            const data = await response.json();

            if (data.success) {
                setProperties(data.properties);
                setCurrentPage(data.current_page);
                setTotalPages(data.total_pages);
                setTotalProperties(data.total_properties);
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [appliedFilters]);

    useEffect(() => {
        fetchCityProperties(currentPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [cityName, currentPage, appliedFilters]);

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-white">
            <Header />
            <Nav
                filters={filters}
                appliedFilters={appliedFilters}
                updateFilter={updateFilter}
                applyFilters={applyFilters}
                resetFilters={resetFilters}
            />
            <main className="w-4/5 mx-auto px-6 lg:px-20 py-8">
                <h1 className="text-3xl font-bold mb-2">Properties in {cityName}</h1>
                <p className="text-gray-500 text-sm mb-6">{totalProperties} properties found</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {properties.map((property) => (
                        <PropertyCard key={property.id} property={property} />
                    ))}
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </main>
            <Footer />
        </div>
    );
}

export default CityProperties;