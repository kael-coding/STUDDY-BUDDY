import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { useAuthStore } from "../../store/authStore";
import { Loader } from "lucide-react";

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const { user, updateProfile, isLoading } = useAuthStore();
    const [selectedFileName, setSelectedFileName] = useState('');
    const [profilePicture, setProfilePicture] = useState(user.profilePicture || '');
    const [showModal, setShowModal] = useState(false);

    const [formData, setFormData] = useState({
        userName: user.userName,
        email: user.email,
        school: 'Your School',
        major: 'Computer Science',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFileName(file.name);

        try {
            const options = {
                maxSizeMB: 1,  // Set to a reasonable size like 1MB
                maxWidthOrHeight: 1024,
                useWebWorker: true,
            };

            const compressedFile = await imageCompression(file, options);

            const reader = new FileReader();
            reader.readAsDataURL(compressedFile);

            reader.onload = async () => {
                const base64Image = reader.result;
                setProfilePicture(base64Image);
            };
        } catch (error) {
            console.error('Error compressing or uploading image:', error);
        }
    };

    const toggleEdit = () => setIsEditing(true);
    const cancelEdit = () => setIsEditing(false);
    const toggleModal = () => setShowModal(!showModal);

    const saveProfilePicture = async () => {
        await updateProfile({ profilePicture });
        setShowModal(false); // Close the modal after saving
    };

    return (
        <main className="p-6 max-w-4xl mx-auto">
            {/* Profile Card */}
            <div className="bg-white p-6 rounded shadow mb-6 flex items-center gap-6">
                <div className="w-24 h-24 bg-gray-300 rounded-full overflow-hidden flex items-center justify-center text-3xl text-white">
                    {!profilePicture ? (
                        formData.userName.charAt(0)
                    ) : (
                        <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    )}
                </div>
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800">{formData.userName}</h2>
                    <p className="text-gray-500">{formData.email}</p>
                    <button
                        onClick={toggleModal}
                        className="mt-2 text-blue-600 hover:underline text-sm"
                    >
                        Edit Photo
                    </button>
                </div>
            </div>

            {/* Info Section */}
            <div className="bg-white p-6 rounded shadow space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold border-b pb-2 w-full text-gray-800">Personal Info</h3>
                    {!isEditing && (
                        <button
                            onClick={toggleEdit}
                            className="text-blue-600 hover:underline text-sm"
                        >
                            Edit
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Full Name:</label>
                        <input
                            type="text"
                            name="userName"
                            value={formData.userName}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={`w-full border p-2 rounded mt-1 ${isEditing ? 'border-blue-500' : 'bg-gray-100'}`}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Email:</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={`w-full border p-2 rounded mt-1 ${isEditing ? 'border-blue-500' : 'bg-gray-100'}`}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">School:</label>
                        <input
                            type="text"
                            name="school"
                            value={formData.school}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={`w-full border p-2 rounded mt-1 ${isEditing ? 'border-blue-500' : 'bg-gray-100'}`}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Major / Course:</label>
                        <input
                            type="text"
                            name="major"
                            value={formData.major}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={`w-full border p-2 rounded mt-1 ${isEditing ? 'border-blue-500' : 'bg-gray-100'}`}
                        />
                    </div>
                </div>

                {isEditing && (
                    <div className="text-right">
                        <button
                            onClick={cancelEdit}
                            className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400 mr-2"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
                        >
                            Save Changes
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800">Edit Profile Photo</h2>

                        <label className="block mb-4">
                            <span className="text-sm font-medium text-gray-700">Select file:</span>
                            <div className="flex items-center gap-4 mt-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="fileInput"
                                    onChange={handleImageUpload}
                                />
                                <label
                                    htmlFor="fileInput"
                                    className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600"
                                >
                                    Choose File
                                </label>
                                {selectedFileName ? (
                                    <span className="text-sm text-gray-700">{selectedFileName}</span>
                                ) : (
                                    <span className="text-gray-500 text-sm">No file chosen</span>
                                )}
                            </div>
                        </label>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={toggleModal}

                                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveProfilePicture}
                                disabled={isLoading}
                                className="bg-blue-500 px-4 py-2 text-white rounded hover:bg-blue-600"
                            >
                                {isLoading ? <Loader className="w-6 h-6 animate-spin mx-auto" /> : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Profile;
