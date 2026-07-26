import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    body: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const commentSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,   
        ref: 'Post',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    body: {
        type: String,
        required: true
    },  
    replies: [replySchema]
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;