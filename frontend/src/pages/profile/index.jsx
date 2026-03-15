import { getAboutUser } from "@/config/redux/action/authAction";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./index.module.css";
import { BASE_URL, userServer } from "@/config";
import { getAllPosts } from "@/config/redux/action/postAction";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const postReducer = useSelector((state) => state.post);

  const [userProfile, setUserprofile] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [inputData, setInputData] = useState({
    company: "",
    position: "",
    years: "",
  });

  const handleWorkInputChange = (e) => {
    const { name, value } = e.target;
    setInputData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token) {
        dispatch(getAboutUser({ token }));
        dispatch(getAllPosts());
      }
    }
  }, [dispatch]);

  useEffect(() => {
    if (authState.user !== undefined) {
      setUserprofile({
        ...authState.user,
        userId: { ...authState.user.userId },
        pastWork: [...(authState.user.pastWork || [])],
        education: [...(authState.user.education || [])],
      });
    }
  }, [authState.user]);

  //derived posts with useMemo instead of extra state
  const userPosts = useMemo(() => {
    if (!authState.user?.userId?.username) return [];

    return (postReducer.posts || []).filter((post) => {
      return post?.userId?.username === authState.user.userId.username;
    });
  }, [authState.user, postReducer.posts]);

  const updateProfilePicture = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("profile_picture", file);

    if (typeof window !== "undefined") {
      formData.append("token", localStorage.getItem("token"));
    }

    await userServer.post("/update_profile_picture", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (typeof window !== "undefined") {
      dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    }
  };

  const updateProfileData = async () => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");

    await userServer.post("/user_update", {
      token,
      name: userProfile?.userId?.name || "",
    });

    await userServer.post("/update_profile_data", {
      token,
      bio: userProfile.bio || "",
      currentPost: userProfile.currentPost || "",
      pastWork: userProfile.pastWork || [],
      education: userProfile.education || [],
    });

    dispatch(getAboutUser({ token }));
  };

  return (
    <UserLayout>
      <DashboardLayout>
        {authState.user && userProfile.userId && (
          <div className={styles.container}>
            <div className={styles.backDropContainer}>
              <label
                htmlFor="profilePictureUpload"
                className={styles.backDrop_overlay}
              >
                <p>Edit</p>
              </label>

              <input
                onChange={(e) => {
                  updateProfilePicture(e.target.files?.[0]);
                }}
                hidden
                type="file"
                id="profilePictureUpload"
                accept="image/*" 
              />

              <img
                src={`${BASE_URL}/uploads/${userProfile?.userId?.profilePicture || "default.jpg"}`}
                alt="Profile-picture"
              />
            </div>

            <div className={styles.profileContainer_details}>
              <div style={{ display: "flex", gap: "0.7rem" }}>
                <div style={{ flex: "0.8" }}>
                  <div
                    style={{
                      display: "flex",
                      width: "fit-content",
                      alignItems: "center",
                      gap: "1.2rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <input
                      className={styles.nameEdit}
                      type="text"
                      value={userProfile?.userId?.name || ""}
                      onChange={(e) => {
                        setUserprofile({
                          ...userProfile,
                          userId: {
                            ...userProfile.userId,
                            name: e.target.value,
                          },
                        });
                      }}
                    />

                    <p style={{ color: "gray" }}>
                      @{userProfile?.userId?.username}
                    </p>
                  </div>

                  <div>
                    <textarea
                      value={userProfile?.bio || ""}
                      onChange={(e) => {
                        setUserprofile({ ...userProfile, bio: e.target.value });
                      }}
                      rows={Math.max(
                        3,
                        Math.ceil((userProfile?.bio?.length || 0) / 80)
                      )}
                      style={{ width: "100%" }}
                    />
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

                <button
                  className={styles.addWorkButton}
                  onClick={() => {
                    setIsModalOpen(true);
                  }}
                >
                  Add Work
                </button>
              </div>
            </div>

            {JSON.stringify(userProfile) !== JSON.stringify(authState.user) && (
              <div
                onClick={() => {
                  updateProfileData();
                }}
                className={styles.updateProfileBtn}
              >
                Update Profile
              </div>
            )}
          </div>
        )}

        {isModalOpen && (
          <div
            onClick={() => {
              setIsModalOpen(false);
            }}
            className={styles.commentsContainer}
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
              className={styles.allCommentsContainer}
            >
              <input
                onChange={handleWorkInputChange}
                value={inputData.company}
                name="company"
                className={styles.inputField}
                type="text"
                placeholder="Enter Company"
              />

              <input
                onChange={handleWorkInputChange}
                value={inputData.position}
                name="position"
                className={styles.inputField}
                type="text"
                placeholder="Enter Position"
              />

              <input
                onChange={handleWorkInputChange}
                value={inputData.years}
                name="years"
                className={styles.inputField}
                type="text"
                placeholder="Years"
              />

              <div
                onClick={() => {
                  if (
                    !inputData.company.trim() ||
                    !inputData.position.trim() ||
                    !inputData.years.trim()
                  ) {
                    return;
                  }

                  setUserprofile({
                    ...userProfile,
                    pastWork: [
                      ...(userProfile.pastWork || []),
                      {
                        company: inputData.company.trim(),
                        position: inputData.position.trim(),
                        years: inputData.years.trim(),
                      },
                    ],
                  });

                  //reset modal form after adding
                  setInputData({
                    company: "",
                    position: "",
                    years: "",
                  });

                  setIsModalOpen(false);
                }}
                className={styles.updateProfileBtn}
              >
                Add Work
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </UserLayout>
  );
}