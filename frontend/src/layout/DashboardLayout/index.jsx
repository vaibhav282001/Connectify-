import React, { useEffect, useState } from "react";
import styles from "./index.module.css";
import { useRouter } from "next/router";
import { setTokenIsThere } from "@/config/redux/reducer/authReducer";
import { useDispatch, useSelector } from "react-redux";
import { getMyConnectionRequests, sendConnectionRequest, AcceptConnection, getAllUsers } from "@/config/redux/action/authAction";
import { BASE_URL } from "@/config";

function DashboardLayout({ children }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  // "feed" | "suggest" — only used on mobile to toggle which panel is visible
  const [mobileTab, setMobileTab] = useState("feed");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    dispatch(setTokenIsThere());
    dispatch(getMyConnectionRequests({ token }));
    dispatch(getAllUsers());
  }, [router, dispatch]);

  // Reset to feed view when the route changes (e.g. navigating to discover)
  useEffect(() => {
    setMobileTab("feed");
  }, [router.pathname]);

  const handleConnect = async (profileUserId) => {
    const token = localStorage.getItem("token");
    await dispatch(sendConnectionRequest({ token, user_id: profileUserId }));
    dispatch(getMyConnectionRequests({ token }));
  };

  const handleAccept = async (profileUserId) => {
    const token = localStorage.getItem("token");
    const request = authState.connectionRequests.find(
      (conn) => conn.userId?._id === profileUserId
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

  const getConnectionStatus = (profileUserId) => {
    if (!authState.user || !authState.user.userId) return "connect";
    const currentUserId = authState.user.userId._id;
    if (currentUserId === profileUserId) return "self";

    const isAccepted = authState.connections.some(conn =>
      (conn.userId?._id === profileUserId || conn.connectionId?._id === profileUserId)
    );
    if (isAccepted) return "connected";

    const isPendingSent = authState.pendingSent.some(conn =>
      conn.connectionId?._id === profileUserId
    );
    if (isPendingSent) return "pending";

    const isPendingReceived = authState.connectionRequests.some(conn =>
      conn.userId?._id === profileUserId
    );
    if (isPendingReceived) return "accept";

    return "connect";
  };

  const currentPath = router.pathname;

  return (
    <div className="container">
      <div className={styles.homeContainer}>

        {/* ── Left Column (bottom nav always stays visible on mobile) ── */}
        <div className={styles.homeContainer__leftColumn}>
          {/* Profile Mini Card — hide when showing suggestions on mobile */}
          {authState.user && mobileTab !== "suggest" && (
            <div className={styles.profileMiniCard}>
              <div
                className={styles.miniCardBanner}
                onClick={() => router.push("/profile")}
                style={
                  authState.user.userId?.profileBanner
                    ? { backgroundImage: `url(${BASE_URL}/${authState.user.userId.profileBanner})`, backgroundSize: "cover", backgroundPosition: "center" }
                    : {}
                }
              />
              <div className={styles.miniCardAvatarWrap} onClick={() => router.push("/profile")}>
                <img
                  className={styles.miniCardAvatar}
                  src={
                    authState.user.userId?.profilePicture
                      ? `${BASE_URL}/${authState.user.userId.profilePicture}`
                      : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
                  }
                  alt={authState.user.userId?.name}
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80";
                  }}
                />
              </div>
              <div className={styles.miniCardInfo}>
                <p className={styles.miniCardName} onClick={() => router.push("/profile")}>
                  {authState.user.userId?.name}
                </p>
                <p className={styles.miniCardHeadline}>
                  {authState.user.currentPost || "Add a headline"}
                </p>
                <button
                  className={styles.miniCardExpBtn}
                  onClick={() => router.push("/profile")}
                >
                  <span>＋</span> Experience
                </button>
              </div>
            </div>
          )}

          {/* ── Nav Links (Bottom Bar on Mobile) ── */}
          <div className={styles.homeContainer__leftBar}>
            {/* Feed */}
            <div
              onClick={() => { setMobileTab("feed"); router.push("/dashboard"); }}
              className={`${styles.sideBarOption} ${currentPath === "/dashboard" && mobileTab !== "suggest" ? styles.sideBarOptionActive : ""}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              <p>Feed</p>
            </div>

            {/* Discover */}
            <div
              onClick={() => { setMobileTab("feed"); router.push("/discover"); }}
              className={`${styles.sideBarOption} ${currentPath === "/discover" ? styles.sideBarOptionActive : ""}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <p>Discover</p>
            </div>

            {/* Connections */}
            <div
              onClick={() => { setMobileTab("feed"); router.push("/my_connections"); }}
              className={`${styles.sideBarOption} ${currentPath === "/my_connections" ? styles.sideBarOptionActive : ""}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              <p>Connections</p>
            </div>

            {/* Suggestions — mobile only tab */}
            <div
              onClick={() => setMobileTab("suggest")}
              className={`${styles.sideBarOption} ${styles.mobileOnlySuggestions} ${mobileTab === "suggest" ? styles.sideBarOptionActive : ""}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
              </svg>
              <p>Suggest</p>
            </div>
          </div>
        </div>

        {/* ── Feed / Children ── */}
        <div
          className={styles.homeContainer__feedContainer}
          style={mobileTab === "suggest" ? { display: "none" } : {}}
        >
          {children}
        </div>

        {/* ── Suggestions Panel ── */}
        {/* On desktop: always visible. On mobile: only visible when mobileTab === "suggest" */}
        <div
          id="suggestions-panel"
          className={`${styles.homeContainer__extraContainer} ${mobileTab === "suggest" ? styles.mobileSuggestionsVisible : ""}`}
        >

          <h3>Suggestions</h3>

          {authState.all_profiles_fetched && authState.user &&
            authState.all_users
              .filter(p => p.userId?._id !== authState.user.userId?._id)
              .slice(0, 6)
              .map((profile) => {
                const status = getConnectionStatus(profile.userId?._id);
                return (
                  <div key={profile._id} className={styles.extraContainer__profile}>
                    <div
                      className={styles.profileInfo}
                      onClick={() => router.push(`/view_profile/${profile.userId?.username}`)}
                    >
                      <img
                        src={profile.userId?.profilePicture ? `${BASE_URL}/${profile.userId.profilePicture}` : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"}
                        alt={profile.userId?.name}
                        className={styles.profileAvatar}
                      />
                      <div className={styles.profileDetails}>
                        <span className={styles.profileName}>{profile.userId?.name}</span>
                        <span className={styles.profileUsername}>@{profile.userId?.username}</span>
                      </div>
                    </div>

                    {status === "connect" && (
                      <button className={styles.connectButton} onClick={() => handleConnect(profile.userId?._id)}>
                        Connect
                      </button>
                    )}
                    {status === "pending" && (
                      <button className={styles.pendingButton} disabled>Sent</button>
                    )}
                    {status === "accept" && (
                      <button className={styles.acceptButton} onClick={() => handleAccept(profile.userId?._id)}>
                        Accept
                      </button>
                    )}
                    {status === "connected" && (
                      <button className={styles.connectedButton}>Connected</button>
                    )}
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
