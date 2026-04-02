import { Badge, Button, Card, Label, Select, Spinner, Table } from "flowbite-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRegions } from "../../redux/regionSlice";
import { fetchZones } from "../../redux/zoneSlice";
import { fetchStates } from "../../redux/stateSlice";
import StatusIndicator from "../../assets/common/StatusIndicator";
import UniqueCode from "../../assets/common/UniqueCode";
import { RiRefreshFill } from "react-icons/ri";

const RegionView = () => {
  const dispatch = useDispatch();
  const { regions, loading: regionsLoading } = useSelector((state) => state.region);
  const { states, loading: statesLoading } = useSelector((state) => state.state);
  const { zones, loading: zonesLoading } = useSelector((state) => state.zone);

  let filteredRegions = [...regions];
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [selectedState, setSelectedState] = useState("default");

  if (selectedStatus !== "default") {
    filteredRegions = filteredRegions.filter(
      (region) => region.status === (selectedStatus === "active")
    );
  }

  if (selectedState !== "default") {
    filteredRegions = filteredRegions.filter(
      (region) => region.stateId?._id === selectedState
    );
  }

  const handleResetFilter = () => {
    setSelectedStatus("active");
    setSelectedState("default");
    dispatch(fetchRegions());
  };

  useEffect(() => {
    dispatch(fetchRegions());
    dispatch(fetchZones());
    dispatch(fetchStates());
  }, [dispatch]);

  return (
    <div className="flex justify-start items-center flex-col gap-4 w-full">
      {/* page header */}
      <div className="flex justify-between w-full items-center border-b-2 py-4">
        <h1 className="text-2xl font-bold">Region Master</h1>
      </div>

      {/* filters */}
      <div className="flex justify-start items-center flex-col gap-4 w-full p-4">
        <Card className="w-full flex justify-center items-center flex-col">
          {/* filter counts */}
          <div className="w-full flex flex-wrap justify-center items-center gap-2">
            <Badge color="warning">Total Count : {regions?.length}</Badge>
            <Badge color="warning">Filtered Count : {filteredRegions?.length}</Badge>
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
            {/* State Filter */}
            <div className="w-56">
              <Label htmlFor="stateSelect" value="Select State" />
              <Select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                id="stateSelect"
              >
                <option value="default">All</option>
                {states.map((state) => (
                  <option key={state._id} value={state._id}>
                    {state.name}
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
        {regionsLoading || zonesLoading || statesLoading ? (
          <div className="w-full flex justify-center items-center" role="status">
            <Spinner aria-label="Loading regions" size="xl" />
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <Table striped>
              <Table.Head className="text-center">
                <Table.HeadCell>Region Code</Table.HeadCell>
                <Table.HeadCell>Region Name</Table.HeadCell>
                <Table.HeadCell>State Code</Table.HeadCell>
                <Table.HeadCell>State Name</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
              </Table.Head>
              <Table.Body>
                {filteredRegions.map((region, index) => (
                  <Table.Row key={index} className="text-center bg-white dark:bg-gray-800">
                    <Table.Cell>
                      <UniqueCode text={region?.code} codeName="Region" />
                    </Table.Cell>
                    <Table.Cell>{region.name}</Table.Cell>
                    <Table.Cell>
                      <UniqueCode text={region?.stateId?.slug} codeName="State" />
                    </Table.Cell>
                    <Table.Cell>{region?.stateId?.name}</Table.Cell>
                    <Table.Cell>
                      {/* read-only status */}
                      <StatusIndicator status={region.status} />
                    </Table.Cell>
                  </Table.Row>
                ))}
                {filteredRegions.length === 0 && (
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

export default RegionView;