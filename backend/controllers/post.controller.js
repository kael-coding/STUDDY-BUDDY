import User from "../models/user.model.js";
import Post from "../models/post.model.js"
import cloudinary from "../lib/cloudinary.js";
import Notification from "../models/notification.model.js";

export const createPost = async (req, res) => {
    const { text } = req.body;
    const userId = req.userId;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        if (!text && !req.file) {
            return res.status(400).json({ message: "Text or image is required" });
        }
        let imageUrl;

        if (req.file) {
            const uploadedResponse = await cloudinary.uploader.upload(req.file.path);
            imageUrl = uploadedResponse.secure_url;
        }

        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const customId = "500000" + randomNum;

        const newPost = new Post({
            _id: customId,
            user: userId,
            text,
            image: imageUrl,
        });

        await newPost.save();


        const populatedPost = await Post.findById(newPost._id)
            .populate({
                path: "user",
                select: "-password"
            });

        res.status(201).json({
            newPost: {
                ...populatedPost.toObject(),
                likedByYou: false
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
        console.log("error from createpost ", error);
    }
};

export const getAllPost = async (req, res) => {
    try {
        const userId = req.user?.id;

        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate({
                path: "user",
                select: "-password"
            })
            .populate({
                path: "likes",
                select: "_id"
            })
            .populate({
                path: "comments.user",
                select: "-password"
            })
            .populate({
                path: "comments.replies.user",
                select: "-password"
            })
            .populate({
                path: "comments.replies.replies.user",
                select: "-password"
            });

        if (posts.length === 0) {
            return res.status(200).json({
                message: "No posts found",
                posts: []
            });
        }

        const postsWithLikeStatus = posts.map(post => {
            const likeIds = post.likes.map(like => like._id.toString());
            const likedByYou = userId ? likeIds.includes(userId.toString()) : false;

            const processedComments = post.comments?.map(comment => {
                const commentLikedByYou = userId
                    ? comment.likes?.some(like => like.toString() === userId.toString())
                    : false;

                const processedReplies = comment.replies?.map(reply => {
                    const replyLikedByYou = userId
                        ? reply.likes?.some(like => like.toString() === userId.toString())
                        : false;

                    const processedNestedReplies = reply.replies?.map(nestedReply => {
                        const nestedReplyLikedByYou = userId
                            ? nestedReply.likes?.some(like => like.toString() === userId.toString())
                            : false;

                        return {
                            ...nestedReply.toObject(),
                            likedByYou: nestedReplyLikedByYou,
                            likeCount: nestedReply.likes?.length || 0
                        };
                    }) || [];

                    return {
                        ...reply.toObject(),
                        likedByYou: replyLikedByYou,
                        likeCount: reply.likes?.length || 0,
                        replies: processedNestedReplies
                    };
                }) || [];

                return {
                    ...comment.toObject(),
                    likedByYou: commentLikedByYou,
                    likeCount: comment.likes?.length || 0,
                    replies: processedReplies
                };
            }) || [];

            return {
                ...post.toObject(),
                likes: likeIds,
                likedByYou,
                likeCount: likeIds.length,
                comments: processedComments
            };
        });

        res.status(200).json({
            message: "All posts",
            userPost: {
                posts: postsWithLikeStatus
            }
        });
    } catch (error) {
        console.log("Error in GETALLPOSTS:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;


        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }


        if (post.user.toString() !== req.userId.toString()) {
            return res.status(401).json({ message: "Unauthorized to delete this post" });
        }


        if (post.image) {
            const imgId = post.image.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }


        await Post.findByIdAndDelete(id);

        res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        console.log("Error from deletePost:", error);
        res.status(500).json({ error: error.message });
    }
};

export const updatePost = async (req, res) => {
    const { text } = req.body;
    let { image } = req.body;
    const postId = req.params.id;
    const userId = req.userId;

    try {
        let post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        if (post.user.toString() !== userId) {
            return res.status(401).json({ message: "Unauthorized to edit this post" });
        }
        if (image) {
            const uploadedResponse = await cloudinary.uploader.upload(image);
            image = uploadedResponse.secure_url;
        }
        post.text = text || post.text;
        post.image = image || post.image;
        await post.save();

        // Repopulate the user data before sending the response
        post = await Post.findById(post._id)
            .populate({
                path: "user",
                select: "-password"
            })
            .populate({
                path: "likes",
                select: "id"
            });

        // Add likedByYou status similar to getAllPost
        const likedByYou = post.likes.some(like =>
            like.id.toString() === userId.toString()
        );

        res.status(200).json({
            message: "Post updated successfully",
            updatedPost: {
                ...post.toObject(),
                likedByYou
            }
        });
    } catch (error) {
        console.log("Error from updatePost:", error);
        res.status(500).json({ error: error.message });
    }
};
export const getPostById = async (req, res) => {
    const { id: postId } = req.params;

    try {
        const post = await Post.findById(postId)
            .populate("user", "-password")
            .populate("comments.user", "-password");

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        res.status(200).json({ message: "Post fetched successfully", post });
    } catch (error) {
        console.log("Error from getPostById:", error);
        res.status(500).json({ error: error.message });
    }
};
export const getLikedPosts = async (req, res) => {
    const userId = req.userId;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (!user.linkedPosts || user.linkedPosts.length === 0) {
            return res.status(200).json({ message: `No liked of ${user.userName} posts`, posts: [] });
        }

        const likedPosts = await Post.find({ _id: { $in: user.linkedPosts } })
            .populate({
                path: "user",
                select: "-password"
            })
            .populate({
                path: "comments.user",
                select: "-password"
            });

        res.status(200).json({ message: "Liked posts fetched", posts: likedPosts });
    } catch (error) {
        console.log("Error in getLikedPosts:", error);
        res.status(500).json({ error: error.message });
    }
};

export const likeUnlikePost = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (req.userId) {
            req.user = await User.findById(req.userId).select('userName');
        }

        const { id: postId } = req.params;
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const alreadyLiked = post.likes.includes(userId);

        if (alreadyLiked) {
            await Post.findByIdAndUpdate(postId, { $pull: { likes: userId } });
            await User.findByIdAndUpdate(userId, { $pull: { linkedPosts: postId } });

            await Notification.findOneAndDelete({
                userId: post.user,
                from: userId,
                postId: post._id,
                type: 'like'
            });

        } else {
            await Post.findByIdAndUpdate(postId, { $addToSet: { likes: userId } });
            await User.findByIdAndUpdate(userId, { $addToSet: { linkedPosts: postId } });

            if (post.user.toString() !== userId.toString()) {
                const newNotification = new Notification({
                    userId: post.user,
                    from: userId,
                    postId: post._id,
                    type: 'like',
                    text: `${req.user.userName} liked your post` // Add this line
                });
                await newNotification.save();
            }
        }

        // Get the updated post with all populated data
        const updatedPost = await Post.findById(postId)
            .populate("user", "-password")
            .populate("likes", "_id")
            .populate("comments.user", "-password");

        res.status(200).json({
            message: alreadyLiked ? "Post unliked" : "Post liked",
            post: {
                ...updatedPost.toObject(),
                likedByYou: !alreadyLiked,
                likes: updatedPost.likes.map(like => like._id) // Ensure consistent format
            }
        });
    } catch (error) {
        console.log("Error in likeUnlikePost:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


// this it for the comment functionality
export const likeUnlikeComment = async (req, res) => {
    try {
        const userId = req.userId;
        const { id: commentId } = req.params;

        const post = await Post.findOne({ "comments._id": commentId });

        if (!post) {
            return res.status(404).json({ error: "Post or comment not found" });
        }
        if (req.userId) {
            req.user = await User.findById(req.userId).select('userName');
        }
        const commentIndex = post.comments.findIndex(c => c._id.toString() === commentId);
        if (commentIndex === -1) {
            return res.status(404).json({ error: "Comment not found" });
        }

        const comment = post.comments[commentIndex];
        const alreadyLiked = comment.likesComment?.includes(userId);

        if (alreadyLiked) {
            comment.likesComment = comment.likesComment.filter(uid => uid.toString() !== userId);

            await Notification.findOneAndDelete({
                userId: comment.user,
                from: userId,
                commentId: comment._id,
                type: 'likeComment',
                text
            });
        } else {
            comment.likesComment = comment.likesComment || [];
            comment.likesComment.push(userId);

            if (comment.user.toString() !== userId.toString()) {

                const newNotification = new Notification({
                    userId: comment.user,
                    from: userId,
                    postId: post._id,
                    commentId: comment._id,
                    type: 'likeComment',
                    text: `${req.user.userName} liked your comment: "${comment.text.substring(0, 20)}..."` // Add this line
                });
                await newNotification.save();
            }
        }

        await post.save();

        res.status(200).json({
            message: alreadyLiked ? "Comment unliked" : "Comment liked",
            updatedComment: {
                _id: comment._id,
                likesComment: comment.likesComment
            }
        });

    } catch (error) {
        console.log("Error in likeUnlikeComment:", error);
        res.status(500).json({ error: error.message });
    }
};

export const commentOnPost = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.userId;

        if (!text || text.trim() === "") {
            return res.status(400).json({ error: "Text field is required" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        if (req.userId) {
            req.user = await User.findById(req.userId).select('userName');
        }
        const generateCommentId = () => {
            const random = Math.floor(1000 + Math.random() * 9000);
            return `60000${random}`;
        };

        const comment = {
            _id: generateCommentId(),
            user: userId,
            text,
        };

        post.comments.push(comment);
        await post.save();

        if (post.user.toString() !== userId.toString()) {
            const newNotification = new Notification({
                userId: post.user,
                from: userId,
                postId: post._id,
                commentId: comment._id,
                type: 'comment',
                text: `${req.user.userName} commented on your post: "${text.substring(0, 20)}..."` // Add this line
            });
            await newNotification.save();
        }

        const updatedPost = await Post.findById(postId)
            .populate("user", "-password")
            .populate("comments.user", "-password");

        res.status(200).json({ message: "Comment added", post: updatedPost });

    } catch (error) {
        console.log("Error from commentOnPost:", error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteCommentPost = async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.userId;

        // Find the post that contains the comment
        const post = await Post.findOne({ "comments._id": commentId });
        if (!post) {
            return res.status(404).json({ error: "Post or comment not found" });
        }

        const comment = post.comments.find((c) => c._id === commentId);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }


        if (comment.user.toString() !== userId) {
            return res.status(403).json({ error: "You can only delete your own comment" });
        }

        post.comments = post.comments.filter((c) => c._id !== commentId);
        await post.save();

        await Notification.findOneAndDelete({
            userId: post.user,
            from: userId,
            postId: post._id,
            type: 'comment'
        });
        const updatedPost = await Post.findById(post._id)
            .populate("user", "-password")
            .populate("comments.user", "-password");

        res.status(200).json({ message: "Comment deleted", post: updatedPost });

    } catch (error) {
        console.log("Error from deleteCommentPost:", error);
        res.status(500).json({ error: error.message });
    }
};
export const updateComment = async (req, res) => {
    try {
        const commentId = req.params.id;
        const userId = req.userId;
        const { text, image } = req.body;

        if (post.user.toString() !== req.userId.toString()) {
            return res.status(401).json({ message: "Unauthorized to update  this comment" });
        }

        if (!text || text.trim() === "") {
            return res.status(400).json({ error: "Text field is required" });
        }

        const post = await Post.findOne({ "comments._id": commentId });
        if (!post) {
            return res.status(404).json({ error: "Post or comment not found" });
        }

        const comment = post.comments.find((c) => c._id === commentId);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        if (comment.user.toString() !== userId) {
            return res.status(403).json({ error: "You can only edit your own comment" });
        }

        comment.text = text;
        if (image !== undefined) {
            comment.image = image;
        }

        await post.save();

        const updatedPost = await Post.findById(post._id)
            .populate("user", "-password")
            .populate("comments.user", "-password");

        res.status(200).json({ message: "Comment updated", post: updatedPost });

    } catch (error) {
        console.log("Error from editComment:", error);
        res.status(500).json({ error: error.message });
    }
};

export const replyOnComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { text } = req.body;
        const userId = req.userId;

        if (!text || text.trim() === "") {
            return res.status(400).json({ error: "Reply text is required" });
        }

        const post = await Post.findOne({ "comments._id": commentId })
            .populate("user", "-password")
            .populate("comments.user", "-password");

        if (!post) {
            return res.status(404).json({ error: "Post or comment not found" });
        }

        if (req.userId) {
            req.user = await User.findById(req.userId).select('userName');
        }
        const comment = post.comments.find(c => c._id === commentId);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        const replyId = `70000${Math.floor(1000 + Math.random() * 9000)}`;

        const reply = {
            _id: replyId,
            user: userId,  // This should be the ObjectId
            text,
        };

        comment.replies.push(reply);
        if (comment.user.toString() !== userId.toString()) {
            const newNotification = new Notification({
                userId: comment.user,
                from: userId,
                postId: post._id,
                commentId: comment._id,
                replyId: reply._id,
                type: 'reply',
                text: `${req.user.userName} replied to your comment: "${text.substring(0, 20)}..."` // Add this line
            });
            await newNotification.save();
        }
        await post.save();

        // Populate the user data in the reply
        const updatedPost = await Post.findById(post._id)
            .populate({
                path: 'comments',
                populate: [
                    { path: 'user' },
                    {
                        path: 'replies',
                        populate: {
                            path: 'user',
                            select: '-password'
                        }
                    }
                ]
            })
            .populate('user', '-password');

        res.status(200).json({
            message: "Reply added",
            post: updatedPost,
        });

    } catch (error) {
        console.log("Error from replyOnComment:", error);
        res.status(500).json({ error: error.message });
    }
};


export const replyOnReply = async (req, res) => {
    const { commentId, replyId } = req.params;
    const { text } = req.body;
    const userId = req.userId;

    try {
        const post = await Post.findOne({ 'comments._id': commentId })
            .populate("comments.user", "-password")
            .populate("comments.replies.user", "-password");

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const parentReply = comment.replies.find(r => r._id === replyId);
        if (!parentReply) {
            return res.status(404).json({ message: 'Reply to reply not found' });
        }

        const newReplyId = `70000${Math.floor(1000 + Math.random() * 9000)}`;
        const newReply = {
            _id: newReplyId,
            user: userId,
            text,
            replyTo: replyId
        };

        comment.replies.push(newReply);
        await post.save();

        // Populate the user data in the new reply
        const updatedPost = await Post.findById(post._id)
            .populate({
                path: 'comments',
                populate: [
                    { path: 'user' },
                    {
                        path: 'replies',
                        populate: {
                            path: 'user',
                            select: '-password'
                        }
                    }
                ]
            })
            .populate('user', '-password');

        res.status(200).json({
            message: 'Reply to reply added!',
            post: updatedPost
        });
    } catch (error) {
        console.error('Error in replyOnReply:', error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};


export const likeUnlikeReply = async (req, res) => {
    const { commentId, replyId } = req.params;
    const userId = req.userId;

    try {
        const post = await Post.findOne({ 'comments._id': commentId });
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const comment = post.comments.id(commentId);
        const reply = comment.replies.find(r => r._id === replyId);

        if (!reply) return res.status(404).json({ message: 'Reply not found' });

        // Initialize likesReply if not existing
        if (!reply.likesReply) reply.likesReply = [];

        const hasLiked = reply.likesReply.includes(userId);
        if (hasLiked) {
            reply.likesReply = reply.likesReply.filter(id => id !== userId);
        } else {
            reply.likesReply.push(userId);
        }

        await post.save();
        res.status(200).json({ message: hasLiked ? "Unliked reply" : "Liked reply" });
    } catch (error) {
        console.error("Error liking reply:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
export const likeUnlikeReplyToReply = async (req, res) => {
    const { commentId, parentReplyId, replyId } = req.params;
    const userId = req.userId;

    try {
        nt
        const post = await Post.findOne({ 'comments._id': commentId });
        if (!post) return res.status(404).json({ message: 'Post not found' });


        const comment = post.comments.id(commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });


        const parentReply = comment.replies.id(parentReplyId);
        if (!parentReply) return res.status(404).json({ message: 'Parent reply not found' });


        const nestedReply = parentReply.replies.id(replyId);
        if (!nestedReply) return res.status(404).json({ message: 'Nested reply not found' });


        if (!nestedReply.likes) nestedReply.likes = [];


        const alreadyLiked = nestedReply.likes.includes(userId);

        if (alreadyLiked) {
            nestedReply.likes = nestedReply.likes.filter(id => id.toString() !== userId.toString());
        } else {
            nestedReply.likes.push(userId);
        }

        await post.save();


        const updatedPost = await Post.findById(post._id)
            .populate("user", "-password")
            .populate("comments.user", "-password")
            .populate("comments.replies.user", "-password")
            .populate("comments.replies.replies.user", "-password");

        res.status(200).json({
            message: alreadyLiked ? "Reply unliked" : "Reply liked",
            post: updatedPost
        });

    } catch (error) {
        console.error("Error in likeUnlikeReplyToReply:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};