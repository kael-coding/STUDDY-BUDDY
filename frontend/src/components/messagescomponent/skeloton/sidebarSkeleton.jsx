import { useNavigate } from "react-router-dom";

const SidebarSkeleton = () => {
    const navigate = useNavigate();
    const skeletonContacts = Array(8).fill(null);

    return (
        <aside className="w-full md:w-1/3 p-5 shadow-lg overflow-y-auto">
            {/* Header: [x] Messages */}
            <div className="flex items-center gap-4 mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 rounded-full bg-gray-500 text-white text-xl flex items-center justify-center shadow hover:bg-gray-700"
                >
                    &times;
                </button>
                <h2 className="text-lg font-bold">Messages</h2>
            </div>

            {/* Search input skeleton */}
            <div className="w-full p-2 rounded-lg mb-3 bg-gray-200 animate-pulse h-10" />

            <div className="overflow-y-auto w-full py-3">
                {skeletonContacts.map((_, idx) => (
                    <div key={idx} className="w-full p-3 flex items-center gap-3">
                        <div className="relative mx-auto lg:mx-0">
                            <div className="bg-gray-300 animate-pulse size-12 rounded-full" />
                        </div>

                        {/* Text skeleton (visible on lg) */}
                        <div className="hidden lg:block text-left min-w-0 flex-1">
                            <div className="h-4 w-32 bg-gray-300 rounded animate-pulse mb-2" />
                            <div className="h-3 w-16 bg-gray-300 rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default SidebarSkeleton;
