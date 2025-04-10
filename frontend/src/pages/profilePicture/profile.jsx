import React, { useState } from 'react';

const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        fullName: 'Student Name',
        email: 'student@example.com',
        school: 'Your School',
        major: 'Computer Science',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const toggleEdit = () => setIsEditing(true);
    const cancelEdit = () => setIsEditing(false);
    const toggleModal = () => setShowModal(!showModal);

    return (
        <main className="p-6 max-w-4xl mx-auto">
            {/* Profile Card */}
            <div className="bg-white p-6 rounded shadow mb-6 flex items-center gap-6">
                <div className="w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-3xl text-white">
                    {formData.fullName.charAt(0)}
                </div>
                <div>
                    <h2 className="text-2xl font-semibold">{formData.fullName}</h2>
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
                    <h3 className="text-lg font-semibold border-b pb-2 w-full">Personal Info</h3>
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
                        <label className="text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={`w-full border p-2 rounded mt-1 ${isEditing ? '' : 'bg-gray-100'}`}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={`w-full border p-2 rounded mt-1 ${isEditing ? '' : 'bg-gray-100'}`}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">School</label>
                        <input
                            type="text"
                            name="school"
                            value={formData.school}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={`w-full border p-2 rounded mt-1 ${isEditing ? '' : 'bg-gray-100'}`}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Major / Course</label>
                        <input
                            type="text"
                            name="major"
                            value={formData.major}
                            onChange={handleChange}
                            readOnly={!isEditing}
                            className={`w-full border p-2 rounded mt-1 ${isEditing ? '' : 'bg-gray-100'}`}
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                        <h2 className="text-lg font-semibold mb-4">Edit Profile Photo</h2>
                        <input type="file" className="mb-4" />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={toggleModal}
                                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={toggleModal}
                                className="bg-blue-500 px-4 py-2 text-white rounded hover:bg-blue-600"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default Profile;
