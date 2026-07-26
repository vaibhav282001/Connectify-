import { BASE_URL, clientServer } from '@/config';
import DashboardLayout from '@/layout/DashboardLayout';
import UserLayout from '@/layout/UserLayout';
import React, { useEffect, useState } from 'react';
import styles from "./index.module.css";
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { getAllPosts } from '@/config/redux/action/postAction';
import { getMyConnectionRequests, sendConnectionRequest, AcceptConnection } from '@/config/redux/action/authAction';

export default function ViewProfilePage({ userProfile }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const postReducer = useSelector((state) => state.posts);
  const authState = useSelector((state) => state.auth);

  const [userPosts, setUserPosts] = useState([]);

  const getUserPost = async () => {
    const token = localStorage.getItem("token");
    dispatch(getAllPosts());
    if (token) {
      dispatch(getMyConnectionRequests({ token }));
    }
  };

  useEffect(() => {
    if (!router.query.username) return;
    const posts = postReducer.posts.filter((post) => {
      return post.userId?.username === router.query.username;
    });
    setUserPosts(posts);
  }, [postReducer.posts, router.query.username]);

  useEffect(() => {
    getUserPost();
  }, [router.query.username]);

  // Determine connection status with the viewed user profile
  const getConnectionStatus = () => {
    if (!userProfile || !authState.user || !authState.user.userId) return "connect";
    const viewedUserId = userProfile.userId._id;
    const currentUserId = authState.user.userId._id;
    
    if (viewedUserId === currentUserId) return "self";

    // 1. Accepted connection
    const isAccepted = authState.connections.some(conn => 
      (conn.userId?._id === viewedUserId || conn.connectionId?._id === viewedUserId)
    );
    if (isAccepted) return "connected";

    // 2. Pending request sent by current user
    const isPendingSent = authState.pendingSent.some(conn => 
      conn.connectionId?._id === viewedUserId
    );
    if (isPendingSent) return "pending";

    // 3. Pending request received (sent to current user)
    const isPendingReceived = authState.connectionRequests.some(conn => 
      conn.userId?._id === viewedUserId
    );
    if (isPendingReceived) return "accept";

    return "connect";
  };

  const handleConnect = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    try {
      await dispatch(sendConnectionRequest({ token, user_id: userProfile.userId._id })).unwrap();
    } catch(e) {
      // ignore duplicate request errors
    }
    // Always refresh the full connection state so UI updates immediately
    dispatch(getMyConnectionRequests({ token }));
  };

  const handleAccept = async () => {
    const token = localStorage.getItem("token");
    const request = authState.connectionRequests.find(
      (conn) => conn.userId?._id === userProfile.userId._id
    );
    if (request) {
      await dispatch(
        AcceptConnection({
          token,
          requestId: request._id,
          action: "accept",
        })
      );
      dispatch(getMyConnectionRequests({ token }));
    }
  };

  if (!userProfile) {
    return (
      <UserLayout>
        <DashboardLayout>
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
            <h2 className="pulse-animation">Locating User Node...</h2>
          </div>
        </DashboardLayout>
      </UserLayout>
    );
  }

  const status = getConnectionStatus();

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.backDropContainer}>
            {userProfile.userId?.profileBanner && (
              <img
                className={styles.bannerImg}
                src={`${BASE_URL}/${userProfile.userId.profileBanner}`}
                alt="Profile Cover Banner"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}
            <img
              className={styles.backDrop}
              src={userProfile.userId?.profilePicture ? `${BASE_URL}/${userProfile.userId.profilePicture}` : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
              alt={userProfile.userId?.name}
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80";
              }}
            />
          </div>

          <div className={styles.profileContainer__details}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", flexWrap: "wrap" }}>
                <h2 style={{ fontSize: "1.8rem", fontWeight: "800", color: "var(--text-primary)" }}>{userProfile.userId?.name}</h2>
                <p style={{ color: "var(--accent-cyan)", fontWeight: "600" }}>@{userProfile.userId?.username}</p>
              </div>
              <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)" }}>{userProfile.currentPost || "No professional headline set"}</p>

              <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", marginTop: "0.5rem" }}>
                {status === "connect" && (
                  <button className={styles.connectBtn} onClick={handleConnect}>
                    Connect Node
                  </button>
                )}
                {status === "pending" && (
                  <button className={styles.connectedButton}>
                    Request Sent
                  </button>
                )}
                {status === "accept" && (
                  <button className={styles.connectBtn} onClick={handleAccept}>
                    Accept Request
                  </button>
                )}
                {status === "connected" && (
                  <button className={styles.connectedButton}>
                    Connected Partner
                  </button>
                )}

                <div 
                  onClick={async () => {
                    try {
                      const response = await clientServer.get(`/user/download_resume?id=${userProfile.userId?._id}`);
                      window.open(`${BASE_URL}/${response.data.message}`, "_blank");
                    } catch (err) {
                      alert("Resume profile download not available.");
                    }
                  }} 
                  style={{ cursor: "pointer", color: "var(--accent-cyan)", display: "flex", alignItems: "center" }}
                  title="Download Profile Resume"
                >
                  <svg style={{ width: "1.6rem", height: "1.6rem" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                </div>
              </div>

              <div style={{ marginTop: "1rem", borderTop: "1px solid var(--glass-border)", paddingTop: "1rem" }}>
                <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>{userProfile.bio || "No summary provided."}</p>
              </div>
            </div>

            <div style={{ marginTop: "1.5rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "0.5rem" }}>Recent Node Activities</h3>
              {userPosts.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No recent transmissions published.</p>
              ) : (
                userPosts.map((post) => (
                  <div key={post._id} className={styles.postCard}>
                    <div className={styles.card}>
                      <div className={styles.card__profileContainer}>
                        {post.media ? (
                          <img src={`${BASE_URL}/${post.media}`} alt="Transmission Attachment" />
                        ) : (
                          <div style={{ width: "100%", height: "100%", background: "var(--glass-bg)" }}></div>
                        )}
                      </div>
                      <p style={{ flex: 1, color: "var(--text-secondary)", fontSize: "0.95rem" }}>{post.body}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={{ marginTop: "1rem", borderTop: "1px solid var(--glass-border)", paddingTop: "1.5rem" }}>
            <h4 style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--text-primary)", marginBottom: "0.8rem" }}>Work Background</h4>
            <div className={styles.workHistoryContainer}>
              {(!userProfile.pastWork || userProfile.pastWork.length === 0) ? (
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No experience listed.</p>
              ) : (
                userProfile.pastWork.map((work, index) => (
                  <div key={index} className={styles.workHistoryCard}>
                    <p style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "0.95rem" }}>{work.company} &mdash; {work.position}</p>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.2rem" }}>{work.years}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}



export async function getServerSideProps(context) {
  try {
    const request = await clientServer.get("/user/get_profile_based_on_username", {
      params: {
        username: context.query.username
      }
    });
    return { props: { userProfile: request.data.profile || null } };
  } catch (err) {
    console.error("Error in view profile SSR:", err.message);
    return { props: { userProfile: null } };
  }
}
