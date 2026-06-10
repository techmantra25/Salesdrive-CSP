import { useContext, useEffect, useState } from "react";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import toast from "react-hot-toast";

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
import { BiSolidFileExport } from "react-icons/bi";
import { RiRefreshFill } from "react-icons/ri";

import { escapeCSVValue } from "../../utils/escapeCSVValue";

import UniqueCode from "../../assets/common/UniqueCode";
import StatusIndicator from "../../assets/common/StatusIndicator";
import EditButton from "../../assets/common/EditButton";

import {
  createSubDivision,
  getSubDivisionList,
  updateSubDivision,
} from "../../api/sub-divisionapi";
import { AllDistrictList } from "../../api/api";

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
          "Failed to load Sub Divisions, try again"
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
      toast.error("Please enter sub-division code");
      return false;
    }
    if (name.trim() === "") {
      toast.error("Please enter sub-division name");
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
      toast.success("Sub Division added successfully");
      await fetchSubDivisions();
      onCloseModal();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to add sub-division, try again"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedSubDivision?._id) return;

    openConfirmationModel({
      question: "Are you sure you want to update this sub-division?",
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
          toast.success("Sub Division updated successfully");
          await fetchSubDivisions();
          onCloseModal();
        } catch (error) {
          console.error(error);
          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to update sub-division, try again"
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
      question: `Are you sure you want to ${row.status ? "deactivate" : "activate"} this sub-division?`,
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
              "Failed to update sub-division status"
          );
        }
      },
    });
  };

  const handleExportToCSV = () => {
    const csvData = filteredSubDivisions.map((sd) => {
      return {
        "Sub Division Code": sd.code,
        "Sub Division Name": sd.name,
        "District Name": sd.districtId?.name,
        Status: sd.status ? "Active" : "Inactive",
      };
    });

    const headers = Object.keys(csvData[0] || {
      "Sub Division Code": "",
      "Sub Division Name": "",
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
    a.setAttribute("download", "sub-divisions.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <div className="flex justify-start items-center flex-col gap-4 w-full">
          <div className="flex justify-between w-full items-center border-b-2 py-4">
            <div className="flex justify-center items-center">
              <h1 className="text-2xl font-bold">Sub Division Master</h1>
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
                    Add Sub Division
                  </span>
                </Button>

                <Button className="text-xs" size="sm" color="blue" onClick={handleExportToCSV}>
                  <span className="flex justify-center items-center gap-2">
                    <BiSolidFileExport size={20} />
                    CSV Download
                  </span>
                </Button>
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
                    <Table.HeadCell>Sub Division Code</Table.HeadCell>
                    <Table.HeadCell>Sub Division Name</Table.HeadCell>
                    <Table.HeadCell>District Name</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Action</Table.HeadCell>
                  </Table.Head>

                  <Table.Body>
                    {filteredSubDivisions.map((sd) => (
                      <Table.Row key={sd?._id} className="text-center">
                        <Table.Cell>
                          <UniqueCode text={sd?.code} codeName="Sub Division Code" />
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

          <Modal show={openModal} size="sm" onClose={onCloseModal} popup>
            <Modal.Header />
            <Modal.Body>
              <div className="space-y-5">
                <div className="w-full">
                  <Label value="Sub Division Code" />
                  <TextInput value={code} onChange={(e) => setCode(e.target.value)} />
                </div>

                <div className="w-full">
                  <Label value="Sub Division Name" />
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
                      {formLoading ? <Spinner size="sm" /> : "Add Sub Division"}
                    </Button>
                  )}

                  {modalMode === "edit" && (
                    <Button onClick={handleEdit} disabled={formLoading}>
                      {formLoading ? <Spinner size="sm" /> : "Update Sub Division"}
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

