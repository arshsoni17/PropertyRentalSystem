import { useState, useEffect, useRef } from "react";
import { FolderOpen } from "lucide-react";
import { Library } from "lucide-react";
import { useNavigate } from "react-router";
// no need to use the async and await here because there is no fetching, noEvents
const ProfileMenu = () => {
    const [isOpen, setIsOpen] = useState(0);

    //use ref for tracking the outissde click
    const menuRef = useRef();
    //
    const handleClick = () => {
        if (isOpen == 0) { setIsOpen(1) }
        else { setIsOpen(0) }
    }

    const navigate = useNavigate();

    const userPage = ()=>{
        navigate("/user/profile")
    }

    const logout = () => {
        localStorage.removeItem('token');
        navigate("/auth");
    }

    useEffect(() => {
        //////////////this thing need to get revised
        const handleClickOutside = (e) => {
            // if clicked outside the menu
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);
    
    return (
        <>
            <div ref={menuRef} className="flex flex-col relative ">
                <button className=" p-3 hover:bg-gray-200 rounded-2xl" onClick={handleClick}><Library size={25}/></button>
                {isOpen == 1 &&
                    <div className=" absolute  right-0 mt-20 w-40 bg-gray-100 shadow-lg  rounded-lg p-3 z-50">
                        <button onClick={userPage}><div className="bg-linear-to-r from-gray-100 to-gray-200 hover:from-gray-300 hover:to-gray-400  text-Black font-semibold p-3 m-2 rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"> USER INFO</div></button>
                        <button
                            type="button"
                            onClick={logout}
                            className="bg-linear-to-r from-red-500 to-red-400 hover:from-red-400 hover:to-red-300 text-white font-semibold p-3 m-2 rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                            LOGOUT
                        </button>
                    </div>

                }
            </div>


        </>
    )
}
export default ProfileMenu;
