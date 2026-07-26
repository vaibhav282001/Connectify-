import { Router } from 'express';
import { activeCheck } from '../controllers/posts.controller.js';
import multer from 'multer';
import { getAllPosts } from '../controllers/posts.controller.js';
import { createPost } from '../controllers/posts.controller.js';
import { deletePost } from '../controllers/posts.controller.js';
import { commentPost, replyComment } from '../controllers/user.controller.js';
import { get_comments_by_post } from '../controllers/posts.controller.js';
import { increment_likes } from '../controllers/posts.controller.js';
import { delete_comment_of_user } from '../controllers/posts.controller.js';

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.route('/').post(activeCheck);

router.route("/post").post(upload.single('media'),createPost)
router.route("/posts").get(getAllPosts)
router.route("/delete_post/:postId").delete(deletePost);
router.route("/comment").post(commentPost)
router.route("/reply_comment").post(replyComment)
router.route("/get_comments").get(get_comments_by_post)
router.route("/increment_post_like").post(increment_likes)
router.route("/delete_comment").post(delete_comment_of_user);

export default router;