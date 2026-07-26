import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { 
  getAllPosts, 
  createPost, 
  deletePost, 
  incrementPostLike, 
  addComment,
  deleteComment
} from "@/config/redux/action/postAction";
import { getAboutUser, getAllUsers } from "@/config/redux/action/authAction";
import UserLayout from "@/layout/UserLayout";
import DashboardLayout from "@/layout/DashboardLayout";
import { setTokenIsThere } from "@/config/redux/reducer/authReducer";
import { getImageUrl, clientServer } from "@/config";
import styles from "./index.module.css";

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.posts);

  const [postContent, setPostContent] = useState("");
  const [fileContent, setFileContent] = useState(null);

  // Per-post comment state: { [postId]: { open, comments, replyingTo, loading } }
  const [commentSections, setCommentSections] = useState({});

  // Refs for comment inputs to avoid stale closure
  const commentInputRefs = React.useRef({});
  const replyInputRefs = React.useRef({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    dispatch(setTokenIsThere());
  }, [router, dispatch]);

  useEffect(() => {
    if (!authState.isTokenThere) return;
    const token = localStorage.getItem("token");
    dispatch(getAllPosts());
    dispatch(getAboutUser({ token }));
    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, [authState.isTokenThere, authState.all_profiles_fetched, dispatch]);

  const handleUpload = async () => {
    if (!postContent.trim() && !fileContent) return;
    await dispatch(createPost({ file: fileContent, body: postContent }));
    setPostContent("");
    setFileContent(null);
    dispatch(getAllPosts());
  };

  const handleLike = async (postId) => {
    await dispatch(incrementPostLike({ post_id: postId }));
    dispatch(getAllPosts());
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    await dispatch(deletePost({ postId })).unwrap();
    dispatch(getAllPosts());
  };

  // Direct API helper — fetches fresh comments for a post
  const fetchComments = async (postId) => {
    try {
      const res = await clientServer.get("/get_comments", {
        params: { post_id: postId }
      });
      return res.data.comments || [];
    } catch {
      return [];
    }
  };

  // Toggle comment section for a specific post
  const handleToggleComments = async (postId) => {
    const isOpen = commentSections[postId]?.open;

    if (isOpen) {
      setCommentSections(prev => ({ ...prev, [postId]: { ...prev[postId], open: false } }));
    } else {
      setCommentSections(prev => ({
        ...prev,
        [postId]: { open: true, comments: [], newComment: "", replyingTo: null, replyText: "", loading: true }
      }));
      const comments = await fetchComments(postId);
      setCommentSections(prev => ({ ...prev, [postId]: { ...prev[postId], comments, loading: false } }));
    }
  };

  const handleCommentInput = (postId, val) => {
    // No-op: we use refs now
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    // Read directly from the DOM ref to avoid stale closure
    const input = commentInputRefs.current[postId];
    const text = input?.value?.trim();
    if (!text) return;

    // Clear input immediately
    if (input) input.value = "";

    try {
      await clientServer.post("/comment", {
        token: localStorage.getItem("token"),
        postId,
        commentBody: text,
      });
    } catch (err) {
      console.error("Comment post failed:", err);
      return;
    }

    // Fetch fresh comments
    const comments = await fetchComments(postId);
    setCommentSections(prev => ({ ...prev, [postId]: { ...prev[postId], comments } }));
  };

  const handleDeleteComment = async (commentId, postId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await clientServer.post("/delete_comment", {
        token: localStorage.getItem("token"),
        commentId,
      });
    } catch (err) {
      console.error("Delete comment failed:", err);
      return;
    }
    const comments = await fetchComments(postId);
    setCommentSections(prev => ({ ...prev, [postId]: { ...prev[postId], comments } }));
  };

  const handleSetReplying = (postId, commentId) => {
    setCommentSections(prev => ({
      ...prev,
      [postId]: { ...prev[postId], replyingTo: commentId, replyText: "" }
    }));
  };

  const handleReplyInput = (postId, val) => {
    // No-op: we use refs now
  };

  const handleAddReply = async (e, postId, commentId) => {
    e.preventDefault();
    // Read directly from the DOM ref
    const input = replyInputRefs.current[commentId];
    const text = input?.value?.trim();
    if (!text) return;

    if (input) input.value = "";
    setCommentSections(prev => ({ ...prev, [postId]: { ...prev[postId], replyingTo: null } }));

    try {
      await clientServer.post("/reply_comment", {
        token: localStorage.getItem("token"),
        commentId,
        replyBody: text,
      });
    } catch (err) {
      console.error("Reply failed:", err);
      return;
    }

    const comments = await fetchComments(postId);
    setCommentSections(prev => ({ ...prev, [postId]: { ...prev[postId], comments } }));
  };

  if (!authState.user) {
    return (
      <UserLayout>
        <DashboardLayout>
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
            <h2 className="pulse-animation">Configuring Holo-Feed...</h2>
          </div>
        </DashboardLayout>
      </UserLayout>
    );
  }

  const myUserId = authState.user?.userId?._id;

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.scrollComponent}>

          {/* ── Post composer card ── */}
          <div className={styles.wrapper}>
            <div className={styles.createPostContainer}>
              {authState.profileFetched && authState.user?.userId?.profilePicture && (
                <img
                  className={styles.composerAvatar}
                  src={getImageUrl(authState.user.userId.profilePicture)}
                  alt="Your profile"
                />
              )}
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Share a futuristic update, project, or concept..."
                className={styles.textAreaOfContent}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label htmlFor="fileUpload" className={styles.Fab} aria-label="Upload file">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </label>
                <input id="fileUpload" type="file" hidden onChange={(e) => setFileContent(e.target.files?.[0] ?? null)} />
              </div>
              {(postContent.trim() || fileContent) && (
                <button type="button" onClick={handleUpload} className={styles.uploadButton}>
                  Publish
                </button>
              )}
            </div>
            {fileContent && (
              <span className={styles.selectedFileBadge}>File selected: {fileContent.name}</span>
            )}
          </div>

          {/* ── Feed Post List ── */}
          <div className={styles.postsContainer}>
            {(postState?.posts ?? []).map((post) => {
              const section = commentSections[post._id] || {};
              const isOpen = section.open || false;
              const isOwner = post.userId?._id && myUserId && post.userId._id === myUserId;

              return (
                <div key={post._id} className={styles.singleCard}>

                  {/* Author + delete */}
                  <div className={styles.singleCard_profileContainer}>
                    <div
                      className={styles.authorInfo}
                      onClick={() => router.push(`/view_profile/${post.userId?.username}`)}
                    >
                      {post.userId?.profilePicture && (
                        <img
                          className={styles.postAvatar}
                          src={getImageUrl(post.userId.profilePicture)}
                          alt={post.userId?.name ?? "User"}
                        />
                      )}
                      <div className={styles.authorMeta}>
                        <span className={styles.authorName}>{post.userId?.name ?? "Unknown"}</span>
                        <span className={styles.authorUsername}>@{post.userId?.username || "anonymous"}</span>
                      </div>
                    </div>
                    {isOwner && (
                      <button className={styles.deleteButton} onClick={() => handleDeletePost(post._id)} aria-label="Delete post">
                        <svg style={{ height: "1.4rem", width: "1.4rem" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Post body */}
                  {post.body && <p className={styles.postContent}>{post.body}</p>}
                  {post.media && (
                    <div className={styles.singleCard_image}>
                      <img src={getImageUrl(post.media)} alt="Attachment" />
                    </div>
                  )}

                  {/* Action bar */}
                  <div className={styles.optionsContainer}>
                    <div onClick={() => handleLike(post._id)} className={styles.singleOption__optionsContainer}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                      </svg>
                      <span>{post.likes} Likes</span>
                    </div>

                    <div
                      onClick={() => handleToggleComments(post._id)}
                      className={`${styles.singleOption__optionsContainer} ${isOpen ? styles.activeOption : ""}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                      </svg>
                      <span>{isOpen ? "Hide Comments" : "View Comments"}</span>
                    </div>

                    <div
                      onClick={() => {
                        const text = encodeURIComponent(post.body || "");
                        const url = encodeURIComponent(window.location.origin);
                        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, "_blank");
                      }}
                      className={styles.singleOption__optionsContainer}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                      </svg>
                      <span>Share</span>
                    </div>
                  </div>

                  {/* ── Inline Comment Section ── */}
                  {isOpen && (
                    <div className={styles.inlineCommentSection}>
                      {section.loading ? (
                        <p className={styles.commentEmptyText}>Loading comments...</p>
                      ) : (
                        <>
                          {/* Comment list */}
                          {(!section.comments || section.comments.length === 0) ? (
                            <p className={styles.commentEmptyText}>No comments yet. Be the first!</p>
                          ) : (
                            section.comments.map((comment) => {
                              const isCommentOwner = comment.userId?._id && myUserId && comment.userId._id === myUserId;
                              const isReplying = section.replyingTo === comment._id;

                              return (
                                <div key={comment._id} className={styles.inlineCommentCard}>
                                  {/* Comment header */}
                                  <div className={styles.inlineCommentHeader}>
                                    <img
                                      src={comment.userId?.profilePicture ? getImageUrl(comment.userId.profilePicture) : `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userId?.name || "U")}&background=0d1117&color=00f0ff`}
                                      alt={comment.userId?.name}
                                      className={styles.inlineCommentAvatar}
                                      onClick={() => comment.userId?.username && router.push(`/view_profile/${comment.userId.username}`)}
                                    />
                                    <div className={styles.inlineCommentMeta}>
                                      <span className={styles.inlineCommentName}>{comment.userId?.name || "Unknown"}</span>
                                      <span className={styles.inlineCommentUsername}>@{comment.userId?.username || "anonymous"}</span>
                                    </div>
                                    <div className={styles.inlineCommentActions}>
                                      <button
                                        className={styles.replyBtn}
                                        onClick={() => handleSetReplying(post._id, isReplying ? null : comment._id)}
                                      >
                                        {isReplying ? "Cancel" : "Reply"}
                                      </button>
                                      {isCommentOwner && (
                                        <button
                                          className={styles.deleteCommentBtn}
                                          onClick={() => handleDeleteComment(comment._id, post._id)}
                                          title="Delete comment"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "0.9rem", height: "0.9rem" }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                          </svg>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <p className={styles.inlineCommentBody}>{comment.body}</p>

                                  {/* Reply input */}
                                  {isReplying && (
                                    <form
                                      className={styles.replyForm}
                                      onSubmit={(e) => handleAddReply(e, post._id, comment._id)}
                                    >
                                      <input
                                        type="text"
                                        className={styles.replyInput}
                                        placeholder={`Reply to @${comment.userId?.username || "user"}...`}
                                        ref={(el) => { replyInputRefs.current[comment._id] = el; }}
                                        autoFocus
                                      />
                                      <button type="submit" className={styles.replySendBtn}>Send</button>
                                    </form>
                                  )}

                                  {/* Nested replies */}
                                  {comment.replies && comment.replies.length > 0 && (
                                    <div className={styles.repliesContainer}>
                                      {comment.replies.map((reply) => (
                                        <div key={reply._id} className={styles.replyCard}>
                                          <img
                                            src={reply.userId?.profilePicture ? getImageUrl(reply.userId.profilePicture) : `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.userId?.name || "U")}&background=0d1117&color=00f0ff`}
                                            alt={reply.userId?.name}
                                            className={styles.replyAvatar}
                                          />
                                          <div>
                                            <span className={styles.replyName}>{reply.userId?.name || "Unknown"}</span>
                                            <p className={styles.replyBody}>{reply.body}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}

                          {/* Add comment form */}
                          <form className={styles.inlineCommentForm} onSubmit={(e) => handleAddComment(e, post._id)}>
                            <input
                              type="text"
                              className={styles.inlineCommentInput}
                              placeholder="Write a comment..."
                              ref={(el) => { commentInputRefs.current[post._id] = el; }}
                            />
                            <button type="submit" className={styles.inlineCommentSend}>Post</button>
                          </form>
                        </>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
