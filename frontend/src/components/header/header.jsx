import { useState } from "react";
// Adjust the path to your logo image
const Header = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="w-full px-6 py-5 flex justify-between items-center shadow-sm bg-[#2a2a2a] sticky top-0 z-50">
            {/* Logo */}
            <div className="flex items-center space-x-3">
                <img src="/logo.jpg" alt="StudyBuddy Logo" className="h-10 w-10 rounded-full border border-[#5C8D7D]" />
                <h1 className="text-xl font-semibold text-white">StudyBuddy</h1>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
                <button onClick={() => setIsOpen(true)} className="text-gray-300 focus:outline-none text-2xl">
                    ☰
                </button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6 font-medium text-gray-300">
                <a href="#features" className="hover:underline hover:text-[#5C8D7D]">Features</a>
                <a href="#about" className="hover:underline hover:text-[#5C8D7D]">About</a>
                <a href="#contact" className="hover:underline hover:text-[#5C8D7D]">Contact</a>
            </nav>

            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 backdrop-blur-sm bg-black/30 bg-opacity-50 z-40"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            {/* Mobile Sidebar */}
            <aside className={`fixed top-0 right-0 h-full w-64 bg-[#2a2a2a] z-50 transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="flex justify-between items-center px-4 py-4 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">Menu</h2>
                    <button
                        className="text-gray-300 text-2xl focus:outline-none"
                        onClick={() => setIsOpen(false)}
                    >
                        ✕
                    </button>
                </div>
                <nav className="flex flex-col p-4 space-y-4 text-gray-300 font-medium">
                    <a href="#features" onClick={() => setIsOpen(false)} className="hover:text-[#5C8D7D]">Features</a>
                    <a href="#about" onClick={() => setIsOpen(false)} className="hover:text-[#5C8D7D]">About</a>
                    <a href="#contact" onClick={() => setIsOpen(false)} className="hover:text-[#5C8D7D]">Contact</a>
                </nav>
            </aside>
        </header>
    );
}


export default Header;