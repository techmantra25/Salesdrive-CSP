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
import { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BiSolidFileExport } from "react-icons/bi";
import { IoMdAddCircle } from "react-icons/io";
import { MdDownloadForOffline, MdSimCardDownload } from "react-icons/md";
import { RiRefreshFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import {
  addSubBrand,
  AllSubBrandList,
  SubBrandbulkUpload,
  updateSubBrand,
} from "../../api/api";
import EditButton from "../../assets/common/EditButton";
import StatusIndicator from "../../assets/common/StatusIndicator";
import UniqueCode from "../../assets/common/UniqueCode";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import { fetchBrands } from "../../redux/brandSlice";
import { FileUpload } from "../../uploadWidget/FileUpload";
import { getPagePermission } from "../../utils/permissionHelper";


const SubBrand = () => {
  const dispatch = useDispatch();
  const { brands, loading: brandsLoading } = useSelector(
    (state) => state.brand
  );
  const [openModal, setOpenModal] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [brand, setBrand] = useState("default");
  const [imagePath, setImagePath] = useState("");
  const [desc, setDesc] = useState("");
  const [modalMode, setModalMode] = useState("add");
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subBrands, setSubBrands] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("active");
  const { openConfirmationModel } = useContext(ConfirmationModelContext);
  const [errorLog, setErrorLog] = useState([]);
  const permissionState = useSelector((state) => state.permission);
const [pagePermission, setPagePermission] = useState(null);

useEffect(() => {
  if (!permissionState?.data?.data) return;

  const slug = "sub-brand"; // must match backend slug
  const permission = getPagePermission(permissionState, slug);

  setPagePermission(permission);
}, [permissionState]);


  const fetchAllSubBrands = async () => {
    try {
      setLoading(true);
      const res = await AllSubBrandList();
      if (res?.data?.data) {
        setSubBrands(res.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to fetch Sub-Brands, try again"
      );
    } finally {
      setLoading(false);
    }
  };

  let filteredSubBrands = [...subBrands];

  if (selectedStatus !== "default") {
    filteredSubBrands = [...filteredSubBrands].filter(
      (subBrand) =>
        subBrand.status === (selectedStatus === "active" ? true : false)
    );
  }

  const handleResetFilter = () => {
    setSelectedStatus("active");
    fetchAllSubBrands();
    //dispatch(fetchBrands());
  };

  const validate = () => {
    if (name.trim() === "") {
      toast.error("Please enter Sub-Brand name");
      return false;
    }
    if (brand === "default") {
      toast.error("Please select a Brand");
      return false;
    }
    return true;
  };

  const handleSetEdit = (brand) => {
    setSelectedBrand(brand);
    setModalMode("edit");
    setName(brand?.name);
    setBrand(brand?.brandId?._id ?? "default");
    setCode(brand?.code);
    setImagePath(brand?.image_path);
    setDesc(brand?.desc);
    setOpenModal(true);
  };

  const handleAddBrand = async () => {
    try {
      setFormLoading(true);
      if (!validate()) return;
      const payload = {
        name,
        image_path: imagePath,
        desc,
        brandId: brand,
      };
      await addSubBrand(payload);
      fetchAllSubBrands();
      //dispatch(fetchBrands());
      onCloseModal();
      toast.success("Sub-Brand added successfully");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to add Sub-Brand, try again"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const onCloseModal = () => {
    setOpenModal(false);
    setModalMode("add");
    setSelectedBrand(null);
    setName("");
    setBrand("default");
    setCode("");
    setImagePath("");
    setDesc("");
  };

  const handleEditBrand = async () => {
    openConfirmationModel({
      question: "Are you sure you want to update this Sub-Brand?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            setFormLoading(true);
            if (!validate()) return;
            const payload = {
              name,
              image_path: imagePath,
              desc,
              brandId: brand,
            };
            await updateSubBrand(payload, selectedBrand._id);
            //dispatch(fetchBrands());
            fetchAllSubBrands();
            toast.success("Sub-Brand updated successfully");
            onCloseModal();
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
                "Failed to update Sub-Brand, try again"
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

  const handleStatusUpdate = async (brand) => {
    openConfirmationModel({
      question: `Are you sure you want to ${
        brand.status ? "deactivate" : "activate"
      } this Sub-Brand?`,
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            const payload = {
              status: !brand.status,
            };
            const res = await updateSubBrand(payload, brand._id);
            //dispatch(fetchBrands());
            fetchAllSubBrands();
            if (res?.data?.statusUpdateError) {
              toast.error("Status Not Updated dependency exist!");
            } else {
              toast.success("Status updated successfully");
            }
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
                "Failed to update Sub-Brand status"
            );
          }
        } else {
          return;
        }
      },
    });
  };

  const handleExportToCSV = () => {
    const csv = [
      [
        "SUB BRAND CODE",
        "SUB BRAND NAME",
        "SUB BRAND DESCRIPTION",
        "BRAND NAME",
        "BRAND DESCRIPTION",
        "SUB BRAND IMAGE PATH",
        "SUB BRAND STATUS",
      ],
      ...filteredSubBrands.map((brand) => [
        brand?.code,
        brand?.name,
        brand?.desc,
        brand?.brandId?.name,
        brand?.brandId?.desc,
        brand?.image_path,
        brand?.status ? "Active" : "Inactive",
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," + csv.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sub-brands.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handleCSVImport = async (url) => {
    try {
      //dispatch(fetchBrands());
      fetchAllSubBrands();
      openConfirmationModel({
        question: "Are you sure you want to import this Sub-Brand CSV?",
        answer: ["Yes", "No"],
        onClose: async (result) => {
          if (result) {
            try {
              let payload = {
                csvUrl: url,
              };
              setFormLoading(true);
              const res = await SubBrandbulkUpload(payload);
              //dispatch(fetchBrands());
              fetchAllSubBrands();
              if (
                res?.data?.data?.length === 0 &&
                res?.data?.skippedRows?.length === 0
              ) {
                toast.error("No data found in the file to import");
                return;
              } else if (res?.data?.skippedRows?.length > 0) {
                toast.error(
                  `${res?.data?.skippedRows?.length} rows skipped, ${
                    res?.data?.data?.length ? res?.data?.data?.length : 0
                  } rows imported in the Sub-Brand Master`
                );
                console.log(res, "skippedRows");
                setErrorLog(res?.data?.skippedRows);
              } else {
                toast.success(
                  `${res?.data?.data?.length} rows imported in the Sub-Brand Master`
                );
              }
              onCloseModal();
            } catch (error) {
              console.error(error);
              toast.error(
                error?.response?.data?.message ||
                  "Failed to import Sub-Brand, try again"
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

  const handleCSVTemplateDownload = () => {
    const csv = [
      ["BRAND NAME", "SUB BRAND NAME", "SUB BRAND DESCRIPTION", "IMAGE PATH"],
      ["Brand 1", "Sub Brand 1", "Sub Brand 1 Description", ""],
      ["Brand 2", "Sub Brand 2", "Sub Brand 2 Description", ""],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," + csv.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sub-brands_template.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handleErrorLogDownload = () => {
    // Construct CSV content
    console.log(errorLog, "errorLog");
    const csv = [
      [
        "BRAND NAME",
        "SUB BRAND NAME",
        "SUB BRAND DESCRIPTION",
        "IMAGE PATH",
        "INDEX",
        "REASON",
      ],
      ...errorLog.map((data) => [
        data?.["BRAND NAME"] || "",
        data?.["SUB BRAND NAME"] || "",
        data?.["SUB BRAND DESCRIPTION"] || "",
        data?.["IMAGE PATH"] || "",
        data?.["index"] || "",
        data?.["reason"] || "",
      ]),
    ];

    // Create CSV string
    const csvContent =
      "data:text/csv;charset=utf-8," + csv.map((e) => e.join(",")).join("\n");

    // Encode URI
    const encodedUri = encodeURI(csvContent);

    // Create a link element and trigger download
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sub-brands-error-log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clear error log if necessary
    setErrorLog([]);
  };

  useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

  useEffect(() => {
    fetchAllSubBrands();
  }, []);

 return (
  pagePermission?.view && (
  <>

      <div className="flex justify-start items-center flex-col gap-4 w-full">
        {/* page header */}
        <div className="flex justify-between w-full items-center border-b-2 py-4">
          <div className="flex justify-center items-center">
            <h1 className="text-2xl font-bold">Sub-Brand / Segment Master</h1>
          </div>
        </div>

        {/* filters */}
        <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
          <Card className="w-full flex justify-center items-center flex-col">
            {/* filter card header */}
            <div className="w-full flex flex-wrap justify-center items-center gap-2">
              <Badge color="warning">Total Count : {subBrands?.length} </Badge>
              <Badge color="warning">
                Filtered Count : {filteredSubBrands?.length}{" "}
              </Badge>
            </div>
            {/* filter div */}
            <div className="flex justify-center w-full items-center gap-4 flex-wrap">
              {/* filter : 1 */}
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
                  Add Sub-Brand
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
              <Button
                className="text-xs"
                size="sm"
                color="blue"
                onClick={() => {
                  handleExportToCSV();
                }}
              >
                <span className="flex justify-center items-center gap-2">
                  <BiSolidFileExport size={20} />
                  CSV Download
                </span>
              </Button>

{pagePermission?.create && (
<FileUpload
  type="single-file"
  page="bulk-import"
  onSetFileUrl={(url) => {
    handleCSVImport(url);
  }}
/>
)}



              {errorLog.length > 0 && (
                <Button
                  className="text-xs"
                  size="sm"
                  color="red"
                  onClick={() => {
                    handleErrorLogDownload();
                  }}
                >
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

        {/* table */}
        <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
          {brandsLoading || loading ? (
            <div
              className="w-full flex justify-center items-center"
              role="status"
            >
              <Spinner aria-label="Default status example" size="xl" />
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <Table striped>
                <Table.Head className="text-center">
                  <Table.HeadCell>Sub-Brand Code</Table.HeadCell>
                  <Table.HeadCell>Sub-Brand Name</Table.HeadCell>
                  <Table.HeadCell>Sub-Brand Description</Table.HeadCell>
                  {/* <Table.HeadCell>Image</Table.HeadCell> */}
                  <Table.HeadCell>Brand</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                  <Table.HeadCell>Action</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {filteredSubBrands?.map((brand, index) => (
                    <Table.Row
                      key={index}
                      className="text-center bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        <UniqueCode text={brand?.code} codeName="Sub Brand" />
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {brand.name}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {brand?.desc || ""}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {brand?.brandId?.code || ""} - (
                        {brand?.brandId?.desc || ""})
                      </Table.Cell>
                      {/* image 
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        <div className="flex gap-2 justify-center items-center">
                          {brand.image_path ? (
                            <img
                              src={brand.image_path}
                              alt={brand.name}
                              className="h-14 object-cover rounded-lg"
                            />
                          ) : (
                            ""
                          )}
                        </div>
                      </Table.Cell>*/}
                      <Table.Cell className={`whitespace-nowrap font-medium `}>
                        <StatusIndicator
  status={brand.status}
  onClick={
    pagePermission?.update
      ? () => handleStatusUpdate(brand)
      : undefined
  }
/>

                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        <div className="flex gap-2 justify-center items-center">
                        {pagePermission?.update && (
  <EditButton onClick={() => handleSetEdit(brand)} />
)}

                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                  {filteredSubBrands?.length === 0 && (
                    <Table.Row className="text-center bg-white dark:border-gray-700 dark:bg-gray-800">
                      <Table.Cell
                        colSpan={"100%"}
                        className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200"
                      >
                        No data found
                      </Table.Cell>
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
                <div className="mb-2 block text-gray-700 dark:text-gray-100">
                  <Label value="Sub-Brand Name *" />
                </div>
                <TextInput
                  placeholder="Enter Sub-Brand Name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
              <div className="w-full">
                <div className="mb-2 block text-gray-700 dark:text-gray-100">
                  <Label value="Description (optional)" />
                </div>
                <TextInput
                  placeholder="Enter Description"
                  value={desc}
                  onChange={(event) => setDesc(event.target.value)}
                />
              </div>
              <div className="w-full">
                <div className="mb-2 block">
                  <Label htmlFor="brandSelect" value="Select Brand" />
                </div>
                <Select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  id="brandSelect"
                  required
                >
                  <option value="default">All</option>
                  {brands?.map((brand) => (
                    <option key={brand._id} value={brand._id}>
                      {brand.name}
                    </option>
                  ))}
                </Select>
              </div>
              {modalMode === "edit" && (
                <div className="w-full">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label value="Code" />
                  </div>
                  <TextInput value={code} disabled />
                </div>
              )}
              <div className="w-full">
                <div className="mb-2 block text-gray-700 dark:text-gray-100">
                  <Label value="Image Path (optional)" />
                </div>
                <div className="flex justify-center items-center gap-2 w-full">
                  <TextInput
                    placeholder="Enter Image Path"
                    value={imagePath}
                    className="w-full"
                    onChange={(event) => setImagePath(event.target.value)}
                  />
                  <FileUpload
                    onSetFileUrl={setImagePath}
                    type="single-image"
                    page="modal-form"
                  />
                </div>
              </div>

              <div className="w-full">
               <Button
  onClick={() => {
    if (modalMode === "add" && pagePermission?.create) {
      handleAddBrand();
    } else if (modalMode === "edit" && pagePermission?.update) {
      handleEditBrand();
    }
  }}

                  disabled={formLoading}
                  className={`${
                    formLoading ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                >
                  {formLoading ? (
                    <Spinner size="sm" aria-label="Loading spinner" />
                  ) : modalMode === "add" ? (
                    "Add Sub-Brand"
                  ) : (
                    "Update Sub-Brand"
                  )}
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
   </>
  )
);

};

export default SubBrand;
