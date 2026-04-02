import {
  Button,
  Card,
  Label,
  Select,
  TextInput,
  Textarea,
  Spinner,
} from "flowbite-react";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { HiBell, HiUserGroup } from "react-icons/hi";
import { MdSend } from "react-icons/md";
import { AllDistributorList, ApprovedOutletPaginated } from "../../api/api";
import { SendNotification } from "../../api/notification";
import PaginatedSearchableSelectForAnnouncement from "../../components/PaginatedSearchableSelectForAnnouncement";

const notificationTypes = [
  { value: "announcement", label: "Announcement" },
  // { value: "giftOrder", label: "Gift Order" },
  { value: "downtime", label: "Downtime" },
  // { value: "reminder", label: "Reminder" },
  // { value: "alert", label: "Alert" },
];

const Announcements = () => {
  const [targetType, setTargetType] = useState("");
  const [sendToAll, setSendToAll] = useState(false);
  const [recipientIds, setRecipientIds] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("announcement");
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [response, setResponse] = useState(null);

  // Fetch all distributors for dropdown
  useEffect(() => {
    const fetchDistributors = async () => {
      if (targetType !== "distributor") return;

      setFetchingUsers(true);
      try {
        const res = await AllDistributorList();
        const data = res.data.data?.filter(u => u.status === true) || [];
        setDistributors(data);
      } catch (err) {
        console.error("Error fetching distributors:", err);
        toast.error("Failed to fetch distributors");
      } finally {
        setFetchingUsers(false);
      }
    };

    fetchDistributors();
  }, [targetType]);

  // Fetch distributors with pagination and search
  const fetchDistributorsWithSearch = useCallback(
    async (searchTerm = "", page = 1) => {
      if (targetType !== "distributor") return { data: [], hasMore: false };

      try {
        const res = await AllDistributorList();
        let data = res.data.data?.filter(u => u.status === true) || [];

        // Apply search filter
        if (searchTerm.trim()) {
          const lowerSearch = searchTerm.toLowerCase();
          data = data.filter(
            d => d.name?.toLowerCase().includes(lowerSearch) ||
                 d.dbCode?.toLowerCase().includes(lowerSearch)
          );
        }

        // Apply pagination
        const limit = 50;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = data.slice(startIndex, endIndex);

        return {
          data: paginatedData,
          pagination: {
            hasMore: endIndex < data.length,
          },
        };
      } catch (error) {
        console.error("Error searching distributors:", error);
        toast.error("Failed to search distributors");
        return { data: [], hasMore: false };
      }
    },
    [targetType],
  );

  // Fetch outlets with pagination and search
  const fetchOutletsWithSearch = useCallback(
    async (searchTerm = "", page = 1) => {
      if (targetType !== "outlet") return { data: [], hasMore: false };

      try {
        const query = {
          page: page,
          limit: 50,
          ...(searchTerm && { search: searchTerm.trim() }),
        };
        const response = await ApprovedOutletPaginated(query);
        const pagination = response?.data?.pagination || {};
        const data = response?.data?.data || [];

        return {
          data: data,
          pagination: {
            hasMore: page < (pagination.totalPages || 0),
          },
        };
      } catch (error) {
        console.error("Error searching outlets:", error);
        toast.error("Failed to search outlets");
        return { data: [], hasMore: false };
      }
    },
    [targetType],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const payload = {
        targetType,
        title,
        message,
        type,
        sendToAll,
        recipientIds: sendToAll ? [] : recipientIds,
      };

      const res = await SendNotification(payload);
      
      setResponse({ success: true, message: res.data.message || "Notification sent successfully!" });
      toast.success("Notification sent successfully!");

      // Reset form
      setTitle("");
      setMessage("");
      setRecipientIds([]);
      setSelectedRecipients([]);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to send notification";
      setResponse({ success: false, message: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipientChange = (selectedItems) => {
    const ids = selectedItems.map(item => item._id);
    setRecipientIds(ids);
    setSelectedRecipients(selectedItems);
  };

  const handleRemoveRecipient = (idToRemove) => {
    setRecipientIds(prev => prev.filter(id => id !== idToRemove));
    setSelectedRecipients(prev => prev.filter(r => r._id !== idToRemove));
  };

  // Clear selected recipients when targetType changes
  useEffect(() => {
    setSelectedRecipients([]);
    setRecipientIds([]);
  }, [targetType]);

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <HiBell className="text-blue-600" />
          Send Notification
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Send announcements and notifications to distributors or outlets
        </p>
      </div>

      {response && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            response.success 
              ? "bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400" 
              : "bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
          }`}
        >
          {response.message}
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target Type */}
          <div>
            <Label htmlFor="targetType" value="Whom to Send" />
            <Select
              id="targetType"
              value={targetType}
              onChange={(e) => {
                setTargetType(e.target.value);
                setRecipientIds([]);
              }}
              className="mt-1"
              required
            >
              <option value="">Select Target</option>
              <option value="distributor">Distributor</option>
              {/* <option value="outlet">Outlet</option> */}
            </Select>
          </div>

          {/* Send To All */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={sendToAll}
              disabled={!targetType}
              onChange={() => {
                setSendToAll(!sendToAll);
                if (!sendToAll) {
                  setRecipientIds([]);
                  setSelectedRecipients([]);
                }
              }}
              id="sendToAll"
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <Label htmlFor="sendToAll" className={`text-base font-medium ${!targetType ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
              Send to All {targetType === "distributor" ? `Distributors (${distributors.length})` : targetType === "outlet" ? "Outlets" : "Users"}
              {!targetType && <span className="text-xs ml-1">(Select target type first)</span>}
            </Label>
          </div>

          {/* Select Recipients - Paginated Searchable Dropdown */}
          {targetType && !sendToAll && (
            <div>
              <Label
                htmlFor="recipients"
                value={
                  <span className="flex items-center gap-1 text-gray-700 dark:text-gray-300 font-medium">
                    <HiUserGroup className="text-gray-500" />
                    Select Specific {targetType === "distributor" ? "Distributors" : "Outlets"}
                  </span>
                }
              />
              {fetchingUsers && targetType === "distributor" ? (
                <div className="flex items-center gap-2 mt-2 text-gray-500">
                  <Spinner size="sm" />
                  <span>Loading...</span>
                </div>
              ) : targetType === "distributor" ? (
                <div className="mt-1">
                  <PaginatedSearchableSelectForAnnouncement
                    fetchOptions={fetchDistributorsWithSearch}
                    value={recipientIds}
                    onChange={() => {}}
                    onSelectionChange={handleRecipientChange}
                    placeholder={`Search distributors...`}
                    multiple={true}
                    displayKey="name"
                    valueKey="_id"
                    descKey="dbCode"
                  />
                </div>
              ) : (
                <div className="mt-1">
                  <PaginatedSearchableSelectForAnnouncement
                    fetchOptions={fetchOutletsWithSearch}
                    value={recipientIds}
                    onChange={() => {}}
                    onSelectionChange={handleRecipientChange}
                    placeholder={`Search outlets...`}
                    multiple={true}
                    displayKey="outletName"
                    valueKey="_id"
                    descKey="outletUID"
                  />
                </div>
              )}
              {!fetchingUsers && targetType === "distributor" && distributors.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">No active distributors found</p>
              )}
            </div>
          )}

          {/* Display Selected Recipients */}
          {targetType && selectedRecipients.length > 0 && (
            <div>
              <Label value={`Selected ${sendToAll ? 'All ' : ''}${targetType === "distributor" ? "Distributors" : "Outlets"} ${sendToAll ? '' : `(${selectedRecipients.length})`}`} />
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedRecipients.map((recipient) => (
                  <div
                    key={recipient._id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg text-sm border border-blue-200 dark:border-blue-800"
                  >
                    <span className="font-medium">
                      {recipient.name || recipient.outletName || 'Unknown'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {recipient.dbCode || recipient.outletUID || ''}
                    </span>
                    {!sendToAll && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipient(recipient._id)}
                        className="ml-1 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Remove"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <Label htmlFor="title" value="Title" />
            <TextInput
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title"
              className="mt-1"
              required
            />
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message" value="Message" />
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your notification message"
              className="mt-1"
              rows={4}
              required
            />
          </div>

          {/* Type */}
          <div>
            <Label htmlFor="type" value="Notification Type" />
            <Select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1"
              required
            >
              {notificationTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto"
            color="blue"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                Sending...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <MdSend />
                Send Notification
              </span>
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Announcements;
