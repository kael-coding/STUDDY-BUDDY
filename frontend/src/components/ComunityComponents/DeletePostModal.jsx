import React from 'react';

const DeletePostModal = ({ onClose, onDelete }) => {
    return (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                <h2 className="text-lg font-semibold mb-4">Delete Post</h2>
                <p className="mb-6 text-gray-700">Are you sure you want to delete this post?</p>
                <div className="flex justify-end gap-3">
                    <button
                        className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 rounded"
                        onClick={onDelete}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeletePostModal;
