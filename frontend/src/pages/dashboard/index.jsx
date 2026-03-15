import { getAboutUser, getAllUsers } from "@/config/redux/action/authAction";
import {
  createPost,
  deletePost,
  getAllComments,
  getAllPosts,
  incrementPostLike,
  postComment,
} from "@/config/redux/action/postAction";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./index.module.css";
import { BASE_URL } from "@/config";
import { resetPostId } from "@/config/redux/reducer/postReducer";

function Dashboard() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.post);

  const [postContent, setPostContent] = useState("");
  const [fileContent, setFileContent] = useState(null);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");

    if (authState.isTokenThere && token) {
      dispatch(getAllPosts());
      dispatch(getAboutUser({ token }));
    }

    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, [authState.isTokenThere, authState.all_profiles_fetched, dispatch]);

  const handleUpload = async () => {
    // allow post creation when either text or file exists
    if (postContent.trim() === "" && !fileContent) return;

    await dispatch(createPost({ file: fileContent, body: postContent }));
    setPostContent("");
    setFileContent(null);
  };

  if (authState.user) {
    return (
      <UserLayout>
        <DashboardLayout>
          <div className={styles.scrollComponent}>
            <div className={styles.wrapper}>
              <div className={styles.createPostContainer}>
                <img
                  className={styles.userProfile}
                  src={`${BASE_URL}/uploads/${authState.user?.userId?.profilePicture || "default.jpg"}`}
                  alt="profile"
                />

                <textarea
                  onChange={(e) => setPostContent(e.target.value)}
                  value={postContent}
                  placeholder="What's in your mind?"
                  className={styles.textAreaOfContent}
                ></textarea>

                <label htmlFor="fileUpload">
                  <div className={styles.Fab}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className={styles.icon}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  </div>
                </label>

                <input
                  onChange={(e) => setFileContent(e.target.files?.[0] || null)}
                  type="file"
                  hidden
                  id="fileUpload"
                />

                {(postContent.trim().length > 0 || fileContent) && (
                  <div onClick={handleUpload} className={styles.uploadButton}>
                    Post
                  </div>
                )}
              </div>

              <div className={styles.postsContainer}>
                {postState.posts?.map((post) => {
                  return (
                    <div key={post._id} className={styles.singleCard}>
                      <div className={styles.singleCard_profileContainer}>
                        <img
                          className={styles.userProfile}
                          src={`${BASE_URL}/uploads/${post?.userId?.profilePicture || "default.jpg"}`}
                          alt="profile"
                        />

                        <div>
                          <div
                            style={{
                              display: "flex",
                              gap: "1.2rem",
                              justifyContent: "space-between",
                            }}
                          >
                            <p style={{ fontWeight: "bold" }}>
                              {post?.userId?.name}
                            </p>

                            {post?.userId?._id === authState?.user?.userId?._id && (
                              <div
                                onClick={async () => {
                                  await dispatch(deletePost({ post_id: post._id }));
                                }}
                                style={{ cursor: "pointer" }}
                              >
                                <svg
                                  style={{ height: "1.4em", color: "red" }}
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1.5}
                                  stroke="currentColor"
                                  className={styles.icon}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>

                          <p style={{ color: "grey" }}>
                            {post?.userId?.username}
                          </p>

                          <p style={{ paddingTop: "1.3rem" }}>{post?.body}</p>

                          <div className={styles.singleCard_image}>
                            {post.media !== "" ? (
                              <>
                                {["png", "jpg", "jpeg", "gif", "webp"].includes(
                                  post?.fileType
                                ) ? (
                                  <img
                                    src={`${BASE_URL}/uploads/${post.media}`}
                                    alt="post"
                                  />
                                ) : (
                                  <video controls>
                                    <source
                                      src={`${BASE_URL}/uploads/${post.media}`}
                                    />
                                  </video>
                                )}
                              </>
                            ) : null}
                          </div>

                          <div className={styles.optionsContainer}>
                            <div
                              onClick={async () => {
                                await dispatch(
                                  incrementPostLike({ post_id: post._id })
                                );
                              }}
                              className={styles.singleOption_optionsContainer}
                            >
                              <p>{post.likes} Likes</p>
                            </div>

                            <div
                              onClick={() => {
                                dispatch(getAllComments({ post_id: post._id }));
                              }}
                              className={styles.singleOption_optionsContainer}
                            >
                              <p>Comments</p>
                            </div>

                            <div
                              onClick={() => {
                                if (typeof window !== "undefined") {
                                  const text = encodeURIComponent(post.body || "");
                                  const url = encodeURIComponent(window.location.href);
                                  const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
                                  window.open(twitterUrl, "_blank");
                                }
                              }}
                              className={styles.singleOption_optionsContainer}
                            >
                              <p>Share</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {postState.postId !== "" && (
            <div
              onClick={() => {
                dispatch(resetPostId());
              }}
              className={styles.commentsContainer}
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className={styles.allCommentsContainer}
              >
                {postState.comments.length === 0 && <h2>No Comments</h2>}

                {postState.comments.length !== 0 && (
                  <div>
                    {postState.comments.map((postComment) => {
                      return (
                        <div
                          className={styles.singleComment}
                          key={postComment._id}
                        >
                          <div
                            className={styles.singleComment_profileContainer}
                          >
                            <img
                              src={`${BASE_URL}/uploads/${postComment?.userId?.profilePicture || "default.jpg"}`}
                              alt="profile"
                            />
                            <div>
                              <p
                                style={{
                                  fontWeight: "bold",
                                  fontSize: "1.2rem",
                                }}
                              >
                                {postComment?.userId?.name}
                              </p>
                              <p>{postComment?.userId?.username}</p>
                            </div>
                          </div>
                          <p>{postComment?.comment}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className={styles.postCommentContainer}>
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Comment"
                  />

                  <div
                    onClick={async () => {
                      if (commentText.trim() === "") return;

                      await dispatch(
                        postComment({
                          post_id: postState.postId,
                          body: commentText,
                        })
                      );

                      setCommentText("");
                    }}
                    className={styles.postCommentContainer_commentBtn}
                  >
                    <p>Comment</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DashboardLayout>
      </UserLayout>
    );
  } else {
    return (
      <UserLayout>
        <DashboardLayout>
          <h2>Loading..</h2>
        </DashboardLayout>
      </UserLayout>
    );
  }
}

export default Dashboard;