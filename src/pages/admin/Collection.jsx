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
import { addCollection, bulkUpload, updateCollection } from "../../api/api";
import EditButton from "../../assets/common/EditButton";
import StatusIndicator from "../../assets/common/StatusIndicator";
import UniqueCode from "../../assets/common/UniqueCode";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import { fetchCategories } from "../../redux/categorySlice";
import { fetchCollections } from "../../redux/collectionSlice";
import { FileUpload } from "../../uploadWidget/FileUpload";
import { getPagePermission } from "../../utils/permissionHelper";


const Collection = () => {
  const dispatch = useDispatch();
  const [selectedCategory, setSelectedCategory] = useState("default");
  const [openModal, setOpenModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);

  useEffect(() => {
    if (!permissionState?.data?.data) return;
    const slug = "collection";
    const permission = getPagePermission(permissionState, slug);
    setPagePermission(permission);
  }, [permissionState]);


  const { collections: collectionList, loading: collectionLoading } =
    useSelector((state) => state.collection);

  const { categories: categoryList, loading: categoryLoading } = useSelector(
    (state) => state.category
  );
  const activeCategories = categoryList
    ?.filter((category) => category.status === true)
    .sort((a, b) => a.name.localeCompare(b.name));

  const [name, setName] = useState("");
  const [catId, setCatId] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [description, setDescription] = useState("");
  const [code, setCode] = useState("");
  const [modalMode, setModalMode] = useState("add");
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("active");
  const { openConfirmationModel } = useContext(ConfirmationModelContext);
  const [errorLog, setErrorLog] = useState([]);

  let filteredCollectionList = [...collectionList];

  if (selectedCategory !== "default") {
    filteredCollectionList = [...filteredCollectionList].filter(
      (collection) => collection.cat_id._id === selectedCategory
    );
  }

  if (selectedStatus !== "default") {
    filteredCollectionList = [...filteredCollectionList].filter(
      (collection) =>
        collection.status === (selectedStatus === "active" ? true : false)
    );
  }

  const validate = () => {
    if (name.trim() === "") {
      toast.error("Please enter collection name");
      return false;
    }
    return true;
  };

  const handleSetEdit = (collection) => {
    setSelectedCollection(collection);
    setModalMode("edit");
    setName(collection?.name);
    setCatId(collection?.cat_id?._id);
    setImagePath(collection?.image_path);
    setDescription(collection?.description);
    setCode(collection?.code);
    setOpenModal(true);
  };

  const handleAddCollection = async () => {
    try {
      if (!validate()) return;
      setFormLoading(true);
      const payload = {
        name,
        cat_id: catId,
        image_path: imagePath,
        description,
      };
      await addCollection(payload);
      dispatch(fetchCollections());
      onCloseModal();
      toast.success("Collection added successfully");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to add collection, try again"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditCollection = async () => {
    openConfirmationModel({
      question: "Are you sure you want to update this collection?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            if (!validate()) return;
            setFormLoading(true);
            const payload = {
              name,
              cat_id: catId,
              image_path: imagePath,
              description,
            };
            await updateCollection(payload, selectedCollection._id);
            dispatch(fetchCollections());
            toast.success("Collection updated successfully");
            onCloseModal();
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
              "Failed to update collection, try again"
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

  const onCloseModal = () => {
    setOpenModal(false);
    setModalMode("add");
    setSelectedCategory("default");
    setName("");
    setImagePath("");
    setDescription("");
    setCode("");
    setSelectedCollection(null);
    setCatId("");
  };

  const handleStatusUpdate = async (collection) => {
    openConfirmationModel({
      question: `Are you sure you want to ${collection.status ? "deactivate" : "activate"
        } this collection?`,
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            const payload = {
              status: !collection.status,
            };
            const res = await updateCollection(payload, collection._id);
            dispatch(fetchCollections());
            if (res?.data?.statusUpdateError) {
              toast.error("Status Not Updated dependency exist!");
            } else {
              toast.success("Status updated successfully");
            }
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
              "Failed to update collection status"
            );
          }
        } else {
          return;
        }
      },
    });
  };

  const handleResetFilter = () => {
    setSelectedCategory("default");
    setSelectedStatus("active");
    dispatch(fetchCategories());
    dispatch(fetchCollections());
  };

  const handleCSVTemplateDownload = () => {
    const csv = [
      [
        "Collection Name",
        "Category Code",
        "Category Name",
        "Image Path",
        "Collection Description",
      ],
      ["Collection Name 1", "32436", "Category Name 1", "", "XYZ1"],
      ["Collection Name 2", "4234", "Category Name 2", "", "XYZ2"],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," + csv.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "collection_template.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handleExportToCSV = () => {
    const csv = [
      [
        "Collection Code",
        "Collection Name",
        "Category Code",
        "Category Name",
        "Description",
        "Image Path",
        "Status",
      ],
      ...filteredCollectionList.map((collection) => [
        collection.code ? collection.code : "",
        collection.name,
        collection?.cat_id?.code,
        collection?.cat_id?.name,
        collection.description ? collection.description : "",
        collection.image_path ? collection.image_path : "",
        collection.status ? "Active" : "Inactive",
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," + csv.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "collections.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handleCSVImport = (url) => {
    try {
      console.log(url);
      dispatch(fetchCollections());
      openConfirmationModel({
        question: "Are you sure you want to import this collection CSV?",
        answer: ["Yes", "No"],
        onClose: async (result) => {
          if (result) {
            try {
              let payload = {
                file: url,
              };
              setFormLoading(true);
              const res = await bulkUpload(payload, "Collection");
              dispatch(fetchCollections());

              if (
                res?.data?.data?.length === 0 &&
                res?.data?.skippedRows?.length === 0
              ) {
                toast.error("No data found in the file to import");
                return;
              } else if (res?.data?.skippedRows?.length > 0) {
                toast.error(
                  `${res?.data?.skippedRows?.length} rows skipped, ${res?.data?.data?.length ? res?.data?.data?.length : 0
                  } rows imported in the Collection Master`
                );
                setErrorLog(res?.data?.skippedRows);
              } else {
                toast.success(
                  `${res?.data?.data?.length} rows imported in the Collection Master`
                );
              }
              onCloseModal();
            } catch (error) {
              console.error(error);
              toast.error(
                error?.response?.data?.message ||
                "Failed to import collections, try again"
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

  const handleErrorLogDownload = () => {
    // Construct CSV content
    const csv = [
      [
        "Collection Name",
        "Category Code",
        "Category Name",
        "Image Path",
        "Collection Description",
        "Index",
        "Reason",
      ],
      ...errorLog.map((data) => [
        data["Collection Name"] || "",
        data["Category Code"] || "",
        data["Category Name"] || "",
        data["Image Path"] || "",
        data["Collection Description"] || "",
        data["index"] || "",
        data["reason"] || "",
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
    link.setAttribute("download", "collections-error-log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clear error log if necessary
    setErrorLog([]);
  };

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchCollections());
  }, [dispatch]);

  return (
    <>
      {pagePermission?.view && (
        <div className="flex justify-start items-center flex-col gap-4 w-full">

          {/* page header */}
          <div className="flex justify-between w-full items-center border-b-2 py-4">
            <div className="flex justify-center items-center">
              <h1 className="text-2xl font-bold">Collection / Product Type Master</h1>
            </div>
          </div>

          {/* filters */}
          <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
            <Card className="w-full flex justify-center items-center flex-col">
              {/* filter card header */}
              <div className="w-full flex flex-wrap justify-center items-center gap-2">
                <Badge color="warning">
                  Total Count : {collectionList?.length}{" "}
                </Badge>
                <Badge color="warning">
                  Filtered Count : {filteredCollectionList?.length}{" "}
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
                {/* filter : 2 */}
                <div className="w-56">
                  <div className="mb-2 block">
                    <Label htmlFor="categorySelect" value="Select Category" />
                  </div>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    id="categorySelect"
                    required
                  >
                    <option value="default">All</option>
                    {categoryList.map((category, index) => (
                      <option key={index} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              {/* btns */}
              <div className="flex justify-center w-full items-center gap-2 flex-wrap">
                {pagePermission?.view && (
                  <Button
                    className="text-xs"
                    size="sm"
                    color="success"
                    onClick={() => handleResetFilter()}
                  >
                    <span className="flex justify-center items-center gap-2">
                      <RiRefreshFill size={20} />
                      Reset & Refresh
                    </span>
                  </Button>
                )}
                {pagePermission?.create && (
                  <Button
                    className="text-xs"
                    size="sm"
                    onClick={() => setOpenModal(true)}
                  >

                    <span className="flex justify-center items-center gap-2">
                      <IoMdAddCircle size={20} />
                      Add Collection
                    </span>
                  </Button>)}
                {pagePermission?.view && (
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
                )}
                {pagePermission?.view && (
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
                )}

                {pagePermission?.create && (
                  <FileUpload
                    type="single-file"
                    page="bulk-import"
                    onSetFileUrl={(url) => {
                      handleCSVImport(url);
                    }}
                  />
                )}

                {errorLog.length > 0 && pagePermission?.view && (
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

          {/* Table */}
          <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
            {collectionLoading || categoryLoading ? (
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
                    <Table.HeadCell>Collection Code</Table.HeadCell>
                    <Table.HeadCell>Collection Name</Table.HeadCell>
                    <Table.HeadCell>Category Code</Table.HeadCell>
                    <Table.HeadCell>Category Name</Table.HeadCell>
                    <Table.HeadCell>Image</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Action</Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                    {filteredCollectionList.map((collection, index) => (
                      <Table.Row
                        key={index}
                        className="text-center bg-white dark:border-gray-700 dark:bg-gray-800"
                      >
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          <UniqueCode
                            text={collection?.code}
                            codeName="Collection"
                          />
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          {collection.name}
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          <UniqueCode
                            text={collection?.cat_id?.code}
                            codeName="Category"
                          />
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          {collection?.cat_id?.name}
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          <div className="flex gap-2 justify-center items-center">
                            {collection.image_path ? (
                              <img
                                src={collection.image_path}
                                alt={collection.name}
                                className="h-14 object-cover rounded-lg"
                              />
                            ) : (
                              ""
                            )}
                          </div>
                        </Table.Cell>
                        <Table.Cell className={`whitespace-nowrap font-medium `}>
                          <StatusIndicator
                            status={collection.status}
                            onClick={
                              pagePermission?.update
                                ? () => handleStatusUpdate(collection)
                                : undefined
                            }
                          />
                        </Table.Cell>

                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          <div className="flex gap-2 justify-center items-center">
                            {pagePermission?.update && (
                              <EditButton
                                onClick={() => handleSetEdit(collection)}
                              />
                            )}
                          </div>
                        </Table.Cell>

                      </Table.Row>
                    ))}
                    {filteredCollectionList.length === 0 && (
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
                <Modal show={openModal} size="sm" onClose={onCloseModal} popup>
                  <Modal.Header />
                  <Modal.Body>
                    <div className="space-y-5">
                      <div className="w-full ">
                        <div className="mb-2 block text-gray-700 dark:text-gray-100">
                          <Label value="Collection Name *" />
                        </div>
                        <TextInput
                          placeholder="Enter Collection Name"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          required
                        />
                      </div>
                      {modalMode === "edit" && (
                        <div className="w-full ">
                          <div className="mb-2 block text-gray-700 dark:text-gray-100">
                            <Label value="Code" />
                          </div>
                          <TextInput value={code} disabled />
                        </div>
                      )}
                      <div className="w-full">
                        <div className="mb-2 block text-gray-700 dark:text-gray-100">
                          <Label value="Select Category *" />
                        </div>
                        <Select
                          value={catId}
                          onChange={(event) => setCatId(event.target.value)}
                          required
                        >
                          <option value="">Select Category</option>
                          {activeCategories.map((category) => (
                            <option key={category._id} value={category._id}>
                              {category.name}
                            </option>
                          ))}
                        </Select>
                      </div>
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

                      <div className="w-full ">
                        <div className="mb-2 block text-gray-700 dark:text-gray-100">
                          <Label value="Description (optional)" />
                        </div>
                        <TextInput
                          placeholder="Enter Description"
                          value={description}
                          onChange={(event) => setDescription(event.target.value)}
                          required
                        />
                      </div>
                      <div className="w-full">
                        <Button
                          onClick={
                            modalMode === "add"
                              ? handleAddCollection
                              : handleEditCollection
                          }
                          disabled={formLoading}
                          className={`${formLoading ? "opacity-60 cursor-not-allowed" : ""
                            }`}
                        >
                          {formLoading ? (
                            <Spinner size="sm" aria-label="Loading spinner" />
                          ) : modalMode === "add" ? (
                            "Add Collection"
                          ) : (
                            "Update Collection"
                          )}
                        </Button>
                      </div>
                    </div>
                  </Modal.Body>
                </Modal>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );

};

export default Collection;
