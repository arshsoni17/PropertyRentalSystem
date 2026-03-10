import { useNavigate, useParams } from "react-router";
import Footer from "../footer";
import Header from "../header";
import { useEffect, useState } from "react";
import Nav from "../nav";
import Calendar from "./calender";
import { IndianRupee, Star } from 'lucide-react';

function toLocalTime(joiningdate) {
    const date = new Date(joiningdate);
    return date.toLocaleDateString('en-IN');
}

const Book = () => {
    const { propertyId } = useParams();

    const [hostName, setHostName] = useState("");
    const [hostEmail, setHostEmail] = useState("");
    const [hostJoiningDate, setHostJoiningDate] = useState("");
    const [propertyTitle, setPropertyTitle] = useState("");
    const [propertyDescription, setPropertyDescription] = useState("");
    const [propertyCity, setPropertyCity] = useState("");
    const [pricePerNight, setPricePerNight] = useState("");
    const [maxGuests, setMaxGuests] = useState("");
    const [propertyRules, setPropertyRules] = useState("");
    const [propertyAddedOn, setPropertyAddedOn] = useState("");
    const [blockDates, setBlockedDates] = useState([]);
    const [propertyImages, setPropertyImages] = useState([]);
    const [isActive, setisActive] = useState(true);
    const [disabledDates, setDisabledDates] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [guests, setTotalGuests] = useState("1");
    const [resetKey, setResetKey] = useState(0);
    const [bookingId, setBookingId] = useState(null);
    const [reviews, setfetchreviews] = useState([]);

    const handleDateChange = ({ startDate, endDate }) => {
        if (startDate) {
            const localStart = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;
            setStartDate(localStart);
        } else { setStartDate(""); }
        if (endDate) {
            const localEnd = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
            setEndDate(localEnd);
        } else { setEndDate(""); }
    };

    const totalNights = startDate && endDate
        ? Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))
        : 0;
    const totalPrice = totalNights * pricePerNight;

    const fetchPropertyDetails = async () => {
        try {
            const response = await fetch(`http://localhost:3000/propertyDetail/${propertyId}`);
            const data = await response.json();
            if (response.status === 403) {
                alert(data.message || "This property is currently blocked or pending for approval.");
                setisActive(false);
                window.close(); 
                return;
            }
            if (response.ok) {
                setHostName(data.hostName);
                setHostEmail(data.host_email);
                setHostJoiningDate(toLocalTime(data.host_joiningdate));
                setPropertyTitle(data.pro_title);
                setPropertyDescription(data.pro_description);
                setPropertyCity(data.pro_city);
                setPricePerNight(data.pro_price_per_night);
                setMaxGuests(data.pro_maxguests);
                setPropertyRules(data.pro_rules);
                setPropertyAddedOn(toLocalTime(data.pro_addedon));
                setBlockedDates(data.blockedDates);
                setPropertyImages(data.imagesPaths);
                const disabled = data.blockedDates.map(item => {
                    const [y, m, d] = item.date.split("-").map(Number);
                    return new Date(y, m - 1, d);
                });
                setDisabledDates(disabled);
            }
        } catch (error) { console.log(error); }
    };

    const fetchBlockedDates = async () => {
        try {
            const response = await fetch(`http://localhost:3000/propertyDetail/${propertyId}`);
            const data = await response.json();
            if (response.ok) {
                setBlockedDates(data.blockedDates);
                const disabled = data.blockedDates.map(item => {
                    const [y, m, d] = item.date.split("-").map(Number);
                    return new Date(y, m - 1, d);
                });
                setDisabledDates(disabled);
                setResetKey(prev => prev + 1);
            }
        } catch (error) { console.log(error); }
    };

    const fetchPropertyReviews = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/reviews/fetch/${propertyId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'token': token },
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) { setfetchreviews(data.data); }
        } catch (error) { console.log(error); }
    };

    useEffect(() => {
        fetchPropertyDetails();
        fetchPropertyReviews();
        const interval = setInterval(fetchBlockedDates, 60000);
        return () => clearInterval(interval);
    }, [propertyId]);

    const handleBooking = async () => {
        try {
            const response = await fetch(`http://localhost:3000/auth/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'token': localStorage.getItem('token') },
                credentials: 'include',
                body: JSON.stringify({
                    propertyId,
                    startDate: startDate.split('T')[0],
                    endDate: endDate.split('T')[0],
                    guests: Number(guests)
                })
            });
            const data = await response.json();
            if (response.status === 403) return alert("This property is either blocked or pending for approval");
            if (response.ok) {
                alert("Booking Entry Created! Please Proceed for Payment");
                handleDateChange({ startDate: null, endDate: null });
                setTotalGuests("1");
                fetchBlockedDates();
                setBookingId(data.bookingId);
                window.open(`${window.location.origin}/payment/${data.bookingId}`, '_blank');
            } else {
                alert("SELECTED DATES ARE UNDER PROCESS, Try after 1 min");
                throw new Error(data.message);
            }
        } catch (error) { console.log(error); }
    };

    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewLoading, setReviewLoading] = useState(false);
    const [hoveredStar, setHoveredStar] = useState(0);
    const handleReviewSubmit = async () => {
        if (!reviewRating) return alert("Please select a rating.");
        if (!reviewComment.trim()) return alert("Please write a comment.");

        try {
            setReviewLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/reviews/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', token },
                body: JSON.stringify({
                    property_id: propertyId, // backend chh propertyId da variable name alg si, try to use make consistency
                    rating: reviewRating,
                    comment: reviewComment
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert("Review added!");
                setaddReview(false);
                setReviewRating(0);
                setReviewComment("");
                fetchPropertyReviews();
            } else {
                alert(data.message || "Failed to add review.");
            }
        } catch (err) {
            console.log(err);
        } finally {
            setReviewLoading(false);
        }
    };
    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
        : null;

    if (!isActive) {
        return (
            <div className="flex h-screen bg-black text-white justify-center items-center">
                <div>THIS PROPERTY IS EITHER BLOCKED OR PENDING FOR APPROVAL</div>
            </div>
        );
    }

    const [addReview, setaddReview] = useState(false);
    const cancelReviewAdd = () => { setaddReview(false) }

    const handleReviewAdd = async () => {
        // setaddReview(true);
        // now 1st create a api to fetch a detail that this user have booked this property or not that is CONFIRMED AND EXPIRED
        // if not then return a alert and change useState to false setaddReview(false);

        //if(ok) then just move to next step of making a react form and a post query
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:3000/reviews/search?propertyId=${propertyId}`, {
                method: 'GET',
                headers: { token }
            });
            const data = await res.json();

            if (!data.exists) {
                alert("You can only review a property you have booked.");
                return;
            }

            setaddReview(true);
        } catch (err) {
            console.log(err);
            alert("Something went wrong. Try again.");
        }
    }

    return (
        <>
            <Header /><Nav />

            <main className="w-4/5 mx-auto px-6 lg:px-20 py-8 bg-white">
                <h1 className="font-sans text-4xl font-medium tracking-tight text-slate-900">{propertyTitle}</h1>

                {/* Images */}
                <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-2 h-125 overflow-hidden rounded-3xl m-4">
                    {propertyImages.length > 0 && (
                        <>
                            <div className="md:col-span-2 md:row-span-2 relative group">
                                <img src={`http://localhost:3000/${propertyImages[0].image_path}`} className="w-full h-full object-cover cursor-pointer hover:brightness-90 transition" />
                            </div>
                            {propertyImages.slice(1, 4).map((img, index) => {
                                const isLast = index === 2;
                                const remainingCount = propertyImages.length - 4;
                                return (
                                    <div key={img.image_path} className="hidden md:block relative group">
                                        <img src={`http://localhost:3000/${img.image_path}`} className={`w-full h-full object-cover cursor-pointer hover:brightness-90 transition ${isLast && remainingCount > 0 ? 'brightness-50' : ''}`} />
                                        {isLast && remainingCount > 0 && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-white text-2xl font-bold">+{remainingCount} more</span>
                                            </div>
                                        )}
                                        {isLast && (
                                            <button className="opacity-95 absolute bottom-4 right-4 bg-white text-black p-2 rounded-4xl border border-black text-sm font-semibold flex items-center gap-2 shadow-md hover:bg-gray-100 transition">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                                                <span>Show all photos</span>
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                            {propertyImages.length < 4 && Array.from({ length: 4 - propertyImages.length }).map((_, i) => (
                                <div key={`empty-${i}`} className="hidden md:block relative bg-gray-100" />
                            ))}
                            <div className="hidden md:block relative group">
                                <img src={`http://localhost:3000/${propertyImages[0].image_path}`} className="w-full h-full object-cover cursor-pointer hover:brightness-90 transition" />
                                <button className="opacity-95 absolute bottom-4 right-4 bg-white text-black p-2 rounded-4xl border border-black text-sm font-semibold flex items-center gap-2 shadow-md hover:bg-gray-100 transition">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
                                    <span>Show all photos</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Host + Property */}
                <div className="flex justify-between">
                    <div className="border-t border-b border-gray-200 py-6 my-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-linear-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                {hostName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">Hosted by {hostName}</h3>
                                <p className="text-sm text-gray-600">Member since: {hostJoiningDate}</p>
                            </div>
                        </div>
                        <div className="mt-4 text-sm text-gray-500">
                            <span className="font-medium">Email:</span> {hostEmail}
                        </div>
                    </div>
                    <div className="border-t border-b border-gray-200 py-6 my-6">
                        <h3 className="text-xl font-semibold text-gray-900">Property Details:</h3>
                        <ol>
                            <li className="flex items-center gap-1 whitespace-nowrap">{propertyCity}</li>
                            <li className="flex items-center gap-1 whitespace-nowrap">Description: {propertyDescription}</li>
                            <li className="flex items-center gap-1 whitespace-nowrap">Price Per Night: <IndianRupee size={20} /> {pricePerNight}</li>
                            <li className="flex items-center gap-1 whitespace-nowrap">Max Guests: {maxGuests}</li>
                            <li className="flex items-center gap-1 whitespace-nowrap">Rules: {propertyRules}</li>
                        </ol>
                    </div>
                </div>

                {/* Calendar + Booking */}
                <div className="flex">
                    <Calendar
                        key={resetKey}
                        disabled={[{ before: new Date() }, ...disabledDates]}
                        onDateChange={handleDateChange}
                    />
                    <div className="w-80 min-w-xs ml-36 shadow-md rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 text-sm text-gray-700 text-center">
                            Access starts / ends: <span className="font-semibold">12:00 PM</span>
                        </div>
                        <div className="flex divide-x divide-gray-200">
                            <div className="flex-1 px-4 py-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Access-From</p>
                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    {startDate ? new Date(startDate).toLocaleDateString('en-IN') : "Select date in calender"}
                                </p>
                            </div>
                            <div className="flex-1 px-4 py-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">To</p>
                                <p className="mt-1 text-sm font-medium text-gray-900">
                                    {endDate ? new Date(endDate).toLocaleDateString('en-IN') : "Select date in calender"}
                                </p>
                            </div>
                        </div>
                        <div className="border-t border-gray-200 px-4 py-4 flex justify-between items-center">
                            <p className="text-sm text-gray-600">
                                {totalNights > 0 ? `${totalNights} night${totalNights > 1 ? 's' : ''}` : "Select dates"}
                            </p>
                            <div className="flex items-center gap-1 text-sm font-semibold text-gray-900">
                                <h1 className="text-sm text-gray-600">Total Price:</h1>
                                <IndianRupee size={15} />
                                {totalPrice > 0 ? totalPrice : "—"}
                            </div>
                        </div>
                        <div className="border-t border-gray-200 px-4 py-4 flex justify-between items-center">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Guests</p>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number" min={1} max={Number(maxGuests)} value={guests}
                                    onChange={(e) => setTotalGuests(e.target.value)}
                                    onBlur={(e) => {
                                        const val = Number(e.target.value);
                                        if (!val || val < 1) setTotalGuests("1");
                                        if (val > Number(maxGuests)) setTotalGuests(String(maxGuests));
                                    }}
                                    className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:border-gray-900"
                                />
                                <span className="text-xs text-gray-400">/ {maxGuests} max</span>
                            </div>
                        </div>
                        <div className="px-4 py-4 border-t border-gray-200">
                            <button
                                onClick={handleBooking}
                                disabled={!startDate || !endDate || !guests}
                                className="w-full bg-black text-white py-3 rounded-xl font-semibold text-sm hover:bg-gray-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                BOOK
                            </button>
                            <p className="text-center text-xs text-gray-400 mt-2">You won't be charged yet</p>
                        </div>
                    </div>
                </div>


                {/* ── REVIEW SECTION ── */}
                <div className="mt-12 border-t border-gray-200 pt-10">

                    {/* Heading */}
                    <div className="flex justify-between gap-2 mb-8">
                        <div className="flex items-center gap-2 mb-8">
                            <Star size={20} className={avgRating >= 3.5 ? "fill-green-400 stroke-green-400" : "fill-[#f30a0ac5] stroke-red-600"} />
                            <h2 className="text-xl font-semibold text-gray-900">
                                {avgRating
                                    ? `${avgRating} · ${reviews.length} review${reviews.length !== 1 ? 's' : ''}`
                                    : 'No reviews yet'
                                }
                            </h2></div>
                        <div>
                            <button onClick={handleReviewAdd} className="bg-green-600 p-2 rounded-2xl text-white font-semibold on hover:bg-green-400">Add Reviews</button>
                        </div>

                    </div>


                    {!addReview ? (<div>{reviews.length === 0 ? (
                        <p className="text-gray-500 text-sm">This place hasn't been reviewed yet.</p>
                    ) : (
                        // <div className="flex h-100 overflow-scroll">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                            {reviews.map((item) => (
                                <div key={item.id}>
                                    {/* Reviewer */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-full bg-red-200 flex items-center justify-center text-gray-700 font-semibold text-sm shrink-0">
                                            {item.userName?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 leading-tight">{item.userName}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {new Date(item.created_at).toLocaleDateString('en-IN', { day: "numeric", month: 'short', year: 'numeric', hour: "numeric", minute: "numeric" })}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Stars */}
                                    <div className="flex items-center gap-0.5 mb-2">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star
                                                key={s}
                                                size={11}
                                                fill={s <= item.rating ? '#00ff00' : 'none'}
                                                stroke={s <= item.rating ? 'green-500' : '#D1D5DB'}
                                            />
                                        ))}
                                    </div>

                                    {/* Comment */}
                                    <p className="text-sm text-gray-700 leading-relaxed">{item.comment}</p>
                                </div>
                            ))}
                        </div>
                        // </div>
                    )}</div>)

                        :

                        (<div className="max-w-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>

                            <div className="flex items-center gap-1 mb-4">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                        key={s}
                                        size={28}
                                        className="cursor-pointer transition"
                                        fill={s <= (hoveredStar || reviewRating) ? '#16a34a' : 'none'}
                                        stroke={s <= (hoveredStar || reviewRating) ? '#16a34a' : '#D1D5DB'}
                                        onMouseEnter={() => setHoveredStar(s)}
                                        onMouseLeave={() => setHoveredStar(0)}
                                        onClick={() => setReviewRating(s)}
                                    />
                                ))}
                                <span className="text-sm text-gray-400 ml-2">
                                    {reviewRating ? `${reviewRating} / 5` : "Select rating"}
                                </span>
                            </div>

                            {/* Comment */}
                            <textarea
                                rows={4}
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="Share your experience..."
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-gray-900 resize-none mb-4"
                            />

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={cancelReviewAdd}
                                    className="px-5 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReviewSubmit}
                                    disabled={reviewLoading}
                                    className="px-5 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-500 transition disabled:opacity-50"
                                >
                                    {reviewLoading ? "Submitting..." : "Submit Review"}
                                </button>
                            </div>
                        </div>

                        )}


                </div>
                {/* ── END REVIEW SECTION ── */}

            </main>

            <Footer />
        </>
    );
};

export default Book;