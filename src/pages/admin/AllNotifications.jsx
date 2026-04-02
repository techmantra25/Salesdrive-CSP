import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  Pagination,
  Spinner,
  Table,
} from "flowbite-react";
import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { RiRefreshFill } from "react-icons/ri";
import {
  GetAllNotifications,
} from "../../api/notification";
import { useSocket } from "../../context/SocketContext";
import moment from "moment";

const AllNotifications = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.user);
  const role = userInfo?.role?.toLowerCase();
  const [pageLoading, setPageLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState("all"); // all, read, unread
  const [expandedMessages, setExpandedMessages] = useState({});
  const [localNotifications, setLocalNotifications] = useState([]);

  // Use SocketContext for real-time notifications
  const { 
    notifications: socketNotifications, 
    markAsRead: socketMarkAsRead,
    clearNotifications 
  } = useSocket();

  // Sync local notifications with socket notifications
  useEffect(() => {
    if (socketNotifications) {
      setLocalNotifications(socketNotifications);
      setPageLoading(false);
    }
  }, [socketNotifications]);

  // Filter notifications based on filter type
  const notifications = useMemo(() => {
    let filtered = localNotifications || [];
    if (filter === "read") {
      filtered = filtered.filter(n => n.read);
    } else if (filter === "unread") {
      filtered = filtered.filter(n => !n.read);
    }
    return filtered;
  }, [localNotifications, filter]);

  // Calculate pagination locally since we're using socket data
  const itemsPerPage = 20;
  const paginatedNotifications = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return notifications.slice(start, start + itemsPerPage);
  }, [notifications, currentPage]);

  // Update totals when notifications change
  useEffect(() => {
    setTotalItems(notifications.length);
    setFilteredCount(notifications.length);
    setTotalPages(Math.ceil(notifications.length / itemsPerPage) || 1);
  }, [notifications]);

  // Toggle message expansion
  const toggleMessageExpand = (notificationId) => {
    setExpandedMessages((prev) => ({
      ...prev,
      [notificationId]: !prev[notificationId],
    }));
  };

  const onPageChange = (page) => setCurrentPage(page);

  // Set page loading to false once socket notifications are loaded
  useEffect(() => {
    if (socketNotifications) {
      setPageLoading(false);
    }
  }, [socketNotifications]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  // Handle mark all as read - use socket function
  const handleMarkAllAsRead = async () => {
    try {
      await clearNotifications();
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const handleResetFilter = () => {
    setCurrentPage(1);
    setFilter("all");
  };

  // Get notification type color
  const getTypeColor = (type) => {
    switch (type) {
      case "giftOrder":
        return "purple";
      case "announcement":
        return "blue";
      case "reminder":
        return "orange";
      case "alert":
        return "red";
      case "downtime":
        return "yellow";
      case "Target":
        return "pink";
      default:
        return "gray";
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    switch (notification.type) {
      case "giftOrder":
        navigate(`/${role}/retailer-orders`);
        break;
      case "announcement":
        navigate(`/${role}/dashboard`);
        break;
      case "downtime":
        navigate(`/${role}/dashboard`);
        break;
      case "reminder":
        navigate(`/${role}/outlet-list`);
        break;
      case "alert":
        navigate(`/${role}/dashboard`);
        break;
      case "Target":
        navigate(`/${role}/primary-target-setting`);
        break;
      default:
        navigate(`/${role}/dashboard`);
    }
  };

  return (
    <div className="flex justify-start items-center flex-col w-full">
      <div className="flex justify-between w-full items-center py-1">
        <div className="flex justify-start items-center w-full">
          <Breadcrumb aria-label="Solid background breadcrumb example">
            <Breadcrumb.Item>RVP App</Breadcrumb.Item>
            <Breadcrumb.Item href={`/${role}/notifications`}>
              Notifications
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </div>

      <div className="flex justify-start items-center flex-col gap-2 w-full p-1">
        <Card className="w-full flex justify-center items-center flex-col">
          <div className="w-full flex flex-wrap justify-center items-center gap-2">
            <Badge color="indigo">Total Items : {totalItems}</Badge>
            <Badge color="indigo">Filtered Items : {filteredCount}</Badge>
          </div>
          <div className="flex justify-center w-full items-center gap-2 flex-wrap mt-4">
            {/* Filter Tabs */}
            <div className="flex rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
              {["all", "unread", "read"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-6 py-2.5 text-sm font-medium transition-colors ${
                    filter === f
                      ? "bg-lavender-900 text-white"
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex justify-center items-center gap-2">
              <Button
                className="text-xs"
                size="sm"
                color="success"
                onClick={handleResetFilter}
              >
                <span className="flex justify-center items-center gap-2">
                  <RiRefreshFill size={20} />
                  Reset & Refresh
                </span>
              </Button>
            </div>
            <Button
              size="sm"
              color="dark"
              onClick={handleMarkAllAsRead}
            >
              Mark all read
            </Button>
          </div>
        </Card>
      </div>

      {/* pagination */}
      <div className="flex justify-end items-center w-full px-4">
        <div className="flex overflow-x-auto sm:justify-center">
          {!pageLoading && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              showIcons
            />
          )}
        </div>
      </div>

      {/* table */}
      <div className="flex justify-start items-center flex-col gap-2 w-full p-4">
        <div className="overflow-x-auto w-full">
          <Table striped className="rounded-none border">
            <Table.Head className="text-center">
              <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                Title
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100 min-w-[300px] max-w-[400px]">
                Message
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                Type
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                Status
              </Table.HeadCell>
              <Table.HeadCell className="whitespace-nowrap bg-lavender-900 text-oWhite-100">
                Created Date
              </Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {pageLoading ? (
                <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell
                    colSpan="5"
                    className="whitespace-nowrap font-medium text-white"
                  >
                    <div
                      className="w-full flex justify-center items-center"
                      role="status"
                    >
                      <Spinner aria-label="Loading data" size="xl" />
                    </div>
                  </Table.Cell>
                </Table.Row>
              ) : (
                <>
                  {paginatedNotifications?.map((notification) => (
                    <Table.Row
                      key={notification._id}
                      className="text-center bg-white dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <Table.Cell className="whitespace-nowrap font-medium text-white">
                        <span
                          className={`${
                            !notification.read
                              ? "font-bold text-white"
                              : "text-white"
                          }`}
                        >
                          {notification.title || "Notification"}
                        </span>
                      </Table.Cell>
                      <Table.Cell className="font-medium text-white text-left align-top py-3">
                        <div className="max-w-[350px]">
                          <p className="text-sm text-white break-words leading-relaxed">
                            {expandedMessages[notification._id]
                              ? notification.message
                              : notification.message?.length > 150
                              ? notification.message?.substring(0, 150) + "..."
                              : notification.message}
                          </p>
                          {notification.message?.length > 150 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMessageExpand(notification._id);
                              }}
                              className="text-xs text-lavender-600 dark:text-lavender-400 hover:text-lavender-800 dark:hover:text-lavender-300 font-medium mt-1 inline-block"
                            >
                              {expandedMessages[notification._id]
                                ? "Show less"
                                : "Read more"}
                            </button>
                          )}
                        </div>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-white">
                        <Badge
                          color={getTypeColor(notification.type)}
                          className="font-bold capitalize"
                        >
                          {notification.type}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-white">
                        <Badge
                          color={notification.read ? "success" : "warning"}
                          className="font-bold"
                        >
                          {notification.read ? "Read" : "Unread"}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-white">
                        {notification.createdAt
                          ? moment(notification.createdAt)
                              .tz("Asia/Kolkata")
                              .format("LLL")
                          : "N/A"}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                  {notifications?.length === 0 && (
                    <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell
                        colSpan="5"
                        className="whitespace-nowrap font-medium text-white"
                      >
                        No notifications found
                      </Table.Cell>
                    </Table.Row>
                  )}
                </>
              )}
            </Table.Body>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AllNotifications;
