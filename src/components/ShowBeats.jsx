import { Modal, Spinner } from "flowbite-react";
import { useEffect, useMemo, useState } from "react";
import { getDistributorsBeats } from "../api/api";
import StatusIndicator from "../assets/common/StatusIndicator";
import UniqueCode from "../assets/common/UniqueCode";

export const ShowBeats = ({
  showBeatsModal,
  onCloseBeatsModal,
  usedIn,
  config,
}) => {
  const [beatsModalLoading, setBeatsModalLoading] = useState(true);
  const [beats, setBeats] = useState([]);

  // -----------------------------
  // Fetch beats for distributor
  // -----------------------------
  const getBeats = async (distributor) => {
    try {
      setBeatsModalLoading(true);
      const res = await getDistributorsBeats(distributor?._id);
      setBeats(res?.data?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setBeatsModalLoading(false);
    }
  };

  // -----------------------------
  // Initial load logic
  // -----------------------------
  useEffect(() => {
    if (!config) return;

    if (usedIn === "distributor") {
      getBeats(config?.distributor);
    }

    if (usedIn === "beat-mapping") {
      setBeats(config?.beats || []);
      setBeatsModalLoading(false);
    }
  }, [config, usedIn]);

  // -----------------------------
  // Group beats by REGION
  // (robust against unpopulated beat.regionId)
  // -----------------------------
  const groupedBeatsByRegion = useMemo(() => {
    return beats.reduce((acc, beat) => {
      const regionName =
        beat?.regionId?.name ||
        config?.employee?.regionId?.name ||
        config?.regionId?.name ||
        "Unknown Region";

      if (!acc[regionName]) {
        acc[regionName] = [];
      }

      acc[regionName].push(beat);
      return acc;
    }, {});
  }, [beats, config]);

  return (
    <Modal show={showBeatsModal} onClose={onCloseBeatsModal} size="6xl">
      <Modal.Header>
        {usedIn === "distributor" &&
          `${config?.distributor?.name} (${config?.distributor?.dbCode}) Beats`}
        {usedIn === "beat-mapping" &&
          "Employee Beat Mapping (Region Wise)"}
      </Modal.Header>

      <Modal.Body>
        {/* LOADING */}
        {beatsModalLoading && (
          <div className="flex justify-center items-center py-6">
            <Spinner size="lg" />
          </div>
        )}

        {/* NO DATA */}
        {!beatsModalLoading && beats.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-6">
            No Beats Found
          </div>
        )}

        {/* REGION-WISE BEATS */}
        {!beatsModalLoading &&
          beats.length > 0 &&
          Object.entries(groupedBeatsByRegion).map(
            ([regionName, regionBeats]) => (
              <div key={regionName} className="mb-6">
                {/* REGION TITLE */}
                <div className="mb-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                  Region: {regionName} ({regionBeats.length})
                </div>

                {/* REGION TABLE */}
                <div className="overflow-x-auto w-full">
                  <table className="min-w-full text-xs border border-gray-200 dark:border-gray-700">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                        <th className="px-2 py-1 text-center whitespace-nowrap">
                          Beat Name
                        </th>
                        <th className="px-2 py-1 text-center whitespace-nowrap">
                          Beat Code
                        </th>
                        <th className="px-2 py-1 text-center whitespace-nowrap">
                          Beat Type
                        </th>
                        <th className="px-2 py-1 text-center whitespace-nowrap">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {regionBeats.map((beat) => (
                        <tr
                          key={beat._id}
                          className="text-center border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="px-2 py-1 font-medium text-gray-900 dark:text-gray-200">
                            {beat?.name}
                          </td>
                          <td className="px-2 py-1 font-medium text-gray-900 dark:text-gray-200">
                            <UniqueCode
                              text={beat?.code}
                              codeName="Beat"
                            />
                          </td>
                          <td className="px-2 py-1 font-medium text-gray-900 dark:text-gray-200">
                            {beat?.beat_type || "-"}
                          </td>
                          <td className="px-2 py-1 font-medium text-gray-900 dark:text-gray-200">
                            <StatusIndicator status={beat?.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          )}
      </Modal.Body>
    </Modal>
  );
};
