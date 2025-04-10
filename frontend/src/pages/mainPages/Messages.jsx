import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoNotificationsOutline, IoMailOutline } from "react-icons/io5";

const Messages = () => {
    const [messages, setMessages] = useState([
        { text: "Hey, how's your project going?", sender: "other" },
        { text: "It's going well! Almost done.", sender: "me" },
        { text: "That's awesome! Need any help?", sender: "other" },
    ]);
    const [newMessage, setNewMessage] = useState("");
    const navigate = useNavigate();

    const sendMessage = () => {
        if (newMessage.trim() !== "") {
            setMessages([...messages, { text: newMessage, sender: "me" }]);
            setNewMessage("");
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 relative">

            {/* Back button */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 w-10 h-10 rounded-full bg-gray-500 text-white text-xl flex items-center justify-center shadow-md hover:bg-gray-800 z-40"
            >
                &times;
            </button>

            {/* Header */}
            <header className="bg-[#5C8D7D] text-white p-4 pl-16 shadow-lg flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Messages</h1>
                <div className="flex items-center gap-6">
                    <div className="relative cursor-pointer">
                        <IoNotificationsOutline size={24} />
                        <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                            3
                        </span>
                    </div>
                    <div className="relative cursor-pointer">
                        <IoMailOutline size={24} />
                        <span className="absolute -top-1.5 -right-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                            2
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1 md:flex-row flex-col overflow-hidden">
                {/* Sidebar */}
                <aside className="w-full md:w-1/3 bg-white p-5 shadow-lg overflow-y-auto">
                    <h2 className="text-lg font-bold mb-4">Messages</h2>
                    <input
                        type="text"
                        className="w-full p-2 border rounded-lg mb-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4A7C56]"
                        placeholder="Search contacts..."
                    />
                    <ul className="space-y-3">
                        <li className="p-3 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer">👤 John Doe</li>
                        <li className="p-3 rounded-lg hover:bg-gray-200 cursor-pointer">👤 Jane Smith</li>
                        <li className="p-3 rounded-lg hover:bg-gray-200 cursor-pointer">👤 Alex Johnson</li>
                    </ul>
                </aside>

                {/* Chat Window */}
                <section className="flex-1 bg-white p-5 flex flex-col relative">
                    <div className="border-b pb-3 mb-3 text-lg font-bold text-[#5C8D7D]">Chat with John Doe</div>

                    {/* Messages List */}
                    <div className="flex-1 overflow-y-auto space-y-4 p-3">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg max-w-xs break-words ${msg.sender === "me"
                                    ? "bg-[#5C8D7D] text-white ml-auto"
                                    : "bg-gray-200 text-gray-700"
                                    }`}
                            >
                                {msg.text}
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="mt-4 flex items-center border-t pt-4">
                        <input
                            type="text"
                            className="flex-1 border p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#5C8D7D]"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        />
                        <button
                            className="ml-3 bg-[#5C8D7D] text-white px-5 py-3 rounded-lg hover:bg-[#4A7C56] focus:outline-none focus:ring-2 focus:ring-[#5C8D7D]"
                            onClick={sendMessage}
                        >
                            Send
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Messages;
    