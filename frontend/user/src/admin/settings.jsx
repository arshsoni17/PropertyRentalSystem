import { useEffect, useState, useRef } from "react";
import LoadingPreview from "../loadingPage";
import { jwtDecode } from "jwt-decode";
import { Camera } from "lucide-react";

// we will display the email and we will use token for user id and then display email
//and for change password we will call verification code and then we will change a password 
// settings will have only this feature 
const Setting = () => {
    const token = localStorage.getItem('token');
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState("");
    const [userId, setUserId] = useState("");
    const [userName, setUserName] = useState("");

    //db fetch state
    const [email, setEmail] = useState("");
    const [verification, setUserVerification] = useState("NOT VERIFIED");

    //let's make email fetch
    const userEmail = async () => {
        const response = await fetch('http://localhost:3000/home/userProfile', {
            method: "GET",
            headers: { "Content-Type": "application/json", "token": token },
        });
        const data = await response.json();
        setEmail(data.email);
        if (data.is_verified == 1) {
            setUserVerification("VERIFIED")
        }
        console.log(email);
    };


    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = jwtDecode(token);
                setUserRole(payload.userRole);
                setUserId(payload.userId);
                setUserName(payload.userName);
                userEmail();
            }
            catch (error) {
                console.log(error);
            }
        }
        setTimeout(() => setLoading(false), 500);
    })
    if (loading) {
        return <div className="h-screen flex items-center justify-center"><LoadingPreview /></div>
    }
    return (<>
        <div className="p-5 flex flex-col gap-5">
           

            {/* Profile Header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-24 h-24 bg-linear-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900">{userName}</h2>
                        <p className="text-sm text-gray-600 mt-1">ID: {userId}</p>
                        <span className="inline-block mt-2 px-4 py-1.5 bg-rose-50 text-rose-600 text-xs font-semibold rounded-full">
                            {userRole}
                        </span>
                    </div>
                </div>
                {/* <button className="px-6 py-3 border border-gray-900 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-semibold transition">
                    Edit Profile
                </button> */}
            </div>


            <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="p-5 border border-gray-200 rounded-xl hover:shadow-sm transition">
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Username</p>
                    <p className="font-semibold text-gray-900 text-lg">{userName}</p>
                </div>
                <div className="p-5 border border-gray-200 rounded-xl hover:shadow-sm transition">
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Email</p>
                    <p className="font-semibold text-gray-900 text-lg">{email}</p>
                </div>
                <div className="p-5 border border-gray-200 rounded-xl hover:shadow-sm transition">
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Role</p>
                    <p className="font-semibold text-gray-900 text-lg">{userRole}</p>
                </div>
                <div className="p-5 border border-gray-200 rounded-xl hover:shadow-sm transition">
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Account Status</p>
                    <p className="font-semibold text-teal-600 text-lg">{verification}</p>
                </div>
            </div>
        </div>
    </>)
}
export default Setting;