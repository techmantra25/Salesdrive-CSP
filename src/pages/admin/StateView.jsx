import { Badge, Button, Card, Label, Select, Spinner, Table } from "flowbite-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchStates } from "../../redux/stateSlice";
import { fetchZones } from "../../redux/zoneSlice";
import StatusIndicator from "../../assets/common/StatusIndicator";
import UniqueCode from "../../assets/common/UniqueCode";
import { RiRefreshFill } from "react-icons/ri";

const StateView = () => {
  const dispatch = useDispatch();
  const { states, loading: statesLoading } = useSelector((state) => state.state);
  const { zones, loading: zonesLoading } = useSelector((state) => state.zone);

  let filteredStates = [...states];
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [selectedZone, setSelectedZone] = useState("default");

  if (selectedStatus !== "default") {
    filteredStates = filteredStates.filter(
      (state) => state.status === (selectedStatus === "active")
    );
  }

  if (selectedZone !== "default") {
    filteredStates = filteredStates.filter(
      (state) => state.zoneId && state.zoneId._id === selectedZone
    );
  }

  // sort alphabetically by name
  filteredStates.sort((a, b) => a.name.localeCompare(b.name));

  const handleResetFilter = () => {
    setSelectedStatus("active");
    setSelectedZone("default");
    dispatch(fetchStates());
  };

  useEffect(() => {
    dispatch(fetchStates());
    dispatch(fetchZones());
  }, [dispatch]);

  return (
    <div className="flex justify-start items-center flex-col gap-4 w-full">
      {/* page header */}
      <div className="flex justify-between w-full items-center border-b-2 py-4">
        <h1 className="text-2xl font-bold">State Master</h1>
      </div>

      {/* filters */}
      <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
        <Card className="w-full flex justify-center items-center flex-col">
          {/* filter counts */}
          <div className="w-full flex flex-wrap justify-center items-center gap-2">
            <Badge color="warning">Total Count : {states?.length}</Badge>
            <Badge color="warning">
              Filtered Count : {filteredStates?.length}
            </Badge>
          </div>

          {/* filters */}
          <div className="flex justify-center w-full items-center gap-4 flex-wrap">
            {/* Status Filter */}
            <div className="w-56">
              <Label htmlFor="statusSelect" value="Select Status" />
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                id="statusSelect"
              >
                <option value="default">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
            {/* Zone Filter */}
            <div className="w-56">
              <Label htmlFor="zoneSelect" value="Select Zone" />
              <Select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                id="zoneSelect"
              >
                <option value="default">All</option>
                {zones.map((zone) => (
                  <option key={zone._id} value={zone._id}>
                    {zone.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Reset */}
          <div className="flex justify-center w-full items-center gap-2 flex-wrap mt-3">
            <Button className="text-xs" size="sm" color="success" onClick={handleResetFilter}>
              <span className="flex justify-center items-center gap-2">
                <RiRefreshFill size={20} /> Reset & Refresh
              </span>
            </Button>
          </div>
        </Card>
      </div>

      {/* table */}
      <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
        {statesLoading || zonesLoading ? (
          <div className="w-full flex justify-center items-center" role="status">
            <Spinner aria-label="Loading states" size="xl" />
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <Table striped>
              <Table.Head className="text-center">
                <Table.HeadCell>State Code</Table.HeadCell>
                <Table.HeadCell>State Name</Table.HeadCell>
                <Table.HeadCell>State GST Code</Table.HeadCell>
                <Table.HeadCell>Zone Code</Table.HeadCell>
                <Table.HeadCell>Zone Name</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {filteredStates.map((state, index) => (
                  <Table.Row key={index} className="text-center bg-white dark:bg-gray-800">
                    <Table.Cell>
                      <UniqueCode text={state?.slug} codeName="State code" />
                    </Table.Cell>
                    <Table.Cell>{state.name}</Table.Cell>
                    <Table.Cell>
                      <UniqueCode text={state?.code} codeName="GST code" />
                    </Table.Cell>
                    <Table.Cell>
                      <UniqueCode text={state?.zoneId?.code} codeName="Zone Code" />
                    </Table.Cell>
                    <Table.Cell>{state?.zoneId?.name}</Table.Cell>
                    <Table.Cell>
                      {/* read-only status */}
                      <StatusIndicator status={state.status} />
                    </Table.Cell>
                  </Table.Row>
                ))}
                {filteredStates.length === 0 && (
                  <Table.Row className="text-center bg-white dark:bg-gray-800">
                    <Table.Cell colSpan={100}>No data found</Table.Cell>
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

export default StateView;