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

import { RiRefreshFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";

import StatusIndicator from "../../assets/common/StatusIndicator";
import UniqueCode from "../../assets/common/UniqueCode";

import { fetchCategories } from "../../redux/categorySlice";
import { fetchCollections } from "../../redux/collectionSlice";

const CollectionView = () => {
  const dispatch = useDispatch();
  const [selectedCategory, setSelectedCategory] = useState("default");

  const { collections: collectionList, loading: collectionLoading } =
    useSelector((state) => state.collection);

  const { categories: categoryList, loading: categoryLoading } = useSelector(
    (state) => state.category
  );

  const [selectedStatus, setSelectedStatus] = useState("active");

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

  const handleResetFilter = () => {
    setSelectedCategory("default");
    setSelectedStatus("active");
    dispatch(fetchCategories());
    dispatch(fetchCollections());
  };

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchCollections());
  }, [dispatch]);

  return (
    <>
      <div className="flex justify-start items-center flex-col gap-4 w-full">
        {/* page header */}
        <div className="flex justify-between w-full items-center border-b-2 py-4">
          <div className="flex justify-center items-center">
            <h1 className="text-2xl font-bold">Collection Master</h1>
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
                        <StatusIndicator status={collection.status} />
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
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CollectionView;
