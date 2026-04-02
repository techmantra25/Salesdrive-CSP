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
import { RiRefreshFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import StatusIndicator from "../../assets/common/StatusIndicator";
import UniqueCode from "../../assets/common/UniqueCode";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import { fetchCategories } from "../../redux/categorySlice";

import { fetchBrands } from "../../redux/brandSlice";

const CategoryView = () => {
  const dispatch = useDispatch();
  const { categories, loading: categoriesLoading } = useSelector(
    (state) => state.category
  );
  let filteredCategories = [...categories];
  const { brands: brandList } = useSelector((state) => state.brand);
  const activeBrands = brandList
    .filter((brand) => brand.status === true)
    .sort((a, b) => a.name.localeCompare(b.name));
  const [brandId, setBrandId] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [selectedBrand, setSelectedBrand] = useState("default");
  const { openConfirmationModel } = useContext(ConfirmationModelContext);
  const [selectAllBrands, setSelectAllBrands] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
                        <StatusIndicator status={category.status} />
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
      </div>
    </>
  );
};

export default CategoryView;
