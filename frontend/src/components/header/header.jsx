import { Link } from "react-router-dom";

export default function Header() {
    return (
        <header className="flex justify-between items-center px-12 py-6 bg-gray-900 text-white">
            <Link to="/" className="flex items-center">
                <img
                    src="/path/to/logo.png"
                    alt="Study Buddy Logo"
                    className="h-12 w-auto"
                />
                <span className="ml-4 text-3xl font-extrabold text-blue-400">Study Buddy</span>
            </Link>
            <nav className="space-x-6">
                <a href="#features" className="text-lg hover:text-blue-400">Features</a>
                <a href="#about" className="text-lg hover:text-blue-400">About</a>
                <a href="#contact" className="text-lg hover:text-blue-400">Contact</a>
            </nav>
        </header>
    );
}
