
import React, { useEffect, useState } from "react";
import UserLayout from "@/layout/UserLayout";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import styles from "./style.module.css";

import {
  loginUser,
  registerUser,
} from "@/config/redux/action/authAction";

import {
  emptyMessage,
} from "@/config/redux/reducer/authReducer";

function LoginComponent() {
  const dispatch = useDispatch();
  const router = useRouter();

  const authState = useSelector((state) => state.auth);

  const [userLoginMethod, setUserLoginMethod] = useState(false);

  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  // Redirect after successful login
  useEffect(() => {
    if (authState.loggedIn) {
      router.push("/dashboard");
    }
  }, [authState.loggedIn, router]);

  // Clear previous messages when switching forms
  useEffect(() => {
    dispatch(emptyMessage());
  }, [userLoginMethod, dispatch]);

  const handleRegister = () => {
    console.log("Registering...");

    dispatch(
      registerUser({
        username,
        name,
        email,
        password,
      })
    );
  };

  const handleLogin = () => {
    console.log("Logging In...");

    dispatch(
      loginUser({
        email,
        password,
      })
    );
  };

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.cardContainer}>
          {/* LEFT SECTION */}
          <div className={styles.cardContainer__left}>
            <h1 className={styles.cardleft__heading}>
              {userLoginMethod ? "Sign In" : "Sign Up"}
            </h1>

            {authState.message && (
              <p
                className={styles.message}
                style={{
                  color: authState.isError ? "red" : "green",
                }}
              >
                {authState.message}
              </p>
            )}

            <div className={styles.inputContainer}>
              {!userLoginMethod && (
                <div className={styles.inputRow}>
                  <input
                    className={styles.inputField}
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />

                  <input
                    className={styles.inputField}
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <input
                className={styles.inputField}
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmailAddress(e.target.value)}
              />

              <input
                className={styles.inputField}
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                className={styles.buttonWithOutline}
                onClick={() => {
                  if (userLoginMethod) {
                    handleLogin();
                  } else {
                    handleRegister();
                  }
                }}
              >
                {userLoginMethod ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className={styles.cardContainer__right}>
            <div>
              <p style={{ margin: "6px" }}>
                {userLoginMethod
                  ? "Don't have an Account?"
                  : "Already have an Account?"}
              </p>

              <button
                type="button"
                className={`${styles.buttonWithOutline} ${styles.rightBtn}`}
                onClick={() => setUserLoginMethod((prev) => !prev)}
              >
                {userLoginMethod ? "Sign Up" : "Sign In"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

export default LoginComponent;