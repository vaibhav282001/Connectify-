import React, { useEffect, useState } from 'react';
import UserLayout from '@/layout/UserLayout';
import DashboardLayout from '@/layout/DashboardLayout';
import { useDispatch, useSelector } from 'react-redux';
import { getMyConnectionRequests, AcceptConnection } from '@/config/redux/action/authAction';
import { useRouter } from 'next/router';
import { getImageUrl } from "@/config";
import styles from "./style.module.css";

export default function MyConnectionsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const authState = useSelector((state) => state.auth);
  
  // tabs: "requests" | "sent" | "network"
  const [activeTab, setActiveTab] = useState("requests");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getMyConnectionRequests({ token }));
    }
  }, [dispatch]);

  const handleAction = async (requestId, actionType) => {
    const token = localStorage.getItem("token");
    await dispatch(
      AcceptConnection({
        token,
        requestId,
        action: actionType
      })
    );
    dispatch(getMyConnectionRequests({ token }));
  };

  // Helper to extract the connection partner details
  const getPartner = (conn) => {
    if (!authState.user || !authState.user.userId) return null;
    const currentUserId = authState.user.userId._id;
    if (conn.userId?._id === currentUserId) {
      return conn.connectionId;
    }
    return conn.userId;
  };

  const EmptyState = ({ icon, text }) => (
    <div className={styles.emptyState}>
      {icon}
      <p>{text}</p>
    </div>
  );

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <h1 className={styles.title}>Network Portal</h1>

          {/* Tab Selection */}
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === "requests" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("requests")}
            >
              Pending Incoming
              {authState.connectionRequests?.length > 0 && (
                <span className={styles.badge}>{authState.connectionRequests.length}</span>
              )}
            </button>

            <button 
              className={`${styles.tab} ${activeTab === "sent" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("sent")}
            >
              Requests Sent
              {authState.pendingSent?.length > 0 && (
                <span className={`${styles.badge} ${styles.badgePurple}`}>
                  {authState.pendingSent.length}
                </span>
              )}
            </button>

            <button 
              className={`${styles.tab} ${activeTab === "network" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("network")}
            >
              My Network
              {authState.connections?.length > 0 && (
                <span className={`${styles.badge} ${styles.badgeCyan}`}>
                  {authState.connections.length}
                </span>
              )}
            </button>
          </div>

          {/* Active Tab View */}
          <div className={styles.list}>

            {/* ── Pending Incoming ── */}
            {activeTab === "requests" && (
              <>
                {(!authState.connectionRequests || authState.connectionRequests.length === 0) ? (
                  <EmptyState
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                      </svg>
                    }
                    text="No pending connection requests found."
                  />
                ) : (
                  authState.connectionRequests.map((req) => (
                    <div className={styles.card} key={req._id}>
                      <img 
                        className={styles.avatar} 
                        src={req.userId?.profilePicture ? getImageUrl(req.userId.profilePicture) : `https://ui-avatars.com/api/?name=${encodeURIComponent(req.userId?.name || 'U')}&background=0d1117&color=00f0ff`}
                        alt={req.userId?.name}
                        onClick={() => router.push(`/view_profile/${req.userId?.username}`)}
                      />
                      <div className={styles.info} onClick={() => router.push(`/view_profile/${req.userId?.username}`)}>
                        <h2 className={styles.name}>{req.userId?.name || "Unknown"}</h2>
                        <p className={styles.username}>@{req.userId?.username || "anonymous"}</p>
                        <span className={styles.subtext}>wants to connect with you</span>
                      </div>
                      <div className={styles.actions}>
                        <button className={styles.acceptBtn} onClick={() => handleAction(req._id, "accept")}>
                          Accept
                        </button>
                        <button className={styles.ignoreBtn} onClick={() => handleAction(req._id, "reject")}>
                          Ignore
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {/* ── Requests Sent (Pending Outgoing) ── */}
            {activeTab === "sent" && (
              <>
                {(!authState.pendingSent || authState.pendingSent.length === 0) ? (
                  <EmptyState
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                      </svg>
                    }
                    text="You haven't sent any connection requests yet."
                  />
                ) : (
                  authState.pendingSent.map((req) => (
                    <div className={styles.card} key={req._id}>
                      <img 
                        className={styles.avatar} 
                        src={req.connectionId?.profilePicture ? getImageUrl(req.connectionId.profilePicture) : `https://ui-avatars.com/api/?name=${encodeURIComponent(req.connectionId?.name || 'U')}&background=0d1117&color=bd00ff`}
                        alt={req.connectionId?.name}
                        onClick={() => router.push(`/view_profile/${req.connectionId?.username}`)}
                      />
                      <div className={styles.info} onClick={() => router.push(`/view_profile/${req.connectionId?.username}`)}>
                        <h2 className={styles.name}>{req.connectionId?.name || "Unknown"}</h2>
                        <p className={styles.username}>@{req.connectionId?.username || "anonymous"}</p>
                        <span className={`${styles.subtext} ${styles.subtextPending}`}>Request pending · awaiting response</span>
                      </div>
                      <div className={styles.actions}>
                        <button className={styles.pendingTagBtn} disabled>
                          <span className={styles.pendingDot} />
                          Pending
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {/* ── My Network (Accepted) ── */}
            {activeTab === "network" && (
              <>
                {(!authState.connections || authState.connections.length === 0) ? (
                  <EmptyState
                    icon={
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 12.75 0Zm3.858-5.067a5.06 5.06 0 0 1 1.083-1.917 5.074 5.074 0 0 1 4.795-1.455M14 8.25a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM21 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    }
                    text="No connections yet. Accept requests or have someone accept yours to build your network."
                  />
                ) : (
                  authState.connections.map((conn) => {
                    const partner = getPartner(conn);
                    if (!partner) return null;
                    return (
                      <div className={styles.card} key={conn._id}>
                        <img 
                          className={styles.avatar} 
                          src={partner.profilePicture ? getImageUrl(partner.profilePicture) : `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name || 'U')}&background=0d1117&color=00f0ff`}
                          alt={partner.name}
                          onClick={() => router.push(`/view_profile/${partner.username}`)}
                        />
                        <div className={styles.info} onClick={() => router.push(`/view_profile/${partner.username}`)}>
                          <h2 className={styles.name}>{partner.name}</h2>
                          <p className={styles.username}>@{partner.username}</p>
                          <span className={`${styles.subtext} ${styles.subtextConnected}`}>
                            <span className={styles.connectedDot} /> Connected
                          </span>
                        </div>
                        <div className={styles.actions}>
                          <button
                            className={styles.profileBtn}
                            onClick={() => router.push(`/view_profile/${partner.username}`)}
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}

          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
