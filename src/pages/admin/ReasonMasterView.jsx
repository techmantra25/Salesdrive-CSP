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
import { FaTrashAlt } from "react-icons/fa";
import { IoMdAddCircle } from "react-icons/io";
import { RiRefreshFill } from "react-icons/ri";
import {
  addReason,
  deleteReason,
  getReasonsList,
  updateReason,
} from "../../api/api";
import StatusIndicator from "../../assets/common/StatusIndicator";
import { ConfirmationModelContext } from "../../context/ContextProvider";

const ReasonMasterView = () => {
  const [selectedModule, setSelectedModule] = useState("");
  const [inputFields, setInputFields] = useState([{ name: "" }]);
  const [openModal, setOpenModal] = useState(false);
  const [openInfoModal, setOpenInfoModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [allReasons, setAllReasons] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("default");
  const [filterModule, setFilterModule] = useState("default");
  const { openConfirmationModel } = useContext(ConfirmationModelContext);

  let filtersReasons = [...allReasons];

  if (filterModule !== "default") {
    filtersReasons = allReasons.filter((item) => item?.module === filterModule);
  }

  if (selectedStatus !== "default") {
    filtersReasons = filtersReasons.filter(
      (item) => item?.status === (selectedStatus === "active" ? true : false)
    );
  }

  async function getReasonsData(isMounted) {
    setPageLoading(true);
    const res = await getReasonsList();
    console.log(res?.data?.data);
    if (isMounted) {
      setAllReasons(res.data.data);
    }
    setPageLoading(false);
  }

  useEffect(() => {
    let isMounted = true;
    getReasonsData(isMounted);
    return () => {
      isMounted = false;
    };
  }, []);

  const onCloseInfoModal = () => {
    setOpenInfoModal(false);
  };

  const handleResetFilter = () => {
    getReasonsData(true);
    setInputFields([{ name: "" }]);
    setSelectedModule(null);
    setOpenModal(false);
    setSelectedStatus("default");
    filterModule("default");
  };

  return (
    <>
      <div className="flex justify-start items-center flex-col gap-4 w-full">
        {/* page header */}
        <div className="flex justify-between w-full items-center border-b-2 py-4">
          <div className="flex justify-center items-center">
            <h1 className="text-2xl font-bold">Return & Reason Master</h1>
          </div>
        </div>

        {/* filters */}
        <div className="flex justify-start items-center flex-col w-full gap-4 p-4">
          <Card className="w-full flex justify-center items-center flex-col">
            {/* filter card header */}
            <div className="w-full flex flex-wrap justify-center items-center gap-2">
              <Badge color="warning">Total Count : {allReasons?.length} </Badge>
              <Badge color="warning">
                Filtered Count : {filtersReasons?.length}{" "}
              </Badge>
            </div>
            {/* filter div */}
            <div className="flex justify-center w-full items-center gap-4 flex-wrap">
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
                  <Label htmlFor="zoneSelect" value="Select Mode" />
                </div>
                <Select
                  value={filterModule}
                  onChange={(e) => setFilterModule(e.target.value)}
                  id="zoneSelect"
                  required
                >
                  <option value="default">All</option>
                  <option value="Purchase-Order-Cancellation">
                    Purchase-Order-Cancellation
                  </option>
                  <option value="Order-To-Bill">Order-To-Bill</option>
                  <option value="Order-Cancellation">Order-Cancellation</option>
                  <option value="Bill-Cancellation">Bill Cancellation</option>
                  <option value="Sales-Return">Sales-Return</option>
                  <option value="Purchase-Return">Purchase-Return</option>
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

        {/* table header with Info button */}
        <div className="flex justify-between w-full items-center px-4">
          <Button size="sm" onClick={() => setOpenInfoModal(true)}>
            Show Info
          </Button>
        </div>

        {/* table */}
        <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
          {pageLoading ? (
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
                  <Table.HeadCell>Module</Table.HeadCell>
                  <Table.HeadCell>Reason</Table.HeadCell>
                  <Table.HeadCell>Create Date</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {filtersReasons.map((item) => (
                    <Table.Row
                      key={item?._id}
                      className="text-center bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {item.module}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {item.reason}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        <StatusIndicator status={item.status} />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                  {filtersReasons.length === 0 && (
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
        {/* Add or Edit Modal  */}

        {/* Information Modal */}
        <Modal show={openInfoModal} size="lg" onClose={onCloseInfoModal}>
          <Modal.Header>Instructions</Modal.Header>
          <Modal.Body>
            <div className="space-y-2 text-gray-700 dark:text-gray-100">
              <div>
                <h4 className="text-xl font-bold">
                  1. Purchase Order Cancellation
                </h4>
                <p>
                  This reason will be used for Purchase Order or Primary Order
                  cancellation for distributor.
                </p>
              </div>

              <div>
                <h4 className="text-xl font-bold">2. Order-To-Bill</h4>
                <p>
                  This reason will be used for Order-To-Bill for distributor.
                </p>
              </div>

              <div>
                <h4 className="text-xl font-bold">3. Order-Cancellation</h4>
                <p>
                  This reason will be used for Order-Cancellation for
                  distributor.
                </p>
              </div>

              <div>
                <h4 className="text-xl font-bold">4. Bill Cancellation</h4>
                <p>
                  This reason will be used for Bill Cancellation for
                  distributor.
                </p>
              </div>

              <div>
                <h4 className="text-xl font-bold">5. Sales-Return</h4>
                <p>
                  This reason will be used for Sales-Return for distributor.
                </p>
              </div>
              <div>
                <h4 className="text-xl font-bold">6. Purchase-Return</h4>
                <p>
                  This reason will be used for Purchase-Return for distributor.
                </p>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

export default ReasonMasterView;
