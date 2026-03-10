import { useState } from 'react'
import reactLogo from './assets/react.svg'

import './App.css'
import { useNavigate } from 'react-router';

import { jwtDecode } from 'jwt-decode';

// src/App.jsx
function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  //
  const [is_blocked, setis_blocked] = useState(0);
  //

  const [role, setRole] = useState("");

  const navigate = useNavigate();

  const checkUser = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:3000/auth/login', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if( response.status === 401){
      return alert("U r Blocked by admin, Please regiter with another email")
    }
    if (data.message === "Login Success") {
      localStorage.setItem('token', data.token);

      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = jwtDecode(token);
          setRole(payload.userRole);

        }
        catch (error) {
          console.log(error);
        }
      }
      navigate('/home');
    } else {
      setEmail("");
      setPassword("");
      alert(data.message); // Shows "Invalid User" or "Wrong password"
    }
  };
  const registerUser = async (e) => {
    e.preventDefault();
    navigate('/register');
  };
  return (
    <>
      <div className="min-h-screen w-full flex items-center justify-center 
                  bg-linear-to-br from-slate-100 via-slate-200 to-slate-300">

        <div className="w-full sm:w-4/5 md:w-3/5 lg:w-2/5 
                    flex items-center justify-center 
                    p-6 sm:m-8 md:m-16 h-[80vh] 
                    rounded-3xl 
                    bg-white 
                    shadow-2xl">

          <div className="w-full p-14 rounded-2xl 
                      bg-slate-50 font-medium">

            <form onSubmit={checkUser}>

              <div className="mb-16">

                <label className="text-2xl text-slate-700">Email</label>
                <div>
                  <input
                    className="bg-white border border-slate-300 
                           focus:border-blue-500 
                           focus:outline-none 
                           focus:ring-2 focus:ring-blue-500/30 
                           rounded-lg px-3 py-2 mt-2 mb-6 w-full
                           placeholder-slate-400"
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <label className="text-2xl text-slate-700">Password</label>
                <div>
                  <input
                    className="bg-white border border-slate-300 
                           focus:border-blue-500 
                           focus:outline-none 
                           focus:ring-2 focus:ring-blue-500/30 
                           rounded-lg px-3 py-2 mt-2 w-full
                           placeholder-slate-400"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

              </div>

              <div className="flex flex-col items-center gap-4">

                <button
                  className="bg-blue-600 hover:bg-blue-500 
                         px-6 py-3 rounded-full 
                         w-4/5 transition font-semibold text-white"
                  type="submit"
                >
                  LOGIN
                </button>

                <button
                  className="bg-indigo-600 hover:bg-indigo-500 
                         px-6 py-3 rounded-full 
                         w-4/5 transition font-semibold text-white"
                  type="button"
                  onClick={registerUser}
                >
                  REGISTER
                </button>

              </div>

            </form>
          </div>
        </div>
      </div>
    </>



  );
}

export default App
