import { clientServer } from "@/config"
import { createAsyncThunk } from "@reduxjs/toolkit"



export const getAllPosts = createAsyncThunk(
    "post/getAllPosts",
    async (_, thunkAPI) => {
        try {

            const response = await clientServer.get('/posts');
            
            return thunkAPI.fulfillWithValue(response.data)

        } catch (err) {

            return thunkAPI.rejectWithValue(err.response?.data)

        }
    }
)

export const createPost = createAsyncThunk(
    "post/createPost",
    async (userData, thunkAPI) => {
        const {file, body} = userData;

        try{

            const formData = new FormData();
            formData.append('token', localStorage.getItem('token'))
            formData.append('body', body)
            formData.append('media', file)

            const response = await clientServer.post("/post", formData, {
                headers: {
                    'Content-Type' : 'multipart/form-data'
                }
            });

            if (response.status === 200){
                return thunkAPI.fulfillWithValue("Post Uploaded")
            } else {
                return thunkAPI.rejectWithValue("Post not Uploaded")
            }
        } catch (error) {

            return thunkAPI.rejectWithValue(error.response.data)

        }
    }
)

// export const deletePost = createAsyncThunk(
//     "post/deletePost",
//     async (PHASE_PRODUCTION_BUILD, thunkAPI) => {
//         try {
//             const response = await clientServer.delete("/delete_post" , {
//                 data: {
//                     token: localStorage.getItem("token"),
//                     post_id: post_id.post_id
//                 }
//             });
//             return thunkAPI.fulfillWithValue(response.data)
//         } catch (error) {
//             return thunkAPI.rejectWithValue("Something Went Wrong...")
//         }
//     }
// )

export const deletePost = createAsyncThunk(
  "post/deletePost",
  async ({ postId }, thunkAPI) => {
    try {
      const response = await clientServer.delete(`/delete_post/${postId}`, {
        data: {
          token: localStorage.getItem("token"),
        },
      });

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: error.message },
      );
    }
  },
);


export const incrementPostLike = createAsyncThunk(
    "post/incrementLike",
    async (post, thunkAPI) => {
        try {
            const response = await clientServer.post(`/increment_post_like`, {
                postId: post.post_id
            })

            return thunkAPI.fulfillWithValue(response.data);

        } catch (error) {
    return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message
    );
}
    }
)

export const getAllComments = createAsyncThunk(
    "post/getAllComments",
    async ({ postId }, thunkAPI) => {
        try {

            const response = await clientServer.get("/get_comments", {
                params: {
                    post_id: postId,
                },
            });

            return thunkAPI.fulfillWithValue({
                comments: response.data.comments,
                postId,
            });

        } catch (error) {

            return thunkAPI.rejectWithValue(
                error.response?.data || error.message
            );

        }
    }
);

export const addComment = createAsyncThunk(
    "post/addComment",
    async ({ postId, commentBody }, thunkAPI) => {
        try {
            const response = await clientServer.post("/comment", {
                token: localStorage.getItem("token"),
                postId,
                commentBody,
            });
            thunkAPI.dispatch(getAllComments({ postId }));
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || error.message
            );
        }
    }
);

export const deleteComment = createAsyncThunk(
    "post/deleteComment",
    async ({ commentId, postId }, thunkAPI) => {
        try {
            const response = await clientServer.post("/delete_comment", {
                token: localStorage.getItem("token"),
                commentId,
            });
            thunkAPI.dispatch(getAllComments({ postId }));
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || error.message
            );
        }
    }
);

export const addReply = createAsyncThunk(
    "post/addReply",
    async ({ commentId, postId, replyBody }, thunkAPI) => {
        try {
            const response = await clientServer.post("/reply_comment", {
                token: localStorage.getItem("token"),
                commentId,
                replyBody,
            });
            thunkAPI.dispatch(getAllComments({ postId }));
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data || error.message
            );
        }
    }
);