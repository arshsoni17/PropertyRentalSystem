import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import logo from "/booking-svgrepo-com (3).svg";
import { Menu, X, User, Home } from "lucide-react";
import ProfileMenuHost from "./host/hostToggle";

function HeaderHost() {
    const [userRole, setUserRole] = useState("");
    const [userId, setUserId] = useState("");
    const [userName, setUserName] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);


    const navigate = useNavigate();

    // Decoding of the token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = jwtDecode(token);
                setUserRole(payload.userRole);
                setUserId(payload.userId);
                setUserName(payload.userName);
                // if( userRole === "ADMIN"){ navigate("/admin")};
            }
            catch (error) {
                console.log(error);
            }
        }
    }, []);

   

    const logout = () => {
        localStorage.removeItem('token');
        navigate("/auth");
    }

    const becomeHost = () => {
        navigate("/become-host");
    }

    const switchToUser = ()=>{
        navigate("/home");
    }

    const goHome = () => {
        navigate("/host-dashboard");
    }

    return (
        <header className="bg-white shadow-md  top-0 z-50">
            <div className="mx-5">
                <div className="flex justify-between items-center py-4">
                    {/* Logo - LEFT */}
                    <div 
                        className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={goHome}
                    >
                        <div className="w-10 h-10 sm:w-12 sm:h-12">
                            <img src={logo} alt="logo" className="w-full h-full" />
                        </div>
                        <span className="hidden sm:block text-xl font-bold text-gray-800">
                            Book
                        </span>
                    </div>

                    {/* USER INFO IN CENTER  */}
                    <div className="hidden lg:flex items-center bg-linear-to-r from-gray-50 to-gray-100 px-6 py-3 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-6 text-sm">
                            {/* <div className="flex items-center gap-2">
                                <span className="text-gray-500 font-medium">ID:</span>
                                <span className="font-semibold text-gray-800">{userId}</span>
                            </div> */}
                            
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="font-semibold text-gray-800">{userName}</span>
                            </div>
                            <div className="h-6 w-px bg-gray-300"></div>
                            <div className="flex items-center gap-2">
                                <span
                                    className="font-semibold text-gray-800"
                                >
                                    {new Date().toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Desktop - Action Buttons RIGHT */}
                    <div className="hidden md:flex items-center gap-3">
                        <button
                            type="button"
                            onClick={goHome}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-full transition-all duration-200 flex items-center gap-2"
                        >
                            <Home className="w-4 h-4" />
                            <span className="hidden lg:inline">Home</span>
                        </button>

                        {userRole === "USER" && (
                            <button
                                type="button"
                                onClick={becomeHost}
                                className="bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold px-6 py-2 rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                BECOME A HOST
                            </button>
                        )}

                        {userRole === "HOST" && (
                            <button
                                type="button"
                                onClick={switchToUser}
                                className="bg-white hover:bg-gray-50 text-gray-800 font-semibold px-6 py-2 rounded-full transition-all duration-200 border-2 border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md"
                            >
                                SWITCH TO USER
                            </button>
                        )}
                        <ProfileMenuHost />
                    </div>

                    {/* Mobile - Hamburger Menu */}
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? (
                            <X className="w-6 h-6 text-gray-700" />
                        ) : (
                            <Menu className="w-6 h-6 text-gray-700" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                <div
                    className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
                        isMenuOpen ? "max-h-96 pb-4" : "max-h-0"
                    }`}
                >
                    {/* Mobile User Info */}
                    <div className="bg-linear-to-r from-gray-50 to-gray-100 p-4 rounded-2xl mb-4 border border-gray-200">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">ID:</span>
                                <span className="font-semibold text-gray-800">{userId}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Name:</span>
                                <span className="font-semibold text-gray-800">{userName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 font-medium">Role:</span>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                        userRole === "HOST"
                                            ? "bg-emerald-100 text-emerald-700"
                                            : "bg-blue-100 text-blue-700"
                                    }`}
                                >
                                    {userRole}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Action Buttons */}
                    <div className="space-y-2">
                        <button
                            type="button"
                            onClick={() => {
                                goHome();
                                setIsMenuOpen(false);
                            }}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            <Home className="w-4 h-4" />
                            Home
                        </button>

                        {userRole === "USER" && (
                            <button
                                type="button"
                                onClick={() => {
                                    becomeHost();
                                    setIsMenuOpen(false);
                                }}
                                className="w-full bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold px-4 py-3 rounded-xl transition-all shadow-md"
                            >
                                BECOME A HOST
                            </button>
                        )}

                        {userRole === "HOST" && (
                            <button
                                type="button"
                                onClick={() => {
                                    switchToHost();
                                    setIsMenuOpen(false);
                                }}
                                className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold px-4 py-3 rounded-xl transition-all border-2 border-gray-300"
                            >
                                SWITCH TO HOST
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() => {
                                logout();
                                setIsMenuOpen(false);
                            }}
                            className="w-full bg-linear-to-r from-red-500 to-red-400 hover:from-red-400 hover:to-red-300 text-white font-semibold px-4 py-3 rounded-xl transition-all shadow-md"
                        >
                            LOGOUT
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default HeaderHost;