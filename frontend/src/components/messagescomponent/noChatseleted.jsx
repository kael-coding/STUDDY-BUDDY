import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
    return (
        <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-white-200">
            <div className="max-w-md text-center space-y-6">

                <div className="flex justify-center gap-4 mb-4">
                    <div className="relative">
                        <div
                            className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-bounce"
                        >
                            <MessageSquare className="w-8 h-8 text-[#5C8D7D]" />
                        </div>
                    </div>
                </div>

                {/* Welcome Text */}
                <h2 className="text-2xl font-bold text-gray-800">
                    Welcome to Study Buddy Chat!
                </h2>
                <p className="text-gray-600">
                    Jump into a conversation—find a friend and say hello!
                </p>
            </div>
        </div>
    );
};

export default NoChatSelected;
