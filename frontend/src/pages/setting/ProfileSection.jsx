import React, { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { useUserStore } from '../../store/userStore.js';
import { Loader } from "lucide-react";
import SettingsHeaderTabs from '../../components/setting/SettingsHeaderTabs.jsx';
import { toast } from "react-hot-toast";

const ProfileSection = () => {
    // Get state and actions from the user store
    const {
        user,
        fetchUserDetails,
        updateProfilePicture,
        updateProfile,
        isLoading,
        error
    } = useUserStore();

    // State for editing and modal
    const [isEditing, setIsEditing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState('');
    const [localError, setLocalError] = useState(null);

    // Form data state - now synced directly with user data
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        school: '',
        course: '',
        profilePicture: ''
    });

    // Initialize form data when user data changes
    useEffect(() => {
        if (user) {
            setFormData({
                userName: user.userName || '',
                email: user.email || '',
                school: user.school || '',
                course: user.course || '',
                profilePicture: user.profilePicture || ''
            });
        }
    }, [user]);

    // Fetch user details on component mount
    useEffect(() => {
        const loadUserData = async () => {
            const result = await fetchUserDetails();
            if (!result.success) {
                setLocalError(result.error);
            }
        };
        loadUserData();
    }, [fetchUserDetails]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.match('image.*')) {
            setLocalError('Please select an image file');
            return;
        }

        // Validate file size (client-side)
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setLocalError('Image size should be less than 5MB');
            return;
        }

        setSelectedFileName(file.name);
        setLocalError(null);

        try {
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1024,
                useWebWorker: true,
            };

            const compressedFile = await imageCompression(file, options);
            const reader = new FileReader();
            reader.readAsDataURL(compressedFile);

            reader.onload = async () => {
                const base64Image = reader.result;
                setFormData(prev => ({
                    ...prev,
                    profilePicture: base64Image
                }));
            };
        } catch (error) {
            console.error('Error compressing image:', error);
            setLocalError('Failed to process image');
        }
    };

    const toggleEdit = () => {
        setIsEditing(!isEditing);
        // Reset form to current user data when canceling edit
        if (isEditing && user) {
            setFormData({
                userName: user.userName || '',
                email: user.email || '',
                school: user.school || '',
                course: user.course || '',
                profilePicture: user.profilePicture || ''
            });
        }
    };

    const toggleModal = () => {
        setShowModal(!showModal);
        setSelectedFileName('');
        setLocalError(null);
        // Reset to current profile picture when closing modal
        if (!showModal && user) {
            setFormData(prev => ({
                ...prev,
                profilePicture: user.profilePicture || ''
            }));
        }
    };

    const saveProfile = async () => {
        if (!formData.userName.trim()) {
            setLocalError('Name is required');
            return;
        }

        try {
            const result = await updateProfile(
                formData.userName.trim(),
                formData.course.trim(),
                formData.school.trim()
            );

            if (result.success) {
                toast.success('Profile updated successfully!');
                setIsEditing(false);
            } else {
                setLocalError(result.error);
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            setLocalError('Failed to update profile');
        }
    };

    const saveProfilePicture = async () => {
        if (!formData.profilePicture) {
            setLocalError('Please select an image');
            return;
        }

        try {
            const result = await updateProfilePicture(formData.profilePicture);

            if (result.success) {
                toast.success('Profile picture updated!');
                setShowModal(false);
            } else {
                setLocalError(result.error);
            }
        } catch (err) {
            console.error('Error updating profile picture:', err);
            setLocalError('Failed to update profile picture');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Fixed Header */}
            <div className="sticky top-0 z-40 bg-white shadow-sm">
                <SettingsHeaderTabs activeTab="profile" />
            </div>

            {/* Scrollable Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
                {(error || localError) && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        {error || localError}
                    </div>
                )}

                {/* Profile Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative group w-24 h-24 sm:w-32 sm:h-32">
                            <div className="w-full h-full rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                {!formData.profilePicture ? (
                                    <span className="text-3xl text-gray-600">
                                        {formData.userName ? formData.userName.charAt(0).toUpperCase() : 'U'}
                                    </span>
                                ) : (
                                    <img
                                        src={formData.profilePicture}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>
                            <button
                                onClick={toggleModal}
                                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                            </button>
                        </div>

                        <div className="text-center sm:text-left mt-4 sm:mt-0">
                            <h2 className="text-xl font-bold text-gray-800">{formData.userName}</h2>
                            <p className="text-gray-600">{formData.email}</p>
                        </div>
                    </div>
                </div>

                {/* Info Section */}
                <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
                        {!isEditing ? (
                            <button
                                onClick={toggleEdit}
                                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Edit
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    onClick={toggleEdit}
                                    className="text-gray-600 hover:text-gray-800 text-sm flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    Cancel
                                </button>
                                <button
                                    onClick={saveProfile}
                                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <Loader className="w-4 h-4 mr-1 animate-spin" />
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            Save
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                name="userName"
                                value={formData.userName}
                                onChange={handleChange}
                                readOnly={!isEditing}
                                className={`w-full p-2 rounded border ${isEditing ? 'border-blue-300 focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-50 border-gray-200'}`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="text"
                                name="email"
                                value={formData.email}
                                readOnly
                                className="w-full p-2 rounded border bg-gray-50 border-gray-200"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                            <input
                                type="text"
                                name="school"
                                value={formData.school}
                                onChange={handleChange}
                                readOnly={!isEditing}
                                className={`w-full p-2 rounded border ${isEditing ? 'border-blue-300 focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-50 border-gray-200'}`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Course / Major</label>
                            <input
                                type="text"
                                name="course"
                                value={formData.course}
                                onChange={handleChange}
                                readOnly={!isEditing}
                                className={`w-full p-2 rounded border ${isEditing ? 'border-blue-300 focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-50 border-gray-200'}`}
                            />
                        </div>
                    </div>
                </div>

                {/* Profile Picture Modal */}
                {showModal && (
                    <div className="fixed inset-0 backdrop-blur-md bg-black/30 bg-opacity-30 flex items-center justify-center z-70 p-4">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Update Profile Picture</h2>

                                <div className="flex flex-col items-center mb-6">
                                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 mb-4">
                                        {formData.profilePicture ? (
                                            <img
                                                src={formData.profilePicture}
                                                alt="Current Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl text-gray-500">
                                                {formData.userName ? formData.userName.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                        )}
                                    </div>

                                    <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                                        <span>Choose New Photo</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                    </label>
                                    {selectedFileName && (
                                        <p className="text-sm text-gray-600 mt-2">{selectedFileName}</p>
                                    )}
                                    {localError && (
                                        <p className="text-sm text-red-500 mt-2">{localError}</p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={toggleModal}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={saveProfilePicture}
                                        disabled={!formData.profilePicture || isLoading}
                                        className={`px-4 py-2 rounded-lg ${!formData.profilePicture || isLoading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                                    >
                                        {isLoading ? (
                                            <Loader className="w-5 h-5 animate-spin mx-auto" />
                                        ) : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileSection;