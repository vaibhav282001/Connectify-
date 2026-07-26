import Profile from "../models/profile.model.js";
import Post from "../models/posts.model.js";
import User from "../models/user.model.js";
import Comment from "../models/comments.model.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

import bcrypt from 'bcrypt';


export const activeCheck = async (req, res, next) => {

    return res.status(200).json({ message: "Running" });
};


export const createPost = async (req, res) => {
    const {token} = req.body;
   
    try {
        const user = await User.findOne({ token: token });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let mediaUrl = "";
        let fileType = "";
        if (req.file) {
            mediaUrl = await uploadToCloudinary(req.file.buffer, 'posts');
            fileType = req.file.mimetype.split("/")[1];
        }

        const post = new Post({
            userId : user._id,
            body: req.body.body,
            media: mediaUrl,
            fileType : fileType
        })

        await post.save();

        return res.status(200).json({ message : "Post Created" })
    
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getAllPosts = async (req, res) =>{
    try{
        const posts = await Post.find().populate('userId', 'name username email profilePicture profileBanner')
        return res.json({ posts })
    }catch (err) {
        return res.status(500).json({ message: err.message})
    }
    
}

export const deletePost = async (req, res) => {
    const { postId } = req.params;
    const { token } = req.body;

    try {
        const user = await User.findOne({ token: token }).select('_id');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await Post.deleteOne({ _id: postId });
        return res.status(200).json({ message: "Post deleted" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


export const get_comments_by_post = async (req, res) => {
    const post_id = req.query.post_id || req.query.postId;

    try {
        const comments = await Comment.find({ postId: post_id })
            .populate("userId", "name username profilePicture profileBanner")
            .populate("replies.userId", "name username profilePicture profileBanner");

        return res.json({ comments: comments || [] });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


export const delete_comment_of_user = async (req, res) => {

    const { commentId, token } = req.body;

    try {

        const user = await User.findOne({ token: token }).select('_id');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const comment = await Comment.findOne({ _id: commentId, userId: user._id });
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (comment.userId.toString() !== user._id.toString()) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await Comment.deleteOne({ _id: commentId });

        return res.status(200).json({ message: "Comment deleted" });


    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const increment_likes = async (req, res) => {

    const { postId } = req.body;

    try {
        const post = await Post.findOne({ _id: postId });
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        post.likes += 1;
        await post.save();
        return res.status(200).json({ message: "Like incremented" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
