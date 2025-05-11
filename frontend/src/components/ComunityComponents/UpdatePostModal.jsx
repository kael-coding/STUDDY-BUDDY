import { useState, useEffect } from 'react';

const UpdatePostModal = ({ post, onClose, onSubmit }) => {
    const [text, setText] = useState('');
    const [image, setImage] = useState('');

    useEffect(() => {
        setText(post.text);
        setImage(post.image || '');
    }, [post]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ text, image });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Update Post</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full h-24 p-2 border rounded"
                        placeholder="What's on your mind?"
                        required
                    />
                    <input
                        type="text"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="Image URL (optional)"
                    />
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            className="px-4 py-2 bg-gray-300 rounded"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 text-white rounded"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdatePostModal;
