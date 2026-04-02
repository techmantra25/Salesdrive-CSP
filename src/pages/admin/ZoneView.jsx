import { Badge, Card, Label, Select, Spinner, Table, Button } from "flowbite-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchZones } from "../../redux/zoneSlice";
import StatusIndicator from "../../assets/common/StatusIndicator";
import UniqueCode from "../../assets/common/UniqueCode";
import { RiRefreshFill } from "react-icons/ri";

const ZoneView = () => {
  const dispatch = useDispatch();
  const { zones, loading } = useSelector((state) => state.zone);
  const [selectedStatus, setSelectedStatus] = useState("active");

  // filter logic
  let filteredZones = [...zones];
  if (selectedStatus !== "default") {
    filteredZones = filteredZones.filter(
      (zone) => zone.status === (selectedStatus === "active")
    );
  }

  const handleResetFilter = () => {
    setSelectedStatus("active");
    dispatch(fetchZones());
  };

  useEffect(() => {
    dispatch(fetchZones());
  }, [dispatch]);

  return (
    <div className="flex justify-start items-center flex-col gap-4 w-full">
      {/* page header */}
      <div className="flex justify-between w-full items-center border-b-2 py-4">
        <h1 className="text-2xl font-bold">Zone Master</h1>
      </div>

      {/* filters */}
      <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
        <Card className="w-full flex justify-center items-center flex-col">
          {/* filter card header */}
          <div className="w-full flex flex-wrap justify-center items-center gap-2">
            <Badge color="warning">Total Count : {zones?.length}</Badge>
            <Badge color="warning">
              Filtered Count : {filteredZones?.length}
            </Badge>
          </div>

          {/* filter options */}
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
          </div>

          {/* Reset Button Only */}
          <div className="flex justify-center w-full items-center gap-2 flex-wrap mt-3">
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
          <div className="w-full flex justify-center items-center" role="status">
            <Spinner aria-label="Loading zones" size="xl" />
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <Table striped>
              <Table.Head className="text-center">
                <Table.HeadCell>Zone Code</Table.HeadCell>
                <Table.HeadCell>Zone Name</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {filteredZones.map((zone, index) => (
                  <Table.Row
                    key={index}
                    className="text-center bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                      <UniqueCode text={zone?.code} codeName="Zone" />
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-gray-200">
                      {zone.name}
                    </Table.Cell>
                    <Table.Cell className="whitespace-nowrap font-medium">
                      {/* ✅ status without click */}
                      <StatusIndicator status={zone.status} />
                    </Table.Cell>
                  </Table.Row>
                ))}
                {filteredZones.length === 0 && (
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
  );
};

export default ZoneView;