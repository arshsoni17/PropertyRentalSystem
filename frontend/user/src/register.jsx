// we will use two forms here to do the verification part 
// used a teriary condition to show that two forms side by side 
// acc to the condition satisfied or not
import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";


const BASEURL = "http://localhost:3000";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [showVerification, setShowVerification] = useState(false);
    const navigate = useNavigate();

    const registerUser = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:3000/auth/signup', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();
            if (response.ok) {
                alert("verification code sent");
                setShowVerification(true);
            }
            else { alert(data.error); }
            //      setName("");
            // setEmail("");
            // setPassword("");
        } catch (error) { console.log(error); }
    };

    const verifyEmail = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${BASEURL}/auth/verify-email`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, code: verificationCode })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Registration done");
                navigate("/auth");
            } else {
                alert(data.error );
            }
        } catch (error) {
            alert("An error occurred during verification");
            console.error(error);
        }
    };
    const cancelRegister = async (e) => {
        e.preventDefault();
        navigate('/auth');
    };
return (
  <div className="min-h-screen w-full flex items-center justify-center 
                  bg-linear-to-br from-slate-100 via-slate-200 to-slate-300">

    {!showVerification ? (

      // ================= REGISTER FORM =================
      <div className="w-full max-w-md 
                      bg-white 
                      rounded-2xl p-10 
                      shadow-xl
                      text-slate-800">

        <h2 className="text-3xl text-center mb-8 font-semibold">
          Register
        </h2>

        <form onSubmit={registerUser} className="space-y-5">

          <div className="flex flex-col">
            <label className="text-slate-600 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your name"
              className="bg-white border border-slate-300 
                         focus:border-blue-500 
                         focus:ring-2 focus:ring-blue-500/30 
                         rounded-lg px-3 py-2 
                         outline-none placeholder-slate-400"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-slate-600 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="bg-white border border-slate-300 
                         focus:border-blue-500 
                         focus:ring-2 focus:ring-blue-500/30 
                         rounded-lg px-3 py-2 
                         outline-none placeholder-slate-400"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-slate-600 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="bg-white border border-slate-300 
                         focus:border-blue-500 
                         focus:ring-2 focus:ring-blue-500/30 
                         rounded-lg px-3 py-2 
                         outline-none placeholder-slate-400"
            />
          </div>

          <div className="flex flex-col gap-3 pt-4">

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 
                         transition rounded-xl py-3 
                         font-semibold text-white"
            >
              REGISTER
            </button>

            <button
              type="button"
              onClick={cancelRegister}
              className="bg-slate-300 hover:bg-slate-400 
                         transition rounded-xl py-3 
                         font-semibold text-slate-800"
            >
              CANCEL
            </button>

          </div>

        </form>
      </div>

    ) : (

      // ================= VERIFY FORM =================
      <div className="w-full max-w-md 
                      bg-white 
                      rounded-2xl p-10 
                      shadow-xl
                      text-slate-800">

        <h2 className="text-3xl text-center mb-4 font-semibold">
          Email Verification
        </h2>

        <p className="text-center text-slate-600 mb-8">
          A verification code has been sent to{" "}
          <span className="font-semibold text-slate-900">
            {email}
          </span>
        </p>

        <form onSubmit={verifyEmail} className="space-y-6">

          <div className="flex flex-col">
            <label className="text-slate-600 mb-1">
              Verification Code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength="6"
              required
              placeholder="Enter 6-digit code"
              className="bg-white border border-slate-300 
                         focus:border-blue-500 
                         focus:ring-2 focus:ring-blue-500/30 
                         rounded-lg px-3 py-2 
                         outline-none placeholder-slate-400 
                         text-center tracking-widest"
            />
          </div>

          <div className="flex flex-col gap-3 pt-4">

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 
                         transition rounded-xl py-3 
                         font-semibold text-white"
            >
              VERIFY
            </button>

            <button
              type="button"
              onClick={cancelRegister}
              className="bg-slate-300 hover:bg-slate-400 
                         transition rounded-xl py-3 
                         font-semibold text-slate-800"
            >
              CANCEL
            </button>

          </div>

        </form>
      </div>

    )}

  </div>
);


}

export default Register;