import {
  Badge,
  Button,
  Card,
  Label,
  Select,
  Spinner,
  Table,
} from "flowbite-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { RiRefreshFill } from "react-icons/ri";
import { useDispatch} from "react-redux";
import { AllSubBrandList } from "../../api/api";
import StatusIndicator from "../../assets/common/StatusIndicator";
import UniqueCode from "../../assets/common/UniqueCode";
import { fetchBrands } from "../../redux/brandSlice";

const SubBrandView = () => {
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [subBrands, setSubBrands] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("active");

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

  useEffect(() => {
    dispatch(fetchBrands());
  }, [dispatch]);

  useEffect(() => {
    fetchAllSubBrands();
  }, []);

  return (
    <>
      <div className="flex justify-start items-center flex-col gap-4 w-full">
        {/* page header */}
        <div className="flex justify-between w-full items-center border-b-2 py-4">
          <div className="flex justify-center items-center">
            <h1 className="text-2xl font-bold">Sub-Brand Master</h1>
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
            </div>
          </Card>
        </div>

        {/* table */}
        <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
          {loading ? (
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
                        <StatusIndicator status={brand.status} />
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
      </div>
    </>
  );
};

export default SubBrandView;
