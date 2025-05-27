import { useNavigate } from 'react-router-dom';
import { IoIosArrowRoundBack } from 'react-icons/io';

const SettingsHeaderTabs = ({ activeTab = 'profile' }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/user_dashboard');
    };

    return (
        <>
            {/* Fixed Back Button - only on small screens */}
            <div className="md:hidden fixed top-16 left-0 w-full bg-white z-30 p-2 shadow-sm">
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
                <div className="p-4 md:p-6 max-w-4xl mx-auto">
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
