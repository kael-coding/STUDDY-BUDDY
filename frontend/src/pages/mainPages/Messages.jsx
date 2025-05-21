// Messages.jsx
import Headers from "../../components/header/Navbar.jsx";
import NoChatSelected from "../../components/messagescomponent/noChatseleted.jsx";
import SideMessageBar from "../../components/messagescomponent/sideMessageBar.jsx";
import ChatContainer from "../../components/messagescomponent/chatContainer.jsx";
import { useChatStore } from "../../store/useChatStore.js";

const Messages = () => {
    const { selectedUser } = useChatStore();

    return (
        <div className="flex flex-col h-screen bg-gray-50 text-black relative">
            <Headers />
            <div className="flex flex-1 md:flex-row flex-col overflow-hidden">
                {/* Side bar: always visible on desktop, not on mobile if a user is selected */}
                {(!selectedUser || window.innerWidth >= 768) && <SideMessageBar />}

                {/* Main chat area */}
                {!selectedUser ? (
                    // Show NoChatSelected only on desktop
                    <div className="hidden md:flex flex-1 items-center justify-center">
                        <NoChatSelected />
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col">
                        <ChatContainer />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;
