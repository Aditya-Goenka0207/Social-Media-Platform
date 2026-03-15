import { BASE_URL, userServer } from "@/config";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import React, { useEffect, useMemo, useState } from "react";
import styles from "./index.module.css";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { getAllPosts } from "@/config/redux/action/postAction";
import {
  getConnectionRequest,
  getMyConnectionRequest,
  sendConnectionRequest,
} from "@/config/redux/action/authAction";

export default function ViewProfilePage({ userProfile }) {
  const router = useRouter();

  const postReducer = useSelector((state) => state.post);
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  const [isCurrentUserInConnection, setIsCurrentUserInConnection] =
    useState(false);
  const [isConnectionNull, setIsConnectionNull] = useState(true);

  const getUserPost = async () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      await dispatch(getAllPosts());
      await dispatch(getConnectionRequest({ token }));
      await dispatch(getMyConnectionRequest({ token }));
    }
  };

  //derived posts with useMemo instead of separate state/effect
  const userPosts = useMemo(() => {
    if (!postReducer.posts || !router.query.username) return [];

    return postReducer.posts.filter((post) => {
      return post?.userId?.username === router.query.username;
    });
  }, [postReducer.posts, router.query.username]);

  useEffect(() => {
    setIsCurrentUserInConnection(false);
    setIsConnectionNull(true);

    if (!authState.connections || !authState.connectionRequest || !userProfile?.userId?._id) {
      return;
    }

    const sentConnection = authState.connections.find(
      (user) => user?.connectionId?._id === userProfile.userId._id
    );

    const receivedConnection = authState.connectionRequest.find(
      (user) => user?.userId?._id === userProfile.userId._id
    );

    const currentConnection = sentConnection || receivedConnection;

    if (currentConnection) {
      setIsCurrentUserInConnection(true);

      if (currentConnection.status_accepted === true) {
        setIsConnectionNull(false);
      }
    }
  }, [
    authState.connections,
    authState.connectionRequest,
    userProfile?.userId?._id,
  ]);

  useEffect(() => {
    getUserPost();
  }, [dispatch]);

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.backDropContainer}>
            <img
              className={styles.backDrop}
              src={`${BASE_URL}/uploads/${userProfile?.userId?.profilePicture || "default.jpg"}`}
              alt="Profile-picture"
            />
          </div>

          <div className={styles.profileContainer_details}>
            <div className={styles.profileContainer_flex}>
              <div style={{ flex: "0.8" }}>
                <div
                  style={{
                    display: "flex",
                    width: "fit-content",
                    alignItems: "center",
                    gap: "0.7rem",
                    flexWrap: "wrap",
                  }}
                >
                  <h2>{userProfile?.userId?.name}</h2>
                  <p style={{ color: "gray" }}>
                    @{userProfile?.userId?.username}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1.2rem",
                    flexWrap: "wrap",
                  }}
                >
                  {isCurrentUserInConnection ? (
                    <button className={styles.connectedButton}>
                      {isConnectionNull ? "Pending" : "Connected"}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (typeof window === "undefined") return;

                        dispatch(
                          sendConnectionRequest({
                            token: localStorage.getItem("token"),
                            user_id: userProfile.userId._id,
                          })
                        );
                      }}
                      className={styles.connectBtn}
                    >
                      Connect
                    </button>
                  )}

                  <div
                    onClick={async () => {
                      const response = await userServer.get(
                        `/user/download_resume`,
                        {
                          params: {
                            id: userProfile.userId._id,
                          },
                        }
                      );

                      window.open(
                        `${BASE_URL}/uploads/${response.data.message}`,
                        "_blank"
                      );
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <svg
                      style={{ width: "1.2em" }}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                  </div>
                </div>

                <div>
                  <p>{userProfile?.bio}</p>
                </div>
              </div>

              <div style={{ flex: "0.2" }}>
                <h3>Recent Activity</h3>

                {userPosts.map((post) => {
                  return (
                    <div key={post._id} className={styles.postCard}>
                      <div className={styles.card}>
                        <div className={styles.card_profileContainer}>
                          {post.media !== "" ? (
                            <>
                              {["png", "jpg", "jpeg", "gif", "webp"].includes(
                                post?.fileType
                              ) ? (
                                <img
                                  src={`${BASE_URL}/uploads/${post.media}`}
                                  alt="media"
                                />
                              ) : (
                                <video controls>
                                  <source
                                    src={`${BASE_URL}/uploads/${post.media}`}
                                  />
                                </video>
                              )}
                            </>
                          ) : (
                            <div
                              style={{ width: "3.4rem", height: "3.4rem" }}
                            ></div>
                          )}
                        </div>

                        <p>{post.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={styles.workHistory}>
            <h4>Work History</h4>

            <div className={styles.workHistoryContainer}>
              {(userProfile.pastWork || []).map((work, index) => {
                return (
                  <div key={index} className={styles.workHistoryCard}>
                    <p
                      style={{
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.8rem",
                      }}
                    >
                      {work.company} - {work.position}
                    </p>

                    <p>{work.years}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}

export async function getServerSideProps(context) {
  try {
    const request = await userServer.get("/user/get_profile_based_on_username", {
      params: {
        username: context.query.username,
      },
    });

    return { props: { userProfile: request.data.profile } };
  } catch (error) {
    return {
      notFound: true,
    };
  }
}