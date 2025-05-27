import React, { useState } from 'react';
import SettingsHeaderTabs from '../../components/setting/SettingsHeaderTabs';
import { FiShield, FiKey, FiSmartphone, FiInfo, FiEye, FiEyeOff } from 'react-icons/fi';
import { useUserStore } from '../../store/userStore.js';

const SecuritySection = () => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Visibility toggles
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { updatePassword, isLoading } = useUserStore();

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords don't match");
            setSuccessMessage('');
            return;
        }

        if (newPassword.length < 8) {
            setPasswordError("Password must be at least 8 characters");
            setSuccessMessage('');
            return;
        }

        const res = await updatePassword(currentPassword, newPassword, confirmPassword);
        if (res.success) {
            setPasswordError('');
            setSuccessMessage('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            setSuccessMessage('');
            setPasswordError(res.error || 'Failed to change password');
        }
    };

    const inputClass =
        'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pr-10';

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="sticky top-0 z-40 bg-white shadow-sm">
                <SettingsHeaderTabs activeTab="security" />
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
                    <div className="mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <FiKey className="text-gray-600" />
                            Change Password
                        </h2>

                        {successMessage && (
                            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded flex items-start gap-2">
                                <FiInfo className="mt-0.5 flex-shrink-0" />
                                {successMessage}
                            </div>
                        )}

                        {passwordError && (
                            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex items-start gap-2">
                                <FiInfo className="mt-0.5 flex-shrink-0" />
                                {passwordError}
                            </div>
                        )}

                        <form onSubmit={handlePasswordChange}>
                            <div className="space-y-4">

                                {/* Current Password */}
                                <div className="relative">
                                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                        Current Password
                                    </label>
                                    <input
                                        type={showCurrent ? 'text' : 'password'}
                                        id="currentPassword"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className={inputClass}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrent(!showCurrent)}
                                        className="absolute right-3 top-9 text-gray-500 focus:outline-none"
                                    >
                                        {showCurrent ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>

                                {/* New Password */}
                                <div className="relative">
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                        New Password
                                    </label>
                                    <input
                                        type={showNew ? 'text' : 'password'}
                                        id="newPassword"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className={inputClass}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNew(!showNew)}
                                        className="absolute right-3 top-9 text-gray-500 focus:outline-none"
                                    >
                                        {showNew ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>

                                {/* Confirm Password */}
                                <div className="relative">
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={inputClass}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-9 text-gray-500 focus:outline-none"
                                    >
                                        {showConfirm ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>

                                {/* Submit */}
                                <div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-gray-400' : 'bg-[#5C8D7D] hover:bg-[#8ab5a7]'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                                    >
                                        <FiKey size={16} />
                                        {isLoading ? 'Changing...' : 'Change Password'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* 2FA Section */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
                            <div className="flex items-start gap-4">
                                <div className="bg-white p-3 rounded-full shadow-sm">
                                    <FiShield className="text-blue-600 text-xl" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800 mb-1">Two-Factor Authentication</h2>
                                    <p className="text-gray-600 text-sm">Enhanced security for your account</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="flex items-start gap-3">
                                <FiSmartphone className="text-gray-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h3 className="font-medium text-gray-800">How it works</h3>
                                    <p className="text-gray-600 text-sm mt-1">
                                        After enabling 2FA, you'll need to enter both your password and a verification code from your authenticator app when signing in.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SecuritySection;
