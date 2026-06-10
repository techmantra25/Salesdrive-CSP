import { useContext, useEffect, useState } from "react";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import toast from "react-hot-toast";
import Papa from "papaparse";
import axios from "axios";

import {
  Badge,
  Button,
  Card,
  Label,
  Modal,
  Select,
  Spinner,
  Table,
  TextInput,
} from "flowbite-react";

import { IoMdAddCircle } from "react-icons/io";
import { BiSolidFileExport, BiSolidFileImport } from "react-icons/bi";
import { RiRefreshFill } from "react-icons/ri";
import { MdDownloadForOffline } from "react-icons/md";

import { escapeCSVValue } from "../../utils/escapeCSVValue";

import UniqueCode from "../../assets/common/UniqueCode";
import StatusIndicator from "../../assets/common/StatusIndicator";
import EditButton from "../../assets/common/EditButton";

import {
  createSubDivision,
  getSubDivisionList,
  updateSubDivision,
} from "../../api/sub-divisionapi";
import { AllDistrictList, bulkUpload } from "../../api/api";
import { BACKEND_URL } from "../../constants";

const SubDivision = () => {
  const { openConfirmationModel } = useContext(ConfirmationModelContext);

  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [formDistrictId, setFormDistrictId] = useState(null);

  const [selectedSubDivision, setSelectedSubDivision] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [allSubDivisions, setAllSubDivisions] = useState([]);
  const [subDivisionLoading, setSubDivisionLoading] = useState(true);

  const [selectedStatus, setSelectedStatus] = useState("active");
  const [filterDistrictId, setFilterDistrictId] = useState("default");
  const [searchTerm, setSearchTerm] = useState("");

  const [allDistricts, setAllDistricts] = useState([]);
  const activeDistricts = allDistricts.filter((d) => d.status === true);

  const [openBulkUploadModal, setOpenBulkUploadModal] = useState(false);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkCsvData, setBulkCsvData] = useState([]);
  const [openBulkConfirmModal, setOpenBulkConfirmModal] = useState(false);
  const [errorLog, setErrorLog] = useState([]);

  async function fetchSubDivisions() {
    try {
      setSubDivisionLoading(true);
      const res = await getSubDivisionList();
      setAllSubDivisions(res?.data?.data || []);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load Zones, try again"
      );
    } finally {
      setSubDivisionLoading(false);
    }
  }

  async function fetchDistricts() {
    try {
      const res = await AllDistrictList();
      setAllDistricts(res?.data?.data || []);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to load districts"
      );
    }
  }

  useEffect(() => {
    fetchSubDivisions();
    fetchDistricts();
  }, []);

  let filteredSubDivisions = [...allSubDivisions];

  if (selectedStatus !== "default") {
    filteredSubDivisions = filteredSubDivisions.filter(
      (x) => x.status === (selectedStatus === "active")
    );
  }

  if (filterDistrictId !== "default") {
    filteredSubDivisions = filteredSubDivisions.filter(
      (x) => x?.districtId?._id === filterDistrictId
    );
  }

  if (searchTerm.trim() !== "") {
    const lower = searchTerm.toLowerCase();
    filteredSubDivisions = filteredSubDivisions.filter(
      (sd) =>
        sd?.code?.toLowerCase().includes(lower) ||
        sd?.name?.toLowerCase().includes(lower)
    );
  }

  const handleResetFilter = () => {
    setSelectedStatus("active");
    setFilterDistrictId("default");
    setSearchTerm("");
    fetchSubDivisions();
  };

  const validate = () => {
    if (code.trim() === "") {
      toast.error("Please enter Zone code");
      return false;
    }
    if (name.trim() === "") {
      toast.error("Please enter Zone name");
      return false;
    }
    if (!formDistrictId) {
      toast.error("Please select a district");
      return false;
    }
    return true;
  };

  const onCloseModal = () => {
    setOpenModal(false);
    setModalMode("add");
    setSelectedSubDivision(null);
    setCode("");
    setName("");
    setFormDistrictId(null);
  };

  const handleAdd = async () => {
    try {
      setFormLoading(true);
      if (!validate()) return;

      const payload = {
        code,
        name,
        districtId: formDistrictId,
      };

      await createSubDivision(payload);
      toast.success("Zone added successfully");
      await fetchSubDivisions();
      onCloseModal();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to add Zone, try again"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedSubDivision?._id) return;

    openConfirmationModel({
      question: "Are you sure you want to update this Zone?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (!result) {
          onCloseModal();
          return;
        }
        try {
          setFormLoading(true);
          if (!validate()) return;

          const payload = {
            code,
            name,
            districtId: formDistrictId,
          };

          await updateSubDivision(payload, selectedSubDivision._id);
          toast.success("Zone updated successfully");
          await fetchSubDivisions();
          onCloseModal();
        } catch (error) {
          console.error(error);
          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to update Zone, try again"
          );
        } finally {
          setFormLoading(false);
        }
      },
    });
  };

  const handleSetEdit = (row) => {
    setSelectedSubDivision(row);
    setModalMode("edit");
    setCode(row?.code || "");
    setName(row?.name || "");
    setFormDistrictId(row?.districtId?._id || null);
    setOpenModal(true);
  };

  const handleStatusUpdate = (row) => {
    openConfirmationModel({
      question: `Are you sure you want to ${row.status ? "deactivate" : "activate"} this Zone?`,
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (!result) return;
        try {
          const payload = { status: !row.status };
          const res = await updateSubDivision(payload, row._id);
          if (res?.data?.statusUpdateError) {
            toast.error("Status Not Updated dependency exist!");
          } else {
            toast.success("Status updated successfully");
          }
          await fetchSubDivisions();
        } catch (error) {
          console.error(error);
          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to update Zone status"
          );
        }
      },
    });
  };

  const handleCSVTemplateDownload = () => {
    const csv = [
      "Zone Code,Zone Name,District Code",
      "SD-001,Zone 1,DIST-001",
      "SD-002,Zone 2,DIST-002",
    ];
    const csvString = csv.join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csvString], { type: "text/csv" }));
    a.setAttribute("download", "sub_division_template.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const parseCSVFile = (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        quoteChar: '\"',
        escapeChar: '\"',
        delimiter: ",",
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error("CSV Parse Errors:", results.errors);
            reject("CSV format error. Check commas and quotes.");
            return;
          }
          const rows = results.data;
          if (!rows || rows.length === 0) {
            reject("CSV file is empty or invalid");
            return;
          }
          const parsedData = rows.map((row, index) => ({
            rowNumber: index + 2,
            ...row,
          }));
          resolve(parsedData);
        },
      });
    });
  };

  const handleBulkUploadClick = () => {
    setOpenBulkUploadModal(false);
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".csv";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const parsed = await parseCSVFile(file);
        setBulkCsvData(parsed);
        setOpenBulkConfirmModal(true);
      } catch (err) {
        console.error(err);
        toast.error("Invalid CSV file. Please check the format and try again.");
      }
    };
    input.click();
  };

  const handleBulkConfirmSubmit = async () => {
    try {
      setBulkUploading(true);
      const cleanData = bulkCsvData.map(({ rowNumber, ...rest }) => rest);
      const formData = new FormData();
      const csvString = Papa.unparse(cleanData);
      const blob = new Blob([csvString], { type: "text/csv" });
      formData.append("my_file", blob, "sub_division_upload.csv");
      const uploadRes = await axios.post(
        BACKEND_URL + "/api/v1/cloudinary/upload",
        formData,
      );
      const url = uploadRes?.data?.secure_url;
      if (!url) {
        toast.error("Failed to upload file to cloud");
        return;
      }
      const payload = { file: url };
      const res = await bulkUpload(payload, "SubDivision");
      if (res?.data?.skippedRows?.length > 0) {
        toast.error(
          `${res?.data?.skippedRows?.length} rows skipped, ${
            res?.data?.data?.length ? res?.data?.data?.length : 0
          } rows imported`,
        );
        setErrorLog(res?.data?.skippedRows);
      } else {
        toast.success(`${res?.data?.data?.length} rows imported`);
      }
      setOpenBulkConfirmModal(false);
      setBulkCsvData([]);
      fetchSubDivisions();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to import Zones, try again",
      );
    } finally {
      setBulkUploading(false);
    }
  };

  const handleErrorLogDownload = () => {
    if (!errorLog || errorLog.length === 0) {
      toast.error("No error log to download.");
      return;
    }
    const headers = Array.from(
      new Set(errorLog.flatMap((obj) => Object.keys(obj))),
    );
    const csv = [headers.join(",")];
    errorLog.forEach((row) => {
      const rowData = headers.map((header) => {
        const value = row[header] !== undefined ? String(row[header]) : "";
        return `\"${value.replace(/\"/g, '\"\"')}\"`;
      });
      csv.push(rowData.join(","));
    });
    const csvString = csv.join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csvString], { type: "text/csv" }));
    a.setAttribute("download", "Zone-error-log.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setErrorLog([]);
  };

  const handleExportToCSV = () => {
    const csvData = filteredSubDivisions.map((sd) => {
      return {
        "Zone Code": sd.code,
        "Zone Name": sd.name,
        "District Name": sd.districtId?.name,
        Status: sd.status ? "Active" : "Inactive",
      };
    });

    const headers = Object.keys(csvData[0] || {
      "Zone Code": "",
      "Zone Name": "",
      "District Name": "",
      Status: "",
    });

    const csv = [
      headers.join(","),
      ...csvData.map((row) =>
        Object.values(row).map(escapeCSVValue).join(",")
      ),
    ].join("\n");

    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.setAttribute("download", "Zones.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <div className="flex justify-start items-center flex-col gap-4 w-full">
          <div className="flex justify-between w-full items-center border-b-2 py-4">
            <div className="flex justify-center items-center">
              <h1 className="text-2xl font-bold">Zone Master</h1>
            </div>
          </div>

          <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
            <Card className="w-full flex justify-center items-center flex-col">
              <div className="w-full flex flex-wrap justify-center items-center gap-2">
                <Badge color="warning">Total Count : {allSubDivisions?.length}</Badge>
                <Badge color="warning">Filtered Count : {filteredSubDivisions?.length}</Badge>
              </div>

              <div className="flex justify-center w-full items-center gap-4 flex-wrap">
                <div className="w-44">
                  <div className="mb-2 block">
                    <Label htmlFor="searchTerm" value="Search" />
                  </div>
                  <TextInput
                    id="searchTerm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by code or name"
                  />
                </div>

                <div className="w-56">
                  <div className="mb-2 block">
                    <Label htmlFor="statusSelect" value="Select Status" />
                  </div>
                  <Select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    id="statusSelect"
                    required
                  >
                    <option value="default">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Select>
                </div>

                <div className="w-56">
                  <div className="mb-2 block">
                    <Label htmlFor="districtSelect" value="Select District" />
                  </div>
                  <Select
                    value={filterDistrictId}
                    onChange={(e) => setFilterDistrictId(e.target.value)}
                    id="districtSelect"
                    required
                  >
                    <option value="default">All</option>
                    {activeDistricts.map((d) => (
                      <option key={d?._id} value={d?._id}>
                        {d?.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="flex justify-center w-full items-center gap-2 flex-wrap">
                <Button className="text-xs" size="sm" color="success" onClick={handleResetFilter}>
                  <span className="flex justify-center items-center gap-2">
                    <RiRefreshFill size={20} />
                    Reset & Refresh
                  </span>
                </Button>

                <Button className="text-xs" size="sm" onClick={() => setOpenModal(true)}>
                  <span className="flex justify-center items-center gap-2">
                    <IoMdAddCircle size={20} />
                    Add Zone
                  </span>
                </Button>

                <Button className="text-xs" size="sm" color="warning" onClick={() => setOpenBulkUploadModal(true)}>
                  <span className="flex justify-center items-center gap-2">
                    <BiSolidFileImport size={20} />
                    Bulk Upload
                  </span>
                </Button>

                <Button className="text-xs" size="sm" color="blue" onClick={handleExportToCSV}>
                  <span className="flex justify-center items-center gap-2">
                    <BiSolidFileExport size={20} />
                    CSV Download
                  </span>
                </Button>

                {errorLog.length > 0 && (
                  <Button className="text-xs" size="sm" color="red" onClick={handleErrorLogDownload}>
                    <span className="flex justify-center items-center gap-2">
                      <MdDownloadForOffline size={20} />
                      Error Log
                      <Badge color="gray">{errorLog.length}</Badge>
                    </span>
                  </Button>
                )}
              </div>
            </Card>
          </div>

          <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
            {subDivisionLoading ? (
              <div className="w-full flex justify-center items-center">
                <Spinner size="xl" />
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <Table striped>
                  <Table.Head className="text-center">
                    <Table.HeadCell>Zone Code</Table.HeadCell>
                    <Table.HeadCell>Zone Name</Table.HeadCell>
                    <Table.HeadCell>District Name</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Action</Table.HeadCell>
                  </Table.Head>

                  <Table.Body>
                    {filteredSubDivisions.map((sd) => (
                      <Table.Row key={sd?._id} className="text-center">
                        <Table.Cell>
                          <UniqueCode text={sd?.code} codeName="Zone Code" />
                        </Table.Cell>
                        <Table.Cell>{sd?.name}</Table.Cell>
                        <Table.Cell>{sd?.districtId?.name}</Table.Cell>
                        <Table.Cell>
                          <StatusIndicator
                            status={sd.status}
                            onClick={() => handleStatusUpdate(sd)}
                          />
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex gap-2 justify-center items-center">
                            <EditButton onClick={() => handleSetEdit(sd)} />
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))}

                    {filteredSubDivisions.length === 0 && (
                      <Table.Row className="text-center">
                        <Table.Cell colSpan={"100%"}>No data found</Table.Cell>
                      </Table.Row>
                    )}
                  </Table.Body>
                </Table>
              </div>
            )}
          </div>

          <Modal show={openBulkUploadModal} onClose={() => setOpenBulkUploadModal(false)} size="3xl">
            <Modal.Header>Bulk Upload Zones</Modal.Header>
            <Modal.Body>
              <div className="flex justify-center gap-6 py-10">
                <Button
                  color="blue"
                  size="sm"
                  className="px-6 py-2 text-sm font-medium rounded-lg shadow hover:shadow-md transition-all"
                  onClick={() => {
                    handleCSVTemplateDownload();
                    setOpenBulkUploadModal(false);
                  }}
                >
                  Download Template
                </Button>
                <Button
                  color="green"
                  size="sm"
                  className="px-6 py-2 text-sm font-medium rounded-lg shadow hover:shadow-md transition-all"
                  onClick={handleBulkUploadClick}
                >
                  Upload File
                </Button>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button color="gray" onClick={() => setOpenBulkUploadModal(false)}>Cancel</Button>
            </Modal.Footer>
          </Modal>

          <Modal show={openBulkConfirmModal} onClose={() => setOpenBulkConfirmModal(false)} size="lg">
            <Modal.Header>Confirm Bulk Upload</Modal.Header>
            <Modal.Body>
              <div className="flex flex-col items-center justify-center gap-4 py-10">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  📄
                </div>
                <p className="text-sm text-white-600 text-center">
                  CSV file selected successfully.<br />
                  <strong>{bulkCsvData.length}</strong> rows found.<br />
                  Click <strong>Confirm Upload</strong> to proceed.
                </p>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button color="gray" onClick={() => setOpenBulkConfirmModal(false)}>Cancel</Button>
              <Button color="green" disabled={bulkUploading} onClick={handleBulkConfirmSubmit}>
                {bulkUploading ? "Uploading..." : "Confirm Upload"}
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal show={openModal} size="sm" onClose={onCloseModal} popup>
            <Modal.Header />
            <Modal.Body>
              <div className="space-y-5">
                <div className="w-full">
                  <Label value="Zone Code" />
                  <TextInput value={code} onChange={(e) => setCode(e.target.value)} />
                </div>

                <div className="w-full">
                  <Label value="Zone Name" />
                  <TextInput value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className="w-full">
                  <Label value="Select District" />
                  <Select value={formDistrictId || ""} onChange={(e) => setFormDistrictId(e.target.value || null)}>
                    <option value="">Select District</option>
                    {activeDistricts.map((d) => (
                      <option key={d?._id} value={d?._id}>
                        {d?.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="w-full">
                  {modalMode === "add" && (
                    <Button onClick={handleAdd} disabled={formLoading}>
                      {formLoading ? <Spinner size="sm" /> : "Add Zone"}
                    </Button>
                  )}

                  {modalMode === "edit" && (
                    <Button onClick={handleEdit} disabled={formLoading}>
                      {formLoading ? <Spinner size="sm" /> : "Update Zone"}
                    </Button>
                  )}
                </div>
              </div>
            </Modal.Body>
          </Modal>
      </div>
    </>
  );
};

export default SubDivision;

