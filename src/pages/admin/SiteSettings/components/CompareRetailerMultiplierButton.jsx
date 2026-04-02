import { useState } from "react";
import {
  Button,
  Modal,
  Spinner,
  Table,
  Badge,
  Label,
  Select,
} from "flowbite-react";
import toast from "react-hot-toast";
import PaginatedSearchableSelect from "../../../../components/PaginatedSearchableSelect";
import {
  compareRetailerMultiplierTransactions,
  downloadCompareRetailerMultiplierCSV,
  downloadCompareRetailerMultiplierXLSX, // NEW — add this to your api file (see note below)
  fixShadowVsMainMultiplier,
} from "../../../../api/retailerMultiplierTransactionApi";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const MONTHS = [
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
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 2023 }, (_, i) => 2024 + i);

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const buildParams = ({
  retailerId,
  selectedMonth,
  selectedYear,
  multiplierType,
}) => {
  const params = {
    month: selectedMonth ? Number(selectedMonth) : undefined,
    year: selectedYear ? Number(selectedYear) : undefined,
    multiplierType: multiplierType || undefined,
  };
  if (retailerId?.length > 0) {
    if (retailerId.includes("all")) params.allRetailers = true;
    else if (retailerId.length === 1) params.retailerId = retailerId[0];
    else params.retailerIds = retailerId;
  }
  return params;
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
const CompareRetailerMultiplierButton = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [xlsxLoading, setXlsxLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [fixLoading, setFixLoading] = useState(false);

  const [summary, setSummary] = useState(null);
  const [onlyInMain, setOnlyInMain] = useState([]);
  const [onlyInShadow, setOnlyInShadow] = useState([]);
  const [fieldDiffs, setFieldDiffs] = useState([]);
  const [activeTab, setActiveTab] = useState("summary");

  const [retailerId, setRetailerId] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [multiplierType, setMultiplierType] = useState("all");

  const fetchOutletsWithSearch = async (searchTerm = "", page = 1) => {
    try {
      const response = await (
        await import("../../../../api/api")
      ).SearchOutletsDropdown({
        page,
        limit: 50,
        ...(searchTerm && { search: searchTerm }),
      });
      return {
        data: response?.data?.data || [],
        hasMore: page < (response?.data?.pagination?.totalPages || 0),
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

  const handleCompare = async () => {
    setLoading(true);
    setSummary(null);
    setOnlyInMain([]);
    setOnlyInShadow([]);
    setFieldDiffs([]);
    setActiveTab("summary");
    try {
      const params = buildParams({
        retailerId,
        selectedMonth,
        selectedYear,
        multiplierType,
      });
      const response = await compareRetailerMultiplierTransactions(params);
      const { summary: s, diffs } = response.data;
      if (!s || !Array.isArray(diffs)) {
        toast.error("Unexpected response shape from server.");
        return;
      }
      setSummary(s);
      setOnlyInMain(diffs.filter((d) => d.diffType === "onlyInMain"));
      setOnlyInShadow(diffs.filter((d) => d.diffType === "onlyInShadow"));
      setFieldDiffs(diffs.filter((d) => d.diffType === "fieldMismatch"));
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to compare transactions",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Excel audit report download (new) ─────────────────────────────────────
  const handleDownloadXLSX = async () => {
    setXlsxLoading(true);
    try {
      const params = buildParams({
        retailerId,
        selectedMonth,
        selectedYear,
        multiplierType,
      });
      const response = await downloadCompareRetailerMultiplierXLSX(params);
      const url = window.URL.createObjectURL(
        new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "multiplier_audit_report.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Audit report downloaded!");
    } catch (error) {
      toast.error(error?.message || "XLSX download failed");
    } finally {
      setXlsxLoading(false);
    }
  };

  // ── CSV zip download (legacy) ──────────────────────────────────────────────
  const handleDownloadCSV = async () => {
    setCsvLoading(true);
    try {
      const params = buildParams({
        retailerId,
        selectedMonth,
        selectedYear,
        multiplierType,
      });
      const response = await downloadCompareRetailerMultiplierCSV(params);
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/zip" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "retailer-multiplier-comparison.zip");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error?.message || "ZIP download failed");
    } finally {
      setCsvLoading(false);
    }
  };

  const handleFix = async () => {
    if (!summary) return;
    if (!window.confirm("Proceed to fix differences for the current filters?"))
      return;
    setFixLoading(true);
    try {
      const params = buildParams({
        retailerId,
        selectedMonth,
        selectedYear,
        multiplierType,
      });
      const response = await fixShadowVsMainMultiplier(params);
      const data = response?.data;
      toast.success(data?.message || "Fix operation completed.");
      // Refresh comparison to reflect changes
      await handleCompare();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "Fix failed",
      );
    } finally {
      setFixLoading(false);
    }
  };

  const tabs = [
    { key: "summary", label: "Summary" },
    { key: "fieldDiffs", label: `Field Mismatches (${fieldDiffs.length})` },
    { key: "onlyInMain", label: `Only in Main (${onlyInMain.length})` },
    { key: "onlyInShadow", label: `Only in Shadow (${onlyInShadow.length})` },
  ];

  return (
    <>
      <Button
        color="info"
        onClick={() => {
          setModalOpen(true);
          handleCompare();
        }}
      >
        Compare Multiplier
      </Button>

      <Modal show={modalOpen} onClose={() => setModalOpen(false)} size="7xl">
        <Modal.Header>Compare Retailer Multiplier Transactions</Modal.Header>
        <Modal.Body>
          {/* ── Filter bar ──────────────────────────────────────────────────── */}
          <div className="flex flex-wrap justify-between items-end gap-3 mb-4">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <Label className="text-sm">Retailer</Label>
                <div className="w-72">
                  <PaginatedSearchableSelect
                    id="compare-retailer-select"
                    fetchOptions={fetchOutletsWithSearch}
                    value={retailerId}
                    onChange={(e) => setRetailerId(e.target.value)}
                    placeholder="Select Retailer"
                    displayKey="outletName"
                    descKey="outletUID"
                    valueKey="_id"
                    searchPlaceholder="Search Retailer..."
                    multiple
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-sm">Multiplier Type</Label>
                <Select
                  value={multiplierType}
                  onChange={(e) => setMultiplierType(e.target.value)}
                >
                  <option value="all">Both (All)</option>
                  <option value="monthly">Monthly</option>
                  <option value="consistency">Consistency</option>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-sm">Month</Label>
                <Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="">All Months</option>
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <Label className="text-sm">Year</Label>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="">All Years</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* ── Action buttons ─────────────────────────────────────────── */}
            <div className="flex gap-2 flex-wrap">
              <Button
                color="light"
                size="xs"
                onClick={handleCompare}
                disabled={loading}
              >
                {loading ? "Running…" : "Re-run"}
              </Button>

              <Button
                color="warning"
                size="xs"
                onClick={handleFix}
                disabled={!summary || fixLoading}
                title="Fix differences in Main using Shadow values for current filters"
              >
                {fixLoading ? (
                  <>
                    <Spinner size="xs" className="mr-1" /> Fixing…
                  </>
                ) : (
                  "Fix"
                )}
              </Button>

              {/* PRIMARY: Excel audit report */}
              <Button
                color="success"
                size="xs"
                onClick={handleDownloadXLSX}
                disabled={!summary || xlsxLoading}
                title="Download formatted Excel audit report"
              >
                {xlsxLoading ? (
                  <>
                    <Spinner size="xs" className="mr-1" /> Generating…
                  </>
                ) : (
                  "⬇ Audit Report (XLSX)"
                )}
              </Button>

              {/* SECONDARY: legacy CSV zip */}
              <Button
                color="light"
                size="xs"
                onClick={handleDownloadCSV}
                disabled={!summary || csvLoading}
                title="Download raw CSV files (zip)"
              >
                {csvLoading ? <Spinner size="xs" /> : "⬇ Raw CSV (ZIP)"}
              </Button>
            </div>
          </div>

          {/* ── Body ─────────────────────────────────────────────────────────── */}
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Spinner size="lg" />
            </div>
          ) : summary ? (
            <>
              {/* Sync status banner */}
              <div
                className={`mb-4 p-3 rounded text-sm font-medium ${
                  summary.isDifferent
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-green-50 text-green-700 border border-green-200"
                }`}
              >
                {summary.isDifferent
                  ? "⚠️ Differences found between Main and Shadow collections."
                  : "✅ Collections are in sync. No differences found."}
              </div>

              {/* Tab nav */}
              <div className="flex gap-2 mb-4 border-b border-gray-200">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* ── Summary tab ───────────────────────────────────────────── */}
              {activeTab === "summary" && (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      label: "Total in Main",
                      value: summary.totalMain,
                      color: "gray",
                    },
                    {
                      label: "Total in Shadow",
                      value: summary.totalShadow,
                      color: "gray",
                    },
                    {
                      label: "Matched (identical)",
                      value: summary.matched,
                      color: "green",
                    },
                    {
                      label: "Only in Main",
                      value: summary.onlyInMain,
                      color: summary.onlyInMain > 0 ? "red" : "green",
                    },
                    {
                      label: "Only in Shadow",
                      value: summary.onlyInShadow,
                      color: summary.onlyInShadow > 0 ? "red" : "green",
                    },
                    {
                      label: "Field Mismatches",
                      value: summary.fieldMismatches,
                      color: summary.fieldMismatches > 0 ? "yellow" : "green",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="border rounded p-3 text-center"
                    >
                      <div className="text-xs text-gray-500 mb-1">
                        {item.label}
                      </div>
                      <Badge
                        color={item.color}
                        className="justify-center text-lg font-bold"
                      >
                        {item.value ?? "—"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Field Mismatches tab ──────────────────────────────────── */}
              {activeTab === "fieldDiffs" &&
                (fieldDiffs.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No field mismatches found.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table striped>
                      <Table.Head>
                        <Table.HeadCell>Outlet UID</Table.HeadCell>
                        <Table.HeadCell>Outlet Name</Table.HeadCell>
                        <Table.HeadCell>Retailer Code</Table.HeadCell>
                        <Table.HeadCell>Retailer Name</Table.HeadCell>
                        <Table.HeadCell>Transaction For</Table.HeadCell>
                        <Table.HeadCell>Field</Table.HeadCell>
                        <Table.HeadCell>Main Value</Table.HeadCell>
                        <Table.HeadCell>Shadow Value</Table.HeadCell>
                        <Table.HeadCell>Delta</Table.HeadCell>
                      </Table.Head>
                      <Table.Body>
                        {fieldDiffs.map((item, idx) =>
                          item.details.map((diff, dIdx) => (
                            <Table.Row key={`${idx}-${dIdx}`}>
                              {dIdx === 0 && (
                                <>
                                  <Table.Cell
                                    rowSpan={item.details.length}
                                    className="font-mono text-xs align-top"
                                  >
                                    {item.outletUID || "—"}
                                  </Table.Cell>
                                  <Table.Cell
                                    rowSpan={item.details.length}
                                    className="align-top text-xs"
                                  >
                                    {item.outletName || "—"}
                                  </Table.Cell>
                                  <Table.Cell
                                    rowSpan={item.details.length}
                                    className="align-top text-xs"
                                  >
                                    {item.retailerCode || "—"}
                                  </Table.Cell>
                                  <Table.Cell
                                    rowSpan={item.details.length}
                                    className="align-top text-xs"
                                  >
                                    {item.retailerName || "—"}
                                  </Table.Cell>
                                  <Table.Cell
                                    rowSpan={item.details.length}
                                    className="align-top"
                                  >
                                    {item.transactionFor}
                                  </Table.Cell>
                                </>
                              )}
                              <Table.Cell className="font-medium">
                                {diff.field}
                              </Table.Cell>
                              <Table.Cell>{diff.mainValue ?? "—"}</Table.Cell>
                              <Table.Cell>{diff.shadowValue ?? "—"}</Table.Cell>
                              <Table.Cell>
                                {diff.delta !== null &&
                                diff.delta !== undefined ? (
                                  <span
                                    className={
                                      diff.delta > 0
                                        ? "text-blue-600"
                                        : "text-red-600"
                                    }
                                  >
                                    {diff.delta > 0
                                      ? `+${diff.delta}`
                                      : diff.delta}
                                  </span>
                                ) : (
                                  "—"
                                )}
                              </Table.Cell>
                            </Table.Row>
                          )),
                        )}
                      </Table.Body>
                    </Table>
                  </div>
                ))}

              {/* ── Only in Main tab ──────────────────────────────────────── */}
              {activeTab === "onlyInMain" &&
                (onlyInMain.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    All main records exist in shadow.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table striped>
                      <Table.Head>
                        <Table.HeadCell>Outlet UID</Table.HeadCell>
                        <Table.HeadCell>Outlet Name</Table.HeadCell>
                        <Table.HeadCell>Transaction For</Table.HeadCell>
                        <Table.HeadCell>Slab %</Table.HeadCell>
                        <Table.HeadCell>Month Total Points</Table.HeadCell>
                        <Table.HeadCell>Point</Table.HeadCell>
                      </Table.Head>
                      <Table.Body>
                        {onlyInMain.map((diff, idx) => (
                          <Table.Row key={idx}>
                            <Table.Cell className="font-mono text-xs">
                              {diff.outletUID || "—"}
                            </Table.Cell>
                            <Table.Cell className="text-xs">
                              {diff.outletName || "—"}
                            </Table.Cell>
                            <Table.Cell>{diff.transactionFor}</Table.Cell>
                            <Table.Cell>
                              {diff.main?.slabPercentage ?? "—"}
                            </Table.Cell>
                            <Table.Cell>
                              {diff.main?.monthTotalPoints ?? "—"}
                            </Table.Cell>
                            <Table.Cell>{diff.main?.point ?? "—"}</Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                  </div>
                ))}

              {/* ── Only in Shadow tab ────────────────────────────────────── */}
              {activeTab === "onlyInShadow" &&
                (onlyInShadow.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    All shadow records exist in main.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table striped>
                      <Table.Head>
                        <Table.HeadCell>Outlet UID</Table.HeadCell>
                        <Table.HeadCell>Outlet Name</Table.HeadCell>
                        <Table.HeadCell>Retailer Code</Table.HeadCell>
                        <Table.HeadCell>Retailer Name</Table.HeadCell>
                        <Table.HeadCell>Transaction For</Table.HeadCell>
                        <Table.HeadCell>Slab %</Table.HeadCell>
                        <Table.HeadCell>Month Total Points</Table.HeadCell>
                        <Table.HeadCell>Point</Table.HeadCell>
                      </Table.Head>
                      <Table.Body>
                        {onlyInShadow.map((diff, idx) => (
                          <Table.Row key={idx}>
                            <Table.Cell className="font-mono text-xs">
                              {diff.outletUID || "—"}
                            </Table.Cell>
                            <Table.Cell className="text-xs">
                              {diff.outletName || "—"}
                            </Table.Cell>
                            <Table.Cell className="text-xs">
                              {diff.retailerCode || "—"}
                            </Table.Cell>
                            <Table.Cell className="text-xs">
                              {diff.retailerName || "—"}
                            </Table.Cell>
                            <Table.Cell>{diff.transactionFor}</Table.Cell>
                            <Table.Cell>
                              {diff.shadow?.slabPercentage ?? "—"}
                            </Table.Cell>
                            <Table.Cell>
                              {diff.shadow?.monthTotalPoints ?? "—"}
                            </Table.Cell>
                            <Table.Cell>{diff.shadow?.point ?? "—"}</Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                  </div>
                ))}
            </>
          ) : (
            <p className="text-gray-400 text-sm text-center py-10">
              Click <strong>Re-run</strong> to start the comparison.
            </p>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default CompareRetailerMultiplierButton;
