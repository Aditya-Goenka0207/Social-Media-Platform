import UserLayout from "@/layout/UserLayout";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./style.module.css";
import { loginUser, registerUser } from "@/config/redux/action/authAction";
import { emptyMessage } from "@/config/redux/reducer/authReducer";

function LoginComponent() {
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const router = useRouter();
  const [userLoginMethod, setUserLoginMethod] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (authState.loggedIn) {
      router.replace("/dashboard"); //use replace to avoid going back to login after auth
    }
  }, [authState.loggedIn, router]);

  useEffect(() => {
    //prevent SSR error and redirect if token already exists
    if (typeof window !== "undefined" && localStorage.getItem("token")) {
      router.replace("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    dispatch(emptyMessage());

    //clear form fields when switching between sign in and sign up
    setEmail("");
    setPassword("");
    setUsername("");
    setName("");
  }, [userLoginMethod, dispatch]);

  const handleRegister = () => {
    if (
      !username.trim() ||
      !name.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      return;
    }

    dispatch(
      registerUser({
        username: username.trim(),
        password: password.trim(),
        email: email.trim(),
        name: name.trim(),
      })
    );
  };

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      return;
    }

    dispatch(
      loginUser({
        email: email.trim(),
        password: password.trim(),
      })
    );
  };

  const displayMessage =
    typeof authState.message === "string"
      ? authState.message
      : authState.message?.message || "";

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.cardContainer}>
          <div className={styles.cardContainer_left}>
            <p className={styles.cardleft_heading}>
              {userLoginMethod ? "Sign In" : "Sign Up"}
            </p>

            <p className={styles.messageText} style={{ color: authState.isError ? "red" : "green" }}>
              {displayMessage}
            </p>

            <div className={styles.inputContainers}>
              {!userLoginMethod && (
                <div className={styles.inputRow}>
                  <input
                    onChange={(e) => setUsername(e.target.value)}
                    value={username} 
                    className={styles.inputField}
                    type="text"
                    placeholder="Username"
                  />
                  <input
                    onChange={(e) => setName(e.target.value)}
                    value={name}
                    className={styles.inputField}
                    type="text"
                    placeholder="Name"
                  />
                </div>
              )}

              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className={styles.inputField}
                type="email"
                placeholder="Email"
              />

              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className={styles.inputField}
                type="password"
                placeholder="Password"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (userLoginMethod) {
                      handleLogin();
                    } else {
                      handleRegister();
                    }
                  }
                }}
              />

              <div
                onClick={() => {
                  if (authState.isLoading) return;

                  if (userLoginMethod) {
                    handleLogin();
                  } else {
                    handleRegister();
                  }
                }}
                className={styles.buttonWithOutline}
              >
                <p>{authState.isLoading ? "Please wait..." : userLoginMethod ? "Sign In" : "Sign Up"}</p>
              </div>
            </div>
          </div>

          <div className={styles.cardContainer_right}>
            {userLoginMethod ? (
              <p>Don't have an account?</p>
            ) : (
              <p>Already have an account?</p>
            )}

            <div
              onClick={() => {
                if (authState.isLoading) return;
                setUserLoginMethod(!userLoginMethod);
              }}
              style={{ color: "black", textAlign: "center" }}
              className={styles.buttonWithOutline}
            >
              <p>{userLoginMethod ? "Sign Up" : "Sign In"}</p>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}

export default LoginComponent;