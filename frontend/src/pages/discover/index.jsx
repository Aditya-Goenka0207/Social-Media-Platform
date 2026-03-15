import React, { useEffect } from "react";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import { useDispatch, useSelector } from "react-redux";
import { getAllUsers } from "@/config/redux/action/authAction";
import { BASE_URL } from "@/config";
import styles from "./index.module.css";
import { useRouter } from "next/router";

export default function Discoverpage() {
  const router = useRouter();
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, [authState.all_profiles_fetched, dispatch]);

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.discoverPage}>
          <h1 className={styles.pageTitle}>Discover</h1>

          <div className={styles.allUserProfile}>
            {authState.all_profiles_fetched &&
              authState.all_users?.map((user) => {
                return (
                  <div
                    onClick={() => {
                      router.push(`/view_profile/${user?.userId?.username}`);
                    }}
                    key={user._id}
                    className={styles.userCard}
                  >
                    <img
                      src={`${BASE_URL}/uploads/${user?.userId?.profilePicture || "default.jpg"}`}
                      alt={`${user?.userId?.name} profile`}
                      className={styles.userCard_img}
                    />

                    <div className={styles.userCard_content}>
                      <h2>{user?.userId?.name}</h2>
                      <p>@{user?.userId?.username}</p>
                    </div>
                  </div>
                );
              })}

            {/*fallback UI when no users are available */}
            {authState.all_profiles_fetched &&
              authState.all_users?.length === 0 && (
                <p className={styles.emptyState}>No profiles found.</p>
              )}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}