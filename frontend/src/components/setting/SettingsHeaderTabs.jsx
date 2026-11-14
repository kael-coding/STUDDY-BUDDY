import { useNavigate } from 'react-router-dom';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { homeForRole } from '@/lib/homeForRole.js';
import { useAuthStore } from '@/store/authStore.js';

const SettingsHeaderTabs = ({ activeTab = 'profile' }) => {
    const navigate = useNavigate();
    const role = useAuthStore((state) => state.user?.role);

    const handleBack = () => {
        navigate(homeForRole(role));
    };

    return (
        <>
            <div className="bg-white p-2 md:hidden">
                <button
                    onClick={handleBack}
                    className="flex items-center text-gray-600 hover:text-gray-800"
                >
                    <IoIosArrowRoundBack size={24} />
                    <span className="ml-1">Back</span>
                </button>
            </div>

            {/* Header and Tabs */}
            <div className="bg-white">
                <div className="p-4 md:p-6 max-w-4xl mx-auto mt-5 md:mt-5 lg:mt-5">
                    <div className="mb-4">
                        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                        <p className="text-gray-600">Manage your account settings and preferences.</p>
                    </div>

                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 overflow-x-auto">
                            <a
                                href="profile"
                                className={`py-4 px-1 border-b-2 font-medium whitespace-nowrap ${activeTab === 'profile'
                                    ? ''
                                    : 'text-gray-500 hover:text-gray-700 border-transparent'
                                    }`}
                                style={activeTab === 'profile' ? { color: '#5C8D7D', borderBottomColor: '#5C8D7D' } : {}}
                            >
                                My Profile
                            </a>
                            <a
                                href="security"
                                className={`py-4 px-1 border-b-2 font-medium whitespace-nowrap ${activeTab === 'security'
                                    ? ''
                                    : 'text-gray-500 hover:text-gray-700 border-transparent'
                                    }`}
                                style={activeTab === 'security' ? { color: '#5C8D7D', borderBottomColor: '#5C8D7D' } : {}}
                            >
                                Security
                            </a>
                        </nav>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SettingsHeaderTabs;
