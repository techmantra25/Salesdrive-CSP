import { Spinner } from "flowbite-react";
import { HiChevronDown, HiChevronUp, HiRefresh } from "react-icons/hi";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaRegSave } from "react-icons/fa";
import {
  getAutoPendingBillCron,
  updateAutoPendingBillCron,
} from "../../../../api/configApi";

const AutoPendingBillCron = ({ canUpdate, refreshKey }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cronConfig, setCronConfig] = useState({
    cronTime: "",
    isActive: false,
    jobName: "autoPendingBillDelivery",
  });
  const [cronError, setCronError] = useState("");
  const [initialState, setInitialState] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchCronConfig();
  }, [refreshKey]);

  const fetchCronConfig = async () => {
    setLoading(true);
    setCronError("");
    try {
      const response = await getAutoPendingBillCron();
      const data = response?.data?.data || {};

      const newState = {
        cronTime: data?.cronTime || "",
        isActive: Boolean(data?.isActive),
        jobName: data?.job || "autoPendingBillDelivery",
      };

      setCronConfig(newState);
      setInitialState(newState);
    } catch (error) {
      console.error("Error fetching cron config:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load cron settings",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCronTimeChange = (e) => {
    setCronError("");
    setCronConfig((prev) => ({
      ...prev,
      cronTime: e.target.value,
    }));
  };

  const handleActiveToggle = () => {
    setCronConfig((prev) => ({
      ...prev,
      isActive: !prev.isActive,
    }));
  };

  const handleSave = async () => {
    const payload = {};
    const trimmedCron = cronConfig.cronTime.trim();

    setCronError("");

    if (trimmedCron !== initialState?.cronTime) {
      if (!trimmedCron) {
        setCronError("Cron time is required.");
        return;
      }
      payload.cronTime = trimmedCron;
    }

    if (cronConfig.isActive !== initialState?.isActive) {
      payload.isActive = cronConfig.isActive;
    }

    if (!Object.keys(payload).length) {
      toast("No changes to save");
      return;
    }

    setSaving(true);
    try {
      const response = await updateAutoPendingBillCron(payload);
      const updated = response?.data?.data || {};

      const newState = {
        cronTime: updated?.cronTime || payload.cronTime || cronConfig.cronTime,
        isActive:
          typeof updated?.isActive === "boolean"
            ? updated.isActive
            : (payload.isActive ?? cronConfig.isActive),
        jobName: updated?.job || cronConfig.jobName,
      };

      setCronConfig(newState);
      setInitialState(newState);
      toast.success("Cron settings updated successfully");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update cron";

      if (
        error?.response?.status === 400 &&
        /invalid cron expression/i.test(message)
      ) {
        setCronError(message);
      }

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefault = () => {
    setCronError("");
    setCronConfig((prev) => ({
      ...prev,
      cronTime: "5 0 1-4 * *",
    }));
  };

  const hasChanges =
    cronConfig.cronTime !== initialState?.cronTime ||
    cronConfig.isActive !== initialState?.isActive;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
      {/* Clickable header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              cronConfig.isActive
                ? "bg-green-500"
                : "bg-gray-300 dark:bg-gray-600"
            }`}
          />
          <span className="font-semibold text-sm text-gray-800 dark:text-white">
            Auto Delivery of Pending Bill for Multiplier
          </span>
          {!loading && initialState && (
            <span
              className={`hidden sm:inline-flex shrink-0 items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                cronConfig.isActive
                  ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {cronConfig.isActive ? "Active" : "Inactive"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2.5 shrink-0 ml-4">
          {!loading && initialState?.cronTime && (
            <span className="hidden sm:block font-mono text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700">
              {initialState.cronTime}
            </span>
          )}
          {open ? (
            <HiChevronUp size={16} className="text-gray-400" />
          ) : (
            <HiChevronDown size={16} className="text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20 px-5 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Job name + Status row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
                    Job Name
                  </p>
                  <p className="font-mono text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2.5 rounded-lg truncate">
                    {cronConfig.jobName || "autoPendingBillDelivery"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
                    Status
                  </p>
                  <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-2.5 rounded-lg">
                    <span
                      className={`text-sm font-medium ${
                        cronConfig.isActive
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {cronConfig.isActive ? "Enabled" : "Disabled"}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cronConfig.isActive}
                        onChange={handleActiveToggle}
                        className="sr-only peer"
                        disabled={!canUpdate || saving}
                      />
                      <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-green-500 disabled:opacity-50"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Cron expression */}
              <div>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5">
                  Cron Expression
                </p>
                <input
                  id="cronTime"
                  value={cronConfig.cronTime}
                  onChange={handleCronTimeChange}
                  placeholder="e.g., 5 0 1-4 * *"
                  disabled={!canUpdate || saving}
                  className={`w-full font-mono text-sm px-3 py-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition ${
                    cronError
                      ? "border-red-400 dark:border-red-500"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                />
                {cronError && (
                  <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
                    {cronError}
                  </p>
                )}
              </div>

              {/* Actions */}
              {canUpdate && (
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleResetDefault}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <HiRefresh size={13} />
                    Reset to default
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !hasChanges}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                  >
                    {saving ? <Spinner size="sm" /> : <FaRegSave size={13} />}
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AutoPendingBillCron;
