import Header from "../header";
import Footer from "../footer";
import { useState, useEffect } from "react";
import { Heart, Star } from "lucide-react";
import Nav from "../nav";
import { useNavigate } from "react-router";

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
                            <span className="text-sm text-gray-400">No ratings yet!</span>
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

const PropertySection = ({ section, onSeeAll }) => {
    return (
        <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                    {section.section_title}
                    <button onClick={() => onSeeAll(section.city)} className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1">
                        <span className="text-sm font-medium">See all</span>
                        <span className="text-lg">→</span>
                    </button>
                </h2>
            </div>
            <div className="relative">
                <div className="overflow-x-auto pb-4 scrollbar-hide">
                    <div className="flex gap-5" style={{ width: 'max-content' }}>
                        {section.properties.map((property) => (
                            <div key={property.id} className="w-70 shrink-0">
                                <PropertyCard property={property} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

function Home() {
    const navigate = useNavigate();
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { filters, appliedFilters, updateFilter, applyFilters, resetFilters } = useFilterContext();

    const fetchProperties = async () => {
        try {
            setLoading(true);

            const params = new URLSearchParams();
            if (appliedFilters.maxGuests) params.append("maxGuests", appliedFilters.maxGuests);
            if (appliedFilters.minPrice) params.append("minPrice", appliedFilters.minPrice);
            if (appliedFilters.maxPrice) params.append("maxPrice", appliedFilters.maxPrice);
            if (appliedFilters.minRating) params.append("minRating", appliedFilters.minRating);
            if (appliedFilters.checkIn) params.append("checkIn", appliedFilters.checkIn);
            if (appliedFilters.checkOut) params.append("checkOut", appliedFilters.checkOut);

            const response = await fetch(
                `http://localhost:3000/home/properties/by-cities?${params.toString()}`
            );
            if (!response.ok) throw new Error('Failed to fetch properties');

            const data = await response.json();
            if (data.success) setSections(data.sections);
            else throw new Error(data.message || 'Failed to load properties');

        } catch (err) {
            setError(err.message);
            console.error('Error fetching properties:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProperties();
    }, [appliedFilters]);

    const handleSeeAll = (cityName) => navigate(`/city/${cityName}`);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <p className="text-red-500 text-lg mb-4">{error}</p>
                    <button onClick={fetchProperties} className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            
            <Header />
            <Nav
                filters={filters}
                appliedFilters={appliedFilters}
                updateFilter={updateFilter}
                applyFilters={applyFilters}
                resetFilters={resetFilters}
            />
            <main className="w-4/5 mx-auto px-6 lg:px-20 py-8 bg-white">
                {sections.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-lg">No properties available at the moment.</p>
                    </div>
                ) : (
                    sections.map((section, index) => (
                        <PropertySection key={index} section={section} onSeeAll={handleSeeAll} />
                    ))
                )}
            </main>
            <Footer />
        </div>
    );
}

export default Home;