import { Link } from "react-router-dom";
import Header from "../components/header/header";
import { useAuthStore } from "../store/authStore";

export default function IntroPage() {
    const { isAuthenticated } = useAuthStore();

    return (
        <div>
            <Header />
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-12 py-20">
                <div className="max-w-6xl w-full text-center space-y-12">
                    <h1 className="text-6xl font-extrabold text-blue-400">Study Buddy</h1>
                    <p className="text-2xl text-gray-300 max-w-4xl mx-auto">
                        Stay organized, collaborate with peers, and manage your studies effectively with our all-in-one platform.
                    </p>
                </div>
                {/* Dito nag-aadjust ang Link depende kung authenticated ang user */}
                <Link to={isAuthenticated ? "/user_dashboard" : "/login"}>
                    <button className="mt-12 btn btn-primary btn-lg rounded-full shadow-xl hover:scale-105 transition-transform bg-blue-500 hover:bg-blue-600 border-none text-white text-2xl font-semibold px-8 py-4">
                        Get Started
                    </button>
                </Link>
            </div>

            {/* Features Section */}
            <section id="features" className="bg-gray-800 text-white py-20">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-4xl font-semibold text-blue-300">Features</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-12 mt-12">
                        <div className="bg-gray-700 p-8 rounded-xl shadow-lg border border-gray-600">
                            <h3 className="text-2xl text-blue-300">📚 Study Plans</h3>
                            <p className="text-gray-400 mt-4">Create and customize study plans to keep track of subjects and topics efficiently.</p>
                        </div>
                        <div className="bg-gray-700 p-8 rounded-xl shadow-lg border border-gray-600">
                            <h3 className="text-2xl text-purple-300">🤝 Collaboration</h3>
                            <p className="text-gray-400 mt-4">Interactive group study, shared notes, and real-time collaboration for an engaging learning experience.</p>
                        </div>
                        <div className="bg-gray-700 p-8 rounded-xl shadow-lg border border-gray-600">
                            <h3 className="text-2xl text-green-300">🌍 Learn Anywhere</h3>
                            <p className="text-gray-400 mt-4">Sync across devices and continue learning from anywhere, anytime without interruptions.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="bg-gray-900 text-white py-20">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-4xl font-semibold text-yellow-300">About</h2>
                    <p className="text-xl text-gray-300 mt-8 max-w-2xl mx-auto">
                        Study Buddy is designed to help students organize their schedules, collaborate effectively, and manage their study plans. With our easy-to-use platform, you can streamline your academic life, ensuring you're always on top of your assignments and deadlines.
                    </p>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="bg-gray-800 text-white py-20">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-4xl font-semibold text-pink-300">Contact</h2>
                    <p className="text-xl text-gray-300 mt-8 max-w-2xl mx-auto">
                        Have questions or feedback? Reach out to us and we'll get back to you as soon as possible. We're here to help you succeed.
                    </p>

                    <form className="mt-12">
                        <input
                            type="email"
                            placeholder="Your Email"
                            className="p-4 text-gray-900 rounded-full w-full md:w-1/2 mb-4"
                        />
                        <textarea
                            placeholder="Your Message"
                            className="p-4 text-gray-900 rounded-lg w-full md:w-1/2 mb-4"
                            rows="4"
                        />
                        <button className="btn btn-primary bg-blue-500 text-white rounded-full py-4 px-8 mt-4">
                            Send Message
                        </button>
                    </form>
                </div>
            </section>
        </div>
    );
}
