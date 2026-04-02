import { useContext, useState } from "react";
import { Spinner } from "flowbite-react";
import toast from "react-hot-toast";
import {
  HiArrowRight,
  HiChevronDown,
  HiChevronUp,
  HiCheckCircle,
  HiExclamationCircle,
  HiX,
} from "react-icons/hi";
import { MdOutlineInventory2 } from "react-icons/md";
import { ConfirmationModelContext } from "../../../../context/ContextProvider";
import { fixStockLedgerAllDistributors } from "../../../../api/configApi";

const StatChip = ({ label, value, accent }) => {
  const colours = {
    green:
      "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300",
    blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300",
    amber:
      "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300",
    red: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-700 dark:text-red-300",
    gray: "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300",
  };
  return (
    <div
      className={`flex flex-col px-3 py-2.5 rounded-lg border ${colours[accent ?? "gray"]}`}
    >
      <span className="text-xs font-medium opacity-70 mb-0.5">{label}</span>
      <span className="text-lg font-bold leading-none">{value ?? "—"}</span>
    </div>
  );
};

const FixStockLedgerSection = () => {
  const { openConfirmationModel } = useContext(ConfirmationModelContext);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showDistributors, setShowDistributors] = useState(false);

  const safeParseJson = (value) => {
    if (typeof value !== "string") return value;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  };

  const toNumber = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  const isObject = (value) =>
    value !== null && typeof value === "object" && !Array.isArray(value);

  const findDeep = (input, predicate, maxDepth = 6) => {
    const queue = [{ node: input, depth: 0 }];

    while (queue.length > 0) {
      const { node, depth } = queue.shift();
      if (!node || depth > maxDepth) continue;

      if (predicate(node)) return node;

      if (Array.isArray(node)) {
        for (const item of node) {
          queue.push({ node: item, depth: depth + 1 });
        }
      } else if (isObject(node)) {
        for (const value of Object.values(node)) {
          queue.push({ node: value, depth: depth + 1 });
        }
      }
    }

    return null;
  };

  const runFix = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fixStockLedgerAllDistributors();
      const payload = res?.data ?? {};
      const payloadData = safeParseJson(payload?.data);
      const rootData = payloadData?.data ?? payloadData ?? {};

      const summaryNode =
        findDeep(
          rootData,
          (node) =>
            isObject(node) &&
            [
              "distributorsFound",
              "distributorsProcessed",
              "distributorsWithChanges",
              "productsProcessed",
              "totalDeleted",
              "totalInserted",
            ].some((key) => key in node),
        ) ??
        findDeep(
          payloadData,
          (node) =>
            isObject(node) &&
            [
              "distributorsFound",
              "distributorsProcessed",
              "distributorsWithChanges",
              "productsProcessed",
              "totalDeleted",
              "totalInserted",
            ].some((key) => key in node),
        ) ??
        findDeep(
          payload,
          (node) =>
            isObject(node) &&
            [
              "distributorsFound",
              "distributorsProcessed",
              "distributorsWithChanges",
              "productsProcessed",
              "totalDeleted",
              "totalInserted",
            ].some((key) => key in node),
        );

      const distributorArrayNode =
        findDeep(
          rootData,
          (node) =>
            Array.isArray(node) &&
            node.every((item) => !item || isObject(item)) &&
            node.some(
              (item) =>
                isObject(item) &&
                ("distributorId" in item ||
                  "distributorName" in item ||
                  "distributorCode" in item),
            ),
        ) ??
        findDeep(
          payloadData,
          (node) =>
            Array.isArray(node) &&
            node.every((item) => !item || isObject(item)) &&
            node.some(
              (item) =>
                isObject(item) &&
                ("distributorId" in item ||
                  "distributorName" in item ||
                  "distributorCode" in item),
            ),
        ) ??
        findDeep(
          payload,
          (node) =>
            Array.isArray(node) &&
            node.every((item) => !item || isObject(item)) &&
            node.some(
              (item) =>
                isObject(item) &&
                ("distributorId" in item ||
                  "distributorName" in item ||
                  "distributorCode" in item),
            ),
        );

      const distributors = Array.isArray(distributorArrayNode)
        ? distributorArrayNode
        : [];

      const derivedSummary = {
        distributorsFound: distributors.length,
        distributorsProcessed: distributors.length,
        distributorsWithChanges: distributors.filter(
          (dist) =>
            toNumber(dist?.totalDeleted) > 0 ||
            toNumber(dist?.totalInserted) > 0,
        ).length,
        distributorErrors: distributors.reduce(
          (acc, dist) => acc + toNumber(dist?.errors),
          0,
        ),
        productsProcessed: distributors.reduce(
          (acc, dist) => acc + toNumber(dist?.productsProcessed),
          0,
        ),
        totalDeleted: distributors.reduce(
          (acc, dist) => acc + toNumber(dist?.totalDeleted),
          0,
        ),
        totalInserted: distributors.reduce(
          (acc, dist) => acc + toNumber(dist?.totalInserted),
          0,
        ),
        totalProductErrors: 0,
        orphansDetected: distributors.reduce(
          (acc, dist) => acc + toNumber(dist?.orphansDetected),
          0,
        ),
      };

      const summary = {
        ...derivedSummary,
        ...(summaryNode && typeof summaryNode === "object" ? summaryNode : {}),
      };

      const dateRange =
        rootData?.dateRange ?? payloadData?.dateRange ?? payload?.dateRange;

      const triggeredBy =
        payload?.triggeredBy ??
        rootData?.triggeredBy ??
        payloadData?.triggeredBy;

      const timestamp =
        payload?.timestamp ?? rootData?.timestamp ?? payloadData?.timestamp;

      const message =
        payload?.message ?? rootData?.message ?? payloadData?.message;

      setResult({
        ok: payload?.success !== false,
        data: {
          summary,
          distributors,
          dateRange,
          triggeredBy,
          timestamp,
          message,
        },
      });

      const errs = toNumber(summary?.distributorErrors);
      const errText = errs > 1 ? "s" : "";
      if (errs > 0) {
        toast(`Completed with ${errs} distributor error${errText}.`, {
          icon: "⚠️",
          duration: 6000,
        });
      } else {
        toast.success("Stock ledger fix completed successfully.", {
          duration: 5000,
        });
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fix stock ledger.";
      toast.error(message, { duration: 5000 });
      setResult({ ok: false, message });
    } finally {
      setLoading(false);
    }
  };

  const confirmAndRun = () => {
    openConfirmationModel({
      question:
        "This will recalculate stock ledgers for ALL distributors from last month to today. The job may take several minutes. Are you sure?",
      answer: ["Yes, Fix Now", "Cancel"],
      onClose: (confirmed) => {
        if (confirmed) runFix();
      },
    });
  };

  const downloadCsvReport = () => {
    if (!result?.ok || !result?.data) return;

    const report = result.data;
    const csvEscape = (value) => {
      if (value == null) return "";
      const text = String(value).replace(/"/g, '""');
      return /[",\n\r]/.test(text) ? `"${text}"` : text;
    };

    const rows = [];
    rows.push(["Stock Ledger Fix Report"]);
    rows.push(["Generated At", new Date().toLocaleString()]);

    if (report?.triggeredBy) {
      rows.push(["Triggered By", report.triggeredBy]);
    }
    if (report?.dateRange?.start) {
      rows.push(["Start", report.dateRange.start]);
    }
    if (report?.dateRange?.end) {
      rows.push(["End", report.dateRange.end]);
    }

    rows.push([]);
    rows.push(["Summary"]);
    rows.push(["Metric", "Value"]);

    const summary = report?.summary ?? {};
    const summaryRows = [
      ["Distributors Found", summary?.distributorsFound],
      ["Distributors Processed", summary?.distributorsProcessed],
      ["Distributors With Changes", summary?.distributorsWithChanges],
      ["Distributor Errors", summary?.distributorErrors],
      ["Products Processed", summary?.productsProcessed],
      ["Total Deleted", summary?.totalDeleted],
      ["Total Inserted", summary?.totalInserted],
      ["Total Product Errors", summary?.totalProductErrors],
      ["Orphans Detected", summary?.orphansDetected],
    ];
    summaryRows.forEach((row) => rows.push(row));

    rows.push([]);
    rows.push(["Distributor Breakdown"]);
    rows.push([
      "Distributor ID",
      "Distributor Code",
      "Distributor Name",
      "Products Processed",
      "Products With Transactions",
      "Products With Ledgers",
      "Successfully Fixed",
      "Total Deleted",
      "Total Inserted",
      "Orphans Detected",
      "Errors",
    ]);

    const distributors = Array.isArray(report?.distributors)
      ? report.distributors
      : [];

    distributors.forEach((dist) => {
      rows.push([
        dist?.distributorId,
        dist?.distributorCode,
        dist?.distributorName,
        dist?.productsProcessed,
        dist?.productsWithTransactions,
        dist?.productsWithLedgers,
        dist?.successfullyFixed,
        dist?.totalDeleted,
        dist?.totalInserted,
        dist?.orphansDetected,
        dist?.errors,
      ]);
    });

    const csvContent = rows
      .map((row) => row.map((cell) => csvEscape(cell)).join(","))
      .join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");

    link.href = url;
    link.download = `stock-ledger-fix-report-${stamp}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const d = result?.data;
  const summary = d?.summary ?? {};

  return (
    <div className="space-y-4">
      {/* Button card */}
      <div className="flex flex-col border border-emerald-200 dark:border-emerald-700 bg-emerald-50/60 dark:bg-emerald-900/20 rounded-xl p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-800/60 rounded-lg shrink-0">
            <MdOutlineInventory2
              size={20}
              className="text-emerald-600 dark:text-emerald-300"
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              Fix Stock Ledger (All Distributors)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Recalculates affected product ledgers from transactions and orphan
              entries for every distributor. Runs sequentially — errors are
              captured and the job continues.
            </p>
          </div>
        </div>
        <button
          onClick={confirmAndRun}
          disabled={loading}
          className="mt-auto flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <Spinner size="sm" />
              Fixing…
            </>
          ) : (
            <>
              Fix Stock Ledger
              <HiArrowRight size={15} />
            </>
          )}
        </button>
      </div>

      {/* Result panel */}
      {result && (
        <div
          className={`rounded-xl border ${
            result.ok
              ? "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
              : "border-red-200 dark:border-red-700 bg-red-50/60 dark:bg-red-900/10"
          } overflow-hidden shadow-sm`}
        >
          {/* Result header */}
          <div
            className={`flex items-center justify-between px-4 py-3 ${
              result.ok
                ? "bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700"
                : "border-b border-red-200 dark:border-red-700"
            }`}
          >
            <div className="flex items-center gap-2">
              {result.ok ? (
                <HiCheckCircle
                  size={16}
                  className={
                    (summary?.distributorErrors ?? 0) > 0
                      ? "text-amber-500"
                      : "text-green-500"
                  }
                />
              ) : (
                <HiExclamationCircle size={16} className="text-red-500" />
              )}
              <span className="text-sm font-semibold text-gray-800 dark:text-white">
                {result.ok ? "Fix Complete" : "Fix Failed"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {result.ok && (
                <button
                  onClick={downloadCsvReport}
                  className="px-2.5 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Download CSV
                </button>
              )}
              <button
                onClick={() => setResult(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <HiX size={15} />
              </button>
            </div>
          </div>

          {result.ok ? (
            <div className="p-4 space-y-4">
              {(d?.dateRange?.start || d?.dateRange?.end || d?.triggeredBy) && (
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 px-3 py-2 text-xs text-gray-600 dark:text-gray-300 flex flex-wrap gap-x-4 gap-y-1">
                  {d?.triggeredBy && (
                    <span>
                      Triggered By:{" "}
                      <span className="font-semibold">{d.triggeredBy}</span>
                    </span>
                  )}
                  {d?.dateRange?.start && (
                    <span>
                      Start:{" "}
                      <span className="font-semibold">
                        {new Date(d.dateRange.start).toLocaleString()}
                      </span>
                    </span>
                  )}
                  {d?.dateRange?.end && (
                    <span>
                      End:{" "}
                      <span className="font-semibold">
                        {new Date(d.dateRange.end).toLocaleString()}
                      </span>
                    </span>
                  )}
                </div>
              )}

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <StatChip
                  label="Distributors Found"
                  value={summary?.distributorsFound}
                  accent="blue"
                />
                <StatChip
                  label="Processed"
                  value={summary?.distributorsProcessed}
                  accent="green"
                />
                <StatChip
                  label="With Changes"
                  value={summary?.distributorsWithChanges}
                  accent="amber"
                />
                <StatChip
                  label="Errors"
                  value={summary?.distributorErrors}
                  accent={summary?.distributorErrors > 0 ? "red" : "gray"}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <StatChip
                  label="Products Processed"
                  value={summary?.productsProcessed}
                  accent="blue"
                />
                <StatChip
                  label="Deleted"
                  value={summary?.totalDeleted}
                  accent="amber"
                />
                <StatChip
                  label="Inserted"
                  value={summary?.totalInserted}
                  accent="green"
                />
                <StatChip
                  label="Product Errors"
                  value={summary?.totalProductErrors}
                  accent={summary?.totalProductErrors > 0 ? "red" : "gray"}
                />
              </div>
              {summary?.orphansDetected != null && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <StatChip
                    label="Orphans Detected"
                    value={summary.orphansDetected}
                    accent="amber"
                  />
                </div>
              )}

              {/* Per-distributor collapsible table */}
              {Array.isArray(d?.distributors) && d.distributors.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowDistributors((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-700/40 transition-colors text-left"
                  >
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
                      Per-Distributor Breakdown ({d.distributors.length})
                    </span>
                    {showDistributors ? (
                      <HiChevronUp size={14} className="text-gray-400" />
                    ) : (
                      <HiChevronDown size={14} className="text-gray-400" />
                    )}
                  </button>
                  {showDistributors && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left px-3 py-2 font-semibold text-gray-500 dark:text-gray-400">
                              Distributor
                            </th>
                            <th className="text-center px-3 py-2 font-semibold text-gray-500 dark:text-gray-400">
                              Products
                            </th>
                            <th className="text-center px-3 py-2 font-semibold text-gray-500 dark:text-gray-400">
                              Deleted
                            </th>
                            <th className="text-center px-3 py-2 font-semibold text-gray-500 dark:text-gray-400">
                              Inserted
                            </th>
                            <th className="text-center px-3 py-2 font-semibold text-gray-500 dark:text-gray-400">
                              Errors
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {d.distributors.map((dist, i) => (
                            <tr
                              key={dist.distributorId ?? i}
                              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                            >
                              <td className="px-3 py-2 text-gray-700 dark:text-gray-300 max-w-[240px]">
                                <div className="font-medium truncate">
                                  {dist.distributorName ??
                                    dist.distributorCode ??
                                    `#${i + 1}`}
                                </div>
                                {dist.distributorCode && (
                                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                    {dist.distributorCode}
                                  </div>
                                )}
                              </td>
                              <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400">
                                {dist.productsProcessed ?? "—"}
                              </td>
                              <td className="px-3 py-2 text-center text-amber-600 dark:text-amber-400">
                                {dist.totalDeleted ?? "—"}
                              </td>
                              <td className="px-3 py-2 text-center text-green-600 dark:text-green-400">
                                {dist.totalInserted ?? "—"}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {(typeof dist.errors === "number"
                                  ? dist.errors
                                  : 0) > 0 ? (
                                  <span className="text-red-500 dark:text-red-400 font-semibold">
                                    {dist.errors}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">0</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {result.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default FixStockLedgerSection;
