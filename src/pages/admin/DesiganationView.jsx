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
import { RiRefreshFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { addDesignation, updateDesignation } from "../../api/api";
import EditButton from "../../assets/common/EditButton";
import { ConfirmationModelContext } from "../../context/ContextProvider";
import { fetchDesignations } from "../../redux/designationSlice";
import StatusIndicator from "../../assets/common/StatusIndicator";
import UniqueCode from "../../assets/common/UniqueCode";

const DesignationView = () => {
  const dispatch = useDispatch();
  const { designations, loading } = useSelector((state) => state.designations);
  let filteredDesignations = [...designations];
  const [openModal, setOpenModal] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [modalMode, setModalMode] = useState("add");
  const [selectedDesignation, setSelectedDesignation] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("active");
  const { openConfirmationModel } = useContext(ConfirmationModelContext);
  const [parentDesignation, setParentDesignation] = useState("");

  if (selectedStatus !== "default") {
    filteredDesignations = [...filteredDesignations].filter(
      (designation) =>
        designation.status === (selectedStatus === "active" ? true : false)
    );
  }

  const handleResetFilter = () => {
    setSelectedStatus("active");
    dispatch(fetchDesignations());
  };

  useEffect(() => {
    dispatch(fetchDesignations());
  }, [dispatch]);

  return (
    <>
      <div className="flex justify-start items-center flex-col gap-4 w-full">
        {/* page header */}
        <div className="flex justify-between w-full items-center border-b-2 py-4">
          <div className="flex justify-center items-center">
            <h1 className="text-2xl font-bold">Designation Master</h1>
          </div>
        </div>

        {/* filters */}
        <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
          <Card className="w-full flex justify-center items-center flex-col">
            {/* filter card header */}
            <div className="w-full flex flex-wrap justify-center items-center gap-2">
              <Badge color="warning">
                Total Count : {designations?.length}{" "}
              </Badge>
              <Badge color="warning">
                Filtered Count : {filteredDesignations?.length}
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
                  <Table.HeadCell>Designation Code</Table.HeadCell>
                  <Table.HeadCell>Designation Name</Table.HeadCell>
                  <Table.HeadCell>Parent Designation</Table.HeadCell>
                  <Table.HeadCell>Status</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {filteredDesignations.map((designation, index) => (
                    <Table.Row
                      key={index}
                      className="text-center bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        <UniqueCode
                          text={designation?.code}
                          codeName="Designation"
                        />
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {designation.name}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        {designation.parent_desg?.name}
                      </Table.Cell>
                      <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                        <StatusIndicator status={designation.status} />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DesignationView;
