import React from "react";
import styles from "./styles.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { reset } from "@/config/redux/reducer/authReducer";

function NavbarComponent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }

    dispatch(reset());

    router.replace("/login");
  };

   const isLoggedIn = !!authState?.profileFetched;

  return (
    <div className={styles.container}>
      <nav className={styles.navBar}>
        <h1 onClick={() => router.push("/")} className={styles.logo}>
          Pro Connect
        </h1>

        <div className={styles.navBarOptionContainer}>
          {isLoggedIn ? (
            <div className={styles.authOptions}>
              <p
                onClick={() => router.push("/profile")}
                className={styles.navLink}
              >
                Profile
              </p>
              <p onClick={handleLogout} className={styles.navLink}>
                Logout
              </p>
            </div>
          ) : (
            <div
              onClick={() => router.push("/login")}
              className={styles.buttonJoin}
            >
              <p>Be a part</p>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}

export default NavbarComponent;