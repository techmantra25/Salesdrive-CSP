import { useRef } from "react";
import moment from "moment";
import { FaBell, FaVolumeUp, FaVolumeMute, FaChevronRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useSocket } from "../../context/SocketContext";
import { setSoundEnabled } from "../../store/slices/notificationSettingsSlice";

export const NotificationBell = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const {
    unreadCount,
    notifications,
    showNotifications,
    setShowNotifications,
    clearNotifications,
    markAsRead,
  } = useSocket();
  const notificationSettings = useSelector(
    (state) => state.notificationSettings
  );
  const { userInfo } = useSelector((state) => state.user);
  const role = userInfo?.role?.toLowerCase();

  // Handle dropdown open/close with animation
  const handleDropdownToggle = () => {
    setShowNotifications(!showNotifications);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "giftOrder":
        return "🎁";
      case "announcement":
        return "📢";
      case "downtime":
        return "⏰";
      case "reminder":
        return "⏰";
      case "alert":
        return "⚠️";
      case "Target":
        return "🎯";
      default:
        return "🔔";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "giftOrder":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400";
      case "announcement":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
      case "downtime":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400";
      case "reminder":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400";
      case "alert":
        return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
      case "Target":
        return "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400";
    }
  };

  const formatTime = (timestamp) => {
    const date = moment(timestamp);
    const diffDays = moment().diff(date, "days");

    if (diffDays < 7) {
      return date.fromNow();
    }
    return date.format("DD/MM/YYYY");
  };

  // Navigate to page based on notification type
  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);
    setShowNotifications(false);

    switch (notification.type) {
      case "giftOrder":
        navigate(`/${role}/retailer-orders`);
        break;
      case "announcement":
        navigate(`/${role}/notifications`);
        break;
      case "downtime":
        navigate(`/${role}/notifications`);
        break;
      case "reminder":
        navigate(`/${role}/outlet-list`);
        break;
      case "alert":
        navigate(`/${role}/notifications`);
        break;
      case "Target":
        navigate(`/${role}/primary-target-setting`);
        break;
      default:
        navigate(`/${role}/notifications`);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleDropdownToggle}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
      >
        <FaBell className="text-gray-600 dark:text-white" size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      <div
        className={`absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 ease-out ${
          showNotifications
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 -translate-y-2 scale-95 pointer-events-none"
        }`}
        style={{ visibility: showNotifications ? "visible" : "hidden" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {/* Sound Toggle */}
            <button
              onClick={() =>
                dispatch(setSoundEnabled(!notificationSettings.soundEnabled))
              }
              className={`p-1.5 rounded-full transition-colors ${
                notificationSettings.soundEnabled
                  ? "bg-white/20 text-white hover:bg-white/30"
                  : "bg-white/10 text-white/60 hover:bg-white/20"
              }`}
              title={
                notificationSettings.soundEnabled
                  ? "Mute Sound"
                  : "Unmute Sound"
              }
            >
              {notificationSettings.soundEnabled ? (
                <FaVolumeUp size={14} />
              ) : (
                <FaVolumeMute size={14} />
              )}
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <FaBell className="text-gray-400" size={24} />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                No notifications yet
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                You're all caught up!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 cursor-pointer transition-all duration-200 group border-l-3 ${
                    !notification.read
                      ? "border-l-blue-500 bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/30 dark:to-gray-800 shadow-sm hover:shadow-md hover:translate-x-0.5"
                      : "border-l-gray-200 dark:border-l-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Unread Indicator Dot */}
                    {!notification.read && (
                      <div className="absolute left-2 top-1/2 -translate-y-1/2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                      </div>
                    )}

                    {/* Icon */}
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ring-2 ring-offset-1 transition-transform group-hover:scale-110 ${
                        !notification.read
                          ? `${getTypeColor(notification.type)} ring-blue-200 dark:ring-blue-800`
                          : `bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 ring-gray-100 dark:ring-gray-700 opacity-70`
                      }`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        {notification.title && (
                          <p className={`text-sm truncate flex items-center gap-2 ${
                            !notification.read
                              ? "font-bold text-gray-900 dark:text-white"
                              : "font-medium text-gray-600 dark:text-gray-400"
                          }`}>
                            {notification.title}
                            {!notification.read && (
                              <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                New
                              </span>
                            )}
                          </p>
                        )}
                        <span className={`text-xs flex-shrink-0 ${
                          !notification.read
                            ? "text-blue-600 dark:text-blue-400 font-semibold"
                            : "text-gray-400 dark:text-gray-500"
                        }`}>
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className={`text-sm line-clamp-2 mt-1 ${
                        !notification.read
                          ? "text-gray-700 dark:text-gray-200 font-medium"
                          : "text-gray-500 dark:text-gray-400"
                      }`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2.5">
                        <span className={`text-xs capitalize px-2 py-0.5 rounded-full ${
                          !notification.read
                            ? "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 font-medium"
                            : "text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700"
                        }`}>
                          {notification.type}
                        </span>
                        {!notification.read ? (
                          <div className="flex items-center gap-1 text-blue-500">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] font-medium">Unread</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                            </svg>
                            Read
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow Icon */}
                    <FaChevronRight
                      className={`flex-shrink-0 transition-all duration-200 ${
                        !notification.read
                          ? "text-blue-400 dark:text-blue-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1"
                          : "text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400"
                      }`}
                      size={14}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <button
                onClick={clearNotifications}
                className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium"
              >
                Read all
              </button>
              <button
                onClick={() => {
                  setShowNotifications(false);
                  navigate(`/${role}/notifications`);
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-1"
              >
                View all <FaChevronRight size={10} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
