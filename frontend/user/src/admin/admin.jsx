import { useEffect, useState } from "react"
import { jwtDecode } from "jwt-decode";
import { LayoutDashboard, LogOut, PanelLeftClose, PanelLeftOpen, Settings, Users, Table, BookUser, Home } from "lucide-react";
import LoadingPreview from "../loadingPage";
import Footer from "../footer";
import { useNavigate } from "react-router";
// import all components for admin page
import BookingsHandle from "./bookings";
import Dashboard from "./dashboard";
import PropertiesHandle from "./propertieshandling";
import Setting from "./settings";
import UsersHandle from "./usershandling";
import Refunds from "./refunds";

const AdminPage = () => {
    const navigate = useNavigate();
    //for loading
    const [loading, setLoading] = useState(true);

    //for side navbar
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState("dashboard");//dashboard as default open for fron page
    const renderContent = () => {
        switch (activeTab) {
            case "dashboard": return <Dashboard />;
            case "usersHandle": return <UsersHandle />;
            case "setting": return <Setting />;
            case "bookingsHandle": return <BookingsHandle />;
            case "propertiesHandle": return <PropertiesHandle />;
            case "Refunds": return <Refunds />;
            default: return <Dashboard />;
        }
    }

    // for token decoding
    const [userRole, setUserRole] = useState("");
    const [userId, setUserId] = useState("");
    const [userName, setUserName] = useState("");

    // for other data- this data will only be fetched by authentication using email verification
    const [email, setEmail] = useState("");


    // handle logOut functionality
    const [logout, setLogout] = useState(false);
    const [logoutSure, setLogoutSure] = useState(false);
    const handleLogout = () => {
        setLogout(true);
    }
    const handlelogoutSure = () => {
        setLogoutSure(true);
        localStorage.removeItem('token');
        navigate('/auth');
    }
    const logoutCancel = () => {
        setLogout(false);
    }
    const goHome =()=>{
        navigate("/home");
    }
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = jwtDecode(token);
                setUserRole(payload.userRole);
                setUserId(payload.userId);
                setUserName(payload.userName);
            } catch (error) {
                console.error(error);
            }
        }
        setTimeout(() => setLoading(false), 500);
    }, []);
    if (loading) {
        return <div className="h-screen flex items-center justify-center"><LoadingPreview /></div>
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <header className="sticky top-0 z-40 bg-amber-100 h-20 shadow-md flex items-center px-6 justify-between">
                <div className="flex items-center gap-4">
                    {/* TOGGLE BUTTON */}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-amber-200 rounded-lg transition-colors"
                    >
                        {isSidebarOpen ? <PanelLeftClose size={24} /> : <PanelLeftOpen size={24} />}
                    </button>
                    <h1 className="font-bold text-xl text-amber-900">Admin Page</h1>
                </div>
                
                <div className="text-sm font-medium text-amber-800 flex gap-4 items-center ">
                    <div>{userName} <span className="opacity-60">({userRole})</span></div>
                    <div><button onClick={goHome} className="p-1 hover:bg-amber-600 rounded-lg "> <Home size={25}/> </button></div>
                </div>
            </header>

            <div className="flex flex-1 bg-gray-200">
                <nav className={`
                    fixed left-0 top-20 h-[calc(100vh-5rem)] bg-gray-900 text-gray-300 w-64 
                    transition-transform duration-300 ease-in-out z-30
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                `}>
                    <div className=" pl-10 pt-5 flex flex-col gap-10 p-16 mt-5">
                        <button className="flex items-center gap-2 cursor-pointer"
                            onClick={() => setActiveTab("dashboard")} ><LayoutDashboard /> Dashboard</button>
                        <button className="flex items-center gap-2 cursor-pointer"
                            onClick={() => setActiveTab("usersHandle")} ><Users /> UsersHandling</button>
                        <button className="flex items-center gap-2 cursor-pointer"
                            onClick={() => setActiveTab("bookingsHandle")} ><BookUser /> bookingsHandle</button>
                        <button className="flex items-center gap-2 cursor-pointer"
                            onClick={() => setActiveTab("propertiesHandle")} ><Table /> propertiesHandle</button>
                        <button className="flex items-center gap-2 cursor-pointer"
                            onClick={() => setActiveTab("Refunds")}>
                            <BookUser /> Refunds
                        </button>
                        <button className="flex items-center gap-2 cursor-pointer"
                            onClick={() => setActiveTab("setting")} ><Settings /> Settings</button>
                        <button className="flex items-center gap-2 cursor-pointer  text-red-400 hover:text-red-300"
                            onClick={handleLogout} ><LogOut /> LogOut</button>
                    </div>
                </nav>
                <main className={`flex-1 p-8 transition-all  ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
                    {logout ? (
                        <div className="flex justify-center ">
                            <div className="bg-white  h-70 p-10 rounded-4xl border border-gray-300 flex flex-col gap-10 justify-center">
                                <div className="text-2xl font-semibold">Are u sure to logout ? </div>
                                <div className="flex gap-14">
                                    <button className="border p-2 w-20 rounded-2xl bg-green-500 hover:bg-green-400 text-white font-semibold" onClick={logoutCancel}> Cancel</button>
                                    <button className="border p-2 w-20 rounded-2xl bg-red-500 hover:bg-red-400 text-white font-semibold" onClick={handlelogoutSure}> Yes</button></div>
                            </div></div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow min-h-[60vh] ">
                            {renderContent()}
                        </div>
                    )
                    }
                    <div className="mt-10">
                        <Footer />
                    </div>

                </main>
            </div>
        </div>
    )
}

export default AdminPage;