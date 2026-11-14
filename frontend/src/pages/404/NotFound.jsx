import React from 'react';
import SadFaceIcon from '@/assets/SadFaceIcon.jsx';

const NotFound = () => {
    return (
        <div className="bg-gradient-to-br from-blue-100 via-white to-purple-100 min-h-screen flex items-center justify-center">
            <div className="text-center px-6">
                <div className="mb-8">
                    <SadFaceIcon />
                </div>
                <h1 className="text-6xl font-extrabold text-[#5C8D7D] mb-4">404</h1>
                <p className="text-xl text-gray-700 mb-2">Looks like you’re a little lost 📚</p>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    The page you’re looking for isn’t here. It might have been moved, deleted, or maybe you just misspelled the URL.
                </p>
                <a href="/" className="inline-block bg-[#5C8D7D] hover:bg-[#5C8D7D] text-white px-6 py-3 rounded-lg text-sm font-semibold transition">
                    ⬅ Back to Study Buddy Home
                </a>
                <p className="mt-10 text-xs text-gray-400">&copy; 2025 Study Buddy. All rights reserved.</p>


            </div>
        </div>
    );
};

export default NotFound;
