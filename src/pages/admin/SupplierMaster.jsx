import {
  Badge,
  Button,
  Card,
  Checkbox,
  Label,
  Modal,
  Pagination,
  Select,
  Spinner,
  Table,
  Textarea,
  TextInput,
} from "flowbite-react";
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BiSolidFileExport } from "react-icons/bi";
import { CiCircleList } from "react-icons/ci";
import { IoMdAddCircle } from "react-icons/io";
import { MdSimCardDownload } from "react-icons/md";
import { RiRefreshFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import {
  BulkUploadSupplierMaster,
  createSupplier,
  editSupplier,
  getSuppliersList,
} from "../../api/api";
import EditButton from "../../assets/common/EditButton";
import { StatusIndicatorNew } from "../../assets/common/StatusIndicator";
import UniqueCode from "../../assets/common/UniqueCode";
import { DBListModal } from "../../components/DBListModal";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import { useDebounce } from "../../hooks/useDebounce";
import { fetchDistributors } from "../../redux/distributorListSlice";
import { fetchStates } from "../../redux/stateSlice";
import { escapeCSVValue } from "../../utils/escapeCSVValue";
import { getPagePermission } from "../../utils/permissionHelper";


export const SupplierMaster = () => {
  const dispatch = useDispatch();
  const { states, loading: statesLoading } = useSelector(
    (state) => state.state
  );
  const { distributors, loading: distributorsLoading } = useSelector(
    (state) => state.distributors
  );
  const activeDistributors = distributors.filter(
    (distributor) => distributor.status === true
  );
  // Add a new state at the top with other modal states
  const [searchDistributor, setSearchDistributor] = useState("");
  const activeStates = [...states].filter((state) => state.status === true);
  const { openConfirmationModel } = useContext(ConfirmationModelContext);
  const [formLoading, setFormLoading] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [selectedState, setSelectedState] = useState("default");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [selectedDistributor, setSelectedDistributor] = useState("default");
  const [selectedSupplierType, setSelectedSupplierType] = useState("default");
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [csvLoading, setCSVLoading] = useState(false);
  const [errorLog, setErrorLog] = useState([]);
  const [formData, setFormData] = useState({
    supplierCode: "",
    coCode: "",
    supplierName: "",
    supplierType: "",
    distributorId: [],
    address: "",
    city: "",
    gstNo: "",
    contactNo: "",
    stateId: "",
    email: "",
    pinCode: "",
  });
  const [openDBListModal, setOpenDBListModal] = useState(false);

  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);

  useEffect(() => {
    if (!permissionState?.data?.data) return;

    const permission = getPagePermission(
      permissionState,
      "supplier-master" // slug from PageMaster
    );

    setPagePermission(permission);
  }, [permissionState]);


  const [selectedSupplierForDBList, setSelectedSupplierForDBList] =
    useState(null);

  const onPageChange = (page) => setCurrentPage(page);

  let fetchSuppliersPaginatedWithOutDebounce = async () => {
    try {
      setSuppliersLoading(true);
      const query = {
        page: currentPage,
        limit: 20,
      };

      if (selectedStatus !== "default") {
        query.status = selectedStatus;
      }

      if (selectedState !== "default") {
        query.stateId = selectedState;
      }
      if (selectedSupplierType !== "default") {
        query.supplierType = selectedSupplierType;
      }
      if (searchTerm) {
        query.search = searchTerm;
      }

      if (selectedDistributor !== "default") {
        query.distributorId = selectedDistributor;
      }

      const response = await getSuppliersList(query);
      setSuppliers(response?.data?.data);
      setTotalPages(response?.data?.pagination?.totalPages);
      setFilteredCount(response?.data?.pagination?.filteredCount);
      setTotalItems(response?.data?.pagination?.totalCount);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch Outlets"
      );
    } finally {
      setSuppliersLoading(false);
    }
  };

  let fetchSuppliersPaginated = useDebounce(
    fetchSuppliersPaginatedWithOutDebounce,
    500
  );

  const handleResetFilter = () => {
    setSelectedStatus("active");
    setSelectedState("default");
    setSelectedSupplierType("default");
    setSelectedDistributor("default");
    setSearchTerm("");
    setCurrentPage(1);
    dispatch(fetchStates());
    dispatch(fetchDistributors());
    fetchSuppliersPaginated();
  };

  const validate = () => {
    if (!formData.supplierCode.trim()) {
      toast.error("Supplier code is required");
      return false;
    }
    if (!formData.supplierName.trim()) {
      toast.error("Supplier name is required");
      return false;
    }
    if (!formData.coCode.trim()) {
      toast.error("Supplier Co Code is required");
      return false;
    }
    if (!formData.supplierType.trim()) {
      toast.error("Supplier type is required");
      return false;
    }
    return true;
  };

  const onCloseModal = () => {
    setOpenModal(false);
    setModalMode("add");
    setSelectedSupplier(null);
    setFormData({
      supplierCode: "",
      coCode: "",
      supplierName: "",
      supplierType: "",
      distributorId: [],
      address: "",
      city: "",
      gstNo: "",
      contactNo: "",
      stateId: "",
      email: "",
      pinCode: "",
    });
    fetchSuppliersPaginated();
  };

  const handleSetEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setModalMode("edit");
    setFormData({
      supplierCode: supplier?.supplierCode ?? "",
      coCode: supplier?.coCode ?? "",
      supplierName: supplier?.supplierName ?? "",
      supplierType: supplier?.supplierType ?? "",
      distributorId: supplier?.distributorId
        ? supplier?.distributorId.map((dist) => dist._id)
        : [],
      address: supplier?.address ?? "",
      city: supplier?.city ?? "",
      gstNo: supplier?.gstNo ?? "",
      contactNo: supplier?.contactNo ?? "",
      stateId: supplier?.stateId?._id ?? "",
      email: supplier?.email ?? "",
      pinCode: supplier?.pinCode ?? "",
    });
    setOpenModal(true);
  };

  const handleAddSupplier = async () => {
    try {
      if (!validate()) return;
      setFormLoading(true);
      const payload = {
        supplierCode: formData.supplierCode,
        coCode: formData.coCode,
        supplierName: formData.supplierName,
        supplierType: formData.supplierType,
        address: formData.address,
        city: formData.city,
        gstNo: formData.gstNo,
        contactNo: formData.contactNo,
        email: formData.email,
        pinCode: formData.pinCode,
      };
      if (formData.distributorId) {
        payload.distributorId = formData.distributorId;
      }
      if (formData.stateId) {
        payload.stateId = formData.stateId;
      }
      const response = await createSupplier(payload);
      if (response?.status === 201) {
        toast.success("Supplier Created Successfully");
        setFormLoading(false);
        onCloseModal();
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to add Supplier, try again"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSupplier = async () => {
    openConfirmationModel({
      question: "Are you sure you want to update this Supplier?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            if (!validate()) return;
            setFormLoading(true);
            const payload = {
              supplierCode: formData.supplierCode,
              coCode: formData.coCode,
              supplierName: formData.supplierName,
              supplierType: formData.supplierType,
              distributorId: formData.distributorId
                ? formData?.distributorId
                : null,
              address: formData.address,
              city: formData.city,
              gstNo: formData.gstNo,
              contactNo: formData.contactNo,
              stateId: formData.stateId ? formData?.stateId : null,
              email: formData.email,
              pinCode: formData.pinCode,
            };

            const res = await editSupplier(payload, selectedSupplier._id);
            if (res?.status === 200) {
              toast.success("Supplier Updated Successfully");
              setFormLoading(false);
              onCloseModal();
            }
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
              "Failed to update Supplier, try again"
            );
          } finally {
            setFormLoading(false);
          }
        } else {
          onCloseModal();
          return;
        }
      },
    });
  };

  const handleStatusUpdate = async (supplier) => {
    openConfirmationModel({
      question: `Are you sure you want to ${supplier.status === "active" ? "deactivate" : "activate"
        } this Supplier?`,
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            const payload = {
              status: supplier.status === "active" ? "inactive" : "active",
            };
            const res = await editSupplier(payload, supplier._id);
            if (res?.status === 200) {
              toast.success(
                `Supplier ${supplier.status === "active" ? "deactivated" : "activated"
                } successfully`
              );
            }
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
              "Failed to update Supplier status"
            );
          } finally {
            fetchSuppliersPaginated();
          }
        } else {
          return;
        }
      },
    });
  };

  const handleCSVTemplateDownload = () => {
    const csv = [
      "Supplier Code,CoCd,Supplier Name,Supplier Type,GST No,Contact No,Email,Address,City,State Code,State Name,Postal Code,Distributors",
      "C1011,R001,RUPA & COMPANY LIMITED,Depo,,,,,GHAZIABAD,UP,Uttar Pradesh,201102,",
    ];

    const csvString = csv.join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csvString], { type: "text/csv" }));
    a.setAttribute("download", "supplier_template.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExportToCSV = () => {
    setCSVLoading(true);
    const csvData = suppliers?.map((supplier) => {
      return {
        "Supplier Code": supplier?.supplierCode ?? "",
        CoCd: supplier?.coCode ?? "",
        "Supplier Name": supplier?.supplierName ?? "",
        "Supplier Type": supplier?.supplierType ?? "",
        "GST No": supplier?.gstNo ?? "",
        "Contact No": supplier?.contactNo ?? "",
        Email: supplier?.email ?? "",
        Address: supplier?.address ?? "",
        City: supplier?.city ?? "",
        "State Code": supplier?.stateId?.code ?? "",
        "State Name": supplier?.stateId?.name ?? "",
        "Postal Code": supplier?.pinCode ?? "",
        Distributors: supplier?.distributorId
          .map((distributor) => `${distributor.name} (${distributor.dbCode})`)
          .join(","),
      };
    });

    // to escape CSV values >> so that commas, quotes, and new lines are handled correctly
    const csv = csvData.map((row) =>
      Object.values(row).map(escapeCSVValue).join(",")
    );
    csv.unshift(Object.keys(csvData[0]).map(escapeCSVValue).join(","));

    const csvString = csv.join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csvString], { type: "text/csv" }));
    a.setAttribute("download", "Suppliers.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setCSVLoading(false);
  };

  const handleCSVImport = async (url) => {
    try {
      console.log(url);
      openConfirmationModel({
        question: "Are you sure you want to import this Suppliers CSV?",
        answer: ["Yes", "No"],
        onClose: async (result) => {
          if (result) {
            try {
              let payload = {
                csvUrl: url,
              };
              setFormLoading(true);
              const res = await BulkUploadSupplierMaster(payload);
              if (
                res?.data?.uploadedCount === 0 &&
                res?.data?.skippedCount === 0
              ) {
                toast.error("No data found in the file to import");
                return;
              } else if (res?.data?.skipped?.length > 0) {
                toast.error(
                  `${res?.data?.skippedCount} rows skipped, ${res?.data?.uploadedCount ? res?.data?.uploadedCount : 0
                  } rows imported in the Supplier Master`
                );
                setErrorLog(res?.data?.skipped);
              } else {
                toast.success(
                  `${res?.data?.uploadedCount} rows imported in the Supplier Master`
                );
              }
              onCloseModal();
            } catch (error) {
              console.error(error);
              toast.error(
                error?.response?.data?.message ||
                "Failed to import suppliers, try again"
              );
            } finally {
              setFormLoading(false);
            }
          } else {
            onCloseModal();
            return;
          }
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    dispatch(fetchStates());
    dispatch(fetchDistributors());
  }, [dispatch]);

  useEffect(() => {
    fetchSuppliersPaginated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    selectedStatus,
    selectedState,
    selectedSupplierType,
    searchTerm,
    selectedDistributor,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    selectedStatus,
    selectedState,
    selectedSupplierType,
    searchTerm,
    selectedDistributor,
  ]);

  const handleOpenDBListModal = (supplier) => {
    // console.log("handleOpenDBListModal", employee);
    setSelectedSupplierForDBList(supplier);
    setOpenDBListModal(true);
  };

  return (
    <>
    {pagePermission?.view && (
      <div className="flex justify-start items-center flex-col gap-4 w-full">
        {/* page header */}
        <div className="flex justify-between w-full items-center border-b-2 py-4">
          <div className="flex justify-center items-center">
            <h1 className="text-2xl font-bold">Supplier Master</h1>
          </div>
        </div>

        {/* filters */}
        <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
          <Card className="w-full flex justify-center items-center flex-col">
            {/* filter card header */}
            <div className="w-full flex flex-wrap justify-center items-center gap-2">
              <Badge color="warning">Total Count : {totalItems} </Badge>
              <Badge color="warning">Filtered Count : {filteredCount} </Badge>
            </div>
            {/* filter div */}
            <div className="flex justify-center w-full items-center gap-4 flex-wrap">
              <div className="w-40">
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

              <div className="w-44">
                <div className="mb-2 block">
                  <Label htmlFor="stateSelect" value="Select State" />
                </div>
                <Select
                  value={selectedState}
                  onChange={(event) => setSelectedState(event.target.value)}
                  required
                >
                  <option value="default">Select State</option>
                  {activeStates?.map((state) => (
                    <option key={state._id} value={state._id}>
                      {state.name}
                    </option>
                  ))}
                </Select>
              </div>
              {selectedState !== "default" ? (
                <div className="w-44">
                  <div className="mb-2 block">
                    <Label
                      htmlFor="distributorSelect"
                      value="Select Distributor"
                    />
                  </div>
                  <Select
                    value={selectedDistributor}
                    onChange={(event) =>
                      setSelectedDistributor(event.target.value)
                    }
                    id="distributorSelect"
                  >
                    <option value="default">Select Distributor</option>
                    {selectedState
                      ? activeDistributors
                        .filter(
                          (distributor) =>
                            distributor?.stateId?._id === selectedState
                        )
                        .map((distributor) => (
                          <option
                            key={distributor._id}
                            value={distributor._id}
                          >
                            {distributor.name} ({distributor.dbCode})
                          </option>
                        ))
                      : null}
                  </Select>
                </div>
              ) : null}
              <div className="w-56">
                <div className="mb-2 block">
                  <Label htmlFor="supplierType" value="Select Supplier Type" />
                </div>
                <Select
                  value={selectedSupplierType}
                  onChange={(e) => setSelectedSupplierType(e.target.value)}
                  id="supplierTypeSelect"
                  required
                >
                  <option value="default">All</option>
                  <option value="C&Agent">C & Agent</option>
                  <option value="Factory">Factory</option>
                  <option value="Depo">Depo</option>
                  <option value="Company">Company</option>
                  <option value="Distributor">Distributor</option>
                </Select>
              </div>
              <div className="w-44">
                <div className="block">
                  <Label value="Search Supplier" />
                </div>
                <TextInput
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by Name or Code"
                />
              </div>
            </div>
            {/* btns */}
            <div className="flex justify-center w-full items-center gap-2 flex-wrap">
              <Button
                className="text-xs"
                size="sm"
                color="success"
                onClick={handleResetFilter}
              >
                <span className="flex justify-center items-center gap-2">
                  <RiRefreshFill size={20} />
                  Reset & Refresh
                </span>
              </Button>
              {pagePermission?.create && (
                <Button
                  className="text-xs"
                  size="sm"
                  onClick={() => setOpenModal(true)}
                >
                  <span className="flex justify-center items-center gap-2">
                    <IoMdAddCircle size={20} />
                    Add Supplier
                  </span>
                </Button>)}
              <Button
                className="text-xs"
                color="light"
                size="sm"
                onClick={() => {
                  handleCSVTemplateDownload();
                }}
              >
                <span className="flex justify-center items-center gap-2">
                  <MdSimCardDownload size={20} />
                  Template
                </span>
              </Button>
              {pagePermission?.view && (
                <Button
                  className="text-xs"
                  size="sm"
                  color="blue"
                  onClick={() => {
                    handleExportToCSV();
                  }}
                  disabled={suppliersLoading || csvLoading}
                >
                  <span className="flex justify-center items-center gap-2">
                    <BiSolidFileExport size={20} />
                    {csvLoading ? "Downloading..." : "CSV Download"}
                  </span>
                </Button>)}
              {/* <FileUpload
                type="single-file"
                page="bulk-import"
                onSetFileUrl={(url) => {
                  handleCSVImport(url);
                }}
              /> */}
            </div>
          </Card>
        </div>

        <div className="flex justify-end items-center w-full px-4 ">
          <div className="flex overflow-x-auto sm:justify-center">
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                showIcons
              />
            )}
          </div>
        </div>

        {/* table */}
        <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
          <div className="overflow-x-auto w-full">
            <Table striped>
              <Table.Head className="text-center">
                <Table.HeadCell>Supplier Code</Table.HeadCell>
                <Table.HeadCell>Co Code</Table.HeadCell>
                <Table.HeadCell>Supplier Name</Table.HeadCell>
                <Table.HeadCell>Supplier Type</Table.HeadCell>
                <Table.HeadCell>GST No</Table.HeadCell>
                <Table.HeadCell>Contact No</Table.HeadCell>
                <Table.HeadCell>Supplier City</Table.HeadCell>
                <Table.HeadCell>State</Table.HeadCell>
                <Table.HeadCell>Pincode</Table.HeadCell>
                <Table.HeadCell>Distributors</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell>Action</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {suppliersLoading ? (
                  <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                    <Table.Cell
                      colSpan="16"
                      className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200"
                    >
                      <div
                        className="w-full flex justify-center items-center"
                        role="status"
                      >
                        <Spinner aria-label="Loading data" size="xl" />
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  <>
                    {suppliers?.map((supplier) => (
                      <Table.Row
                        key={supplier._id}
                        className="text-center bg-white dark:border-gray-700 dark:bg-gray-800"
                      >
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          <UniqueCode
                            text={supplier?.supplierCode}
                            codeName="Supplier Code"
                          />{" "}
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          <UniqueCode
                            text={supplier?.coCode}
                            codeName="Co Code"
                          />{" "}
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200 cursor-pointer hover:text-lime-600">
                          <div className="flex gap-2 justify-center items-center">
                            {supplier?.supplierName}{" "}
                          </div>
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          {supplier?.supplierType}
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          {supplier?.gstNo}
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          {supplier?.contactNo}
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          {supplier?.city}
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          {supplier?.stateId?.name} -
                          <UniqueCode
                            text={supplier?.stateId?.code}
                            codeName="State Code"
                          />
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          {supplier?.pinCode}
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          {/* {supplier?.distributorId?.length > 0
                            ? supplier?.distributorId?.map((distributor) => (
                                <div
                                  key={distributor._id}
                                  className="flex gap-2"
                                >
                                  <span className="text-sm">
                                    {distributor.name} ({distributor.dbCode})
                                  </span>
                                </div>
                              ))
                            : ""} */}

                          <div
                            className="flex gap-2 justify-center items-center text-black dark:text-white cursor-pointer"
                            onClick={() => handleOpenDBListModal(supplier)}
                          >
                            <CiCircleList size={20} /> View
                          </div>
                        </Table.Cell>

                        <Table.Cell
                          className={`whitespace-nowrap font-medium `}
                        >
                          <StatusIndicatorNew
                            status={supplier?.status}
                            onClick={
                              pagePermission?.update
                                ? () => handleStatusUpdate(supplier)
                                : undefined
                            }
                            className={`${pagePermission?.update
                                ? "cursor-pointer"
                                : "cursor-not-allowed opacity-50"
                              }`}
                          />

                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          <div className="flex gap-2 justify-center items-center">
                            {pagePermission?.update && (
                              <EditButton
                                onClick={() => handleSetEdit(supplier)}
                              />)}
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                    {suppliers?.length === 0 && (
                      <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                        <Table.Cell
                          colSpan={"100%"}
                          className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200"
                        >
                          No data found
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </>
                )}
              </Table.Body>
            </Table>
          </div>
        </div>

        {/* Add/Edit Modal  */}
        <Modal show={openModal} onClose={onCloseModal}>
          <Modal.Header>
            {modalMode === "add" ? "Add Supplier" : "Edit Supplier"}
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <div>
                <Label htmlFor="supplier-code">Supplier Code</Label>
                <TextInput
                  id="supplier-code"
                  value={formData.supplierCode}
                  onChange={(e) =>
                    setFormData({ ...formData, supplierCode: e.target.value })
                  }
                  placeholder="Enter Supplier Code"
                />
              </div>
              <div>
                <Label htmlFor="supplier-co-code">Supplier Co Code</Label>
                <TextInput
                  id="supplier-co-code"
                  value={formData.coCode}
                  onChange={(e) =>
                    setFormData({ ...formData, coCode: e.target.value })
                  }
                  placeholder="Enter Supplier Co Code"
                />
              </div>
              <div>
                <Label htmlFor="supplier-name">Supplier Name</Label>
                <TextInput
                  id="supplier-name"
                  value={formData.supplierName}
                  onChange={(e) =>
                    setFormData({ ...formData, supplierName: e.target.value })
                  }
                  placeholder="Enter Supplier Name"
                />
              </div>
              <div>
                <Label htmlFor="supplier-type">Supplier Type</Label>
                <Select
                  id="supplier-type"
                  value={formData.supplierType}
                  onChange={(e) =>
                    setFormData({ ...formData, supplierType: e.target.value })
                  }
                >
                  <option value="">Select Supplier Type</option>
                  <option value="C&Agent">C & Agent</option>
                  <option value="Factory">Factory</option>
                  <option value="Depo">Depo</option>
                  <option value="Company">Company</option>
                  <option value="Distributor">Distributor</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="supplier-state">State</Label>
                <Select
                  id="supplier-state"
                  value={formData.stateId}
                  onChange={(e) =>
                    setFormData({ ...formData, stateId: e.target.value })
                  }
                >
                  <option value="">Select State</option>
                  {activeStates?.map((state) => (
                    <option key={state._id} value={state._id}>
                      {state.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="mb-5">
                <Label className="mb-2 block">Select Distributors</Label>

                {/* Distributor Search Box */}
                <div className="mb-3">
                  <TextInput
                    type="text"
                    placeholder="Search Distributor by name or DB code..."
                    value={searchDistributor}
                    onChange={(e) => setSearchDistributor(e.target.value)}
                  />
                </div>

                {/* Filter distributors based on search */}
                <div className="max-h-60 overflow-y-auto border p-2 rounded">
                  <div className="grid grid-cols-2 gap-2">
                    {activeDistributors
                      .filter(
                        (d) =>
                          d.name
                            .toLowerCase()
                            .includes(searchDistributor.toLowerCase()) ||
                          d.dbCode
                            .toLowerCase()
                            .includes(searchDistributor.toLowerCase())
                      )
                      .map((d) => (
                        <div key={d._id} className="flex items-center gap-2">
                          <Checkbox
                            id={`distributor-${d._id}`}
                            checked={formData.distributorId.includes(d._id)}
                            onChange={(e) => {
                              const selected = [...formData.distributorId];
                              if (e.target.checked) {
                                selected.push(d._id);
                              } else {
                                const index = selected.indexOf(d._id);
                                if (index > -1) selected.splice(index, 1);
                              }
                              setFormData({
                                ...formData,
                                distributorId: selected,
                              });
                            }}
                          />
                          <Label htmlFor={`distributor-${d._id}`}>
                            {d.name} ({d.dbCode})
                          </Label>
                        </div>
                      ))}
                    {activeDistributors.filter(
                      (d) =>
                        d.name
                          .toLowerCase()
                          .includes(searchDistributor.toLowerCase()) ||
                        d.dbCode
                          .toLowerCase()
                          .includes(searchDistributor.toLowerCase())
                    ).length === 0 && (
                        <div className="text-sm text-gray-500 col-span-2">
                          No distributors found.
                        </div>
                      )}
                  </div>
                </div>

                {/* Selected distributor badges */}
                {formData.distributorId.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {formData.distributorId.map((id) => {
                      const distributor = activeDistributors.find(
                        (d) => d._id === id
                      );
                      return (
                        <Badge key={id} color="info">
                          {distributor?.name || "Unknown"}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="supplier-city">Supplier City</Label>
                <TextInput
                  id="supplier-city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="Enter Supplier City"
                />
              </div>
              <div>
                <Label htmlFor="supplier-address">Supplier Address</Label>
                <Textarea
                  id="supplier-address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Enter Supplier Address"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="supplier-pincode">Postal Code</Label>
                <TextInput
                  id="supplier-pincode"
                  type="number"
                  value={formData.pinCode}
                  onChange={(e) =>
                    setFormData({ ...formData, pinCode: e.target.value })
                  }
                  placeholder="Enter Postal Code"
                />
              </div>
              <div>
                <Label htmlFor="supplier-gst">GST No</Label>
                <TextInput
                  id="supplier-gst"
                  value={formData.gstNo}
                  onChange={(e) =>
                    setFormData({ ...formData, gstNo: e.target.value })
                  }
                  placeholder="Enter GST No"
                />
              </div>
              <div>
                <Label htmlFor="supplier-contact">Contact No</Label>
                <TextInput
                  id="supplier-contact"
                  value={formData.contactNo}
                  onChange={(e) =>
                    setFormData({ ...formData, contactNo: e.target.value })
                  }
                  placeholder="Enter Contact No"
                />
              </div>
              <div>
                <Label htmlFor="supplier-email">Email</Label>
                <TextInput
                  id="supplier-email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter Email"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button onClick={onCloseModal} color="gray">
                  Cancel
                </Button>
                {modalMode === "add" ? (
                  pagePermission?.create && (
                    <Button
                      onClick={handleAddSupplier}
                      disabled={formLoading}
                    >
                      {formLoading && <Spinner className="mr-2" />}
                      Add Supplier
                    </Button>
                  )
                ) : (
                  pagePermission?.update && (
                    <Button
                      onClick={handleEditSupplier}
                      disabled={formLoading}
                    >
                      {formLoading && <Spinner className="mr-2" />}
                      Update Supplier
                    </Button>
                  )
                )}

              </div>
            </div>
          </Modal.Body>
        </Modal>
      

      {/* DB List Modal */}
      {openDBListModal && (
        <DBListModal
          openDBListModal={openDBListModal}
          setOpenDBListModal={setOpenDBListModal}
          DBList={selectedSupplierForDBList}
        />
      )}
      </div>)}
    </>
  );
};
