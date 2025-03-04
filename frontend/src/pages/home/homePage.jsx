import React from 'react'
import { useAuthStore } from '../../store/authStore'
import { Loader } from "lucide-react";


const homePage = () => {

    const { logout, isLoading } = useAuthStore()

    const handlelogout = (e) => {
        logout()
    }
    return (
        <div>homePage
            <button className="w-full bg-gray-600 text-white py-3 rounded-xl hover:bg-gray-700 transition shadow-md mt-4"
                onClick={handlelogout}

            >
                {isLoading ? <Loader className="w-6 h-6 animate-spin mx-auto" /> : "Logout"}
            </button>
        </div>
    )
}

export default homePage