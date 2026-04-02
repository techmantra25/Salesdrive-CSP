import { useState } from "react";
import { Button, Modal, Label, Select, Spinner } from "flowbite-react";
import toast from "react-hot-toast";
import moment from "moment";
import PaginatedSearchableSelect from "../../../../components/PaginatedSearchableSelect";
import {
  processShadowMultiplier,
  startShadowRun,
  resumeShadowRun,
  getShadowRunStatus,
} from "../../../../api/retailerMultiplierShadowApi";

const months = [
  { name: "January", value: 1 },
  { name: "February", value: 2 },
  { name: "March", value: 3 },
  { name: "April", value: 4 },
  { name: "May", value: 5 },
  { name: "June", value: 6 },
  { name: "July", value: 7 },
  { name: "August", value: 8 },
  { name: "September", value: 9 },
  { name: "October", value: 10 },
  { name: "November", value: 11 },
  { name: "December", value: 12 },
];
const currentYear = moment().year();
const years = [];
for (let y = 2024; y <= currentYear; y++) {
  years.push(y);
}

const ShadowMultiplierButton = () => {
  const [shadowModalOpen, setShadowModalOpen] = useState(false);
  const [shadowLoading, setShadowLoading] = useState(false);
  const [lastRun, setLastRun] = useState(null);
  const [retailerId, setRetailerId] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [multiplierType, setMultiplierType] = useState("all");

  const fetchOutletsWithSearch = async (searchTerm = "", page = 1) => {
    try {
      const query = {
        page,
        limit: 50,
        ...(searchTerm && { search: searchTerm }),
      };
      const response = await (
        await import("../../../../api/api")
      ).SearchOutletsDropdown(query);
      const totalPages = response?.data?.pagination?.totalPages || 0;
      return {
        data: response?.data?.data || [],
        hasMore: page < totalPages,
      };
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch outlet list",
      );
      return { data: [], hasMore: false };
    }
  };

  const handleClose = () => {
    setShadowModalOpen(false);
  };

  const buildPayload = () => {
    const payload = {
      month: Number(selectedMonth),
      year: Number(selectedYear),
      multiplierType: multiplierType || "all",
    };
    if (retailerId.includes("all")) {
      payload.allRetailers = true;
    } else if (retailerId.length === 1) {
      payload.retailerId = retailerId[0];
    } else {
      payload.retailerIds = retailerId;
    }
    return payload;
  };

  const handleRunShadowMultiplier = async () => {
    if (
      !retailerId ||
      retailerId.length === 0 ||
      !selectedMonth ||
      !selectedYear
    ) {
      toast.error("Please select retailer(s), month, and year.");
      return;
    }
    setShadowLoading(true);
    setLastRun(null);
    try {
      const payload = buildPayload();

      let response;
      try {
        response = await startShadowRun(payload);
      } catch (err) {
        // fallback to legacy endpoint if new one is unavailable
        response = await processShadowMultiplier(payload);
      }

      toast.success(
        response?.data?.message || "Shadow multiplier started successfully.",
      );

      const runId =
        response?.data?.run?.runId ||
        response?.data?.runId ||
        response?.data?._id ||
        response?.data?.run?.id;

      if (runId) {
        try {
          const statusRes = await getShadowRunStatus(runId);
          setLastRun(statusRes?.data || response?.data || null);
        } catch {
          setLastRun(response?.data || null);
        }
      } else {
        setLastRun(response?.data || null);
      }

      setShadowModalOpen(false);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to process shadow multiplier",
      );
    } finally {
      setShadowLoading(false);
    }
  };

  const handleResume = async () => {
    const runId =
      lastRun?.run?.runId || lastRun?.runId || lastRun?._id || lastRun?.run?.id;

    if (!runId) {
      toast.error("No run ID available to resume.");
      return;
    }
    setShadowLoading(true);
    try {
      const res = await resumeShadowRun(runId);
      toast.success(res?.data?.message || "Resumed shadow run.");
      try {
        const statusRes = await getShadowRunStatus(runId);
        setLastRun(statusRes?.data || lastRun);
      } catch {
        // ignore
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to resume shadow run",
      );
    } finally {
      setShadowLoading(false);
    }
  };

  // Derive whether resume button should show from the run status
  const runStatus = lastRun?.run?.status || lastRun?.status;
  const canResume =
    lastRun &&
    runStatus &&
    runStatus !== "Completed" &&
    runStatus !== "Running";

  return (
    <>
      <Button
        color="warning"
        onClick={() => setShadowModalOpen(true)}
        title="Run Shadow Multiplier"
      >
        Run Shadow Multiplier
      </Button>

      <Modal show={shadowModalOpen} onClose={handleClose} size="md">
        {/* Header with amber accent bar */}
        <div className="relative">
          <div className="h-1 w-full rounded-t-lg bg-amber-400" />
          <Modal.Header className="border-b border-gray-100 pb-3 pt-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                <svg
                  className="h-4 w-4 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-base font-semibold text-gray-800">
                  Run Shadow Multiplier
                </p>
                <p className="text-xs font-normal text-gray-400">
                  Configure and process multiplier for selected retailers
                </p>
              </div>
            </div>
          </Modal.Header>
        </div>

        <Modal.Body className="px-6 py-5">
          <div className="flex flex-col gap-5">
            {/* Retailer */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="shadow-retailer-select"
                className="text-sm font-medium text-gray-700"
              >
                Retailer
                <span className="ml-1 text-red-500">*</span>
              </Label>
              <PaginatedSearchableSelect
                id="shadow-retailer-select"
                className="w-full"
                fetchOptions={fetchOutletsWithSearch}
                value={retailerId}
                onChange={(e) => setRetailerId(e.target.value)}
                placeholder="Select Retailer"
                displayKey="outletName"
                descKey="outletUID"
                valueKey="_id"
                searchPlaceholder="Search Retailer..."
                multiple={true}
              />
            </div>

            {/* Multiplier Type */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Multiplier Type
                <span className="ml-1 text-red-500">*</span>
              </Label>
              <Select
                value={multiplierType}
                onChange={(e) => setMultiplierType(e.target.value)}
                className="focus:border-amber-400 focus:ring-amber-400"
              >
                <option value="all">Both (All)</option>
                <option value="monthly">Monthly</option>
                <option value="consistency">Consistency</option>
              </Select>
            </div>

            {/* Month & Year side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Month
                  <span className="ml-1 text-red-500">*</span>
                </Label>
                <Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="focus:border-amber-400 focus:ring-amber-400"
                >
                  <option value="">Select Month</option>
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Year
                  <span className="ml-1 text-red-500">*</span>
                </Label>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="focus:border-amber-400 focus:ring-amber-400"
                >
                  <option value="">Select Year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Run status display */}
            {lastRun && (
              <div className="rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-xs text-gray-600 space-y-1">
                <div className="font-semibold text-gray-700">
                  Last Run Status
                </div>
                <div>
                  Status:{" "}
                  <span
                    className={
                      runStatus === "Completed"
                        ? "text-green-600 font-medium"
                        : runStatus === "Incomplete" || runStatus === "Failed"
                          ? "text-red-600 font-medium"
                          : "text-amber-600 font-medium"
                    }
                  >
                    {runStatus || "—"}
                  </span>
                </div>
                {lastRun?.run?.totalRetailers != null && (
                  <div>
                    Progress: {lastRun.run.processedRetailers ?? 0} /{" "}
                    {lastRun.run.totalRetailers} retailers
                    {lastRun.run.failedRetailers > 0 && (
                      <span className="ml-2 text-red-500">
                        ({lastRun.run.failedRetailers} failed)
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Loading state */}
            {shadowLoading && (
              <div className="flex items-center justify-center gap-2 rounded-lg bg-amber-50 py-3 text-sm text-amber-700">
                <Spinner size="sm" color="warning" />
                <span>Processing shadow multiplier…</span>
              </div>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <Button
            color="light"
            onClick={handleClose}
            disabled={shadowLoading}
            className="min-w-[80px]"
          >
            Cancel
          </Button>

          <Button
            color="warning"
            onClick={handleRunShadowMultiplier}
            disabled={shadowLoading}
            className="min-w-[80px]"
          >
            {shadowLoading ? "Running…" : "Run"}
          </Button>

          {canResume && (
            <Button
              size="sm"
              color="warning"
              outline={true}
              onClick={handleResume}
              disabled={shadowLoading}
              className="min-w-[120px]"
            >
              Resume Run
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ShadowMultiplierButton;
