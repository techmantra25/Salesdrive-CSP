import axios from "axios";
import { BACKEND_URL } from "../constants";

export function setAuthHeader() {
  const userInfo = JSON.parse(localStorage.getItem("DMS_USERINFO"));
  const token = userInfo?.token || userInfo?.data?.token;

  if (!token) {
    console.warn("No authentication token found");
  }

  return {
    "Content-Type": "application/json",
    Authorization: token ? "Bearer " + token : "",
  };
}

// GET /api/v1/notifications - Get all notifications
export const GetAllNotifications = async (payload) => {
  try {
    const response = await axios.get(BACKEND_URL + "/api/v1/notifications", {
      headers: setAuthHeader(),
      params: payload,
    });
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

// GET /api/v1/notifications/unread-count - Get unread count
export const GetUnreadCount = async () => {
  try {
    const response = await axios.get(
      BACKEND_URL + "/api/v1/notifications/unread-count",
      {
        headers: setAuthHeader(),
      }
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

// PATCH /api/v1/notifications/:id/read - Mark notification as read
export const MarkNotificationAsRead = async (notificationId) => {
  try {
    const response = await axios.patch(
      BACKEND_URL + `/api/v1/notifications/${notificationId}/read`,
      {},
      {
        headers: setAuthHeader(),
      }
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

// PATCH /api/v1/notifications/read-all - Mark all notifications as read
export const MarkAllNotificationsAsRead = async () => {
  try {
    const response = await axios.patch(
      BACKEND_URL + "/api/v1/notifications/read-all",
      {},
      {
        headers: setAuthHeader(),
      }
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

// POST /api/v1/notifications/send - Send notification to distributors or outlets
export const SendNotification = async (payload) => {
  try {
    const response = await axios.post(
      BACKEND_URL + "/api/v1/notifications/send",
      payload,
      {
        headers: setAuthHeader(),
      }
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

export const DeleteNotification = async (notificationId) => {
  try {
    const response = await axios.delete(
      BACKEND_URL + `/api/v1/notifications/${notificationId}`,
      {
        headers: setAuthHeader(),
      }
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

// DELETE /api/v1/notifications/delete-all - Delete all notifications
export const DeleteAllNotifications = async () => {
  try {
    const response = await axios.delete(BACKEND_URL + "/api/v1/notifications/delete-all", {
      headers: setAuthHeader(),
    });
    return response;
  } catch (error) {
    throw new Error(error);
  }
};
