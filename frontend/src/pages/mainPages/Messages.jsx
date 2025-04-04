import { useState } from "react";

const Messages = () => {
    const [messages, setMessages] = useState([
        { text: "Hey, how's your project going?", sender: "other" },
        { text: "It's going well! Almost done.", sender: "me" },
        { text: "That's awesome! Need any help?", sender: "other" },
    ]);
    const [newMessage, setNewMessage] = useState("");

    const sendMessage = () => {
        if (newMessage.trim() !== "") {
            setMessages([...messages, { text: newMessage, sender: "me" }]);
            setNewMessage("");
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-screen">
            {/* Contacts Sidebar */}
            <div className="w-full md:w-1/3 bg-white p-5 shadow-lg md:h-full">
                <h2 className="text-lg font-bold mb-4">Messages</h2>
                <input
                    type="text"
                    className="w-full p-2 border rounded mb-3"
                    placeholder="Search contacts..."
                />
                <ul className="space-y-3">
                    <li className="p-3 rounded bg-gray-100 cursor-pointer hover:bg-gray-200">👤 John Doe</li>
                    <li className="p-3 rounded hover:bg-gray-200 cursor-pointer">👤 Jane Smith</li>
                    <li className="p-3 rounded hover:bg-gray-200 cursor-pointer">👤 Alex Johnson</li>
                </ul>
            </div>

            {/* Chat Window */}
            <div className="flex-1 bg-gray-50 p-5 flex flex-col md:h-full relative">
                <div className="border-b pb-3 mb-3 text-lg font-bold">Chat with John Doe</div>

                {/* Scrollable Messages Container */}
                <div className="flex-1 overflow-y-auto space-y-4 p-3">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`p-3 rounded-lg max-w-xs ${msg.sender === "me" ? "bg-blue-500 text-white ml-auto" : "bg-gray-200"}`}
                        >
                            {msg.text}
                        </div>
                    ))}
                </div>

                {/* Fixed Input Section */}
                <div className="absolute bottom-0 left-0 w-full p-3 bg-white flex items-center">
                    <input
                        type="text"
                        className="flex-1 border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <button
                        className="ml-3 bg-blue-500 text-white px-5 py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={sendMessage}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Messages;
