const SidebarSkeleton = () => {
    const skeletonContacts = Array(8).fill(null);

    return (
        <aside aria-label="Loading contacts" className="w-full p-4">

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
