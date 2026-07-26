import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import Profile from "../models/profile.model.js";
import crypto from "node:crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import ConnectionRequest from "../models/connections.model.js";
import Comment from "../models/comments.model.js";
import Post from "../models/posts.model.js";

const convertUserDataToPDF = async (userData) => {

    const doc = new PDFDocument();

    const outputPath = crypto.randomBytes(16).toString("hex") + ".pdf";
    const stream = fs.createWriteStream("uploads/" + outputPath);
    doc.pipe(stream);
   if (userData.userId.profilePicture) {
    doc.image(
        `uploads/${userData.userId.profilePicture}`,
        {
            fit: [150, 150],
            align: "center",
        }
    );
}
    doc.fontSize(14).text(`Name: ${userData.userId.name}`, {
        align: "center",
    });
    doc.fontSize(14).text(`Username: ${userData.userId.username}`, {
        align: "center",
    });
    doc.fontSize(14).text(`Email: ${userData.userId.email}`, {
        align: "center",
    });
    doc.fontSize(14).text(`Bio: ${userData.bio}`, {
        align: "center",
    });
    doc.fontSize(14).text(`Current Position: ${userData.currentPost}`, {
    align: "center",
});
    doc.fontSize(14).text(`Past Work: ${userData.pastWork.length}`, {
        align: "center",
    });
    userData.pastWork.forEach((work, index) => {
        doc.fontSize(14).text(`Company Name: ${work.company}`, {
            align: "left",
            indent: 20,
        });
        doc.fontSize(14).text(`Position: ${work.position}`, {
            align: "left",
            indent: 20,
        });
        doc.fontSize(14).text(`Years: ${work.years}`, {
            align: "left",
            indent: 20,
        });
    });

    doc.end();

    await new Promise((resolve) => {
        stream.on("finish", resolve);
    });

    return outputPath;
}


export const register = async (req, res) => {

    try{
        const {name, email, password, username} = req.body;
        if(!name || !email || !password || !username){
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if(user){
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            username
        });

        const profile = new Profile({
            userId: newUser._id,
        });
        await newUser.save();
        await profile.save();
        return res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error in registration controller:", error);
        return res.status(500).json({ message: "Internal server error" });
    }

};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const token = crypto.randomBytes(64).toString("hex");

        user.token = token;
        await user.save();

        return res.json({ token });

    } catch (error) {
        console.error("Error in login controller:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const uploadProfilePicture = async (req, res) => {
    const {token} = req.body;

    try {
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        user.profilePicture = req.file.filename;
        await user.save();

        return res.json({ message: "Profile picture updated successfully" });
    }     catch (error) {
        console.error("Error in update profile picture controller:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const uploadProfileBanner = async (req, res) => {
    const { token } = req.body;

    try {
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No banner file provided" });
        }

        user.profileBanner = req.file.filename;
        await user.save();

        return res.json({ message: "Profile banner updated successfully", profileBanner: req.file.filename });
    } catch (error) {
        console.error("Error in update profile banner controller:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateProfilePicture = async (req, res) => {
    try{

        const { token, ...newUserData } = req.body;

        const user = await User.findOne({ token });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const query = [];
        if (newUserData.username) query.push({ username: newUserData.username });
        if (newUserData.email) query.push({ email: newUserData.email });

        if (query.length > 0) {
            const existingUser = await User.findOne({ $or: query });
            if (existingUser && existingUser._id.toString() !== user._id.toString()) {
                return res.status(400).json({ message: "Email or username already in use" });
            }
        }

        if (newUserData.name) user.name = newUserData.name;
        if (newUserData.username) user.username = newUserData.username;
        if (newUserData.email) user.email = newUserData.email;

        await user.save();

        return res.json({ message: "Profile updated successfully" });

    }
    catch (error) {
        console.error("Error in update profile picture controller:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const getUserAndProfile = async (req, res) => {
    try {
        const { token } = req.query;

        console.log(`token: ${token}`);

        const user = await User.findOne({ token });

        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        let userProfile = await Profile.findOne({ userId: user._id })
        .populate("userId", "name email username profilePicture profileBanner");

        if (!userProfile) {
            userProfile = new Profile({
                userId: user._id,
                bio: "",
                currentPost: "",
                pastWork: [],
                education: []
            });
            await userProfile.save();
            userProfile = await Profile.findOne({ userId: user._id })
            .populate("userId", "name email username profilePicture profileBanner");
        }

        return res.json({ user: userProfile });
        

    } catch (error) {
        console.error("Error in get user and profile controller:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const updateProfileData = async (req, res) => {
    try {
        const { token, ...newUserData } = req.body;

        const user = await User.findOne({ token });

        if (!user) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const profile_to_Update = await Profile.findOne({
            userId: user._id
        });

        if (!profile_to_Update) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        Object.assign(profile_to_Update, newUserData);

        await profile_to_Update.save();

        return res.json({
            message: "Profile updated successfully"
        });

    } catch (error) {
        console.error("Error in update profile data controller:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


export const getAllUserProfile = async (req, res) => {

    try {
        const profiles = await Profile.find().populate("userId", "name email username profilePicture profileBanner");
        return res.json({ profiles });
    } catch (error) {
        console.error("Error in get all user profiles controller:", error);
        return res.status(500).json({ message: "Internal server error" });  
    }
};

export const downloadProfile = async (req, res) => {

    console.log("Download API Hit");
    const user_id = req.query.id;

    console.log("User ID:", user_id);
    const userProfile = await Profile.findOne({ userId: user_id })
        .populate("userId", "name email username profilePicture profileBanner");

    if (!userProfile) {
        return res.status(404).json({
            message: "Profile not found"
        });
    }

    console.log("Profile:", userProfile)
    let outputPath = await convertUserDataToPDF(userProfile);

    console.log("PDF Generated:", outputPath);
    return res.json({
        message: outputPath
    });
};



export const sendConnectionRequest = async (req, res) => {
    const { token, connectionId } = req.body;

    try {
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!connectionId) {
            return res.status(400).json({ message: "Invalid connection ID" });
        }

        if (user._id.toString() === connectionId.toString()) {
            return res.status(400).json({ message: "You cannot connect with yourself" });
        }

        const connectionUser = await User.findById(connectionId);
        if (!connectionUser) {
            return res.status(404).json({ message: "Connection user not found" });
        }

        // Check if a request already exists in either direction
        const existingRequest = await ConnectionRequest.findOne({
            $or: [
                { userId: user._id, connectionId: connectionId },
                { userId: connectionId, connectionId: user._id }
            ]
        });

        if (existingRequest) {
            if (existingRequest.status_accepted === true) {
                return res.status(400).json({ message: "Already connected" });
            }
            return res.status(400).json({ message: "Connection request already sent or pending" });
        }

        const request = new ConnectionRequest({
            userId: user._id,
            connectionId: connectionId,
            status_accepted: null
        });
        await request.save();

        return res.status(200).json({
            message: "Connection request sent successfully"
        });
    }
    catch (error) {
        console.error("Error in send connection request controller:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getMyConnectionRequests = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Get requests received by the user that are still pending (status_accepted: null)
        const pendingReceived = await ConnectionRequest.find({
            connectionId: user._id,
            status_accepted: null
        }).populate("userId", "name email username profilePicture profileBanner");

        // Get requests sent by the user that are still pending
        const allPendingSent = await ConnectionRequest.find({
            userId: user._id,
            status_accepted: null
        }).populate("connectionId", "name email username profilePicture profileBanner");

        const pendingSent = allPendingSent.filter(req => req.connectionId != null);

        // Get all accepted connections
        const accepted = await ConnectionRequest.find({
            $or: [
                { userId: user._id, status_accepted: true },
                { connectionId: user._id, status_accepted: true }
            ]
        }).populate("userId", "name email username profilePicture profileBanner")
          .populate("connectionId", "name email username profilePicture profileBanner");
        
        return res.json({ 
            connections: pendingReceived,
            pendingReceived,
            pendingSent,
            accepted
        });
    } catch (error) {
        console.error("Error in get my connection requests controller:", error);
        return res.status(500).json({ message: "Internal server error" });
    }   
};

export const whatAreMyConnections = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Get all accepted connections in either direction
        const connections = await ConnectionRequest.find({
            $or: [
                { userId: user._id, status_accepted: true },
                { connectionId: user._id, status_accepted: true }
            ]
        }).populate("userId", "name email username profilePicture profileBanner")
          .populate("connectionId", "name email username profilePicture profileBanner");

        return res.json({ connections });
    } catch (error) {
        console.error("Error in get my connections controller:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const acceptConnectionRequest = async (req, res) => {

    const { token, requestId, action_type } = req.body;

    try {

        const user = await User.findOne({ token });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const connectionRequest = await ConnectionRequest.findOne({ _id: requestId });

        if (!connectionRequest) {
            return res.status(404).json({ message: "Connection request not found" });
        }

        if(action_type === "accept"){
            connectionRequest.status_accepted = true;
        }
        else if(action_type === "reject"){
            connectionRequest.status_accepted = false;
        }

        await connectionRequest.save();
        return res.json({ message: "Connection request updated successfully" });
    } catch (error) {
        console.error("Error in accept connection request controller:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const commentPost = async (req, res) => {
    const { token, postId, commentBody } = req.body;

    try {

        const user = await User.findOne({ token }).select('_id');

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const post = await Post.findById({ _id: postId });

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comment = new Comment({
            userId: user._id,
            postId: postId,
            body: commentBody
        });

        await comment.save();

        return res.status(200).json({ message: "Comment added successfully" });
    }
    catch (error) {
        console.error("Error in comment post controller:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getUserProfileAndUserBasedOnUsername = async (req, res) => {

    const { username } = req.query;

    try {
        const user = await User.findOne({
            username
        });

        if(!user) {
            return res.status(404).json({message : "User not found"})
        }

        const userProfile = await Profile.findOne({ userId: user._id})
        .populate('userId', 'name username email profilePicture profileBanner');

        return res.json({"profile" : userProfile})
    } catch (err) {
        return res.status(500).json({message: err.message})
    }
}

export const replyComment = async (req, res) => {
    const { token, commentId, replyBody } = req.body;

    try {
        const user = await User.findOne({ token }).select('_id');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        comment.replies.push({
            userId: user._id,
            body: replyBody
        });

        await comment.save();

        return res.status(200).json({ message: "Reply added successfully" });
    } catch (error) {
        console.error("Error in reply comment controller:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};