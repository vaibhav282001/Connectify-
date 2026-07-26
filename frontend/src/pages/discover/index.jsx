import React, { useEffect } from 'react';
import UserLayout from '@/layout/UserLayout';
import DashboardLayout from '@/layout/DashboardLayout';
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from '@/config/redux/action/authAction';
import styles from "./index.module.css";
import { BASE_URL } from "@/config";
import { useRouter } from 'next/router';

function DiscoverPage() {
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, [authState.all_profiles_fetched, dispatch]);

  return (
    <UserLayout>
      <DashboardLayout>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', color: '#111111', borderBottom: '1px solid rgba(0,240,255,0.1)', paddingBottom: '0.75rem' }}>
            Discover Network
          </h1>
          <div className={styles.allUserProfile}>
            {authState.all_profiles_fetched && authState.user &&
              authState.all_users
                .filter((profile) => profile.userId?._id !== authState.user.userId?._id)
                .map((profile) => {
                  return (
                    <div 
                      onClick={() => {
                        router.push(`/view_profile/${profile.userId?.username}`);
                      }}
                      key={profile._id} 
                      className={styles.userCard}
                    >
                      <img 
                        className={styles.userCard__image} 
                        src={profile.userId?.profilePicture ? `${BASE_URL}/${profile.userId.profilePicture}` : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"} 
                        alt={profile.userId?.name} 
                      />
                      <h2 className={styles.name}>{profile.userId?.name}</h2>
                      <p className={styles.username}>@{profile.userId?.username}</p>
                      <p className={styles.headline}>{profile.currentPost || "No professional headline set"}</p>
                    </div>
                  );
                })
            }
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}

export default DiscoverPage;