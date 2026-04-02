import { useEffect, useState } from "react";
import { RiRefreshFill } from "react-icons/ri";
import {
  HiClock,
  HiChevronDown,
  HiChevronUp,
  HiShieldExclamation,
} from "react-icons/hi";
import { MdOutlineSchedule, MdAutorenew, MdBuild } from "react-icons/md";
import { useSelector } from "react-redux";
import AutoPendingBillCron from "./components/autoPendingBillCron";
import PartiallyDeliveredBillRetryCron from "./components/partiallyDeliveredBillRetryCron";
import PortalLockCheckingCron from "./components/portalLockCheckingCron";
import RebuildBalanceSection from "./components/RebuildBalanceSection";
import FixStockLedgerSection from "./components/FixStockLedgerSection";
import { getPagePermission } from "../../../utils/permissionHelper";

const CronSettings = () => {
  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (!permissionState?.data?.data) return;
    const permission = getPagePermission(permissionState, "cron-settings");
    setPagePermission(permission);
  }, [permissionState]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="p-6 max-w-4xl">
      {pagePermission?.view ? (
        <div className="space-y-6">
          {/* ── Header ─────────────────────────────────────────── */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/60 dark:to-indigo-800/40 rounded-xl shadow-sm">
                <MdOutlineSchedule
                  size={22}
                  className="text-indigo-600 dark:text-indigo-300"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Cron Settings
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Manage scheduled jobs and balance maintenance
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              title="Refresh all"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-colors"
            >
              <RiRefreshFill size={17} />
              Refresh
            </button>
          </div>

          {/* ── Info / Guide card ───────────────────────────────── */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/10 border border-indigo-200 dark:border-indigo-700 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-indigo-800 dark:text-indigo-100">
                <HiClock
                  size={16}
                  className="text-indigo-500 dark:text-indigo-400 shrink-0"
                />
                Timezone:&nbsp;
                <span className="font-mono bg-white/70 dark:bg-indigo-800/70 px-1.5 py-0.5 rounded text-xs border border-indigo-200 dark:border-indigo-600">
                  Asia/Kolkata
                </span>
                <span className="mx-1 text-indigo-300 dark:text-indigo-600">
                  •
                </span>
                <span className="text-indigo-700 dark:text-indigo-300 font-normal">
                  Changes apply immediately — no restart needed
                </span>
              </div>
              <button
                onClick={() => setShowGuide((v) => !v)}
                className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors"
              >
                Cron Guide
                {showGuide ? (
                  <HiChevronUp size={13} />
                ) : (
                  <HiChevronDown size={13} />
                )}
              </button>
            </div>
            {showGuide && (
              <div className="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-700 space-y-2 text-xs text-indigo-900 dark:text-indigo-100">
                <p className="font-mono font-semibold tracking-wide text-indigo-700 dark:text-indigo-300">
                  minute&nbsp; hour&nbsp; day-of-month&nbsp; month&nbsp;
                  day-of-week
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  <div className="flex items-center gap-2 bg-white/60 dark:bg-indigo-900/40 px-2.5 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-700">
                    <span className="font-mono bg-indigo-100 dark:bg-indigo-800 px-1.5 py-0.5 rounded text-indigo-700 dark:text-indigo-200">
                      5 0 1-4 * *
                    </span>
                    <span className="text-gray-600 dark:text-indigo-300">
                      → 1-4th of every month at 00:05
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/60 dark:bg-indigo-900/40 px-2.5 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-700">
                    <span className="font-mono bg-indigo-100 dark:bg-indigo-800 px-1.5 py-0.5 rounded text-indigo-700 dark:text-indigo-200">
                      0 2 * * *
                    </span>
                    <span className="text-gray-600 dark:text-indigo-300">
                      → Every day at 02:00
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Scheduled Jobs section ──────────────────────────── */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
            {/* Section header */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <MdOutlineSchedule
                  size={15}
                  className="text-gray-400 dark:text-gray-500"
                />
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Scheduled Jobs
                </span>
              </div>
              {/* Inline critical note */}
              <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-full px-2.5 py-1">
                <HiShieldExclamation size={13} className="shrink-0" />
                <span>Validate cron expressions before saving</span>
              </div>
            </div>

            {/* Cron cards */}
            <div className="p-4 space-y-2">
              <AutoPendingBillCron
                canUpdate={pagePermission?.update}
                refreshKey={refreshKey}
              />
              <PartiallyDeliveredBillRetryCron
                canUpdate={pagePermission?.update}
                refreshKey={refreshKey}
              />
              <PortalLockCheckingCron
                canUpdate={pagePermission?.update}
                refreshKey={refreshKey}
              />
            </div>
          </div>

          {/* ── Balance Management section ──────────────────────── */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
            {/* Section header */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <MdAutorenew
                  size={15}
                  className="text-gray-400 dark:text-gray-500"
                />
                <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  Balance Management
                </span>
              </div>
              {/* Order hint pill */}
              <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-full px-2.5 py-1">
                <HiShieldExclamation size={13} className="shrink-0" />
                <span>Run Distributor first, then Retailer</span>
              </div>
            </div>
            <div className="p-4">
              <RebuildBalanceSection />
            </div>
          </div>

          {/* ── Maintenance section ─────────────────────────────── */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
            {/* Section header */}
            <div className="flex items-center gap-2 px-5 py-3.5 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
              <MdBuild size={15} className="text-gray-400 dark:text-gray-500" />
              <span className="text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                Maintenance
              </span>
            </div>
            <div className="p-4">
              <FixStockLedgerSection />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400">
            You don&apos;t have permission to view this page.
          </p>
        </div>
      )}
    </div>
  );
};

export default CronSettings;
