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
                <SideMessageBar />
                {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>
        </div>
    );
};

export default Messages;
