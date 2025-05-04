import express from 'express'
import multer from 'multer';
const upload = multer({ dest: 'uploads/PostImage' });
import { protectRoutes } from '../middleware/protectRoutes.js'
import { createPost, getAllPost, deletePost, commentOnPost, deleteCommentPost, updatePost, updateComment, getPostById, likeUnlikePost, getLikedPosts, likeUnlikeComment, replyOnComment, replyOnReply, likeUnlikeReply, likeUnlikeReplyToReply } from '../controllers/post.controller.js';


const router = express();


router.post("/create", protectRoutes, upload.single('image'), createPost);
router.post("/like/:id", protectRoutes, likeUnlikePost);
router.delete("/delete-post/:id", protectRoutes, deletePost);
router.put("/edit-post/:id", protectRoutes, updatePost);
router.get("/all", protectRoutes, getAllPost);
router.get("/yourpost/:id", protectRoutes, getPostById);
router.get("/liked", protectRoutes, getLikedPosts);

router.post("/like/comment/:id", protectRoutes, likeUnlikeComment);
router.post("/comment/:id", protectRoutes, commentOnPost);
router.put("/edit-comment/:id", protectRoutes, updateComment)
router.delete("/delete-comment/:id", protectRoutes, deleteCommentPost);
router.post("/comment/:commentId/reply", protectRoutes, replyOnComment);
router.post("/comment/:commentId/reply/:replyId", protectRoutes, replyOnReply);
router.post("/comment/:commentId/reply/:replyId/like", protectRoutes, likeUnlikeReply);
router.post("/comment/:commentId/reply/:parentReplyId/reply/:replyId/like", protectRoutes, likeUnlikeReplyToReply);


// router.post("/shared/:id", protectRoutes, sharedPost)
// router.get("/shared/user/:id", protectRoutes, getAllSharedPostsByUser);




export default router;