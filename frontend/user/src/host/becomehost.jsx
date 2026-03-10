import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {jwtDecode } from "jwt-decode";
const BASEURL = "http://localhost:3000";

function BecomeHost() {
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check current user role from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = jwtDecode(token);
        setUserRole(payload.userRole);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const handleBecomeHost = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Please login first");
        navigate("/auth");
        return;
      }
      const response = await fetch(`${BASEURL}/auth/user-host`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "token":token
        }
      });
      const data = await response.json();
      if (response.ok) {
        if (data.token) {
          // Update token in localStorage, new token will contain userRole === "HOST"
          localStorage.setItem('token', data.token);
          alert("Congratulations! You are now a HOST");
        } else {
          alert(data.message);
        }
        navigate("/");
      } else {
        alert(data.message || "Failed to become host");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/");
  };

 return (
  <div className="bg-linear-to-br from-slate-100 via-slate-200 to-slate-300 
                  min-h-screen flex items-center justify-center">

    <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full">

      <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">
        Become a Host
      </h1>

      {userRole === "HOST" ? (

        // ================= Already Host =================
        <div className="text-center">
          <p className="text-emerald-600 mb-6 font-medium">
            You are already a host!
          </p>

          <button
            onClick={handleCancel}
            className="w-full bg-slate-200 hover:bg-slate-300 
                       text-slate-800 font-semibold 
                       py-3 px-4 rounded-xl transition"
          >
            GO BACK
          </button>
        </div>

      ) : (

        // ================= Become Host =================
        <div>

          <div className="bg-slate-100 p-6 rounded-xl mb-6 ">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Host Features:
            </h2>

            <ul className="text-slate-600 space-y-2">
              <li>List properties</li>
              <li>Earn income</li>
              <li>...........</li>
              <li>...........</li>
              <li>...........</li>
            </ul>
          </div>

          <div className="flex justify-around gap-5">

            <button
              onClick={handleBecomeHost}
              className="bg-green-400 text-xl p-2 rounded-lg text-white font-semibold hover:bg-green-600"
            >
              CONFIRM
            </button>

            <button
              onClick={handleCancel}
              className="bg-red-400 text-xl p-2 rounded-lg text-white font-semibold hover:bg-red-600"
            >
              CANCEL
            </button>

          </div>
        </div>

      )}

    </div>
  </div>
);

}

export default BecomeHost;