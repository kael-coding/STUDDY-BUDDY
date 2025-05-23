// src/pages/IntroPage.jsx
import { Link } from "react-router-dom";
import Header from "../components/Header/header.jxs";
import { useAuthStore } from "../store/authStore";

export default function IntroPage() {
    const { isAuthenticated, isLoading } = useAuthStore();

    return (
        <div className="bg-[#1e1e1e] text-white font-sans antialiased">
            <Header />

            {/* Hero Section */}
            <section className="py-20 text-center px-6">
                <h2 className="text-4xl md:text-5xl font-bold leading-tight text-white">
                    Smarter Study Starts Here
                </h2>
                <p className="mt-6 text-base md:text-lg text-gray-300 max-w-xl mx-auto">
                    Stay organized, study better, and work with your peers — all in one intuitive space.
                </p>
                <Link to={isAuthenticated ? "/user_dashboard" : "/login"}>
                    <button className="mt-10 bg-[#5C8D7D] text-white text-base md:text-lg font-medium px-6 py-3 rounded-full shadow-md hover:bg-[#476b60] transition
                    "
                        disabled={isLoading}>
                        {isLoading ? <Loader className="w-6 h-6 animate-spin mx-auto" /> : " Get Started"}

                    </button>
                </Link>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-[#2a2a2a] px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-white mb-10">Key Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-[#3a3a3a] p-6 rounded-2xl shadow hover:shadow-lg transition">
                            <h3 className="text-xl font-semibold mb-2 text-[#5C8D7D]">📚 Study Plans</h3>
                            <p className="text-gray-300">Tailor your study sessions with flexible, easy-to-track plans.</p>
                        </div>
                        <div className="bg-[#3a3a3a] p-6 rounded-2xl shadow hover:shadow-lg transition">
                            <h3 className="text-xl font-semibold mb-2 text-[#5C8D7D]">🤝 Collaboration</h3>
                            <p className="text-gray-300">Group studies made simple: real-time editing, chat & sharing.</p>
                        </div>
                        <div className="bg-[#3a3a3a] p-6 rounded-2xl shadow hover:shadow-lg transition">
                            <h3 className="text-xl font-semibold mb-2 text-[#5C8D7D]">🌍 Learn Anywhere</h3>
                            <p className="text-gray-300">Cross-device support so you can study on the go.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-20 text-center px-6 bg-[#1e1e1e]">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold mb-6 text-white">Why StudyBuddy?</h2>
                    <p className="text-base md:text-lg text-gray-300">
                        Built for students, by students. StudyBuddy is your academic sidekick that helps you
                        manage your time, collaborate with peers, and track your goals — without the clutter.
                    </p>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 bg-[#2a2a2a] px-6">
                <div className="max-w-xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-6 text-white">Let's Talk</h2>
                    <p className="mb-8 text-gray-300">Have questions or feedback? We’re all ears.</p>
                    <form className="space-y-4">
                        <input
                            type="email"
                            placeholder="Your Email"
                            className="w-full p-4 rounded-full bg-[#1e1e1e] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5C8D7D]"
                        />
                        <textarea
                            placeholder="Your Message"
                            rows="4"
                            className="w-full p-4 rounded-2xl bg-[#1e1e1e] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5C8D7D]"
                        ></textarea>
                        <button
                            type="submit"
                            className="w-full bg-[#5C8D7D] text-white py-3 px-6 rounded-full hover:bg-[#476b60] transition font-semibold"
                        >
                            Send Message
                        </button>
                    </form>
                </div>
            </section>

            {/* Footer */}
            <footer className="text-center py-6 text-sm text-gray-500 bg-[#1e1e1e] border-t border-gray-700 mt-12">
                © 2025 StudyBuddy. All rights reserved.
            </footer>
        </div>
    );
}
