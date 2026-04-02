import { useState, useRef } from "react";
import { Modal, Button, Label, Spinner } from "flowbite-react";
import Papa from "papaparse";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";
import { bulkUploadSecondaryTargetsWithDbCode } from "../api/api";

const BulkUploadWithDbCodeModal = ({ openModal, onCloseModal, onSuccess }) => {
  const [bulkFile, setBulkFile] = useState(null);
  const [failedCSV, setFailedCSV] = useState(null);
  const [failedCount, setFailedCount] = useState(0);
  const [bulkUploading, setBulkUploading] = useState(false);
  const fileInputRef = useRef(null);

  const downloadBulkTemplate = () => {
    const headers = [
      "Distributor DB Code",
      "Retailer UID",
      "Retailer Name",
      "Brands",
      "Target Name",
      "Target Type",
      "Target  Qty (PC)/Value (INR)",
      "Start Date",
      "End Date",
    ];

    const instructions = [
      "# Instructions:",
      "# Distributor DB Code: Required (Example: DB001 - Find this in Distributor Master)",
      "# Retailer UID: Required (Example: RET001)",
      "# Retailer Name: Optional (Example: Ganpati Cloth Store)",
      "# Brands: Required (Comma-separated brand names, Example: BR,CR,DR or single brand: BR)",
      "# Target Name: Required",
      "# Target Type: Required (volume/value)",
      "# Target Qty (PC)/Value (INR) [NOTE: For Volume > PC, For Value > INR]: Required (Example: 1000)",
      "# Start Date: Required (Format: DD-MM-YYYY, Example: 01-01-2026)",
      "# End Date: Required (Format: DD-MM-YYYY, Example: 31-03-2026)",
      "#",
      "# IMPORTANT VALIDATIONS:",
      "# - Retailer must belong to the specified distributor",
      "# - No overlapping targets for same distributor-retailer-brand-type combination",
      "# - Start date cannot be before current month",
      "# - All brands must be mapped to the distributor",
      "#",
    ];

    const csvContent =
      instructions.join("\n") + "\n" + headers.join(",") + "\n";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      "secondary-target-bulk-with-db-code-template.csv"
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setBulkUploading(true);

    Papa.parse(bulkFile, {
      header: true,
      skipEmptyLines: true,
      comments: "#",
      complete: async (result) => {
        try {
          const rows = result.data;
          if (!rows.length) {
            toast.error("No valid data found in the file");
            setBulkUploading(false);
            return;
          }

          const payload = { targets: rows };
          const res = await bulkUploadSecondaryTargetsWithDbCode(payload);

          const { inserted, failed, failedCSV } = res.data;
          setFailedCSV(failedCSV || null);
          setFailedCount(failed || 0);

          if (inserted > 0) {
            toast.success(
              `Successfully inserted: ${inserted} target(s)${failed > 0 ? `, Failed: ${failed}` : ""}`
            );
          } else {
            toast.error(`Upload failed. Failed rows: ${failed}`);
          }

          if (inserted > 0) {
            onSuccess();
          }
        } catch (error) {
          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              "Bulk upload failed"
          );
        } finally {
          setBulkUploading(false);
          setBulkFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      },
      error: (error) => {
        toast.error("Failed to parse CSV file");
        setBulkUploading(false);
      },
    });
  };

  const downloadFailedCSV = (base64CSV) => {
    const link = document.createElement("a");
    link.href = "data:text/csv;base64," + base64CSV;
    link.download = "secondary-target-failed-db-code.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClose = () => {
    setBulkFile(null);
    setFailedCSV(null);
    setFailedCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onCloseModal();
  };

  return (
    <Modal show={openModal} onClose={handleClose} size="lg">
      <Modal.Header>Bulk Secondary Target Upload (With DB Code)</Modal.Header>
      <Modal.Body>
        <div className="space-y-4">
          {/* Template Download Section */}
          <div className="flex justify-between items-center border p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Step 1: Download Template
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Download the CSV template and fill in the target details
              </p>
            </div>
            <Button color="info" size="sm" onClick={downloadBulkTemplate}>
              Download Template
            </Button>
          </div>

          {/* File Upload Section */}
          <div className="border p-4 rounded-lg space-y-3 bg-gray-50 dark:bg-gray-800">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Step 2: Upload Filled Template
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Select the completed CSV file to upload
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                id="bulkFileInputDbCode"
                accept=".csv"
                onChange={(e) => setBulkFile(e.target.files[0])}
                className="hidden"
              />
              <label
                htmlFor="bulkFileInputDbCode"
                className="px-4 py-2 bg-gray-700 text-white rounded cursor-pointer hover:bg-gray-600 transition-colors"
              >
                Choose File
              </label>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {bulkUploading
                  ? "Uploading..."
                  : bulkFile
                    ? bulkFile.name
                    : "No file chosen"}
              </span>
            </div>
            <Button
              color="success"
              disabled={!bulkFile || bulkUploading}
              onClick={handleBulkUpload}
              className="w-full"
            >
              {bulkUploading ? (
                <span className="flex items-center gap-2 justify-center">
                  <Spinner size="sm" /> Uploading...
                </span>
              ) : (
                "Upload Template"
              )}
            </Button>
          </div>

          {/* Failed CSV Download Section */}
          {failedCSV && (
            <div className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                  Some rows failed to upload ({failedCount})
                </p>
                <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                  Download the failed rows to see error details
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  color="failure"
                  onClick={() => downloadFailedCSV(failedCSV)}
                >
                  Download Failed Rows
                </Button>
                <button
                  onClick={() => {
                    setFailedCSV(null);
                    setFailedCount(0);
                  }}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors"
                  title="Clear error log"
                >
                  <FiX size={16} className="text-red-600 dark:text-red-400" />
                </button>
              </div>
            </div>
          )}

          {/* Important Notes */}
          <div className="border-t pt-4 mt-4">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Important Notes:
            </p>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
              <li>Distributor DB Code is mandatory for each row</li>
              <li>Retailer must belong to the specified distributor</li>
              <li>
                No overlapping targets allowed for same
                distributor-retailer-brand-type
              </li>
              <li>Brands must be mapped to the distributor</li>
              <li>Start date cannot be before the current month</li>
            </ul>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button color="gray" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BulkUploadWithDbCodeModal;