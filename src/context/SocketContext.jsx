import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { useSelector, useDispatch } from "react-redux";
import {
  GetAllNotifications,
  GetUnreadCount,
  MarkNotificationAsRead,
  MarkAllNotificationsAsRead,
} from "../api/notification";

import {
  setSoundEnabled,
} from "../store/slices/notificationSettingsSlice"; // Redux slice for settings

const SocketContext = createContext();
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const audioRef = useRef(null);

  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const user = useSelector((state) => state?.user?.userInfo);
  const { soundEnabled } = useSelector(
    (state) => state.notificationSettings
  );
  const dispatch = useDispatch();

  const baseURL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:10000";

  // -------------------------
  // 🔥 FETCH NOTIFICATIONS FROM DB
  // -------------------------
  const fetchNotifications = async () => {
    try {
      const response = await GetAllNotifications();
      setNotifications(response.data.data);
    } catch (error) {
      console.error("Fetch notifications error:", error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await GetUnreadCount();
      // Handle both response formats: { data: { unreadCount } } or { unreadCount }
      const count = response.data?.unreadCount ?? response.unreadCount ?? 0;
      setUnreadCount(count);
    } catch (error) {
      console.error("Unread count error:", error);
    }
  };

  // -------------------------
  // 🔊 Initialize Audio
  // -------------------------
  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
    audioRef.current.preload = "auto";
    
    // Load the audio
    audioRef.current.load();
    
    audioRef.current.addEventListener("canplaythrough", () => {
      console.log("✅ Audio loaded and ready to play");
    });
    
    audioRef.current.addEventListener("error", (e) => {
      console.error("❌ Audio load error:", e);
    });
  }, []);

  // -------------------------
  // SOCKET INIT
  // -------------------------
  useEffect(() => {
    if (!user?._id) return;

    fetchNotifications();
    fetchUnreadCount();

    const socket = io(baseURL, {
      transports: ["websocket"],
      auth: {
        userId: user._id,
        role: user.role,
      },
    });

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // 🔔 Realtime notification
    socket.on("notification", (data) => {
      console.log("🔔 Realtime:", data);

      toast.success(data?.message || "New notification");

      // Play sound if enabled
      if (soundEnabled && audioRef.current) {
        try {
          audioRef.current.currentTime = 0;
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("🔊 Notification sound playing");
              })
              .catch((err) => {
                console.log("Sound play blocked:", err.message);
              });
          }
        } catch (err) {
          console.log("Sound play error:", err.message);
        }
      }

      // Add new notification from server
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [user?._id, soundEnabled]);

  // -------------------------
  // MARK SINGLE READ
  // -------------------------
  const markAsRead = async (id) => {
    try {
      await MarkNotificationAsRead(id);

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );

      setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
    } catch (error) {
      console.error("Mark read error:", error);
    }
  };

  // -------------------------
  // MARK ALL READ
  // -------------------------
  const clearNotifications = async () => {
    try {
      await MarkAllNotificationsAsRead();

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Clear all error:", error);
    }
  };

  // -------------------------
  // TOGGLE SOUND
  // -------------------------
  const toggleSound = () => {
    dispatch(setSoundEnabled(!soundEnabled));
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        notifications,
        unreadCount,
        showNotifications,
        setShowNotifications,
        markAsRead,
        clearNotifications,
        soundEnabled,
        toggleSound,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
