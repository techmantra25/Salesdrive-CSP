import { TextInput, Button, Label, Select, Spinner } from "flowbite-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchZones } from "../../../redux/zoneSlice";
import { fetchRegions } from "../../../redux/regionSlice";
import { fetchStates } from "../../../redux/stateSlice";
import {
  getDistributorsBeats,
  getEmployeeList,
  getRegionBeats,
} from "../../../api/api";
import { fetchDistributors } from "../../../redux/distributorListSlice";
import moment from "moment";
import toast from "react-hot-toast";

const StepOne = ({ formData, setFormData, nextStep }) => {
  const dispatch = useDispatch();

  const { zones, loading: zonesLoading } = useSelector((state) => state.zone);
  const activeZones = [...zones].filter((zone) => zone.status === true);

  const { regions, loading: regionsLoading } = useSelector(
    (state) => state.region
  );
  const activeRegions = [...regions].filter((region) => region.status === true);

  const { states, loading: statesLoading } = useSelector(
    (state) => state.state
  );
  const activeStates = [...states].filter((state) => state.status === true);

  console.log(activeStates,'activeStates');
  console.log(formData,'formData?.employeeId?.regionId?.stateId');

  const [beats, setBeats] = useState([]);

  const activeBeats = [...beats].filter((beat) => beat.status === true) || [];
  const [beatsLoading, setBeatsLoading] = useState(false);

  const { distributors, loading: distributorsLoading } = useSelector(
    (state) => state.distributors
  );

  let filterDistributors = distributors.filter((distributor) => {
    return distributor?.status === true;
  });

  const [distributorsBeats, setDistributorsBeats] = useState([]);
  const [distributorsBeatsLoading, setDistributorsBeatsLoading] =
    useState(false);

  const [employeeList, setEmployeeList] = useState([]);

  const [managers, setManagers] = useState([]);

  const handleChange = (e) => {
    console.log(e.target.value, "e.target.value");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function getDistributorsBeatsList(id, isMount) {
    try {
      setDistributorsBeatsLoading(true);
      const res = await getDistributorsBeats(id);
      if (isMount) {
        setDistributorsBeats(res?.data?.data);
      }
    } catch (error) {
      if (isMount) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to fetch outlet details"
        );
      }
    } finally {
      setDistributorsBeatsLoading(false);
    }
  }

  const fetchEmployee = async (isMounted) => {
    let payload = {
      limit: 100,
    };
    try {
      const response = await getEmployeeList(payload);
      if (isMounted) {
        setEmployeeList(response?.data?.data);
      }
    } catch (error) {
      if (isMounted) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to fetch employee list"
        );
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    fetchEmployee(isMounted);

    return () => {
      isMounted = false;
    };
  }, [formData?.employeeId]);

  useEffect(() => {
    let isMounted = true;

    if (formData?.distributorId?._id || formData?.distributorId) {
      getDistributorsBeatsList(
        formData?.distributorId?._id || formData?.distributorId,
        isMounted
      );
    }

    return () => {
      isMounted = false;
    };
  }, [formData?.distributorId]);

  console.log(formData?.distributorId, "formData");

  useEffect(() => {
    dispatch(fetchZones());
    dispatch(fetchRegions());
    dispatch(fetchStates());
    dispatch(fetchDistributors());
  }, [dispatch]);

  const findReportingManagers = (employeeId) => {
    if (managers.length > 0) {
      return;
    }
    let employee = employeeList.find((emp) => emp?._id == employeeId);
    if (employee && employee.reporting_manager) {
      const manager = employeeList.find(
        (emp) => emp._id === employee.reporting_manager?._id
      );

      if (manager) {
        const managerDetails = {
          id: manager._id,
          name: manager.name,
          designation: manager.desgId?.name,
        };

        setManagers((prev) => [...prev, managerDetails]);
        findReportingManagers(manager._id);
      }
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-4 w-full max-w-4/5">
        {(zonesLoading || regionsLoading || statesLoading || beatsLoading) && (
          <div className="w-full flex justify-center items-center">
            <Spinner aria-label="Default status example" size="xl" />
          </div>
        )}
        {!zonesLoading && !regionsLoading && !statesLoading && (
          <>
            <div className="flex-1 min-w-[500px]">
              <Label htmlFor="leadId" value="Lead ID" />
              <TextInput
                id="leadId"
                name="leadId"
                placeholder="Enter Lead ID"
                value={formData?.leadId}
                readOnly
              />
            </div>
            <div className="max-w-[500px] flex-1 min-w-[500px]">
              <Label htmlFor="zone" value="Zone" />
              <div className="flex-1 min-w-[500px]">
                <Select
                  id="zone"
                  name="zone"
                  value={formData?.employeeId?.zoneId?._id}
                  onChange={handleChange}
                  required
                  readOnly
                  className="flex-1 min-w-[500px]"
                >
                  <option value="default">Select Zone</option>
                  {activeZones.map((zone) => (
                    <option key={zone._id} value={zone._id}>
                      {zone.name} ({zone.code})
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="flex-1 min-w-[500px]">
              <Label htmlFor="state">State</Label>
              <Select
                id="state"
                name="state"
                value={formData?.employeeId?.regionId?.stateId?._id}
                onChange={handleChange}
                required
                readOnly
                className="flex-1 min-w-[500px]"
              >
                <option value="default">Select State</option>
                {activeStates
                  .filter(
                    (state) =>
                      state.zoneId._id === formData?.employeeId?.zoneId?._id
                  )
                  .map((state) => (
                    <option key={state._id} value={state._id}>
                      {state.name} ({state.code})
                    </option>
                  ))}
              </Select>
            </div>

            <div className="flex-1 min-w-[500px]">
              <Label htmlFor="region">Region</Label>
              <div className="flex-1 min-w-[500px]">
                <Select
                  id="region"
                  name="region"
                  value={formData?.employeeId?.regionId?._id}
                  onChange={handleChange}
                  required
                  readOnly
                >
                  <option value="default">Select Region</option>
                  {activeRegions
                    .filter(
                      (region) =>
                        region.stateId._id ===
                        formData?.employeeId?.regionId?.stateId?._id
                    )
                    .map((region) => (
                      <option key={region._id} value={region._id}>
                        {region.name} ({region.code})
                      </option>
                    ))}
                </Select>
              </div>
            </div>

            <div className="flex-1 min-w-[500px]">
              <Label htmlFor="userCode" value="User Code" />
              <TextInput
                id="userCode"
                name="userCode"
                placeholder="Enter User Code"
                value={formData?.employeeId?.empId}
                readOnly
              />
            </div>

            <div className="flex-1 min-w-[500px]">
              <Label htmlFor="userName" value="User Name" />
              <TextInput
                id="userName"
                name="userName"
                placeholder="Enter UserName"
                value={formData?.employeeId?.name}
                readOnly
              />
            </div>

            <div className="flex-1 min-w-[500px]">
              <Label htmlFor="dbCode" value="DB Code" />
              <TextInput
                id="dbCode"
                name="dbCode"
                placeholder="Enter DB Code"
                value={formData?.distributorId?.dbCode}
                readOnly
              />
            </div>

            <div className="flex-1 min-w-[500px]">
              <Label htmlFor="dbName" value="DB Name" />
              <TextInput
                id="dbName"
                name="dbName"
                placeholder="Enter DB Name"
                value={formData?.distributorId?.name}
                readOnly
              />
            </div>

            <div className="flex-1 min-w-[500px]">
              <Label htmlFor="distributorId" value="Selected Distributor" />
              <div className="flex-1 min-w-[500px]">
                <Select
                  id="distributorId"
                  name="distributorId"
                  value={
                    formData?.distributorId?._id || formData?.distributorId
                  }
                  onChange={handleChange}
                  required
                  readOnly
                >
                  <option value="default">Select Distributor</option>
                  {filterDistributors.map((distributor) => (
                    <option key={distributor._id} value={distributor?._id}>
                      {distributor.name} ({distributor.dbCode})
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {formData?.OutletStatus === "Approved" ? (
              <>
                <div className="flex-1 min-w-[500px]">
                  <Label htmlFor="beatName" value="Beat Name" />
                  <TextInput
                    id="beatName"
                    name="beatName"
                    placeholder="Enter Beat Name"
                    value={formData?.beatId?.name}
                    readOnly
                  />
                </div>
                <div className="flex-1 min-w-[500px]">
                  <Label htmlFor="beatCode" value="Beat Code" />
                  <TextInput
                    id="beatCode"
                    name="beatCode"
                    placeholder="Enter Beat Code"
                    value={formData?.beatId?.code}
                    readOnly
                  />
                </div>
              </>
            ) : (
              <>
                {distributorsBeatsLoading && (
                  <div className="flex-1 min-w-[500px]">
                    [ Loading Beats ... ]
                  </div>
                )}
                {!distributorsBeatsLoading &&
                  distributorsBeats?.length === 0 && (
                    <div className="flex-1 min-w-[500px]">
                      [ No Beats found for this region ]
                    </div>
                  )}
                {!distributorsBeatsLoading && distributorsBeats?.length > 0 && (
                  <div className="flex-1 min-w-[500px]">
                    <Label htmlFor="beat" value="Beat" />
                    <div className="flex-1 min-w-[500px]">
                      <Select
                        id="beatID"
                        name="beatID"
                        value={formData?.beatId}
                        onChange={(e) =>
                          setFormData({ ...formData, beatId: e.target.value })
                        }
                        required
                        className="flex-1 min-w-[500px]"
                      >
                        <option value="default">Select Beats</option>
                        {!distributorsBeatsLoading &&
                          distributorsBeats?.map((beat) => (
                            <option key={beat._id} value={beat._id}>
                              {beat.name} ({beat.code})
                            </option>
                          ))}
                      </Select>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex-1 min-w-[500px] flex justify-center items-end">
              <Button
                pill
                color="dark"
                size="sm"
                onClick={() => findReportingManagers(formData?.employeeId?._id)}
              >
                Reporting Managers
              </Button>
            </div>

            {managers.length > 0 &&
              managers.map((manager) => (
                <div key={manager?._id} className="flex-1 min-w-[500px]">
                  <Label
                    htmlFor="managers"
                    value={`Reporting - ${manager?.designation}`}
                  />
                  <TextInput
                    id="managers"
                    name="managers"
                    placeholder="Enter Managers"
                    value={manager?.name}
                    readOnly
                  />
                </div>
              ))}

            <div className="flex-1 min-w-[500px]">
              <Label htmlFor="leadRecordedDate" value="Lead Recorded Date" />
              <TextInput
                id="leadRecordedDate"
                name="leadRecordedDate"
                placeholder="Enter Lead Recorded Date"
                value={moment(formData?.createdAt).format("DD-MM-YYYY")}
                readOnly
              />
            </div>

            <div className="flex-1 min-w-[500px]">
              <Label htmlFor="leadModifiedDate" value="Lead Modified Date" />
              <TextInput
                id="leadModifiedDate"
                name="leadModifiedDate"
                placeholder="Enter Lead Modified Date"
                value={moment(formData?.updatedAt).format("DD-MM-YYYY")}
                readOnly
              />
            </div>
          </>
        )}
      </div>
      <div className="flex justify-center items-center mt-4">
        <Button className="w-24" onClick={nextStep}>
          Next
        </Button>
      </div>
    </>
  );
};

export default StepOne;
