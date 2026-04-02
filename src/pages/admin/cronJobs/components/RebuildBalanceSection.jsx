import { useContext, useState } from "react";
import { Spinner } from "flowbite-react";
import toast from "react-hot-toast";
import { HiArrowRight } from "react-icons/hi";
import { MdPeopleAlt, MdStorefront } from "react-icons/md";
import { ConfirmationModelContext } from "../../../../context/ContextProvider";
import {
  rebuildDistributorBalance,
  rebuildRetailerBalance,
} from "../../../../api/configApi";

const RebuildBalanceSection = () => {
  const { openConfirmationModel } = useContext(ConfirmationModelContext);
  const [distributorLoading, setDistributorLoading] = useState(false);
  const [retailerLoading, setRetailerLoading] = useState(false);

  const runRebuild = async (type) => {
    const isDistributor = type === "distributor";
    const setLoading = isDistributor
      ? setDistributorLoading
      : setRetailerLoading;
    const apiFn = isDistributor
      ? rebuildDistributorBalance
      : rebuildRetailerBalance;
    const label = isDistributor ? "distributor" : "retailer";
    const countKey = isDistributor ? "distributors" : "retailers";

    setLoading(true);
    try {
      const res = await apiFn();
      const data = res.data;
      const stats = data[countKey];
      const processed = stats?.processed ?? 0;
      const txnsUpdated = stats?.txnsUpdated ?? 0;
      const errors = stats?.errors ?? [];

      if (errors.length > 0) {
        toast(
          `Completed with ${errors.length} error${errors.length > 1 ? "s" : ""}.\n${errors.slice(0, 3).join("\n")}`,
          { icon: "⚠️", duration: 6000 },
        );
      } else {
        toast.success(
          `Done — ${processed} ${label}${processed !== 1 ? "s" : ""} processed, ${txnsUpdated} transactions updated.`,
          { duration: 5000 },
        );
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        `Failed to rebuild ${label} balance.`;
      toast.error(message, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const confirmAndRun = (type) => {
    const label = type === "distributor" ? "distributor" : "retailer";
    openConfirmationModel({
      question: `This will recalculate all ${label} balances from last month to today. Are you sure?`,
      answer: ["Yes, Rebuild", "Cancel"],
      onClose: (confirmed) => {
        if (confirmed) runRebuild(type);
      },
    });
  };

  const anyLoading = distributorLoading || retailerLoading;

  return (
    <div className="space-y-3">
      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Distributor */}
        <div className="flex flex-col border border-blue-200 dark:border-blue-700 bg-blue-50/60 dark:bg-blue-900/20 rounded-xl p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-800/60 rounded-lg shrink-0">
              <MdPeopleAlt
                size={20}
                className="text-blue-600 dark:text-blue-300"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Distributor Balance
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Recalculate all distributor balances from last month to today.
              </p>
            </div>
          </div>
          <button
            onClick={() => confirmAndRun("distributor")}
            disabled={anyLoading}
            className="mt-auto flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {distributorLoading ? (
              <>
                <Spinner size="sm" />
                Rebuilding…
              </>
            ) : (
              <>
                Rebuild
                <HiArrowRight size={15} />
              </>
            )}
          </button>
        </div>

        {/* Retailer */}
        <div className="flex flex-col border border-violet-200 dark:border-violet-700 bg-violet-50/60 dark:bg-violet-900/20 rounded-xl p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-violet-100 dark:bg-violet-800/60 rounded-lg shrink-0">
              <MdStorefront
                size={20}
                className="text-violet-600 dark:text-violet-300"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                Retailer Balance
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Recalculate all retailer balances from last month to today.
              </p>
            </div>
          </div>
          <button
            onClick={() => confirmAndRun("retailer")}
            disabled={anyLoading}
            className="mt-auto flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 active:bg-violet-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {retailerLoading ? (
              <>
                <Spinner size="sm" />
                Rebuilding…
              </>
            ) : (
              <>
                Rebuild
                <HiArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RebuildBalanceSection;
