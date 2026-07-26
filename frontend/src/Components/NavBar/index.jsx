import React, { useEffect, useState } from "react";
import styles from "./Styles.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { reset } from "@/config/redux/reducer/authReducer";

export default function NavBarComponent() {
  const router = useRouter();
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("app_theme") || "dark";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("app_theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    dispatch(reset());
    router.push("/login");
  };

  const handleLogoClick = () => {
    if (localStorage.getItem("token")) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.navBar}>
        <h1 className={styles.logo} onClick={handleLogoClick}>
          Connectify <span style={{ fontSize: '0.8rem', verticalAlign: 'super', color: 'var(--accent-cyan)' }}>NEXT</span>
        </h1>

        <div className={styles.navBarOptionContainer}>
          <button 
            onClick={toggleTheme} 
            className={styles.themeToggleBtn} 
            title={`Switch to ${theme === 'dark' ? 'Light Glassmorphic' : 'Neon Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="18" height="18">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21m8.966-8.966h-2.25m-13.5 0h-2.25m15.364-6.364l-1.591 1.591M6.758 17.242l-1.591 1.591m12.728 0l-1.591-1.591M6.758 6.758L5.167 5.167M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" />
                </svg>
                <span>Light</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" width="18" height="18">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
                <span>Dark</span>
              </>
            )}
          </button>

          {authState.profileFetched && authState.user && (
            <div className={styles.navLinks}>
              <p className={styles.welcomeText}>
                <span>{authState.user.userId?.name}</span>
              </p>
              <button
                className={styles.disconnectBtn}
                onClick={() => {
                  localStorage.removeItem("token");
                  router.push("/login");
                }}
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}