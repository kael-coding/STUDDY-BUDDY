import NoChatSelected from "@/components/messagescomponent/noChatseleted.jsx";
import SideMessageBar from "@/components/messagescomponent/sideMessageBar.jsx";
import ChatContainer from "@/components/messagescomponent/chatContainer.jsx";
import { useChatStore } from "@/store/useChatStore.js";

const Messages = () => {
    const { selectedUser } = useChatStore();

    return (
        <div className="flex h-full min-h-0 flex-col bg-gray-50 text-black md:flex-row">
            <div className={`min-h-0 w-full shrink-0 overflow-y-auto border-r border-[#dce7e1] bg-white md:w-1/3 ${selectedUser ? "hidden md:block" : "flex-1 md:flex-none"}`}>
                <SideMessageBar />
            </div>
            {selectedUser ? (
                <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                    <ChatContainer />
                </div>
            ) : (
                <div className="hidden flex-1 items-center justify-center md:flex">
                    <NoChatSelected />
                </div>
            )}
        </div>
    );
};

export default Messages;
