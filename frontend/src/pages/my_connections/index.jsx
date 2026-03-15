import React, { useEffect, useMemo } from "react";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import { useDispatch, useSelector } from "react-redux";
import {
  AcceptConnection,
  getConnectionRequest,
  getMyConnectionRequest,
} from "@/config/redux/action/authAction";
import { BASE_URL } from "@/config";
import styles from "./index.module.css";
import { useRouter } from "next/router";

export default function MyConnectionsPage() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      //fetch both sent and received requests
      dispatch(getConnectionRequest({ token }));
      dispatch(getMyConnectionRequest({ token }));
    }
  }, [dispatch]);

  const receivedRequests = authState.connectionRequest || [];
  const sentRequests = authState.connections || [];

  //pending requests = only received pending requests
  const pendingConnections = receivedRequests.filter(
    (connection) => connection.status_accepted === null
  );

  //merge accepted sent + accepted received requests
  const acceptedConnections = useMemo(() => {
    const receivedAccepted = receivedRequests
      .filter((connection) => connection.status_accepted === true)
      .map((connection) => ({
        _id: connection._id,
        user: connection.userId,
      }));

    const sentAccepted = sentRequests
      .filter((connection) => connection.status_accepted === true)
      .map((connection) => ({
        _id: connection._id,
        user: connection.connectionId,
      }));

    return [...receivedAccepted, ...sentAccepted];
  }, [receivedRequests, sentRequests]);

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.connectionsPage}>
          <h2 className={styles.sectionTitle}>My Connections</h2>

          {pendingConnections.length === 0 && (
            <h3 className={styles.emptyState}>No Connection Request Pending</h3>
          )}

          {pendingConnections.map((item) => {
            return (
              <div
                onClick={() => {
                  router.push(`/view_profile/${item?.userId?.username}`);
                }}
                className={styles.userCard}
                key={item._id}
              >
                <div className={styles.userCardInner}>
                  <div className={styles.profilePicture}>
                    <img
                      src={`${BASE_URL}/uploads/${item?.userId?.profilePicture || "default.jpg"}`}
                      alt={`${item?.userId?.name} profile`}
                    />
                  </div>

                  <div className={styles.userInfo}>
                    <h3>{item?.userId?.name}</h3>
                    <p>@{item?.userId?.username}</p>
                  </div>

                  <div className={styles.actionButtons}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        dispatch(
                          AcceptConnection({
                            connectionId: item._id,
                            token:
                              typeof window !== "undefined"
                                ? localStorage.getItem("token")
                                : null,
                            action: "accept",
                          })
                        );
                      }}
                      className={styles.connectedButton}
                    >
                      Accept
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();

                        dispatch(
                          AcceptConnection({
                            connectionId: item._id,
                            token:
                              typeof window !== "undefined"
                                ? localStorage.getItem("token")
                                : null,
                            action: "reject",
                          })
                        );
                      }}
                      className={styles.rejectButton}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <h2 className={styles.sectionTitle}>My Network</h2>

          {acceptedConnections.length === 0 && (
            <h3 className={styles.emptyState}>No connections yet</h3>
          )}

          {acceptedConnections.map((item) => {
            return (
              <div
                onClick={() => {
                  router.push(`/view_profile/${item?.user?.username}`);
                }}
                className={styles.userCard}
                key={item._id}
              >
                <div className={styles.userCardInner}>
                  <div className={styles.profilePicture}>
                    <img
                      src={`${BASE_URL}/uploads/${item?.user?.profilePicture || "default.jpg"}`}
                      alt={`${item?.user?.name} profile`}
                    />
                  </div>

                  <div className={styles.userInfo}>
                    <h3>{item?.user?.name}</h3>
                    <p>@{item?.user?.username}</p>
                  </div>

                  <div className={styles.networkTag}>Connected</div>
                </div>
              </div>
            );
          })}
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}