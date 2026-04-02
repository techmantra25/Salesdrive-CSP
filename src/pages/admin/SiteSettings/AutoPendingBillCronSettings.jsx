// import { Button, Label, Spinner, TextInput } from "flowbite-react";
// import { useEffect, useMemo, useState } from "react";
// import toast from "react-hot-toast";
// import {
//   getAutoPendingBillCron,
//   updateAutoPendingBillCron,
// } from "../../../api/configApi";

// const DEFAULT_CRON = "5 0 4 * *";

// const AutoPendingBillCronSettings = ({ canUpdate }) => {
//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [jobName, setJobName] = useState("");
//   const [cronError, setCronError] = useState("");
//   const [initialState, setInitialState] = useState({
//     cronTime: "",
//     isActive: false,
//   });
//   const [formState, setFormState] = useState({
//     cronTime: "",
//     isActive: false,
//   });

//   useEffect(() => {
//     fetchCronConfig();
//   }, []);

//   const hasChanges = useMemo(() => {
//     return (
//       formState.cronTime !== initialState.cronTime ||
//       formState.isActive !== initialState.isActive
//     );
//   }, [formState, initialState]);

//   const fetchCronConfig = async () => {
//     setLoading(true);
//     setCronError("");
//     try {
//       const response = await getAutoPendingBillCron();
//       const data = response?.data?.data || {};

//       const nextState = {
//         cronTime: data?.cronTime || "",
//         isActive: Boolean(data?.isActive),
//       };

//       setJobName(data?.job || "autoPendingBillDelivery");
//       setInitialState(nextState);
//       setFormState(nextState);
//     } catch (error) {
//       console.error("Error fetching auto pending bill cron config:", error);
//       toast.error(
//         error?.response?.data?.message || "Failed to load cron config",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSave = async () => {
//     const payload = {};
//     const trimmedCron = formState.cronTime.trim();

//     setCronError("");

//     if (trimmedCron !== initialState.cronTime) {
//       if (!trimmedCron) {
//         setCronError("Cron time is required when updating schedule.");
//         return;
//       }
//       payload.cronTime = trimmedCron;
//     }

//     if (formState.isActive !== initialState.isActive) {
//       payload.isActive = formState.isActive;
//     }

//     if (!Object.keys(payload).length) {
//       toast("No changes to save");
//       return;
//     }

//     setSaving(true);
//     try {
//       const response = await updateAutoPendingBillCron(payload);
//       const updated = response?.data?.data || {};

//       const nextState = {
//         cronTime: updated?.cronTime || payload.cronTime || formState.cronTime,
//         isActive:
//           typeof updated?.isActive === "boolean"
//             ? updated.isActive
//             : (payload.isActive ?? formState.isActive),
//       };

//       setJobName(updated?.job || jobName || "autoPendingBillDelivery");
//       setInitialState(nextState);
//       setFormState(nextState);
//       toast.success("Cron updated successfully (applies immediately)");
//     } catch (error) {
//       const message =
//         error?.response?.data?.message ||
//         error?.message ||
//         "Failed to update cron";

//       if (
//         error?.response?.status === 400 &&
//         /invalid cron expression/i.test(message)
//       ) {
//         setCronError(message);
//       }

//       toast.error(message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleResetDefault = () => {
//     setCronError("");
//     setFormState((prev) => ({
//       ...prev,
//       cronTime: DEFAULT_CRON,
//     }));
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center gap-2 text-sm text-gray-500">
//         <Spinner size="sm" />
//         Loading cron settings...
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4">
//       <div className="rounded-lg border border-gray-200 p-3 bg-white dark:bg-gray-800 dark:border-gray-700">
//         <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
//           Job
//         </p>
//         <p className="text-sm text-gray-600 dark:text-gray-400">
//           {jobName || "autoPendingBillDelivery"}
//         </p>
//         <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
//           Timezone: Asia/Kolkata. Updates apply immediately; restart not
//           required.
//         </p>
//       </div>

//       <div>
//         <div className="mb-2 block">
//           <Label htmlFor="cronTime" value="Cron Time" />
//         </div>
//         <TextInput
//           id="cronTime"
//           value={formState.cronTime}
//           onChange={(e) => {
//             setCronError("");
//             setFormState((prev) => ({ ...prev, cronTime: e.target.value }));
//           }}
//           placeholder="e.g. 5 0 4 * *"
//           disabled={!canUpdate || saving}
//           color={cronError ? "failure" : "gray"}
//         />
//         {cronError ? (
//           <p className="mt-1 text-sm text-red-600">{cronError}</p>
//         ) : null}
//         <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
//           Cron format: minute hour day-of-month month day-of-week
//         </p>
//         <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
//           5 0 4 * * {"->"} 4th of every month at 00:05
//         </p>
//         <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
//           0 2 * * * {"->"} daily at 02:00
//         </p>
//       </div>

//       <div className="flex items-center justify-between p-2 border rounded-lg border-gray-200 dark:border-gray-700">
//         <div>
//           <h3 className="text-base font-semibold dark:text-white">
//             Enable Job
//           </h3>
//           <p className="text-sm text-gray-500 dark:text-gray-400">
//             When disabled, the job stays configured but does not run.
//           </p>
//         </div>
//         <label className="relative inline-flex items-center cursor-pointer">
//           <input
//             type="checkbox"
//             checked={formState.isActive}
//             onChange={(e) =>
//               setFormState((prev) => ({ ...prev, isActive: e.target.checked }))
//             }
//             className="sr-only peer"
//             disabled={!canUpdate || saving}
//           />
//           <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
//           <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
//             {formState.isActive ? "Enabled" : "Disabled"}
//           </span>
//         </label>
//       </div>

//       <div className="flex justify-end gap-2">
//         <Button
//           color="light"
//           onClick={handleResetDefault}
//           disabled={!canUpdate || saving}
//         >
//           Reset to Default
//         </Button>
//         <Button
//           color="success"
//           onClick={handleSave}
//           disabled={!canUpdate || saving || !hasChanges}
//         >
//           {saving ? "Saving..." : "Save"}
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default AutoPendingBillCronSettings;
