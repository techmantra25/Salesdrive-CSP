import {
  Badge,
  Button,
  Card,
  Checkbox,
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
import { addCategory, bulkUpload, updateCategory } from "../../api/api";
import EditButton from "../../assets/common/EditButton";
import StatusIndicator from "../../assets/common/StatusIndicator";
import UniqueCode from "../../assets/common/UniqueCode";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import { fetchCategories } from "../../redux/categorySlice";
import { FileUpload } from "../../uploadWidget/FileUpload";
import { fetchBrands } from "../../redux/brandSlice";
import { escapeCSVValue } from "../../utils/escapeCSVValue";
import { getPagePermission } from "../../utils/permissionHelper";


const Category = () => {
  const dispatch = useDispatch();
  const { categories, loading: categoriesLoading } = useSelector(
    (state) => state.category
  );
  let filteredCategories = [...categories];
  const { brands: brandList } = useSelector((state) => state.brand);
  const activeBrands = brandList
    .filter((brand) => brand.status === true)
    .sort((a, b) => a.name.localeCompare(b.name));
  const [openModal, setOpenModal] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [brandId, setBrandId] = useState([]);
  const [modalMode, setModalMode] = useState("add");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [selectedBrand, setSelectedBrand] = useState("default");
  const [formLoading, setFormLoading] = useState(false);
  const { openConfirmationModel } = useContext(ConfirmationModelContext);
  const [errorLog, setErrorLog] = useState([]);
  const [selectAllBrands, setSelectAllBrands] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const permissionState = useSelector((state) => state.permission);
  const [pagePermission, setPagePermission] = useState(null);

  useEffect(() => {
    if (!permissionState?.data?.data) return;

    const slug = "category"; // must match backend slug
    const permission = getPagePermission(permissionState, slug);

    setPagePermission(permission);
  }, [permissionState]);



  if (selectedStatus !== "default") {
    filteredCategories = [...filteredCategories].filter(
      (category) =>
        category.status === (selectedStatus === "active" ? true : false)
    );
  }

  if (selectedBrand !== "default") {
    filteredCategories = filteredCategories.filter((category) =>
      category?.brandId?.some((brand) => brand._id === selectedBrand)
    );
  }

  if (searchTerm.trim() !== "") {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    filteredCategories = filteredCategories?.filter(
      (category) =>
        category?.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        category?.code.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }

  const handleResetFilter = () => {
    setSelectedStatus("active");
    setSelectedBrand("default");
    dispatch(fetchCategories());
    dispatch(fetchBrands());
  };

  const validate = () => {
    if (name.trim() === "") {
      toast.error("Please enter category name");
      return false;
    }
    return true;
  };

  const handleSetEdit = (category) => {
    setSelectedCategory(category);
    setModalMode("edit");
    setName(category?.name);
    setBrandId(category?.brandId.map((brand) => brand._id));
    setCode(category?.code);
    setImagePath(category?.image_path);
    setOpenModal(true);
  };

  const handleAddCategory = async () => {
    try {
      setFormLoading(true);
      if (!validate()) return;
      const payload = {
        name,
        brandId,
        image_path: imagePath,
      };
      await addCategory(payload);
      dispatch(fetchCategories());
      onCloseModal();
      toast.success("Category added successfully");
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Failed to add category, try again"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const onCloseModal = () => {
    setOpenModal(false);
    setModalMode("add");
    setSelectedCategory(null);
    setName("");
    setBrandId([]);
    setCode("");
    setImagePath("");
    setSelectAllBrands(false);
  };

  const handleEditCategory = async () => {
    openConfirmationModel({
      question: "Are you sure you want to update this category?",
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            setFormLoading(true);
            if (!validate()) return;
            const payload = {
              name,
              brandId,
              image_path: imagePath,
            };
            await updateCategory(payload, selectedCategory._id);
            dispatch(fetchCategories());
            toast.success("Category updated successfully");
            onCloseModal();
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
              "Failed to update category, try again"
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

  const handleStatusUpdate = async (category) => {
    openConfirmationModel({
      question: `Are you sure you want to ${category.status ? "deactivate" : "activate"
        } this category?`,
      answer: ["Yes", "No"],
      onClose: async (result) => {
        if (result) {
          try {
            setFormLoading(true);
            const payload = {
              status: !category.status,
            };
            const res = await updateCategory(payload, category._id);
            dispatch(fetchCategories());

            if (res?.data?.statusUpdateError) {
              toast.error("Status Not Updated dependency exist!");
            } else {
              toast.success("Status updated successfully");
            }
          } catch (error) {
            console.error(error);
            toast.error(
              error?.response?.data?.message ||
              "Failed to update category status"
            );
          } finally {
            setFormLoading(false);
          }
        } else {
          return;
        }
      },
    });
  };

  const handleCSVImport = (url) => {
    try {
      console.log(url);
      dispatch(fetchCategories());
      openConfirmationModel({
        question: "Are you sure you want to import this category CSV?",
        answer: ["Yes", "No"],
        onClose: async (result) => {
          if (result) {
            try {
              let payload = {
                file: url,
              };
              setFormLoading(true);
              const res = await bulkUpload(payload, "Category");
              dispatch(fetchCategories());

              if (
                res?.data?.data?.length === 0 &&
                res?.data?.skippedRows?.length === 0
              ) {
                toast.error("No data found in the file to import");
                return;
              } else if (res?.data?.skippedRows?.length > 0) {
                toast.error(
                  `${res?.data?.skippedRows?.length} rows skipped, ${res?.data?.data?.length ? res?.data?.data?.length : 0
                  } rows imported in the Category Master`
                );
                setErrorLog(res?.data?.skippedRows);
              } else {
                toast.success(
                  `${res?.data?.data?.length} rows imported in the Category Master`
                );
              }

              onCloseModal();
            } catch (error) {
              console.error(error);
              toast.error(
                error?.response?.data?.message ||
                "Failed to import categories, try again"
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

  const handleExportToCSV = () => {
    // Header row
    const csv = [
      [
        "Category Code",
        "Category Name",
        "Brand Code",
        "Brand Name",
        "Brand Description",
        "Image Path",
        "Status",
      ],
    ];

    // Flatten categories and brands
    categories.forEach((category) => {
      if (Array.isArray(category?.brandId) && category.brandId.length > 0) {
        category.brandId.forEach((brand) => {
          csv.push([
            category?.code ?? "",
            category?.name ?? "",
            brand?.code ?? "",
            brand?.name ?? "",
            brand?.desc ?? "",
            category?.image_path ?? "",
            category?.status ? "Active" : "Inactive",
          ]);
        });
      } else {
        // If no brands, still output the category
        csv.push([
          category?.code ?? "",
          category?.name ?? "",
          "",
          "",
          "",
          category?.image_path ?? "",
          category?.status ? "Active" : "Inactive",
        ]);
      }
    });

    // Convert to CSV string
    const csvData = csv
      .map((row) => row.map(escapeCSVValue).join(","))
      .join("\n");

    // Create and trigger download
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "categories.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCSVTemplateDownload = () => {
    const csv = [
      ["Category Name", "Brands", "Image Path"],
      ["Category 1", "Brand 1, Brand 2", ""],
      ["Category 2", "Brand 1, Brand 2", ""],
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," + csv.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "category_template.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handleErrorLogDownload = () => {
    // Construct CSV content
    const csv = [
      ["Category Name", "Brands", "Image Path", "Index", "Reason"],
      ...errorLog.map((data) => [
        data["Category Name"] || "",
        data["Brands"] || "",
        data["Image Path"] || "",
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
    link.setAttribute("download", "categories-error-log.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clear error log if necessary
    setErrorLog([]);
  };

  const handleBrandChange = (e, bId) => {
    const { checked } = e.target;
    if (checked) {
      setBrandId((prevBrandId) => [...prevBrandId, bId]);
    } else {
      setBrandId((prevBrandId) => prevBrandId.filter((id) => id !== bId));
    }
  };

  const handleSelectAllBrands = (e) => {
    const { checked } = e.target;
    setSelectAllBrands(checked);
    if (checked) {
      setBrandId(activeBrands.map((brand) => brand._id));
    } else {
      setBrandId([]);
    }
  };

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBrands());
  }, [dispatch]);

  // Update "Select All" checkbox status based on selected brands
  useEffect(() => {
    if (activeBrands.length > 0 && brandId.length === activeBrands.length) {
      setSelectAllBrands(true);
    } else {
      setSelectAllBrands(false);
    }
  }, [brandId, activeBrands]);

  return (
    pagePermission?.view && (
      <>

        <div className="flex justify-start items-center flex-col gap-4 w-full">
          {/* page header */}
          <div className="flex justify-between w-full items-center border-b-2 py-4">
            <div className="flex justify-center items-center">
              <h1 className="text-2xl font-bold">Category Master</h1>
            </div>
          </div>

          {/* filters */}
          <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
            <Card className="w-full flex justify-center items-center flex-col">
              {/* filter card header */}
              <div className="w-full flex flex-wrap justify-center items-center gap-2">
                <Badge color="warning">Total Count : {categories?.length} </Badge>
                <Badge color="warning">
                  Filtered Count : {filteredCategories?.length}{" "}
                </Badge>
              </div>
              {/* filter div */}
              <div className="flex justify-center w-full items-center gap-4 flex-wrap">
                {/* filter : 1 */}
                <div className="w-44">
                  <div className="block">
                    <Label value="Search" />
                  </div>
                  <TextInput
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search"
                  />
                </div>

                {/* filter : 2 */}
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
                    <Label htmlFor="brandSelect" value="Select Brand" />
                  </div>
                  <Select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    id="brandSelect"
                  >
                    <option value="default">All</option>
                    {activeBrands?.map((brand) => (
                      <option key={brand._id} value={brand._id}>
                        {brand.name}({brand?.desc})
                      </option>
                    ))}
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
                      Add Category
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
            {categoriesLoading ? (
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
                    <Table.HeadCell>Category Code</Table.HeadCell>
                    <Table.HeadCell>Category Name</Table.HeadCell>
                    <Table.HeadCell>Brands</Table.HeadCell>
                    <Table.HeadCell>Image</Table.HeadCell>
                    <Table.HeadCell>Status</Table.HeadCell>
                    <Table.HeadCell>Action</Table.HeadCell>
                  </Table.Head>
                  <Table.Body>
                    {filteredCategories?.map((category, index) => (
                      <Table.Row
                        key={index}
                        className="text-center bg-white dark:border-gray-700 dark:bg-gray-800"
                      >
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          <UniqueCode text={category?.code} codeName="Category" />
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          {category.name}
                        </Table.Cell>
                        <Table.Cell className="whitespace-wrap font-medium text-gray-900 dark:text-gray-200 max-w-44">
                          {category?.brandId
                            ?.filter((brand) => brand?.status === true)
                            ?.map((brand) => `${brand?.name}(${brand?.desc})`)
                            .join(", ")}
                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          <div className="flex gap-2 justify-center items-center">
                            {category.image_path ? (
                              <img
                                src={category.image_path}
                                alt={category.name}
                                className="h-14 object-cover rounded-lg"
                              />
                            ) : (
                              ""
                            )}
                          </div>
                        </Table.Cell>
                        <Table.Cell className={`whitespace-nowrap font-medium `}>
                          <StatusIndicator
                            status={category.status}
                            onClick={
                              pagePermission?.update
                                ? () => handleStatusUpdate(category)
                                : undefined
                            }
                          />

                        </Table.Cell>
                        <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                          <div className="flex gap-2 justify-center items-center">
                            {pagePermission?.update && (
                              <EditButton onClick={() => handleSetEdit(category)} />
                            )}

                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                    {filteredCategories?.length === 0 && (
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

          <Modal show={openModal} size="2xl" onClose={onCloseModal} popup>
            <Modal.Header />
            <Modal.Body>
              <div className="space-y-5">
                <div className="w-full">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label value="Category Name *" />
                  </div>
                  <TextInput
                    placeholder="Enter Category Name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </div>
                <div className="w-full">
                  <div className="mb-2 block text-gray-700 dark:text-gray-100">
                    <Label value="Brand(s)" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        name="selectAllBrands"
                        id="selectAllBrands"
                        checked={selectAllBrands}
                        onChange={handleSelectAllBrands}
                      />
                      <Label htmlFor="selectAllBrands" value="All" />
                    </div>
                    <div className="flex flex-row flex-wrap gap-4 justify-start items-center">
                      {activeBrands.map((brand) => (
                        <div key={brand._id} className="flex items-center gap-2">
                          <Checkbox
                            name="brandId"
                            id={brand._id}
                            value={brand._id}
                            checked={brandId.includes(brand._id)}
                            onChange={(e) => handleBrandChange(e, brand._id)}
                          />
                          <Label
                            htmlFor={`brand-${brand._id}`}
                            value={`${brand?.name} (${brand?.desc})`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
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
                      className="w-full"
                      value={imagePath}
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
                        handleAddCategory();
                      } else if (modalMode === "edit" && pagePermission?.update) {
                        handleEditCategory();
                      }
                    }}

                    disabled={formLoading}
                    className={`${formLoading ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                  >
                    {formLoading ? (
                      <Spinner size="sm" aria-label="Loading spinner" />
                    ) : modalMode === "add" ? (
                      "Add Category"
                    ) : (
                      "Update Category"
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

export default Category;
