import React, { useState, useRef, useEffect } from "react";

const TermsModal = ({ isOpen, onClose, onAgree }) => {
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            setHasScrolledToBottom(false);
        }
    }, [isOpen]);

    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el) return;

        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
            setHasScrolledToBottom(true);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50 p-4 text-black">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg max-w-full sm:max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-[#5C8D7D] flex-shrink-0">
                    Terms and Conditions
                </h1>

                {/* Scrollable content */}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="overflow-y-auto flex-grow max-h-[60vh] sm:max-h-[65vh] pr-3 scroll-smooth"
                    tabIndex={0}
                    style={{ WebkitOverflowScrolling: "touch" }} // smooth scrolling on iOS
                >
                    <p className="mb-4 text-sm sm:text-base">
                        Welcome to <strong>Study Buddy</strong>. These terms and conditions outline the rules and regulations for the use of our application. By accessing this app, we assume you accept these terms. Do not continue to use Study Buddy if you do not agree to all of the terms and conditions stated on this page.
                    </p>

                    <h2 className="text-xl sm:text-2xl font-semibold mt-4 mb-2">1. Acceptance of Terms</h2>
                    <p className="mb-4 text-sm sm:text-base">
                        By creating an account or using Study Buddy, you agree to comply with and be legally bound by these terms. These terms may be updated or revised at any time.
                    </p>

                    <h2 className="text-xl sm:text-2xl font-semibold mt-4 mb-2">2. Use of the App</h2>
                    <ul className="list-disc pl-5 mb-4 space-y-1 text-sm sm:text-base">
                        <li>You must be a student or educational user to use the platform.</li>
                        <li>You are responsible for maintaining the security of your account and password.</li>
                        <li>You may not use Study Buddy for any illegal or unauthorized purpose.</li>
                        <li>You agree not to harass, abuse, or harm other users through the community features.</li>
                    </ul>

                    <h2 className="text-xl sm:text-2xl font-semibold mt-4 mb-2">3. Features</h2>
                    <p className="mb-4 text-sm sm:text-base">
                        Study Buddy includes scheduling tools, digital notes, reminders, badges for task completion, and a student community. These features are designed to help students manage academic responsibilities effectively.
                    </p>

                    <h2 className="text-xl sm:text-2xl font-semibold mt-4 mb-2">4. User Content</h2>
                    <p className="mb-4 text-sm sm:text-base">
                        You are responsible for all content you post, including messages, announcements, and community posts. We reserve the right to remove any content that violates these terms or is deemed inappropriate.
                    </p>

                    <h2 className="text-xl sm:text-2xl font-semibold mt-4 mb-2">5. Privacy</h2>
                    <p className="mb-4 text-sm sm:text-base">
                        We are committed to protecting your privacy. We do not share your personal information without your consent. Refer to our{" "}
                        <a href="#" className="text-blue-600 underline">Privacy Policy</a> for more details.
                    </p>

                    <h2 className="text-xl sm:text-2xl font-semibold mt-4 mb-2">6. Availability and Support</h2>
                    <p className="mb-4 text-sm sm:text-base">
                        Study Buddy aims to be available 24/7, but we do not guarantee uninterrupted access. Support is available via our help center or email.
                    </p>

                    <h2 className="text-xl sm:text-2xl font-semibold mt-4 mb-2">7. Termination</h2>
                    <p className="mb-4 text-sm sm:text-base">
                        We reserve the right to suspend or terminate your access to the app at any time if you violate these terms or misuse the platform.
                    </p>

                    <h2 className="text-xl sm:text-2xl font-semibold mt-4 mb-2">8. Limitation of Liability</h2>
                    <p className="mb-4 text-sm sm:text-base">
                        Study Buddy will not be liable for any damages arising from the use or inability to use the app, including but not limited to lost data or missed deadlines.
                    </p>

                    <h2 className="text-xl sm:text-2xl font-semibold mt-4 mb-2">9. Changes to the Terms</h2>
                    <p className="mb-4 text-sm sm:text-base">
                        We may update these Terms and Conditions at any time. It is your responsibility to check this page regularly for updates.
                    </p>

                    <h2 className="text-xl sm:text-2xl font-semibold mt-4 mb-2">10. Contact Us</h2>
                    <p className="text-sm sm:text-base">
                        If you have any questions about these Terms, please contact us at{" "}
                        <a href="mailto:support@studybuddy.com" className="text-blue-600 underline">support@studybuddy.com</a>.
                    </p>
                </div>

                <div className="flex justify-end mt-4 space-x-3 sticky bottom-0 bg-white pt-4 flex-shrink-0">
                    <button
                        className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        disabled={!hasScrolledToBottom}
                        className={`px-4 py-2 text-sm rounded text-white ${hasScrolledToBottom
                            ? "bg-[#5C8D7D] hover:bg-[#4b7a6a] cursor-pointer"
                            : "bg-gray-400 cursor-not-allowed"
                            }`}
                        onClick={() => {
                            onAgree();
                            onClose();
                        }}
                    >
                        I Agree
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;
